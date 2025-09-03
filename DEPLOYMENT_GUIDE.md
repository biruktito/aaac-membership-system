# 🚀 AAAC Membership System - Deployment Guide

## 📋 **Quick Start (No Gmail Setup)**

If you just want to run the system without email functionality:

```bash
# 1. Navigate to the new project directory
cd aaac-membership-system

# 2. Start the system
python start.py

# 3. Open your browser to: http://localhost:8000
# 4. Login with: member/member2025, board/board2025, or admin/admin2025
```

## 📧 **Gmail Setup (Optional - For Email Functionality)**

The system uses **OAuth2 authentication** - **NO passwords required!**

### **Step 1: Google Cloud Console Setup**

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create a new project** or select existing project
3. **Enable Gmail API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Gmail API"
   - Click "Enable"
4. **Create OAuth 2.0 credentials**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Desktop application"
   - Download the JSON file

### **Step 2: Run Gmail Setup Script**

```bash
# Install required packages
pip install google-auth google-auth-oauthlib google-auth-httplib2 gmail-api-python-client

# Run Gmail setup
python gmail_setup.py
```

### **Step 3: Follow the Setup Wizard**

The script will:
1. ✅ Create sample configuration files
2. ✅ Open browser for Gmail authentication
3. ✅ Save secure OAuth2 tokens
4. ✅ Create email sending scripts

### **Step 4: Test Email Functionality**

```bash
# Test sending an email
python send_email.py
```

## 🔐 **Security Features**

- **No passwords stored** - Uses OAuth2 tokens
- **Secure authentication** - Google handles security
- **Token refresh** - Automatically renews access
- **Limited scope** - Only sends emails, no other access

## 📱 **Mobile-Friendly Features**

- **Responsive design** - Works on all devices
- **Touch-optimized** - Large buttons and swipe gestures
- **PWA ready** - Can be installed as mobile app
- **Offline capability** - Works without internet

## 🏗️ **Project Structure**

```
aaac-membership-system/
├── 📁 frontend/
│   ├── 📁 pages/           # HTML pages
│   ├── 📁 assets/          # CSS, JS, images
│   └── 📁 components/      # Reusable components
├── 📁 backend/
│   ├── 📁 data/            # CSV databases
│   ├── 📁 config/          # Configuration files
│   └── 📁 scripts/         # Python scripts
├── 📁 docs/                # Documentation
├── 📁 legacy/              # Old files (backup)
├── start.py               # Quick start script
├── gmail_setup.py         # Gmail setup script
└── send_email.py          # Email sending script
```

## 🔧 **Configuration Options**

### **Authentication Credentials**
- **Member**: `member` / `member2025` (view only)
- **Board**: `board` / `board2025` (view + send messages)
- **Admin**: `admin` / `admin2025` (full control)

### **Payment Settings**
- **Monthly Fee**: $15
- **Registration Fee (New)**: $200
- **Registration Fee (Old)**: $100
- **Payment Method**: Zelle to aaaichicago@gmail.com

### **System Settings**
- **Current Date**: August 2025
- **Inactive Threshold**: 36 months
- **Language**: Amharic + English
- **Database**: CSV format

## 🚀 **Deployment Options**

### **Option 1: Local Development**
```bash
cd aaac-membership-system
python start.py
```

### **Option 2: Production Server**
```bash
# Install requirements
pip install -r requirements.txt

# Start with Flask
cd backend
python app.py
```

### **Option 3: Docker (Future)**
```bash
# Build and run with Docker
docker build -t aaac-membership .
docker run -p 8000:8000 aaac-membership
```

## 📊 **Database Management**

### **Backup Database**
```bash
# Create backup
cp backend/data/members.csv backend/data/backups/members_$(date +%Y%m%d).csv
```

### **Import New Data**
```bash
# Replace main database
cp new_members.csv backend/data/members.csv
```

### **Export Data**
- Use the web interface "Export" button
- Or copy `backend/data/members.csv` directly

## 🔍 **Troubleshooting**

### **Common Issues**

1. **"Port 8000 already in use"**
   ```bash
   # Kill existing process
   lsof -ti:8000 | xargs kill -9
   # Or use different port
   python -m http.server 8080
   ```

2. **"Gmail authentication failed"**
   - Check internet connection
   - Verify Google Cloud Console setup
   - Delete `backend/config/token.pickle` and retry

3. **"Member not found"**
   - Check CSV file format
   - Verify member names match exactly
   - Use search function

4. **"Mobile not working"**
   - Ensure responsive CSS is loaded
   - Check viewport meta tag
   - Test on different devices

### **Performance Optimization**

- **Database indexing** - For large member lists
- **Caching** - For frequently accessed data
- **Compression** - For faster loading
- **CDN** - For static assets

## 📞 **Support**

### **Technical Issues**
- Check this documentation first
- Review troubleshooting section
- Contact system administrator

### **Feature Requests**
- Document in `docs/FEATURE_REQUESTS.md`
- Prioritize based on organization needs
- Plan implementation timeline

## 🎯 **Next Steps**

1. **Immediate**: Test the system with current data
2. **Short-term**: Set up Gmail integration
3. **Medium-term**: Add more features (reports, analytics)
4. **Long-term**: Deploy to production server

## ✅ **Success Checklist**

- [ ] System starts without errors
- [ ] All members load correctly
- [ ] Search functionality works
- [ ] Mobile interface responsive
- [ ] Authentication working
- [ ] Gmail integration (optional)
- [ ] Data backup created
- [ ] Team trained on usage

---

**🎉 Congratulations! Your AAAC Membership System is ready to use!**
