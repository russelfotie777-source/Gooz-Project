// Firebase Web app config (project "shopitechmessage"). Not a secret — it's
// inherently exposed in any client bundle that talks to Firebase, including
// the raw public/firebase-messaging-sw.js service worker (which can't read
// process.env, since Next.js never bundles static /public files). Kept
// identical in both places on purpose; if you rotate these, update both.
export const firebaseConfig = {
  apiKey: "AIzaSyCYmmBzE0Ao8pmRkA5MWrEMl9KjXf9WmmM",
  authDomain: "shopitechmessage.firebaseapp.com",
  projectId: "shopitechmessage",
  storageBucket: "shopitechmessage.firebasestorage.app",
  messagingSenderId: "590203958596",
  appId: "1:590203958596:web:0c369225620c9f1d0cd311",
  measurementId: "G-F2GZGFCHEV",
};

// Web Push certificate public key (Firebase Console > Project Settings >
// Cloud Messaging > Web Push certificates) — required by getToken() to
// generate a token tied to this app.
export const FIREBASE_VAPID_KEY =
  "BG3SDHxwS4APJsOc3222nRghlUBj868iMMAQrLsweLLnL-y2YNob89nehI5pA-Sq6xD1IowbSGrexk-XdCTJaRg";
