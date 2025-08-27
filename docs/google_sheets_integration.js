/**
 * Google Sheets Integration for AAAC Membership System
 * 
 * This file contains functions to:
 * 1. Load data from Google Sheets
 * 2. Update payments in real-time
 * 3. Sync changes to the dashboard
 */

// Google Sheets API Configuration
const GOOGLE_SHEETS_CONFIG = {
    // Replace with your actual Google Sheet ID
    SHEET_ID: '1r3SF2Ba1UIEYS28rCX8j2S7BsAsJsWRzw9v4M37-jHw',
    API_KEY: 'AIzaSyCLpLGtV9ui3Bm9o-ElkaIMKvk6wQk_Mtc',
    SHEETS: {
        MEMBERS: 'Members',
        PAYMENT_LOG: 'Payment_Log',
        SETTINGS: 'Settings'
    }
};

/**
 * Load data from Google Sheets
 */
async function loadDataFromGoogleSheets() {
    try {
        console.log('🔄 Loading data from Google Sheets...');
        
        // Load members data
        const membersData = await fetchSheetData(GOOGLE_SHEETS_CONFIG.SHEETS.MEMBERS);
        console.log(`✅ Loaded ${membersData.length} members from Google Sheets`);
        
        // Load settings
        const settings = await fetchSheetData(GOOGLE_SHEETS_CONFIG.SHEETS.SETTINGS);
        console.log('✅ Loaded settings from Google Sheets');
        
        // Parse and process the data
        const processedMembers = processGoogleSheetsData(membersData);
        
        console.log('✅ Processed members:', processedMembers.length);
        console.log('Sample processed member:', processedMembers[0]);
        
        // Update global data
        window.membersData = processedMembers;
        window.systemSettings = processSettings(settings);
        
        console.log('🔄 Updating dashboard...');
        
        // Update dashboard
        displayMembers();
        updateStats();
        
        console.log('✅ Google Sheets data loaded successfully');
        return true;
        
    } catch (error) {
        console.error('❌ Error loading from Google Sheets:', error);
        console.log('🔄 Falling back to local CSV data...');
        return false;
    }
}

/**
 * Fetch data from a specific sheet
 */
async function fetchSheetData(sheetName) {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_CONFIG.SHEET_ID}/values/${sheetName}?key=${GOOGLE_SHEETS_CONFIG.API_KEY}`;
    
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.values || [];
}

/**
 * Process Google Sheets data into our expected format
 */
function processGoogleSheetsData(sheetData) {
    if (!sheetData || sheetData.length < 2) {
        throw new Error('Invalid sheet data');
    }
    
    const headers = sheetData[0];
    const rows = sheetData.slice(1);
    
    console.log('🔄 Processing Google Sheets data...');
    console.log('Headers:', headers);
    console.log('Total rows:', rows.length);
    console.log('Sample row:', rows[0]);
    
    return rows.map((row, index) => {
        const member = {};
        headers.forEach((header, headerIndex) => {
            member[header] = row[headerIndex] || '';
        });
        
        // Map Google Sheets fields to expected dashboard fields
        member.id = member.Member_ID || member['Member ID'] || (index + 1);
        member.name = member.Name || member['Member Name'] || 'Unknown';
        member.phone = member.Phone || member['Phone Number'] || '';
        member.status = member.Status || 'Active';
        
        console.log(`Processed member ${index + 1}:`, {
            id: member.id,
            name: member.name,
            status: member.status
        });
        
        return member;
    });
}

/**
 * Process settings data
 */
function processSettings(settingsData) {
    const settings = {};
    settingsData.slice(1).forEach(row => {
        if (row[0] && row[1]) {
            settings[row[0]] = row[1];
        }
    });
    return settings;
}

/**
 * Record a payment in Google Sheets
 */
async function recordPaymentInGoogleSheets(paymentData) {
    try {
        console.log('💰 Recording payment in Google Sheets...');
        
        const paymentLog = [
            new Date().toISOString().split('T')[0], // Date
            paymentData.memberId,
            paymentData.memberName,
            paymentData.paymentType,
            paymentData.amount,
            paymentData.month,
            paymentData.year,
            paymentData.notes,
            'Accountant' // Recorded by
        ];
        
        // Add to payment log
        await appendToSheet(GOOGLE_SHEETS_CONFIG.SHEETS.PAYMENT_LOG, [paymentLog]);
        
        // Update member's payment in main sheet
        await updateMemberPayment(paymentData);
        
        console.log('✅ Payment recorded successfully');
        return true;
        
    } catch (error) {
        console.error('❌ Error recording payment:', error);
        return false;
    }
}

/**
 * Append data to a sheet
 */
async function appendToSheet(sheetName, data) {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_CONFIG.SHEET_ID}/values/${sheetName}:append?valueInputOption=RAW&key=${GOOGLE_SHEETS_CONFIG.API_KEY}`;
    
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            values: data
        })
    });
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
}

/**
 * Update member's payment in the main sheet
 */
async function updateMemberPayment(paymentData) {
    // Find the member's row and update the specific month/year cell
    const memberId = paymentData.memberId;
    const monthYear = `${paymentData.year}_${paymentData.month}`;
    
    // This would require finding the member's row and updating the specific cell
    // For now, we'll reload the entire sheet
    await loadDataFromGoogleSheets();
}

/**
 * Auto-refresh data from Google Sheets
 */
function startAutoRefresh() {
    const interval = window.systemSettings?.Auto_Refresh_Interval || 30;
    
    setInterval(async () => {
        console.log('🔄 Auto-refreshing data...');
        await loadDataFromGoogleSheets();
    }, interval * 1000);
    
    console.log(`✅ Auto-refresh enabled (${interval} seconds)`);
}

/**
 * Initialize Google Sheets integration
 */
async function initializeGoogleSheets() {
    console.log('🚀 Initializing Google Sheets integration...');
    
    // Check if configuration is set
    if (GOOGLE_SHEETS_CONFIG.SHEET_ID === 'YOUR_GOOGLE_SHEET_ID_HERE') {
        console.log('⚠️ Google Sheets not configured, using local data');
        return false;
    }
    
    // Try to load from Google Sheets
    const success = await loadDataFromGoogleSheets();
    
    if (success) {
        // Start auto-refresh
        startAutoRefresh();
        console.log('✅ Google Sheets integration active');
        return true;
    }
    
    return false;
}

/**
 * Payment form handler for Google Sheets
 */
async function handlePaymentSubmission(paymentData) {
    // Show loading state
    const submitBtn = document.querySelector('#paymentForm button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Recording Payment...';
    submitBtn.disabled = true;
    
    try {
        // Record in Google Sheets
        const success = await recordPaymentInGoogleSheets(paymentData);
        
        if (success) {
            // Show success message
            showNotification('Payment recorded successfully!', 'success');
            
            // Refresh data
            await loadDataFromGoogleSheets();
            
            // Clear form
            document.getElementById('paymentForm').reset();
            
        } else {
            showNotification('Failed to record payment. Please try again.', 'error');
        }
        
    } catch (error) {
        console.error('Payment submission error:', error);
        showNotification('Error recording payment. Please try again.', 'error');
    } finally {
        // Restore button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        font-weight: bold;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    if (type === 'success') {
        notification.style.backgroundColor = '#28a745';
    } else if (type === 'error') {
        notification.style.backgroundColor = '#dc3545';
    } else {
        notification.style.backgroundColor = '#17a2b8';
    }
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Export functions for use in dashboard
window.GoogleSheetsIntegration = {
    initialize: initializeGoogleSheets,
    loadData: loadDataFromGoogleSheets,
    recordPayment: recordPaymentInGoogleSheets,
    handlePayment: handlePaymentSubmission
};
