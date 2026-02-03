import { useEffect, useState } from "react";
import Card from "../components/Card";
import Table from "../components/Table";
import api from "../lib/api";

export default function Customers() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  // NOTE: Backend expects nested user { email, password }.
  const [form, setForm] = useState({
    custName: "",
    phoneNo: "",
    gender: "FEMALE", // backend enum-style values
    dob: "",          // optional (yyyy-MM-dd)
    user: {
      email: "",
      password: "",
    },
  });

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/admin/customers");
      setRows(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const create = async (e) => {
    e.preventDefault();

    // Build payload in the exact shape backend expects
    const payload = {
      custName: form.custName,
      phoneNo: form.phoneNo,
      gender: form.gender,
      ...(form.dob ? { dob: form.dob } : {}),
      user: {
        email: form.user.email,
        password: form.user.password,
      },
    };

    await api.post("/api/admin/customers", payload);

    setForm({
      custName: "",
      phoneNo: "",
      gender: "FEMALE",
      dob: "",
      user: { email: "", password: "" },
    });

    await load();
  };

  const cols = [
    { key: "custId", header: "ID" },
    { key: "custName", header: "Name" },
    // backend usually returns nested user; render handles both nested and flat responses
    { key: "email", header: "Email", render: (r) => r?.user?.email ?? r?.email ?? "-" },
    { key: "phoneNo", header: "Phone" },
    { key: "gender", header: "Gender" },
  ];

  return (
    <div className="space-y-6">
      <Card title="Customers" subtitle="Create and manage customers">
        <form onSubmit={create} className="grid grid-cols-1 md:grid-cols-8 gap-3">
          <input
            className="md:col-span-2 rounded-xl border border-slate-200 px-3 py-2"
            placeholder="Full name"
            value={form.custName}
            onChange={(e) => setForm({ ...form, custName: e.target.value })}
          />

          <input
            className="md:col-span-2 rounded-xl border border-slate-200 px-3 py-2"
            placeholder="Email"
            value={form.user.email}
            onChange={(e) => setForm({ ...form, user: { ...form.user, email: e.target.value } })}
          />

          <input
            className="md:col-span-1 rounded-xl border border-slate-200 px-3 py-2"
            placeholder="Phone"
            value={form.phoneNo}
            onChange={(e) => setForm({ ...form, phoneNo: e.target.value })}
          />

          <select
            className="md:col-span-1 rounded-xl border border-slate-200 px-3 py-2"
            value={form.gender}
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
          >
            <option value="FEMALE">Female</option>
            <option value="MALE">Male</option>
            <option value="OTHER">Other</option>
          </select>

          <input
            type="date"
            className="md:col-span-1 rounded-xl border border-slate-200 px-3 py-2"
            value={form.dob}
            onChange={(e) => setForm({ ...form, dob: e.target.value })}
            title="DOB (optional)"
          />

          <input
            type="password"
            className="md:col-span-1 rounded-xl border border-slate-200 px-3 py-2"
            placeholder="Password"
            value={form.user.password}
            onChange={(e) => setForm({ ...form, user: { ...form.user, password: e.target.value } })}
          />

          <button className="md:col-span-8 rounded-xl bg-slate-900 text-white font-semibold px-3 py-2">
            Add Customer
          </button>
        </form>
      </Card>

      <Card
        title="Customer list"
        subtitle="Fetched from /api/admin/customers"
        right={
          <button
            onClick={load}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold hover:shadow"
          >
            Refresh
          </button>
        }
      >
        <Table columns={cols} rows={rows} emptyText={loading ? "Loading..." : "No customers"} />
      </Card>
    </div>
  );
}
