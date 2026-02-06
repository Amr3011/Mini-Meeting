/**
 * Browser and device detection utilities
 * Helps manage media device access across different browsers and platforms
 */

/**
 * Check if the current context is secure (HTTPS or localhost)
 * Required for accessing camera and microphone on mobile browsers
 */
export const isSecureContext = (): boolean => {
  return window.isSecureContext || window.location.hostname === 'localhost';
};

/**
 * Detect if the user is on a mobile device
 */
export const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

/**
 * Detect if the user is on iOS (Safari or Chrome)
 */
export const isIOS = (): boolean => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as Window & { MSStream?: unknown }).MSStream;
};

/**
 * Detect if the user is on Safari browser
 */
export const isSafari = (): boolean => {
  const ua = navigator.userAgent.toLowerCase();
  return ua.indexOf('safari') !== -1 && ua.indexOf('chrome') === -1;
};

/**
 * Check if getUserMedia is supported
 */
export const isGetUserMediaSupported = (): boolean => {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
};

/**
 * Get a user-friendly error message for media device errors
 */
export const getMediaErrorMessage = (error: unknown): string => {
  const errorName = (error as { name?: string })?.name || '';

  if (errorName === 'NotAllowedError' || errorName === 'PermissionDeniedError') {
    return 'Permission denied. Please allow camera and microphone access in your browser settings.';
  }

  if (errorName === 'NotFoundError') {
    return 'No camera or microphone found. Please connect a device and try again.';
  }

  if (errorName === 'NotReadableError') {
    return 'Camera or microphone is already in use by another application.';
  }

  if (errorName === 'OverconstrainedError') {
    return 'No device found matching the specified requirements. Please try with different settings.';
  }

  if (errorName === 'TypeError') {
    return 'Invalid device constraints. Please refresh the page and try again.';
  }

  return 'Failed to access camera or microphone. Please check your device settings.';
};

/**
 * Check if we need user interaction before requesting media
 * iOS and some mobile browsers require user gesture
 */
export const requiresUserGesture = (): boolean => {
  return isMobileDevice() || isIOS();
};
