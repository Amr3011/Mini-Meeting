import React from "react";
import type { ContentSectionProps } from "./types";
import { CopyButton } from "./CopyButton";

export const ContentSection: React.FC<ContentSectionProps> = ({
  title,
  content,
  copyLabel,
  icon,
}) => {
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
};
