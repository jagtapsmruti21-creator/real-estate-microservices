export function parseJwt(token) {
  try {
    const parts = String(token || "").split(".");
    if (parts.length < 2) return null;
    const payload = parts[1];
    // base64url -> base64
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function getRoleFromJwt(token) {
  const payload = parseJwt(token);
  const role = payload?.role || payload?.roles || payload?.authorities;
  if (!role) return null;

  // Spring sometimes stores 'ROLE_ADMIN' or just 'ADMIN'
  if (typeof role === "string") return role.replace(/^ROLE_/, "");
  if (Array.isArray(role) && role.length) {
    const r0 = String(role[0]);
    return r0.replace(/^ROLE_/, "");
  }
  return null;
}

export function getEmailFromJwt(token) {
  const payload = parseJwt(token);
  return payload?.sub || payload?.email || null;
}
