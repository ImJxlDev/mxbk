// Firebase compat adapter - fixed version with proper initialization
let firebaseClient = null;
let _resolveFirebaseReady;
export const firebaseReady = new Promise((res) => {
  _resolveFirebaseReady = res;
});

const MAX_WAIT_TIME = 10000; // 10 seconds max wait

async function waitForFirebaseInit() {
  const startTime = Date.now();

  while (Date.now() - startTime < MAX_WAIT_TIME) {
    // Check if firebase-config.js has initialized everything
    if (
      window.FIREBASE_INITIALIZED &&
      window.FIREBASE_AUTH &&
      window.FIREBASE_DB &&
      window.firebase
    ) {
      return {
        firebase: window.firebase,
        auth: window.FIREBASE_AUTH,
        db: window.FIREBASE_DB,
      };
    }

    // Wait 100ms before checking again
    await new Promise((r) => setTimeout(r, 100));
  }

  throw new Error("Firebase initialization timeout");
}

async function init() {
  try {
    console.log("🔄 Firebase adapter waiting for initialization...");
    const ctx = await waitForFirebaseInit();

    if (!ctx || !ctx.auth || !ctx.db) {
      throw new Error("Firebase context incomplete");
    }

    firebaseClient = {
      firebase: ctx.firebase,
      auth: ctx.auth,
      db: ctx.db,
    };

    console.log("✅ Firebase adapter ready");
    _resolveFirebaseReady(firebaseClient);
  } catch (err) {
    console.error("❌ Firebase adapter init error:", err);
    _resolveFirebaseReady(null);
  }
}

// Start initialization
init();

// Helper to fetch user profile from Firestore
async function fetchProfile(uid) {
  if (!firebaseClient || !firebaseClient.db) {
    console.error("Firestore not available");
    return null;
  }

  try {
    const doc = await firebaseClient.db.collection("profiles").doc(uid).get();
    if (!doc.exists) {
      console.log("No profile found for user:", uid);
      return null;
    }
    return { id: doc.id, ...doc.data() };
  } catch (e) {
    console.error("fetchProfile error:", e);
    return null;
  }
}

// Sign up new user
export async function signUp(email, password, fullName) {
  if (!firebaseClient) {
    return { data: null, error: new Error("Firebase not initialized") };
  }

  try {
    console.log("📝 Creating user account...");
    const userCred = await firebaseClient.auth.createUserWithEmailAndPassword(
      email,
      password
    );
    const user = userCred.user;

    console.log("✅ User created:", user.uid);

    // Create profile in Firestore
    const profile = {
      id: user.uid,
      email,
      full_name: fullName,
      role: "user",
      status: "active",
      balances: { USD: 0, BTC: 0, ETH: 0 },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (firebaseClient.db) {
      console.log("📝 Creating user profile...");
      await firebaseClient.db.collection("profiles").doc(user.uid).set(profile);
      console.log("✅ Profile created");
    } else {
      console.warn("⚠️ Firestore not available: profile write skipped");
    }

    // Send verification email (if enabled)
    const requireVerification = window.REQUIRE_EMAIL_VERIFICATION !== false;
    if (requireVerification) {
      try {
        console.log("📧 Sending verification email...");
        await user.sendEmailVerification();
        console.log("✅ Verification email sent");
      } catch (err) {
        console.error("❌ Verification email failed:", err);
        return {
          data: { user, profile },
          error: new Error(
            "Account created but verification email failed: " +
              (err?.message || String(err))
          ),
        };
      }
    } else {
      console.log("⚠️ Email verification disabled");
    }

    return { data: { user, profile }, error: null };
  } catch (err) {
    console.error("❌ Signup error:", err);
    return {
      data: null,
      error: new Error(err?.message || "Signup failed"),
    };
  }
}

// Sign in existing user
export async function signIn(email, password) {
  if (!firebaseClient) {
    return { data: null, error: new Error("Firebase not initialized") };
  }

  try {
    console.log("🔐 Signing in user...");
    const cred = await firebaseClient.auth.signInWithEmailAndPassword(
      email,
      password
    );
    const user = cred.user;

    console.log("✅ User signed in:", user.uid);
    console.log("Email verified:", user.emailVerified);

    // Fetch profile
    const profile = await fetchProfile(user.uid);

    return { data: { user, profile }, error: null };
  } catch (err) {
    console.error("❌ Sign in error:", err);
    return {
      data: null,
      error: new Error(err?.message || "Sign in failed"),
    };
  }
}

// Sign out user
export async function signOut() {
  if (!firebaseClient) {
    return { error: new Error("Firebase not initialized") };
  }

  try {
    console.log("🚪 Signing out...");
    await firebaseClient.auth.signOut();
    console.log("✅ Signed out");
    return { error: null };
  } catch (err) {
    console.error("❌ Sign out error:", err);
    return { error: err };
  }
}

// Reset password
export async function resetPassword(email) {
  if (!firebaseClient) {
    return { error: new Error("Firebase not initialized") };
  }

  try {
    console.log("📧 Sending password reset email...");
    await firebaseClient.auth.sendPasswordResetEmail(email);
    console.log("✅ Password reset email sent");
    return { error: null };
  } catch (err) {
    console.error("❌ Password reset error:", err);
    return { error: err };
  }
}

// Resend confirmation email
export async function resendConfirmation() {
  if (!firebaseClient) {
    return { error: new Error("Firebase not initialized") };
  }

  const user = firebaseClient.auth.currentUser;
  if (!user) {
    return { error: new Error("No signed-in user") };
  }

  try {
    console.log("📧 Resending verification email...");
    await user.sendEmailVerification();
    console.log("✅ Verification email sent");
    return { error: null };
  } catch (err) {
    console.error("❌ Resend verification error:", err);
    return { error: err };
  }
}

// Send verification for current user
export async function sendVerificationForCurrentUser() {
  return resendConfirmation();
}

// Get current user
// Find the getCurrentUser function in firebase.js and replace it with this:

export async function getCurrentUser() {
  try {
    const fb = await firebaseReady;
    if (!fb || !fb.auth) {
      console.log("   Firebase not ready in getCurrentUser");
      return { user: null, profile: null };
    }

    // Get current user from Firebase Auth
    const user = fb.auth.currentUser;
    console.log("   getCurrentUser: Firebase user:", user ? user.uid : "null");

    if (!user) {
      return { user: null, profile: null };
    }

    // Try to get user profile from Firestore
    let profile = null;
    try {
      const profileDoc = await fb.db.collection("profiles").doc(user.uid).get();
      if (profileDoc.exists) {
        profile = { id: profileDoc.id, ...profileDoc.data() };
        console.log("   getCurrentUser: Profile loaded:", profile.full_name);
      } else {
        console.log("   getCurrentUser: No profile found for user");
      }
    } catch (profileError) {
      console.warn("   Failed to load profile:", profileError);
    }

    return { user, profile };
  } catch (err) {
    console.error("❌ getCurrentUser error:", err);
    return { user: null, profile: null };
  }
}

// Update user profile
export async function updateUserProfile(userId, updates) {
  if (!firebaseClient || !firebaseClient.db) {
    return { data: null, error: new Error("Firebase not initialized") };
  }

  try {
    await firebaseClient.db.collection("profiles").doc(userId).update(updates);
    const doc = await firebaseClient.db
      .collection("profiles")
      .doc(userId)
      .get();
    return { data: { id: doc.id, ...doc.data() }, error: null };
  } catch (err) {
    console.error("❌ Update profile error:", err);
    return { data: null, error: err };
  }
}

// Get Firebase client
export function getFirebaseClient() {
  return firebaseClient;
}
