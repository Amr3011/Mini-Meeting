import type { SummarizerSession } from "../../types/user.types";

export const STATUS_CONFIG: Record<
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

export const PROCESSING_STEPS = [
  "STARTED",
  "CAPTURED",
  "TRANSCRIBED",
  "NORMALIZED",
  "SUMMARIZED",
] as const;
