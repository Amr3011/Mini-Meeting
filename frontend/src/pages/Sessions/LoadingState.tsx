export const LoadingState: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-24">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600 mb-4" />
    <p className="text-gray-400 text-sm">Loading sessions...</p>
  </div>
);
