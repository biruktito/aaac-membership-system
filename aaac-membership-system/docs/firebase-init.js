// Initializes Firebase App and Firestore using window.firebaseConfig.
// Requires firebase-config.js to be loaded first and Firebase compat SDKs.

(function initFirebase() {
  if (!window.firebaseConfig) {
    console.error("Firebase config not found. Did you create docs/firebase-config.js?");
    window.FB_INIT_ERROR = true;
    return;
  }

  try {
    if (!firebase.apps.length) {
      firebase.initializeApp(window.firebaseConfig);
    }
    const db = firebase.firestore();
    const auth = firebase.auth();
    window.firebaseServices = { db, auth };
    console.log("Firebase initialized");
  } catch (e) {
    console.error("Firebase init error", e);
    window.FB_INIT_ERROR = true;
  }
})();


