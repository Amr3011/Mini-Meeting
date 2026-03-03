import { Route } from "react-router-dom";
import { lazy } from "react";
import { ProtectedRoute } from "../../components/auth/ProtectedRoute";

const Dashboard = lazy(() => import("../../pages/Dashboard"));
const Profile = lazy(() => import("../../pages/Profile"));
const Sessions = lazy(() => import("../../pages/Sessions"));
const SessionDetail = lazy(() => import("../../pages/SessionDetail"));

/**
 * Protected routes requiring user authentication
 */
export const ProtectedRoutes = (
  <>
    {/* Dashboard */}
    <Route
      path="/dashboard"
      element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      }
    />

    {/* User profile */}
    <Route
      path="/profile"
      element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      }
    />

    {/* Sessions list */}
    <Route
      path="/sessions"
      element={
        <ProtectedRoute>
          <Sessions />
        </ProtectedRoute>
      }
    />

    {/* Session detail */}
    <Route
      path="/sessions/:id"
      element={
        <ProtectedRoute>
          <SessionDetail />
        </ProtectedRoute>
      }
    />
  </>
);
