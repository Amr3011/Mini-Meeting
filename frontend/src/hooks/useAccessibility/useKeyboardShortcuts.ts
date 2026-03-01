import { useEffect, useCallback } from "react";

/**
 * Custom hook for handling keyboard shortcuts with accessibility support
 * Respects user preferences and doesn't trigger in input fields
 */
export const useKeyboardShortcuts = (shortcuts: Record<string, () => void>) => {
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      // Check if the pressed key matches any shortcut
      const key = event.key.toLowerCase();
      if (shortcuts[key]) {
        event.preventDefault();
        shortcuts[key]();
      }
    },
    [shortcuts],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleKeyPress]);
};
