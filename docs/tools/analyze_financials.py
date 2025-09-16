import json
from datetime import datetime
from pathlib import Path

CURRENT = datetime(2025, 9, 1)
DUE = 15.0

def month_iter(start: datetime, end: datetime):
    y, m = start.year, start.month
    while (y < end.year) or (y == end.year and m <= end.month):
        yield y, m
        m += 1
        if m > 12:
            m = 1
            y += 1

def calc_member(member: dict, baseline_yyyy_mm: str | None = None):
    start_str = member.get('startDate') or '2020-01-01'
    try:
        start = datetime.strptime(start_str[:10], '%Y-%m-%d')
    except Exception:
        start = datetime(2020, 1, 1)

    # If baseline provided, override start to that baseline (e.g., '2022-01')
    if baseline_yyyy_mm:
        y, m = map(int, baseline_yyyy_mm.split('-'))
        start = datetime(y, m, 1)

    payments = member.get('paymentsDues') or member.get('payments') or {}
    total_paid = 0.0
    total_owed = 0.0
    months_behind = 0
    paid_up_to = None

    iter_start = datetime(start.year, start.month, 1)
    iter_end = datetime(CURRENT.year, CURRENT.month, 1)

    for y, m in month_iter(iter_start, iter_end):
        key = f"{y}-{m:02d}"
        paid = float(payments.get(key, 0) or 0)
        total_paid += paid
        total_owed += DUE
        if paid >= DUE:
            paid_up_to = (y, m)
        else:
            months_behind += 1

    balance = total_paid - total_owed
    return {
        'balance': balance,
        'monthsBehind': months_behind,
        'paidUpTo': paid_up_to,
        'totalPaid': total_paid,
        'totalOwed': total_owed,
    }

def has_payment_within_months(member: dict, months: int = 36) -> bool:
    payments = member.get('paymentsDues') or member.get('payments') or {}
    if not isinstance(payments, dict) or not payments:
        return False
    # compute threshold year-month
    years = months // 12
    months_extra = months % 12
    # threshold date is CURRENT minus (years, months_extra)
    ty = CURRENT.year - years
    tm = CURRENT.month - months_extra
    while tm <= 0:
        tm += 12
        ty -= 1
    threshold = (ty, tm)
    def ym_tuple(key: str):
        try:
            y, m = key.split('-')
            return int(y), int(m)
        except Exception:
            return (0, 0)
    for k, v in payments.items():
        if float(v or 0) <= 0:
            continue
        y, m = ym_tuple(k)
        if (y, m) >= threshold:
            return True
    return False

def find_member_by_name(data: list, q: str):
    ql = q.strip().lower()
    for m in data:
        if m.get('fullName', '').strip().lower() == ql:
            return m
    for m in data:
        if ql in m.get('fullName', '').lower():
            return m
    return None

def find_member_by_id(data: list, member_id: str):
    sid = str(member_id)
    for m in data:
        if str(m.get('memberId')) == sid:
            return m
    return None

def main():
    root = Path(__file__).resolve().parents[2]
    p = root / 'docs' / 'cleaned_members_final.json'
    data = json.loads(p.read_text())

    total_members = len(data)
    # Flag-based groups
    active_flag = [m for m in data if m.get('isActive') is True]
    inactive_flag = [m for m in data if m.get('isActive') is False]
    # Derived activity: any payment within last 36 months
    active_derived = [m for m in data if has_payment_within_months(m, 36)]
    inactive_derived = [m for m in data if not has_payment_within_months(m, 36)]

    owed_active_flag = 0.0
    for m in active_flag:
        f = calc_member(m)
        if f['balance'] < 0:
            owed_active_flag += -f['balance']

    owed_active_derived = 0.0
    for m in active_derived:
        f = calc_member(m)
        if f['balance'] < 0:
            owed_active_derived += -f['balance']

    # Recompute owed with baseline Jan 2022 to reflect dues since 2022 regardless of startDate
    owed_active_baseline_2022 = 0.0
    for m in active_derived:
        f = calc_member(m, baseline_yyyy_mm='2022-01')
        if f['balance'] < 0:
            owed_active_baseline_2022 += -f['balance']

    def report_member(name: str):
        m = find_member_by_name(data, name)
        if not m:
            return f"{name}: NOT FOUND"
        f = calc_member(m)
        return f"{name}: balance ${f['balance']:.2f} (monthsBehind {f['monthsBehind']})"

    print(f"Total members: {total_members}")
    print(f"Inactive members (flag): {len(inactive_flag)}")
    print(f"Inactive members (derived 36m): {len(inactive_derived)}")
    print(f"Total owed by active members (flag): ${owed_active_flag:.2f}")
    print(f"Total owed by active members (derived 36m): ${owed_active_derived:.2f}")
    print(f"Total owed by active members (derived 36m, baseline 2022-01): ${owed_active_baseline_2022:.2f}")
    print(report_member('Habtamu Bekuma Bekana'))
    print(report_member('HABTAMU BAKANA'))
    print(report_member('Biruk Eyesus'))
    print(report_member('Tilahun Gashaw'))

    # Specific requests
    target_by_id = find_member_by_id(data, '24')
    if target_by_id:
        f = calc_member(target_by_id)
        fb = calc_member(target_by_id, baseline_yyyy_mm='2022-01')
        print(f"MemberID 24 ({target_by_id.get('fullName')}): balance ${f['balance']:.2f} | since 2022 ${fb['balance']:.2f}")
    else:
        print("MemberID 24: NOT FOUND")

    target_by_name = find_member_by_name(data, 'THILAHUNE KETEMA')
    if target_by_name:
        f = calc_member(target_by_name)
        fb = calc_member(target_by_name, baseline_yyyy_mm='2022-01')
        print(f"THILAHUNE KETEMA: balance ${f['balance']:.2f} | since 2022 ${fb['balance']:.2f}")
    else:
        print("THILAHUNE KETEMA: NOT FOUND")

    # --- Scan for startDate vs earliest payment month discrepancies ---
    def earliest_payment_month(m: dict):
        payments = m.get('paymentsDues') or m.get('payments') or {}
        keys = []
        for k, v in payments.items():
            try:
                if float(v or 0) > 0:
                    y, mm = k.split('-')
                    keys.append((int(y), int(mm)))
            except Exception:
                continue
        if not keys:
            return None
        y, mm = min(keys)
        return f"{y}-{mm:02d}"

    mismatches = []
    for m in data:
        ep = earliest_payment_month(m)
        if not ep:
            continue
        sd = (m.get('startDate') or '')[:7]
        if sd and sd != ep:
            mismatches.append({
                'memberId': m.get('memberId'),
                'fullName': m.get('fullName'),
                'startDate': sd,
                'firstPayment': ep
            })

    print(f"StartDate vs first-payment mismatches: {len(mismatches)}")
    # Save a CSV for easy review
    out = root / 'docs' / 'tools' / 'startdate_mismatches.csv'
    with out.open('w') as fh:
        fh.write('memberId,fullName,startDate,firstPayment\n')
        for r in mismatches[:1000]:
            fh.write(f"{r['memberId']},{r['fullName']},{r['startDate']},{r['firstPayment']}\n")
    print(f"Wrote mismatch sample to {out}")

    # Produce a normalized JSON with startDate set to first payment month (YYYY-MM-01)
    normalized = []
    for m in data:
        nm = dict(m)
        ep = earliest_payment_month(m)
        if ep:
            nm['startDate'] = ep + '-01'
        normalized.append(nm)

    norm_path = root / 'docs' / 'cleaned_members_final_normalized.json'
    norm_path.write_text(json.dumps(normalized, indent=2))
    print(f"Wrote normalized dataset to {norm_path}")

    # Recompute totals on normalized data (derived 36m and baseline earliest-month which is startDate now)
    active_norm = [m for m in normalized if has_payment_within_months(m, 36)]
    owed_active_norm = 0.0
    member_owed = []
    for m in active_norm:
        f = calc_member(m)
        if f['balance'] < 0:
            amt = -f['balance']
            owed_active_norm += amt
            member_owed.append((amt, m.get('fullName'), m.get('memberId')))
    avg = owed_active_norm / max(1, len(active_norm))
    print(f"Active (normalized): {len(active_norm)} | Total owed: ${owed_active_norm:.2f} | Avg per active: ${avg:.2f}")
    member_owed.sort(reverse=True)
    top = member_owed[:10]
    if top:
        print("Top owed (name, memberId, amount):")
        for amt, name, mid in top:
            print(f"  {name} ({mid}): ${amt:.2f}")

if __name__ == '__main__':
    main()


