const PROFILE_KEY = "userProfile";

/* ================= DEFAULT PROFILE ================= */
function defaultProfile() {
  return {
    tone: "Professional",
    industry: "",
    style: "",
    language: "English",   // ⭐ multilingual output
    avatar: "",            // ⭐ profile image (base64)
  };
}

/* ================= GET PROFILE ================= */
export function getProfile() {
  try {
    const stored = localStorage.getItem(PROFILE_KEY);

    // no profile yet
    if (!stored) return defaultProfile();

    const parsed = JSON.parse(stored);

    // ⭐ IMPORTANT: backward compatibility
    // if old profile exists (without language/avatar), auto-upgrade it
    return {
      tone: parsed.tone ?? "Professional",
      industry: parsed.industry ?? "",
      style: parsed.style ?? "",
      language: parsed.language ?? "English",
      avatar: parsed.avatar ?? "",
    };

  } catch (error) {
    console.warn("Profile corrupted. Resetting profile.");
    return defaultProfile();
  }
}

/* ================= SAVE PROFILE ================= */
export function saveProfile(profile) {
  const cleanProfile = {
    tone: profile.tone || "Professional",
    industry: profile.industry || "",
    style: profile.style || "",
    language: profile.language || "English",
    avatar: profile.avatar || "",
  };

  localStorage.setItem(PROFILE_KEY, JSON.stringify(cleanProfile));
}

/* ================= CLEAR PROFILE (optional helper) ================= */
export function clearProfile() {
  localStorage.removeItem(PROFILE_KEY);
}
