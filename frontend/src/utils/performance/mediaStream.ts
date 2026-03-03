/**
 * Cleanup media stream tracks properly
 */
export const cleanupMediaStream = (stream: MediaStream | null): void => {
  if (!stream) return;

  stream.getTracks().forEach((track) => {
    track.stop();
    stream.removeTrack(track);
  });
};
