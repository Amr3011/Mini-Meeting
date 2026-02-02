import { LoginForm } from "../components/auth/LoginForm";

export default function Login() {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <LoginForm />
      </div>

      {/* Right Side - Visual/Branding */}
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 bg-linear-to-br from-brand-500 via-purple-600 to-brand-700">
          {/* Animated circles */}
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-2xl animate-bounce-gentle" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center text-white p-12 w-full">
          {/* Logo */}
          <div className="mb-8 w-20 h-20 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center shadow-2xl">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>

          {/* Heading */}
          <h1 className="text-4xl font-bold text-center mb-4">
            Connect with anyone,
            <br />
            anywhere
          </h1>
          <p className="text-lg text-white/80 text-center max-w-md mb-12">
            Experience seamless video conferencing with crystal-clear quality and powerful collaboration tools.
          </p>

          {/* Features */}
          <div className="space-y-4 w-full max-w-md">
            {[
              { icon: '✓', text: 'HD Video & Audio Quality' },
              { icon: '✓', text: 'Screen Sharing & Recording' },
              { icon: '✓', text: 'Secure End-to-End Encryption' },
              { icon: '✓', text: 'Unlimited Meeting Duration' },
            ].map((feature, i) => (
              <div
                key={i}
                className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4 animate-slide-in-left"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold">
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
