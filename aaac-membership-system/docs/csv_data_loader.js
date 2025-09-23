// CSV Data Loader for AAAC Dashboard
// This module loads member data from CSV files and prepares it for the enhanced financial logic

class CSVDataLoader {
    constructor() {
        this.members = [];
        this.loaded = false;
    }

    // Load all member data from CSV files
    async loadAllData() {
        try {
            console.log('🔄 Loading member data from CSV files...');
            
            // FORCE SINGLE SOURCE: Use accountant database only (avoid shrinking counts)
            let accountantData = await this.loadAccountantDatabase();
            console.log(`✅ Loaded accountant database: ${accountantData.length} records`);
            
            // Retry without cache-bust if empty
            if (!accountantData || accountantData.length === 0) {
                console.warn('⚠️ 0 records from CSV. Retrying without cache-bust...');
                accountantData = await this.loadAccountantDatabase(true);
                console.log(`↩️ Retry got ${accountantData.length} records`);
            }
            
            // If still empty, restore from cache
            if (!accountantData || accountantData.length === 0) {
                const cached = localStorage.getItem('aaacMembersCache');
                if (cached) {
                    console.warn('⚠️ Using cached members dataset');
                    this.members = JSON.parse(cached);
                    this.loaded = true;
                    return this.members;
                }
                console.warn('⚠️ No cache found; using embedded sample');
                this.members = this.loadEmbeddedData();
                this.loaded = true;
                return this.members;
            }
            
            // Merge with empty contact list (keeps all accountant rows)
            const contactList = [];
            this.members = this.mergeMemberData(contactList, accountantData);
            console.log(`📈 Member count after merge (contacts disabled): ${this.members.length}`);
            
            // Initialize payment records for existing members
            this.initializePaymentRecords();
            console.log(`🧾 Payment records initialized for ${this.members.length} members`);
            
            // Cache the successful dataset
            try {
                localStorage.setItem('aaacMembersCache', JSON.stringify(this.members));
                console.log('💾 Cached members dataset');
            } catch (e) {
                console.warn('⚠️ Could not cache dataset:', e);
            }
            
            this.loaded = true;
            console.log('🎉 All member data loaded successfully!');
            
            return this.members;
            
        } catch (error) {
            console.error('❌ Error loading member data:', error);
            // Fallback to cache or embedded
            const cached = localStorage.getItem('aaacMembersCache');
            if (cached) {
                console.warn('⚠️ Falling back to cached members dataset');
                this.members = JSON.parse(cached);
                this.loaded = true;
                return this.members;
            }
            console.warn('⚠️ No cache available; loading embedded sample');
            this.members = this.loadEmbeddedData();
            this.loaded = true;
            return this.members;
        }
    }

    // Load contact list for member names and IDs
    async loadContactList() {
        try {
            const response = await fetch('data/AAAC_members_contact_list.xlsx - Sheet1.csv');
            if (!response.ok) {
                throw new Error(`Failed to load contact list: ${response.status}`);
            }
            
            const csvText = await response.text();
            return this.parseCSV(csvText);
            
        } catch (error) {
            console.warn('⚠️ Could not load contact list, using accountant database only');
            return [];
        }
    }

    // Load accountant database (primary data source)
    async loadAccountantDatabase(retryWithoutBust = false) {
        try {
            console.log('🔄 Attempting to load CSV data...');
            const cacheBust = `v=${Date.now()}`;
            const base = 'data/AAAC_Accountant_Database_20250826.csv';
            const url = retryWithoutBust ? base : `${base}?${cacheBust}`;
            const response = await fetch(url, {
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    Pragma: 'no-cache',
                    Expires: '0'
                }
            });
            if (!response.ok) {
                throw new Error(`Failed to load accountant database: ${response.status}`);
            }
            const csvText = await response.text();
            console.log('✅ CSV data loaded successfully');
            return this.parseCSV(csvText);
        } catch (error) {
            console.error('❌ Failed to load accountant database:', error);
            // Let caller decide fallback path
            return [];
        }
    }
    
    // Load embedded data as fallback
    loadEmbeddedData() {
        console.log('🔄 Loading embedded member data...');
        // This will be populated with actual data if CSV loading fails
        const embeddedData = [
            {
                id: '1',
                name: 'Habtamu Bekuma Bekana',
                phone: '7734941942',
                status: 'Active',
                firstPaymentYear: '2022',
                registrationFeePaid: '0',
                registrationFeeAmount: '200',
                lastPaymentDate: 'JUN 2025',
                notes: '',
                '2022': { JAN: 15, FEB: 15, MAR: 15, APR: 15, MAY: 15, JUN: 15, JUL: 15, AUG: 15, SEP: 15, OCT: 15, NOV: 15, DEC: 15 },
                '2023': { JAN: 15, FEB: 15, MAR: 15, APR: 15, MAY: 15, JUN: 15, JUL: 15, AUG: 15, SEP: 15, OCT: 15, NOV: 15, DEC: 15 },
                '2024': { JAN: 15, FEB: 15, MAR: 15, APR: 15, MAY: 15, JUN: 15, JUL: 15, AUG: 15, SEP: 15, OCT: 15, NOV: 15, DEC: 15 },
                '2025': { JAN: 15, FEB: 15, MAR: 15, APR: 15, MAY: 15, JUN: 0, JUL: 0, AUG: 0, SEP: 0, OCT: 0, NOV: 0, DEC: 0 },
                '2026': { JAN: 0, FEB: 0, MAR: 0, APR: 0, MAY: 0, JUN: 0, JUL: 0, AUG: 0, SEP: 0, OCT: 0, NOV: 0, DEC: 0 },
                incidentals: { 2022: 0, 2023: 0, 2024: 0, 2025: 0, 2026: 0 }
            }
        ];
        console.log('✅ Embedded data loaded:', embeddedData.length, 'members');
        return embeddedData;
    }

    // Parse CSV text into array of objects
    parseCSV(csvText) {
        const lines = csvText.trim().split('\n');
        if (lines.length < 2) {
            return [];
        }
        
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const data = [];
        
        for (let i = 1; i < lines.length; i++) {
            const values = this.parseCSVLine(lines[i]);
            if (values.length === headers.length) {
                const row = {};
                headers.forEach((header, index) => {
                    row[header] = values[index] ? values[index].trim().replace(/"/g, '') : '';
                });
                data.push(row);
            }
        }
        
        return data;
    }

    // Parse CSV line handling quoted values
    parseCSVLine(line) {
        const values = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        
        values.push(current);
        return values;
    }

    // Merge contact list and accountant database data
    mergeMemberData(contactList, accountantData) {
        const mergedMembers = [];
        const contactMap = new Map();
        
        // Create map from contact list
        contactList.forEach(contact => {
            const id = contact['Number'] || contact['ID'] || contact['Member_ID'];
            const name = contact['Full Name Clean'] || contact['Name'] || contact['Full Name'];
            if (id && name) {
                contactMap.set(id, {
                    id: id,
                    name: name,
                    phone: contact['Phone'] || '',
                    email: contact['Email'] || ''
                });
            }
        });
        
        // Merge with accountant database
        accountantData.forEach(accountant => {
            const id = accountant['Member_ID'] || accountant['ID'];
            const name = accountant['Name'];
            
            if (id && name) {
                // Get contact info if available
                const contactInfo = contactMap.get(id) || {};
                
                const member = {
                    id: id,
                    name: name,
                    phone: contactInfo.phone || accountant['Phone'] || '',
                    email: contactInfo.email || '',
                    status: accountant['Status'] || 'Active',
                    firstPaymentYear: accountant['First_Payment_Year'] || '',
                    registrationFeePaid: accountant['Registration_Fee_Paid'] === '1',
                    registrationFeeAmount: parseFloat(accountant['Registration_Fee_Amount']) || 0,
                    lastPaymentDate: accountant['Last_Payment_Date'] || '',
                    notes: accountant['Notes'] || '',
                    
                    // Payment records (will be initialized)
                    paymentRecords: [],
                    registrationPayments: [],
                    monthlyPayments: [],
                    incidentalPayments: [],
                    
                    // Monthly payment data from YYYY_MMM columns
                    monthlyPayments: this.extractMonthlyPayments(accountant)
                };
                
                mergedMembers.push(member);
            }
        });
        
        return mergedMembers;
    }

    // Extract monthly payments from YYYY_MMM columns
    extractMonthlyPayments(accountantRecord) {
        const monthlyData = {};
        
        // Look for columns like "2022_JAN", "2022_FEB", etc.
        Object.keys(accountantRecord).forEach(key => {
            if (key.includes('_') && key.length === 8) {
                const parts = key.split('_');
                if (parts.length === 2) {
                    const year = parts[0];
                    const month = parts[1];
                    
                    if (/^\d{4}$/.test(year) && /^[A-Z]{3,4}$/.test(month)) {
                        const payment = parseFloat(accountantRecord[key]) || 0;
                        if (payment > 0) {
                            if (!monthlyData[year]) {
                                monthlyData[year] = {};
                            }
                            monthlyData[year][month] = payment;
                        }
                    }
                }
            }
        });
        
        return monthlyData;
    }

    // Initialize payment records for existing members
    initializePaymentRecords() {
        this.members.forEach(member => {
            // Initialize payment records array
            if (!member.paymentRecords) {
                member.paymentRecords = [];
            }
            
            // Add existing monthly payments as payment records
            if (member.monthlyPayments) {
                Object.keys(member.monthlyPayments).forEach(year => {
                    Object.keys(member.monthlyPayments[year]).forEach(month => {
                        const amount = member.monthlyPayments[year][month];
                        if (amount > 0) {
                            member.paymentRecords.push({
                                id: Date.now() + Math.random(),
                                date: this.getDateFromYearMonth(year, month),
                                amount: amount,
                                type: 'monthly',
                                notes: `Monthly payment for ${month} ${year}`,
                                recordedBy: 'system'
                            });
                        }
                    });
                });
            }
            
            // Add registration fee if paid
            if (member.registrationFeePaid && member.registrationFeeAmount > 0) {
                member.paymentRecords.push({
                    id: Date.now() + Math.random(),
                    date: member.firstPaymentYear ? `${member.firstPaymentYear}-01-01` : '2022-01-01',
                    amount: member.registrationFeeAmount,
                    type: 'registration',
                    notes: 'Registration fee',
                    recordedBy: 'system'
                });
            }
        });
    }

    // Get date string from year and month
    getDateFromYearMonth(year, month) {
        const monthMap = {
            'JAN': '01', 'FEB': '02', 'MAR': '03', 'APR': '04', 'MAY': '05', 'JUN': '06',
            'JUL': '07', 'JULY': '07', 'AUG': '08', 'SEP': '09', 'SEPT': '09', 'OCT': '10',
            'NOV': '11', 'DEC': '12'
        };
        
        const monthNum = monthMap[month.toUpperCase()] || '01';
        return `${year}-${monthNum}-01`;
    }

    // Get member by ID
    getMemberById(id) {
        return this.members.find(member => member.id === id);
    }

    // Get member by name
    getMemberByName(name) {
        return this.members.find(member => 
            member.name.toLowerCase().includes(name.toLowerCase())
        );
    }

    // Search members
    searchMembers(query) {
        if (!query || query.trim() === '') {
            return this.members;
        }
        
        const searchTerm = query.toLowerCase().trim();
        return this.members.filter(member => 
            member.name.toLowerCase().includes(searchTerm) ||
            member.id.toString().includes(searchTerm) ||
            (member.phone && member.phone.includes(searchTerm))
        );
    }

    // Get members by status
    getMembersByStatus(status) {
        return this.members.filter(member => member.status === status);
    }

    // Export data to CSV
    exportToCSV(members = null) {
        const dataToExport = members || this.members;
        
        if (dataToExport.length === 0) {
            return '';
        }
        
        const headers = [
            'ID', 'Name', 'Phone', 'Email', 'Status', 'Last Payment Date',
            'Months Behind', 'Total Owed', 'Current Balance', 'Notes'
        ];
        
        let csv = headers.join(',') + '\n';
        
        dataToExport.forEach(member => {
            const row = [
                member.id,
                `"${member.name}"`,
                member.phone || '',
                member.email || '',
                member.status || '',
                member.lastPaymentDate || '',
                member.monthsBehind || 0,
                member.totalOwed || 0,
                member.currentBalance || 0,
                `"${member.notes || ''}"`
            ];
            csv += row.join(',') + '\n';
        });
        
        return csv;
    }

    // Download CSV file
    downloadCSV(filename = 'aaac_members_export.csv') {
        const csv = this.exportToCSV();
        if (!csv) {
            console.error('No data to export');
            return;
        }
        
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CSVDataLoader;
}
