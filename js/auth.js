// Clean Firebase-only AuthManager
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
    this.init();
  }

  async init() {
    const fb = await firebaseReady;
    if (!fb) {
      console.error("Firebase adapter not available");
      this.ready = false;
      return;
    }

    // observe auth state
    fb.auth.onAuthStateChanged(async (user) => {
      if (user) await this.handleSignIn();
      else this.handleSignOut();
    });

    await this.checkSession();
    this.ready = true;
  }

  async checkSession() {
    try {
      const { user, profile } = await fbGetCurrentUser();
      if (!user) {
        this.currentUser = null;
        this.currentProfile = null;
        return false;
      }

      // enforce email verification, unless runtime flag disables it (for testing)
      const requireVerification =
        typeof window.REQUIRE_EMAIL_VERIFICATION === "boolean"
          ? window.REQUIRE_EMAIL_VERIFICATION
          : true;
      if (requireVerification && !user.emailVerified) {
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
      return true;
    } catch (err) {
      console.error("checkSession error", err);
      this.currentUser = null;
      this.currentProfile = null;
      return false;
    }
  }

  async handleSignIn() {
    try {
      const { user, profile } = await fbGetCurrentUser();
      if (!user) return;
      const requireVerification =
        typeof window.REQUIRE_EMAIL_VERIFICATION === "boolean"
          ? window.REQUIRE_EMAIL_VERIFICATION
          : true;
      if (requireVerification && !user.emailVerified) {
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
    } catch (err) {
      console.error("handleSignIn error", err);
    }
  }

  handleSignOut() {
    this.currentUser = null;
    this.currentProfile = null;
  }

  async register(email, password, fullName) {
    try {
      const { data, error } = await fbSignUp(email, password, fullName);
      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message || String(err) };
    }
  }

  async login(email, password) {
    try {
      const { data, error } = await fbSignIn(email, password);
      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message || String(err) };
    }
  }

  async logout() {
    try {
      const { error } = await fbSignOut();
      if (error) throw error;
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message || String(err) };
    }
  }

  async forgotPassword(email) {
    try {
      const { error } = await fbResetPassword(email);
      if (error) throw error;
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message || String(err) };
    }
  }

  async resendVerification() {
    try {
      const res = await sendVerificationForCurrentUser();
      if (res && res.error) throw res.error;
      return { success: true };
    } catch (err) {
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

// Helper: compute Gravatar URL from email
function gravatarUrl(email, size = 80, defaultStyle = "identicon") {
  if (!email)
    return `https://www.gravatar.com/avatar/?d=${defaultStyle}&s=${size}`;
  const trimmed = email.trim().toLowerCase();
  // simple md5 implementation for browser compatibility
  function md5cycle(x, k) {
    // ...existing code...
  }
  // To avoid adding an md5 implementation here, use ui-avatars fallback if no gravatar
  return `https://www.gravatar.com/avatar/${md5(
    trimmed
  )}?s=${size}&d=${defaultStyle}`;
}

// Placeholder md5 - if unavailable, gravatar service will serve default
function md5(input) {
  // minimal stub: return hex of simple char codes (not cryptographically correct)
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (h << 5) - h + input.charCodeAt(i);
  return ("00000000" + (h >>> 0).toString(16)).slice(-8);
}

AuthManager.prototype.getAvatarForUser = function (user, profile) {
  // Check local override first (stored by uid)
  try {
    const key = `avatar_override_${user?.uid || user?.id || ""}`;
    const override = localStorage.getItem(key);
    if (override) return override;
  } catch (e) {
    // ignore storage errors
  }

  // Prefer profile.avatar if present
  if (profile && profile.avatar) return profile.avatar;

  // Use gravatar based on email
  const email =
    (user && (user.email || user.email)) || (profile && profile.email) || "";
  if (email)
    return `https://www.gravatar.com/avatar/${md5(
      email.trim().toLowerCase()
    )}?s=80&d=identicon`;

  // Fallback to ui-avatars
  const name = (profile && profile.full_name) || email || "User";
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name
  )}&background=random&size=80&bold=true`;
};

// Allow setting a local avatar URL override (stored in localStorage per-user)
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
    console.error("setLocalAvatar error", e);
    return false;
  }
};

AuthManager.prototype.clearLocalAvatar = function (user) {
  try {
    const key = `avatar_override_${user?.uid || user?.id || ""}`;
    localStorage.removeItem(key);
    return true;
  } catch (e) {
    console.error("clearLocalAvatar error", e);
    return false;
  }
};

export const authManager = new AuthManager();
// expose globally for non-module pages
window.authManager = window.authManager || authManager;

export default authManager;
