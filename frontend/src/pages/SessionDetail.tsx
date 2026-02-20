import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Layout } from "../components/layout/Layout";
import { userService } from "../services/api/user.service";
import type { SummarizerSession } from "../types/user.types";
import { Modal } from "../components/common/Modal";
import { Button } from "../components/common/Button";

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

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function StatusBadge({ status, hasError }: { status: SummarizerSession["status"]; hasError: boolean }) {
  const cfg = hasError
    ? { label: "Failed", color: "text-red-700", bg: "bg-red-50", dot: "bg-red-500" }
    : STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${cfg.bg} ${cfg.color}`}
    >
      <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${copied
        ? "bg-green-50 text-green-700 border border-green-200"
        : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-brand-50 hover:text-brand-700 hover:border-brand-200"
        }`}
    >
      {copied ? (
        <>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          Copy {label}
        </>
      )}
    </button>
  );
}

function ContentSection({
  title,
  content,
  copyLabel,
  icon,
}: {
  title: string;
  content: string | null;
  copyLabel: string;
  icon: React.ReactNode;
}) {
  const isEmpty = !content;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-brand-500">{icon}</span>
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        </div>
        {!isEmpty && <CopyButton text={content!} label={copyLabel} />}
      </div>
      <div className="px-6 py-5">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center mb-3">
              <svg
                className="w-5 h-5 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-sm text-gray-400">Not available yet</p>
            <p className="text-xs text-gray-300 mt-1">
              This will appear once the session is processed
            </p>
          </div>
        ) : (
          <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono leading-relaxed max-h-96 overflow-y-auto">
            {content}
          </pre>
        )}
      </div>
    </div>
  );
}

export default function SessionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<SummarizerSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    const sessionId = Number(id);
    if (!id || isNaN(sessionId)) {
      setError("Invalid session ID.");
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();

    userService
      .getSession(sessionId, controller.signal)
      .then(setSession)
      .catch((err: any) => {
        if (err.name === "CanceledError" || err.name === "AbortError") return;
        setError(err.message || "Session not found.");
      })
      .finally(() => {
        if (controller.signal.aborted) return;
        setIsLoading(false);
      });

    return () => controller.abort();
  }, [id]);

  const handleDelete = async () => {
    if (!session) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await userService.deleteSession(session.id);
      setShowDeleteModal(false);
      navigate("/sessions");
    } catch (err: any) {
      console.error("Failed to delete session:", err);
      setDeleteError(err.message || "Failed to delete session. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Back link */}
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Sessions
        </Link>

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600 mb-4" />
            <p className="text-gray-400 text-sm">Loading session…</p>
          </div>
        )}

        {/* Error */}
        {!isLoading && error && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
              <svg
                className="w-7 h-7 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-800 mb-1">Session not found</h2>
            <p className="text-gray-500 text-sm">{error}</p>
            <Link
              to="/sessions"
              className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors"
            >
              View all sessions
            </Link>
          </div>
        )}

        {/* Session content */}
        {!isLoading && session && (
          <div className="space-y-6 animate-fade-in">
            {/* Header card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-10 h-10 bg-linear-to-br from-brand-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm">
                      #{session.id}
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Session {session.id}</h1>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!session.error && (
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 group"
                      title="Delete Session"
                    >
                      <svg
                        className="w-4 h-4 text-gray-400 group-hover:text-red-500 transition-colors"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      <span className="text-xs font-medium">Delete</span>
                    </button>
                  )}
                  <StatusBadge status={session.status} hasError={!!session.error} />
                </div>
              </div>

              {/* Meta info */}
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                    Started At
                  </p>
                  <p className="text-sm font-semibold text-gray-800">
                    {formatDate(session.started_at)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                    Ended At
                  </p>
                  <p className="text-sm font-semibold text-gray-800">
                    {formatDate(session.ended_at)}
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                    Processing Progress
                  </p>
                </div>
                {session.error ? (
                  <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl border border-red-100">
                    <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <p className="text-xs text-red-600 font-medium">
                      Failed at <span className="font-bold">{session.status}</span> stage
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    {(["CAPTURED", "TRANSCRIBED", "NORMALIZED", "SUMMARIZED"] as const).map((step) => {
                      const steps = ["CAPTURED", "TRANSCRIBED", "NORMALIZED", "SUMMARIZED"];
                      const currentIdx = steps.indexOf(session.status);
                      const stepIdx = steps.indexOf(step);
                      const isActive = stepIdx <= currentIdx;
                      return (
                        <div key={step} className="flex-1 flex flex-col items-center gap-1">
                          <div
                            className={`h-1.5 w-full rounded-full transition-colors duration-300 ${isActive ? "bg-brand-500" : "bg-gray-100"
                              }`}
                          />
                          <span className="text-[10px] text-gray-400 hidden sm:block">{step[0] + step.slice(1).toLowerCase()}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Error notice */}
            {session.error && (
              <div className="bg-red-50 border border-red-100 rounded-2xl p-6 flex flex-col sm:flex-row items-start gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-red-800 mb-1">Session could not be processed</h3>
                    <p className="text-sm text-red-600 mb-3">{session.error}</p>
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-red-200 text-red-700 text-xs font-medium rounded-lg hover:bg-red-50 transition-colors shadow-sm"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete Session
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Transcript */}
            {!session.error && (
              <ContentSection
                title="Transcript"
                content={session.transcript}
                copyLabel="Transcript"
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                }
              />
            )}

            {/* Summary */}
            {!session.error && (
              <ContentSection
                title="Summary"
                content={session.summary}
                copyLabel="Summary"
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                }
              />
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => !isDeleting && setShowDeleteModal(false)}
        title="Delete Session"
        type="danger"
        size="sm"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <Button
              variant="ghost"
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              isLoading={isDeleting}
              leftIcon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              }
            >
              Delete Session
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to delete this session? This action cannot be undone and all data associated with it will be permanently removed.
          </p>

          {deleteError && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-red-600">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs font-medium">{deleteError}</p>
            </div>
          )}
        </div>
      </Modal>
    </Layout>
  );
}
