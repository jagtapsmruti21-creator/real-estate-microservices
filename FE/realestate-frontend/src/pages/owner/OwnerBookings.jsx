import { useEffect, useMemo, useState } from "react";
import Card from "../../components/Card";
import Table from "../../components/Table";
import api from "../../lib/api";
import { getProfileId } from "../../lib/auth";

function money(n) {
  const num = Number(n);
  if (!Number.isFinite(num)) return "-";
  return num.toLocaleString("en-IN");
}

export default function OwnerBookings() {
  const ownerId = getProfileId();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [docBookingId, setDocBookingId] = useState(null);
  const [docs, setDocs] = useState([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [docsErr, setDocsErr] = useState("");

  const columns = useMemo(
    () => [
      { key: "bookingId", header: "Booking ID" },
      { key: "projName", header: "Project" },
      { key: "customerName", header: "Customer" },
      { key: "totalPrice", header: "Total (₹)" },
      { key: "paid", header: "Paid (₹)" },
      { key: "remaining", header: "Remaining (₹)" },
      { key: "status", header: "Status" },
      { key: "action", header: "Docs" },
    ],
    []
  );

  const load = async () => {
    if (!ownerId) return;
    setErr("");
    setLoading(true);
    try {
      const res = await api.get(`/api/owner/${ownerId}/bookings`);
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setErr(e?.response?.data?.message || e?.response?.data || e.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownerId]);

  const loadDocs = async (bookingId) => {
    if (!ownerId) return;
    setDocsErr("");
    setDocsLoading(true);
    setDocBookingId(bookingId);
    try {
      const res = await api.get(`/api/owner/${ownerId}/bookings/${bookingId}/documents`);
      setDocs(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setDocsErr(e?.response?.data?.message || e?.response?.data || e.message || "Failed to load documents");
      setDocs([]);
    } finally {
      setDocsLoading(false);
    }
  };

  const verifyDoc = async (docId, status) => {
    if (!ownerId) return;
    try {
      await api.put(`/api/owner/${ownerId}/documents/${docId}/verify`, { status });
      await loadDocs(docBookingId);
    } catch (e) {
      alert(e?.response?.data?.message || e?.response?.data || e.message || "Failed to verify");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-lg font-bold text-slate-900">Bookings on your properties</div>
          <div className="text-sm text-slate-500">See customer payments (paid/remaining) and verify documents.</div>
        </div>

        <button
          type="button"
          onClick={load}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 font-semibold hover:shadow disabled:opacity-60"
          disabled={!ownerId || loading}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {err && (
        <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm">{String(err)}</div>
      )}

      <Card title="Bookings" subtitle={ownerId ? `Owner: ${ownerId}` : "Owner ID not set"}>
        <Table
          columns={columns}
          rows={rows.map((r) => ({
            bookingId: r.bookingId ?? "-",
            projName: r.projName ?? "-",
            customerName: r.customerName ? `${r.customerName} (${r.customerId ?? "-"})` : "-",
            totalPrice: r.totalPrice != null ? `₹ ${money(r.totalPrice)}` : "-",
            paid: r.totalPaid != null ? `₹ ${money(r.totalPaid)}` : "-",
            remaining: r.remaining != null ? `₹ ${money(r.remaining)}` : "-",
            status: r.status ?? "-",
            action: (
              <button
                className="rounded-xl bg-slate-900 text-white px-3 py-1.5 text-sm font-semibold hover:opacity-95 disabled:opacity-60"
                onClick={() => loadDocs(r.bookingId)}
                disabled={!r.bookingId}
              >
                View Docs
              </button>
            ),
          }))}
          emptyText={loading ? "Loading..." : "No bookings yet"}
        />
      </Card>

      {docBookingId && (
        <Card title={`Customer Documents for booking #${docBookingId}`} subtitle="Approve/Reject uploaded documents">
          {docsErr && (
            <div className="mb-3 rounded-xl bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm">
              {String(docsErr)}
            </div>
          )}

          {docsLoading ? (
            <div className="text-sm text-slate-500">Loading documents...</div>
          ) : docs.length === 0 ? (
            <div className="text-sm text-slate-500">No documents uploaded yet.</div>
          ) : (
            <div className="space-y-3">
              {docs.map((d) => (
                <div key={d.id} className="rounded-xl border border-slate-200 bg-white p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-slate-900">
                        {d.docName} <span className="text-xs text-slate-500">({d.docType || "type"})</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Status: <span className="font-semibold">{d.docStatus || "PENDING"}</span>
                      </div>
                      {d.filePath && (
                        <div className="text-xs text-slate-500 mt-1 break-all">File: {d.filePath}</div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        className="rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 px-3 py-1.5 text-sm font-semibold hover:shadow"
                        onClick={() => verifyDoc(d.id, "APPROVED")}
                      >
                        Approve
                      </button>
                      <button
                        className="rounded-xl border border-red-200 bg-red-50 text-red-800 px-3 py-1.5 text-sm font-semibold hover:shadow"
                        onClick={() => verifyDoc(d.id, "REJECTED")}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
