import { useEffect, useMemo, useState } from "react";
import Card from "../../components/Card";
import Table from "../../components/Table";
import api from "../../lib/api";
import { getProfileId, getEmail } from "../../lib/auth";

function money(n) {
  const num = Number(n);
  if (!Number.isFinite(num)) return "-";
  return num.toLocaleString("en-IN");
}

function toNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
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

export default function CustomerPayments() {
  const customerId = getProfileId();
  const email = getEmail();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [paying, setPaying] = useState(false);
  const [err, setErr] = useState("");

  // inputs
  const [payAmount, setPayAmount] = useState("");
  const [bookingId, setBookingId] = useState("");

  const columns = useMemo(
    () => [
      { key: "pid", header: "Payment ID" },
      { key: "amount", header: "Amount" },
      { key: "paymentStatus", header: "Status" },
      { key: "modeOfPayment", header: "Mode" },
      { key: "gatewayOrderId", header: "Order ID" },
      { key: "gatewayPaymentId", header: "Payment ID" },
    ],
    []
  );

  const load = async () => {
    if (!customerId) return;
    setErr("");
    setLoading(true);
    try {
      const res = await api.get(`/api/customer/${customerId}/payments`);
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setErr(e?.response?.data?.message || e?.response?.data || e.message || "Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId]);

  // summary based on SUCCESS payments
  const successPayments = rows.filter((p) => String(p.paymentStatus || "").toUpperCase() === "SUCCESS");
  const totalPaid = successPayments.reduce((sum, p) => sum + toNum(p.amount || p.advPayment), 0);

  const payNow = async (e) => {
    e.preventDefault();
    if (!customerId) return;

    const amt = toNum(payAmount);
    if (amt <= 0) return alert("Enter a valid amount");

    setErr("");
    setPaying(true);

    try {
      const ok = await loadRazorpayScript();
      if (!ok) throw new Error("Razorpay SDK failed to load. Check internet or script tag in index.html.");

      // 1) Create Order via CORE (core -> payment-service -> Razorpay)
      const orderRes = await api.post(`/api/customer/${customerId}/payments/create-order`, {
        amount: amt,
        currency: "INR",
        bookingId: bookingId ? Number(bookingId) : null,
      });

      const { orderId, keyId, amount, currency } = orderRes.data || {};
      if (!orderId || !keyId) throw new Error("OrderId / keyId missing from backend response");

      // 2) Open Razorpay checkout
      const options = {
        key: keyId,
        amount: Math.round(toNum(amount || amt) * 100), // paise
        currency: currency || "INR",
        name: "Real Estate Management",
        description: "Booking Payment",
        order_id: orderId,
        prefill: {
          email: email || "",
        },
        handler: async function (response) {
          // 3) Verify Payment via CORE
          await api.post(`/api/customer/${customerId}/payments/verify`, {
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
          });

          alert("Payment successful!");
          setPayAmount("");
          await load();
        },
        modal: {
          ondismiss: () => {
            // user closed checkout
          },
        },
        theme: { color: "#0f172a" },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (resp) {
        setErr(resp?.error?.description || "Payment failed");
      });
      rzp.open();
    } catch (e2) {
      setErr(e2?.response?.data?.message || e2?.response?.data || e2.message || "Payment init failed");
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-lg font-bold text-slate-900">Payments</div>
          <div className="text-sm text-slate-500">Pay using Razorpay (UPI/Card/Netbanking).</div>
          <div className="text-xs text-slate-400 mt-1">
            {customerId ? `Customer ID: ${customerId}` : "Customer ID not set"}
          </div>
        </div>

        <button
          type="button"
          onClick={load}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 font-semibold hover:shadow disabled:opacity-60"
          disabled={!customerId || loading}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {err && (
        <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm">
          {String(err)}
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="Total Paid" subtitle="Sum of SUCCESS payments">
          <div className="text-2xl font-bold text-slate-900">₹ {money(totalPaid)}</div>
        </Card>

        <Card title="Note" subtitle="Remaining amount logic">
          <div className="text-sm text-slate-700">
            Remaining depends on your booking/project total price.
            If you want, I’ll add a backend endpoint: <span className="font-mono">/payments/summary</span> so you can show
            <b> total / paid / remaining</b> properly.
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pay */}
        <Card title="Pay Now" subtitle="This will open Razorpay checkout">
          <form onSubmit={payNow} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Amount</label>
              <input
                type="number"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                placeholder="e.g. 50000"
                required
                disabled={!customerId || paying}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Booking ID (optional)</label>
              <input
                type="number"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300"
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                placeholder="e.g. 12"
                disabled={!customerId || paying}
              />
            </div>

            <button
              className="w-full rounded-xl bg-slate-900 text-white px-4 py-2 font-semibold hover:opacity-95 disabled:opacity-60"
              disabled={!customerId || paying}
            >
              {paying ? "Opening checkout..." : "Pay via Razorpay"}
            </button>
          </form>
        </Card>

        {/* History */}
        <Card title="Payment History" subtitle="Shows gateway fields too">
          {loading ? (
            <div className="text-sm text-slate-500">Loading...</div>
          ) : (
            <Table
              columns={columns}
              rows={rows.map((p) => ({
                pid: p.pid ?? "-",
                amount: p.amount ?? p.advPayment ?? "-",
                paymentStatus: p.paymentStatus ?? "-",
                modeOfPayment: p.modeOfPayment ?? "-",
                gatewayOrderId: p.gatewayOrderId ?? "-",
                gatewayPaymentId: p.gatewayPaymentId ?? "-",
              }))}
              emptyText="No payments yet"
            />
          )}
        </Card>
      </div>
    </div>
  );
}
