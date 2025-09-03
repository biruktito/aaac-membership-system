# AAAC Membership System - Project Structure

## 📁 **New Project Structure**

```
aaac-membership-system/
├── 📁 frontend/
│   ├── 📁 pages/
│   │   ├── index.html                 # Entry point redirect
│   │   ├── login.html                 # Authentication page
│   │   └── dashboard.html             # Main application (renamed from membership_status_tracker.html)
│   ├── 📁 assets/
│   │   ├── 📁 css/
│   │   │   └── styles.css             # Extracted CSS
│   │   ├── 📁 js/
│   │   │   ├── auth.js                # Authentication logic
│   │   │   ├── dashboard.js           # Main dashboard logic
│   │   │   ├── members.js             # Member management
│   │   │   └── messaging.js           # Messaging functionality
│   │   └── 📁 images/
│   │       └── logo.png               # AAAC logo (if available)
│   └── 📁 components/
│       ├── payment-modal.html         # Payment recording modal
│       └── member-card.html           # Member card template
├── 📁 backend/
│   ├── 📁 data/
│   │   ├── members.csv                # Main database (renamed from AAAC_Accountant_Database)
│   │   ├── 📁 backups/                # Database backups
│   │   └── 📁 imports/                # Import files
│   ├── 📁 scripts/
│   │   ├── database_manager.py        # Database operations
│   │   ├── data_processor.py          # Data processing utilities
│   │   └── backup_manager.py          # Backup operations
│   └── 📁 config/
│       └── settings.py                # Configuration settings
├── 📁 deployment/
│   ├── deploy.py                      # Main deployment script
│   ├── requirements.txt               # Python dependencies
│   ├── gmail_setup.py                 # Gmail authentication setup
│   └── 📁 scripts/
│       ├── setup_server.py            # Server setup
│       └── ssl_setup.py               # SSL certificate setup
├── 📁 docs/
│   ├── README.md                      # Main documentation
│   ├── SETUP.md                       # Setup instructions
│   ├── USER_GUIDE.md                  # User guide
│   ├── ACCOUNTANT_GUIDE.md            # Accountant instructions
│   └── API_DOCS.md                    # API documentation
├── 📁 legacy/                         # Old files (for reference)
│   ├── aaac_membership_system.html
│   ├── membership_status_tracker.html
│   └── payment_tracker.html
└── 📁 tests/                          # Test files
    ├── test_database.py
    └── test_messaging.py
```

## 🏷️ **Naming Conventions**

### **Files & Directories**
- **kebab-case** for directories and files: `aaac-membership-system/`
- **snake_case** for Python files: `database_manager.py`
- **camelCase** for JavaScript files: `dashboard.js`
- **PascalCase** for HTML pages: `Dashboard.html`

### **Variables & Functions**
- **snake_case** for Python: `member_data`, `calculate_balance()`
- **camelCase** for JavaScript: `memberData`, `calculateBalance()`
- **UPPER_SNAKE_CASE** for constants: `MONTHLY_FEE`, `CURRENT_YEAR`

### **Database Fields**
- **UPPER_SNAKE_CASE** for column names: `MEMBER_ID`, `PHONE_NUMBER`
- **snake_case** for data values: `member_id`, `phone_number`

## 🔧 **Technology Stack**

### **Frontend**
- **HTML5** - Structure
- **CSS3** - Styling (responsive design)
- **Vanilla JavaScript** - Functionality
- **Progressive Web App (PWA)** - Mobile-friendly

### **Backend**
- **Python 3.8+** - Server logic
- **Flask** - Web framework
- **Pandas** - Data processing
- **SQLite** - Database (can upgrade to PostgreSQL)

### **Deployment**
- **Gmail API** - Email functionality
- **Python HTTP Server** - Development
- **Nginx** - Production server
- **SSL Certificates** - Security

## 📱 **Mobile-First Design**

### **Responsive Breakpoints**
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### **Touch-Friendly Interface**
- **Large buttons** (44px minimum)
- **Swipe gestures** for navigation
- **Touch-optimized forms**
- **Offline capability** (PWA)

## 🔐 **Authentication System**

### **User Roles**
1. **Member** (`member` / `member2025`)
   - View own information
   - Search members
   - View payment status

2. **Board Member** (`board` / `board2025`)
   - All member permissions
   - View phone numbers
   - Send messages
   - Copy member data

3. **Admin** (`admin` / `admin2025`)
   - All board permissions
   - Upload database
   - Record payments
   - Remove members
   - System management

### **Session Management**
- **24-hour sessions**
- **Automatic logout**
- **Secure token storage**

## 📊 **Database Schema**

### **Members Table**
```sql
CREATE TABLE members (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    registration_fee DECIMAL(10,2),
    first_payment_year INTEGER,
    first_payment_month TEXT,
    status TEXT DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **Payments Table**
```sql
CREATE TABLE payments (
    id INTEGER PRIMARY KEY,
    member_id INTEGER,
    year INTEGER,
    month TEXT,
    amount DECIMAL(10,2),
    payment_type TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id)
);
```

## 🚀 **Deployment Features**

### **Gmail Integration**
- **OAuth2 authentication**
- **SMTP for sending emails**
- **Email templates**
- **Bulk messaging**

### **Security Features**
- **HTTPS encryption**
- **Input validation**
- **SQL injection prevention**
- **XSS protection**
- **CSRF tokens**

### **Performance**
- **Database indexing**
- **Caching**
- **Compression**
- **CDN for assets**

## 📋 **Migration Plan**

### **Phase 1: Restructure**
1. Create new directory structure
2. Move and rename files
3. Extract CSS and JavaScript
4. Update references

### **Phase 2: Enhance**
1. Add Gmail integration
2. Implement PWA features
3. Add mobile optimizations
4. Create deployment scripts

### **Phase 3: Deploy**
1. Set up production server
2. Configure SSL certificates
3. Deploy application
4. Test all functionality

## 🎯 **Goals**

1. **Professional Structure** - Clean, maintainable code
2. **Mobile-First** - Works perfectly on phones
3. **Gmail Integration** - Direct email sending
4. **Easy Deployment** - Simple setup process
5. **Scalable** - Can grow with the organization
6. **Secure** - Protects member data
7. **Fast** - Quick loading and response times
