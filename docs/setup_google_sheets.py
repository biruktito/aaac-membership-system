#!/usr/bin/env python3
"""
AAAC Google Sheets Integration Setup Script

This script helps set up Google Sheets integration for the AAAC membership system.
It will create a Google Sheet with our cleaned data and provide instructions for API setup.
"""

import csv
import json
import os
from datetime import datetime

def read_csv_data(filename):
    """Read CSV data and return as list of dictionaries"""
    data = []
    with open(filename, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            data.append(row)
    return data

def create_google_sheets_setup():
    """Create setup instructions and data for Google Sheets"""
    
    print("🔧 AAAC Google Sheets Integration Setup")
    print("=" * 50)
    
    # Read our clean data
    real_data = read_csv_data('data/AAAC_Real_Data.csv')
    demo_data = read_csv_data('data/AAAC_Demo_Data.csv')
    
    print(f"✅ Found {len(real_data)} real members")
    print(f"✅ Found {len(demo_data)} demo members")
    
    # Create setup instructions
    setup_instructions = {
        "title": "AAAC Membership System - Google Sheets Setup",
        "description": "Live database for AAAC membership management",
        "sheets": {
            "Members": {
                "description": "Main member data (100 members)",
                "columns": list(real_data[0].keys()) if real_data else [],
                "data": real_data[:5],  # First 5 rows as example
                "total_rows": len(real_data)
            },
            "Payment_Log": {
                "description": "Audit trail for all payments",
                "columns": ["Date", "Member_ID", "Member_Name", "Payment_Type", "Amount", "Month", "Year", "Notes", "Recorded_By"],
                "data": [
                    {
                        "Date": datetime.now().strftime("%Y-%m-%d"),
                        "Member_ID": "1",
                        "Member_Name": "Habtamu Bekuma Bekana",
                        "Payment_Type": "Monthly",
                        "Amount": "15.00",
                        "Month": "AUG",
                        "Year": "2025",
                        "Notes": "Payment received via Zelle",
                        "Recorded_By": "Accountant"
                    }
                ]
            },
            "Settings": {
                "description": "System configuration",
                "columns": ["Setting", "Value", "Description"],
                "data": [
                    {"Setting": "Current_Date", "Value": "August 2025", "Description": "Current system date"},
                    {"Setting": "Monthly_Fee", "Value": "15.00", "Description": "Monthly membership fee"},
                    {"Setting": "Registration_Fee_New", "Value": "200.00", "Description": "Registration fee for new members"},
                    {"Setting": "Registration_Fee_Pre2023", "Value": "100.00", "Description": "Registration fee for pre-2023 members"},
                    {"Setting": "Auto_Refresh_Interval", "Value": "30", "Description": "Dashboard refresh interval (seconds)"}
                ]
            }
        }
    }
    
    # Save setup data
    with open('google_sheets_setup.json', 'w', encoding='utf-8') as f:
        json.dump(setup_instructions, f, indent=2, ensure_ascii=False)
    
    print("\n📋 Google Sheets Setup Instructions:")
    print("=" * 50)
    print("1. Go to https://sheets.google.com")
    print("2. Create a new Google Sheet")
    print("3. Name it: 'AAAC Membership Database'")
    print("4. Create 3 sheets: 'Members', 'Payment_Log', 'Settings'")
    print("5. Copy the data from google_sheets_setup.json")
    print("6. Share the sheet with your team")
    print("7. Get the Sheet ID from the URL")
    
    print("\n🔑 API Setup Required:")
    print("=" * 50)
    print("1. Go to https://console.developers.google.com")
    print("2. Create a new project")
    print("3. Enable Google Sheets API")
    print("4. Create credentials (Service Account)")
    print("5. Download JSON key file")
    print("6. Share your Google Sheet with the service account email")
    
    print("\n📊 Data Structure:")
    print("=" * 50)
    print(f"Members Sheet: {len(real_data)} rows, {len(real_data[0].keys()) if real_data else 0} columns")
    print("Payment_Log Sheet: Audit trail for all payments")
    print("Settings Sheet: System configuration")
    
    print("\n✅ Setup files created:")
    print("- google_sheets_setup.json (contains all data structure)")
    print("- This script (for future reference)")
    
    return setup_instructions

if __name__ == "__main__":
    create_google_sheets_setup()
