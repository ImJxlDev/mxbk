// Clean Firebase-only AuthManager - Fixed version
import {
  signUp as fbSignUp,
  signIn as fbSignIn,
  signOut as fbSignOut,
  resetPassword as fbResetPassword,
  resendConfirmation as fbResendConfirmation,
  getCurrentUser as fbGetCurrentUser,
  firebaseReady,
  sendVerificationForCurrentUser,
  getFirebaseClient,
} from "./firebase.js";

class AuthManager {
  constructor() {
    this.currentUser = null;
    this.currentProfile = null;
    this.ready = false;
    this.initPromise = null;
    this.init();
  }

  async init() {
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      try {
        console.log("🔄 AuthManager initializing...");
        const fb = await firebaseReady;

        if (!fb) {
          console.error("❌ Firebase adapter not available");
          this.ready = false;
          return;
        }

        console.log("✅ Firebase adapter ready in AuthManager");

        // Observe auth state changes
        fb.auth.onAuthStateChanged(async (user) => {
          console.log("🔄 Auth state changed:", user ? user.uid : "null");
          if (user) {
            await this.handleSignIn();
          } else {
            this.handleSignOut();
          }
        });

        // Check current session
        await this.checkSession();
        this.ready = true;
        console.log("✅ AuthManager ready");
      } catch (err) {
        console.error("❌ AuthManager init error:", err);
        this.ready = false;
      }
    })();

    return this.initPromise;
  }

  // In auth.js, replace the checkSession method with this:

  async checkSession() {
    try {
      console.log("🔍 Checking session...");
      const { user, profile } = await fbGetCurrentUser();

      if (!user) {
        console.log("   No user found");
        this.currentUser = null;
        this.currentProfile = null;
        return false;
      }

      console.log("   User found:", user.email);
      // Check Firestore profile's email_verified field
      const isVerified = profile && profile.email_verified;
      console.log("   Firestore email_verified:", isVerified);

      const requireVerification = true;
      if (requireVerification && !isVerified) {
        console.log("⚠️ Email not verified for:", user.email);
        try {
          await fbSignOut();
        } catch (_) {}
        window.UNVERIFIED_EMAIL = user.email || null;
        this.currentUser = null;
        this.currentProfile = null;
        return false;
      }

      this.currentUser = user;
      this.currentProfile = profile || null;
      console.log("✅ Session valid:", user.email);
      return true;
    } catch (err) {
      console.error("❌ checkSession error:", err);
      this.currentUser = null;
      this.currentProfile = null;
      return false;
    }
  }

  // In auth.js, replace the handleSignIn method with this:

  async handleSignIn() {
    try {
      console.log("🔄 handleSignIn: Getting current user...");
      const { user, profile } = await fbGetCurrentUser();

      if (!user) {
        console.log("   No user in handleSignIn");
        return;
      }

      console.log("   User in handleSignIn:", user.email);
      // Check Firestore profile's email_verified field
      const isVerified = profile && profile.email_verified;
      console.log("   Firestore email_verified:", isVerified);

      const requireVerification = true;
      if (requireVerification && !isVerified) {
        console.log("⚠️ Sign in blocked - email not verified");
        try {
          await fbSignOut();
        } catch (_) {}
        window.UNVERIFIED_EMAIL = user.email || null;
        this.currentUser = null;
        this.currentProfile = null;
        return;
      }

      this.currentUser = user;
      this.currentProfile = profile || null;
      console.log("✅ User signed in:", user.email);
      console.log("   Profile:", profile?.full_name || "No profile");
    } catch (err) {
      console.error("❌ handleSignIn error:", err);
    }
  }

  handleSignOut() {
    this.currentUser = null;
    this.currentProfile = null;
    console.log("🚪 User signed out");
  }

  async register(email, password, fullName) {
    try {
      console.log("📝 Registering user:", email);
      const { data, error } = await fbSignUp(email, password, fullName);
      if (error) throw error;
      console.log("✅ Registration successful");
      // Inform user to check their email for verification link sent by backend
      alert(
        "Registration successful! Please check your email for a verification link before logging in."
      );
      return { success: true, data };
    } catch (err) {
      console.error("❌ Registration error:", err);
      return { success: false, error: err.message || String(err) };
    }
  }

  async login(email, password) {
    try {
      console.log("🔐 Logging in user:", email);
      const { data, error } = await fbSignIn(email, password);
      if (error) throw error;

      // Check verification if required
      const requireVerification = window.REQUIRE_EMAIL_VERIFICATION !== false;
      if (requireVerification && data.user && !data.user.emailVerified) {
        console.log("⚠️ Login blocked - email not verified");
        window.UNVERIFIED_EMAIL = data.user.email;
        await fbSignOut();
        return {
          success: false,
          error:
            "Please verify your email before logging in. Check your inbox.",
        };
      }

      console.log("✅ Login successful");
      return { success: true, data };
    } catch (err) {
      console.error("❌ Login error:", err);
      return { success: false, error: err.message || String(err) };
    }
  }

  async logout() {
    try {
      console.log("🚪 Logging out...");
      const { error } = await fbSignOut();
      if (error) throw error;
      console.log("✅ Logout successful");
      return { success: true };
    } catch (err) {
      console.error("❌ Logout error:", err);
      return { success: false, error: err.message || String(err) };
    }
  }

  async forgotPassword(email) {
    try {
      console.log("📧 Sending password reset to:", email);
      const { error } = await fbResetPassword(email);
      if (error) throw error;
      console.log("✅ Password reset email sent");
      return { success: true };
    } catch (err) {
      console.error("❌ Password reset error:", err);
      return { success: false, error: err.message || String(err) };
    }
  }

  async resendVerification() {
    try {
      console.log("📧 Resending verification email...");
      const res = await sendVerificationForCurrentUser();
      if (res && res.error) throw res.error;
      console.log("✅ Verification email resent");
      return { success: true };
    } catch (err) {
      console.error("❌ Resend verification error:", err);
      return { success: false, error: err.message || String(err) };
    }
  }

  isAuthenticated() {
    return !!this.currentUser;
  }

  hasRole(role) {
    return this.currentProfile?.role === role;
  }

  getUser() {
    return this.currentUser;
  }

  getProfile() {
    return this.currentProfile;
  }
}

// Simple md5 hash for gravatar
function md5(input) {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h << 5) - h + input.charCodeAt(i);
  }
  return ("00000000" + (h >>> 0).toString(16)).slice(-8);
}

// Avatar helper methods
AuthManager.prototype.getAvatarForUser = function (user, profile) {
  try {
    const key = `avatar_override_${user?.uid || user?.id || ""}`;
    const override = localStorage.getItem(key);
    if (override) return override;
  } catch (e) {
    // ignore storage errors
  }

  if (profile && profile.avatar) return profile.avatar;

  const email = user?.email || profile?.email || "";
  if (email) {
    return `https://www.gravatar.com/avatar/${md5(
      email.trim().toLowerCase()
    )}?s=80&d=identicon`;
  }

  const name = profile?.full_name || email || "User";
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name
  )}&background=random&size=80&bold=true`;
};

AuthManager.prototype.setLocalAvatar = function (user, avatarUrl) {
  try {
    const key = `avatar_override_${user?.uid || user?.id || ""}`;
    if (!avatarUrl) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, avatarUrl);
    }
    return true;
  } catch (e) {
    console.error("setLocalAvatar error:", e);
    return false;
  }
};

AuthManager.prototype.clearLocalAvatar = function (user) {
  try {
    const key = `avatar_override_${user?.uid || user?.id || ""}`;
    localStorage.removeItem(key);
    return true;
  } catch (e) {
    console.error("clearLocalAvatar error:", e);
    return false;
  }
};

export const authManager = new AuthManager();
window.authManager = authManager;

export default authManager;
