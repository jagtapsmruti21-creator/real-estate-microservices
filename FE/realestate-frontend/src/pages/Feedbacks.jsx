import { useEffect, useState } from "react";
import Card from "../components/Card";
import Table from "../components/Table";
import api from "../lib/api";

export default function Feedbacks() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/admin/feedbacks");
      setRows(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const remove = async (id) => {
    if (!confirm(`Delete feedback #${id}?`)) return;
    await api.delete(`/api/admin/feedbacks/${id}`);
    await loadAll();
  };

  const cols = [
    { key: "id", header: "ID" },
    { key: "rating", header: "Rating" },
    { key: "comment", header: "Comment" },
    { key: "feedbackDate", header: "Date" },
    {
      key: "actions",
      header: "Actions",
      render: (r) => (
        <button
          onClick={() => remove(r.id)}
          className="rounded-xl border border-red-200 bg-red-50 px-3 py-1 text-sm font-semibold text-red-700 hover:shadow"
        >
          Delete
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Card
        title="Customer Feedbacks"
        subtitle="GET /api/admin/feedbacks"
        right={
          <button
            onClick={loadAll}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold hover:shadow"
          >
            Refresh
          </button>
        }
      >
        <Table
          columns={cols}
          rows={rows}
          emptyText={loading ? "Loading..." : "No feedbacks found"}
        />
      </Card>
    </div>
  );
}
