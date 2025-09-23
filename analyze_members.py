#!/usr/bin/env python3
import json
from datetime import datetime

def calculate_member_financials(member):
    """Calculate financial status for a member"""
    payments = member.get('payments', member.get('paymentsDues', {}))
    
    # Count months with full payments
    paid_months = sum(1 for amount in payments.values() if float(amount or 0) >= 15)
    total_paid = sum(float(amount or 0) for amount in payments.values())
    
    # Estimate baseline - simplified calculation
    # Assume most members started around 2019, current is 2025-09
    start_year = 2019
    current_year = 2025
    current_month = 9
    total_months = (current_year - start_year) * 12 + current_month - 1  # ~80 months
    
    owed_amount = total_months * 15
    balance = total_paid - owed_amount
    months_behind = max(0, total_months - paid_months)
    
    # Determine status
    if not member.get('isActive', True):
        status = 'inactive'
    elif balance > 0:
        status = 'ahead'
    elif months_behind == 0:
        status = 'current'
    elif months_behind <= 2:
        status = 'behind'
    elif months_behind <= 5:
        status = 'issue'
    else:
        status = 'risk'
    
    return {
        'id': member.get('memberId'),
        'name': member.get('fullName'),
        'status': status,
        'balance': round(balance, 2),
        'months_behind': months_behind,
        'total_paid': round(total_paid, 2),
        'ignored': months_behind > 36
    }

def main():
    # Load member data
    with open('docs/cleaned_members_final_normalized.json', 'r') as f:
        members = json.load(f)
    
    # Calculate for all members
    results = [calculate_member_financials(m) for m in members]
    
    print('=== MEMBER FINANCIAL STATUS EXAMPLES ===')
    print()
    
    # Show specific members
    for member_id in ['1', '3', '5', '10', '15', '20', '50', '100']:
        member = next((r for r in results if r['id'] == member_id), None)
        if member:
            print(f'Member {member["id"]} - {member["name"]}:')
            print(f'  Status: {member["status"]}')
            print(f'  Balance: ${member["balance"]}')
            print(f'  Months Behind: {member["months_behind"]}')
            print(f'  Total Paid: ${member["total_paid"]}')
            if member["ignored"]:
                print(f'  *** IGNORED (>36 months behind) ***')
            print()
    
    # Calculate totals
    total_members = len(results)
    included = [r for r in results if not r['ignored']]
    ignored = [r for r in results if r['ignored']]
    
    total_owed = sum(abs(r['balance']) for r in included if r['balance'] < 0)
    total_ahead = sum(r['balance'] for r in included if r['balance'] > 0)
    current_count = len([r for r in included if r['status'] in ['current', 'ahead']])
    behind_count = len([r for r in included if r['status'] in ['behind', 'issue', 'risk']])
    
    print('=== AGGREGATE TOTALS ===')
    print(f'Total Members: {total_members}')
    print(f'Included in Totals: {len(included)}')
    print(f'Ignored (>36 months behind): {len(ignored)}')
    print(f'Current/Paid Up: {current_count}')
    print(f'Behind: {behind_count}')
    print(f'Total Owed by Active Members: ${total_owed:.2f}')
    print(f'Total Ahead (Credit): ${total_ahead:.2f}')
    print()
    
    # Status breakdown
    status_counts = {}
    for r in results:
        status_counts[r['status']] = status_counts.get(r['status'], 0) + 1
    
    print('=== STATUS BREAKDOWN ===')
    for status, count in sorted(status_counts.items()):
        print(f'{status.capitalize()}: {count}')
    
    # Show some ahead and behind examples
    print()
    print('=== MEMBERS AHEAD (Positive Balance) ===')
    ahead_members = [r for r in included if r['balance'] > 0][:5]
    for member in ahead_members:
        print(f'  {member["name"]}: ${member["balance"]} ahead')
    
    print()
    print('=== MEMBERS BEHIND (Negative Balance) ===')
    behind_members = [r for r in included if r['balance'] < 0][:5]
    for member in behind_members:
        print(f'  {member["name"]}: ${abs(member["balance"])} behind ({member["months_behind"]} months)')

if __name__ == '__main__':
    main()



