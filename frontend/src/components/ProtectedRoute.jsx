import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Layout from "./Layout";

/** Wraps a page: redirects to /login if not authenticated, and to the
 * user's own dashboard if their role isn't in `roles` (e.g. an officer
 * hitting /reports directly). Renders inside the shared Layout chrome.
 *
 * Omitting `roles` allows any authenticated user. Note that "/" must stay
 * unrestricted — it is the redirect target below, so gating it would bounce
 * a disallowed role back to a route that rejects it again, forever. */
export default function ProtectedRoute({ children, roles }) {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-gray-500">Loading…</div>;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    // Bouncing to "/" from "/" would loop; show the reason instead.
    if (location.pathname === "/") {
      return (
        <Layout>
          <div className="mx-auto max-w-md rounded-xl border border-gray-200 bg-white p-8 text-center">
            <h1 className="text-lg font-semibold text-gray-900">Access restricted</h1>
            <p className="mt-2 text-sm text-gray-600">
              Your role ({user.role}) does not have access to this page.
            </p>
          </div>
        </Layout>
      );
    }
    return <Navigate to="/" replace />;
  }

  return <Layout>{children}</Layout>;
}
