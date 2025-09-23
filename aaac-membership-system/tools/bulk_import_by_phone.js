#!/usr/bin/env node
/*
Bulk-create Firebase Auth users by phone number and assign roles/memberId.

Usage:
  node tools/bulk_import_by_phone.js \
    --project=<PROJECT_ID> \
    --serviceAccount=/absolute/path/to/serviceAccount.json \
    --csv=/absolute/path/to/members.csv \
    [--region=us-central1]

CSV format (header required):
  phone,memberId,displayName
Example:
  +17734941942,1,HABTAMU BAKANA

Notes:
  - Phone numbers must be in E.164 format (e.g., +15555550123)
  - If a user with the phone already exists, we reuse it
  - Writes roles/{uid} = { role: 'member', memberId }
*/

const fs = require('fs');
const path = require('path');
const readline = require('readline');

function parseArgs() {
  const out = {};
  for (const arg of process.argv.slice(2)) {
    const m = arg.match(/^--([^=]+)=(.*)$/);
    if (m) out[m[1]] = m[2];
  }
  return out;
}

async function main() {
  const args = parseArgs();
  const { project, serviceAccount, csv, region } = args;
  if (!project || !serviceAccount || !csv) {
    console.error('Missing args. Required: --project, --serviceAccount, --csv');
    process.exit(1);
  }

  const saPath = path.resolve(serviceAccount);
  const csvPath = path.resolve(csv);
  if (!fs.existsSync(saPath)) {
    console.error('Service account JSON not found:', saPath);
    process.exit(1);
  }
  if (!fs.existsSync(csvPath)) {
    console.error('CSV not found:', csvPath);
    process.exit(1);
  }

  const admin = require('firebase-admin');
  const sa = require(saPath);
  admin.initializeApp({
    credential: admin.credential.cert(sa),
    projectId: project,
  });
  const auth = admin.auth();
  const db = admin.firestore();
  if (region) db.settings({ }); // placeholder; Firestore auto-region

  let created = 0, linked = 0, errors = 0;

  const rl = readline.createInterface({ input: fs.createReadStream(csvPath), crlfDelay: Infinity });
  let lineNo = 0;
  for await (const line of rl) {
    lineNo += 1;
    if (!line.trim()) continue;
    if (lineNo === 1 && /^\s*phone\s*,\s*memberId/i.test(line)) continue; // header
    const parts = line.split(',');
    if (parts.length < 2) { console.warn('Skip line (need at least phone,memberId):', line); continue; }
    const phone = parts[0].trim();
    const memberId = String(parts[1]).trim();
    const displayName = (parts[2] || '').trim();
    if (!/^\+\d{7,15}$/.test(phone)) { console.warn('Invalid phone (must be E.164):', phone); continue; }
    if (!memberId) { console.warn('Missing memberId for phone:', phone); continue; }

    try {
      let userRecord;
      try {
        userRecord = await auth.getUserByPhoneNumber(phone);
      } catch (_) {
        userRecord = null;
      }

      if (!userRecord) {
        userRecord = await auth.createUser({ phoneNumber: phone, displayName: displayName || undefined, disabled: false });
        created += 1;
      }

      await db.collection('roles').doc(userRecord.uid).set({ role: 'member', memberId }, { merge: true });
      linked += 1;
      console.log(`[OK] ${phone} → uid=${userRecord.uid} role=member memberId=${memberId}`);
    } catch (e) {
      errors += 1;
      console.error(`[ERR] ${phone} →`, e && e.message ? e.message : e);
    }
  }

  console.log(`\nDone. created=${created}, linked=${linked}, errors=${errors}`);
  process.exit(errors ? 1 : 0);
}

main().catch(e => { console.error(e); process.exit(1); });



