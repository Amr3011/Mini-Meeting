import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Layout } from "../components/layout/Layout";
import type { SummarizerSession } from "../types/user.types";

const STATUS_CONFIG: Record<
  SummarizerSession["status"],
  { label: string; color: string; bg: string; dot: string }
> = {
  STARTED: {
    label: "Recording",
    color: "text-yellow-700",
    bg: "bg-yellow-50",
    dot: "bg-yellow-500",
  },
  CAPTURED: {
    label: "Captured",
    color: "text-blue-700",
    bg: "bg-blue-50",
    dot: "bg-blue-500",
  },
  TRANSCRIBED: {
    label: "Transcribed",
    color: "text-indigo-700",
    bg: "bg-indigo-50",
    dot: "bg-indigo-500",
  },
  NORMALIZED: {
    label: "Normalized",
    color: "text-purple-700",
    bg: "bg-purple-50",
    dot: "bg-purple-500",
  },
  SUMMARIZED: {
    label: "Summarized",
    color: "text-green-700",
    bg: "bg-green-50",
    dot: "bg-green-500",
  },
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusBadge({ status, hasError }: { status: SummarizerSession["status"]; hasError: boolean }) {
  const cfg = hasError
    ? { label: "Failed", color: "text-red-700", bg: "bg-red-50", dot: "bg-red-500" }
    : STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.color}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

export default function Sessions() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const sessions = user?.summarizer_sessions ?? [];

  // Sort newest first
  const sorted = [...sessions].sort(
    (a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
  );

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Sessions</h1>
          <p className="mt-2 text-gray-500">
            View your meeting summarizer sessions and their transcripts &amp; summaries.
          </p>
        </div>

        {sorted.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-brand-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-1">No sessions yet</h2>
            <p className="text-gray-500 max-w-sm">
              Start a meeting and use the summarizer to capture your first session.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {sorted.map((session, idx) => (
              <button
                key={session.id}
                onClick={() => navigate(`/sessions/${session.id}`)}
                className="w-full text-left bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-brand-200 transition-all duration-200 group animate-fade-in"
                style={{ animationDelay: `${idx * 40}ms` }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    {/* Session number icon */}
                    <div className="flex-shrink-0 w-11 h-11 bg-linear-to-br from-brand-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover:shadow-glow transition-all duration-300">
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

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <StatusBadge status={session.status} hasError={!!session.error} />
                    {/* Arrow */}
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

                {/* Progress indicator based on status */}
                <div className="mt-4 flex items-center gap-1">
                  {(["CAPTURED", "TRANSCRIBED", "NORMALIZED", "SUMMARIZED"] as const).map(
                    (step) => {
                      const steps = ["CAPTURED", "TRANSCRIBED", "NORMALIZED", "SUMMARIZED"];
                      const currentIdx = steps.indexOf(session.status);
                      const stepIdx = steps.indexOf(step);
                      const isActive = stepIdx <= currentIdx && !session.error;
                      return (
                        <div
                          key={step}
                          className={`h-1 flex-1 rounded-full transition-colors duration-300 ${isActive ? "bg-brand-500" : "bg-gray-100"
                            }`}
                        />
                      );
                    }
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
