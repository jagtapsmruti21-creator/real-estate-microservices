import { useEffect, useMemo, useState } from "react";
import Card from "../../components/Card";
import Table from "../../components/Table";
import api from "../../lib/api";
import { getProfileId } from "../../lib/auth";

function toDate(d) {
  if (!d) return "-";
  if (typeof d === "string") return d.length >= 10 ? d.slice(0, 10) : d;
  try {
    return new Date(d).toISOString().slice(0, 10);
  } catch {
    return "-";
  }
}

function statusChip(status) {
  const s = String(status || "PENDING").toUpperCase();
  const base =
    "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold border";

  if (s === "APPROVED") {
    return (
      <span className={`${base} bg-green-50 text-green-700 border-green-200`}>
        APPROVED
      </span>
    );
  }

  if (s === "REJECTED") {
    return (
      <span className={`${base} bg-red-50 text-red-700 border-red-200`}>
        REJECTED
      </span>
    );
  }

  return (
    <span className={`${base} bg-amber-50 text-amber-800 border-amber-200`}>
      PENDING
    </span>
  );
}

export default function CustomerDocuments() {
  // Keeping your existing logic (you use profileId as customerId)
  const customerId = getProfileId();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  // Upload form
  const [docName, setDocName] = useState("");
  const [docType, setDocType] = useState("ID_PROOF");
  const [file, setFile] = useState(null);

  const columns = useMemo(
    () => [
      { key: "id", header: "ID" },
      { key: "docName", header: "Name" },
      { key: "docType", header: "Type" },
      { key: "docStatus", header: "Status" },
      { key: "uploadedDate", header: "Uploaded" },
      { key: "verifiedDate", header: "Verified" },
    ],
    []
  );

  const load = async () => {
    if (!customerId) return;
    setErr("");
    setLoading(true);
    try {
      const res = await api.get(`/api/customer/${customerId}/documents`);
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setErr(
        e?.response?.data?.message ||
          e?.response?.data ||
          e.message ||
          "Failed to load documents"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId]);

  const upload = async (e) => {
    e.preventDefault();
    if (!customerId) return;

    if (!docName.trim()) return alert("Please enter document name");
    if (!docType) return alert("Please select document type");
    if (!file) return alert("Please choose a file");

    setErr("");
    setSaving(true);

    try {
      const fd = new FormData();

      // ✅ These keys must match backend @RequestParam names.
      // If backend expects different keys, tell me and I'll change them.
      fd.append("docName", docName.trim());
      fd.append("docType", docType);
      fd.append("file", file); // <--- most common name

      await api.post(`/api/customer/${customerId}/documents`, fd, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // reset
      setDocName("");
      setDocType("ID_PROOF");
      setFile(null);

      await load();
      alert("Uploaded successfully!");
    } catch (e2) {
      setErr(
        e2?.response?.data?.message ||
          e2?.response?.data ||
          e2.message ||
          "Failed to upload document"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-lg font-bold text-slate-900">Documents</div>
          <div className="text-sm text-slate-500">
            Upload your documents. Admin will verify them.
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {customerId ? `Customer ID: ${customerId}` : "Customer ID not set"}
          </div>
        </div>

        <button
          type="button"
          onClick={load}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 font-semibold hover:shadow"
          disabled={!customerId}
        >
          Refresh
        </button>
      </div>

      {err && (
        <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm">
          {String(err)}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          title="Upload document"
          subtitle="Just upload. Status and dates are handled by the system."
        >
          <form onSubmit={upload} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Document name
              </label>
              <input
                className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300"
                value={docName}
                onChange={(e) => setDocName(e.target.value)}
                placeholder="e.g. Aadhaar Card / PAN Card"
                required
                disabled={!customerId}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Document type
              </label>
              <select
                className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300"
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                disabled={!customerId}
              >
                <option value="ID_PROOF">ID Proof</option>
                <option value="ADDRESS_PROOF">Address Proof</option>
                <option value="INCOME_PROOF">Income Proof</option>
                <option value="AGREEMENT">Agreement</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Upload file (image/pdf)
              </label>

              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  disabled={!customerId}
                />
                <div className="mt-2 text-xs text-slate-500">
                  Allowed: images or PDF.
                </div>

                {file && (
                  <div className="mt-3 rounded-xl bg-white border border-slate-200 px-3 py-2 text-sm">
                    <div className="font-semibold text-slate-800">
                      {file.name}
                    </div>
                    <div className="text-slate-500">
                      {(file.size / 1024).toFixed(1)} KB
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button
              className="w-full rounded-xl bg-slate-900 text-white px-4 py-2 font-semibold hover:opacity-95 disabled:opacity-60"
              disabled={!customerId || saving}
            >
              {saving ? "Uploading..." : "Upload"}
            </button>

            {!customerId && (
              <div className="text-xs text-slate-500">
                Set Customer ID in Setup first.
              </div>
            )}
          </form>
        </Card>

        <Card title="Your documents" subtitle="Track verification status here.">
          {loading ? (
            <div className="text-sm text-slate-500">Loading...</div>
          ) : (
            <Table
              columns={columns}
              rows={rows.map((d) => ({
                id: d.id ?? "-",
                docName: d.docName ?? "-",
                docType: d.docType ?? "-",
                docStatus: statusChip(d.docStatus),
                uploadedDate: toDate(d.uploadedDate),
                verifiedDate: toDate(d.verifiedDate),
              }))}
              emptyText="No documents yet"
            />
          )}
        </Card>
      </div>
    </div>
  );
}
