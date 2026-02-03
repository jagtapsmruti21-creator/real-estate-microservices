import { useEffect, useMemo, useState } from "react";
import Card from "../../components/Card";
import Table from "../../components/Table";
import api from "../../lib/api";
import { getProfileId } from "../../lib/auth";
import { Link } from "react-router-dom";

export default function CustomerBookings() {
  const customerId = getProfileId();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const columns = useMemo(
    () => [
      { key: "id", header: "Booking ID" },
      { key: "bookingDate", header: "Date" },
      { key: "status", header: "Status" },
      { key: "project", header: "Project" },
      { key: "address", header: "Address" },
      { key: "totalPrice", header: "Total (₹)" },
      { key: "paid", header: "Paid (₹)" },
      { key: "remaining", header: "Remaining (₹)" },
    ],
    []
  );

  const load = async () => {
    if (!customerId) return;
    setErr("");
    setLoading(true);
    try {
      const res = await api.get(`/api/customer/${customerId}/bookings`);
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setErr(
        e?.response?.data?.message ||
          e?.response?.data ||
          e.message ||
          "Failed to load bookings"
      );
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId]);

  return (
    <div className="space-y-6">
      <Card
        title="Your Bookings"
        subtitle={
          customerId
            ? `Customer: ${customerId} (Bookings are created from Properties → Book & Pay)`
            : "Customer ID not set"
        }
      >
        {err && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm">
            {String(err)}
          </div>
        )}

        {!customerId && (
          <div className="text-sm text-slate-600">
            Please complete your profile first (Setup Profile), then come back here.
          </div>
        )}

        <div className="flex items-center justify-between mb-3">
          <div className="text-sm text-slate-600">
            Don’t have a booking yet?{" "}
            <Link className="text-slate-900 font-semibold underline" to="/customer/projects">
              Go to Properties
            </Link>
          </div>
          <button
            onClick={load}
            className="rounded-xl border border-slate-200 px-4 py-2 font-semibold hover:bg-slate-50"
            disabled={!customerId || loading}
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="text-sm text-slate-500">Loading...</div>
        ) : (
          <Table
            columns={columns}
            rows={rows.map((b) => {
              const total = Number(b.totalPrice ?? 0);
              const paid = Number(b.totalPaid ?? 0);       // backend should send totalPaid
              const remaining = Number(b.remaining ?? (total - paid));

              return {
                id: b.id ?? "-",
                bookingDate: b.bookingDate ?? "-",
                status: b.status ?? "-",
                project: b.realEstateProjects?.projName ?? "-",
                address: b.realEstateProjects?.address ?? "-",
                totalPrice: total || "-",
                paid: paid || 0,
                remaining: remaining < 0 ? 0 : remaining,
              };
            })}
            emptyText="No bookings yet. Book from Properties → Book & Pay."
          />
        )}
      </Card>
    </div>
  );
}
