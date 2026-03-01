import { Link } from "react-router-dom";

export const BackLink: React.FC = () => (
  <Link
    to="/sessions"
    className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-600 transition-colors mb-6 group"
  >
    <svg
      className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 19l-7-7 7-7"
      />
    </svg>
    Back to Sessions
  </Link>
);
