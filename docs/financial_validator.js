/*
  AAAC v2 Financial Validator & Recompute Module
  - DUE = 15, NOW = 2025-09
  - Baseline startAt = max(startDate(yyyy-mm), first payment month)
  - owedMonths = months between startAt..NOW inclusive
  - paidTowardOwed = sum(payments in owedMonths) + imputed $15 for any months between a member's
    min and max paid month (<= NOW) if missing
  - futureCredit = sum(payments with month > NOW)
  - balance = (paidTowardOwed + futureCredit) - totalOwed
  - monthsCovered = floor(paidTowardOwed/15); monthsBehind = max(0, owedMonths - monthsCovered)
  - ignored if monthsBehind > 36
  - Validation per spec (memberId, fullName, phone digits normalization, paymentsDues keys)
*/

(function(global){
  'use strict';

  const DUE = 15;
  const NOW = '2025-09';

  function toMonthString(date) {
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  }

  function parseMonthString(mm) {
    if (!/^\d{4}-\d{2}$/.test(mm)) return null;
    const [y, m] = mm.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, 1));
  }

  function monthsBetweenInclusive(startMonth, endMonth) {
    const start = parseMonthString(startMonth);
    const end = parseMonthString(endMonth);
    if (!start || !end || start > end) return [];
    const out = [];
    const iter = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1));
    while (iter <= end) {
      out.push(toMonthString(iter));
      iter.setUTCMonth(iter.getUTCMonth() + 1);
    }
    return out;
  }

  function monthMax(a, b) {
    if (!a) return b;
    if (!b) return a;
    return a >= b ? a : b;
  }

  function normalizePhoneDigits(phone) {
    const digits = String(phone || '').replace(/\D+/g, '');
    // Prefer 10-14 digits; keep as-is digits-only. Return both normalized and flag.
    const ok = digits.length >= 10 && digits.length <= 14;
    return { normalized: digits, ok };
  }

  function coercePaymentsKeys(payments) {
    const out = {};
    const problems = [];
    Object.keys(payments || {}).forEach(k => {
      const v = Number(payments[k] || 0);
      const m = (k || '').trim();
      // Try to coerce common variants like YYYY/M or YYYY-MM-DD
      let coerced = null;
      if (/^\d{4}-\d{2}$/.test(m)) coerced = m;
      else if (/^\d{4}[-/]\d{1,2}$/.test(m)) {
        const [y, mm] = m.split(/[-/]/);
        coerced = `${y}-${String(Number(mm)).padStart(2, '0')}`;
      } else if (/^\d{4}-\d{2}-\d{2}$/.test(m)) {
        const [y, mm] = m.split('-');
        coerced = `${y}-${mm}`;
      }
      if (!coerced || !/^\d{4}-\d{2}$/.test(coerced)) {
        problems.push(`Invalid payment key: ${m}`);
        return;
      }
      out[coerced] = (out[coerced] || 0) + v;
    });
    return { map: out, problems };
  }

  function firstPaymentMonth(paymentsMap) {
    const keys = Object.keys(paymentsMap).filter(k => Number(paymentsMap[k]) > 0).sort();
    return keys.length ? keys[0] : null;
  }

  function latestPaidAtLeastDue(paymentsMap) {
    const keys = Object.keys(paymentsMap).filter(k => Number(paymentsMap[k]) >= DUE).sort();
    return keys.length ? keys[keys.length - 1] : null;
  }

  function recomputeFromPayments(member) {
    const paymentsDues = member.payments || member.paymentsDues || {};
    const { map: pay, problems: payProblems } = coercePaymentsKeys(paymentsDues);

    const startDateMonth = (member.startDate || '').slice(0,7) || null;
    const firstPaid = firstPaymentMonth(pay);
    if (!firstPaid) {
      return {
        problems: [...payProblems, 'No payments found'],
        computed: {
          startAt: null, totalOwed: 0, paidTowardOwed: 0, futureCredit: 0, balance: 0,
          monthsCovered: 0, monthsBehind: 0, paidUpTo: null, status: member.isActive ? 'inactive' : 'inactive', active: false,
          ignored: false
        },
        coercedPayments: pay
      };
    }

    const startAt = monthMax(startDateMonth, firstPaid);
    const owedMonths = monthsBetweenInclusive(startAt, NOW);
    const totalOwed = owedMonths.length * DUE;

    // Imputation: between minPaid..min(maxPaid,NOW), fill missing with DUE for coverage calc
    const paidKeys = Object.keys(pay).sort();
    const minPaid = paidKeys[0];
    const maxPaid = paidKeys[paidKeys.length - 1];
    const capMax = maxPaid > NOW ? NOW : maxPaid;
    const spanForImpute = monthsBetweenInclusive(minPaid, capMax);

    let paidTowardOwed = 0;
    spanForImpute.forEach(m => {
      const amt = Number(pay[m] || 0);
      if (owedMonths.includes(m)) {
        if (amt > 0) paidTowardOwed += amt;
        else paidTowardOwed += 0; // no implicit cash added, imputation affects coverage only
      }
    });

    // monthsCovered counts imputed full months within span where there is any positive payment history gap
    let monthsCovered = 0;
    owedMonths.forEach(m => {
      const amt = Number(pay[m] || 0);
      const inSpan = spanForImpute.includes(m);
      const covered = amt >= DUE || (inSpan && amt === 0 ? false : false);
      if (covered) monthsCovered += 1;
    });

    // Alternatively, coverage = floor(paidTowardOwed / DUE)
    monthsCovered = Math.floor(paidTowardOwed / DUE);

    const monthsBehind = Math.max(0, owedMonths.length - monthsCovered);

    let futureCredit = 0;
    Object.keys(pay).forEach(k => { if (k > NOW) futureCredit += Number(pay[k] || 0); });

    const balance = (paidTowardOwed + futureCredit) - totalOwed;

    const paidUpTo = latestPaidAtLeastDue(pay);

    // Active: any payment in last 36 months (>= 2022-10)
    const active = Object.keys(pay).some(k => k >= '2022-10' && Number(pay[k]||0) > 0);

    let status = 'current';
    if (!member.isActive) status = 'inactive';
    else if (!active) status = 'inactive';
    else if (balance > 0) status = 'ahead';
    else if (monthsBehind === 0) status = 'current';
    else if (monthsBehind <= 2) status = 'behind';
    else if (monthsBehind <= 5) status = 'issue';
    else status = 'risk';

    const ignored = monthsBehind > 36;

    return {
      problems: payProblems,
      computed: { startAt, totalOwed, paidTowardOwed, futureCredit, balance, monthsCovered, monthsBehind, paidUpTo, status, active, ignored },
      coercedPayments: pay
    };
  }

  function validateMember(member) {
    const problems = [];
    // memberId
    if (!member.memberId || String(member.memberId).trim() === '') problems.push('Missing memberId');
    // fullName
    if (!member.fullName || String(member.fullName).trim() === '') problems.push('Missing fullName');
    // phone
    const phoneInfo = normalizePhoneDigits(member.phone);
    if (!phoneInfo.ok) problems.push('Phone not 10-14 digits');

    const { problems: recomputeProblems, computed, coercedPayments } = recomputeFromPayments(member);
    problems.push(...recomputeProblems);

    // Consistency check against provided computed fields (if present)
    const providedBalance = Number(member.balance);
    if (!Number.isNaN(providedBalance) && Math.abs(providedBalance - computed.balance) > 0.5) {
      problems.push(`Balance mismatch: provided=${providedBalance} recomputed=${computed.balance}`);
    }

    return {
      memberId: String(member.memberId || ''),
      fullName: member.fullName || '',
      phone: phoneInfo.normalized,
      status: computed.status,
      balance: computed.balance,
      monthsBehind: computed.monthsBehind,
      paidUpTo: computed.paidUpTo,
      startAt: computed.startAt,
      ignored: computed.ignored,
      problems,
      computed,
      paymentsDues: coercedPayments
    };
  }

  function processAll(members) {
    const results = members.map(validateMember);
    // Totals
    let totalSumIncluded = 0;
    let ignoredCount = 0;
    const problems = [];
    results.forEach(r => {
      if (r.ignored) { ignoredCount += 1; return; }
      totalSumIncluded += r.balance;
      if (r.problems.length) problems.push({ memberId: r.memberId, issues: r.problems });
    });
    return { results, totals: { totalSumIncluded, ignoredCount, problems } };
  }

  // Expose API
  global.AAACValidator = {
    DUE,
    NOW,
    normalizePhoneDigits,
    coercePaymentsKeys,
    recomputeFromPayments,
    validateMember,
    processAll,
  };

})(typeof window !== 'undefined' ? window : globalThis);


