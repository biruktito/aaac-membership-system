# የአዲስ አበባ ማሕበር በቺካጎ የአባልነት ገጽ

ክፍያን እንዲሁም አባልነት ቁጥርን ማረጋገጫ

A comprehensive, live payment tracking system for AAAC (Addis Ababa Association in Chicago) members. This system tracks monthly payments of $15 per member across multiple years, with an initial registration fee of $200 for new members and $100 for existing members.

## Features

- **Multi-Year Payment Tracking**: Track payments across 2022, 2023, 2024, 2025, and 2026
- **Advanced Balance Calculation**: Shows exactly what month each member is paid up to
- **Real-time Payment Tracking**: Track monthly payments for each member
- **Detailed Balance Analysis**: Automatically calculate outstanding balances with year-by-year breakdown
- **Enhanced Search Functionality**: Search members by name, phone number, or member ID
- **Payment Recording**: Record payments with year/month selection and notes
- **Member Management**: Add new members with initial payments
- **Amharic SMS Receipts**: Generate receipt messages in Amharic for payments received
- **Payment Reminders**: Generate reminder messages for outstanding balances in Amharic
- **Member Details View**: Comprehensive view of payment history across all years
- **Data Export**: Export data to CSV format
- **Mobile Responsive**: Works on desktop and mobile devices
- **Three-Tier Access Control**: Member, Board Member, and Admin roles
- **Free SMS Delivery**: Send receipts and reminders via email-to-SMS (no API costs)

## Payment Structure

- **Monthly Fee**: $15 per member
- **Initial Registration**: $200 (new members 2023+), $100 (existing members pre-2023)
- **Payment Method**: Zelle to aaaichicago@gmail.com
- **Multi-Year Support**: Track payments from 2022-2026
- **Incidentals**: Additional fees for special events (e.g., $10 for funeral contributions)

## Enhanced Balance Features

### What You'll See for Each Member:

1. **Paid Up To**: Shows exactly what month/year the member is paid up to
   - Example: "AUG 2025" means they're paid through August 2025
   - Example: "Not Started" means no payments recorded

2. **Current Balance**: 
   - **Positive (Green)**: Member has paid ahead (credit)
   - **Negative (Red)**: Member owes money
   - **Zero**: Member is up to date

3. **Payment Status**:
   - ✅ **Current**: Member is up to date or paid ahead (0-3 months behind)
   - ❌ **Risk**: Member owes 3-12 months
   - ⚠️ **Issues**: Member owes 1-2 years
   - 🚨 **Risk of Removal**: Member owes 2+ years
   - 🚫 **Inactive**: No payments for 36+ months

4. **Total Owed**: Shows the total amount owed by all members who have outstanding balances

### Balance Calculation Logic:

- **Previous Years**: All unpaid months from first payment date to current month are included
- **Current Year**: Only months up to current date are calculated
- **Future Years**: Not included in balance calculation
- **Registration Fee**: Counted as initial payment
- **Incidentals**: Added to total paid amount

## Setup Instructions

### Local Development Server

1. **Install Python** (if not already installed)
2. **Navigate to project directory**:
   ```bash
   cd /path/to/aaac-system
   ```
3. **Start local server**:
   ```bash
   python3 -m http.server 8000
   ```
4. **Open browser** and go to: `http://localhost:8000/index.html`

### Authentication

The system uses a four-tier authentication system with role-based data access:

- **Demo Access**: `demo` / `demo2025` (demo data only - for demonstrations)
- **Member Access**: `aaacuser` / `members2025` (view only, real data)
- **Board Member Access**: `board` / `board2025` (view phone numbers, send reminders, real data)
- **Admin Access**: `admin` / `admin2025` (full control, upload database, real data)

**Data Access:**
- **Demo users** see demo data only
- **Authenticated users** (admin/board/aaacuser) see real member data
- **Real data is pre-loaded** and secure on GitHub Pages

## Usage Guide

### For Administrators

#### Uploading Database
1. Login as admin (`admin` / `admin2025`)
2. Use the upload section to load the latest CSV database
3. The system will automatically process and display member data

#### Recording Payments
1. Find the member in the list (use search if needed)
2. Click "Record Payment" button next to their name
3. Select the payment year, month, and type
4. Enter the payment amount
5. Add optional notes
6. Click "Record Payment"

#### Sending Receipts
1. For members who have paid ahead, click "Send Email Reminder"
2. The system will generate an Amharic receipt message
3. Gmail will open with the pre-filled message
4. The message will be sent as SMS to the member's phone

#### Sending Payment Reminders
1. For members who owe money, click "Send Email Reminder"
2. The system will generate an Amharic payment reminder
3. Gmail will open with the pre-filled message
4. The message will be sent as SMS to the member's phone

### For Board Members

#### Viewing Member Information
1. Login as board member (`board` / `board2025`)
2. View member phone numbers (hidden from regular members)
3. Send receipts and reminders to members
4. Copy phone numbers for manual contact

#### Sending Reminders
1. Click "Send Email Reminder" on any member
2. System automatically detects if member owes money or has credit
3. Generates appropriate Amharic message
4. Opens Gmail with pre-filled SMS message

### For Members

Members can view their payment status by:
1. Login as member (`aaacuser` / `members2025`)
2. Search for their name, phone number, or member ID
3. Check their balance (green = positive, red = negative)
4. See which month they're paid up to
5. View detailed payment history across all years

## Search Functionality

The system supports multiple search methods:
- **By Name**: Partial name matching (case-insensitive)
- **By Phone Number**: Exact or partial phone number
- **By Member ID**: Exact member ID number

## Data Structure

The system uses a standardized CSV database format:

| Column | Description |
|--------|-------------|
| ID | Unique identifier |
| NAME | Member's full name |
| PHONE | Contact number |
| REGISTRATION_FEE | Initial registration fee |
| FIRST_PAYMENT_YEAR | Year of first payment |
| FIRST_PAYMENT_MONTH | Month of first payment |
| 2022_JAN to 2022_DEC | 2022 monthly payments |
| 2023_JAN to 2023_DEC | 2023 monthly payments |
| 2024_JAN to 2024_DEC | 2024 monthly payments |
| 2025_JAN to 2025_DEC | 2025 monthly payments |
| 2026_JAN to 2026_DEC | 2026 monthly payments |
| INCIDENTALS | Additional fees |

## Amharic Receipt Messages

### For Members Who Have Paid Ahead:
```
የአዲስ አበባ ማሕበር በቺካጎ ክፍያ ደረሰኝ

ውድ [Member Name]

የአዲስ አበባ ማሕበር በቺካጎ አባልነትዎ ክፍያ በመፈጸምዎ አመሰግናለሁ።

የአባልነትዎ ሂሳብ የተሟላ ነው። የቀሪ ሂሳብዎ $[balance] ነው።

📋 የክፍያ ደረሰኝ:
• አባል: [Member Name]
• የቀሪ ሂሳብ: $[balance]
• ቀን: [Current Date]
• የክፍያ ዘዴ: Zelle (aaaichicago@gmail.com)

ከምስጋና ጋር
የአዲስ አበባ ማሕበር በቺካጎ ቦርድ
```

### For Members Who Owe Money:
```
የአዲስ አበባ ማሕበር በቺካጎ ክፍያ ማስታወሻ

ውድ [Member Name]

የአዲስ አበባ ማሕበር በቺካጎ  አባልነትዎ ቀሪ ሂሳብ $[amount] ነው።

ክፍያውን በ Zelle  ለመላክ: aaaichicago@gmail.com ይጠቀሙና ሒሳቦትን ይከፍሉ ዘንድ በትሕትና እንጠይቃለን።

ከምስጋና ጋር
የአዲስ አበባ ማሕበር በቺካጎ ቦርድ
```

## Balance Calculation Examples

### Example 1: Member Paid Up to Date
- **Member**: John Doe
- **Registration**: $200 (paid)
- **2025 Payments**: Jan-Aug ($120 total)
- **Current Date**: August 2025
- **Result**: 
  - Paid Up To: "AUG 2025"
  - Current Balance: $0
  - Status: ✅ Current

### Example 2: Member Behind on Payments
- **Member**: Jane Smith
- **Registration**: $200 (paid)
- **2024 Payments**: None
- **2025 Payments**: Jan-Mar ($45 total)
- **Current Date**: August 2025
- **Result**:
  - Paid Up To: "MAR 2025"
  - Current Balance: -$75 (owes 5 months)
  - Status: ❌ Risk

### Example 3: Member Paid Ahead
- **Member**: Bob Johnson
- **Registration**: $200 (paid)
- **2025 Payments**: Jan-Dec ($180 total)
- **Current Date**: August 2025
- **Result**:
  - Paid Up To: "DEC 2025"
  - Current Balance: $60 (paid ahead)
  - Status: ✅ Current

## Troubleshooting

### Common Issues

1. **"Member not found" error**
   - Check that member names match exactly (case-sensitive)
   - Use the search function to find the correct name
   - Try searching by phone number or member ID

2. **Payment not recording**
   - Check that the payment year and month are selected
   - Verify the payment amount is a valid number
   - Ensure you're logged in as admin

3. **Balance calculation seems wrong**
   - Check that the current date is correct (August 2025)
   - Verify all previous year payments are recorded
   - Use "View Details" to see payment breakdown

4. **Amharic text not displaying correctly**
   - Ensure browser supports UTF-8 encoding
   - Check that the page is loaded with proper charset

5. **SMS not sending**
   - Verify the phone number format is correct
   - Check that Gmail opens with the pre-filled message
   - The system uses email-to-SMS (phone@txt.att.net format)

### Data Backup

- Export data regularly using the "Export Data" function
- Keep backups of your CSV database
- Consider setting up automatic backups

## Cost Analysis

### Current Implementation
- **Local Server**: Free (Python built-in)
- **SMS Delivery**: Free (email-to-SMS via Gmail)
- **Hosting**: Free (local development)
- **Total Cost**: $0

### Alternative Solutions
- **Custom Web App**: $50-500/month hosting
- **Database Solution**: $20-100/month
- **SaaS Platform**: $10-50/month per user
- **SMS API**: $0.01-0.10 per message

## Future Enhancements

1. **Web Hosting**: Deploy to a web server for remote access
2. **Database Integration**: Connect to a proper database system
3. **Payment Gateway**: Direct payment processing
4. **Reporting**: Advanced analytics and reporting
5. **Mobile App**: Native mobile application
6. **Multi-year Support**: Track payments across additional years
7. **Payment Plans**: Support for different payment schedules
8. **Automatic Reminders**: Scheduled reminder system
9. **Email Integration**: Send receipts and reminders via email
10. **Multi-language Support**: Support for additional languages

## Support

For technical support or questions:
1. Check this documentation first
2. Review the troubleshooting section
3. Contact your system administrator

## License

This system is designed specifically for AAAC use. Please ensure compliance with your organization's data protection policies.

## Files

- `aaac_membership_system.html` - Main application interface
- `login.html` - Authentication page
- `index.html` - Entry point redirect
- `AAAC_Accountant_Database_YYYYMMDD.csv` - Main database file
- `create_accountant_database.py` - Database creation script
- `Accountant_Instructions.txt` - Instructions for accountants
