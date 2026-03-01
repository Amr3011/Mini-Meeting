/**
 * Optimize video constraints for different scenarios
 */
export const getOptimizedVideoConstraints = (
  scenario: "preview" | "meeting",
  deviceId?: string,
): MediaTrackConstraints => {
  const baseConstraints: MediaTrackConstraints = {
    deviceId: deviceId ? { exact: deviceId } : undefined,
  };

  if (scenario === "preview") {
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
      facingMode: "user",
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
      displaySurface: "monitor", // Prefer full screen
      // @ts-expect-error - logicalSurface is valid but not in TS types yet
      logicalSurface: true,
      cursor: "always", // Show cursor in screen share
    },
    audio: false, // System audio can be enabled separately
  };
};
