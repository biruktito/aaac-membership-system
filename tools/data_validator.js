/**
 * AAAC Data Validator and Phone Normalizer
 * Validates member data and normalizes phone numbers
 */

class AAACDataValidator {
  constructor() {
    this.DUE = 15;
    this.CURRENT_MONTH_STR = '2025-09';
    this.CURRENT_DATE = new Date(this.CURRENT_MONTH_STR + '-01T00:00:00Z');
    this.THIRTY_SIX_MONTHS_AGO = new Date(this.CURRENT_DATE);
    this.THIRTY_SIX_MONTHS_AGO.setUTCMonth(this.THIRTY_SIX_MONTHS_AGO.getUTCMonth() - 36);
  }

  /**
   * Normalize phone number to digits-only format
   * @param {string} phone - Raw phone number
   * @returns {string} - Normalized phone (digits only, 10-14 digits)
   */
  normalizePhone(phone) {
    if (!phone || typeof phone !== 'string') return '';
    
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');
    
    // Validate length (10-14 digits)
    if (digits.length < 10 || digits.length > 14) return '';
    
    return digits;
  }

  /**
   * Validate member ID format
   * @param {any} memberId - Member ID to validate
   * @returns {boolean} - Is valid
   */
  validateMemberId(memberId) {
    if (!memberId) return false;
    const id = String(memberId).trim();
    return /^\d+$/.test(id) && parseInt(id) > 0;
  }

  /**
   * Validate full name
   * @param {any} fullName - Full name to validate
   * @returns {boolean} - Is valid
   */
  validateFullName(fullName) {
    return fullName && typeof fullName === 'string' && fullName.trim().length > 0;
  }

  /**
   * Validate payments object
   * @param {any} payments - Payments object to validate
   * @returns {object} - Validation result
   */
  validatePayments(payments) {
    const result = {
      isValid: true,
      problems: [],
      normalizedPayments: {}
    };

    if (!payments || typeof payments !== 'object') {
      result.isValid = false;
      result.problems.push('Missing or invalid payments object');
      return result;
    }

    // Check each payment entry
    Object.keys(payments).forEach(key => {
      // Validate month key format (YYYY-MM)
      if (!/^\d{4}-\d{2}$/.test(key)) {
        result.problems.push(`Invalid month key format: ${key}`);
        result.isValid = false;
        return;
      }

      // Validate payment amount
      const amount = Number(payments[key]);
      if (isNaN(amount) || amount < 0) {
        result.problems.push(`Invalid payment amount for ${key}: ${payments[key]}`);
        result.isValid = false;
        return;
      }

      result.normalizedPayments[key] = amount;
    });

    return result;
  }

  /**
   * Validate start date
   * @param {any} startDate - Start date to validate
   * @returns {object} - Validation result
   */
  validateStartDate(startDate) {
    const result = {
      isValid: true,
      problems: [],
      normalizedDate: null
    };

    if (!startDate) {
      result.normalizedDate = null;
      return result;
    }

    const date = new Date(startDate);
    if (isNaN(date.getTime())) {
      result.isValid = false;
      result.problems.push(`Invalid start date format: ${startDate}`);
      return result;
    }

    // Check if date is reasonable (not too far in future, not before 2010)
    const now = new Date();
    const minDate = new Date('2010-01-01');
    
    if (date > now) {
      result.problems.push(`Start date is in the future: ${startDate}`);
    }
    
    if (date < minDate) {
      result.problems.push(`Start date is too old: ${startDate}`);
    }

    result.normalizedDate = date.toISOString().slice(0, 10);
    return result;
  }

  /**
   * Validate a single member record
   * @param {object} member - Member object to validate
   * @returns {object} - Validation result
   */
  validateMember(member) {
    const result = {
      memberId: member.memberId,
      fullName: member.fullName,
      isValid: true,
      problems: [],
      warnings: [],
      normalized: {}
    };

    // Validate member ID
    if (!this.validateMemberId(member.memberId)) {
      result.isValid = false;
      result.problems.push('Invalid or missing member ID');
    } else {
      result.normalized.memberId = String(member.memberId).trim();
    }

    // Validate full name
    if (!this.validateFullName(member.fullName)) {
      result.isValid = false;
      result.problems.push('Invalid or missing full name');
    } else {
      result.normalized.fullName = member.fullName.trim();
    }

    // Normalize phone number
    const normalizedPhone = this.normalizePhone(member.phone);
    if (member.phone && !normalizedPhone) {
      result.warnings.push(`Invalid phone number format: ${member.phone}`);
    }
    result.normalized.phone = normalizedPhone;

    // Validate payments
    const paymentsValidation = this.validatePayments(member.payments || member.paymentsDues);
    if (!paymentsValidation.isValid) {
      result.isValid = false;
      result.problems.push(...paymentsValidation.problems);
    }
    result.normalized.payments = paymentsValidation.normalizedPayments;

    // Validate start date
    const startDateValidation = this.validateStartDate(member.startDate);
    if (!startDateValidation.isValid) {
      result.isValid = false;
      result.problems.push(...startDateValidation.problems);
    }
    result.normalized.startDate = startDateValidation.normalizedDate;

    // Validate isActive flag
    if (typeof member.isActive !== 'boolean') {
      result.warnings.push('isActive should be boolean, defaulting to true');
      result.normalized.isActive = true;
    } else {
      result.normalized.isActive = member.isActive;
    }

    return result;
  }

  /**
   * Validate all members in a dataset
   * @param {array} members - Array of member objects
   * @returns {object} - Validation summary
   */
  validateAll(members) {
    const results = {
      totalMembers: members.length,
      validMembers: 0,
      invalidMembers: 0,
      membersWithWarnings: 0,
      totalProblems: 0,
      totalWarnings: 0,
      problemsByType: {},
      warningsByType: {},
      memberResults: [],
      summary: {
        phoneNormalization: {
          total: 0,
          normalized: 0,
          invalid: 0
        },
        dataQuality: {
          missingMemberIds: 0,
          missingNames: 0,
          invalidPayments: 0,
          invalidDates: 0
        }
      }
    };

    members.forEach(member => {
      const validation = this.validateMember(member);
      results.memberResults.push(validation);

      if (validation.isValid) {
        results.validMembers++;
      } else {
        results.invalidMembers++;
      }

      if (validation.warnings.length > 0) {
        results.membersWithWarnings++;
      }

      results.totalProblems += validation.problems.length;
      results.totalWarnings += validation.warnings.length;

      // Categorize problems and warnings
      validation.problems.forEach(problem => {
        const category = this.categorizeProblem(problem);
        results.problemsByType[category] = (results.problemsByType[category] || 0) + 1;
      });

      validation.warnings.forEach(warning => {
        const category = this.categorizeWarning(warning);
        results.warningsByType[category] = (results.warningsByType[category] || 0) + 1;
      });

      // Update summary statistics
      if (member.phone) {
        results.summary.phoneNormalization.total++;
        if (validation.normalized.phone) {
          results.summary.phoneNormalization.normalized++;
        } else {
          results.summary.phoneNormalization.invalid++;
        }
      }

      if (!validation.normalized.memberId) results.summary.dataQuality.missingMemberIds++;
      if (!validation.normalized.fullName) results.summary.dataQuality.missingNames++;
      if (validation.problems.some(p => p.includes('payment'))) results.summary.dataQuality.invalidPayments++;
      if (validation.problems.some(p => p.includes('date'))) results.summary.dataQuality.invalidDates++;
    });

    return results;
  }

  /**
   * Categorize problem type for reporting
   * @param {string} problem - Problem description
   * @returns {string} - Category
   */
  categorizeProblem(problem) {
    if (problem.includes('member ID')) return 'memberId';
    if (problem.includes('full name')) return 'fullName';
    if (problem.includes('phone')) return 'phone';
    if (problem.includes('payment')) return 'payments';
    if (problem.includes('date')) return 'startDate';
    return 'other';
  }

  /**
   * Categorize warning type for reporting
   * @param {string} warning - Warning description
   * @returns {string} - Category
   */
  categorizeWarning(warning) {
    if (warning.includes('phone')) return 'phone';
    if (warning.includes('isActive')) return 'isActive';
    return 'other';
  }

  /**
   * Generate a detailed validation report
   * @param {object} results - Validation results
   * @returns {string} - Formatted report
   */
  generateReport(results) {
    let report = `# AAAC Data Validation Report\n\n`;
    report += `**Generated:** ${new Date().toISOString()}\n\n`;
    
    report += `## Summary\n`;
    report += `- **Total Members:** ${results.totalMembers}\n`;
    report += `- **Valid Members:** ${results.validMembers} (${((results.validMembers / results.totalMembers) * 100).toFixed(1)}%)\n`;
    report += `- **Invalid Members:** ${results.invalidMembers} (${((results.invalidMembers / results.totalMembers) * 100).toFixed(1)}%)\n`;
    report += `- **Members with Warnings:** ${results.membersWithWarnings}\n`;
    report += `- **Total Problems:** ${results.totalProblems}\n`;
    report += `- **Total Warnings:** ${results.totalWarnings}\n\n`;

    report += `## Phone Number Normalization\n`;
    report += `- **Total with Phone:** ${results.summary.phoneNormalization.total}\n`;
    report += `- **Successfully Normalized:** ${results.summary.phoneNormalization.normalized}\n`;
    report += `- **Invalid Format:** ${results.summary.phoneNormalization.invalid}\n\n`;

    report += `## Data Quality Issues\n`;
    report += `- **Missing Member IDs:** ${results.summary.dataQuality.missingMemberIds}\n`;
    report += `- **Missing Names:** ${results.summary.dataQuality.missingNames}\n`;
    report += `- **Invalid Payments:** ${results.summary.dataQuality.invalidPayments}\n`;
    report += `- **Invalid Dates:** ${results.summary.dataQuality.invalidDates}\n\n`;

    if (Object.keys(results.problemsByType).length > 0) {
      report += `## Problems by Type\n`;
      Object.entries(results.problemsByType).forEach(([type, count]) => {
        report += `- **${type}:** ${count}\n`;
      });
      report += `\n`;
    }

    if (Object.keys(results.warningsByType).length > 0) {
      report += `## Warnings by Type\n`;
      Object.entries(results.warningsByType).forEach(([type, count]) => {
        report += `- **${type}:** ${count}\n`;
      });
      report += `\n`;
    }

    // List invalid members
    const invalidMembers = results.memberResults.filter(r => !r.isValid);
    if (invalidMembers.length > 0) {
      report += `## Invalid Members\n`;
      invalidMembers.forEach(member => {
        report += `- **${member.memberId} - ${member.fullName}**\n`;
        member.problems.forEach(problem => {
          report += `  - ${problem}\n`;
        });
      });
      report += `\n`;
    }

    // List members with warnings
    const membersWithWarnings = results.memberResults.filter(r => r.warnings.length > 0);
    if (membersWithWarnings.length > 0) {
      report += `## Members with Warnings\n`;
      membersWithWarnings.forEach(member => {
        report += `- **${member.memberId} - ${member.fullName}**\n`;
        member.warnings.forEach(warning => {
          report += `  - ${warning}\n`;
        });
      });
    }

    return report;
  }
}

// Export for use in Node.js or browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AAACDataValidator;
} else if (typeof window !== 'undefined') {
  window.AAACDataValidator = AAACDataValidator;
}
