import { Route } from "react-router-dom";
import { lazy } from "react";
import { ProtectedRoute } from "../../components/auth/ProtectedRoute";

const AdminUsers = lazy(() => import("../../pages/AdminUsers"));

/**
 * Admin-only routes requiring admin role
 */
export const AdminRoutes = (
  <>
    <Route
      path="/admin/users"
      element={
        <ProtectedRoute requireAdmin>
          <AdminUsers />
        </ProtectedRoute>
      }
    />
  </>
);
