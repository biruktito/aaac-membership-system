#!/usr/bin/env python3
import json

def main():
    # Load the generated JSON
    with open('docs/cleaned_members_final_clean.json', 'r') as f:
        data = json.load(f)

    # Check a few members
    print('=== CHECKING CALCULATIONS ===')
    for member in data['members'][:3]:
        print(f'Member {member["memberId"]} - {member["fullName"]}:')
        print(f'  totalOwed: {member["totalOwed"]}')
        print(f'  paidTowardOwed: {member["paidTowardOwed"]}')
        print(f'  futureCredit: {member["futureCredit"]}')
        print(f'  balance: {member["balance"]}')
        print(f'  monthsBehind: {member["monthsBehind"]}')
        print(f'  paymentsDues keys: {list(member["paymentsDues"].keys())[:5]}...')
        print()

if __name__ == '__main__':
    main()


