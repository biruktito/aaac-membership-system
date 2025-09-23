#!/usr/bin/env python3
import json

def main():
    # Load the generated JSON
    with open('docs/cleaned_members_correct.json', 'r') as f:
        data = json.load(f)

    # Check a member's payment data
    member = data['members'][0]
    print(f'Member {member["memberId"]} - {member["fullName"]}:')
    print(f'Payment keys: {sorted(list(member["paymentsDues"].keys()))[:10]}...')
    print(f'Total payment keys: {len(member["paymentsDues"])}')

    # Check payment amounts
    total_paid = sum(float(amount) for amount in member['paymentsDues'].values())
    print(f'Total paid: ${total_paid}')

    # Check if there are payments before 2019-02
    early_payments = [key for key in member['paymentsDues'].keys() if key < '2019-02']
    print(f'Payments before 2019-02: {early_payments}')

    # Check payments from 2019-02 onwards
    owed_payments = [key for key in member['paymentsDues'].keys() if key >= '2019-02' and key <= '2025-09']
    print(f'Payments from 2019-02 to 2025-09: {len(owed_payments)} months')
    owed_total = sum(float(member['paymentsDues'][key]) for key in owed_payments)
    print(f'Total owed payments: ${owed_total}')

    # Check future payments
    future_payments = [key for key in member['paymentsDues'].keys() if key > '2025-09']
    print(f'Future payments: {future_payments}')
    future_total = sum(float(member['paymentsDues'][key]) for key in future_payments)
    print(f'Future total: ${future_total}')

if __name__ == '__main__':
    main()


