import { useCallback } from "react";

/**
 * Custom hook to announce screen reader messages
 * Useful for dynamic content changes
 */
export const useScreenReaderAnnouncement = () => {
  const announce = useCallback(
    (message: string, priority: "polite" | "assertive" = "polite") => {
      // Create or get announcement element
      let announcer = document.getElementById("sr-announcer") as HTMLDivElement;

      if (!announcer) {
        announcer = document.createElement("div");
        announcer.id = "sr-announcer";
        announcer.setAttribute("role", "status");
        announcer.setAttribute("aria-live", priority);
        announcer.setAttribute("aria-atomic", "true");
        announcer.className = "sr-only";
        announcer.style.cssText = `
        position: absolute;
        left: -10000px;
        width: 1px;
        height: 1px;
        overflow: hidden;
      `;
        document.body.appendChild(announcer);
      } else {
        announcer.setAttribute("aria-live", priority);
      }

      // Clear previous message
      announcer.textContent = "";

      // Set new message after a brief delay to ensure screen readers detect the change
      setTimeout(() => {
        announcer.textContent = message;
      }, 100);
    },
    [],
  );

  return announce;
};
