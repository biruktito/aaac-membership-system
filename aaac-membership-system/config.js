// Configuration Management for AAAC Membership System
// This file handles secure credential management

const CONFIG = {
    // Default demo credentials (for development/testing only)
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
            username: 'aaacuser',
            password: 'members2025'
        },
        demo: {
            username: 'demo',
            password: 'demo2025'
        }
    },
    
    // Google Sheets Configuration
    GOOGLE_SHEETS: {
        spreadsheetId: process.env.GOOGLE_SHEETS_ID || 'your-spreadsheet-id-here',
        apiKey: process.env.GOOGLE_API_KEY || 'your-api-key-here'
    },
    
    // Payment Configuration
    PAYMENT: {
        zelleEmail: process.env.ZELLE_EMAIL || 'aaaichicago@gmail.com',
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

// Function to get credentials based on environment
function getCredentials() {
    // Check for environment variables first
    if (process.env.AAAC_ADMIN_USERNAME && process.env.AAAC_ADMIN_PASSWORD) {
        return {
            admin: {
                username: process.env.AAAC_ADMIN_USERNAME,
                password: process.env.AAAC_ADMIN_PASSWORD
            },
            board: {
                username: process.env.AAAC_BOARD_USERNAME || CONFIG.DEMO_CREDENTIALS.board.username,
                password: process.env.AAAC_BOARD_PASSWORD || CONFIG.DEMO_CREDENTIALS.board.password
            },
            member: {
                username: process.env.AAAC_MEMBER_USERNAME || CONFIG.DEMO_CREDENTIALS.member.username,
                password: process.env.AAAC_MEMBER_PASSWORD || CONFIG.DEMO_CREDENTIALS.member.password
            },
            demo: CONFIG.DEMO_CREDENTIALS.demo
        };
    }
    
    // Check for local config file
    try {
        const localConfig = JSON.parse(localStorage.getItem('aaacLocalConfig'));
        if (localConfig && localConfig.credentials) {
            return localConfig.credentials;
        }
    } catch (e) {
        console.warn('Local config not found or invalid, using demo credentials');
    }
    
    // Fallback to demo credentials
    console.warn('⚠️ Using demo credentials. For production, set environment variables or local config.');
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

// Function to set local configuration (for development)
function setLocalConfig(config) {
    try {
        localStorage.setItem('aaacLocalConfig', JSON.stringify(config));
        console.log('✅ Local configuration updated');
        return true;
    } catch (e) {
        console.error('❌ Failed to save local configuration:', e);
        return false;
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, getCredentials, validateCredentials, setLocalConfig };
} else {
    // Browser environment
    window.AAACConfig = { CONFIG, getCredentials, validateCredentials, setLocalConfig };
}
