import { useEffect, useCallback } from 'react';

/**
 * Custom hook for handling keyboard shortcuts with accessibility support
 * Respects user preferences for reduced motion
 */
export const useKeyboardShortcuts = (shortcuts: Record<string, () => void>) => {
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
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
    [shortcuts]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);
};

/**
 * Custom hook to manage focus trap for modal dialogs
 * Ensures keyboard navigation stays within the modal
 */
export const useFocusTrap = (
  isActive: boolean,
  containerRef: React.RefObject<HTMLElement>
) => {
  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus first element when modal opens
    firstElement.focus();

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, [isActive, containerRef]);
};

/**
 * Custom hook to check if user prefers reduced motion
 * Used for respecting accessibility preferences
 */
export const usePrefersReducedMotion = (): boolean => {
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  return mediaQuery.matches;
};

/**
 * Custom hook to announce screen reader messages
 * Useful for dynamic content changes
 */
export const useScreenReaderAnnouncement = () => {
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    // Create or get announcement element
    let announcer = document.getElementById('sr-announcer') as HTMLDivElement;

    if (!announcer) {
      announcer = document.createElement('div');
      announcer.id = 'sr-announcer';
      announcer.setAttribute('role', 'status');
      announcer.setAttribute('aria-live', priority);
      announcer.setAttribute('aria-atomic', 'true');
      announcer.className = 'sr-only';
      announcer.style.cssText = `
        position: absolute;
        left: -10000px;
        width: 1px;
        height: 1px;
        overflow: hidden;
      `;
      document.body.appendChild(announcer);
    } else {
      announcer.setAttribute('aria-live', priority);
    }

    // Clear previous message
    announcer.textContent = '';

    // Set new message after a brief delay to ensure screen readers detect the change
    setTimeout(() => {
      announcer.textContent = message;
    }, 100);
  }, []);

  return announce;
};
