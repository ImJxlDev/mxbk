// // Firebase configuration for Top-Margin Trading
// window.FIREBASE_CONFIG = {
//   apiKey: "AIzaSyATBRU4Fdsm2wlpjkdErdthd6iBRT8sAok",
//   authDomain: "maxprofit-ca096.firebaseapp.com",
//   projectId: "maxprofit-ca096",
//   storageBucket: "maxprofit-ca096.firebasestorage.app",
//   messagingSenderId: "28491983145",
//   appId: "1:28491983145:web:4dce7f18c23208c8186f38",
//   measurementId: "G-567P3EJQV3",
// };

// // Tell the app to prefer Firebase for auth/db
// window.USE_AUTH = "firebase";

// // TEMPORARY: Disable email verification for testing
// window.REQUIRE_EMAIL_VERIFICATION = false;

// // Track initialization state
// window.FIREBASE_INITIALIZED = false;
// window.FIREBASE_INIT_PROMISE = null;

// // Load Firebase SDK scripts in correct order
// const scripts = [
//   "https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js",
//   "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth-compat.js",
//   "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore-compat.js",
//   "https://www.gstatic.com/firebasejs/9.22.1/firebase-analytics-compat.js",
// ];

// // Load a single script with better error handling
// function loadScript(src) {
//   return new Promise((resolve, reject) => {
//     // Check if script is already loaded
//     const existing = document.querySelector(`script[src="${src}"]`);
//     if (existing) {
//       resolve();
//       return;
//     }

//     const script = document.createElement("script");
//     script.src = src;
//     script.async = false; // Load in order

//     script.onload = () => {
//       console.log(`✅ Loaded: ${src}`);
//       resolve();
//     };

//     script.onerror = (e) => {
//       console.error(`❌ Failed to load: ${src}`, e);
//       reject(new Error(`Failed to load ${src}`));
//     };

//     document.head.appendChild(script);
//   });
// }

// // Load all Firebase scripts sequentially
// async function loadFirebaseScripts() {
//   for (const src of scripts) {
//     try {
//       await loadScript(src);
//     } catch (err) {
//       console.error("Script load error:", err);
//       throw err;
//     }
//   }
// }

// // Initialize Firebase after scripts load
// async function initializeFirebase() {
//   if (window.FIREBASE_INITIALIZED) {
//     console.log("Firebase already initialized");
//     return;
//   }

//   if (window.FIREBASE_INIT_PROMISE) {
//     return window.FIREBASE_INIT_PROMISE;
//   }

//   window.FIREBASE_INIT_PROMISE = (async () => {
//     try {
//       console.log("🔄 Loading Firebase scripts...");
//       await loadFirebaseScripts();

//       // Wait a bit for firebase global to be available
//       await new Promise((resolve) => setTimeout(resolve, 100));

//       if (typeof firebase === "undefined") {
//         throw new Error("Firebase global not available after loading scripts");
//       }

//       console.log("🔄 Initializing Firebase app...");
//       const app = firebase.initializeApp(window.FIREBASE_CONFIG);

//       console.log("🔄 Initializing Firebase Auth...");
//       const auth = firebase.auth();

//       console.log("🔄 Initializing Firebase Firestore...");
//       if (typeof firebase.firestore !== "function") {
//         throw new Error(
//           "firebase.firestore is not a function - Firestore SDK may not have loaded"
//         );
//       }
//       const db = firebase.firestore();

//       // Initialize analytics if available
//       if (typeof firebase.analytics === "function") {
//         try {
//           firebase.analytics();
//           console.log("✅ Firebase Analytics initialized");
//         } catch (e) {
//           console.warn("⚠️ Analytics initialization failed:", e);
//         }
//       }

//       // Expose instances globally
//       window.FIREBASE_AUTH = auth;
//       window.FIREBASE_DB = db;
//       window.firebase = firebase;
//       window.FIREBASE_INITIALIZED = true;

//       console.log("✅ Firebase fully initialized");
//       console.log("Auth:", !!window.FIREBASE_AUTH);
//       console.log("Firestore:", !!window.FIREBASE_DB);

//       return { auth, db, firebase };
//     } catch (err) {
//       console.error("❌ Firebase initialization failed:", err);
//       window.FIREBASE_INITIALIZED = false;
//       throw err;
//     }
//   })();

//   return window.FIREBASE_INIT_PROMISE;
// }

// // Start loading immediately
// initializeFirebase().catch((err) => {
//   console.error("Fatal Firebase initialization error:", err);
//   // Show user-friendly error
//   if (typeof showToast === "function") {
//     showToast(
//       "Failed to initialize Firebase. Please refresh the page.",
//       "error"
//     );
//   }
// });

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

// TEMPORARY: Disable email verification for testing
window.REQUIRE_EMAIL_VERIFICATION = false;

// Track initialization state
window.FIREBASE_INITIALIZED = false;
window.FIREBASE_INIT_PROMISE = null;

// Firebase SDK CDN URLs with fallbacks
const FIREBASE_VERSION = "9.22.1";
const PRIMARY_CDN = `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}`;
const FALLBACK_CDN = `https://cdn.jsdelivr.net/npm/firebase@${FIREBASE_VERSION}/firebase`;

const scripts = [
  {
    name: "app",
    paths: [
      `${PRIMARY_CDN}/firebase-app-compat.js`,
      `${FALLBACK_CDN}-app-compat.js`,
    ],
  },
  {
    name: "auth",
    paths: [
      `${PRIMARY_CDN}/firebase-auth-compat.js`,
      `${FALLBACK_CDN}-auth-compat.js`,
    ],
  },
  {
    name: "firestore",
    paths: [
      `${PRIMARY_CDN}/firebase-firestore-compat.js`,
      `${FALLBACK_CDN}-firestore-compat.js`,
    ],
  },
  {
    name: "analytics",
    paths: [
      `${PRIMARY_CDN}/firebase-analytics-compat.js`,
      `${FALLBACK_CDN}-analytics-compat.js`,
    ],
  },
];

// Load a single script with multiple fallback URLs
async function loadScriptWithFallback(scriptConfig, maxRetries = 2) {
  const { name, paths } = scriptConfig;

  // Check if already loaded
  for (const path of paths) {
    const existing = document.querySelector(`script[src="${path}"]`);
    if (existing) {
      console.log(`✅ ${name} already loaded`);
      return true;
    }
  }

  // Try each path with retries
  for (const path of paths) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await loadSingleScript(path, name, attempt);
        console.log(`✅ Loaded ${name}: ${path}`);
        return true;
      } catch (err) {
        console.warn(
          `⚠️ Failed to load ${name} from ${path} (attempt ${attempt}/${maxRetries})`
        );
        if (attempt < maxRetries) {
          await new Promise((r) => setTimeout(r, 500 * attempt));
        }
      }
    }
  }

  throw new Error(`Failed to load ${name} from all sources`);
}

// Load a single script
function loadSingleScript(src, name, attempt) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = false;
    script.setAttribute("data-script-name", name);
    script.setAttribute("data-attempt", attempt);

    const timeout = setTimeout(() => {
      script.remove();
      reject(new Error(`Timeout loading ${src}`));
    }, 10000); // 10 second timeout

    script.onload = () => {
      clearTimeout(timeout);
      resolve();
    };

    script.onerror = (e) => {
      clearTimeout(timeout);
      script.remove();
      reject(new Error(`Failed to load ${src}`));
    };

    document.head.appendChild(script);
  });
}

// Load all Firebase scripts
async function loadFirebaseScripts() {
  for (const scriptConfig of scripts) {
    try {
      await loadScriptWithFallback(scriptConfig);
    } catch (err) {
      // Only analytics is optional
      if (scriptConfig.name === "analytics") {
        console.warn(
          `⚠️ Optional script ${scriptConfig.name} failed to load, continuing...`
        );
      } else {
        console.error(`❌ Critical script ${scriptConfig.name} failed to load`);
        throw err;
      }
    }
  }
}

// Initialize Firebase after scripts load
async function initializeFirebase() {
  if (window.FIREBASE_INITIALIZED) {
    console.log("✅ Firebase already initialized");
    return window.FIREBASE_INIT_PROMISE;
  }

  if (window.FIREBASE_INIT_PROMISE) {
    return window.FIREBASE_INIT_PROMISE;
  }

  window.FIREBASE_INIT_PROMISE = (async () => {
    try {
      console.log("🔄 Loading Firebase scripts...");
      await loadFirebaseScripts();

      // Wait for firebase global
      let attempts = 0;
      while (typeof firebase === "undefined" && attempts < 50) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        attempts++;
      }

      if (typeof firebase === "undefined") {
        throw new Error("Firebase global not available after loading scripts");
      }

      console.log("🔄 Initializing Firebase app...");
      const app = firebase.initializeApp(window.FIREBASE_CONFIG);

      console.log("🔄 Initializing Firebase Auth...");
      const auth = firebase.auth();

      console.log("🔄 Initializing Firebase Firestore...");
      if (typeof firebase.firestore !== "function") {
        throw new Error("firebase.firestore is not a function");
      }
      const db = firebase.firestore();

      // Initialize analytics (optional)
      if (typeof firebase.analytics === "function") {
        try {
          firebase.analytics();
          console.log("✅ Firebase Analytics initialized");
        } catch (e) {
          console.warn("⚠️ Analytics failed:", e.message);
        }
      }

      // Expose globally
      window.FIREBASE_AUTH = auth;
      window.FIREBASE_DB = db;
      window.firebase = firebase;
      window.FIREBASE_INITIALIZED = true;

      console.log("✅ Firebase fully initialized");
      console.log("   Auth:", !!window.FIREBASE_AUTH);
      console.log("   Firestore:", !!window.FIREBASE_DB);

      return { auth, db, firebase };
    } catch (err) {
      console.error("❌ Firebase initialization failed:", err);
      window.FIREBASE_INITIALIZED = false;

      // Show user-friendly error
      showFirebaseError(err);
      throw err;
    }
  })();

  return window.FIREBASE_INIT_PROMISE;
}

// Show error to user
function showFirebaseError(err) {
  const errorDiv = document.createElement("div");
  errorDiv.id = "firebase-error-banner";
  errorDiv.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: #ff4444;
    color: white;
    padding: 15px;
    text-align: center;
    z-index: 999999;
    font-family: sans-serif;
  `;
  errorDiv.innerHTML = `
    <strong>⚠️ Connection Error:</strong> Failed to initialize Firebase. 
    <button onclick="location.reload()" style="margin-left: 10px; padding: 5px 15px; cursor: pointer;">
      Reload Page
    </button>
  `;

  // Only show if body exists
  if (document.body) {
    document.body.insertBefore(errorDiv, document.body.firstChild);
  } else {
    document.addEventListener("DOMContentLoaded", () => {
      document.body.insertBefore(errorDiv, document.body.firstChild);
    });
  }
}

// Start loading immediately
initializeFirebase().catch((err) => {
  console.error("Fatal Firebase initialization error:", err);
});
