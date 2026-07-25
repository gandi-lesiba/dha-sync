import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Layout from "./Layout";

/** Wraps a page: redirects to /login if not authenticated, and to the
 * user's own dashboard if their role isn't in `roles` (e.g. an officer
 * hitting /reports directly). Renders inside the shared Layout chrome. */
export default function ProtectedRoute({ children, roles }) {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-gray-500">Loading…</div>;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return <Layout>{children}</Layout>;
}