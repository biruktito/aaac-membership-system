#!/usr/bin/env python3
"""
Script to help fix Google Sheet data
This will show you exactly what to copy into your Google Sheet
"""

import csv
import json

def show_correct_data():
    print("🔧 GOOGLE SHEET DATA FIX")
    print("=" * 50)
    
    # Read the real data
    try:
        with open('data/AAAC_Real_Data.csv', 'r', encoding='utf-8') as f:
            reader = csv.reader(f)
            rows = list(reader)
        
        if rows:
            headers = rows[0]
            print(f"✅ Found {len(rows)} rows of data")
            print(f"📋 Headers ({len(headers)} columns):")
            print(", ".join(headers))
            print()
            
            print("📄 FIRST 3 ROWS TO COPY INTO GOOGLE SHEET:")
            print("-" * 50)
            for i, row in enumerate(rows[:3]):
                print(f"Row {i+1}: {','.join(row)}")
            print("-" * 50)
            
            print("\n📋 INSTRUCTIONS:")
            print("1. Open your Google Sheet")
            print("2. Delete all current content")
            print("3. Copy the headers and first 3 rows above")
            print("4. Paste into cell A1")
            print("5. The data should automatically separate into columns")
            
        else:
            print("❌ No data found in AAAC_Real_Data.csv")
            
    except FileNotFoundError:
        print("❌ AAAC_Real_Data.csv not found")
        print("Please make sure the file exists in the data/ folder")

if __name__ == "__main__":
    show_correct_data()
