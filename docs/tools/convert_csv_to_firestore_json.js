/*
Usage:
  node docs/tools/convert_csv_to_firestore_json.js \
    /Users/birukeyesus/terraform_practice/aaac-system/aaac-membership-system/versions/v1.0-stable/docs/data/AAAC_Real_Data.csv \
    > members_export.json

Then open migrate_v2.html and paste the JSON.
*/

const fs = require('fs');
const path = require('path');

const MONTHS = {
  JAN: '01', FEB: '02', MAR: '03', APR: '04', MAY: '05', JUN: '06',
  JUL: '07', AUG: '08', SEP: '09', OCT: '10', NOV: '11', DEC: '12',
};

function parseCsvLine(line) {
  // Simple CSV split respecting that fields do not include embedded commas in this dataset
  // If needed, replace with a robust CSV parser.
  return line.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map(v => v.replace(/^"|"$/g, ''));
}

function toMonthKey(header) {
  // Headers like 2025_JAN → 2025-01
  const m = header.match(/^(\d{4})_(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)$/);
  if (!m) return null;
  return `${m[1]}-${MONTHS[m[2]]}`;
}

function monthsBetween(fromKey, toKey) {
  // keys YYYY-MM
  const [fy, fm] = fromKey.split('-').map(Number);
  const [ty, tm] = toKey.split('-').map(Number);
  return (ty - fy) * 12 + (tm - fm);
}

const CURRENT_KEY = '2025-09'; // September 2025

function detectStartDate(firstPaymentYear, paymentsMap) {
  // Prefer first non-zero payment month; else fallback to First_Payment_Year or 2020-01
  let firstPaidKey = null;
  for (const [k, v] of Object.entries(paymentsMap)) {
    if (Number(v) > 0) {
      if (!firstPaidKey || k < firstPaidKey) firstPaidKey = k;
    }
  }
  if (firstPaidKey) return `${firstPaidKey}-01`;
  if (firstPaymentYear && String(firstPaymentYear).trim()) return `${firstPaymentYear}-01-01`;
  return '2020-01-01';
}

function main() {
  const inputPath = process.argv[2];
  if (!inputPath) {
    console.error('Usage: node convert_csv_to_firestore_json.js <path-to-csv>');
    process.exit(1);
  }
  const csv = fs.readFileSync(inputPath, 'utf8').replace(/\r\n/g, '\n');
  const lines = csv.split('\n').filter(l => l.trim().length > 0);
  const headers = parseCsvLine(lines[0]);

  const monthCols = headers
    .map((h, idx) => ({ h, idx, key: toMonthKey(h) }))
    .filter(x => x.key);

  const H = (name) => headers.indexOf(name);
  const out = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    if (!cols.length) continue;
    const memberId = (cols[H('Member_ID')] || '').trim();
    const fullName = (cols[H('Name')] || '').trim();
    if (!memberId && !fullName) continue;

    const payments = {};
    let totalPaid = 0;
    for (const { idx, key } of monthCols) {
      const valRaw = cols[idx];
      const amount = Number(valRaw || 0);
      if (amount > 0) {
        payments[key] = (payments[key] || 0) + amount;
        totalPaid += amount;
      }
    }

    const firstPaymentYear = cols[H('First_Payment_Year')] || '';
    const startDate = detectStartDate(firstPaymentYear, payments);
    // Active/inactive rule:
    // inactive if they have not made any payments for the last 36 months
    // otherwise active (including those behind, 6-12, 12-24, 24-36 months behind)
    let lastPaidKey = null;
    for (const k of Object.keys(payments).sort()) {
      if (Number(payments[k]) > 0) lastPaidKey = k; // sorted ascending, will end up last non-zero
    }
    let isActive = false;
    if (lastPaidKey) {
      const diff = monthsBetween(lastPaidKey, CURRENT_KEY);
      isActive = diff < 36;
    } else {
      // Never paid → considered inactive by this rule
      isActive = false;
    }

    out.push({
      memberId: String(memberId || fullName).trim(),
      fullName,
      isActive,
      startDate,
      payments,
    });
  }

  process.stdout.write(JSON.stringify(out, null, 2));
}

main();


