// Enhanced Financial Logic for AAAC Dashboard
// This module enhances your existing system with payment type separation and corrected calculations
// WITHOUT changing your beautiful UI/UX

class EnhancedFinancialLogic {
    constructor() {
        this.monthlyFee = 15;
        this.registrationFee = 200;
        // Align with v2 (UTC start of September 2025)
        this.currentDate = new Date('2025-09-01T00:00:00Z');
        // Correct month keys (use JUL not JULY)
        this.months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    }

    // Enhanced balance calculation using per-month dues up to currentDate
    calculateEnhancedBalance(member) {
        const paymentsMap = this._normalizePayments(member);
        const start = this._inferStartDate(member);
        const end = new Date(Date.UTC(this.currentDate.getUTCFullYear(), this.currentDate.getUTCMonth(), 1));
        
        let totalPaid = 0;
        let totalOwed = 0;
        let monthsBehind = 0;
        let paidUpTo = null;

        const iter = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1));
        while (iter <= end) {
            const key = `${iter.getUTCFullYear()}-${String(iter.getUTCMonth()+1).padStart(2,'0')}`;
            const paid = Number(paymentsMap[key] || 0);
            totalPaid += paid;
            totalOwed += this.monthlyFee;
            if (paid >= this.monthlyFee) {
                paidUpTo = new Date(iter);
            } else {
                monthsBehind += 1;
            }
            iter.setUTCMonth(iter.getUTCMonth() + 1);
        }

        const currentBalance = totalPaid - totalOwed;
        let status = 'current';
        if (member.isActive === false) status = 'inactive';
        else if (currentBalance < 0) {
            if (monthsBehind >= 6) status = 'risk';
            else if (monthsBehind >= 3) status = 'issues';
            else status = 'behind';
        } else if (currentBalance > 0) {
            status = 'ahead';
        }

        const statusInfo = this.getStatusDisplay(status, monthsBehind);
        return {
            currentBalance,
            totalPaid,
            totalOwed,
            monthsBehind,
            lastPaymentMonth: paidUpTo,
            status,
            statusText: statusInfo.text,
            statusClass: statusInfo.class,
            paidUpTo: this.getPaidUpToText(paidUpTo, monthsBehind),
            balanceDetails: this.getBalanceDetails(currentBalance, monthsBehind, paidUpTo)
        };
    }

    _inferStartDate(member) {
        const startStr = member.startDate || (member.firstPaymentYear ? `${member.firstPaymentYear}-01-01` : '2020-01-01');
        const d = new Date(startStr);
        const fallback = new Date('2020-01-01T00:00:00Z');
        const parsed = isNaN(d.getTime()) ? fallback : new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
        // Baseline cutoff: January 2022
        const cutoff = new Date(Date.UTC(2022, 0, 1));
        return parsed < cutoff ? cutoff : parsed;
    }

    _normalizePayments(member) {
        // Prefer Firestore map: { 'YYYY-MM': amount }
        if (member.payments && typeof member.payments === 'object') {
            return { ...member.payments };
        }

        // Convert year-bucket structure into map
        const map = {};
        const years = ['2022','2023','2024','2025','2026'];
        years.forEach(y => {
            const row = member[y] || (member.monthlyPayments && member.monthlyPayments[y]);
            if (row && typeof row === 'object') {
                this.months.forEach((mon, idx) => {
                    const amt = Number(row[mon] || 0);
                    const key = `${y}-${String(idx+1).padStart(2,'0')}`;
                    if (amt > 0) map[key] = amt;
                });
            }
        });

        // Also include explicit paymentRecords of monthly type
        if (Array.isArray(member.paymentRecords)) {
            member.paymentRecords.forEach(rec => {
                if (rec && rec.type === 'monthly' && Number(rec.amount) > 0 && rec.date) {
                    const d = new Date(rec.date);
                    if (!isNaN(d)) {
                        const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
                        map[key] = (map[key] || 0) + Number(rec.amount);
                    }
                }
            });
        }
        return map;
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
