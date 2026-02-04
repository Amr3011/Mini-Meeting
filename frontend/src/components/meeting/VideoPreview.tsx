import { useEffect, useRef } from 'react';

interface VideoPreviewProps {
  deviceId?: string;
  enabled: boolean;
}

const VideoPreview: React.FC<VideoPreviewProps> = ({ deviceId, enabled }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!enabled || !videoRef.current) return;

    const startPreview = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: deviceId ? { deviceId: { exact: deviceId } } : true,
          audio: false
        });

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Video preview error:', error);
      }
    };

    startPreview();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [deviceId, enabled]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      className="w-full h-full object-cover rounded-lg"
    />
  );
};

export default VideoPreview;
