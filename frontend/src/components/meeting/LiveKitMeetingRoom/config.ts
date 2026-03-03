import { VideoPresets, ScreenSharePresets } from "livekit-client";

export const LIVEKIT_OPTIONS = {
  // --- Publish settings ---
  publishDefaults: {
    // Enable simulcast: sends multiple resolution layers so the SFU
    // can forward the best layer per subscriber
    simulcast: true,
    videoSimulcastLayers: [VideoPresets.h180, VideoPresets.h360],

    // VP9 with SVC gives better quality at lower bitrates than VP8
    videoCodec: "vp9" as const,
    // SVC scalability mode: 3 spatial layers, 3 temporal layers
    scalabilityMode: "L3T3_KEY" as const,
    // Auto-fallback to VP8 for browsers that don't support VP9
    backupCodec: true,

    // Primary camera encoding cap (applied to the highest layer)
    videoEncoding: {
      maxBitrate: 1_700_000, // 1.7 Mbps for 720p
      maxFramerate: 30,
    },

    // Screen share encoding — high bitrate for crisp text/code
    screenShareEncoding: {
      maxBitrate: 3_000_000, // 3 Mbps
      maxFramerate: 30,
    },
    screenShareSimulcastLayers: [ScreenSharePresets.h720fps15],

    // Audio: higher quality preset
    dtx: true, // Discontinuous transmission saves bandwidth in silence
    red: true, // Redundant audio for packet loss resilience
  },

  // --- Capture settings ---
  videoCaptureDefaults: {
    resolution: VideoPresets.h720.resolution, // 1280×720 @ 30fps
  },

  // Dynamic broadcast — stop sending layers nobody is watching
  dynacast: true,
  // Adaptive stream — auto-adjust subscribed quality per viewer's tile size
  adaptiveStream: true,
};
