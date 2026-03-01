import { useNavigate } from "react-router-dom";
import { Button } from "../../components/common/Button";

export const LandingHeader: React.FC<{ isAuthenticated: boolean }> = ({
  isAuthenticated,
}) => {
  const navigate = useNavigate();

  if (isAuthenticated) return null;

  return (
    <header className="absolute top-0 left-0 right-0 z-10" role="banner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-linear-to-br from-brand-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shrink-0">
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </div>
            <span className="hidden sm:inline text-lg sm:text-xl font-bold text-gray-900">
              MiniMeeting
            </span>
          </div>
          <div className="flex gap-2 sm:gap-3 shrink-0">
            <Button
              variant="ghost"
              onClick={() => navigate("/login")}
              size="sm"
            >
              Sign In
            </Button>
            <Button
              variant="primary"
              onClick={() => navigate("/register")}
              size="sm"
              className="shadow-lg hover:shadow-xl"
            >
              <span className="hidden sm:inline">Get Started Free →</span>
              <span className="sm:hidden">Sign Up</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
