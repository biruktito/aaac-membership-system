// Google Apps Script for AAAC Payment Tracker
// This script provides the backend functionality for the payment tracking system

// Configuration
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE'; // Replace with your actual Google Sheet ID
const SHEET_NAME = 'AAAC_Payments_2026';
const MONTHLY_FEE = 15;
const INITIAL_REGISTRATION = 200;
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUNE', 'JULY', 'AUG', 'SEPT', 'OCT', 'NOV', 'DEC'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// Initialize the web app
function doGet() {
  return HtmlService.createHtmlOutputFromFile('payment_tracker')
    .setTitle('AAAC Payment Tracker')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// Get all members data
function getAllMembers() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    if (!sheet) {
      throw new Error('Sheet not found');
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const members = [];
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[1] && row[1] !== 'NAME') { // Skip empty rows and header
        const member = {
          id: row[0] || i,
          name: row[1] || '',
          phone: row[2] || '',
          registration: parseFloat(row[3]) || 0,
          // Initialize multi-year data structure
          '2024': getYearData(row, 4),
          '2025': getYearData(row, 16),
          '2026': getYearData(row, 28),
          '2027': getYearData(row, 40)
        };
        members.push(member);
      }
    }
    
    return { success: true, data: members };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

// Helper function to extract year data from row
function getYearData(row, startIndex) {
  const yearData = {};
  MONTHS.forEach((month, index) => {
    yearData[month] = parseFloat(row[startIndex + index]) || 0;
  });
  return yearData;
}

// Calculate detailed balance for a member
function calculateDetailedBalance(member) {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  
  let totalPaid = member.registration;
  let totalDue = 0;
  let paidUpTo = 'Not Started';
  let lastPaidMonth = null;
  let lastPaidYear = null;
  
  // Calculate across all years
  const years = ['2024', '2025', '2026', '2027'];
  
  years.forEach(year => {
    const yearData = member[year] || {};
    const yearNum = parseInt(year);
    
    MONTHS.forEach((month, monthIndex) => {
      const monthPayment = yearData[month] || 0;
      totalPaid += monthPayment;
      
      // Track the last month they paid
      if (monthPayment > 0) {
        lastPaidMonth = month;
        lastPaidYear = year;
      }
      
      // Calculate what they owe up to current month
      // Only count months that have passed (up to current date)
      if (yearNum < currentYear || (yearNum === currentYear && monthIndex <= currentMonth)) {
        totalDue += MONTHLY_FEE;
      }
    });
  });
  
  // Determine what month they're paid up to
  if (lastPaidYear && lastPaidMonth) {
    const monthIndex = MONTHS.indexOf(lastPaidMonth);
    const nextMonthIndex = (monthIndex + 1) % 12;
    const nextYear = nextMonthIndex === 0 ? parseInt(lastPaidYear) + 1 : parseInt(lastPaidYear);
    
    // Check if the next month they need to pay is in the future
    if (nextYear > currentYear || (nextYear === currentYear && nextMonthIndex > currentMonth)) {
      // They're paid ahead - show the last month they paid
      paidUpTo = `${MONTH_NAMES[monthIndex]} ${lastPaidYear}`;
    } else {
      // They need to pay for the next month
      paidUpTo = `${MONTH_NAMES[nextMonthIndex]} ${nextYear}`;
    }
  }
  
  const currentBalance = totalPaid - totalDue;
  
  // Generate balance details
  let balanceDetails = '';
  if (currentBalance > 0) {
    balanceDetails = `Paid ahead by $${currentBalance}`;
  } else if (currentBalance < 0) {
    balanceDetails = `Owes $${Math.abs(currentBalance)}`;
  } else {
    balanceDetails = 'Up to date';
  }
  
  // Payment status based on current date
  let paymentStatus = '';
  if (currentBalance >= 0) {
    paymentStatus = '✅ Current';
  } else if (currentBalance >= -MONTHLY_FEE) {
    paymentStatus = '⚠️ 1 month behind';
  } else {
    const monthsBehind = Math.ceil(Math.abs(currentBalance) / MONTHLY_FEE);
    paymentStatus = `❌ ${monthsBehind} months behind`;
  }
  
  return {
    currentBalance: currentBalance,
    totalDue: totalDue,
    totalPaid: totalPaid,
    paidUpTo: paidUpTo,
    balanceDetails: balanceDetails,
    paymentStatus: paymentStatus,
    lastPaidMonth: lastPaidMonth,
    lastPaidYear: lastPaidYear
  };
}

// Record a payment for a member
function recordPayment(memberName, paymentYear, paymentMonth, paymentAmount, paymentNotes) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    if (!sheet) {
      throw new Error('Sheet not found');
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    // Find the member row
    let memberRowIndex = -1;
    for (let i = 1; i < data.length; i++) {
      if (data[i][1] === memberName) {
        memberRowIndex = i;
        break;
      }
    }
    
    if (memberRowIndex === -1) {
      throw new Error('Member not found');
    }
    
    // Calculate column index based on year and month
    const yearStartColumns = {
      '2024': 4,
      '2025': 16,
      '2026': 28,
      '2027': 40
    };
    
    const startColumn = yearStartColumns[paymentYear];
    if (startColumn === undefined) {
      throw new Error('Invalid payment year');
    }
    
    const monthIndex = MONTHS.indexOf(paymentMonth);
    if (monthIndex === -1) {
      throw new Error('Invalid payment month');
    }
    
    const columnIndex = startColumn + monthIndex;
    
    // Update the payment amount
    const currentAmount = parseFloat(data[memberRowIndex][columnIndex]) || 0;
    const newAmount = currentAmount + paymentAmount;
    sheet.getRange(memberRowIndex + 1, columnIndex + 1).setValue(newAmount);
    
    // Log the payment
    logPayment(memberName, paymentYear, paymentMonth, paymentAmount, paymentNotes);
    
    return { success: true, message: 'Payment recorded successfully' };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

// Add a new member
function addNewMember(memberData) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    if (!sheet) {
      throw new Error('Sheet not found');
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    // Create new row data with multi-year structure
    const newRow = new Array(headers.length).fill('');
    newRow[0] = data.length; // ID
    newRow[1] = memberData.name;
    newRow[2] = memberData.phone;
    newRow[3] = memberData.registration || 0;
    
    // Add initial payment if specified
    if (memberData.initialYear && memberData.initialMonth && memberData.initialPayment) {
      const yearStartColumns = {
        '2024': 4,
        '2025': 16,
        '2026': 28,
        '2027': 40
      };
      
      const startColumn = yearStartColumns[memberData.initialYear];
      const monthIndex = MONTHS.indexOf(memberData.initialMonth);
      
      if (startColumn !== undefined && monthIndex !== -1) {
        const columnIndex = startColumn + monthIndex;
        newRow[columnIndex] = memberData.initialPayment;
      }
    }
    
    // Add the new row
    sheet.appendRow(newRow);
    
    return { success: true, message: 'Member added successfully' };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

// Search members
function searchMembers(searchTerm) {
  try {
    const result = getAllMembers();
    if (!result.success) {
      return result;
    }
    
    const filteredMembers = result.data.filter(member => 
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.phone.includes(searchTerm) ||
      member.id.toString().includes(searchTerm)
    );
    
    return { success: true, data: filteredMembers };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

// Get member details
function getMemberDetails(searchTerm) {
  try {
    const result = getAllMembers();
    if (!result.success) {
      return result;
    }
    
    const member = result.data.find(m => 
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.phone.includes(searchTerm) ||
      m.id.toString() === searchTerm
    );
    
    if (!member) {
      return { success: false, error: 'Member not found' };
    }
    
    const balanceInfo = calculateDetailedBalance(member);
    
    return { 
      success: true, 
      data: {
        member: member,
        balanceInfo: balanceInfo
      }
    };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

// Get payment statistics
function getPaymentStats() {
  try {
    const result = getAllMembers();
    if (!result.success) {
      return result;
    }
    
    const members = result.data;
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    let totalMembers = members.length;
    let paidMembers = 0;
    let unpaidMembers = 0;
    let totalRevenue = 0;
    
    members.forEach(member => {
      const balanceInfo = calculateDetailedBalance(member);
      if (balanceInfo.currentBalance >= 0) {
        paidMembers++;
      } else {
        unpaidMembers++;
      }
      totalRevenue += balanceInfo.totalPaid;
    });
    
    return {
      success: true,
      data: {
        totalMembers,
        paidMembers,
        unpaidMembers,
        totalRevenue
      }
    };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

// Send payment reminder
function sendPaymentReminder(memberName, balance) {
  try {
    const message = `Hi ${memberName}, your AAAC membership balance is $${Math.abs(balance)}. Please send payment via Zelle to aaaichicago@gmail.com. Thank you!`;
    
    // In a real implementation, you would integrate with SMS/email services
    // For now, we'll just log it
    logReminder(memberName, balance, message);
    
    return { success: true, message: 'Reminder logged successfully' };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

// Export data to CSV
function exportData() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    if (!sheet) {
      throw new Error('Sheet not found');
    }
    
    const data = sheet.getDataRange().getValues();
    const csvContent = data.map(row => row.join(',')).join('\n');
    
    return { success: true, data: csvContent };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

// Log payment activity
function logPayment(memberName, paymentYear, paymentMonth, paymentAmount, paymentNotes) {
  try {
    const logSheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Payment_Log');
    if (!logSheet) {
      // Create log sheet if it doesn't exist
      const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
      const newSheet = spreadsheet.insertSheet('Payment_Log');
      newSheet.getRange(1, 1, 1, 6).setValues([['Timestamp', 'Member', 'Year', 'Month', 'Amount', 'Notes']]);
    }
    
    const timestamp = new Date();
    logSheet.appendRow([timestamp, memberName, paymentYear, paymentMonth, paymentAmount, paymentNotes]);
  } catch (error) {
    console.error('Error logging payment:', error);
  }
}

// Log reminder activity
function logReminder(memberName, balance, message) {
  try {
    const logSheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Reminder_Log');
    if (!logSheet) {
      // Create log sheet if it doesn't exist
      const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
      const newSheet = spreadsheet.insertSheet('Reminder_Log');
      newSheet.getRange(1, 1, 1, 4).setValues([['Timestamp', 'Member', 'Balance', 'Message']]);
    }
    
    const timestamp = new Date();
    logSheet.appendRow([timestamp, memberName, balance, message]);
  } catch (error) {
    console.error('Error logging reminder:', error);
  }
}

// Setup function to create the initial spreadsheet structure
function setupSpreadsheet() {
  try {
    const spreadsheet = SpreadsheetApp.create('AAAC Payment Tracker 2026');
    const sheet = spreadsheet.getActiveSheet();
    sheet.setName(SHEET_NAME);
    
    // Set up headers for multi-year structure
    const headers = [
      'ID', 'NAME', 'PHONE NUMBER', 'RegistratioN',
      // 2024
      '2024_JAN', '2024_FEB', '2024_MAR', '2024_APR', '2024_MAY', '2024_JUNE',
      '2024_JULY', '2024_AUG', '2024_SEPT', '2024_OCT', '2024_NOV', '2024_DEC',
      // 2025
      '2025_JAN', '2025_FEB', '2025_MAR', '2025_APR', '2025_MAY', '2025_JUNE',
      '2025_JULY', '2025_AUG', '2025_SEPT', '2025_OCT', '2025_NOV', '2025_DEC',
      // 2026
      '2026_JAN', '2026_FEB', '2026_MAR', '2026_APR', '2026_MAY', '2026_JUNE',
      '2026_JULY', '2026_AUG', '2026_SEPT', '2026_OCT', '2026_NOV', '2026_DEC',
      // 2027
      '2027_JAN', '2027_FEB', '2027_MAR', '2027_APR', '2027_MAY', '2027_JUNE',
      '2027_JULY', '2027_AUG', '2027_SEPT', '2027_OCT', '2027_NOV', '2027_DEC'
    ];
    
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    // Format headers
    sheet.getRange(1, 1, 1, headers.length)
      .setBackground('#2c3e50')
      .setFontColor('white')
      .setFontWeight('bold');
    
    // Set column widths
    sheet.setColumnWidth(1, 50);  // ID
    sheet.setColumnWidth(2, 200); // NAME
    sheet.setColumnWidth(3, 120); // PHONE
    sheet.setColumnWidth(4, 100); // Registration
    
    // Set month column widths
    for (let i = 5; i <= headers.length; i++) {
      sheet.setColumnWidth(i, 80);
    }
    
    // Freeze header row
    sheet.setFrozenRows(1);
    
    // Add some sample data
    const sampleData = [
      [1, 'HABTAMU BAKANA', '7734941942', 0, 
       // 2024
       0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
       // 2025
       0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
       // 2026
       0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
       // 2027
       0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
      ],
      [2, 'BIRUK TITO EYESUE', '7736540023', 200,
       // 2024
       0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
       // 2025
       0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
       // 2026
       15, 15, 15, 15, 0, 0, 0, 0, 0, 0, 0, 0,
       // 2027
       0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
      ]
    ];
    
    if (sampleData.length > 0) {
      sheet.getRange(2, 1, sampleData.length, headers.length).setValues(sampleData);
    }
    
    // Set up data validation for payment amounts
    const paymentRange = sheet.getRange(2, 5, sheet.getLastRow() - 1, headers.length - 4);
    const rule = SpreadsheetApp.newDataValidation()
      .requireNumberBetween(0, 1000)
      .setAllowInvalid(false)
      .setHelpText('Enter payment amount between 0 and 1000')
      .build();
    paymentRange.setDataValidation(rule);
    
    console.log('Spreadsheet created successfully. ID: ' + spreadsheet.getId());
    return spreadsheet.getId();
  } catch (error) {
    console.error('Error setting up spreadsheet:', error);
    throw error;
  }
}

// Function to sync data from CSV file
function syncFromCSV(csvData) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    if (!sheet) {
      throw new Error('Sheet not found');
    }
    
    const lines = csvData.split('\n');
    const data = [];
    
    for (let i = 1; i < lines.length; i++) { // Skip header
      if (lines[i].trim()) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values[1] && values[1] !== 'NAME') {
          // Convert old format to new multi-year format
          const newRow = new Array(52).fill(0); // 52 columns total
          newRow[0] = values[0]; // ID
          newRow[1] = values[1]; // NAME
          newRow[2] = values[2]; // PHONE
          newRow[3] = values[3]; // Registration
          
          // Map 2026 data to the correct columns (columns 28-39)
          for (let j = 4; j <= 15; j++) {
            newRow[27 + j] = values[j] || 0; // 2026 data starts at column 28
          }
          
          data.push(newRow);
        }
      }
    }
    
    if (data.length > 0) {
      // Clear existing data (except header)
      const lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).clear();
      }
      
      // Add new data
      sheet.getRange(2, 1, data.length, data[0].length).setValues(data);
    }
    
    return { success: true, message: 'Data synced successfully' };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}
