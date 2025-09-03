# Security Setup Guide for AAAC Membership System

## 🔒 **Critical Security Measures**

### 1. **Environment Variables Setup**

Create a `.env` file in your project root (this file should NEVER be committed to Git):

```bash
# Authentication Credentials (REQUIRED for production)
AAAC_ADMIN_USERNAME=your_admin_username
AAAC_ADMIN_PASSWORD=your_secure_admin_password
AAAC_BOARD_USERNAME=your_board_username
AAAC_BOARD_PASSWORD=your_secure_board_password
AAAC_MEMBER_USERNAME=aaacuser
AAAC_MEMBER_PASSWORD=your_secure_member_password

# Google Sheets Integration (OPTIONAL)
GOOGLE_SHEETS_ID=your_google_sheets_spreadsheet_id
GOOGLE_API_KEY=your_google_api_key

# Payment Configuration (OPTIONAL)
ZELLE_EMAIL=aaaichicago@gmail.com

# Security Settings (OPTIONAL)
SESSION_TIMEOUT=86400000
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION=900000
```

### 2. **SSH Key Security Fix**

To resolve the SSH host key warning, run:

```bash
# Remove the old GitHub host key
ssh-keygen -R github.com

# Add the new host key
ssh-keyscan -H github.com >> ~/.ssh/known_hosts
```

### 3. **Git Security Best Practices**

```bash
# Check what files are being tracked
git status

# Remove any sensitive files from tracking
git rm --cached .env
git rm --cached config.json
git rm --cached *.key
git rm --cached credentials.json

# Commit the removal
git commit -m "Remove sensitive files from tracking"

# Push changes
git push origin main
```

### 4. **Production Deployment Security**

#### **Option A: Environment Variables (Recommended)**
- Set environment variables on your hosting platform
- Use strong, unique passwords
- Rotate passwords regularly

#### **Option B: Local Configuration**
- Create a `local_config.json` file (not tracked by Git)
- Use the configuration management system

### 5. **Password Security Guidelines**

- **Minimum 12 characters**
- **Mix of uppercase, lowercase, numbers, symbols**
- **No common words or patterns**
- **Unique for each role**

Example strong passwords:
- `K9#mN2$pL8@vX5`
- `H7$jR4#nQ9@wE2`
- `T5#bM8$kL3@hF6`

### 6. **Access Control Matrix**

| Role | Username | Access Level | Permissions |
|------|----------|--------------|-------------|
| Admin | `admin` | Full Control | All features + user management |
| Board | `board` | Management | View all data + send reminders |
| Member | `aaacuser` | Personal | Own data + events only |
| Demo | `demo` | Read-only | Demo data only |

### 7. **Session Security**

- Sessions expire after 24 hours
- Automatic logout on browser close
- Secure session storage
- No persistent cookies with sensitive data

### 8. **Data Protection**

- All sensitive data encrypted in transit
- No passwords stored in plain text
- Secure credential validation
- Input sanitization and validation

### 9. **Monitoring and Logging**

- Failed login attempts logged
- Session creation/deletion tracked
- Error logging for debugging
- Security event monitoring

### 10. **Backup and Recovery**

- Regular data backups
- Secure backup storage
- Disaster recovery plan
- Version control for configuration

## 🚨 **Emergency Security Procedures**

### If Credentials Are Compromised:

1. **Immediate Actions:**
   - Change all passwords immediately
   - Revoke any API keys
   - Check for unauthorized access
   - Review system logs

2. **Communication:**
   - Notify all users of security update
   - Provide new login credentials securely
   - Monitor for suspicious activity

3. **Prevention:**
   - Implement additional security measures
   - Review access logs
   - Update security policies

## 📋 **Security Checklist**

- [ ] Environment variables configured
- [ ] SSH keys updated
- [ ] Sensitive files removed from Git
- [ ] Strong passwords set
- [ ] Access controls configured
- [ ] Session security enabled
- [ ] Data encryption in place
- [ ] Monitoring configured
- [ ] Backup system in place
- [ ] Security documentation updated

## 🔧 **Troubleshooting**

### Common Issues:

1. **SSH Host Key Warning:**
   ```bash
   ssh-keyscan -H github.com >> ~/.ssh/known_hosts
   ```

2. **Environment Variables Not Loading:**
   - Check file permissions
   - Verify variable names
   - Restart application

3. **Login Failures:**
   - Verify credentials in config
   - Check browser console for errors
   - Clear browser cache

## 📞 **Support**

For security-related issues:
- Review this guide first
- Check system logs
- Contact system administrator
- Document all security incidents

---

**Remember**: Security is an ongoing process. Regularly review and update your security measures!
