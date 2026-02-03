import {
  ClipboardList,
  CreditCard,
  FileText,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Share2,
  Users,
} from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { clearSession, getEmail } from "../lib/auth";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/payments", label: "Payments", icon: CreditCard },
  { to: "/bookings", label: "Bookings", icon: ClipboardList },
  { to: "/documents", label: "Documents", icon: FileText },
  { to: "/referrals", label: "Referrals", icon: Share2 },
  { to: "/feedbacks", label: "Feedbacks", icon: MessageSquare },
];

function LinkItem({ to, label, icon: Icon, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        [
          "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition",
          isActive
            ? "bg-slate-900 text-white shadow"
            : "text-slate-700 hover:bg-white hover:shadow",
        ].join(" ")
      }
    >
      <Icon size={18} />
      <span>{label}</span>
    </NavLink>
  );
}

export default function AppShell() {
  const navigate = useNavigate();
  const email = getEmail();

  const logout = () => {
    clearSession();
    navigate("/login");
  };

  return (
    <div className="min-h-screen grid grid-cols-12">
      {/* Sidebar */}
      <aside className="col-span-12 md:col-span-3 lg:col-span-2 bg-slate-100 border-r border-slate-200">
        <div className="p-4">
          <div className="rounded-2xl bg-white p-3 shadow-sm border border-slate-200">
            <div className="text-xs text-slate-500">Real Estate</div>
            <div className="text-lg font-semibold">Management</div>
          </div>

          <nav className="mt-4 flex flex-col gap-2">
            {nav.map((n) => (
              <LinkItem key={n.to} {...n} />
            ))}
          </nav>

          <button
            onClick={logout}
            className="mt-6 w-full flex items-center justify-center gap-2 rounded-xl bg-white border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-800 hover:shadow"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="col-span-12 md:col-span-9 lg:col-span-10">
        <header className="sticky top-0 z-10 bg-slate-50/80 backdrop-blur border-b border-slate-200">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-500">Welcome back</div>
              <div className="text-xl font-semibold">Admin Dashboard</div>
              {email && <div className="text-xs text-slate-500 mt-0.5">{email}</div>}
            </div>
            <div className="text-xs text-slate-500">
              Tip: If 401 happens, you’ll be auto-logged out.
            </div>
          </div>
        </header>

        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
