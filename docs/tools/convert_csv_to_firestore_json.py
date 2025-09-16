"""
Usage:
  python3 docs/tools/convert_csv_to_firestore_json.py \
    /Users/birukeyesus/terraform_practice/aaac-system/aaac-membership-system/versions/v1.0-stable/docs/data/AAAC_Real_Data.csv \
    > members_export.json

Converts AAAC CSV to Firestore-ready JSON with:
- payments: { "YYYY-MM": amount }
- isActive: false only if last payment is 36+ months before Sep 2025; otherwise true
- startDate: first paid month or First_Payment_Year or 2020-01-01
"""

import csv
import json
import sys

MONTHS = {
    "JAN": "01", "FEB": "02", "MAR": "03", "APR": "04", "MAY": "05", "JUN": "06",
    "JUL": "07", "AUG": "08", "SEP": "09", "OCT": "10", "NOV": "11", "DEC": "12",
}

CURRENT_KEY = "2025-09"  # September 2025


def to_month_key(header: str):
    # 2025_JAN -> 2025-01
    try:
        year, mon = header.split("_")
        if len(year) == 4 and mon in MONTHS:
            return f"{year}-{MONTHS[mon]}"
    except Exception:
        pass
    return None


def months_between(from_key: str, to_key: str) -> int:
    fy, fm = map(int, from_key.split("-"))
    ty, tm = map(int, to_key.split("-"))
    return (ty - fy) * 12 + (tm - fm)


def detect_start_date(first_payment_year: str, payments_map: dict) -> str:
    first_paid_key = None
    for k in sorted(payments_map.keys()):
        if float(payments_map[k]) > 0:
            first_paid_key = k
            break
    if first_paid_key:
        return f"{first_paid_key}-01"
    if first_payment_year and str(first_payment_year).strip():
        return f"{first_payment_year}-01-01"
    return "2020-01-01"


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 convert_csv_to_firestore_json.py <path-to-csv>", file=sys.stderr)
        sys.exit(1)

    input_path = sys.argv[1]
    with open(input_path, newline="", encoding="utf-8") as f:
        reader = csv.reader(f)
        rows = list(reader)

    if not rows:
        print("[]")
        return

    headers = rows[0]
    month_cols = [(idx, to_month_key(h)) for idx, h in enumerate(headers)]
    month_cols = [(idx, key) for idx, key in month_cols if key]

    def H(name):
        try:
            return headers.index(name)
        except ValueError:
            return -1

    out = []
    for cols in rows[1:]:
        if not cols:
            continue
        member_id = (cols[H("Member_ID")] or "").strip() if H("Member_ID") != -1 else ""
        full_name = (cols[H("Name")] or "").strip() if H("Name") != -1 else ""
        if not member_id and not full_name:
            continue

        payments = {}
        total_paid = 0.0
        for idx, key in month_cols:
            val_raw = cols[idx] if idx < len(cols) else ""
            try:
                amount = float(val_raw) if val_raw.strip() else 0.0
            except Exception:
                amount = 0.0
            if amount > 0:
                payments[key] = payments.get(key, 0.0) + amount
                total_paid += amount

        first_payment_year = cols[H("First_Payment_Year")] if H("First_Payment_Year") != -1 else ""
        start_date = detect_start_date(first_payment_year, payments)

        last_paid_key = None
        for k in sorted(payments.keys()):
            if float(payments[k]) > 0:
                last_paid_key = k
        if last_paid_key:
            diff = months_between(last_paid_key, CURRENT_KEY)
            is_active = diff < 36
        else:
            is_active = False

        out.append({
            "memberId": str(member_id or full_name).strip(),
            "fullName": full_name,
            "isActive": is_active,
            "startDate": start_date,
            "payments": payments,
        })

    print(json.dumps(out, indent=2))


if __name__ == "__main__":
    main()



