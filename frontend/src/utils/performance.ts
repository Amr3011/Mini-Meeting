/**
 * Performance optimization utilities
 * Implements debouncing for expensive operations
 */

/**
 * Debounce function to limit the rate at which a function can fire
 * Useful for input handlers and resize events
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function to ensure a function is called at most once per specified time period
 * Useful for scroll handlers and continuous events
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Request idle callback wrapper with fallback
 * Schedules work to be done when the browser is idle
 */
export const requestIdleCallback =
  window.requestIdleCallback ||
  function (cb: IdleRequestCallback) {
    const start = Date.now();
    return setTimeout(() => {
      cb({
        didTimeout: false,
        timeRemaining: () => Math.max(0, 50 - (Date.now() - start)),
      });
    }, 1) as unknown as number;
  };

/**
 * Cancel idle callback wrapper with fallback
 */
export const cancelIdleCallback =
  window.cancelIdleCallback ||
  function (id: number) {
    clearTimeout(id);
  };

/**
 * Preload an image for better performance
 */
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};

/**
 * Check if user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Cleanup media stream tracks properly
 */
export const cleanupMediaStream = (stream: MediaStream | null): void => {
  if (!stream) return;

  stream.getTracks().forEach(track => {
    track.stop();
    stream.removeTrack(track);
  });
};

/**
 * Optimize video constraints for different scenarios
 */
export const getOptimizedVideoConstraints = (
  scenario: 'preview' | 'meeting',
  deviceId?: string
): MediaTrackConstraints => {
  const baseConstraints: MediaTrackConstraints = {
    deviceId: deviceId ? { exact: deviceId } : undefined,
  };

  if (scenario === 'preview') {
    // Lower quality for preview to save bandwidth and CPU
    return {
      ...baseConstraints,
      width: { ideal: 640 },
      height: { ideal: 480 },
      frameRate: { ideal: 24 },
    };
  } else {
    // Higher quality for actual meeting with HD resolution
    return {
      ...baseConstraints,
      width: { ideal: 1280, min: 640 },
      height: { ideal: 720, min: 480 },
      frameRate: { ideal: 30, min: 15 },
      // Additional quality constraints
      aspectRatio: { ideal: 16 / 9 },
      facingMode: 'user',
    };
  }
};

/**
 * Get optimized screen share constraints for high-quality screen sharing
 */
export const getScreenShareConstraints = (): DisplayMediaStreamOptions => {
  return {
    video: {
      // High resolution for screen share
      width: { ideal: 1920, max: 1920 },
      height: { ideal: 1080, max: 1080 },
      frameRate: { ideal: 15, max: 30 },
      // @ts-ignore - displaySurface is valid but not in TS types
      displaySurface: 'monitor', // Prefer full screen
      // @ts-ignore
      logicalSurface: true,
      cursor: 'always', // Show cursor in screen share
    },
    audio: false, // System audio can be enabled separately
  };
};
