import { STATUS_CONFIG, ERROR_BADGE_CONFIG } from "./constants";
import type { StatusBadgeProps } from "./types";
import type { SummarizerSession } from "../../types/user.types";

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  hasError,
}) => {
  const cfg = hasError
    ? ERROR_BADGE_CONFIG
    : STATUS_CONFIG[status as SummarizerSession["status"]];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.color}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};
