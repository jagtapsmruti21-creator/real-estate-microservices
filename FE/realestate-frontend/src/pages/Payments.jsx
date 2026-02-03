import { useEffect, useState } from "react";
import Card from "../components/Card";
import Table from "../components/Table";
import api from "../lib/api";

export default function Payments() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const [customerId, setCustomerId] = useState("");
  const [summary, setSummary] = useState(null);

  const [form, setForm] = useState({
    customerId: "",
    advPayment: 0,
    remainPayment: 0,
    totalPaid: 0,
    modeOfPayment: "UPI",
  });

  const loadAll = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/admin/payments");
      setRows(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const create = async (e) => {
    e.preventDefault();
    const cid = form.customerId;
    await api.post(`/api/customer/${cid}/payments`, {
      advPayment: Number(form.advPayment),
      remainPayment: Number(form.remainPayment),
      totalPaid: Number(form.totalPaid),
      modeOfPayment: form.modeOfPayment,
    });
    await loadAll();
  };

  const loadSummary = async () => {
    if (!customerId) return;
    // Fetch payments for this customer from core-service (which forwards to payment-service)
    const res = await api.get(`/api/customer/${customerId}/payments`);
    const list = res.data || [];
    const totalAdvance = list.reduce((sum, p) => sum + Number(p.advPayment || 0), 0);
    const totalRemaining = list.reduce((sum, p) => sum + Number(p.remainPayment || 0), 0);
    const totalPaid = list.reduce((sum, p) => sum + Number(p.totalPaid || 0), 0);

    setSummary({
      customerId,
      paymentsCount: list.length,
      totalAdvance,
      totalRemaining,
      totalPaid,
    });
  };

  const cols = [
    { key: "pid", header: "PID" },
    { key: "custId", header: "Customer ID" },
    { key: "advPayment", header: "Advance" },
    { key: "remainPayment", header: "Remaining" },
    { key: "totalPaid", header: "Total Paid" },
    { key: "modeOfPayment", header: "Mode" },
  ];

  return (
    <div className="space-y-6">
      <Card title="Create Payment" subtitle="Creates payment (REST → core-service → payment-service)">
        <form onSubmit={create} className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <input className="md:col-span-1 rounded-xl border border-slate-200 px-3 py-2" placeholder="Customer ID"
            value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })} />
          <input className="md:col-span-1 rounded-xl border border-slate-200 px-3 py-2" placeholder="Advance"
            value={form.advPayment} onChange={(e) => setForm({ ...form, advPayment: e.target.value })} />
          <input className="md:col-span-1 rounded-xl border border-slate-200 px-3 py-2" placeholder="Remaining"
            value={form.remainPayment} onChange={(e) => setForm({ ...form, remainPayment: e.target.value })} />
          <input className="md:col-span-1 rounded-xl border border-slate-200 px-3 py-2" placeholder="Total Paid"
            value={form.totalPaid} onChange={(e) => setForm({ ...form, totalPaid: e.target.value })} />
          <select className="md:col-span-1 rounded-xl border border-slate-200 px-3 py-2"
            value={form.modeOfPayment} onChange={(e) => setForm({ ...form, modeOfPayment: e.target.value })}>
            <option>UPI</option>
            <option>CARD</option>
            <option>NET_BANKING</option>
            <option>CASH</option>
          </select>
          <button className="md:col-span-1 rounded-xl bg-slate-900 text-white font-semibold px-3 py-2">
            Create
          </button>
        </form>
      </Card>

      <Card title="Payment Summary" subtitle="Fetch payments and calculate totals (no Kafka)">
        <div className="flex flex-col md:flex-row gap-3 items-start md:items-end">
          <div className="w-full md:w-64">
            <label className="text-sm font-semibold">Customer ID</label>
            <input className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
              value={customerId} onChange={(e) => setCustomerId(e.target.value)} />
          </div>
          <button onClick={loadSummary} className="rounded-xl bg-white border border-slate-200 px-3 py-2 font-semibold hover:shadow">
            Fetch Summary
          </button>
        </div>

        {summary && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="rounded-2xl border border-slate-200 p-4 bg-white">
              <div className="text-sm text-slate-500">Payments</div>
              <div className="text-2xl font-bold">{summary.paymentsCount}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4 bg-white">
              <div className="text-sm text-slate-500">Total Advance</div>
              <div className="text-2xl font-bold">{summary.totalAdvance}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4 bg-white">
              <div className="text-sm text-slate-500">Total Remaining</div>
              <div className="text-2xl font-bold">{summary.totalRemaining}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4 bg-white">
              <div className="text-sm text-slate-500">Total Paid</div>
              <div className="text-2xl font-bold">{summary.totalPaid}</div>
            </div>
          </div>
        )}
      </Card>

      <Card
        title="All Payments (Admin)"
        subtitle="Fetched from /api/admin/payments"
        right={<button onClick={loadAll} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold hover:shadow">Refresh</button>}
      >
        <Table columns={cols} rows={rows} emptyText={loading ? "Loading..." : "No payments"} />
      </Card>
    </div>
  );
}
