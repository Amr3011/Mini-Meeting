interface HorizontalBarsProps {
  level: number;
  bars: number;
}

/**
 * Horizontal bars audio level indicator
 * Shows configurable number of bars with color gradients
 */
export const HorizontalBars = ({ level, bars }: HorizontalBarsProps) => (
  <div className="flex items-center gap-2">
    <svg
      className="w-4 h-4 text-gray-400 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
      />
    </svg>
    <div
      className="flex-1 flex items-center gap-0.5 h-2"
      role="progressbar"
      aria-label="Microphone volume level"
      aria-valuenow={Math.round(level * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      {[...Array(bars)].map((_, i) => (
        <div
          key={i}
          className={`flex-1 h-full rounded-full transition-all duration-100 ${
            i < level * bars
              ? i < bars * 0.66
                ? "bg-brand-500"
                : i < bars * 0.86
                  ? "bg-warning-500"
                  : "bg-danger-500"
              : "bg-gray-700"
          }`}
        />
      ))}
    </div>
  </div>
);
