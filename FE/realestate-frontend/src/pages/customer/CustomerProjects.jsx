import { useEffect, useMemo, useState } from "react";
import Card from "../../components/Card";
import Table from "../../components/Table";
import api from "../../lib/api";
import { getEmail, getProfileId } from "../../lib/auth";

function toNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function money(n) {
  const num = Number(n);
  if (!Number.isFinite(num)) return "-";
  return num.toLocaleString("en-IN");
}

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);

    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => resolve(false));
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function CustomerProjects() {
  const customerId = getProfileId();
  const email = getEmail();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [err, setErr] = useState("");

  const columns = useMemo(
    () => [
      { key: "id", header: "Project ID" },
      { key: "projName", header: "Project" },
      { key: "ownerName", header: "Owner" },
      { key: "address", header: "Address" },
      { key: "price", header: "Price (₹)" },
      { key: "action", header: "Action" },
    ],
    []
  );

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await api.get(`/api/customer/projects`);
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setErr(e?.response?.data?.message || e?.response?.data || e.message || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const bookAndPay = async (project) => {
    if (!customerId) return alert("Customer profile is not set. Go to Setup Profile first.");

    const projectId = project?.id;
    if (!projectId) return;

    const total = toNum(project?.price);
    if (total <= 0) {
      return alert("This project has no price set. Ask owner to add price.");
    }

    setErr("");
    setBusyId(projectId);

    try {
      const ok = await loadRazorpayScript();
      if (!ok) throw new Error("Razorpay SDK failed to load.");

      // 1) Create booking for this project
      const today = new Date().toISOString().slice(0, 10);
      const bookingRes = await api.post(`/api/customer/${customerId}/projects/${projectId}/bookings`, {
        bookingDate: today,
        status: "PENDING",
        totalPrice: total,
      });

      const booking = bookingRes.data;
      const bookingId = booking?.id ?? booking?.bookingId;
      if (!bookingId) throw new Error("Booking id missing from backend response");

      // 2) Create Razorpay order via core -> payment-service
      const orderRes = await api.post(`/api/customer/${customerId}/payments/create-order`, {
        amount: total,
        currency: "INR",
        bookingId: Number(bookingId),
      });

      const { orderId, keyId, amount, currency } = orderRes.data || {};
      if (!orderId || !keyId) throw new Error("OrderId / keyId missing from backend response");

      // 3) Open Razorpay checkout
      const options = {
        key: keyId,
        amount: Math.round(toNum(amount || total) * 100),
        currency: currency || "INR",
        name: "Real Estate Management",
        description: `Payment for booking #${bookingId}`,
        order_id: orderId,
        prefill: { email: email || "" },
        handler: async function (response) {
          await api.post(`/api/customer/${customerId}/payments/verify`, {
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
          });
          alert("Payment successful! Check your bookings / payments.");
        },
        theme: { color: "#0f172a" },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (resp) {
        setErr(resp?.error?.description || "Payment failed");
      });
      rzp.open();
    } catch (e2) {
      setErr(e2?.response?.data?.message || e2?.response?.data || e2.message || "Booking/payment failed");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-lg font-bold text-slate-900">Available Properties</div>
          <div className="text-sm text-slate-500">See all owner projects, book a project, and pay via Razorpay.</div>
        </div>

        <button
          type="button"
          onClick={load}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 font-semibold hover:shadow disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {err && (
        <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm">{String(err)}</div>
      )}

      <Card title="Projects list" subtitle="Click Book & Pay to create a booking and complete payment">
        <Table
          columns={columns}
          rows={rows.map((p) => ({
            id: p.id ?? "-",
            projName: p.projName ?? "-",
            ownerName: p.ownerName ?? "-",
            address: p.address ?? "-",
            price: p.price != null ? `₹ ${money(p.price)}` : "-",
            action: (
              <button
                className="rounded-xl bg-slate-900 text-white px-3 py-1.5 text-sm font-semibold hover:opacity-95 disabled:opacity-60"
                onClick={() => bookAndPay(p)}
                disabled={busyId === (p.id ?? null)}
              >
                {busyId === (p.id ?? null) ? "Processing..." : "Book & Pay"}
              </button>
            ),
          }))}
          emptyText={loading ? "Loading..." : "No projects found"}
        />
      </Card>
    </div>
  );
}
