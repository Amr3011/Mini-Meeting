/**
 * Loading fallback component for lazy-loaded routes
 * Displays spinning loader with accessible status
 */
const LoadingFallback = () => (
  <div
    className="min-h-screen bg-secondary-900 flex items-center justify-center"
    role="status"
    aria-live="polite"
  >
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
      <p className="text-gray-400">Loading...</p>
    </div>
  </div>
);

export default LoadingFallback;
