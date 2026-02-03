import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card";
import api from "../lib/api";
import { getRole, setProfileId } from "../lib/auth";

export default function SetupProfile() {
  const role = getRole();
  const navigate = useNavigate();

  const [id, setId] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true); // ✅ start loading

  const roleLabel =
    role === "OWNER" ? "Owner" : role === "CUSTOMER" ? "Customer" : "User";

  const goHome = () => {
    if (role === "OWNER") navigate("/owner", { replace: true });
    else if (role === "CUSTOMER") navigate("/customer", { replace: true });
    else navigate("/", { replace: true });
  };

  // ✅ AUTO-FETCH profileId using /api/auth/me
  useEffect(() => {
    let cancelled = false;

    async function fetchProfile() {
      try {
        setErr("");
        setLoading(true);

        // This will now include Authorization header (because api.js fixed)
        const res = await api.get("/api/auth/me");
        const profileId = res.data?.profileId;

        if (!cancelled && profileId) {
          setProfileId(profileId);
          goHome();
        } else if (!cancelled) {
          setErr("Could not detect profile automatically. Please enter ID once.");
        }
      } catch (e) {
        if (!cancelled) {
          setErr("Auto profile fetch failed. Please enter ID once.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    // only attempt auto-fetch for owner/customer
    if (role === "OWNER" || role === "CUSTOMER") fetchProfile();
    else {
      // admin doesn't need this page
      setLoading(false);
      goHome();
    }

    return () => {
      cancelled = true;
    };
  }, [role]);

  const save = (e) => {
    e.preventDefault();
    setErr("");

    const n = Number(id);
    if (!Number.isFinite(n) || n <= 0) {
      setErr("Please enter a valid numeric ID (e.g., 1).");
      return;
    }

    setProfileId(n);
    goHome();
  };

  return (
    <div className="min-h-screen grid place-items-center p-6 bg-slate-50">
      <div className="w-full max-w-lg">
        <Card
          title={`${roleLabel} setup`}
          subtitle="We will auto-detect your profileId. If it fails, enter it once."
        >
          {loading ? (
            <div className="text-slate-600 text-sm">Detecting your profile…</div>
          ) : (
            <form onSubmit={save} className="space-y-4">
              <div>
                <label className="text-sm font-semibold">{roleLabel} ID</label>
                <input
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300"
                  placeholder="Example: 1"
                  required
                />
                <div className="text-xs text-slate-500 mt-2">
                  Auto-fetch uses <span className="font-mono">GET /api/auth/me</span>.
                  If it fails due to backend/proxy, enter once and continue.
                </div>
              </div>

              {err && (
                <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm">
                  {err}
                </div>
              )}

              <button className="rounded-xl bg-slate-900 text-white px-4 py-2 font-semibold hover:opacity-95">
                Save & Continue
              </button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
