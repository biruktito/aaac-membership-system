#!/usr/bin/env python3
"""
Bulk-create Firebase Auth users by phone number and assign roles/memberId.

Usage:
  python3 tools/bulk_import_by_phone.py \
    --project=<PROJECT_ID> \
    --serviceAccount=/absolute/path/to/serviceAccount.json \
    --csv=/absolute/path/to/members.csv

CSV format (header required):
  phone,memberId,displayName
Example:
  +17734941942,1,HABTAMU BAKANA
"""

import argparse
import csv
import json
import os
import sys

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--project', required=True)
    ap.add_argument('--serviceAccount', required=True)
    ap.add_argument('--csv', required=True)
    args = ap.parse_args()

    # Import Firebase Admin SDK
    try:
        import firebase_admin
        from firebase_admin import credentials, auth, firestore
    except ImportError:
        print('Error: firebase-admin not installed. Run: pip install firebase-admin')
        sys.exit(1)

    # Initialize Firebase Admin
    try:
        cred = credentials.Certificate(args.serviceAccount)
        app = firebase_admin.initialize_app(cred, {'projectId': args.project})
        auth_client = auth
        db = firestore.client()
    except Exception as e:
        print(f'Error initializing Firebase: {e}')
        sys.exit(1)

    created = 0
    linked = 0
    errors = 0

    with open(args.csv, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            phone = row['phone'].strip()
            member_id = row['memberId'].strip()
            display_name = row.get('displayName', '').strip()
            
            if not phone or not member_id:
                continue
                
            try:
                # Try to get existing user by phone
                try:
                    user_record = auth_client.get_user_by_phone_number(phone)
                except auth.UserNotFoundError:
                    user_record = None
                
                # Create user if doesn't exist
                if not user_record:
                    user_record = auth_client.create_user(
                        phone_number=phone,
                        display_name=display_name or None,
                        disabled=False
                    )
                    created += 1
                
                # Set role document
                db.collection('roles').document(user_record.uid).set({
                    'role': 'member',
                    'memberId': member_id
                }, merge=True)
                linked += 1
                print(f'[OK] {phone} → uid={user_record.uid} role=member memberId={member_id}')
                
            except Exception as e:
                errors += 1
                print(f'[ERR] {phone} → {e}')

    print(f'\nDone. created={created}, linked={linked}, errors={errors}')
    sys.exit(1 if errors > 0 else 0)

if __name__ == '__main__':
    main()

