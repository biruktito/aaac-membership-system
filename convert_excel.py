#!/usr/bin/env python3
import pandas as pd
import sys

def convert_excel_to_csv():
    try:
        # Read the Excel file
        excel_file = 'AAAIC Book.xlsx'
        
        # List of sheets to extract (years)
        sheets = ['2022', '2023', '2024', '2025', '2026']
        
        for sheet_name in sheets:
            try:
                print(f'Converting {sheet_name}...')
                # Read the sheet
                df = pd.read_excel(excel_file, sheet_name=sheet_name)
                
                # Save as CSV
                csv_filename = f'AAAC_{sheet_name}.csv'
                df.to_csv(csv_filename, index=False)
                print(f'Successfully converted {sheet_name} to {csv_filename}')
                
            except Exception as e:
                print(f'Error converting {sheet_name}: {e}')
                
    except Exception as e:
        print(f'Error reading Excel file: {e}')
        sys.exit(1)

if __name__ == "__main__":
    convert_excel_to_csv()


