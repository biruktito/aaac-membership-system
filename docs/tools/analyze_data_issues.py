#!/usr/bin/env python3
"""
Analyze AAAC data issues and provide cleaning recommendations.
This script examines the Excel file to identify:
- Date ordering problems
- Registration fees mixed with dues
- Incidental payments
- Data structure issues
"""

import pandas as pd
import sys
from datetime import datetime
import re

def analyze_excel_file(file_path):
    """Analyze the Excel file for data issues."""
    print("=== AAAC Data Analysis ===")
    print(f"Analyzing file: {file_path}")
    print()
    
    try:
        # Read the Excel file
        df = pd.read_excel(file_path)
        print(f"Total rows: {len(df)}")
        print(f"Columns: {list(df.columns)}")
        print()
        
        # Find payment columns (year_month format)
        payment_cols = []
        for col in df.columns:
            if re.match(r'^\d{4}_\w{3}$', str(col)):
                payment_cols.append(col)
        
        print(f"Found {len(payment_cols)} payment columns")
        print("Payment columns:", sorted(payment_cols))
        print()
        
        # Analyze date ordering
        print("=== Date Ordering Analysis ===")
        years = []
        for col in payment_cols:
            year = int(col.split('_')[0])
            years.append(year)
        
        years = sorted(set(years))
        print(f"Years found: {years}")
        
        # Check for gaps and ordering issues
        expected_years = list(range(min(years), max(years) + 1))
        missing_years = set(expected_years) - set(years)
        if missing_years:
            print(f"Missing years: {sorted(missing_years)}")
        
        print()
        
        # Analyze payment amounts
        print("=== Payment Amount Analysis ===")
        amount_stats = {}
        for col in payment_cols:
            amounts = df[col].dropna()
            amounts = pd.to_numeric(amounts, errors='coerce').dropna()
            if len(amounts) > 0:
                amount_stats[col] = {
                    'count': len(amounts),
                    'min': amounts.min(),
                    'max': amounts.max(),
                    'mean': amounts.mean(),
                    'unique_values': sorted(amounts.unique())
                }
        
        # Identify potential registration fees and incidentals
        print("Potential registration fees ($100, $200):")
        for col, stats in amount_stats.items():
            if 100 in stats['unique_values'] or 200 in stats['unique_values']:
                print(f"  {col}: {[v for v in stats['unique_values'] if v in [100, 200]]}")
        
        print("\nPotential incidentals (unusual amounts):")
        for col, stats in amount_stats.items():
            unusual = [v for v in stats['unique_values'] if v not in [0, 15, 30, 45, 60, 75, 90, 100, 200]]
            if unusual:
                print(f"  {col}: {unusual}")
        
        print()
        
        # Analyze member data
        print("=== Member Data Analysis ===")
        if 'Member_ID' in df.columns:
            print(f"Unique members: {df['Member_ID'].nunique()}")
            print(f"Members with missing ID: {df['Member_ID'].isna().sum()}")
        
        if 'Name' in df.columns:
            print(f"Unique names: {df['Name'].nunique()}")
            print(f"Names with missing values: {df['Name'].isna().sum()}")
        
        if 'First_Payment_Year' in df.columns:
            first_payment_years = df['First_Payment_Year'].dropna().unique()
            print(f"First payment years: {sorted(first_payment_years)}")
        
        print()
        
        # Recommendations
        print("=== Recommendations ===")
        print("1. Separate payment types:")
        print("   - Dues: $15/month payments")
        print("   - Registration: $100 (old) or $200 (new) one-time")
        print("   - Incidentals: Everything else")
        
        print("\n2. Reset timeline to September 2025:")
        print("   - Calculate dues from Sep 2025 forward")
        print("   - Ignore historical payment data")
        print("   - Mark all existing members as having paid registration")
        
        print("\n3. Data structure:")
        print("   - paymentsDues: { '2025-09': 15, '2025-10': 15, ... }")
        print("   - joiningFeeAmount: 200 (for new members) or 100 (for old)")
        print("   - paymentsIncidentals: { '2025-09': 50, ... } (optional)")
        
        return df, payment_cols, amount_stats
        
    except Exception as e:
        print(f"Error analyzing file: {e}")
        return None, None, None

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 analyze_data_issues.py <path_to_excel_file>")
        sys.exit(1)
    
    file_path = sys.argv[1]
    df, payment_cols, amount_stats = analyze_excel_file(file_path)
    
    if df is not None:
        print("\n=== Sample Data ===")
        print(df.head())
        
        print("\n=== Payment Column Sample ===")
        if payment_cols:
            sample_cols = payment_cols[:5]  # First 5 payment columns
            print(df[['Member_ID', 'Name'] + sample_cols].head())

if __name__ == "__main__":
    main()
