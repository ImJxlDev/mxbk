// Firebase compat adapter - single, clean implementation
// Exports: firebaseReady, signUp, signIn, signOut, resetPassword,
// resendConfirmation, sendVerificationForCurrentUser, getCurrentUser,
// updateUserProfile, getFirebaseClient

let firebaseClient = null;
let _resolveFirebaseReady;
export const firebaseReady = new Promise((res) => {
  _resolveFirebaseReady = res;
});

const WAIT_TIMEOUT = 8000;

async function waitForGlobals() {
  const start = Date.now();
  while (Date.now() - start < WAIT_TIMEOUT) {
    if (
      typeof window !== "undefined" &&
      window.firebase &&
      window.FIREBASE_AUTH
    ) {
      return {
        firebase: window.firebase,
        auth: window.FIREBASE_AUTH,
        db: window.FIREBASE_DB,
      };
    }
    // small delay
    // eslint-disable-next-line no-await-in-loop
    await new Promise((r) => setTimeout(r, 100));
  }
  return null;
}

async function init() {
  try {
    const ctx = await waitForGlobals();
    if (!ctx) {
      console.error("Firebase globals not available or timed out");
      try {
        _resolveFirebaseReady(null);
      } catch (e) {
        /* ignore */
      }
      return;
    }
    firebaseClient = { firebase: ctx.firebase, auth: ctx.auth, db: ctx.db };
    console.log("Firebase compat adapter ready");
    try {
      _resolveFirebaseReady(firebaseClient);
    } catch (e) {
      /* ignore */
    }
  } catch (err) {
    console.error("Firebase adapter init error", err);
    try {
      _resolveFirebaseReady(null);
    } catch (e) {
      /* ignore */
    }
  }
}

init();

// Helpers using compat SDK (auth and firestore)
async function fetchProfile(uid) {
  try {
    const doc = await firebaseClient.db.collection("profiles").doc(uid).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  } catch (e) {
    console.error("fetchProfile error", e);
    return null;
  }
}

export async function signUp(email, password, fullName) {
  if (!firebaseClient)
    return { data: null, error: new Error("Firebase not initialized") };
  try {
    const userCred = await firebaseClient.auth.createUserWithEmailAndPassword(
      email,
      password
    );
    const user = userCred.user;
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
      await firebaseClient.db.collection("profiles").doc(user.uid).set(profile);
    } else {
      console.warn(
        "Firestore not available: profile write skipped for",
        user.uid
      );
    }
    try {
      await user.sendEmailVerification();
      console.log("sendEmailVerification invoked for", user.email);
    } catch (err) {
      console.error(
        "sendEmailVerification failed",
        err && err.code,
        err && err.message,
        err
      );
      return {
        data: { user, profile },
        error: new Error(
          "Account created but verification email failed to send: " +
            (err && err.message ? err.message : String(err))
        ),
      };
    }
    return { data: { user, profile }, error: null };
  } catch (err) {
    console.error(
      "createUserWithEmailAndPassword error",
      err && err.code,
      err && err.message,
      err
    );
    const wrapped = new Error(
      err && err.message ? `Signup failed: ${err.message}` : "Signup failed"
    );
    wrapped.code = err && err.code ? err.code : undefined;
    return { data: null, error: wrapped };
  }
}

export async function signIn(email, password) {
  if (!firebaseClient)
    return { data: null, error: new Error("Firebase not initialized") };
  try {
    const cred = await firebaseClient.auth.signInWithEmailAndPassword(
      email,
      password
    );
    const user = cred.user;
    const profile = firebaseClient.db ? await fetchProfile(user.uid) : null;
    return { data: { user, profile }, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
}

export async function signOut() {
  if (!firebaseClient) return { error: new Error("Firebase not initialized") };
  try {
    await firebaseClient.auth.signOut();
    return { error: null };
  } catch (err) {
    return { error: err };
  }
}

export async function resetPassword(email) {
  if (!firebaseClient) return { error: new Error("Firebase not initialized") };
  try {
    await firebaseClient.auth.sendPasswordResetEmail(email);
    return { error: null };
  } catch (err) {
    return { error: err };
  }
}

export async function resendConfirmation() {
  if (!firebaseClient) return { error: new Error("Firebase not initialized") };
  const user = firebaseClient.auth.currentUser;
  if (!user) return { error: new Error("No signed-in user") };
  try {
    await user.sendEmailVerification();
    return { error: null };
  } catch (err) {
    return { error: err };
  }
}

export async function sendVerificationForCurrentUser() {
  if (!firebaseClient) return { error: new Error("Firebase not initialized") };
  const user = firebaseClient.auth.currentUser;
  if (!user) return { error: new Error("No signed-in user") };
  try {
    await user.sendEmailVerification();
    return { error: null };
  } catch (err) {
    return { error: err };
  }
}

export async function getCurrentUser() {
  if (!firebaseClient) return { user: null, profile: null };
  const user = firebaseClient.auth.currentUser || null;
  if (!user) return { user: null, profile: null };
  const profile = await fetchProfile(user.uid);
  return { user, profile };
}

export async function updateUserProfile(userId, updates) {
  if (!firebaseClient)
    return { data: null, error: new Error("Firebase not initialized") };
  try {
    await firebaseClient.db.collection("profiles").doc(userId).update(updates);
    const doc = await firebaseClient.db
      .collection("profiles")
      .doc(userId)
      .get();
    return { data: { id: doc.id, ...doc.data() }, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
}

export function getFirebaseClient() {
  return firebaseClient;
}
