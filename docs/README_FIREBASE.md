AAAC v2 — Firebase/Firestore Migration
=====================================

Overview
--------
This v2 moves persistence to Firebase Firestore to provide a single, transactional, real-time source of truth with server-enforced security.

Quick start
-----------
1) Create Firebase project + Firestore (production mode or test temporarily).
2) In Firebase Console → Project settings → Your apps → Web app, copy config.
3) Copy `docs/firebase-config.example.js` to `docs/firebase-config.js` and paste your config.
4) Deploy or open `docs/dashboard_v2.html` via GitHub Pages.

Data model
----------
Collection: `members`
- id: string (Member ID if available; otherwise auto-id)
- fullName: string
- isActive: boolean
- startDate: ISO date string (e.g., `2020-01-01`)
- payments: map<string Month, number AmountUSD> e.g. `{ "2025-09": 15 }`
- role: optional, one of `member|board|admin` (for admin accounts stored separately)

Security rules (starter)
------------------------
Adjust as needed. During development, you may permit read for all and restrict writes.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() { return request.auth != null; }
    function isAdmin() { return isSignedIn() && request.auth.token.admin == true; }

    match /members/{memberId} {
      allow read: if isSignedIn();
      allow write: if isAdmin();
    }
  }
}
```

Populate data
-------------
- Open `docs/migrate_v2.html` in your hosted site.
- Paste a JSON array of members: `[{ memberId, fullName, isActive, startDate, payments: {"YYYY-MM": amount} }]`.
- Click Import. Data appears live in `dashboard_v2.html`.

Financial logic
---------------
`dashboard_v2.html` includes a self-contained `calculateMemberFinancials` function aligned to September 2025. Port or extend as needed.

Writes
-----
- New member: create a document in `members` with initialized fields.
- Record payment: update `members/{id}` with `payments[YYYY-MM] += amount` transactionally (can be expanded to sub-collections later).

Cutover
-------
- Validate counts and balances with a golden-member set.
- When ready, link the main entry point to `dashboard_v2.html`.


