import { useEffect, useMemo, useState } from "react";
import Card from "../../components/Card";
import Table from "../../components/Table";
import api from "../../lib/api";
import { getProfileId } from "../../lib/auth";

export default function CustomerFeedbacks() {
  const customerId = getProfileId();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [form, setForm] = useState({
    rating: "5",
    comment: "",
    feedbackDate: "",
  });

  const columns = useMemo(
    () => [
      { key: "id", header: "ID" },
      { key: "rating", header: "Rating" },
      { key: "comment", header: "Comment" },
      { key: "feedbackDate", header: "Date" },
    ],
    []
  );

  const load = async () => {
    if (!customerId) return;
    setErr("");
    setLoading(true);
    try {
      const res = await api.get(`/api/customer/${customerId}/feedbacks`);
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setErr(e?.response?.data?.message || e?.response?.data || e.message || "Failed to load feedbacks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId]);

  const create = async (e) => {
    e.preventDefault();
    if (!customerId) return;
    setErr("");

    try {
      await api.post(`/api/customer/${customerId}/feedbacks`, {
        rating: form.rating ? Number(form.rating) : null,
        comment: form.comment,
        feedbackDate: form.feedbackDate || null,
      });
      setForm({ rating: "5", comment: "", feedbackDate: "" });
      await load();
    } catch (e2) {
      setErr(e2?.response?.data?.message || e2?.response?.data || e2.message || "Failed to add feedback");
    }
  };

  return (
    <div className="space-y-6">
      <Card title="Feedbacks" subtitle={customerId ? `Customer: ${customerId}` : "Customer ID not set"}>
        {err && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm">
            {String(err)}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div className="font-semibold mb-2">Add feedback</div>
            <form onSubmit={create} className="space-y-3">
              <div>
                <label className="text-sm font-semibold">Rating (1-5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300"
                  value={form.rating}
                  onChange={(e) => setForm((s) => ({ ...s, rating: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-semibold">Comment</label>
                <textarea
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300"
                  value={form.comment}
                  onChange={(e) => setForm((s) => ({ ...s, comment: e.target.value }))}
                  placeholder="Write your feedback..."
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-semibold">Date</label>
                <input
                  type="date"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300"
                  value={form.feedbackDate}
                  onChange={(e) => setForm((s) => ({ ...s, feedbackDate: e.target.value }))}
                />
              </div>

              <button
                className="rounded-xl bg-slate-900 text-white px-4 py-2 font-semibold hover:opacity-95 disabled:opacity-60"
                disabled={!customerId}
              >
                Add
              </button>
              {!customerId && <div className="text-xs text-slate-500">Set Customer ID in Setup first.</div>}
            </form>
          </div>

          <div>
            <div className="font-semibold mb-2">Your feedbacks</div>
            {loading ? (
              <div className="text-sm text-slate-500">Loading...</div>
            ) : (
              <Table
                columns={columns}
                rows={rows.map((f) => ({
                  id: f.id ?? "-",
                  rating: f.rating ?? "-",
                  comment: f.comment ?? "-",
                  feedbackDate: f.feedbackDate ?? "-",
                }))}
                emptyText="No feedback yet"
              />
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
