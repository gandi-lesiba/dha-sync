import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NewCase from "./pages/NewCase";
import CaseDetail from "./pages/CaseDetail";
import CasesList from "./pages/CasesList";
import DocumentsList from "./pages/DocumentsList";
import UsersManagement from "./pages/UsersManagement";
import AuditLogPage from "./pages/AuditLogPage";
import SettingsPage from "./pages/SettingsPage";
import SupervisorDashboard from "./pages/SupervisorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import DeportationBoard from "./pages/DeportationBoard";
import Reports from "./pages/Reports";
import { useAuth } from "./context/AuthContext";

/** Sends each role to its own landing page on "/" — the three dashboard
 * wireframes in DESIGN.docx, plus sensible landings for the two read-only
 * roles. A border official only has case/document read access, so their
 * home is the case list rather than a stats dashboard they can't load. */
function RoleHome() {
  const { user } = useAuth();
  if (user?.role === "supervisor") return <SupervisorDashboard />;
  if (user?.role === "admin") return <AdminDashboard />;
  if (user?.role === "borderofficial") return <CasesList />;
  return <Dashboard />;
}

// Read access to cases/documents — matches the backend's widest role list.
const ALL_ROLES = ["officer", "supervisor", "admin", "auditor", "borderofficial"];

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* "/" deliberately has no role restriction: it is the fallback every
          other route redirects to, so restricting it can only ever produce a
          redirect loop. RoleHome decides what each role actually sees. */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <RoleHome />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cases"
        element={
          <ProtectedRoute roles={ALL_ROLES}>
            <CasesList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cases/new"
        element={
          <ProtectedRoute roles={["officer", "supervisor", "admin"]}>
            <NewCase />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cases/:id"
        element={
          <ProtectedRoute roles={ALL_ROLES}>
            <CaseDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/documents"
        element={
          <ProtectedRoute roles={ALL_ROLES}>
            <DocumentsList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/deportation"
        element={
          <ProtectedRoute roles={["supervisor", "admin"]}>
            <DeportationBoard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute roles={["supervisor", "admin", "auditor"]}>
            <Reports />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute roles={["admin"]}>
            <UsersManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/audit"
        element={
          <ProtectedRoute roles={["admin", "supervisor", "auditor"]}>
            <AuditLogPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute roles={["admin"]}>
            <SettingsPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}