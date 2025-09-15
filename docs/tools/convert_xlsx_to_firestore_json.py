#!/usr/bin/env python3
"""
Convert AAAIC Excel workbook to Firestore-ready JSON.
- Reads yearly sheets (2019, 2020, 2022, 2023, 2024, 2025, 2026)
- Extracts dues ($15) into paymentsDues (YYYY-MM)
- Extracts registration fee ($100 old, $200 recent) per member (joiningFeeAmount, joiningFeeDate)
- Ignores incidentals (BBQ, Father Day etc.) entirely
- Merges phone numbers from CSV contact list
- Produces member docs: { memberId, fullName, phone, isActive, startDate, paymentsDues, joiningFeeAmount, joiningFeeDate }

Usage:
  python3 docs/tools/convert_xlsx_to_firestore_json.py \
    "/Users/birukeyesus/terraform_practice/aaac-system/docs/AAAIC Book (1).xlsx" \
    "/Users/birukeyesus/terraform_practice/aaac-system/AAAC_members_contact_list.xlsx - Sheet1.csv" \
    > cleaned_members.json
"""

import sys
import json
import re
from datetime import date

import pandas as pd

DUE_PER_MONTH = 15
REG_FEES = {100, 200}
CURRENT_YEAR = 2025
CURRENT_MONTH = 9  # September
START_DATE = f"{CURRENT_YEAR}-{CURRENT_MONTH:02d}-01"

YEAR_SHEETS = ["2019", "2020", "2021", "2022", "2023", "2024", "2025", "2026"]
# Month headers by sheet variety (normalize to JAN..DEC uppercase)
MONTHS = [
  ("JAN", ["JAN", "Jan"]),
  ("FEB", ["FEB", "Feb"]),
  ("MAR", ["MAR", "Mar"]),
  ("APR", ["APR", "Apr"]),
  ("MAY", ["MAY", "May"]),
  ("JUN", ["JUN", "Jun"]),
  ("JUL", ["JUL", "Jul", "JULY"]),
  ("AUG", ["AUG", "Aug"]),
  ("SEP", ["SEPT", "SEP", "Sep"]),
  ("OCT", ["OCT", "Oct"]),
  ("NOV", ["NOV", "Nov"]),
  ("DEC", ["DEC", "Dec"]),
]
MONTH_TO_NUM = {"JAN":"01","FEB":"02","MAR":"03","APR":"04","MAY":"05","JUN":"06","JUL":"07","AUG":"08","SEP":"09","OCT":"10","NOV":"11","DEC":"12"}

REG_COL_CANDIDATES = [
  "REGIST", "REGISTRATI", "REGIST RATION", "REGIST\n RATION",
  "RegistratioN", "REGISTRATION", "REGIST  RATION"
]

NAME_COL_CANDIDATES = ["NAME", "MEMBERS NAME", "Name"]
ID_COL_CANDIDATES = ["Member_ID", "NUMBER", "Unnamed: 0"]


def find_first_col(df, candidates):
  for c in candidates:
    for col in df.columns:
      if str(col).strip().upper() == c.upper():
        return col
  return None


def normalize_name(raw):
  if pd.isna(raw):
    return ""
  s = str(raw).strip()
  s = re.sub(r"\s+", " ", s)
  return s


def normalize_member_id(row, id_col, name_col):
  member_id = None
  if id_col and id_col in row and pd.notna(row[id_col]):
    raw = row[id_col]
    # Coerce numeric IDs like 1.0 -> "1"
    try:
      if isinstance(raw, (int,)):
        member_id = str(raw)
      elif isinstance(raw, float):
        if raw.is_integer():
          member_id = str(int(raw))
        else:
          member_id = str(raw).strip()
      else:
        member_id = str(raw).strip()
    except Exception:
      member_id = str(raw).strip()
  name = normalize_name(row.get(name_col, "")) if name_col else ""
  if not member_id and name:
    member_id = name  # fallback
  return member_id, name


def month_col_map(df):
  mapping = {}
  cols = list(df.columns)
  for norm, variants in MONTHS:
    for v in variants:
      for col in cols:
        if str(col).strip().upper() == v.upper():
          mapping[norm] = col
          break
      if norm in mapping:
        break
  return mapping


def parse_year_sheet(year: int, df: pd.DataFrame, members):
  if df is None or df.empty:
    return
  id_col = find_first_col(df, ID_COL_CANDIDATES)
  name_col = find_first_col(df, NAME_COL_CANDIDATES)
  reg_col = find_first_col(df, REG_COL_CANDIDATES)
  mcols = month_col_map(df)

  for _, row in df.iterrows():
    member_id, full_name = normalize_member_id(row, id_col, name_col)
    if not member_id and not full_name:
      continue
    key = member_id
    if key not in members:
      members[key] = {
        "memberId": member_id,
        "fullName": full_name,
        "paymentsDues": {},
        "joiningFeeAmount": 0,
        "joiningFeeDate": None,
      }
    # registration
    if reg_col and reg_col in df.columns:
      try:
        amt = float(row.get(reg_col, 0) or 0)
      except Exception:
        amt = 0
      if amt in REG_FEES and members[key]["joiningFeeAmount"] == 0:
        members[key]["joiningFeeAmount"] = int(amt)
        members[key]["joiningFeeDate"] = f"{year}-01-01"
    # dues months
    for norm, col in mcols.items():
      try:
        val = float(row.get(col, 0) or 0)
      except Exception:
        val = 0
      if val == DUE_PER_MONTH:
        month_key = f"{year}-{MONTH_TO_NUM[norm]}"
        members[key]["paymentsDues"][month_key] = members[key]["paymentsDues"].get(month_key, 0) + DUE_PER_MONTH


def load_phone_lookup(csv_path):
  """Load phone numbers from CSV contact list."""
  try:
    df = pd.read_csv(csv_path)
    lookup = {}
    for _, row in df.iterrows():
      number = str(row.get('Number', '')).strip()
      name = str(row.get('Full Name Clean', '')).strip()
      phone = str(row.get('Phone', '')).strip()
      if number and phone:
        lookup[number] = phone
      if name and phone:
        lookup[name.upper()] = phone
    return lookup
  except Exception as e:
    print(f"Warning: Could not load phone CSV: {e}", file=sys.stderr)
    return {}

def finalize_members(members: dict, phone_lookup: dict):
  out = []
  current_key = f"{CURRENT_YEAR}-{CURRENT_MONTH:02d}"
  for key, m in members.items():
    payments = m.get("paymentsDues", {})
    # isActive: any dues in last 36 months relative to Sep 2025
    is_active = False
    for mk in payments.keys():
      if mk <= current_key:
        y, mm = mk.split('-')
        months = (CURRENT_YEAR - int(y)) * 12 + (CURRENT_MONTH - int(mm))
        if months < 36:
          is_active = True
          break
    
    member_id = m.get("memberId") or m.get("fullName") or key
    full_name = m.get("fullName") or ""
    
    # Look up phone number
    phone = phone_lookup.get(member_id) or phone_lookup.get(full_name.upper()) or ""
    
    out.append({
      "memberId": member_id,
      "fullName": full_name,
      "phone": phone,
      "isActive": is_active,
      "startDate": START_DATE,
      "paymentsDues": payments,
      "joiningFeeAmount": m.get("joiningFeeAmount", 0),
      "joiningFeeDate": m.get("joiningFeeDate"),
    })
  return out


def main():
  if len(sys.argv) < 3:
    print("Usage: python3 convert_xlsx_to_firestore_json.py <path_to_xlsx> <path_to_phone_csv>")
    sys.exit(1)
  xlsx_path = sys.argv[1]
  csv_path = sys.argv[2]
  
  # Load phone numbers
  phone_lookup = load_phone_lookup(csv_path)
  
  xl = pd.ExcelFile(xlsx_path)
  members = {}
  for sheet in YEAR_SHEETS:
    if sheet in xl.sheet_names:
      df = xl.parse(sheet)
      if df is not None and not df.empty:
        try:
          y = int(sheet)
        except Exception:
          continue
        parse_year_sheet(y, df, members)
  result = finalize_members(members, phone_lookup)
  sys.stdout.write(json.dumps(result, indent=2, ensure_ascii=False))

if __name__ == "__main__":
  main()
