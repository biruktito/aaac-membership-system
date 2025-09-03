# AAAC Payment Tracker - Quick Setup Guide

## 🚀 Get Started in 10 Minutes

### Step 1: Create Your Google Sheet (2 minutes)
1. Go to [Google Sheets](https://sheets.google.com)
2. Click "Blank" to create a new spreadsheet
3. Rename it to "AAAC Payment Tracker 2026"
4. Copy the URL - you'll need the ID (the part between /d/ and /edit)

### Step 2: Set Up Google Apps Script (3 minutes)
1. Go to [Google Apps Script](https://script.google.com)
2. Click "New project"
3. Name it "AAAC Payment Tracker"
4. Delete the default code and paste the contents of `google_apps_script.gs`
5. Replace `YOUR_SPREADSHEET_ID_HERE` with your actual spreadsheet ID
6. Save the project (Ctrl+S or Cmd+S)

### Step 3: Create the Web Interface (2 minutes)
1. In Google Apps Script, click the "+" next to "Files"
2. Select "HTML"
3. Name it "payment_tracker"
4. Paste the contents of `payment_tracker.html`
5. Save

### Step 4: Deploy Your Web App (2 minutes)
1. Click "Deploy" → "New deployment"
2. Choose "Web app"
3. Set "Execute as" to "Me"
4. Set "Who has access" to "Anyone" (or "Anyone with Google Account" for more security)
5. Click "Deploy"
6. Copy the web app URL

### Step 5: Initialize Your Data (1 minute)
1. In Google Apps Script, click "Run" → "setupSpreadsheet"
2. Check the execution log for your spreadsheet ID
3. Your system is now ready!

## 📱 Test Your System

1. Open the web app URL in your browser
2. Try adding a test member
3. Record a test payment
4. Search for the member
5. Export the data

## 🔧 Import Your Existing Data

If you have existing member data:

1. In Google Apps Script, run the `syncFromCSV()` function
2. Paste your CSV data as a parameter
3. Your existing members will be imported

## 🛡️ Security Settings

### Recommended Access Levels:
- **Owner**: You (full access)
- **Editors**: 2-3 trusted admins
- **Viewers**: Members who need to check their status

### Web App Access:
- **Development**: "Anyone" (for testing)
- **Production**: "Anyone with Google Account" (more secure)

## 📞 Support

If you need help:
1. Check the main README.md file
2. Verify your spreadsheet ID is correct
3. Ensure all files are saved in Google Apps Script
4. Try refreshing the web app URL

## 🎯 Next Steps

Once your system is running:
1. Add all your existing members
2. Set up payment reminders
3. Train your admins on the system
4. Share the web app URL with your team

## 💡 Pro Tips

- **Backup regularly**: Use the "Export Data" function monthly
- **Test payments**: Always test with small amounts first
- **Monitor access**: Check who has edit permissions regularly
- **Keep it simple**: Start with basic features, add more later

## 🔄 Maintenance

### Monthly Tasks:
- Export data backup
- Review outstanding balances
- Send payment reminders
- Update member information

### Quarterly Tasks:
- Review system usage
- Update member contact information
- Check for any system improvements needed

---

**Your AAAC Payment Tracker is now live and ready to use!** 🎉
