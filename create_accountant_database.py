#!/usr/bin/env python3
import pandas as pd
import csv
from datetime import datetime

def create_accountant_database():
    """Create a new accountant-friendly database with all current member data"""
    
    # Load current contact list
    contact_df = pd.read_csv('AAAC_members_contact_list.xlsx - Sheet1.csv')
    
    # Load all year data
    years = ['2022', '2023', '2024', '2025', '2026']
    year_data = {}
    
    for year in years:
        try:
            df = pd.read_csv(f'AAAC_{year}.csv')
            year_data[year] = df
            print(f"Loaded {year} data: {len(df)} records")
        except Exception as e:
            print(f"Could not load {year}: {e}")
            year_data[year] = pd.DataFrame()
    
    # Create new database structure
    accountant_data = []
    
    for _, contact_row in contact_df.iterrows():
        member_id = contact_row.iloc[0]  # First column is ID
        name = contact_row.iloc[1]       # Second column is name
        phone = contact_row.iloc[2]      # Third column is phone
        
        # Initialize member record
        member_record = {
            'Member_ID': member_id,
            'Name': name,
            'Phone': phone,
            'Status': 'Active',  # Default status
            'First_Payment_Year': '',
            'Registration_Fee_Paid': 0,
            'Registration_Fee_Amount': 0,
            'Last_Payment_Date': '',
            'Notes': ''
        }
        
        # Add monthly payment columns for each year
        for year in years:
            for month in ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']:
                member_record[f'{year}_{month}'] = 0
        
        # Add incidental columns for each year
        for year in years:
            member_record[f'{year}_Incidentals'] = 0
            member_record[f'{year}_Incidental_Notes'] = ''
        
        # Populate with existing data
        for year in years:
            if year in year_data and not year_data[year].empty:
                # Find member in year data
                year_df = year_data[year]
                member_row = None
                
                # Try to match by ID first
                if 'Unnamed: 0' in year_df.columns:
                    member_row = year_df[year_df['Unnamed: 0'] == member_id]
                
                # If not found, try by name
                if member_row.empty and 'NAME' in year_df.columns:
                    member_row = year_df[year_df['NAME'].str.contains(name, case=False, na=False)]
                
                if not member_row.empty:
                    row = member_row.iloc[0]
                    
                    # Get registration fee
                    if 'REGIST' in year_df.columns:
                        reg_fee = row.get('REGIST', 0)
                        if pd.notna(reg_fee) and reg_fee > 0:
                            member_record['Registration_Fee_Paid'] += reg_fee
                            member_record['Registration_Fee_Amount'] = reg_fee
                    
                    # Get monthly payments - handle both abbreviated and full month names, and case variations
                    month_mapping = {
                        'JAN': ['JAN', 'Jan'],
                        'FEB': ['FEB', 'Feb'],
                        'MAR': ['MAR', 'Mar'],
                        'APR': ['APR', 'Apr'],
                        'MAY': ['MAY', 'May'],
                        'JUN': ['JUN', 'JUNE', 'Jun'],
                        'JUL': ['JUL', 'JULY', 'Jul'],
                        'AUG': ['AUG', 'Aug'],
                        'SEP': ['SEP', 'SEPT', 'Sep'],
                        'OCT': ['OCT', 'Oct'],
                        'NOV': ['NOV', 'Nov'],
                        'DEC': ['DEC', 'Dec']
                    }
                    
                    for month_abbr, possible_names in month_mapping.items():
                        payment = 0
                        for col_name in possible_names:
                            if col_name in year_df.columns:
                                payment_value = row.get(col_name, 0)
                                if pd.notna(payment_value) and payment_value != '' and str(payment_value).strip() != '':
                                    try:
                                        payment = float(payment_value)
                                        if payment > 0:
                                            break
                                    except (ValueError, TypeError):
                                        payment = 0
                        
                        if payment > 0:
                            member_record[f'{year}_{month_abbr}'] = payment
                            
                            # Track first payment year
                            if not member_record['First_Payment_Year']:
                                member_record['First_Payment_Year'] = year
                            
                            # Track last payment date
                            member_record['Last_Payment_Date'] = f"{month_abbr} {year}"
        
        accountant_data.append(member_record)
    
    # Create DataFrame and save
    df = pd.DataFrame(accountant_data)
    
    # Reorder columns for better readability
    base_cols = ['Member_ID', 'Name', 'Phone', 'Status', 'First_Payment_Year', 
                 'Registration_Fee_Paid', 'Registration_Fee_Amount', 'Last_Payment_Date', 'Notes']
    
    monthly_cols = []
    incidental_cols = []
    
    for year in years:
        for month in ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']:
            monthly_cols.append(f'{year}_{month}')
        incidental_cols.extend([f'{year}_Incidentals', f'{year}_Incidental_Notes'])
    
    final_cols = base_cols + monthly_cols + incidental_cols
    df = df[final_cols]
    
    # Save to CSV
    filename = f'AAAC_Accountant_Database_{datetime.now().strftime("%Y%m%d")}.csv'
    df.to_csv(filename, index=False)
    print(f"\n✅ Created accountant database: {filename}")
    print(f"📊 Total members: {len(df)}")
    print(f"📋 Columns: {len(df.columns)}")
    
    # Create instructions file
    create_instructions_file()
    
    return filename

def create_instructions_file():
    """Create instructions for the accountant"""
    instructions = """
# AAAC Accountant Database Instructions

## File Structure
- Member_ID: Unique identifier for each member
- Name: Member's full name
- Phone: Contact number (for reference only)
- Status: Active, Inactive, Removed, Risk_of_Removal
- First_Payment_Year: Year member first started paying
- Registration_Fee_Paid: Total registration fees paid
- Registration_Fee_Amount: Standard registration fee amount
- Last_Payment_Date: Most recent payment date
- Notes: Any special notes about the member

## Monthly Payments
- Columns: 2022_JAN, 2022_FEB, etc.
- Enter payment amounts (typically $15)
- Leave as 0 if no payment made

## Incidentals
- Columns: 2022_Incidentals, 2022_Incidental_Notes, etc.
- Enter total incidental amount for the year
- Add notes explaining the incidental (e.g., "Funeral contribution")

## Status Updates
- Active: Current paying member
- Inactive: No payments for 36+ months
- Risk_of_Removal: Over 2 years behind
- Removed: Officially removed from membership

## Monthly Process
1. Open the CSV file
2. Add new monthly payments in appropriate columns
3. Add any incidentals with notes
4. Update member statuses as needed
5. Save the file
6. Upload to the system

## Important Notes
- Keep phone numbers for reference but don't display publicly
- Registration fees: $100 for pre-2023 members, $200 for new members
- Monthly fee: $15 per member
- Incidentals: $10 for funeral contributions, etc.
"""
    
    with open('Accountant_Instructions.txt', 'w') as f:
        f.write(instructions)
    
    print("📖 Created accountant instructions: Accountant_Instructions.txt")

if __name__ == "__main__":
    create_accountant_database()


