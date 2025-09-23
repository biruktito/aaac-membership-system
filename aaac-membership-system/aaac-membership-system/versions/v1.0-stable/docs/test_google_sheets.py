#!/usr/bin/env python3
"""
Test Google Sheets Integration for AAAC Membership System
"""

import requests

# Configuration
SHEET_ID = '1r3SF2Ba1UIEYS28rCX8j2S7BsAsJsWRzw9v4M37-jHw'
API_KEY = 'AIzaSyCLpLGtV9ui3Bm9o-ElkaIMKvk6wQk_Mtc'

def test_connection():
    """Test if we can connect to the Google Sheet"""
    print("🔄 Testing Google Sheets connection...")
    
    url = f"https://sheets.googleapis.com/v4/spreadsheets/{SHEET_ID}?key={API_KEY}"
    
    try:
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Connection successful!")
            print(f"📊 Sheet Title: {data.get('properties', {}).get('title', 'Unknown')}")
            print(f"📋 Available Sheets: {[sheet.get('properties', {}).get('title') for sheet in data.get('sheets', [])]}")
            return True
        else:
            print(f"❌ Connection failed: {response.status_code}")
            print(f"Error: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_read_data():
    """Test reading data from the Members sheet"""
    print("\n🔄 Testing data reading...")
    
    url = f"https://sheets.googleapis.com/v4/spreadsheets/{SHEET_ID}/values/Members!A1:Z10?key={API_KEY}"
    
    try:
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            values = data.get('values', [])
            if values:
                print(f"✅ Data reading successful!")
                print(f"📊 Found {len(values)} rows")
                print(f"📋 Headers: {values[0] if values else 'None'}")
                if len(values) > 1:
                    print(f"📋 Sample data: {values[1][:5]}...")  # First 5 columns of first data row
                return True
            else:
                print("⚠️ No data found in sheet")
                return False
        else:
            print(f"❌ Data reading failed: {response.status_code}")
            print(f"Error: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    """Main test function"""
    print("🧪 AAAC Google Sheets Integration Test")
    print("=" * 50)
    
    # Test connection
    if not test_connection():
        print("\n❌ Cannot connect to Google Sheets")
        print("Please check:")
        print("1. Sheet ID is correct")
        print("2. API key is valid")
        print("3. Sheet exists and is accessible")
        return
    
    # Test data reading
    if not test_read_data():
        print("\n❌ Cannot read data from Google Sheets")
        print("Please check:")
        print("1. Sheet has a 'Members' tab")
        print("2. Sheet contains data")
        print("3. Sheet is properly formatted")
        return
    
    print("\n🎉 All tests passed!")
    print("=" * 50)
    print("✅ Google Sheets integration is working")
    print("✅ Data can be read successfully")
    print("✅ Dashboard should work with Google Sheets")
    print("\n🌐 Test your dashboard:")
    print("https://biruktito.github.io/aaac-membership-system/dashboard.html")

if __name__ == "__main__":
    main()
