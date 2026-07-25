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

/** Sends each role to its own landing dashboard on "/" — matches the three
 * separate dashboard wireframes in DESIGN.docx rather than one shared page. */
function RoleHome() {
  const { user } = useAuth();
  if (user?.role === "supervisor") return <SupervisorDashboard />;
  if (user?.role === "admin") return <AdminDashboard />;
  return <Dashboard />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <ProtectedRoute roles={["officer", "supervisor", "admin"]}>
            <RoleHome />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cases"
        element={
          <ProtectedRoute roles={["officer", "supervisor", "admin"]}>
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
          <ProtectedRoute roles={["officer", "supervisor", "admin"]}>
            <CaseDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/documents"
        element={
          <ProtectedRoute roles={["officer", "supervisor", "admin"]}>
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
          <ProtectedRoute roles={["supervisor", "admin"]}>
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
          <ProtectedRoute roles={["admin"]}>
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