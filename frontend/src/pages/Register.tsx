import { useNavigate } from "react-router-dom";
import { RegisterForm } from "../components/auth/RegisterForm";
import { Button } from "../components/common/Button";

export default function Register() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex">
      {/* Back to Home Button */}
      <div className="absolute top-4 left-4 z-20">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          size="md"
          leftIcon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          }
        >
          Back to Home
        </Button>
      </div>

      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <RegisterForm />
      </div>

      {/* Right Side - Visual/Branding */}
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 bg-linear-to-br from-purple-600 via-brand-500 to-purple-700">
          {/* Animated circles */}
          <div className="absolute top-20 right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-2xl animate-bounce-gentle" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center text-white p-12 w-full">
          {/* Logo */}
          <div className="mb-8 w-20 h-20 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center shadow-2xl">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>

          {/* Heading */}
          <h1 className="text-4xl font-bold text-center mb-4">
            Start Your
            <br />
            Meeting Journey
          </h1>
          <p className="text-lg text-white/80 text-center max-w-md mb-12">
            Start hosting professional meetings in seconds. No credit card required.
          </p>

          {/* Features */}
          <div className="space-y-4 w-full max-w-md">
            {[
              { icon: '💳', text: 'Free, no credit card required' },
              { icon: '📝', text: 'AI Meeting Transcription' },
              { icon: '✨', text: 'AI-powered Summaries' },
              { icon: '💬', text: 'Screen sharing and Real-time chat' },
              { icon: '🔒', text: 'Secure and private meetings' },
            ].map((feature, i) => (
              <div
                key={i}
                className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4 animate-slide-in-left"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-2xl">
                  {feature.icon}
                </div>
                <span className="text-white/90">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
