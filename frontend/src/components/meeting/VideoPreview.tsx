import { useEffect, useRef, useState } from 'react';
import { getMediaErrorMessage } from '../../utils/browser';

interface VideoPreviewProps {
  deviceId?: string;
  enabled: boolean;
}

const VideoPreview: React.FC<VideoPreviewProps> = ({ deviceId, enabled }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string>('');

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
        setError('');
      } catch (err) {
        console.error('Video preview error:', err);
        const errorMessage = getMediaErrorMessage(err);
        setError(errorMessage);
      }
    };

    startPreview();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [deviceId, enabled]);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-800 rounded-lg p-4">
        <div className="text-center">
          <svg className="w-12 h-12 text-danger-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-sm text-danger-400">{error}</p>
        </div>
      </div>
    );
  }

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
