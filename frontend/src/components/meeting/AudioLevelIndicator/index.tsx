import { useAudioAnalysis } from "./useAudioAnalysis";
import { VerticalBars } from "./VerticalBars";
import { HorizontalBars } from "./HorizontalBars";

interface AudioLevelIndicatorProps {
  /** Controlled mode: pass a level value (0-1) directly */
  level?: number;
  /** Self-managed mode: device ID to monitor */
  deviceId?: string;
  /** Self-managed mode: whether monitoring is enabled */
  enabled?: boolean;
  /** Number of bars to display */
  bars?: number;
  /** Visual style variant */
  variant?: "vertical" | "horizontal";
}

/**
 * Audio level indicator component
 * Displays microphone audio levels in vertical or horizontal bars
 */
const AudioLevelIndicator: React.FC<AudioLevelIndicatorProps> = ({
  level: controlledLevel,
  deviceId,
  enabled = true,
  bars = 30,
  variant = "horizontal",
}) => {
  const isControlled = controlledLevel !== undefined;

  const internalLevel = useAudioAnalysis({
    deviceId,
    enabled,
    isControlled,
  });

  const currentLevel = isControlled ? controlledLevel : internalLevel;

  if (variant === "vertical") {
    return <VerticalBars level={currentLevel} />;
  }

  return <HorizontalBars level={currentLevel} bars={bars} />;
};

export default AudioLevelIndicator;
