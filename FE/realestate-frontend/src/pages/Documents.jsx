import { useEffect, useState } from "react";
import Card from "../components/Card";
import Table from "../components/Table";
import api from "../lib/api";

export default function Documents() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const [verify, setVerify] = useState({
    id: "",
    docStatus: "APPROVED",
  });

  const loadAll = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/admin/documents");
      setRows(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const verifyDoc = async (e) => {
    e.preventDefault();
    if (!verify.id) return alert("Document ID required");

    await api.put(`/api/admin/documents/${verify.id}/verify`, {
      docStatus: verify.docStatus,
    });

    setVerify({ id: "", docStatus: "APPROVED" });
    await loadAll();
  };

  const cols = [
    { key: "id", header: "Doc ID" },
    { key: "docName", header: "Name" },
    { key: "docType", header: "Type" },
    { key: "uploadedDate", header: "Uploaded" },
    { key: "verifiedDate", header: "Verified" },
    { key: "docStatus", header: "Status" },
  ];

  return (
    <div className="space-y-6">
      <Card title="Verify Document" subtitle="PUT /api/admin/documents/{id}/verify (sets verifiedDate=now)">
        <form onSubmit={verifyDoc} className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            className="rounded-xl border border-slate-200 px-3 py-2"
            placeholder="Document ID"
            value={verify.id}
            onChange={(e) => setVerify({ ...verify, id: e.target.value })}
          />

          <select
            className="rounded-xl border border-slate-200 px-3 py-2"
            value={verify.docStatus}
            onChange={(e) => setVerify({ ...verify, docStatus: e.target.value })}
          >
            <option value="APPROVED">APPROVED</option>
            <option value="REJECTED">REJECTED</option>
            <option value="PENDING">PENDING</option>
          </select>

          <button className="rounded-xl bg-slate-900 text-white font-semibold px-3 py-2">
            Verify
          </button>

          <button
            type="button"
            onClick={loadAll}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 font-semibold hover:shadow"
          >
            Refresh
          </button>
        </form>
      </Card>

      <Card title="All Documents (Admin)" subtitle="GET /api/admin/documents">
        <Table columns={cols} rows={rows} emptyText={loading ? "Loading..." : "No documents"} />
      </Card>
    </div>
  );
}
