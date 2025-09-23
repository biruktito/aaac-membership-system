import json
from pathlib import Path

base = Path('/Users/birukeyesus/terraform_practice/aaac-system')
src_path = base / 'docs/cleaned_members_final_normalized.json'
val_path = base / 'docs/data/members_fuzzy_output.json'

def load_json(path: Path):
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

src = load_json(src_path)
val = load_json(val_path)
if isinstance(val, dict) and 'members' in val:
    val_list = val['members']
elif isinstance(val, dict) and 'results' in val:
    val_list = val['results']
elif isinstance(val, list):
    val_list = val
else:
    raise SystemExit('Unexpected validator JSON shape')

src_ids = [str(x.get('memberId')) for x in src]
val_ids = [str(x.get('memberId')) for x in val_list]

def key(x: str) -> int:
    try:
        return int(x)
    except Exception:
        return 0

missing = sorted(set(src_ids) - set(val_ids), key=key)
extra = sorted(set(val_ids) - set(src_ids), key=key)
ignored = [str(x.get('memberId')) for x in val_list if x.get('ignored')]

print('SRC count:', len(src_ids))
print('VAL count:', len(val_ids))
print('Missing in validator ({}):'.format(len(missing)), missing)
print('Extra in validator ({}):'.format(len(extra)), extra)
print('Ignored flagged ({}):'.format(len(ignored)), ignored)


