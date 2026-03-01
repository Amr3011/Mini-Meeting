interface ErrorDisplayProps {
  error: string;
}

/**
 * Error display for summarizer
 * Shows error message with red styling
 */
export const ErrorDisplay = ({ error }: ErrorDisplayProps) => (
  <div
    style={{
      backgroundColor: "rgba(220, 38, 38, 0.2)",
      border: "1px solid rgba(220, 38, 38, 0.5)",
      color: "#fca5a5",
      padding: "8px 12px",
      borderRadius: "6px",
      fontSize: "13px",
    }}
  >
    {error}
  </div>
);
