import React from "react";
import type { StatusBadgeProps } from "./types";
import { STATUS_CONFIG } from "./constants";

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  hasError,
}) => {
  const cfg = hasError
    ? {
        label: "Failed",
        color: "text-red-700",
        bg: "bg-red-50",
        dot: "bg-red-500",
      }
    : STATUS_CONFIG[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${cfg.bg} ${cfg.color}`}
    >
      <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};
