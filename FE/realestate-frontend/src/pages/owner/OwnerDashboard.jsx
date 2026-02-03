import Card from "../../components/Card";
import { getProfileId } from "../../lib/auth";

export default function OwnerDashboard() {
  const ownerId = getProfileId();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Owner ID" subtitle="Used for API calls">
          <div className="text-2xl font-bold">{ownerId ?? "-"}</div>
        </Card>

        <Card title="Next" subtitle="What you can do here">
          <ul className="text-sm text-slate-700 list-disc pl-5 space-y-1">
            <li>Create and manage projects</li>
            <li>Update project details</li>
            <li>Delete projects</li>
          </ul>
        </Card>

        <Card title="Tip" subtitle="Backend improvement (optional)">
          <div className="text-sm text-slate-700">
            Add <span className="font-mono">GET /api/auth/me</span> so frontend can auto-detect ownerId
            from email in JWT.
          </div>
        </Card>
      </div>
    </div>
  );
}
