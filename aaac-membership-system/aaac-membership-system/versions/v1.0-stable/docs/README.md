# የአዲስ አበባ ማሕበር በቺካጎ የአባልነት ገጽ

ክፍያን እንዲሁም አባልነት ቁጥርን ማረጋገጫ

A comprehensive, live payment tracking system for AAAC (Addis Ababa Association in Chicago) members. This system tracks monthly payments of $15 per member across multiple years, with an initial registration fee of $200 for new members and $100 for existing members.

## 🚀 **Live System**

**Access the system:** https://biruktito.github.io/aaac-membership-system/

## ✨ **Key Features**

### **🔐 Multi-Tier Authentication System**
- **Member Login**: Personalized view with member ID authentication
- **Board Access**: Enhanced member management and communication tools
- **Admin Access**: Full system control and member management
- **Demo Access**: Safe demonstration environment

### **👤 Personalized Member Experience**
- **Member ID Authentication**: Secure login with unique member ID
- **Personal Dashboard**: Members see only their own information
- **Privacy Protection**: Total owed amounts hidden from regular members
- **Event Notifications**: Upcoming meetings and payment due dates

### **📊 Advanced Payment Tracking**
- **Multi-Year Support**: Track payments from 2022-2026
- **Real-time Balance Calculation**: Automatic status updates
- **Payment Recording**: Easy payment entry for accountants
- **Amharic Communication**: Receipts and reminders in Amharic

### **🎯 Role-Based Access Control**
- **Members**: Personal view only, no admin functions
- **Board Members**: Member management and communication tools
- **Admins**: Full system access and member management
- **Conditional UI**: Features show/hide based on user role

### **📅 Event Management**
- **Add Events**: Board/Admin can add upcoming events
- **Member Notifications**: Events displayed to members
- **Payment Reminders**: Automatic payment due date notifications

## 💰 **Payment Structure**

- **Monthly Fee**: $15 per member
- **Initial Registration**: $200 (new members 2023+), $100 (existing members pre-2023)
- **Payment Method**: Zelle to aaaichicago@gmail.com
- **Multi-Year Support**: Track payments from 2022-2026
- **Incidentals**: Additional fees for special events

## 🔐 **Authentication & Access**

### **Login Credentials**

| Role | Username | Password | Member ID Required |
|------|----------|----------|-------------------|
| **Demo** | `demo` | `demo2025` | No |
| **Member** | `aaacuser` | `members2025` | **Yes** |
| **Board** | `board` | `board2025` | No |
| **Admin** | `admin` | `admin2025` | No |

### **Member ID Authentication**
- **Members must provide their unique ID** (e.g., 24 for Biruk Tito Eyesus)
- **Personalized experience** - members see only their own information
- **Privacy protection** - total owed amounts hidden from regular members

## 📱 **User Experience by Role**

### **👤 Regular Member Experience**
```
✅ Total Members: 61 (context only)
✅ Personal membership information
✅ Upcoming events and meetings
✅ Payment status and balance
❌ No search/filter options
❌ No admin actions
❌ No total owed amount (privacy)
```

### **👥 Board Member Experience**
```
✅ Full member list with search/filter
✅ Member management tools
✅ Event management (add events)
✅ Payment tracking and reminders
✅ Member communication tools
✅ Complete statistics
```

### **👨‍💼 Admin/Accountant Experience**
```
✅ All board member features
✅ Add new members
✅ Export data functionality
✅ Full system control
✅ Payment recording tools
✅ Member management
```

## 🎯 **Member Status Categories**

### **Status Logic (Based on Months Behind)**
- **✅ Current**: 0-3 months behind (or paid ahead)
- **❌ Risk**: 3-12 months behind
- **⚠️ Issues**: 12-24 months behind
- **🚨 Risk of Removal**: 24+ months behind
- **🚫 Inactive**: No payments for 36+ months

### **Balance Display**
- **🟢 Positive (Green)**: Member has paid ahead (credit)
- **🔴 Negative (Red)**: Member owes money
- **⚪ Zero**: Member is up to date

## 🛠️ **System Features**

### **📊 Dashboard Statistics**
- **Total Members**: Count of active members (excludes inactive)
- **Status Breakdown**: Current, Risk, Issues, Risk of Removal counts
- **Total Owed**: Sum of negative balances from active members only
- **Inactive Members**: Only visible to Board/Admin users

### **🔍 Search & Filter**
- **Multi-field Search**: Name, phone number, or member ID
- **Status Filtering**: Filter by payment status
- **Clear Search**: Reset to show all members
- **Role-based Access**: Search hidden for regular members

### **📝 Payment Recording**
- **Manual Entry**: Year, month, amount, notes
- **Payment Types**: Monthly fees, registration, incidentals
- **Auto-calculation**: Balance updates automatically
- **Payment History**: Track all payment records

### **📱 Communication Tools**
- **Amharic Messages**: Receipts and reminders in Amharic
- **Clipboard Copy**: Easy message sharing
- **Multi-platform**: Works with Telegram, WhatsApp, SMS, Email
- **Smart Detection**: Auto-detects if member owes money or has credit

### **📅 Event Management**
- **Add Events**: Date, title, description
- **Member Display**: Events shown to members
- **Payment Reminders**: Automatic due date notifications
- **Persistent Storage**: Events saved in session storage

## 🚀 **Quick Start Guide**

### **For Members**
1. **Go to**: https://biruktito.github.io/aaac-membership-system/
2. **Login**: Username `aaacuser`, Password `members2025`
3. **Enter Member ID**: Your assigned member ID (e.g., 24)
4. **View Information**: See your personal membership status
5. **Check Events**: View upcoming meetings and payment due dates

### **For Accountants/Admins**
1. **Login**: Username `admin`, Password `admin2025`
2. **Record Payments**: Click "Record Payment" on any member
3. **Add Members**: Use "Add New Member" for new registrations
4. **Add Events**: Use "Add Event" for upcoming meetings
5. **Export Data**: Use "Export Data" for backups

### **For Board Members**
1. **Login**: Username `board`, Password `board2025`
2. **View Members**: See all member information
3. **Send Reminders**: Use "Copy Message" for communication
4. **Manage Events**: Add upcoming events for members
5. **Track Payments**: Monitor member payment status

## 📊 **Data Structure**

The system uses a standardized CSV database format with Google Sheets integration:

| Column | Description |
|--------|-------------|
| Member_ID | Unique identifier |
| Name | Member's full name |
| Phone | Contact number |
| Status | Active/Inactive status |
| First_Payment_Year | Year of first payment |
| Registration_Fee | Initial registration fee |
| 2022_JAN to 2022_DEC | 2022 monthly payments |
| 2023_JAN to 2023_DEC | 2023 monthly payments |
| 2024_JAN to 2024_DEC | 2024 monthly payments |
| 2025_JAN to 2025_DEC | 2025 monthly payments |
| 2026_JAN to 2026_DEC | 2026 monthly payments |
| Incidentals | Additional fees |

## 🔄 **Google Sheets Integration**

### **Real-time Data Sync**
- **Live Updates**: Changes reflect immediately
- **Backup System**: Local CSV fallback if Google Sheets unavailable
- **Data Persistence**: All changes saved to Google Sheets
- **Multi-user Access**: Multiple users can access simultaneously

### **Payment Recording**
- **Direct Integration**: Payments recorded directly to Google Sheets
- **Audit Trail**: Complete payment history maintained
- **Data Validation**: Ensures data integrity
- **Error Handling**: Graceful fallback to local storage

## 📱 **Amharic Communication Messages**

### **Receipt Message (For Members with Credit)**
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

### **Payment Reminder (For Members Who Owe)**
```
የአዲስ አበባ ማሕበር በቺካጎ ክፍያ ማስታወሻ

ውድ [Member Name]

የአዲስ አበባ ማሕበር በቺካጎ  አባልነትዎ ቀሪ ሂሳብ $[amount] ነው።

ክፍያውን በ Zelle  ለመላክ: aaaichicago@gmail.com ይጠቀሙና ሒሳቦትን ይከፍሉ ዘንድ በትሕትና እንጠይቃለን።

ከምስጋና ጋር
የአዲስ አበባ ማሕበር በቺካጎ ቦርድ
```

## 🔧 **Technical Architecture**

### **Frontend Technologies**
- **HTML5**: Semantic markup and structure
- **CSS3**: Modern styling with gradients and animations
- **JavaScript (ES6+)**: Dynamic functionality and data processing
- **Responsive Design**: Works on desktop, tablet, and mobile

### **Data Management**
- **Google Sheets API**: Primary data storage and real-time sync
- **Local CSV Fallback**: Backup data source
- **Session Storage**: Temporary data and user preferences
- **Data Validation**: Ensures data integrity

### **Security Features**
- **Role-based Access Control**: Different permissions per user type
- **Session Management**: Secure authentication handling
- **Data Privacy**: Sensitive information hidden from unauthorized users
- **Input Validation**: Prevents malicious data entry

## 🚨 **Troubleshooting**

### **Common Issues**

1. **"Member not found" error**
   - Check that member ID is correct
   - Verify member exists in the database
   - Contact administrator for assistance

2. **Payment not recording**
   - Ensure you're logged in as admin/board
   - Check that all required fields are filled
   - Verify payment amount is a valid number

3. **Balance calculation seems wrong**
   - Check current date settings (August 2025)
   - Verify all previous payments are recorded
   - Contact administrator for data review

4. **Events not showing**
   - Events are stored in session storage
   - Refresh page to reload events
   - Check that events were added by admin/board

5. **Search not working**
   - Try different search terms (name, phone, ID)
   - Use "Clear" button to reset search
   - Check that you have appropriate permissions

### **Data Backup**
- **Export data regularly** using the "Export Data" function
- **Google Sheets backup** - data automatically saved
- **Local CSV backup** - keep copies of important data
- **Session storage** - events and temporary data

## 💰 **Cost Analysis**

### **Current Implementation**
- **GitHub Pages Hosting**: Free
- **Google Sheets**: Free (up to 10 million cells)
- **Domain**: Free (GitHub Pages subdomain)
- **SMS/Communication**: Free (clipboard copy method)
- **Total Cost**: $0

### **Alternative Solutions**
- **Custom Web App**: $50-500/month hosting
- **Database Solution**: $20-100/month
- **SaaS Platform**: $10-50/month per user
- **SMS API**: $0.01-0.10 per message

## 🔮 **Future Enhancements**

### **Planned Features**
1. **Zelle API Integration**: Direct payment processing
2. **Automated Reminders**: Scheduled payment reminders
3. **Advanced Reporting**: Analytics and insights
4. **Mobile App**: Native mobile application
5. **Email Integration**: Direct email communication
6. **Payment Plans**: Support for different schedules
7. **Multi-language Support**: Additional languages
8. **Advanced Security**: Two-factor authentication
9. **Data Analytics**: Payment trends and insights
10. **Integration APIs**: Connect with other systems

### **Technical Improvements**
1. **Database Migration**: Move to proper database system
2. **API Development**: RESTful API for external integrations
3. **Real-time Notifications**: Push notifications for updates
4. **Advanced Search**: Full-text search capabilities
5. **Data Export**: Multiple format support (PDF, Excel)

## 📞 **Support & Contact**

### **For Technical Support**
1. **Check this documentation** first
2. **Review troubleshooting section**
3. **Contact system administrator**
4. **Check GitHub issues** for known problems

### **For User Support**
1. **Member Issues**: Contact board members
2. **Payment Questions**: Contact accountant/admin
3. **System Access**: Contact administrator
4. **Data Corrections**: Contact administrator

## 📄 **Files & Structure**

### **Core Files**
- `dashboard.html` - Main application interface
- `login.html` - Authentication page
- `google_sheets_integration.js` - Google Sheets API integration
- `complete_data_for_google_sheet.csv` - Local data backup

### **Documentation**
- `README.md` - This comprehensive guide
- `SECURITY_GUIDE.md` - Security best practices
- `DEPLOYMENT_GUIDE.md` - Deployment instructions

### **Data Files**
- `AAAC_Membership_Status_YYYY.csv` - Exported data files
- Google Sheets - Primary data storage

## 📜 **License & Compliance**

This system is designed specifically for AAAC use. Please ensure compliance with:
- **Data Protection**: Member privacy and data security
- **Financial Regulations**: Payment tracking and reporting
- **Organization Policies**: AAAC-specific rules and procedures
- **Technical Standards**: Web security and accessibility

---

**Last Updated**: March 2025  
**Version**: 2.0  
**System Status**: Live and Operational  
**Access URL**: https://biruktito.github.io/aaac-membership-system/
