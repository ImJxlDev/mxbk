// Firebase configuration for Top-Margin Trading
window.FIREBASE_CONFIG = {
  apiKey: "AIzaSyATBRU4Fdsm2wlpjkdErdthd6iBRT8sAok",
  authDomain: "maxprofit-ca096.firebaseapp.com",
  projectId: "maxprofit-ca096",
  storageBucket: "maxprofit-ca096.firebasestorage.app",
  messagingSenderId: "28491983145",
  appId: "1:28491983145:web:4dce7f18c23208c8186f38",
  measurementId: "G-567P3EJQV3",
};

// Tell the app to prefer Firebase for auth/db
window.USE_AUTH = "firebase";

// Load Firebase SDK scripts
const scripts = [
  "https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js",
  "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth-compat.js",
  "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore-compat.js",
  "https://www.gstatic.com/firebasejs/9.22.1/firebase-analytics-compat.js",
];

// Load scripts sequentially with retry on transient failures
async function loadScriptWithRetry(src, attempts = 3, delayMs = 500) {
  let lastErr = null;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      await new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = src;
        script.onload = () => resolve();
        script.onerror = (e) => reject(new Error(`Failed to load ${src}`));
        document.head.appendChild(script);
      });
      return;
    } catch (err) {
      lastErr = err;
      console.warn(`Attempt ${attempt} to load ${src} failed.`);
      if (attempt < attempts) await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  throw lastErr;
}

// Load scripts sequentially
async function loadFirebase() {
  for (const src of scripts) {
    try {
      await loadScriptWithRetry(src, 3, 600);
    } catch (err) {
      console.error("Failed to load Firebase script", src, err);
      // continue - we will try to initialize what we have (auth should be present)
    }
  }

  // If firestore script failed to load from CDN, attempt local fallback
  if (typeof firebase === "object" && !firebase.firestore) {
    const localPath = "/js/vendor/firebase-firestore-compat.js";
    try {
      // try a single load from local vendor
      await loadScriptWithRetry(localPath, 1, 100);
      console.log("Loaded local firestore compat from", localPath);
    } catch (err) {
      console.warn(
        "Local firestore compat not found at",
        localPath,
        " — you can add it to js/vendor/ to enable offline fallback."
      );
    }
  }

  // Initialize Firebase after attempted loads
  try {
    const app = firebase.initializeApp(window.FIREBASE_CONFIG);
    const auth = firebase.auth();
    // firestore may not be available if script failed; guard it
    const db =
      typeof firebase.firestore === "function" ? firebase.firestore() : null;
    if (typeof firebase.analytics === "function") {
      try {
        firebase.analytics();
      } catch (e) {
        console.warn("firebase.analytics() failed", e);
      }
    }

    // Expose instances
    window.FIREBASE_AUTH = auth;
    window.FIREBASE_DB = db; // may be null if firestore failed to load
    window.firebase = firebase;
  } catch (err) {
    console.error("Firebase initialization failed after script loads", err);
    // expose whatever we can
    if (window.firebase && typeof window.firebase.auth === "function") {
      try {
        window.FIREBASE_AUTH = window.firebase.auth();
      } catch (e) {
        /* ignore */
      }
    }
    window.FIREBASE_DB = window.FIREBASE_DB || null;
    window.firebase = window.firebase || null;
  }
}

loadFirebase().catch((e) => console.error("loadFirebase error", e));
