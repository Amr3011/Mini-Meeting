import { useMemo } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Button } from "../components/common/Button";

const OAuthError = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const { errorMessage, suggestion } = useMemo(() => {
    const error = searchParams.get("error");
    const email = searchParams.get("email");
    const provider = searchParams.get("provider");

    let message = "";
    let suggestionText = "";

    switch (error) {
      case "account_exists_local":
        message = `An account with email ${email} already exists.`;
        suggestionText = `This email is registered with a local account (password-based). You can either:
          1. Sign in with your email and password, or
          2. Contact support to link your ${provider} account.`;
        break;
      case "account_exists_different_provider":
        message = `An account with email ${email} is already linked to another provider.`;
        suggestionText = "Please sign in using the provider you originally used to create your account.";
        break;
      default:
        message = "An unexpected error occurred during authentication.";
        suggestionText = "Please try again or contact support if the problem persists.";
    }

    return { errorMessage: message, suggestion: suggestionText };
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-brand-50 via-white to-accent-50 p-4">
      <div className="glass rounded-2xl shadow-xl p-8 max-w-md w-full space-y-6 animate-scale-up">
        {/* Error Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>

        {/* Error Message */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Account Conflict</h2>
          <p className="text-gray-600">{errorMessage}</p>
        </div>

        {/* Suggestion */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-gray-700 whitespace-pre-line">{suggestion}</p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            variant="gradient"
            size="lg"
            fullWidth
            onClick={() => navigate("/login")}
          >
            Go to Sign In
          </Button>
          <div className="text-center">
            <Link
              to="/register"
              className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
            >
              Create a new account instead
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OAuthError;
