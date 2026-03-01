interface VerticalBarsProps {
  level: number;
}

/**
 * Vertical bars audio level indicator
 * Shows 10 bars with increasing heights
 */
export const VerticalBars = ({ level }: VerticalBarsProps) => (
  <div className="flex gap-1 items-end h-8">
    {[...Array(10)].map((_, i) => (
      <div
        key={i}
        className={`w-1 rounded-full transition-all ${
          level * 10 > i ? "bg-green-500" : "bg-gray-300"
        }`}
        style={{ height: `${20 + i * 8}%` }}
      />
    ))}
  </div>
);
