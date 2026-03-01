/**
 * Custom hook to check if user prefers reduced motion
 * Used for respecting accessibility preferences
 */
export const usePrefersReducedMotion = (): boolean => {
  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  return mediaQuery.matches;
};
