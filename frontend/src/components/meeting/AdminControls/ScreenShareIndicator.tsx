import { ScreenShareIcon } from "./icons";

/**
 * Screen share indicator
 * Shows when participant is sharing screen
 */
export const ScreenShareIndicator = () => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "4px",
      padding: "4px 8px",
      fontSize: "11px",
      backgroundColor: "rgba(59, 130, 246, 0.2)",
      color: "#60a5fa",
      borderRadius: "4px",
    }}
  >
    <ScreenShareIcon />
    <span>Sharing Screen</span>
  </div>
);
