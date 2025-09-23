#!/usr/bin/env python3
"""
Process AAAC payments from a multi-sheet Excel (2019-2026) into:
- docs/normalized_payments.csv (memberId, fullName, yyyy-mm, amount, type)
- docs/cleaned_members_final.json (financials per FINANCIAL_CALCULATION_GUIDE.md)

Source: docs/AAAIC_Book.xlsx

Rules:
- Dues are $15/month; allocate oldest-first with $15/month cap
- Registration fees ($100/$200) are tracked separately (not counted toward dues)
- Incidentals are tracked separately (not counted toward dues)
- startAt = first month with a dues payment (>= $15)
- totalOwed = 15 * months from startAt to NOW (inclusive)
- paidTowardOwed = dollars allocated to owed months (cap 15 per month)
- futureCredit = dues dollars for months > NOW
- balance = (paidTowardOwed + futureCredit) - totalOwed
- monthsCovered = floor(paidTowardOwed / 15)
- monthsBehind = max(0, owedMonths - monthsCovered)
- paidUpTo = startAt + (monthsCovered - 1)
- isActive = any payment in last 36 months
- status: ahead/current/behind/issue/risk/inactive per guide
- ignored = monthsBehind > 36
"""

import pandas as pd
import json
import re
from datetime import date
from pathlib import Path

NOW = date(2025, 9, 1)
DUES = 15.0
REG_FEES = {100.0, 200.0}
INACTIVE_MONTHS = 36

SRC_XLSX = \
    "/Users/birukeyesus/Downloads/AAAIC_Book-2.xlsx"
OUT_CSV = \
    "/Users/birukeyesus/terraform_practice/aaac-system/docs/normalized_payments.csv"
OUT_JSON = \
    "/Users/birukeyesus/terraform_practice/aaac-system/docs/cleaned_members_final.json"

# Include rich set of month header aliases commonly found in spreadsheets
MONTH_LABELS = [
    ("JAN", "01"), ("JANUARY", "01"),
    ("FEB", "02"), ("FEBRUARY", "02"),
    ("MAR", "03"), ("MARCH", "03"),
    ("APR", "04"), ("APRIL", "04"),
    ("MAY", "05"),
    ("JUN", "06"), ("JUNE", "06"),
    ("JUL", "07"), ("JULY", "07"),
    ("AUG", "08"), ("AUGUST", "08"),
    ("SEP", "09"), ("SEPT", "09"), ("SEPTEMBER", "09"),
    ("OCT", "10"), ("OCTOBER", "10"),
    ("NOV", "11"), ("NOVEMBER", "11"),
    ("DEC", "12"), ("DECEMBER", "12"),
]

def normalize_name(first: str, middle: str, last: str) -> str:
    parts = []
    for p in [first, middle, last]:
        if pd.notna(p) and str(p).strip():
            parts.append(str(p).strip().upper())
    return " ".join(parts)

def to_month_key(year: int, month_num: int) -> str:
    return f"{year}-{month_num:02d}"

def month_iter(start_year: int, start_month: int, end_year: int, end_month: int):
    y, m = start_year, start_month
    while (y < end_year) or (y == end_year and m <= end_month):
        yield y, m
        if m == 12:
            y, m = y + 1, 1
        else:
            m += 1

def months_between(a_y: int, a_m: int, b_y: int, b_m: int) -> int:
    return (b_y - a_y) * 12 + (b_m - a_m)

def detect_columns(df: pd.DataFrame):
    cols_upper = {c: str(c).strip().upper() for c in df.columns}
    id_col = None
    first_col = None
    middle_col = None
    last_col = None
    reg_col = None
    month_cols = []  # list of tuples: (orig_col, mode, value)

    for orig, up in cols_upper.items():
        if id_col is None and (up.startswith("NUMBER") or up == "ID" or up == "MEMBER_ID" or up == "UNNAMED: 0"):
            id_col = orig
        if first_col is None and ("FIRST" in up):
            first_col = orig
        if middle_col is None and ("MIDDLE" in up):
            middle_col = orig
        if last_col is None and ("LAST" in up or up == "NAME" or "SURNAME" in up):
            last_col = orig
        if reg_col is None and ("REGIST" in up or "REGISTRATION" in up or up == "REGISTRATION FEE"):
            reg_col = orig

    # month columns - support both named months and explicit YYYY-MM headers
    for orig, up in cols_upper.items():
        # Numeric form: 2025-06 or 2025/06
        m = re.search(r"\b(20\d{2})[-/](0[1-9]|1[0-2])\b", up)
        if m:
            yyyy, mm = m.group(1), m.group(2)
            month_cols.append((orig, "key", f"{yyyy}-{mm}"))
            continue
        # Named month aliases
        for label, mm in MONTH_LABELS:
            if label in up:
                month_cols.append((orig, "label", label))
                break

    return id_col, first_col, middle_col, last_col, reg_col, month_cols

def normalize_payments() -> pd.DataFrame:
    xl = pd.ExcelFile(SRC_XLSX)
    records = []
    for sheet in xl.sheet_names:
        if not re.fullmatch(r"\d{4}", sheet):
            continue
        year = int(sheet)
        df = xl.parse(sheet)
        if df.empty:
            continue
        id_col, first_col, middle_col, last_col, reg_col, month_cols = detect_columns(df)
        for _, row in df.iterrows():
            member_id = None
            if id_col is not None and pd.notna(row.get(id_col)):
                try:
                    member_id = str(int(float(row[id_col])))
                except Exception:
                    member_id = str(row[id_col]).strip()
            first = row.get(first_col, "") if first_col else ""
            middle = row.get(middle_col, "") if middle_col else ""
            last = row.get(last_col, "") if last_col else ""
            full_name = normalize_name(first, middle, last)
            if (member_id is None or member_id == "nan") and not full_name:
                continue

            # Registration per year (once)
            if reg_col and pd.notna(row.get(reg_col)):
                try:
                    amt = float(row[reg_col])
                    if amt in REG_FEES:
                        records.append({
                            "memberId": member_id or "",
                            "fullName": full_name,
                            "month": f"{year}-01",
                            "amount": amt,
                            "type": "registration",
                        })
                except Exception:
                    pass

            # Monthly dues per month column
            for item in month_cols:
                orig = item[0]
                if pd.isna(row.get(orig)):
                    continue
                try:
                    amt = float(row[orig])
                except Exception:
                    continue
                if amt <= 0:
                    continue
                mode = item[1]
                if mode == "key":
                    month_key = item[2]
                else:
                    label = item[2]
                    mm = next((mm for lab, mm in MONTH_LABELS if lab == label), None)
                    if not mm:
                        continue
                    month_key = f"{year}-{mm}"
                records.append({
                    "memberId": member_id or "",
                    "fullName": full_name,
                    "month": month_key,
                    "amount": amt,
                    "type": "dues",
                })

    norm = pd.DataFrame.from_records(records)
    norm = norm.sort_values(["memberId", "month", "type"]).reset_index(drop=True)
    return norm

def compute_financials(norm: pd.DataFrame) -> dict:
    members = []
    totals_sum_owed = 0.0
    totals_ignored = []

    if norm.empty:
        return {"members": [], "totals": {"sumBalancesIncluded": 0.0, "ignoredMembers": [], "now": str(NOW)}}

    for member_id, grp in norm.groupby("memberId", dropna=False):
        full_name = grp["fullName"].dropna().iloc[0] if not grp["fullName"].dropna().empty else ""
        # Separate dues and registration
        dues = grp[grp["type"] == "dues"][["month", "amount"]]
        reg = grp[grp["type"] == "registration"]["amount"].tolist()

        # Build month->amount mapping for dues
        dues_map = {m: float(a) for m, a in dues.values}

        # Determine startAt as first month with any dues > 0 (safer for start)
        startAt = None
        for m in sorted(dues_map.keys()):
            if dues_map[m] > 0:
                startAt = m
                break

        if not startAt:
            # No dues => inactive and ignored
            members.append({
                "memberId": str(member_id or ""),
                "fullName": full_name,
                "phone": "",
                "isActive": False,
                "startDate": None,
                "paymentsDues": {},
                "registrationPayments": [{"amount": float(a), "date": f"{m}-01"} for a, m in []],
                "incidentalPayments": [],
                "totalOwed": 0,
                "paidTowardOwed": 0,
                "futureCredit": 0,
                "balance": 0,
                "monthsCovered": 0,
                "monthsBehind": 0,
                "paidUpTo": None,
                "status": "inactive",
                "ignored": True,
                "startAt": None,
            })
            continue

        # Owed window months from startAt to NOW inclusive
        sy, sm = map(int, startAt.split("-"))
        owed_months = [to_month_key(y, m) for y, m in month_iter(sy, sm, NOW.year, NOW.month)]
        totalOwed = DUES * len(owed_months)

        # Reallocate total dues dollars oldest-first across owed months, then future
        total_paid_all = sum(float(a) for a in dues_map.values())
        remaining = total_paid_all
        allocated_owed = {}
        for m in owed_months:
            if remaining <= 0:
                allocated_owed[m] = 0.0
                continue
            add = min(DUES, remaining)
            allocated_owed[m] = add
            remaining -= add

        # Allocate any remaining into future months sequentially
        allocated_future = {}
        fy, fm = NOW.year, NOW.month
        # start next month
        fm += 1
        if fm > 12:
            fm = 1
            fy += 1
        while remaining > 0:
            key = to_month_key(fy, fm)
            add = min(DUES, remaining)
            allocated_future[key] = add
            remaining -= add
            fm += 1
            if fm > 12:
                fm = 1
                fy += 1

        paidTowardOwed = min(total_paid_all, totalOwed)
        monthsCovered = int(paidTowardOwed // DUES)
        monthsBehind = max(0, len(owed_months) - monthsCovered)

        # paidUpTo is latest fully-paid month (>= DUES) across allocated owed+future
        paidUpTo = None
        if monthsCovered > 0:
            full_paid_keys = [k for k, v in allocated_owed.items() if v >= DUES]
            full_paid_keys += [k for k, v in allocated_future.items() if v >= DUES]
            if full_paid_keys:
                paidUpTo = max(full_paid_keys)

        # Activity: any payment in last 36 months
        isActive = False
        for m, amt in dues_map.items():
            y, mm = map(int, m.split("-"))
            diff = months_between(y, mm, NOW.year, NOW.month)
            if diff >= 0 and diff < INACTIVE_MONTHS and amt > 0:
                isActive = True
                break

        futureCredit = sum(allocated_future.values())
        balance = round((paidTowardOwed + futureCredit) - totalOwed, 2)

        # Status per guide (corrected thresholds)
        if not isActive:
            status = "inactive"
        elif balance > 0:
            status = "ahead"
        elif balance == 0 and monthsBehind == 0:
            status = "current"
        elif monthsBehind <= 2:
            status = "behind"
        elif monthsBehind <= 11:
            status = "issue"
        else:
            status = "risk"

        ignored = monthsBehind > 36

        # Emit payments as allocated map so gaps are filled
        paymentsDues = {k: float(v) for k, v in sorted({**allocated_owed, **allocated_future}.items())}
        reg_list = [{"amount": float(a), "date": f"{owed_months[0]}-01"} for a in reg] if reg else []

        member_obj = {
            "memberId": str(member_id or ""),
            "fullName": full_name,
            "phone": "",
            "isActive": isActive,
            "startDate": None,
            "paymentsDues": paymentsDues,
            "registrationPayments": reg_list,
            "incidentalPayments": [],
            "totalOwed": totalOwed,
            "paidTowardOwed": round(paidTowardOwed, 2),
            "futureCredit": round(futureCredit, 2),
            "balance": balance,
            "monthsCovered": monthsCovered,
            "monthsBehind": monthsBehind,
            "paidUpTo": paidUpTo,
            "status": status,
            "ignored": ignored,
            "startAt": startAt,
        }
        members.append(member_obj)

    # Sum of negative balances (owed) for non-ignored
    sumBalancesIncluded = 0.0
    ignoredMembers = []
    for m in members:
        if not m["ignored"] and m["balance"] < 0:
            sumBalancesIncluded += abs(m["balance"])
        if m["ignored"]:
            ignoredMembers.append({"memberId": m["memberId"], "fullName": m["fullName"], "reason": f"Months behind: {m['monthsBehind']}"})

    result = {
        "members": members,
        "totals": {
            "sumBalancesIncluded": round(sumBalancesIncluded, 2),
            "ignoredMembers": ignoredMembers,
            "now": str(NOW),
        },
    }
    return result

def main():
    print(f"Reading workbook: {SRC_XLSX}")
    norm = normalize_payments()
    out_dir = Path(OUT_CSV).parent
    out_dir.mkdir(parents=True, exist_ok=True)
    norm.to_csv(OUT_CSV, index=False)
    print(f"Wrote normalized CSV: {OUT_CSV} ({len(norm)} rows)")

    result = compute_financials(norm)
    with open(OUT_JSON, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2)
    print(f"Wrote JSON: {OUT_JSON} (members: {len(result['members'])})")

    # Show 5-sample
    print("\n=== SAMPLE (first 5) ===")
    for m in result["members"][:5]:
        print(json.dumps({k: m[k] for k in ["memberId","fullName","startAt","totalOwed","paidTowardOwed","futureCredit","balance","monthsBehind","paidUpTo","status","ignored"]}, indent=2))

if __name__ == "__main__":
    main()


