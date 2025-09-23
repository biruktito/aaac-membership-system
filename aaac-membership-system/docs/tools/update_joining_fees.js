/*
Migration script to mark all existing members as having paid the joining fee.
This assumes all current members have already paid the $200 joining fee.

Usage:
1. Open migrate_v2.html
2. Sign in as admin
3. Run this script in browser console, or use Node.js with Firebase Admin SDK
*/

// Browser console version (run in migrate_v2.html after signing in as admin)
async function updateAllJoiningFees() {
  const { db } = window.firebaseServices || {};
  if (!db) {
    console.error('Firebase not initialized');
    return;
  }

  try {
    // Get all members
    const snapshot = await db.collection('members').get();
    console.log(`Found ${snapshot.size} members to update`);

    const batch = db.batch();
    let updateCount = 0;

    snapshot.forEach(doc => {
      const memberData = doc.data();
      
      // Only update if joiningFeeAmount is not already set to 200
      if (memberData.joiningFeeAmount !== 200) {
        batch.update(doc.ref, {
          joiningFeeAmount: 200,
          joiningFeeDate: new Date().toISOString(),
          // Also ensure paymentsDues exists for backward compatibility
          paymentsDues: memberData.paymentsDues || memberData.payments || {}
        });
        updateCount++;
      }
    });

    if (updateCount > 0) {
      await batch.commit();
      console.log(`Successfully updated ${updateCount} members with joining fee payment`);
    } else {
      console.log('All members already have joining fee marked as paid');
    }

  } catch (error) {
    console.error('Error updating joining fees:', error);
  }
}

// Run the migration
updateAllJoiningFees();


