import { getEmailFromJwt, getRoleFromJwt } from "./jwt";

const TOKEN_KEY = "re_jwt";
const ROLE_KEY = "re_role";
const EMAIL_KEY = "re_email";
const PROFILE_ID_KEY = "re_profile_id"; // customerId or ownerId (not needed for admin)

/** Token helpers */
export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function setSession({ token, role, email, profileId }) {
  if (token) setToken(token);
  if (role) localStorage.setItem(ROLE_KEY, role);
  if (email) localStorage.setItem(EMAIL_KEY, email);

  // ✅ ADD THIS
  if (profileId !== undefined && profileId !== null) {
    localStorage.setItem(PROFILE_ID_KEY, String(profileId));
  }
}

export function clearSession() {
  clearToken();
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(EMAIL_KEY);
  localStorage.removeItem(PROFILE_ID_KEY);
}

export function getRole() {
  const stored = localStorage.getItem(ROLE_KEY);
  if (stored) return stored;

  const token = getToken();
  const role = token ? getRoleFromJwt(token) : null;
  if (role) localStorage.setItem(ROLE_KEY, role);
  return role;
}

export function getEmail() {
  const stored = localStorage.getItem(EMAIL_KEY);
  if (stored) return stored;

  const token = getToken();
  const email = token ? getEmailFromJwt(token) : null;
  if (email) localStorage.setItem(EMAIL_KEY, email);
  return email;
}

export function getProfileId() {
  const v = localStorage.getItem(PROFILE_ID_KEY);
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
export function setProfileId(id) {
  localStorage.setItem(PROFILE_ID_KEY, String(id));
}
export function clearProfileId() {
  localStorage.removeItem(PROFILE_ID_KEY);
}

export function isLoggedIn() {
  return !!getToken();
}
