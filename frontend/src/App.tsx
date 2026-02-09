import { BrowserRouter, Routes, Route, useParams } from "react-router-dom";
import { lazy, Suspense } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import { isValidMeetingCode } from "./utils/validators";

// Eager load critical pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";

// Lazy load non-critical pages for better performance
const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Profile = lazy(() => import("./pages/Profile"));
const AdminUsers = lazy(() => import("./pages/AdminUsers"));
const OAuthSuccess = lazy(() => import("./pages/OAuthSuccess"));
const OAuthError = lazy(() => import("./pages/OAuthError"));
const Meeting = lazy(() => import("./pages/Meeting"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Loading component for lazy-loaded routes
const LoadingFallback = () => (
  <div className="min-h-screen bg-secondary-900 flex items-center justify-center" role="status" aria-live="polite">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
      <p className="text-gray-400">Loading...</p>
    </div>
  </div>
);

// Wrapper component to validate meeting code format
const MeetingCodeValidator = () => {
  const { meetingCode } = useParams<{ meetingCode: string }>();
  
  // Validate meeting code format (xxx-xxxx-xxx)
  if (!meetingCode || !isValidMeetingCode(meetingCode)) {
    return <NotFound />;
  }
  
  return <Meeting />;
};

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* OAuth callback routes */}
          <Route path="/auth/oauth-success" element={<OAuthSuccess />} />
          <Route path="/auth/oauth-error" element={<OAuthError />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Admin only routes */}
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requireAdmin>
                <AdminUsers />
              </ProtectedRoute>
            }
          />

          {/* 404 - Not Found page */}
          <Route path="/404" element={<NotFound />} />

          {/* Meeting route - accessible to everyone (authenticated and guests) */}
          {/* Must be after all specific routes as it's a dynamic catch-all */}
          {/* Validates meeting code format before rendering */}
          <Route path="/:meetingCode" element={<MeetingCodeValidator />} />

          {/* 404 - catch all unmatched routes */}
          <Route path="*" element={<NotFound />} />
        </Routes>
          </Suspense>
      </AuthProvider>
    </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
