import React from "react";
import type { SessionHeaderProps } from "./types";
import { StatusBadge } from "./StatusBadge";
import { ProgressBar } from "./ProgressBar";
import { formatDate } from "./utils";

export const SessionHeader: React.FC<SessionHeaderProps> = ({
  session,
  onDelete,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-linear-to-br from-brand-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm">
              #{session.id}
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Session {session.id}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!session.error && (
            <button
              onClick={onDelete}
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
        <ProgressBar
          status={session.status}
          hasError={!!session.error}
          errorMessage={session.error}
        />
      </div>
    </div>
  );
};
