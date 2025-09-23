#!/usr/bin/env python3
"""
AAAC Correct Financial Calculation Script
Based on the working AAAC system rules and memory specifications.
"""

import pandas as pd
import json
import re
from datetime import datetime, date
from typing import Dict, List, Any, Optional, Tuple

class AAACCorrectProcessor:
    def __init__(self):
        self.dues_per_month = 15
        self.current_date = date(2025, 9, 18)
        self.baseline_date = date(2019, 2, 1)  # All members start Feb 2019
        self.inactive_threshold_months = 36  # 36 months without payment = inactive
        
    def clean_name(self, name: str) -> str:
        """Clean and normalize member names"""
        if pd.isna(name) or not name:
            return ""
        
        # Convert to string and strip whitespace
        name = str(name).strip().upper()
        
        # Remove extra spaces and normalize
        name = re.sub(r'\s+', ' ', name)
        
        return name
    
    def load_member_data(self, file_path: str) -> Dict[int, Dict]:
        """Load member data from AA Ass.xlsx"""
        print("Loading member data from AA Ass.xlsx...")
        
        df = pd.read_excel(file_path)
        
        # Clean column names
        df.columns = df.columns.str.strip()
        
        # Remove rows with NaN member numbers
        df = df.dropna(subset=['Number'])
        
        members = {}
        for _, row in df.iterrows():
            member_id = int(row['Number'])
            
            # Clean names
            first_name = self.clean_name(row['First Name'])
            middle_name = self.clean_name(row['Middle Name'])
            last_name = self.clean_name(row['last Name'])
            
            # Combine names
            name_parts = [first_name, middle_name, last_name]
            name_parts = [part for part in name_parts if part]
            full_name = ' '.join(name_parts)
            
            if not full_name:
                continue
                
            members[member_id] = {
                'memberId': str(member_id),
                'fullName': full_name,
                'phone': '',
                'isActive': True,  # Will be determined later based on payments
                'startDate': '2019-02-01',  # All members start Feb 2019
                'paymentsDues': {},
                'totalOwed': 0,
                'paidTowardOwed': 0,
                'futureCredit': 0,
                'balance': 0,
                'monthsCovered': 0,
                'monthsBehind': 0,
                'paidUpTo': None,
                'status': 'current',
                'ignored': False
            }
        
        print(f"Loaded {len(members)} members")
        return members
    
    def load_payment_data(self, file_path: str) -> Dict[int, Dict]:
        """Load payment data from AAAIC Book (1).xlsx"""
        print("Loading payment data from AAAIC Book (1).xlsx...")
        
        # Load all year sheets
        years = ['2019', '2020', '2022', '2023', '2024', '2025', '2026']
        payments = {}
        
        for year in years:
            try:
                print(f"  Processing {year}...")
                df = pd.read_excel(file_path, sheet_name=year)
                
                if df.empty:
                    continue
                
                # Find the name column (it varies by year)
                name_col = None
                for col in df.columns:
                    if 'NAME' in str(col).upper():
                        name_col = col
                        break
                
                if not name_col:
                    print(f"    No name column found in {year}")
                    continue
                
                # Find the member ID column
                id_col = None
                for col in df.columns:
                    if 'Unnamed: 0' in str(col) or 'NUMBER' in str(col).upper():
                        id_col = col
                        break
                
                # Process each row
                for _, row in df.iterrows():
                    # Get member ID
                    member_id = None
                    if id_col and not pd.isna(row[id_col]):
                        try:
                            member_id = int(row[id_col])
                        except:
                            pass
                    
                    # Get name for matching
                    name = self.clean_name(row[name_col]) if not pd.isna(row[name_col]) else ""
                    
                    # Skip if no ID and no name
                    if not member_id and not name:
                        continue
                    
                    # Process monthly payments
                    month_columns = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUNE', 'JULY', 'AUG', 'SEPT', 'OCT', 'NOV', 'DEC']
                    month_columns.extend(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'])
                    
                    for month_idx, month in enumerate(['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']):
                        for col in month_columns:
                            if col in df.columns and not pd.isna(row[col]):
                                try:
                                    amount = float(row[col])
                                    if amount > 0:
                                        payment_key = f"{year}-{month}"
                                        
                                        if member_id not in payments:
                                            payments[member_id] = {}
                                        
                                        if payment_key not in payments[member_id]:
                                            payments[member_id][payment_key] = 0
                                        
                                        payments[member_id][payment_key] += amount
                                except:
                                    pass
                
            except Exception as e:
                print(f"    Error processing {year}: {e}")
                continue
        
        print(f"Loaded payment data for {len(payments)} members")
        return payments
    
    def match_members_to_payments(self, members: Dict, payments: Dict) -> Dict:
        """Match members to their payment data using deterministic rules"""
        print("Matching members to payment data...")
        
        matched_count = 0
        
        for member_id, member_data in members.items():
            # First try exact member ID match
            if member_id in payments:
                member_data['paymentsDues'] = payments[member_id]
                matched_count += 1
                continue
            
            # If no exact match, try name matching
            member_name = member_data['fullName']
            best_match = None
            best_score = 0
            
            for pay_id, pay_data in payments.items():
                # This would require name matching logic
                # For now, we'll skip this and focus on exact ID matches
                pass
        
        print(f"Matched {matched_count} members to payment data")
        return members
    
    def calculate_financials_correct(self, member_data: Dict) -> Dict:
        """Calculate financials using the CORRECT AAAC rules"""
        payments = member_data['paymentsDues']
        
        # Find first payment month
        first_payment_month = None
        payment_dates = []
        
        for key in payments:
            if payments[key] and float(payments[key]) > 0:
                try:
                    year, month = key.split('-')
                    payment_date = date(int(year), int(month), 1)
                    payment_dates.append(payment_date)
                    if first_payment_month is None or payment_date < first_payment_month:
                        first_payment_month = payment_date
                except:
                    continue
        
        if not first_payment_month:
            # No payments found - member is inactive
            return {
                'totalOwed': 0,
                'paidTowardOwed': 0,
                'futureCredit': 0,
                'balance': 0,
                'monthsCovered': 0,
                'monthsBehind': 0,
                'paidUpTo': None,
                'status': 'inactive',
                'isActive': False,
                'ignored': True
            }
        
        # Calculate baseline (max of member start date and first payment)
        baseline = max(self.baseline_date, first_payment_month)
        
        # Calculate owed months (from baseline to current)
        owed_months = []
        current = baseline
        while current <= self.current_date:
            owed_months.append(current)
            if current.month == 12:
                current = current.replace(year=current.year + 1, month=1)
            else:
                current = current.replace(month=current.month + 1)
        
        total_owed = len(owed_months) * self.dues_per_month
        
        # Calculate payments toward owed months
        paid_toward_owed = 0
        months_covered = 0
        
        for month in owed_months:
            key = f"{month.year}-{month.month:02d}"
            amount = float(payments.get(key, 0))
            paid_toward_owed += amount
            
            if amount >= self.dues_per_month:
                months_covered += 1
        
        # Calculate future credit
        future_credit = 0
        for key in payments:
            try:
                year, month = key.split('-')
                payment_date = date(int(year), int(month), 1)
                if payment_date > self.current_date:
                    future_credit += float(payments[key])
            except:
                continue
        
        # Calculate balance (positive = credit, negative = owed)
        balance = (paid_toward_owed + future_credit) - total_owed
        
        # Calculate months behind
        months_behind = max(0, len(owed_months) - months_covered)
        
        # Calculate paid up to
        paid_up_to = None
        if months_covered > 0:
            last_paid_month = baseline
            for i in range(months_covered - 1):
                if last_paid_month.month == 12:
                    last_paid_month = last_paid_month.replace(year=last_paid_month.year + 1, month=1)
                else:
                    last_paid_month = last_paid_month.replace(month=last_paid_month.month + 1)
            paid_up_to = f"{last_paid_month.year}-{last_paid_month.month:02d}"
        
        # Determine status based on CORRECT AAAC rules
        # Check if member has any payment in last 36 months
        threshold_date = date(2022, 10, 1)  # 36 months before 2025-09
        has_recent_payment = any(
            date(int(year), int(month), 1) >= threshold_date
            for key in payments
            for year, month in [key.split('-')]
            if payments[key] and float(payments[key]) > 0
        )
        
        if not has_recent_payment:
            status = 'inactive'
            is_active = False
        elif months_behind >= 36:
            status = 'inactive'
            is_active = False
        elif balance > 0:
            # Member has credit - they're ahead
            status = 'ahead'
            is_active = True
        elif months_behind >= 24:
            status = 'risk'
            is_active = True
        elif months_behind >= 12:
            status = 'risk'
            is_active = True
        elif months_behind >= 6:
            status = 'issues'
            is_active = True
        elif months_behind > 0:
            status = 'behind'
            is_active = True
        else:
            status = 'current'
            is_active = True
        
        # Determine if ignored (more than 36 months behind)
        ignored = months_behind > self.inactive_threshold_months
        
        return {
            'totalOwed': total_owed,
            'paidTowardOwed': paid_toward_owed,
            'futureCredit': future_credit,
            'balance': round(balance, 2),
            'monthsCovered': months_covered,
            'monthsBehind': months_behind,
            'paidUpTo': paid_up_to,
            'status': status,
            'isActive': is_active,
            'ignored': ignored
        }
    
    def process_all_members(self, members: Dict) -> Dict:
        """Process all members and calculate their financials"""
        print("Calculating financials for all members...")
        
        processed_members = []
        sum_balances_included = 0
        ignored_members = []
        
        for member_id, member_data in members.items():
            # Calculate financials
            financials = self.calculate_financials_correct(member_data)
            
            # Update member data
            member_data.update(financials)
            
            # Add to processed list
            processed_members.append(member_data)
            
            # Track totals (only negative balances = money owed)
            if not financials['ignored']:
                if financials['balance'] < 0:
                    sum_balances_included += abs(financials['balance'])
            else:
                ignored_members.append({
                    'memberId': member_data['memberId'],
                    'fullName': member_data['fullName'],
                    'reason': f"Months behind: {financials['monthsBehind']}"
                })
        
        return {
            'members': processed_members,
            'totals': {
                'sumBalancesIncluded': sum_balances_included,
                'ignoredMembers': ignored_members,
                'now': self.current_date.strftime('%Y-%m-%d')
            }
        }
    
    def run(self, members_file: str, payments_file: str, output_file: str):
        """Main processing function"""
        print("Starting AAAC data processing with CORRECT calculations...")
        
        # Load data
        members = self.load_member_data(members_file)
        payments = self.load_payment_data(payments_file)
        
        # Match members to payments
        members = self.match_members_to_payments(members, payments)
        
        # Process all members
        result = self.process_all_members(members)
        
        # Save to JSON
        print(f"Saving results to {output_file}...")
        with open(output_file, 'w') as f:
            json.dump(result, f, indent=2)
        
        print("Processing complete!")
        print(f"Total members: {len(result['members'])}")
        print(f"Sum of balances (included): ${result['totals']['sumBalancesIncluded']:.2f}")
        print(f"Ignored members: {len(result['totals']['ignoredMembers'])}")
        
        return result

def main():
    processor = AAACCorrectProcessor()
    
    # File paths
    members_file = '/Users/birukeyesus/Downloads/AA Ass.xlsx'
    payments_file = '/Users/birukeyesus/Downloads/AAAIC Book (1).xlsx'
    output_file = '/Users/birukeyesus/terraform_practice/aaac-system/docs/cleaned_members_correct.json'
    
    # Process data
    result = processor.run(members_file, payments_file, output_file)
    
    # Show some examples
    print("\n=== SAMPLE MEMBERS ===")
    for member in result['members'][:5]:
        print(f"Member {member['memberId']} - {member['fullName']}:")
        print(f"  Status: {member['status']}")
        print(f"  Balance: ${member['balance']}")
        print(f"  Months Behind: {member['monthsBehind']}")
        print(f"  Paid Up To: {member['paidUpTo']}")
        print(f"  Total Owed: ${member['totalOwed']}")
        print(f"  Paid Toward Owed: ${member['paidTowardOwed']}")
        print()

if __name__ == '__main__':
    main()
