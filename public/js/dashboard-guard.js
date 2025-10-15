// Dashboard authentication guard
import { authManager } from "./auth.js";

let checkInProgress = false;

async function waitForInitialization() {
  console.log("⏳ Waiting for Firebase and AuthManager...");

  // Wait for Firebase (max 15 seconds)
  let attempts = 0;
  while (!window.FIREBASE_INITIALIZED && attempts < 150) {
    await new Promise((r) => setTimeout(r, 100));
    attempts++;
  }

  if (!window.FIREBASE_INITIALIZED) {
    throw new Error("Firebase initialization timeout");
  }

  console.log("✅ Firebase ready");

  // Wait for AuthManager (max 10 seconds)
  attempts = 0;
  while (!authManager.ready && attempts < 100) {
    await new Promise((r) => setTimeout(r, 100));
    attempts++;
  }

  if (!authManager.ready) {
    throw new Error("AuthManager initialization timeout");
  }

  console.log("✅ AuthManager ready");
}

async function checkDashboardAuth() {
  if (checkInProgress) {
    console.log("⏳ Auth check already in progress");
    return;
  }

  checkInProgress = true;

  try {
    console.log("🔐 Checking dashboard authentication...");

    // Wait for everything to initialize
    await waitForInitialization();

    // Check if user is authenticated
    const isAuth = authManager.isAuthenticated();
    console.log("   Is authenticated:", isAuth);

    if (!isAuth) {
      // Double-check by attempting to restore session
      console.log("   Attempting to restore session...");
      const hasSession = await authManager.checkSession();
      console.log("   Session restored:", hasSession);

      if (!hasSession) {
        console.log("❌ No valid authentication - redirecting to login");
        redirectToLogin("Please log in to access the dashboard");
        return false;
      }
    }

    // Get user details
    const user = authManager.getUser();
    const profile = authManager.getProfile();

    console.log("✅ Authentication verified");
    console.log("   User:", user?.email);
    console.log("   Profile:", profile?.full_name);
    console.log("   Email verified:", user?.emailVerified);

    // Check email verification (if required)
    const requireVerification = window.REQUIRE_EMAIL_VERIFICATION !== false;
    console.log("   Require verification:", requireVerification);

    if (requireVerification && user && !user.emailVerified) {
      console.log("❌ Email not verified - redirecting");
      redirectToLogin("Please verify your email to access the dashboard");
      return false;
    }

    console.log("✅ Dashboard access granted");

    // Dispatch event that dashboard is authorized
    window.dispatchEvent(
      new CustomEvent("dashboardAuthorized", {
        detail: { user, profile },
      })
    );

    return true;
  } catch (err) {
    console.error("❌ Dashboard auth check error:", err);
    redirectToLogin("Authentication error occurred");
    return false;
  } finally {
    checkInProgress = false;
  }
}

function redirectToLogin(message) {
  console.log("🔄 Redirecting to login:", message);

  if (message) {
    try {
      sessionStorage.setItem("dashboardRedirectMessage", message);
    } catch (e) {
      console.warn("Could not save redirect message");
    }
  }

  // Use replace to prevent back button issues
  window.location.replace("login.html");
}

// Run check immediately when module loads
checkDashboardAuth();

export { checkDashboardAuth };
