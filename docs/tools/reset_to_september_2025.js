/*
Reset all existing members to September 2025 baseline.
This script:
1. Sets all members as active
2. Sets joining fee as paid ($200)
3. Clears all payment history
4. Sets start date to September 2025

Usage:
1. Open migrate_v2.html
2. Sign in as admin
3. Run this script in browser console
*/

async function resetAllMembersToSeptember2025() {
  const { db } = window.firebaseServices || {};
  if (!db) {
    console.error('Firebase not initialized');
    return;
  }

  try {
    console.log('Starting reset to September 2025...');
    
    // Get all members
    const snapshot = await db.collection('members').get();
    console.log(`Found ${snapshot.size} members to reset`);

    const batch = db.batch();
    let updateCount = 0;

    snapshot.forEach(doc => {
      const memberData = doc.data();
      
      // Reset to September 2025 baseline
      batch.update(doc.ref, {
        isActive: true,
        startDate: '2025-09-01',
        paymentsDues: {}, // Clear all payment history
        joiningFeeAmount: 200, // Mark as having paid joining fee
        joiningFeeDate: '2025-09-01T00:00:00Z',
        paymentsIncidentals: {} // Clear incidentals
      });
      updateCount++;
    });

    if (updateCount > 0) {
      await batch.commit();
      console.log(`✅ Successfully reset ${updateCount} members to September 2025 baseline`);
      console.log('All members now:');
      console.log('- Active status: true');
      console.log('- Start date: 2025-09-01');
      console.log('- Joining fee: $200 paid');
      console.log('- Payment history: cleared');
      console.log('- Ready for fresh start from September 2025');
    } else {
      console.log('No members found to reset');
    }

  } catch (error) {
    console.error('Error resetting members:', error);
  }
}

// Run the reset
console.log('Running reset to September 2025...');
resetAllMembersToSeptember2025();





