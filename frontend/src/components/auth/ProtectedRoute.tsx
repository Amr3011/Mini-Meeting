import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = false,
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  console.log("🛡️ ProtectedRoute check:", {
    isAuthenticated,
    isLoading,
    userEmail: user?.email,
  });

  if (isLoading) {
    console.log("⏳ Auth still loading, showing spinner");
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log("🚫 Not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user?.role !== "admin") {
    console.log("🚫 Not admin, redirecting to dashboard");
    return <Navigate to="/dashboard" replace />;
  }

  console.log("✅ Access granted");
  return <>{children}</>;
};
