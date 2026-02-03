import { useEffect, useMemo, useState } from "react";
import Card from "../components/Card";
import api from "../lib/api";

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState({ customers: 0, bookings: 0, payments: 0, documents: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        // Adjust endpoints to match your backend:
        const [customers, bookings, payments, documents] = await Promise.allSettled([
          api.get("/api/admin/customers"),
          api.get("/api/admin/bookings"),
          api.get("/api/admin/payments"),
          api.get("/api/admin/documents"),
        ]);

        setStats({
          customers: customers.value?.data?.length ?? 0,
          bookings: bookings.value?.data?.length ?? 0,
          payments: payments.value?.data?.length ?? 0,
          documents: documents.value?.data?.length ?? 0,
        });
      } catch {
        // ignore; cards will show zeros
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const subtitle = useMemo(
    () => "One place to manage customers, bookings, documents, referrals, feedback, and payments.",
    []
  );

  return (
    <div className="space-y-6">
      <Card title="Overview" subtitle={subtitle}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat label="Customers" value={loading ? "…" : stats.customers} />
          <Stat label="Bookings" value={loading ? "…" : stats.bookings} />
          <Stat label="Payments" value={loading ? "…" : stats.payments} />
          <Stat label="Documents" value={loading ? "…" : stats.documents} />
        </div>
      </Card>

      <Card title="Quick test" subtitle="If you see counts, your frontend is connected to backend correctly.">
        <div className="text-sm text-slate-600">
          If counts show as 0 but you have data, just tell me your exact endpoints from Swagger
          and I’ll map them 1:1.
        </div>
      </Card>
    </div>
  );
}
