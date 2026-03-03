export interface SummarizerControlsProps {
  meetingId: number;
  isAdmin: boolean;
  inline?: boolean;
}

export interface StatusIndicatorProps {
  isActive: boolean;
  showCapturedMessage: boolean;
}

export interface ToggleButtonProps {
  isActive: boolean;
  isLoading: boolean;
  onToggle: () => void;
  inline?: boolean;
}
