// Clear all members and re-import clean data
// Run this in browser console on migrate_v2.html after signing in as admin

const { db } = window.firebaseServices || {};

async function clearAndReimport() {
  try {
    console.log('Clearing existing members...');
    
    // Get all member documents
    const snapshot = await db.collection('members').get();
    console.log(`Found ${snapshot.size} existing members`);
    
    // Delete all members
    const batch = db.batch();
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    console.log('Cleared all members');
    
    // Now import the clean data
    console.log('Ready to import clean 101-member dataset');
    console.log('Copy the content from cleaned_members_final.json and paste it in the textarea, then click Import');
    
  } catch (error) {
    console.error('Error:', error);
    alert('Error: ' + error.message);
  }
}

// Run the function
clearAndReimport();





