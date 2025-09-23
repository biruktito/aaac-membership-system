/**
 * AAAC Membership System - Persistent Storage using GitHub Gist API
 * Free alternative to Firebase for persistent data storage
 */

class GitHubGistStorage {
    constructor() {
        this.gistId = null;
        this.gistToken = null;
        this.paymentData = [];
        this.isInitialized = false;
        
        // Try to load existing configuration
        this.loadConfiguration();
    }

    /**
     * Initialize the storage system
     * @param {string} gistId - GitHub Gist ID (optional, will create if not provided)
     * @param {string} gistToken - GitHub Personal Access Token
     */
    async initialize(gistId = null, gistToken = null) {
        try {
            if (gistToken) {
                this.gistToken = gistToken;
                localStorage.setItem('aaacGistToken', gistToken);
            }

            if (gistId) {
                this.gistId = gistId;
                localStorage.setItem('aaacGistId', gistId);
            } else {
                // Try to load existing gist ID
                this.gistId = localStorage.getItem('aaacGistId');
            }

            if (!this.gistToken) {
                throw new Error('GitHub token required for persistent storage');
            }

            if (!this.gistId) {
                // Create new gist for payment data
                await this.createPaymentGist();
            }

            // Load existing payment data
            await this.loadPaymentData();
            
            this.isInitialized = true;
            console.log('✅ GitHub Gist storage initialized successfully');
            
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize GitHub Gist storage:', error);
            return false;
        }
    }

    /**
     * Create a new GitHub Gist for payment data
     */
    async createPaymentGist() {
        try {
            const gistData = {
                description: 'AAAC Membership System - Payment Records',
                public: false,
                files: {
                    'aaac-payments.json': {
                        content: JSON.stringify({
                            payments: [],
                            lastUpdated: new Date().toISOString(),
                            version: '1.0'
                        }, null, 2)
                    }
                }
            };

            const response = await fetch('https://api.github.com/gists', {
                method: 'POST',
                headers: {
                    'Authorization': `token ${this.gistToken}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/vnd.github.v3+json'
                },
                body: JSON.stringify(gistData)
            });

            if (!response.ok) {
                throw new Error(`Failed to create gist: ${response.statusText}`);
            }

            const gist = await response.json();
            this.gistId = gist.id;
            localStorage.setItem('aaacGistId', this.gistId);
            
            console.log('✅ Created new payment gist:', this.gistId);
            return this.gistId;
        } catch (error) {
            console.error('❌ Error creating payment gist:', error);
            throw error;
        }
    }

    /**
     * Load payment data from GitHub Gist
     */
    async loadPaymentData() {
        try {
            if (!this.gistId) {
                throw new Error('No gist ID available');
            }

            const response = await fetch(`https://api.github.com/gists/${this.gistId}`, {
                headers: {
                    'Authorization': `token ${this.gistToken}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to load gist: ${response.statusText}`);
            }

            const gist = await response.json();
            const paymentFile = gist.files['aaac-payments.json'];
            
            if (paymentFile && paymentFile.content) {
                const data = JSON.parse(paymentFile.content);
                this.paymentData = data.payments || [];
                console.log('✅ Loaded payment data from gist:', this.paymentData.length, 'payments');
            } else {
                this.paymentData = [];
                console.log('✅ No existing payment data found, starting fresh');
            }

            return this.paymentData;
        } catch (error) {
            console.error('❌ Error loading payment data:', error);
            this.paymentData = [];
            return [];
        }
    }

    /**
     * Save payment data to GitHub Gist
     */
    async savePaymentData() {
        try {
            if (!this.gistId || !this.gistToken) {
                throw new Error('Gist not initialized');
            }

            const gistData = {
                description: 'AAAC Membership System - Payment Records',
                files: {
                    'aaac-payments.json': {
                        content: JSON.stringify({
                            payments: this.paymentData,
                            lastUpdated: new Date().toISOString(),
                            version: '1.0'
                        }, null, 2)
                    }
                }
            };

            const response = await fetch(`https://api.github.com/gists/${this.gistId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `token ${this.gistToken}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/vnd.github.v3+json'
                },
                body: JSON.stringify(gistData)
            });

            if (!response.ok) {
                throw new Error(`Failed to save gist: ${response.statusText}`);
            }

            console.log('✅ Payment data saved to gist successfully');
            return true;
        } catch (error) {
            console.error('❌ Error saving payment data:', error);
            throw error;
        }
    }

    /**
     * Add a new payment record
     */
    async addPayment(payment) {
        try {
            if (!this.isInitialized) {
                throw new Error('Storage not initialized');
            }

            // Add payment with unique ID and timestamp
            const newPayment = {
                id: Date.now().toString(),
                ...payment,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            this.paymentData.push(newPayment);
            
            // Save to GitHub Gist
            await this.savePaymentData();
            
            console.log('✅ Payment added and saved:', newPayment);
            return newPayment;
        } catch (error) {
            console.error('❌ Error adding payment:', error);
            throw error;
        }
    }

    /**
     * Get all payment records
     */
    getPayments() {
        return this.paymentData;
    }

    /**
     * Get payments for a specific member
     */
    getMemberPayments(memberName) {
        return this.paymentData.filter(payment => payment.memberName === memberName);
    }

    /**
     * Update payment record
     */
    async updatePayment(paymentId, updates) {
        try {
            const paymentIndex = this.paymentData.findIndex(p => p.id === paymentId);
            if (paymentIndex === -1) {
                throw new Error('Payment not found');
            }

            this.paymentData[paymentIndex] = {
                ...this.paymentData[paymentIndex],
                ...updates,
                updatedAt: new Date().toISOString()
            };

            await this.savePaymentData();
            console.log('✅ Payment updated:', paymentId);
            return this.paymentData[paymentIndex];
        } catch (error) {
            console.error('❌ Error updating payment:', error);
            throw error;
        }
    }

    /**
     * Delete payment record
     */
    async deletePayment(paymentId) {
        try {
            const paymentIndex = this.paymentData.findIndex(p => p.id === paymentId);
            if (paymentIndex === -1) {
                throw new Error('Payment not found');
            }

            this.paymentData.splice(paymentIndex, 1);
            await this.savePaymentData();
            
            console.log('✅ Payment deleted:', paymentId);
            return true;
        } catch (error) {
            console.error('❌ Error deleting payment:', error);
            throw error;
        }
    }

    /**
     * Load configuration from localStorage
     */
    loadConfiguration() {
        this.gistToken = localStorage.getItem('aaacGistToken');
        this.gistId = localStorage.getItem('aaacGistId');
        
        if (this.gistToken && this.gistId) {
            console.log('📋 Loaded existing configuration');
        }
    }

    /**
     * Clear configuration
     */
    clearConfiguration() {
        this.gistToken = null;
        this.gistId = null;
        this.paymentData = [];
        this.isInitialized = false;
        
        localStorage.removeItem('aaacGistToken');
        localStorage.removeItem('aaacGistId');
        
        console.log('🗑️ Configuration cleared');
    }

    /**
     * Get storage status
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            hasToken: !!this.gistToken,
            hasGist: !!this.gistId,
            paymentCount: this.paymentData.length,
            lastUpdated: this.paymentData.length > 0 ? 
                this.paymentData[this.paymentData.length - 1].updatedAt : null
        };
    }
}

// Export for use in other files
window.GitHubGistStorage = GitHubGistStorage;
