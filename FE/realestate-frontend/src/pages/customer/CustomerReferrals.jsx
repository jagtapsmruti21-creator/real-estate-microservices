import { useEffect, useMemo, useState } from "react";
import Card from "../../components/Card";
import Table from "../../components/Table";
import api from "../../lib/api";
import { getProfileId } from "../../lib/auth";

export default function CustomerReferrals() {
  const customerId = getProfileId();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [form, setForm] = useState({
    referralCode: "",
    referredUserId: "",
    refStatus: "PENDING",
  });

  const columns = useMemo(
    () => [
      { key: "id", header: "ID" },
      { key: "referrerUserId", header: "Referrer" },
      { key: "referredUserId", header: "Referred" },
      { key: "referralCode", header: "Code" },
      { key: "refStatus", header: "Status" },
    ],
    []
  );

  const load = async () => {
    if (!customerId) return;
    setErr("");
    setLoading(true);
    try {
      const res = await api.get(`/api/customer/${customerId}/referrals`);
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setErr(e?.response?.data?.message || e?.response?.data || e.message || "Failed to load referrals");
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
      await api.post(`/api/customer/${customerId}/referrals`, {
        referralCode: form.referralCode,
        refStatus: form.refStatus,
        referredUserId: form.referredUserId ? Number(form.referredUserId) : null,
        referrerUserId: customerId,
      });
      setForm({ referralCode: "", referredUserId: "", refStatus: "PENDING" });
      await load();
    } catch (e2) {
      setErr(e2?.response?.data?.message || e2?.response?.data || e2.message || "Failed to create referral");
    }
  };

  return (
    <div className="space-y-6">
      <Card title="Referrals" subtitle={customerId ? `Customer: ${customerId}` : "Customer ID not set"}>
        {err && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm">
            {String(err)}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div className="font-semibold mb-2">Create referral</div>
            <form onSubmit={create} className="space-y-3">
              <div>
                <label className="text-sm font-semibold">Referral code</label>
                <input
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300"
                  value={form.referralCode}
                  onChange={(e) => setForm((s) => ({ ...s, referralCode: e.target.value }))}
                  placeholder="e.g. ABC123"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-semibold">Referred user ID</label>
                <input
                  type="number"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300"
                  value={form.referredUserId}
                  onChange={(e) => setForm((s) => ({ ...s, referredUserId: e.target.value }))}
                  placeholder="e.g. 2"
                />
              </div>
              <div>
                <label className="text-sm font-semibold">Status</label>
                <input
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300"
                  value={form.refStatus}
                  onChange={(e) => setForm((s) => ({ ...s, refStatus: e.target.value }))}
                  placeholder="PENDING / APPROVED"
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
            <div className="font-semibold mb-2">Your referrals</div>
            {loading ? (
              <div className="text-sm text-slate-500">Loading...</div>
            ) : (
              <Table
                columns={columns}
                rows={rows.map((r) => ({
                  id: r.id ?? "-",
                  referrerUserId: r.referrerUserId ?? r.referrer_user_id ?? "-",
                  referredUserId: r.referredUserId ?? r.referred_user_id ?? "-",
                  referralCode: r.referralCode ?? r.referral_code ?? "-",
                  refStatus: r.refStatus ?? r.ref_status ?? "-",
                }))}
                emptyText="No referrals yet"
              />
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
