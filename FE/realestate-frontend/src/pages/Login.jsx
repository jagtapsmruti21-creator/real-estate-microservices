import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getProfileId, setSession } from "../lib/auth";
import { getEmailFromJwt, getRoleFromJwt } from "../lib/jwt";

const API = "http://localhost:8080"; // ✅ call backend directly

export default function Login() {
  const [email, setEmail] = useState("admin@gmail.com");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  const goAfterLogin = (role) => {
    const profileId = getProfileId();

    if (role === "ADMIN") return navigate("/", { replace: true });

    if (role === "OWNER") {
      if (!profileId) return navigate("/setup-profile", { replace: true });
      return navigate("/owner", { replace: true });
    }

    if (role === "CUSTOMER") {
      if (!profileId) return navigate("/setup-profile", { replace: true });
      return navigate("/customer", { replace: true });
    }

    return navigate("/", { replace: true });
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      // ✅ Login
      const res = await axios.post(`${API}/api/auth/login`, { email, password });

      const token = res.data?.token;
      if (!token) throw new Error("Token missing from response");

      const roleFromApi = res.data?.role;
      const emailFromApi = res.data?.email;

      const role = roleFromApi || getRoleFromJwt(token) || "";
      const mail = emailFromApi || getEmailFromJwt(token) || "";

      // ✅ Save session (no ids yet)
      setSession({ token, role, email: mail });

      // ✅ Fetch /me (safe)
      try {
        const meRes = await axios.get(`${API}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const me = meRes.data || {};

        // Keep your existing profileId logic
        const profileId = me?.profileId ?? null;
        if (profileId !== null && profileId !== undefined) {
          setSession({ token, role, email: mail, profileId });
        }

        // ✅ NEW: store role-specific ids for routing/pages like Documents
        // (we store multiple possible keys because backend naming differs)
        const custId = me?.custId ?? me?.customerId ?? me?.customer?.custId ?? me?.customer?.id;
        const ownerId = me?.ownerId ?? me?.owner?.ownerId ?? me?.owner?.id;
        const adminId = me?.adminId ?? me?.admin?.adminId ?? me?.admin?.id;

        if (custId != null) localStorage.setItem("customerId", String(custId));
        if (ownerId != null) localStorage.setItem("ownerId", String(ownerId));
        if (adminId != null) localStorage.setItem("adminId", String(adminId));

        // Optional: keep a generic id too (helpful)
        const genericId = custId ?? ownerId ?? adminId ?? me?.id ?? null;
        if (genericId != null) localStorage.setItem("userId", String(genericId));
      } catch (meErr) {
        console.warn(
          "GET /api/auth/me failed (using setup-profile fallback):",
          meErr?.response?.status
        );
      }

      goAfterLogin(role);
    } catch (error) {
      setErr(
        error?.response?.data?.message ||
          error?.response?.data ||
          error.message ||
          "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <div className="w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-sm p-6">
        <div className="text-sm text-slate-500">Real Estate Management</div>
        <div className="text-2xl font-bold mt-1">Sign in</div>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-semibold">Email</label>
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@gmail.com"
              required
            />
          </div>

          <div>
            <label className="text-sm font-semibold">Password</label>
            <input
              type="password"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {err && (
            <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm">
              {String(err)}
            </div>
          )}

          <button
            disabled={loading}
            className="w-full rounded-xl bg-slate-900 text-white px-3 py-2 font-semibold hover:opacity-95 disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <div className="text-sm text-slate-600 text-center">
            Don&apos;t have an account?{" "}
            <button
              type="button"
              className="text-slate-900 font-semibold underline"
              onClick={() => navigate("/register")}
            >
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
