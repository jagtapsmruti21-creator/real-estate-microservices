import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = "http://localhost:8080";

export default function Register() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [role, setRole] = useState("CUSTOMER");

  // CUSTOMER fields
  const [phoneNo, setPhoneNo] = useState("");
  const [gender, setGender] = useState("FEMALE");
  const [dob, setDob] = useState(""); // yyyy-mm-dd

  // OWNER fields
  const [contactNo, setContactNo] = useState("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setOk("");
    setLoading(true);

    try {
      const payload = {
        fullName,
        email,
        password,
        role,
      };

      if (role === "CUSTOMER") {
        payload.phoneNo = phoneNo;
        payload.gender = gender;
        payload.dob = dob || null; // if empty, send null
      }

      if (role === "OWNER") {
        payload.contactNo = contactNo;
      }

      await axios.post(`${API}/api/auth/register`, payload);

      setOk("Registered successfully. Please login.");
      setTimeout(() => navigate("/login", { replace: true }), 600);
    } catch (error) {
      setErr(error?.response?.data || error.message || "Register failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <div className="w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-sm p-6">
        <div className="text-sm text-slate-500">Real Estate Management</div>
        <div className="text-2xl font-bold mt-1">Register</div>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-semibold">Full Name</label>
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm font-semibold">Email</label>
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              required
            />
          </div>

          <div>
            <label className="text-sm font-semibold">Role</label>
            <select
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="CUSTOMER">CUSTOMER</option>
              <option value="OWNER">OWNER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>

          {/* CUSTOMER extra fields */}
          {role === "CUSTOMER" && (
            <>
              <div>
                <label className="text-sm font-semibold">Phone No</label>
                <input
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300"
                  value={phoneNo}
                  onChange={(e) => setPhoneNo(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-semibold">Gender</label>
                <select
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  <option value="FEMALE">FEMALE</option>
                  <option value="MALE">MALE</option>
                  <option value="OTHER">OTHER</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold">DOB</label>
                <input
                  type="date"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                />
              </div>
            </>
          )}

          {/* OWNER extra fields */}
          {role === "OWNER" && (
            <div>
              <label className="text-sm font-semibold">Contact No</label>
              <input
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300"
                value={contactNo}
                onChange={(e) => setContactNo(e.target.value)}
              />
            </div>
          )}

          {err && (
            <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm">
              {String(err)}
            </div>
          )}

          {ok && (
            <div className="rounded-xl bg-green-50 border border-green-200 text-green-700 px-3 py-2 text-sm">
              {String(ok)}
            </div>
          )}

          <button
            disabled={loading}
            className="w-full rounded-xl bg-slate-900 text-white px-3 py-2 font-semibold hover:opacity-95 disabled:opacity-60"
          >
            {loading ? "Registering..." : "Register"}
          </button>

          <div className="text-sm text-slate-600 text-center">
            Already have an account?{" "}
            <button
              type="button"
              className="text-slate-900 font-semibold underline"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
