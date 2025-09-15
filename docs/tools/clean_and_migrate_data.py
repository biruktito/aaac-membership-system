#!/usr/bin/env python3
"""
Clean and migrate AAAC data with proper separation of dues, registration fees, and incidentals.
This script:
1. Separates $15 dues from registration fees and incidentals
2. Resets timeline to September 2025
3. Creates clean Firestore-ready JSON
"""

import pandas as pd
import json
import sys
from datetime import datetime, date
import re

# Configuration
CURRENT_YEAR = 2025
CURRENT_MONTH = 9  # September
DUE_PER_MONTH = 15
REGISTRATION_FEE_OLD = 100
REGISTRATION_FEE_NEW = 200

def clean_payment_data(df, payment_cols):
    """Clean and categorize payment data."""
    print("=== Cleaning Payment Data ===")
    
    cleaned_members = []
    
    for idx, row in df.iterrows():
        member_id = str(row.get('Member_ID', '')).strip()
        full_name = str(row.get('Name', '')).strip()
        
        if not member_id and not full_name:
            continue
        
        # Initialize payment categories
        payments_dues = {}
        payments_incidentals = {}
        registration_fee = 0
        registration_fee_date = None
        
        # Process each payment column
        for col in payment_cols:
            amount = row.get(col, 0)
            if pd.isna(amount) or amount == 0:
                continue
            
            amount = float(amount)
            year, month = col.split('_')
            month_key = f"{year}-{month}"
            
            # Categorize payments
            if amount == DUE_PER_MONTH:
                # Regular dues payment
                payments_dues[month_key] = amount
            elif amount in [REGISTRATION_FEE_OLD, REGISTRATION_FEE_NEW]:
                # Registration fee
                registration_fee = amount
                registration_fee_date = f"{year}-{month}-01"
            else:
                # Incidental payment
                payments_incidentals[month_key] = amount
        
        # Determine if member is active (has any payment in last 36 months from Sep 2025)
        is_active = False
        current_key = f"{CURRENT_YEAR}-{CURRENT_MONTH:02d}"
        
        # Check if they have any payment in the last 36 months
        for month_key in payments_dues.keys():
            if month_key <= current_key:
                # Calculate months between payment and current date
                year, month = month_key.split('-')
                payment_date = date(int(year), int(month), 1)
                current_date = date(CURRENT_YEAR, CURRENT_MONTH, 1)
                
                months_diff = (current_date.year - payment_date.year) * 12 + (current_date.month - payment_date.month)
                if months_diff < 36:
                    is_active = True
                    break
        
        # Set start date to September 2025 for fresh start
        start_date = f"{CURRENT_YEAR}-{CURRENT_MONTH:02d}-01"
        
        member_data = {
            "memberId": member_id,
            "fullName": full_name,
            "isActive": is_active,
            "startDate": start_date,
            "paymentsDues": payments_dues,
            "joiningFeeAmount": registration_fee,
            "joiningFeeDate": registration_fee_date,
            "paymentsIncidentals": payments_incidentals if payments_incidentals else {}
        }
        
        cleaned_members.append(member_data)
    
    return cleaned_members

def generate_fresh_start_data(members):
    """Generate fresh start data from September 2025."""
    print("=== Generating Fresh Start Data ===")
    
    fresh_members = []
    
    for member in members:
        # Reset to September 2025 baseline
        fresh_member = {
            "memberId": member["memberId"],
            "fullName": member["fullName"],
            "isActive": True,  # All existing members are active
            "startDate": f"{CURRENT_YEAR}-{CURRENT_MONTH:02d}-01",
            "paymentsDues": {},  # Start fresh
            "joiningFeeAmount": 200,  # Assume all paid $200 joining fee
            "joiningFeeDate": f"{CURRENT_YEAR}-{CURRENT_MONTH:02d}-01",
            "paymentsIncidentals": {}
        }
        
        # If they had a registration fee, preserve it
        if member.get("joiningFeeAmount", 0) > 0:
            fresh_member["joiningFeeAmount"] = member["joiningFeeAmount"]
            fresh_member["joiningFeeDate"] = member.get("joiningFeeDate", f"{CURRENT_YEAR}-{CURRENT_MONTH:02d}-01")
        
        fresh_members.append(fresh_member)
    
    return fresh_members

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 clean_and_migrate_data.py <path_to_excel_file>")
        sys.exit(1)
    
    file_path = sys.argv[1]
    
    try:
        # Read Excel file
        print(f"Reading Excel file: {file_path}")
        df = pd.read_excel(file_path)
        
        # Find payment columns
        payment_cols = []
        for col in df.columns:
            if re.match(r'^\d{4}_\w{3}$', str(col)):
                payment_cols.append(col)
        
        print(f"Found {len(payment_cols)} payment columns")
        
        # Clean the data
        cleaned_members = clean_payment_data(df, payment_cols)
        print(f"Cleaned {len(cleaned_members)} members")
        
        # Generate fresh start data
        fresh_members = generate_fresh_start_data(cleaned_members)
        
        # Save cleaned data
        output_file = "cleaned_members_fresh_start.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(fresh_members, f, indent=2, ensure_ascii=False)
        
        print(f"\n=== Results ===")
        print(f"Cleaned data saved to: {output_file}")
        print(f"Total members: {len(fresh_members)}")
        
        # Show sample
        print(f"\n=== Sample Member ===")
        if fresh_members:
            sample = fresh_members[0]
            print(json.dumps(sample, indent=2, ensure_ascii=False))
        
        print(f"\n=== Next Steps ===")
        print("1. Review the cleaned data")
        print("2. Import to Firestore using migrate_v2.html")
        print("3. All members will start fresh from September 2025")
        print("4. All existing members marked as having paid joining fee")
        
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
