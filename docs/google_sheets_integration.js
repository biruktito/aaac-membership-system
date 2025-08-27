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
        
        // Debug: Show the structure of membersData
        console.log('=== MEMBERS DATA STRUCTURE DEBUG ===');
        console.log('membersData type:', typeof membersData);
        console.log('membersData length:', membersData.length);
        console.log('membersData is array:', Array.isArray(membersData));
        if (membersData.length > 0) {
            console.log('First row type:', typeof membersData[0]);
            console.log('First row is array:', Array.isArray(membersData[0]));
            console.log('First row length:', membersData[0] ? membersData[0].length : 'undefined');
            console.log('First row:', membersData[0]);
        }
        console.log('=== END MEMBERS DATA STRUCTURE DEBUG ===');
        
        // Debug: Show what we're about to pass to processGoogleSheetsData
        console.log('=== ABOUT TO CALL processGoogleSheetsData ===');
        console.log('Passing membersData to processGoogleSheetsData:', membersData);
        console.log('=== END ABOUT TO CALL ===');
        
        // Load settings
        const settings = await fetchSheetData(GOOGLE_SHEETS_CONFIG.SHEETS.SETTINGS);
        console.log('✅ Loaded settings from Google Sheets');
        
        // Parse and process the data
        const processedMembers = processGoogleSheetsData(membersData);
        
        console.log('✅ Processed members:', processedMembers.length);
        console.log('Sample processed member:', processedMembers[0]);
        
        // Set global data
        window.membersData = processedMembers;
        console.log('✅ Global membersData set:', window.membersData.length, 'members');
        console.log('✅ Sample member in global data:', window.membersData[0]);
        
        // Debug: Check if the first member has payment data
        if (window.membersData.length > 0) {
            const firstMember = window.membersData[0];
            console.log('=== FIRST MEMBER PAYMENT DATA CHECK ===');
            console.log('Member ID:', firstMember.id);
            console.log('Member Name:', firstMember.name);
            console.log('Has 2022 data:', !!firstMember['2022']);
            console.log('Has 2023 data:', !!firstMember['2023']);
            console.log('Has 2024 data:', !!firstMember['2024']);
            console.log('Has 2025 data:', !!firstMember['2025']);
            console.log('Has 2026 data:', !!firstMember['2026']);
            console.log('2022 payments:', firstMember['2022']);
            console.log('2025 payments:', firstMember['2025']);
            console.log('=== END FIRST MEMBER CHECK ===');
        }
        
        window.systemSettings = processSettings(settings);
        
        console.log('🔄 Updating dashboard...');
        
        // Force a delay to ensure data is set
        setTimeout(() => {
            console.log('🔄 Calling displayMembers function...');
            console.log('🔄 window.membersData length:', window.membersData ? window.membersData.length : 'undefined');
            console.log('🔄 displayMembers function exists:', typeof displayMembers);
            console.log('🔄 updateStats function exists:', typeof updateStats);
            
            // Update dashboard
            if (typeof displayMembers === 'function') {
                displayMembers();
                console.log('✅ displayMembers called successfully');
            } else {
                console.error('❌ displayMembers function not found');
            }
            
            if (typeof updateStats === 'function') {
                updateStats();
                console.log('✅ updateStats called successfully');
            } else {
                console.error('❌ updateStats function not found');
            }
        }, 500);
        
        console.log('✅ Google Sheets data loaded successfully');
        return true;
        
    } catch (error) {
        console.error('❌ Error loading from Google Sheets:', error);
        console.error('❌ Error details:', error.message);
        console.error('❌ Error stack:', error.stack);
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
function processGoogleSheetsData(data) {
    console.log('🔄 Processing Google Sheets data...');
    console.log('=== DATA STRUCTURE DEBUG ===');
    console.log('Data type:', typeof data);
    console.log('Data is null:', data === null);
    console.log('Data is undefined:', data === undefined);
    console.log('Data is array:', Array.isArray(data));
    console.log('Data length:', data ? data.length : 'N/A');
    console.log('Data:', data);
    if (data && typeof data === 'object' && !Array.isArray(data)) {
        console.log('Data keys:', Object.keys(data));
        console.log('Data.values type:', typeof data.values);
        console.log('Data.values is array:', Array.isArray(data.values));
        console.log('Data.values length:', data.values ? data.values.length : 'N/A');
    }
    console.log('=== END DATA STRUCTURE DEBUG ===');
    
    // Check if data is already an array (values) or needs to be extracted
    let rows;
    if (Array.isArray(data)) {
        // Data is already the values array
        rows = data;
        console.log('Data is already an array of rows');
    } else if (data && data.values && Array.isArray(data.values)) {
        // Data is the full response object
        rows = data.values;
        console.log('Data contains values array');
    } else {
        console.error('❌ No data to process');
        console.log('Data type:', typeof data);
        console.log('Data:', data);
        return [];
    }
    
    if (rows.length === 0) {
        console.error('❌ No rows to process');
        return [];
    }
    
    const headers = rows[0];
    const totalRows = rows.length - 1; // Exclude header
    
    console.log('Headers:', headers);
    console.log('Headers length:', headers.length);
    console.log('Total rows:', totalRows);
    console.log('Sample row:', rows[1]);
    console.log('Sample row length:', rows[1].length);
    console.log('First 3 rows:', rows.slice(1, 4));
    
    return rows.slice(1).map((row, index) => {
        console.log(`Member ${index + 1} - headers.length: ${headers.length}, row.length: ${row.length}`);
        console.log(`Member ${index + 1} - condition: ${headers.length > 1 && row.length > 1}`);
        
        let member = {};
        
        if (headers.length > 1 && row.length > 1) {
            // Multi-column data
            console.log(`Using multi-column parsing for member ${index + 1}`);
            headers.forEach((header, i) => {
                member[header] = row[i] || '';
            });
        } else {
            // Single-column CSV string data
            console.log(`Using CSV parsing for member ${index + 1}`);
            const csvString = row[0];
            console.log(`Parsing CSV for member ${index + 1}:`, csvString);
            
            const values = csvString.split(',');
            console.log(`CSV values length:`, values.length);
            console.log(`First few CSV values:`, values.slice(0, 5));
            
            // Map CSV values to member properties based on the expected structure
            member = {
                id: values[0] || '',
                name: values[1] || '',
                phone: values[2] || '',
                status: values[3] || 'Active',
                firstPaymentYear: values[4] || '',
                registrationFeePaid: values[5] || '0',
                registrationFeeAmount: values[6] || '0',
                lastPaymentDate: values[7] || '',
                notes: values[8] || '',
                '2022': {},
                '2023': {},
                '2024': {},
                '2025': {},
                '2026': {}
            };
            
            // Parse monthly payments for each year
            const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
            
            // Find the correct column indices for each year's months
            for (let year = 2022; year <= 2026; year++) {
                monthNames.forEach((month, monthIndex) => {
                    const columnName = `${year}_${month}`;
                    const columnIndex = headers.indexOf(columnName);
                    if (columnIndex !== -1) {
                        const value = parseFloat(values[columnIndex]) || 0;
                        member[year.toString()][month] = value;
                    } else {
                        member[year.toString()][month] = 0;
                    }
                });
            }
            
            // Debug: Show column mapping for first member
            if (index === 0) {
                console.log('=== HEADER DEBUG FOR FIRST MEMBER ===');
                console.log('Headers array:', headers);
                console.log('Looking for columns like 2022_JAN, 2022_FEB, etc.');
                monthNames.forEach(month => {
                    const columnName = `2022_${month}`;
                    const columnIndex = headers.indexOf(columnName);
                    console.log(`${columnName}: index ${columnIndex}, value: ${columnIndex !== -1 ? values[columnIndex] : 'NOT FOUND'}`);
                });
                console.log('=== END HEADER DEBUG ===');
            }
            
            // Parse incidentals (columns 69-78)
            for (let j = 0; j < 5; j++) {
                const year = 2022 + j;
                const incidentalColumnName = `${year}_Incidentals`;
                const incidentalColumnIndex = headers.indexOf(incidentalColumnName);
                if (incidentalColumnIndex !== -1) {
                    const value = parseFloat(values[incidentalColumnIndex]) || 0;
                    if (value > 0) {
                        // Add incidentals to the year data as an array of objects
                        if (!member[year.toString()].incidentals) {
                            member[year.toString()].incidentals = [];
                        }
                        member[year.toString()].incidentals.push({
                            amount: value,
                            description: `Incidental payment for ${year}`
                        });
                    }
                }
            }
        }
        
        // Ensure we have the basic structure
        member.id = member.id || member.Member_ID || member['Member ID'] || (index + 1).toString();
        member.name = member.name || member.Name || member['Member Name'] || 'Unknown';
        member.phone = member.phone || member.Phone || member['Phone Number'] || '';
        member.status = member.status || member.Status || 'Active';
        
        // Debug: Show complete member structure for first 3 members
        if (index < 3) {
            console.log(`=== COMPLETE MEMBER ${index + 1} STRUCTURE ===`);
            console.log('Member object:', member);
            console.log('2022 payments:', member['2022']);
            console.log('2023 payments:', member['2023']);
            console.log('2024 payments:', member['2024']);
            console.log('2025 payments:', member['2025']);
            console.log('2026 payments:', member['2026']);
            console.log('2022 incidentals:', member['2022'].incidentals);
            console.log('2023 incidentals:', member['2023'].incidentals);
            console.log('2024 incidentals:', member['2024'].incidentals);
            console.log('2025 incidentals:', member['2025'].incidentals);
            console.log('2026 incidentals:', member['2026'].incidentals);
            console.log('=== END MEMBER ${index + 1} STRUCTURE ===');
        }
        
        // Additional debug for first member to show total payments
        if (index === 0) {
            console.log('=== FIRST MEMBER PAYMENT TOTALS ===');
            let total2022 = 0, total2023 = 0, total2024 = 0, total2025 = 0, total2026 = 0;
            Object.values(member['2022']).forEach(val => total2022 += val);
            Object.values(member['2023']).forEach(val => total2023 += val);
            Object.values(member['2024']).forEach(val => total2024 += val);
            Object.values(member['2025']).forEach(val => total2025 += val);
            Object.values(member['2026']).forEach(val => total2026 += val);
            console.log('2022 total:', total2022);
            console.log('2023 total:', total2023);
            console.log('2024 total:', total2024);
            console.log('2025 total:', total2025);
            console.log('2026 total:', total2026);
            console.log('Grand total:', total2022 + total2023 + total2024 + total2025 + total2026);
            console.log('=== END FIRST MEMBER TOTALS ===');
        }
        
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
    if (!GOOGLE_SHEETS_CONFIG.SHEET_ID || !GOOGLE_SHEETS_CONFIG.API_KEY || 
        GOOGLE_SHEETS_CONFIG.SHEET_ID === 'YOUR_GOOGLE_SHEET_ID_HERE') {
        console.log('⚠️ Google Sheets not configured, using local data');
        console.log('  - SHEET_ID:', GOOGLE_SHEETS_CONFIG.SHEET_ID);
        console.log('  - API_KEY:', GOOGLE_SHEETS_CONFIG.API_KEY ? 'Set' : 'Missing');
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
