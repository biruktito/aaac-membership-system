// Configuration Management for AAAC Membership System
// This file contains safe demo configuration for GitHub Pages deployment
// For production, use environment variables or secure configuration

const CONFIG = {
    // Demo credentials for GitHub Pages (safe to commit)
    DEMO_CREDENTIALS: {
        admin: {
            username: 'admin',
            password: 'admin2025'
        },
        board: {
            username: 'board', 
            password: 'board2025'
        },
        member: {
            username: 'member',
            password: 'member2025'
        },
        demo: {
            username: 'demo',
            password: 'demo2025'
        }
    },
    
    // Google Sheets Configuration (placeholder values)
    GOOGLE_SHEETS: {
        spreadsheetId: 'your-spreadsheet-id-here',
        apiKey: 'your-api-key-here'
    },
    
    // Payment Configuration
    PAYMENT: {
        zelleEmail: 'aaaichicago@gmail.com',
        monthlyFee: 15,
        registrationFee: 200
    },
    
    // Security Configuration
    SECURITY: {
        sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
        maxLoginAttempts: 5,
        lockoutDuration: 15 * 60 * 1000 // 15 minutes
    }
};

// Function to get credentials (safe for GitHub Pages)
function getCredentials() {
    // For GitHub Pages, always use demo credentials
    console.log('Using demo credentials for GitHub Pages deployment');
    return CONFIG.DEMO_CREDENTIALS;
}

// Function to validate credentials
function validateCredentials(username, password) {
    const credentials = getCredentials();
    
    for (const [role, creds] of Object.entries(credentials)) {
        if (creds.username === username && creds.password === password) {
            return { valid: true, role: role };
        }
    }
    
    return { valid: false, role: null };
}

// Function to get payment configuration
function getPaymentConfig() {
    return CONFIG.PAYMENT;
}

// Function to get security configuration
function getSecurityConfig() {
    return CONFIG.SECURITY;
}

// Function to get Google Sheets configuration
function getGoogleSheetsConfig() {
    return CONFIG.GOOGLE_SHEETS;
}

// Export for use in other scripts
if (typeof window !== 'undefined') {
    window.AAACConfig = {
        CONFIG: CONFIG,
        getCredentials: getCredentials,
        validateCredentials: validateCredentials,
        getPaymentConfig: getPaymentConfig,
        getSecurityConfig: getSecurityConfig,
        getGoogleSheetsConfig: getGoogleSheetsConfig
    };
}

// For Node.js environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CONFIG: CONFIG,
        getCredentials: getCredentials,
        validateCredentials: validateCredentials,
        getPaymentConfig: getPaymentConfig,
        getSecurityConfig: getSecurityConfig,
        getGoogleSheetsConfig: getGoogleSheetsConfig
    };
}
