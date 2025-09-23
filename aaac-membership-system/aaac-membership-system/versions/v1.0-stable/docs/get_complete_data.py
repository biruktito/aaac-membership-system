#!/usr/bin/env python3
"""
Script to get complete CSV data for Google Sheet
This will output ALL rows that need to be copied
"""

import csv

def get_complete_data():
    print("📋 COMPLETE DATA FOR GOOGLE SHEET")
    print("=" * 60)
    print("Copy everything below this line:")
    print("-" * 60)
    
    try:
        with open('data/AAAC_Real_Data.csv', 'r', encoding='utf-8') as f:
            reader = csv.reader(f)
            for row in reader:
                print(','.join(row))
        
        print("-" * 60)
        print("✅ End of data - Copy everything above this line")
        print()
        print("📋 INSTRUCTIONS:")
        print("1. Select and copy ALL the data above (from the first line to 'End of data')")
        print("2. Open your Google Sheet")
        print("3. Click on the 'Members' tab")
        print("4. Select all (Ctrl+A) and delete current content")
        print("5. Click cell A1 and paste")
        print("6. Data should automatically separate into 79 columns")
        
    except FileNotFoundError:
        print("❌ AAAC_Real_Data.csv not found")

if __name__ == "__main__":
    get_complete_data()
