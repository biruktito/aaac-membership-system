#!/usr/bin/env python3
"""
AAAC Final Financial Calculation Script
Following the EXACT AAAC system logic from the documentation.
"""

import pandas as pd
import json
import re
from datetime import datetime, date
from typing import Dict, List, Any, Optional, Tuple

class AAACFinalProcessor:
    def __init__(self):
        self.dues_per_month = 15
        self.registration_fee = 200
        self.current_date = date(2025, 9, 18)
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
                
            # Try to get start date from registration column if available
            start_date = None
            if 'REGISTRATION' in df.columns and not pd.isna(row['REGISTRATION']):
                try:
                    # Try to parse the registration date
                    reg_date = pd.to_datetime(row['REGISTRATION'])
                    start_date = reg_date.strftime('%Y-%m-%d')
                except:
                    pass
            
            members[member_id] = {
                'memberId': str(member_id),
                'fullName': full_name,
                'phone': '',
                'isActive': True,  # Will be determined later based on payments
                'startDate': start_date,  # Official start date from member data
                'paymentsDues': {},
                'registrationPayments': [],
                'incidentalPayments': [],
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
                
                # Find registration fee column
                reg_col = None
                for col in df.columns:
                    if 'REGIST' in str(col).upper():
                        reg_col = col
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
                    
                    # Process registration fee
                    if reg_col and not pd.isna(row[reg_col]):
                        try:
                            reg_amount = float(row[reg_col])
                            if reg_amount > 0:
                                if member_id not in payments:
                                    payments[member_id] = {'monthly': {}, 'registration': [], 'incidental': []}
                                payments[member_id]['registration'].append({
                                    'amount': reg_amount,
                                    'date': f"{year}-01-01",
                                    'notes': 'Registration fee'
                                })
                        except:
                            pass
                    
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
                                            payments[member_id] = {'monthly': {}, 'registration': [], 'incidental': []}
                                        
                                        if 'monthly' not in payments[member_id]:
                                            payments[member_id]['monthly'] = {}
                                        
                                        if payment_key not in payments[member_id]['monthly']:
                                            payments[member_id]['monthly'][payment_key] = 0
                                        
                                        payments[member_id]['monthly'][payment_key] += amount
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
                member_data['paymentsDues'] = payments[member_id].get('monthly', {})
                member_data['registrationPayments'] = payments[member_id].get('registration', [])
                member_data['incidentalPayments'] = payments[member_id].get('incidental', [])
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
    
    def calculate_financials_final(self, member_data: Dict) -> Dict:
        """Calculate financials using EXACT AAAC rules from documentation"""
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
                'startAt': None,
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
        
        # Calculate baseline = max(member.startDate, firstPaymentMonth)
        baseline = first_payment_month
        if member_data['startDate']:
            try:
                member_start = datetime.strptime(member_data['startDate'], '%Y-%m-%d').date()
                # Convert to first of month for comparison
                member_start_month = date(member_start.year, member_start.month, 1)
                if member_start_month > first_payment_month:
                    baseline = member_start_month
            except:
                pass
        
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
        
        # Calculate payments toward owed months (with gap-filling)
        paid_toward_owed = 0
        months_covered = 0
        
        # Apply gap-filling heuristic: if member paid from month A to month B,
        # fill missing months between A and B with $15
        if payment_dates:
            min_payment_date = min(payment_dates)
            max_payment_date = max(payment_dates)
            
            # Fill gaps between min and max payment dates
            current_fill = min_payment_date
            while current_fill <= max_payment_date and current_fill <= self.current_date:
                key = f"{current_fill.year}-{current_fill.month:02d}"
                amount = float(payments.get(key, 0))
                
                if amount > 0:
                    paid_toward_owed += amount
                    if amount >= self.dues_per_month:
                        months_covered += 1
                elif current_fill >= min_payment_date and current_fill <= max_payment_date:
                    # Gap-filling: assume $15 was paid for missing months
                    paid_toward_owed += self.dues_per_month
                    months_covered += 1
                
                if current_fill.month == 12:
                    current_fill = current_fill.replace(year=current_fill.year + 1, month=1)
                else:
                    current_fill = current_fill.replace(month=current_fill.month + 1)
        
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
        
        # Calculate balance (positive = ahead, negative = behind)
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
        
        # Determine status based on EXACT AAAC rules from documentation
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
        elif months_behind > 36:
            status = 'inactive'
            is_active = False
        elif balance > 0:
            # Member has credit - they're ahead
            status = 'ahead'
            is_active = True
        elif balance >= 0 and months_behind == 0:
            status = 'current'
            is_active = True
        elif balance < 0 and months_behind >= 1 and months_behind <= 2:
            status = 'behind'
            is_active = True
        elif balance < 0 and months_behind >= 3 and months_behind <= 5:
            status = 'issue'
            is_active = True
        elif balance < 0 and months_behind >= 6:
            status = 'risk'
            is_active = True
        else:
            status = 'current'
            is_active = True
        
        # Determine if ignored (more than 36 months behind)
        ignored = months_behind > self.inactive_threshold_months
        
        return {
            'startAt': baseline.strftime('%Y-%m'),
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
            financials = self.calculate_financials_final(member_data)
            
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
        print("Starting AAAC data processing with FINAL calculations...")
        
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
    processor = AAACFinalProcessor()
    
    # File paths
    members_file = '/Users/birukeyesus/Downloads/AA Ass.xlsx'
    payments_file = '/Users/birukeyesus/terraform_practice/aaac-system/docs/AAAIC Book (1).xlsx'
    output_file = '/Users/birukeyesus/terraform_practice/aaac-system/docs/cleaned_members_final.json'
    
    # Process data
    result = processor.run(members_file, payments_file, output_file)
    
    # Show some examples
    print("\n=== SAMPLE MEMBERS ===")
    for member in result['members'][:5]:
        print(f"Member {member['memberId']} - {member['fullName']}:")
        print(f"  Start Date: {member['startDate']}")
        print(f"  Start At: {member['startAt']}")
        print(f"  Status: {member['status']}")
        print(f"  Balance: ${member['balance']}")
        print(f"  Months Behind: {member['monthsBehind']}")
        print(f"  Paid Up To: {member['paidUpTo']}")
        print(f"  Total Owed: ${member['totalOwed']}")
        print(f"  Paid Toward Owed: ${member['paidTowardOwed']}")
        print(f"  Registration Payments: {len(member['registrationPayments'])}")
        print()

if __name__ == '__main__':
    main()
