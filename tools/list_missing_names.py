import json
from pathlib import Path

base = Path('/Users/birukeyesus/terraform_practice/aaac-system')
src_path = base / 'docs/cleaned_members_final_normalized.json'

with open(src_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

missing_ids = set(map(str, [95,96,97,98,99,100,101]))

for m in data:
    if str(m.get('memberId')) in missing_ids:
        print(f"{m.get('memberId')} - {m.get('fullName')}")



