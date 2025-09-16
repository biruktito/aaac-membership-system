#!/usr/bin/env python3
"""
Build CSV (phone,memberId,displayName) from docs/cleaned_members_with_phones.json

Usage:
  python3 tools/build_phone_csv_from_json.py \
    --input /absolute/path/to/docs/cleaned_members_with_phones.json \
    --output /absolute/path/to/tools/members_from_json.csv
"""

import argparse
import csv
import json
import os
import re

def normalize_phone(raw: str) -> str:
    if not raw:
        return ''
    p = str(raw).strip()
    if p.startswith('+'):
        p = '+' + re.sub(r'\D+', '', p[1:])
    else:
        p = re.sub(r'\D+', '', p)
        if p:
            if len(p) == 10:
                p = '+1' + p
            elif not p.startswith('+'):
                p = '+' + p
    return p

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--input', required=True)
    ap.add_argument('--output', required=True)
    ap.add_argument('--set', action='append', default=[], help='Override phone in format memberId:phone (can repeat)')
    args = ap.parse_args()

    with open(args.input, 'r', encoding='utf-8') as f:
        data = json.load(f)
    if not isinstance(data, list):
        raise SystemExit('Input JSON must be an array')

    os.makedirs(os.path.dirname(args.output), exist_ok=True)
    # Build overrides map
    overrides = {}
    for item in args.set:
        try:
            mid_str, phone_raw = item.split(':', 1)
            mid_num = int(mid_str.strip())
            overrides[mid_num] = normalize_phone(phone_raw)
        except Exception:
            pass
    with open(args.output, 'w', newline='', encoding='utf-8') as f:
        w = csv.writer(f)
        w.writerow(['phone', 'memberId', 'displayName'])
        rows = 0
        for m in data:
            member_id = m.get('memberId') or m.get('id') or ''
            name = m.get('fullName') or m.get('name') or ''
            phone = normalize_phone(m.get('phone') or m.get('phoneNumber') or '')
            # filter: numeric memberId between 1..101 and phone present
            try:
                mid_num = int(str(member_id))
            except Exception:
                continue
            if mid_num < 1 or mid_num > 101:
                continue
            # apply override if provided
            if mid_num in overrides:
                phone = overrides[mid_num] or phone
            if not phone:
                continue
            w.writerow([phone, member_id, name.replace('\n', ' ').strip()])
            rows += 1
    print(f'Wrote {args.output} rows: {rows}')

if __name__ == '__main__':
    main()


