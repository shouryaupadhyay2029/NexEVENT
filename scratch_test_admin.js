import admin from 'firebase-admin';
console.log("firebase-admin imported successfully!");
try {
  admin.initializeApp();
  console.log("Firebase Admin initialized successfully!");
} catch (e) {
  console.error("Initialization failed:", e.message);
}
