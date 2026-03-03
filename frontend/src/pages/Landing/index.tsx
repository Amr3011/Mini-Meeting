import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { JoinMeetingInput } from "../../components/meeting/JoinMeetingInput";
import { LandingHeader } from "./LandingHeader";
import { HeroSection } from "./HeroSection";
import { FeaturesGrid } from "./FeaturesGrid";

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-purple-50 to-pink-50">
      <LandingHeader isAuthenticated={isAuthenticated} />
      <main className="flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <HeroSection />
          <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-10 mb-8 animate-slide-up">
            <JoinMeetingInput />
          </div>
          <FeaturesGrid />
        </div>
      </main>
      <footer className="mt-16 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} MiniMeeting. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
