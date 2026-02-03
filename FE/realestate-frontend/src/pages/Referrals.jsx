import { useEffect, useState } from "react";
import Card from "../components/Card";
import Table from "../components/Table";
import api from "../lib/api";

export default function Referrals() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/admin/referrals");
      setRows(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const cols = [
    { key: "id", header: "ID" },
    { key: "referredEmail", header: "Referred Email" },
    { key: "referralCode", header: "Code" },
    { key: "referralStatus", header: "Status" },
    { key: "referralDate", header: "Date" },
  ];

  return (
    <div className="space-y-6">
      <Card
        title="Referrals (Admin)"
        subtitle="GET /api/admin/referrals"
        right={
          <button
            onClick={loadAll}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold hover:shadow"
          >
            Refresh
          </button>
        }
      >
        <Table columns={cols} rows={rows} emptyText={loading ? "Loading..." : "No referrals"} />
      </Card>
    </div>
  );
}
