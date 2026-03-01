import React from "react";
import type { ProgressBarProps } from "./types";
import { PROCESSING_STEPS } from "./constants";

export const ProgressBar: React.FC<ProgressBarProps> = ({
  status,
  hasError,
}) => {
  if (hasError) {
    return (
      <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl border border-red-100">
        <svg
          className="w-4 h-4 text-red-400 shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
        <p className="text-xs text-red-600 font-medium">
          Failed at <span className="font-bold">{status as string}</span> stage
        </p>
      </div>
    );
  }

  const currentIdx = PROCESSING_STEPS.indexOf(status);

  return (
    <div className="flex items-center gap-1.5">
      {PROCESSING_STEPS.map((step, stepIdx) => {
        const isActive = stepIdx <= currentIdx;
        return (
          <div key={step} className="flex-1 flex flex-col items-center gap-1">
            <div
              className={`h-1.5 w-full rounded-full transition-colors duration-300 ${
                isActive ? "bg-brand-500" : "bg-gray-100"
              }`}
            />
            <span className="text-[10px] text-gray-400 hidden sm:block">
              {step[0] + step.slice(1).toLowerCase()}
            </span>
          </div>
        );
      })}
    </div>
  );
};
