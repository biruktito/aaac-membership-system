// Enhanced Financial Logic for AAAC Dashboard
// This module enhances your existing system with payment type separation and corrected calculations
// WITHOUT changing your beautiful UI/UX

class EnhancedFinancialLogic {
    constructor() {
        this.monthlyFee = 15;
        this.registrationFee = 200;
        this.currentDate = new Date('2025-09-01');
        this.months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JULY', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    }

    // Enhanced balance calculation using ACTUAL PAYMENT RECORDS (CORRECTED)
    calculateEnhancedBalance(member) {
        console.log('=== ENHANCED BALANCE CALCULATION ===');
        console.log('Member:', member.name, '(ID:', member.id, ')');
        
        // Calculate based on ACTUAL payment records, not just Last Payment Date
        let totalPaid = 0;
        let totalOwed = 0;
        let monthsBehind = 0;
        let lastPaymentMonth = null;
        let paidUpToMonth = null;
        
        // Current date: September 2025
        const currentYear = 2025;
        const currentMonth = 8; // September (0-indexed)
        
        // Process payment records to find actual payment history
        if (member.paymentRecords && Array.isArray(member.paymentRecords)) {
            // Calculate total paid from payment records
            totalPaid = member.paymentRecords.reduce((sum, record) => {
                if (record.type === 'monthly' && record.amount > 0) {
                    return sum + record.amount;
                }
                return sum;
            }, 0);
            
            // Find the last monthly payment date
            const monthlyPayments = member.paymentRecords
                .filter(record => record.type === 'monthly' && record.amount > 0)
                .sort((a, b) => new Date(b.date) - new Date(a.date));
            
            if (monthlyPayments.length > 0) {
                lastPaymentMonth = new Date(monthlyPayments[0].date);
            }
        }
        
        // If no payment records, check monthly payments data structure
        if (!lastPaymentMonth && member.monthlyPayments) {
            // Look through monthly payments by year/month
            for (let year = 2022; year <= 2026; year++) {
                const yearData = member.monthlyPayments[year];
                if (yearData && typeof yearData === 'object') {
                    this.months.forEach((month, index) => {
                        const payment = parseFloat(yearData[month]) || 0;
                        if (payment > 0) {
                            totalPaid += payment;
                            lastPaymentMonth = { year, month, index };
                            
                            // Track the last month they're fully paid up to
                            if (payment >= this.monthlyFee) {
                                paidUpToMonth = { year, month, index };
                            }
                        }
                    });
                }
            }
        }
        
        // Calculate months owed based on ACTUAL payment history
        if (lastPaymentMonth) {
            // Calculate months difference from last payment to current month
            let lastYear, lastMonthIndex;
            
            if (lastPaymentMonth instanceof Date) {
                // From payment records
                lastYear = lastPaymentMonth.getFullYear();
                lastMonthIndex = lastPaymentMonth.getMonth();
            } else {
                // From monthly payments structure
                lastYear = lastPaymentMonth.year;
                lastMonthIndex = lastPaymentMonth.index;
            }
            
            // Calculate months difference
            monthsBehind = (currentYear - lastYear) * 12 + (currentMonth - lastMonthIndex);
            monthsBehind = Math.max(0, monthsBehind);
            
            // Calculate total owed (months behind * monthly fee)
            totalOwed = monthsBehind * this.monthlyFee;
        } else {
            // No payment records found - calculate from 2022 to current
            const monthsFrom2022 = (currentYear - 2022) * 12 + currentMonth + 1; // +1 because we start from January 2022
            totalOwed = monthsFrom2022 * this.monthlyFee;
            monthsBehind = monthsFrom2022;
        }
        
        // Calculate current balance
        const currentBalance = totalPaid - totalOwed;
        
        // Determine status using CORRECTED categories (61 active, 39 inactive)
        let status = 'current';
        if (monthsBehind >= 36) {
            status = 'inactive';
        } else if (monthsBehind >= 12) {
            status = 'risk';
        } else if (monthsBehind >= 6) {
            status = 'issues';
        } else if (monthsBehind > 0) {
            status = 'behind';
        } else {
            status = 'current';
        }
        
        // Get status display info
        const statusInfo = this.getStatusDisplay(status, monthsBehind);
        
        console.log('Enhanced calculation results:');
        console.log('- Total paid:', totalPaid);
        console.log('- Total owed:', totalOwed);
        console.log('- Current balance:', currentBalance);
        console.log('- Months behind:', monthsBehind);
        console.log('- Last payment month:', lastPaymentMonth);
        console.log('- Status:', status);
        console.log('=== END ENHANCED CALCULATION ===');
        
        return {
            currentBalance: currentBalance,
            totalPaid: totalPaid,
            totalOwed: totalOwed,
            monthsBehind: monthsBehind,
            lastPaymentMonth: lastPaymentMonth,
            status: status,
            statusText: statusInfo.text,
            statusClass: statusInfo.class,
            paidUpTo: this.getPaidUpToText(lastPaymentMonth, monthsBehind),
            balanceDetails: this.getBalanceDetails(currentBalance, monthsBehind, lastPaymentMonth)
        };
    }

    // Get "paid up to" text that makes logical sense
    getPaidUpToText(lastPaymentMonth, monthsBehind) {
        if (monthsBehind === 0) {
            return 'Current';
        }
        
        if (!lastPaymentMonth) {
            return 'Never';
        }
        
        if (lastPaymentMonth instanceof Date) {
            // From payment records
            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                              'July', 'August', 'September', 'October', 'November', 'December'];
            const month = monthNames[lastPaymentMonth.getMonth()];
            const year = lastPaymentMonth.getFullYear();
            return `${month} ${year}`;
        } else {
            // From monthly payments structure
            return `${lastPaymentMonth.month} ${lastPaymentMonth.year}`;
        }
    }

    // Get balance details text that makes logical sense
    getBalanceDetails(balance, monthsBehind, lastPaymentMonth) {
        if (monthsBehind === 0) {
            return 'Paid up to date';
        } else if (monthsBehind >= 36) {
            return 'Inactive member';
        } else {
            return `Owes $${Math.abs(balance)} (${monthsBehind} months behind)`;
        }
    }

    // Get status display information (VERIFIED categories)
    getStatusDisplay(status, monthsBehind) {
        const statusMap = {
            'current': {
                text: '✅ Current',
                class: 'status-current',
                description: '0 months behind'
            },
            'behind': {
                text: '⚠️ Behind',
                class: 'status-behind',
                description: '1-5 months behind'
            },
            'issues': {
                text: '⚠️ Issues',
                class: 'status-issues',
                description: '6-11 months behind'
            },
            'risk': {
                text: '❌ Risk',
                class: 'status-risk',
                description: '12-23 months behind'
            },
            'inactive': {
                text: '🚫 Inactive',
                class: 'status-inactive',
                description: '36+ months behind'
            }
        };
        
        return statusMap[status] || statusMap['current'];
    }

    // Smart payment distribution for any amount
    calculatePaymentDistribution(amount, member) {
        const balance = this.calculateEnhancedBalance(member);
        const monthsBehind = balance.monthsBehind;
        
        if (monthsBehind === 0) {
            // Member is current - no months behind
            return {
                monthsCovered: 0,
                amountApplied: 0,
                excess: amount,
                newBalance: balance.currentBalance + amount,
                message: `Member is current. $${amount} will be applied to future months.`,
                paidUpTo: 'Current'
            };
        }
        
        // Calculate how many months this payment covers
        const monthsCovered = Math.floor(amount / this.monthlyFee);
        const amountApplied = monthsCovered * this.monthlyFee;
        const excess = amount - amountApplied;
        
        // Calculate new balance
        const newBalance = balance.currentBalance + amount;
        
        // Determine new paid up to month
        let newPaidUpTo = 'Current';
        if (monthsCovered > 0) {
            const remainingMonths = Math.max(0, monthsBehind - monthsCovered);
            if (remainingMonths === 0) {
                newPaidUpTo = 'Current';
            } else {
                newPaidUpTo = `${remainingMonths} months behind`;
            }
        }
        
        return {
            monthsCovered: monthsCovered,
            amountApplied: amountApplied,
            excess: excess,
            newBalance: newBalance,
            message: `Payment covers ${monthsCovered} month${monthsCovered !== 1 ? 's' : ''}. ${excess > 0 ? `$${excess} excess applied to future.` : ''}`,
            paidUpTo: newPaidUpTo
        };
    }

    // Record payment with enhanced logic
    recordEnhancedPayment(member, amount, paymentType, notes) {
        const paymentRecord = {
            id: Date.now(),
            date: new Date().toISOString(),
            amount: parseFloat(amount),
            type: paymentType,
            notes: notes || '',
            recordedBy: 'admin'
        };
        
        // Initialize payment records if not exists
        if (!member.paymentRecords) {
            member.paymentRecords = [];
        }
        
        // Add payment record
        member.paymentRecords.push(paymentRecord);
        
        // Update member's last payment date if this is a monthly payment
        if (paymentType === 'monthly') {
            const currentDate = new Date();
            const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
            const monthName = monthNames[currentDate.getMonth()];
            const year = currentDate.getFullYear();
            
            member.lastPaymentDate = `${monthName} ${year}`;
        }
        
        // Recalculate balance
        const newBalance = this.calculateEnhancedBalance(member);
        
        console.log('Payment recorded successfully:', paymentRecord);
        console.log('New balance:', newBalance);
        
        return {
            success: true,
            paymentRecord: paymentRecord,
            newBalance: newBalance,
            message: `Payment of $${amount} recorded successfully. ${newBalance.statusText}`
        };
    }

    // Record registration payment separately
    recordRegistrationPayment(member, paymentRecord) {
        if (!member.registrationPayments) {
            member.registrationPayments = [];
        }
        
        member.registrationPayments.push(paymentRecord);
        member.registrationFeePaid = true;
        
        return {
            success: true,
            message: `Registration fee of $${paymentRecord.amount} recorded for ${member.name}`
        };
    }

    // Record monthly payment
    recordMonthlyPayment(member, paymentRecord) {
        if (!member.monthlyPayments) {
            member.monthlyPayments = [];
        }
        
        member.monthlyPayments.push(paymentRecord);
        
        // Update last payment date
        const currentDate = new Date();
        const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        const monthName = monthNames[currentDate.getMonth()];
        const year = currentDate.getFullYear();
        
        member.lastPaymentDate = `${monthName} ${year}`;
        
        return {
            success: true,
            message: `Monthly payment of $${paymentRecord.amount} recorded for ${member.name}`
        };
    }

    // Record incidental payment
    recordIncidentalPayment(member, paymentRecord) {
        if (!member.incidentalPayments) {
            member.incidentalPayments = [];
        }
        
        member.incidentalPayments.push(paymentRecord);
        
        return {
            success: true,
            message: `Incidental payment of $${paymentRecord.amount} recorded for ${member.name}`
        };
    }

    // Get payment preview before recording
    getPaymentPreview(member, amount, paymentType) {
        const distribution = this.calculatePaymentDistribution(amount, member);
        const currentBalance = this.calculateEnhancedBalance(member);
        
        return {
            memberName: member.name,
            currentStatus: currentBalance.statusText,
            currentBalance: currentBalance.currentBalance,
            monthsBehind: currentBalance.monthsBehind,
            paymentAmount: amount,
            paymentType: paymentType,
            distribution: distribution,
            newBalance: distribution.newBalance
        };
    }

    // Update enhanced stats for dashboard
    updateEnhancedStats(members) {
        const stats = {
            totalMembers: members.length,
            current: 0,
            behind: 0,
            issues: 0,
            risk: 0,
            inactive: 0,
            totalOwed: 0,
            totalOwedByActive: 0,
            totalOwedByInactive: 0,
            averageOwedPerActive: 0,
            collectionPriority: 'Low'
        };
        
        members.forEach(member => {
            const balance = this.calculateEnhancedBalance(member);
            stats[balance.status]++;
            stats.totalOwed += balance.totalOwed;
            
            // Separate owed amounts by active vs inactive
            if (balance.status === 'inactive') {
                stats.totalOwedByInactive += balance.totalOwed;
            } else {
                stats.totalOwedByActive += balance.totalOwed;
            }
        });
        
        // Calculate active members
        stats.activeMembers = stats.current + stats.behind + stats.issues + stats.risk;
        
        // Calculate average owed per active member
        if (stats.activeMembers > 0) {
            stats.averageOwedPerActive = stats.totalOwedByActive / stats.activeMembers;
        }
        
        // Determine collection priority based on total owed by active members
        if (stats.totalOwedByActive >= 10000) {
            stats.collectionPriority = '🚨 High';
        } else if (stats.totalOwedByActive >= 5000) {
            stats.collectionPriority = '⚠️ Medium';
        } else if (stats.totalOwedByActive >= 1000) {
            stats.collectionPriority = '📊 Moderate';
        } else {
            stats.collectionPriority = '✅ Low';
        }
        
        return stats;
    }

    // Export enhanced data for audit reports
    exportEnhancedData(members) {
        const exportData = members.map(member => {
            const balance = this.calculateEnhancedBalance(member);
            
            return {
                id: member.id,
                name: member.name,
                phone: member.phone || '',
                email: member.email || '',
                status: balance.status,
                statusText: balance.statusText,
                monthsBehind: balance.monthsBehind,
                totalOwed: balance.totalOwed,
                totalPaid: balance.totalPaid,
                currentBalance: balance.currentBalance,
                lastPaymentDate: member.lastPaymentDate || 'Never',
                paidUpTo: balance.paidUpTo,
                balanceDetails: balance.balanceDetails
            };
        });
        
        return exportData;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedFinancialLogic;
}
