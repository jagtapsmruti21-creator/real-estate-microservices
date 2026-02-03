import { useEffect, useMemo, useState } from "react";
import Card from "../../components/Card";
import Table from "../../components/Table";
import api from "../../lib/api";
import { getProfileId } from "../../lib/auth";

export default function OwnerProjects() {
  const ownerId = getProfileId();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [form, setForm] = useState({
    projName: "",
    address: "",
    description: "",
    price: "",
  });

  const columns = useMemo(
    () => [
      { key: "projId", header: "ID" },
      { key: "projName", header: "Project" },
      { key: "address", header: "Address" },
      { key: "description", header: "Description" },
      { key: "price", header: "Price (₹)" },
    ],
    []
  );

  const load = async () => {
    if (!ownerId) return;
    setErr("");
    setLoading(true);
    try {
      const res = await api.get(`/api/owner/${ownerId}/projects`);
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setErr(e?.response?.data?.message || e?.response?.data || e.message || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownerId]);

  const create = async (e) => {
    e.preventDefault();
    if (!ownerId) return;

    setErr("");
    try {
      await api.post(`/api/owner/${ownerId}/projects`, {
        projName: form.projName,
        address: form.address,
        description: form.description,
        price: form.price ? Number(form.price) : null,
      });
      setForm({ projName: "", address: "", description: "", price: "" });
      await load();
    } catch (e2) {
      setErr(e2?.response?.data?.message || e2?.response?.data || e2.message || "Failed to create project");
    }
  };

  return (
    <div className="space-y-6">
      <Card title="Your projects" subtitle={ownerId ? `Owner: ${ownerId}` : "Owner ID not set"}>
        {err && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm">
            {String(err)}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div className="font-semibold mb-2">Create project</div>
            <form onSubmit={create} className="space-y-3">
              <input
                className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300"
                placeholder="Project name"
                value={form.projName}
                onChange={(e) => setForm((s) => ({ ...s, projName: e.target.value }))}
                required
              />
              <input
                className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300"
                placeholder="Address"
                value={form.address}
                onChange={(e) => setForm((s) => ({ ...s, address: e.target.value }))}
              />
              <textarea
                className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300"
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
                rows={3}
              />
              <input
                type="number"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300"
                placeholder="Price (INR)"
                value={form.price}
                onChange={(e) => setForm((s) => ({ ...s, price: e.target.value }))}
              />
              <button
                className="rounded-xl bg-slate-900 text-white px-4 py-2 font-semibold hover:opacity-95 disabled:opacity-60"
                disabled={!ownerId}
              >
                Add
              </button>
              {!ownerId && <div className="text-xs text-slate-500">Set Owner ID in Setup first.</div>}
            </form>
          </div>

          <div>
            <div className="font-semibold mb-2">List</div>
            {loading ? (
              <div className="text-sm text-slate-500">Loading...</div>
            ) : (
              <Table
                columns={columns}
                rows={rows.map((r) => ({
                  projId: r.projId ?? r.id ?? "-",
                  projName: r.projName ?? "-",
                  address: r.address ?? "-",
                  description: r.description ?? "-",
                  price: r.price ?? "-",
                }))}
                emptyText="No projects yet"
              />
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
