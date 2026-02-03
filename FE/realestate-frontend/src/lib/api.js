import axios from "axios";
import { clearSession, getToken } from "./auth";

// ✅ Always hit backend directly (no proxy dependency)
const api = axios.create({
  baseURL: "http://localhost:8080",
});

api.interceptors.request.use((config) => {
  const token = getToken();
  const url = config.url || "";

  // Don't attach token only for login/register
  const isLogin = url.startsWith("/api/auth/login");
  const isRegister = url.startsWith("/api/auth/register");

  // ✅ Attach token for /api/auth/me and all protected endpoints
  if (token && !isLogin && !isRegister) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      clearSession();
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;
