export const HeroSection: React.FC = () => (
  <div className="mb-12">
    <div className="inline-flex items-center justify-center w-20 h-20 mt-8 mb-6 bg-linear-to-br from-brand-600 to-purple-600 rounded-3xl shadow-2xl animate-float">
      <svg
        className="w-12 h-12 text-white"
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
    <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-secondary-900 mb-6 leading-tight">
      Video meetings
      <br />
      <span className="bg-linear-to-r from-brand-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
        made simple
      </span>
    </h1>
    <p className="text-xl sm:text-2xl text-gray-600 mb-12 max-w-2xl mx-auto">
      Connect with anyone, anywhere. Join or create meetings in seconds with
      crystal-clear video quality.
    </p>
  </div>
);
