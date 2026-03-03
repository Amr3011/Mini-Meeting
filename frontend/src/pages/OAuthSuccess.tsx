import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Loading } from "../components/common/Loading";

const OAuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setAuthData, isAuthenticated, user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  // Effect to handle navigation after successful auth
  useEffect(() => {
    if (isAuthenticated && user && !isProcessing) {
      console.log("✅ User authenticated, navigating to dashboard...");
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, user, isProcessing, navigate]);

  useEffect(() => {
    const processOAuth = async () => {
      const token = searchParams.get("token");
      console.log("🔑 OAuth token received:", token ? "Yes" : "No");

      if (!token) {
        console.error("❌ No token in URL params");
        setError("No token received from OAuth provider");
        setIsProcessing(false);
        setTimeout(() => navigate("/login"), 3000);
        return;
      }

      try {
        console.log("🔄 Starting authentication with token...");
        await setAuthData(token);
        console.log(
          "✅ Authentication successful, waiting for state update...",
        );
        setIsProcessing(false);
      } catch (error) {
        console.error("❌ OAuth authentication error:", error);
        setError(
          `Failed to process authentication: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
        setIsProcessing(false);
        setTimeout(() => navigate("/login"), 3000);
      }
    };

    processOAuth();
  }, [searchParams, navigate, setAuthData]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-brand-50 via-white to-accent-50">
        <div className="glass rounded-2xl shadow-xl p-8 max-w-md w-full text-center space-y-4">
          <div className="text-red-600 text-5xl">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900">
            Authentication Failed
          </h2>
          <p className="text-gray-600">{error}</p>
          <p className="text-sm text-gray-500">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-brand-50 via-white to-accent-50">
        <div className="glass rounded-2xl shadow-xl p-8 max-w-md w-full text-center space-y-4">
          <Loading />
          <h2 className="text-2xl font-bold text-gray-900">
            Completing Sign In
          </h2>
          <p className="text-gray-600">
            Please wait while we set up your account...
          </p>
        </div>
      </div>
    );
  }

  return null;
};

export default OAuthSuccess;
