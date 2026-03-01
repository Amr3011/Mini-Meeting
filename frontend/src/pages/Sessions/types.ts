import type { SummarizerSession } from "../../types/user.types";

export interface SessionsPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export interface SessionCardProps {
  session: {
    id: number;
    started_at: string;
    status: SummarizerSession["status"];
    error: string | null;
  };
  index: number;
  onClick: () => void;
}

export interface StatusBadgeProps {
  status: SummarizerSession["status"];
  hasError: boolean;
}
