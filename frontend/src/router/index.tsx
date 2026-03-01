import { BrowserRouter, Routes } from "react-router-dom";
import { Suspense } from "react";
import { ErrorBoundary } from "../components/common/ErrorBoundary";
import LoadingFallback from "./components/LoadingFallback";
import AuthInitializer from "./components/AuthInitializer";
import { PublicRoutes } from "./routes/publicRoutes";
import { ProtectedRoutes } from "./routes/protectedRoutes";
import { AdminRoutes } from "./routes/adminRoutes";
import { MeetingRoutes } from "./routes/meetingRoutes";

/**
 * Main application router
 * Organizes all routes by access level: public, protected, admin, meeting
 */
function AppRouter() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthInitializer>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {PublicRoutes}
              {ProtectedRoutes}
              {AdminRoutes}
              {MeetingRoutes}
            </Routes>
          </Suspense>
        </AuthInitializer>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default AppRouter;
