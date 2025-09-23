#!/usr/bin/env python3
import json
import sys

def main(inp):
    with open(inp, 'r', encoding='utf-8') as f:
        data = json.load(f)
    missing = []
    seen = set()
    for m in data:
        mid = m.get('memberId') or m.get('id')
        phone = (m.get('phone') or m.get('phoneNumber') or '').strip()
        try:
            n = int(str(mid))
        except Exception:
            continue
        if 1 <= n <= 101:
            if n in seen:
                continue
            seen.add(n)
            if not phone:
                name = (m.get('fullName') or m.get('name') or '').strip()
                missing.append((n, name))
    missing.sort(key=lambda x: x[0])
    print('Missing phones count:', len(missing))
    for mid, name in missing:
        print(f'{mid},{name}')

if __name__ == '__main__':
    inp = sys.argv[1] if len(sys.argv) > 1 else './docs/cleaned_members_with_phones.json'
    main(inp)



