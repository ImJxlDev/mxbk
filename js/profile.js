import { authManager } from "./auth.js";
import { showToast, showLoading } from "./utils.js";

document.addEventListener("DOMContentLoaded", () => {
  initProfilePage();
});

async function initProfilePage() {
  try {
    showLoading(true);
    await authManager.checkSession();
    if (!authManager.isAuthenticated()) {
      window.location.href = "login.html";
      return;
    }

    const profile = authManager.getProfile();
    if (!profile) {
      showToast("Profile not found", "error");
      return;
    }

    document.getElementById("full_name").value = profile.full_name || "";
    document.getElementById("phone").value = profile.phone || "";
    document.getElementById("country").value = profile.country || "";

    const form = document.getElementById("profile-form");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      showLoading(true);
      try {
        const updates = {
          full_name: document.getElementById("full_name").value.trim(),
          phone: document.getElementById("phone").value.trim(),
          country: document.getElementById("country").value.trim(),
          updated_at: new Date().toISOString(),
        };

        // Use adapter's updateUserProfile via authManager's internal client
        if (authManager.adapter === "firebase") {
          // firebase adapter exposes updateUserProfile in js/firebase.js
          const mod = await import("./firebase.js");
          const { data, error } = await mod.updateUserProfile(
            profile.id,
            updates
          );
          if (error) throw error;
        } else {
          // use supabase-shim via window.supabase
          const sup = window.supabase;
          if (!sup) throw new Error("Legacy supabase-shim not available");
          // use our shim's collection update pattern
          const res = await sup
            .from("profiles")
            .eq("id", profile.id)
            .update(updates);
          if (res.error) throw res.error;
        }

        showToast("Profile updated", "success");
      } catch (err) {
        console.error("Profile save error:", err);
        showToast("Failed to save profile", "error");
      } finally {
        showLoading(false);
      }
    });

    document.getElementById("cancel").addEventListener("click", () => {
      window.location.href = "dashboard.html";
    });
  } catch (err) {
    console.error(err);
  } finally {
    showLoading(false);
  }
}
