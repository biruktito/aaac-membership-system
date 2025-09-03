
# የአዲስ አበባ ማሕበር በቺካጎ የአባልነት ገጽ - Accountant Instructions

ክፍያን እንዲሁም አባልነት ቁጥርን ማረጋገጫ

## File Structure
- Member_ID: Unique identifier for each member
- Name: Member's full name
- Phone: Contact number (for SMS receipts and reminders)
- Status: Active, Inactive, Removed, Risk_of_Removal
- First_Payment_Year: Year member first started paying
- Registration_Fee_Paid: Total registration fees paid
- Registration_Fee_Amount: Standard registration fee amount
- Last_Payment_Date: Most recent payment date
- Notes: Any special notes about the member

## Monthly Payments
- Columns: 2022_JAN, 2022_FEB, etc.
- Enter payment amounts (typically $15)
- Leave as 0 if no payment made

## Incidentals
- Columns: 2022_Incidentals, 2022_Incidental_Notes, etc.
- Enter total incidental amount for the year
- Add notes explaining the incidental (e.g., "Funeral contribution")

## Status Updates
- Active: Current paying member (paid within 36 months)
- Inactive: No payments for 36+ months
- Risk_of_Removal: Over 2 years behind
- Removed: Officially removed from membership

## Monthly Process
1. Open the CSV file
2. Add new monthly payments in appropriate columns
3. Add any incidentals with notes
4. Update member statuses as needed
5. Save the file
6. Upload to the system via admin interface

## SMS Receipt System
- System automatically sends Amharic receipts to members who have paid ahead
- System automatically sends Amharic payment reminders to members who owe money
- Receipts include: member name, balance, date, and payment method
- No API costs - uses free email-to-SMS service

## Important Notes
- Keep phone numbers for SMS receipts and reminders
- Registration fees: $100 for pre-2023 members, $200 for new members
- Monthly fee: $15 per member
- Incidentals: $10 for funeral contributions, etc.
- Current date: August 2025
- Members with 36+ months of non-payment are automatically marked as inactive

## Authentication
- Admin: `admin` / `admin2025` (full control, upload database)
- Board Member: `board` / `board2025` (view phone numbers, send reminders)
- Member: `aaac` / `members2025` (view only)

## Receipt Messages
### For Members Who Have Paid Ahead:
የአዲስ አበባ ማሕበር በቺካጎ ክፍያ ደረሰኝ
[Member details and balance information]

### For Members Who Owe Money:
የአዲስ አበባ ማሕበር በቺካጎ ክፍያ ማስታወሻ
[Payment reminder with outstanding balance]
