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
        console.log('✅ Global membersData set:', window.membersData.length, 'members');
        console.log('✅ Sample member in global data:', window.membersData[0]);
        
        // Update dashboard
        if (typeof displayMembers === 'function') {
            displayMembers();
        } else {
            console.error('❌ displayMembers function not found');
        }
        
        if (typeof updateStats === 'function') {
            updateStats();
        } else {
            console.error('❌ updateStats function not found');
        }
        
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
    console.log('Headers length:', headers.length);
    console.log('Total rows:', rows.length);
    console.log('Sample row:', rows[0]);
    console.log('Sample row length:', rows[0] ? rows[0].length : 0);
    console.log('First 3 rows:', rows.slice(0, 3));
    
    return rows.map((row, index) => {
        const member = {};
        
        // Debug the condition
        console.log(`Member ${index + 1} - headers.length: ${headers.length}, row.length: ${row.length}`);
        console.log(`Member ${index + 1} - condition: ${headers.length > 1 && row.length > 1}`);
        
        // If we have multiple columns, use them
        if (headers.length > 1 && row.length > 1) {
            console.log(`Using multi-column format for member ${index + 1}`);
            headers.forEach((header, headerIndex) => {
                member[header] = row[headerIndex] || '';
            });
        } else {
            // If we have a single column with CSV data, parse it
            console.log(`Using CSV parsing for member ${index + 1}`);
            const csvString = row[0] || '';
            const csvValues = csvString.split(',');
            
            console.log(`Parsing CSV for member ${index + 1}:`, csvString.substring(0, 100) + '...');
            console.log(`CSV values length:`, csvValues.length);
            console.log(`First few CSV values:`, csvValues.slice(0, 5));
            
            // Map CSV values to expected fields
            member.Member_ID = csvValues[0] || '';
            member.Name = csvValues[1] || '';
            member.Phone = csvValues[2] || '';
            member.Status = csvValues[3] || '';
            member.First_Payment_Year = csvValues[4] || '';
            member.Registration_Fee_Paid = csvValues[5] || '';
            member.Registration_Fee_Amount = csvValues[6] || '';
            member.Last_Payment_Date = csvValues[7] || '';
            member.Notes = csvValues[8] || '';
            
            // Add all the payment months (2022_JAN through 2026_DEC)
            for (let year = 2022; year <= 2026; year++) {
                const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
                months.forEach(month => {
                    const fieldName = `${year}_${month}`;
                    const valueIndex = 9 + (year - 2022) * 12 + months.indexOf(month);
                    member[fieldName] = csvValues[valueIndex] || '0.0';
                });
            }
            
            // Add incidentals
            const incidentalStartIndex = 9 + 5 * 12; // After all payment months
            member['2022_Incidentals'] = csvValues[incidentalStartIndex] || '0';
            member['2022_Incidental_Notes'] = csvValues[incidentalStartIndex + 1] || '';
            member['2023_Incidentals'] = csvValues[incidentalStartIndex + 2] || '0';
            member['2023_Incidental_Notes'] = csvValues[incidentalStartIndex + 3] || '';
            member['2024_Incidentals'] = csvValues[incidentalStartIndex + 4] || '0';
            member['2024_Incidental_Notes'] = csvValues[incidentalStartIndex + 5] || '';
            member['2025_Incidentals'] = csvValues[incidentalStartIndex + 6] || '0';
            member['2025_Incidental_Notes'] = csvValues[incidentalStartIndex + 7] || '';
            member['2026_Incidentals'] = csvValues[incidentalStartIndex + 8] || '0';
            member['2026_Incidental_Notes'] = csvValues[incidentalStartIndex + 9] || '';
        }
        
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
