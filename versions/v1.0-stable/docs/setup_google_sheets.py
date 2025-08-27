#!/usr/bin/env python3
"""
Google Sheets Setup Script for AAAC Membership System
This script will create and populate the Google Sheet with member data.
"""

import json
import csv
import requests
from typing import List, Dict, Any

# Google Sheets API Configuration
SHEET_ID = '1r3SF2Ba1UIEYS28rCX8j2S7BsAsJsWRzw9v4M37-jHw'
API_KEY = 'AIzaSyCLpLGtV9ui3Bm9o-ElkaIMKvk6wQk_Mtc'

def load_csv_data(filename: str) -> List[Dict[str, Any]]:
    """Load data from CSV file"""
    data = []
    with open(filename, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            data.append(row)
    return data

def create_sheet_structure():
    """Create the basic sheet structure"""
    print("🔄 Creating Google Sheet structure...")
    
    # Create Members sheet
    members_url = f"https://sheets.googleapis.com/v4/spreadsheets/{SHEET_ID}/values/Members!A1:ZZ1?valueInputOption=RAW&key={API_KEY}"
    
    # Load CSV data to get headers
    csv_data = load_csv_data('data/AAAC_Demo_Data.csv')
    if not csv_data:
        print("❌ No CSV data found")
        return False
    
    headers = list(csv_data[0].keys())
    
    # Prepare headers data
    headers_data = {
        "values": [headers]
    }
    
    try:
        response = requests.put(members_url, json=headers_data)
        if response.status_code == 200:
            print("✅ Members sheet headers created")
        else:
            print(f"❌ Error creating headers: {response.status_code}")
            print(response.text)
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    
    # Create Payment_Log sheet
    payment_log_url = f"https://sheets.googleapis.com/v4/spreadsheets/{SHEET_ID}/values/Payment_Log!A1:ZZ1?valueInputOption=RAW&key={API_KEY}"
    payment_log_headers = {
        "values": [["Timestamp", "Member_ID", "Member_Name", "Payment_Type", "Amount", "Year", "Month", "Notes", "Recorded_By"]]
    }
    
    try:
        response = requests.put(payment_log_url, json=payment_log_headers)
        if response.status_code == 200:
            print("✅ Payment_Log sheet created")
        else:
            print(f"❌ Error creating Payment_Log: {response.status_code}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Create Settings sheet
    settings_url = f"https://sheets.googleapis.com/v4/spreadsheets/{SHEET_ID}/values/Settings!A1:ZZ1?valueInputOption=RAW&key={API_KEY}"
    settings_data = {
        "values": [
            ["Setting", "Value"],
            ["Monthly_Fee", "15"],
            ["Registration_Fee_New", "200"],
            ["Registration_Fee_Existing", "100"],
            ["Current_Year", "2025"],
            ["Current_Month", "8"],
            ["System_Version", "2.0"],
            ["Last_Updated", ""]
        ]
    }
    
    try:
        response = requests.put(settings_url, json=settings_data)
        if response.status_code == 200:
            print("✅ Settings sheet created")
        else:
            print(f"❌ Error creating Settings: {response.status_code}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    return True

def populate_members_data():
    """Populate the Members sheet with CSV data"""
    print("🔄 Populating Members sheet with data...")
    
    # Load CSV data
    csv_data = load_csv_data('data/AAAC_Demo_Data.csv')
    if not csv_data:
        print("❌ No CSV data found")
        return False
    
    # Convert to values array
    headers = list(csv_data[0].keys())
    values = [headers]  # First row is headers
    
    for row in csv_data:
        values.append([row.get(header, '') for header in headers])
    
    # Prepare data for Google Sheets
    data = {
        "values": values
    }
    
    # Update the sheet
    url = f"https://sheets.googleapis.com/v4/spreadsheets/{SHEET_ID}/values/Members!A1:ZZ{len(values)}?valueInputOption=RAW&key={API_KEY}"
    
    try:
        response = requests.put(url, json=data)
        if response.status_code == 200:
            print(f"✅ Successfully populated {len(csv_data)} members")
            return True
        else:
            print(f"❌ Error populating data: {response.status_code}")
            print(response.text)
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_connection():
    """Test the Google Sheets connection"""
    print("🔄 Testing Google Sheets connection...")
    
    url = f"https://sheets.googleapis.com/v4/spreadsheets/{SHEET_ID}?key={API_KEY}"
    
    try:
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Connection successful!")
            print(f"📊 Sheet Title: {data.get('properties', {}).get('title', 'Unknown')}")
            print(f"📋 Sheets: {[sheet.get('properties', {}).get('title') for sheet in data.get('sheets', [])]}")
            return True
        else:
            print(f"❌ Connection failed: {response.status_code}")
            print(response.text)
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    """Main setup function"""
    print("🚀 AAAC Google Sheets Setup")
    print("=" * 50)
    
    # Test connection first
    if not test_connection():
        print("\n❌ Cannot connect to Google Sheets. Please check:")
        print("1. Sheet ID is correct")
        print("2. API key is valid")
        print("3. Sheet is shared with your account")
        return
    
    # Create sheet structure
    if not create_sheet_structure():
        print("\n❌ Failed to create sheet structure")
        return
    
    # Populate with data
    if not populate_members_data():
        print("\n❌ Failed to populate data")
        return
    
    print("\n🎉 Setup Complete!")
    print("=" * 50)
    print("✅ Google Sheet is ready")
    print("✅ Data is populated")
    print("✅ Integration is configured")
    print("\n🌐 Your live dashboard:")
    print("https://biruktito.github.io/aaac-membership-system/dashboard.html")
    print("\n📊 Your Google Sheet:")
    print(f"https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit")

if __name__ == "__main__":
    main()
