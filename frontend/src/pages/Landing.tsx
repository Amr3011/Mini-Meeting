import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/common/Button";
import { JoinMeetingInput } from "../components/meeting/JoinMeetingInput";

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Redirect to dashboard if authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header with Sign In/Sign Up buttons (only for guests) */}
      {!isAuthenticated && (
        <header className="absolute top-0 left-0 right-0 z-10" role="banner">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-6">
            <div className="flex justify-between items-center">
              {/* Logo */}
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-linear-to-br from-brand-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shrink-0">
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <span className="hidden sm:inline text-lg sm:text-xl font-bold text-gray-900">MiniMeeting</span>
              </div>

              {/* Auth buttons */}
              <div className="flex gap-2 sm:gap-3 shrink-0">
                <Button
                  variant="ghost"
                  onClick={() => navigate("/login")}
                  size="sm"
                  className="text-sm sm:text-base"
                >
                  Sign In
                </Button>
                <Button
                  variant="primary"
                  onClick={() => navigate("/register")}
                  size="sm"
                  className="shadow-lg hover:shadow-xl transition-shadow text-sm sm:text-base"
                >
                  <span className="hidden sm:inline">Get Started Free →</span>
                  <span className="sm:hidden">Sign Up</span>
                </Button>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8" role="main">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Section */}
          <div className="mb-12">
            {/* App Logo/Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 mt-8 mb-6 bg-linear-to-br from-brand-600 to-purple-600 rounded-3xl shadow-2xl animate-float" aria-label="MiniMeeting logo">
              <svg
                className="w-12 h-12 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </div>

            {/* Heading */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-secondary-900 mb-6 leading-tight">
              Video meetings
              <br />
              <span className="bg-linear-to-r from-brand-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                made simple
              </span>
            </h1>

            {/* Tagline */}
            <p className="text-xl sm:text-2xl text-gray-600 mb-12 max-w-2xl mx-auto">
              Connect with anyone, anywhere. Join or create meetings in seconds with crystal-clear video quality.
            </p>
          </div>

          {/* Join Meeting Section */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-10 mb-8 animate-slide-up" role="region" aria-label="Join meeting section">
            <JoinMeetingInput />
          </div>

          {/* Features Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {[
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                ),
                title: "HD Video",
                description: "Crystal-clear video quality",
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                ),
                title: "Secure",
                description: "End-to-end encryption",
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                ),
                title: "No Time Limits",
                description: "Unlimited meeting duration",
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                    />
                  </svg>
                ),
                title: "AI Summaries",
                description: "Smart AI-powered meeting notes",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in hover:-translate-y-1"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="inline-flex items-center justify-center w-12 h-12 mb-4 bg-linear-to-br from-brand-600 to-purple-600 text-white rounded-lg" aria-hidden="true">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-secondary-700">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 py-6" role="contentinfo">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} MiniMeeting. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
