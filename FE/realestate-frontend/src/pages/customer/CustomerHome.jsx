import { useNavigate } from "react-router-dom";
import Card from "../../components/Card";
import { getProfileId } from "../../lib/auth";

function chip(text, tone = "slate") {
  const base =
    "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold border";
  const tones = {
    green: "bg-green-50 text-green-700 border-green-200",
    amber: "bg-amber-50 text-amber-800 border-amber-200",
    red: "bg-red-50 text-red-700 border-red-200",
    slate: "bg-slate-50 text-slate-700 border-slate-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
  };
  return <span className={`${base} ${tones[tone] || tones.slate}`}>{text}</span>;
}

export default function CustomerHome() {
  const navigate = useNavigate();
  const customerId = getProfileId();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-lg font-bold text-slate-900">Customer Dashboard</div>
          <div className="text-sm text-slate-500">
            Track your booking, payments, and document verification.
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {customerId ? `Customer ID: ${customerId}` : "Customer ID not set"}
          </div>
        </div>

        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 font-semibold hover:shadow"
        >
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card title="Booking" subtitle="Your booking status">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-600">Status</div>
              {chip("CHECK IN BOOKINGS", "blue")}
            </div>
            <button
              type="button"
              onClick={() => navigate("/customer/bookings")}
              className="w-full rounded-xl bg-slate-900 text-white px-3 py-2 font-semibold hover:opacity-95"
            >
              View Bookings
            </button>
          </div>
        </Card>

        <Card title="Payments" subtitle="Track your payments">
          <div className="space-y-3">
            <div className="text-sm text-slate-600">
              View total paid & remaining amount.
            </div>
            <button
              type="button"
              onClick={() => navigate("/customer/payments")}
              className="w-full rounded-xl bg-slate-900 text-white px-3 py-2 font-semibold hover:opacity-95"
            >
              Go to Payments
            </button>
          </div>
        </Card>

        <Card title="Documents" subtitle="Upload & verification">
          <div className="space-y-3">
            <div className="flex gap-2 flex-wrap">
              {chip("Pending", "amber")}
              {chip("Approved", "green")}
              {chip("Rejected", "red")}
            </div>
            <button
              type="button"
              onClick={() => navigate("/customer/documents")}
              className="w-full rounded-xl bg-slate-900 text-white px-3 py-2 font-semibold hover:opacity-95"
            >
              Upload / View Docs
            </button>
          </div>
        </Card>

        <Card title="Referrals" subtitle="Invite friends">
          <div className="space-y-3">
            <div className="text-sm text-slate-600">
              Add referrals and track rewards.
            </div>
            <button
              type="button"
              onClick={() => navigate("/customer/referrals")}
              className="w-full rounded-xl bg-slate-900 text-white px-3 py-2 font-semibold hover:opacity-95"
            >
              View Referrals
            </button>
          </div>
        </Card>
      </div>

      {/* Next actions */}
      <Card title="Next actions" subtitle="Recommended steps">
        <div className="space-y-2 text-sm text-slate-700">
          <div className="flex items-start gap-2">
            <span className="mt-0.5">⬜</span>
            <div>
              <div className="font-semibold">Upload documents</div>
              <div className="text-slate-500">Aadhaar/PAN/Agreement as needed</div>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <span className="mt-0.5">⬜</span>
            <div>
              <div className="font-semibold">Complete pending payment</div>
              <div className="text-slate-500">Check remaining amount in Payments</div>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <span className="mt-0.5">⬜</span>
            <div>
              <div className="font-semibold">Add feedback</div>
              <div className="text-slate-500">Help improve the service</div>
            </div>
          </div>

          <div className="pt-2 flex gap-3 flex-wrap">
            <button
              type="button"
              onClick={() => navigate("/customer/documents")}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 font-semibold hover:shadow"
            >
              Documents
            </button>
            <button
              type="button"
              onClick={() => navigate("/customer/payments")}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 font-semibold hover:shadow"
            >
              Payments
            </button>
            <button
              type="button"
              onClick={() => navigate("/customer/feedbacks")}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 font-semibold hover:shadow"
            >
              Feedbacks
            </button>
          </div>
        </div>
      </Card>

      {!customerId && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 text-amber-800 px-3 py-2 text-sm">
          Customer ID not set. Please complete Setup Profile first.
        </div>
      )}
    </div>
  );
}
