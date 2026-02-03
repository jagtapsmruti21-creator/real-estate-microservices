import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./components/AppShell";
import OwnerShell from "./components/OwnerShell";
import CustomerShell from "./components/CustomerShell";
import { getProfileId, getRole, isLoggedIn } from "./lib/auth";

import Bookings from "./pages/Bookings";
import Customers from "./pages/Customers";
import Dashboard from "./pages/Dashboard";
import Documents from "./pages/Documents";
import Feedbacks from "./pages/Feedbacks";
import Login from "./pages/Login";
import Payments from "./pages/Payments";
import Referrals from "./pages/Referrals";
import SetupProfile from "./pages/SetupProfile";
import Register from "./pages/Register"; // ✅ ADDED

import OwnerDashboard from "./pages/owner/OwnerDashboard";
import OwnerProjects from "./pages/owner/OwnerProjects";
import OwnerBookings from "./pages/owner/OwnerBookings";

import CustomerHome from "./pages/customer/CustomerHome";
import CustomerProjects from "./pages/customer/CustomerProjects";
import CustomerBookings from "./pages/customer/CustomerBookings";
import CustomerPayments from "./pages/customer/CustomerPayments";
import CustomerDocuments from "./pages/customer/CustomerDocuments";
import CustomerReferrals from "./pages/customer/CustomerReferrals";
import CustomerFeedbacks from "./pages/customer/CustomerFeedbacks";

function Protected({ children }) {
  return isLoggedIn() ? children : <Navigate to="/login" replace />;
}

function RoleProtected({ allow, children }) {
  const role = getRole();
  if (!isLoggedIn()) return <Navigate to="/login" replace />;
  if (allow && !allow.includes(role)) {
    if (role === "OWNER") return <Navigate to="/owner" replace />;
    if (role === "CUSTOMER") return <Navigate to="/customer" replace />;
    return <Navigate to="/" replace />;
  }
  return children;
}

function NeedsProfileId({ children }) {
  const role = getRole();
  const profileId = getProfileId();
  if (role === "OWNER" || role === "CUSTOMER") {
    return profileId ? children : <Navigate to="/setup-profile" replace />;
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} /> {/* ✅ ADDED */}

      <Route
        path="/setup-profile"
        element={
          <Protected>
            <SetupProfile />
          </Protected>
        }
      />

      {/* ===================== ADMIN (existing, keep working) ===================== */}
      <Route
        path="/"
        element={
          <RoleProtected allow={["ADMIN"]}>
            <AppShell />
          </RoleProtected>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="customers" element={<Customers />} />
        <Route path="payments" element={<Payments />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="documents" element={<Documents />} />
        <Route path="referrals" element={<Referrals />} />
        <Route path="feedbacks" element={<Feedbacks />} />
      </Route>

      {/* ===================== OWNER ===================== */}
      <Route
        path="/owner"
        element={
          <RoleProtected allow={["OWNER"]}>
            <NeedsProfileId>
              <OwnerShell />
            </NeedsProfileId>
          </RoleProtected>
        }
      >
        <Route index element={<OwnerDashboard />} />
        <Route path="projects" element={<OwnerProjects />} />
        <Route path="bookings" element={<OwnerBookings />} />
      </Route>

      {/* ===================== CUSTOMER ===================== */}
      <Route
        path="/customer"
        element={
          <RoleProtected allow={["CUSTOMER"]}>
            <NeedsProfileId>
              <CustomerShell />
            </NeedsProfileId>
          </RoleProtected>
        }
      >
        <Route index element={<CustomerHome />} />

        {/* ✅ ADD THIS */}
        <Route path="projects" element={<CustomerProjects />} />

        <Route path="bookings" element={<CustomerBookings />} />
        <Route path="payments" element={<CustomerPayments />} />
        <Route path="documents" element={<CustomerDocuments />} />
        <Route path="referrals" element={<CustomerReferrals />} />
        <Route path="feedbacks" element={<CustomerFeedbacks />} />
      </Route>

      {/* fallback */}
      <Route
        path="*"
        element={
          <Protected>
            <Navigate to="/" replace />
          </Protected>
        }
      />
    </Routes>
  );
}
