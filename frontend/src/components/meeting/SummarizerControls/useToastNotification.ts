import { useState, useEffect } from "react";

/**
 * Hook for managing toast notifications for summarizer
 * Shows notification when recording is captured
 */
export function useToastNotification(status: string | undefined) {
  const [showToast, setShowToast] = useState(false);
  const showCapturedMessage = status === "CAPTURED";

  useEffect(() => {
    if (status === "CAPTURED") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowToast(true);
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      setShowToast(false);
    }
  }, [status]);

  return { showCapturedMessage, showToast, setShowToast };
}
