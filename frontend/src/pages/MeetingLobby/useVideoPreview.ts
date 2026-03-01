import { useEffect } from "react";

export function useVideoPreview(
  videoRef: React.RefObject<HTMLVideoElement>,
  stream: MediaStream | null,
  cameraEnabled: boolean,
) {
  useEffect(() => {
    if (videoRef.current && stream && cameraEnabled) {
      videoRef.current.srcObject = stream;
    }
  }, [videoRef, stream, cameraEnabled]);
}
