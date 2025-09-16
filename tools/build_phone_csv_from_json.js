#!/usr/bin/env node
// Build CSV (phone,memberId,displayName) from docs/cleaned_members_with_phones.json
// Usage: node tools/build_phone_csv_from_json.js [--input=./docs/cleaned_members_with_phones.json] [--output=./tools/members_from_json.csv]

const fs = require('fs');
const path = require('path');

function parseArgs() {
  const out = {};
  for (const arg of process.argv.slice(2)) {
    const m = arg.match(/^--([^=]+)=(.*)$/);
    if (m) out[m[1]] = m[2];
  }
  return out;
}

function normalizePhone(raw) {
  if (!raw) return '';
  let p = String(raw).trim();
  // Remove non-digits except leading +
  if (p.startsWith('+')) {
    p = '+' + p.slice(1).replace(/\D+/g, '');
  } else {
    p = p.replace(/\D+/g, '');
    if (p && !p.startsWith('+')) {
      // naive default to US +1 if 10 digits
      if (p.length === 10) p = '+1' + p;
      else if (!p.startsWith('+')) p = '+' + p; // best-effort
    }
  }
  return p;
}

async function main() {
  const args = parseArgs();
  const input = path.resolve(args.input || './docs/cleaned_members_with_phones.json');
  const output = path.resolve(args.output || './tools/members_from_json.csv');

  if (!fs.existsSync(input)) {
    console.error('Input JSON not found:', input);
    process.exit(1);
  }
  const raw = JSON.parse(fs.readFileSync(input, 'utf8'));
  if (!Array.isArray(raw)) {
    console.error('Input JSON must be an array.');
    process.exit(1);
  }
  const rows = [];
  rows.push('phone,memberId,displayName');
  for (const m of raw) {
    const memberId = m.memberId || m.id || '';
    const name = m.fullName || m.name || '';
    const phone = normalizePhone(m.phone || m.phoneNumber || '');
    if (!memberId || !phone) continue;
    rows.push([phone, memberId, JSON.stringify(String(name).replace(/\n/g, ' ').trim())].join(','));
  }
  fs.writeFileSync(output, rows.join('\n'));
  console.log('Wrote', output, 'rows:', rows.length - 1);
}

main().catch(e => { console.error(e); process.exit(1); });


