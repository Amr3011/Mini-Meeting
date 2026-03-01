import { StatusBadge } from "./StatusBadge";
import { ProgressIndicator } from "./ProgressIndicator";
import { formatDate } from "./utils";
import type { SessionCardProps } from "./types";

export const SessionCard: React.FC<SessionCardProps> = ({
  session,
  index,
  onClick,
}) => (
  <button
    onClick={onClick}
    className="w-full text-left bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-brand-200 transition-all duration-200 group animate-fade-in"
    style={{ animationDelay: `${index * 40}ms` }}
  >
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-center gap-4 min-w-0">
        <div className="shrink-0 w-11 h-11 bg-linear-to-br from-brand-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover:shadow-glow transition-all duration-300">
          #{session.id}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">
            Session {session.id}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            Started {formatDate(session.started_at)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <StatusBadge status={session.status} hasError={!!session.error} />
        <svg
          className="w-4 h-4 text-gray-400 group-hover:text-brand-500 group-hover:translate-x-0.5 transition-all duration-200"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </div>

    <ProgressIndicator status={session.status} hasError={!!session.error} />
  </button>
);
