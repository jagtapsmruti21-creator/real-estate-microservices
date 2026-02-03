import { useEffect, useState } from "react";
import Card from "../components/Card";
import Table from "../components/Table";
import api from "../lib/api";

export default function Bookings() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  // Update booking form (Admin updates status/price/date)
  const [form, setForm] = useState({
    id: "",
    bookingDate: "",
    status: "PENDING",
    totalPrice: "",
  });

  const loadAll = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/admin/bookings");
      setRows(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const updateBooking = async (e) => {
    e.preventDefault();
    if (!form.id) return alert("Booking ID required");

    const payload = {
      bookingDate: form.bookingDate || null,
      status: form.status,
      totalPrice: form.totalPrice === "" ? null : Number(form.totalPrice),
    };

    await api.put(`/api/admin/bookings/${form.id}`, payload);
    setForm({ id: "", bookingDate: "", status: "PENDING", totalPrice: "" });
    await loadAll();
  };

  const remove = async (id) => {
    if (!confirm(`Delete booking #${id}?`)) return;
    await api.delete(`/api/admin/bookings/${id}`);
    await loadAll();
  };

  const cols = [
    { key: "id", header: "Booking ID" },
    { key: "bookingDate", header: "Booking Date" },
    { key: "status", header: "Status" },
    { key: "totalPrice", header: "Total Price" },
    {
      key: "actions",
      header: "Actions",
      render: (r) => (
        <button
          className="rounded-xl border border-slate-200 bg-white px-3 py-1 text-sm font-semibold hover:shadow"
          onClick={() => remove(r.id)}
        >
          Delete
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Card title="Update Booking" subtitle="PUT /api/admin/bookings/{id}">
        <form onSubmit={updateBooking} className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <input
            className="rounded-xl border border-slate-200 px-3 py-2"
            placeholder="Booking ID"
            value={form.id}
            onChange={(e) => setForm({ ...form, id: e.target.value })}
          />

          <input
            type="date"
            className="rounded-xl border border-slate-200 px-3 py-2"
            value={form.bookingDate}
            onChange={(e) => setForm({ ...form, bookingDate: e.target.value })}
            title="bookingDate (optional)"
          />

          <select
            className="rounded-xl border border-slate-200 px-3 py-2"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option value="PENDING">PENDING</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>

          <input
            className="rounded-xl border border-slate-200 px-3 py-2"
            placeholder="Total Price"
            value={form.totalPrice}
            onChange={(e) => setForm({ ...form, totalPrice: e.target.value })}
          />

          <button className="rounded-xl bg-slate-900 text-white font-semibold px-3 py-2">
            Update
          </button>
        </form>
      </Card>

      <Card
        title="All Bookings (Admin)"
        subtitle="GET /api/admin/bookings"
        right={
          <button
            onClick={loadAll}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold hover:shadow"
          >
            Refresh
          </button>
        }
      >
        <Table columns={cols} rows={rows} emptyText={loading ? "Loading..." : "No bookings"} />
      </Card>
    </div>
  );
}
