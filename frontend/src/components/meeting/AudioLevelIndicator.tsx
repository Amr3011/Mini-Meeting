import { useEffect, useRef, useState } from 'react';

interface AudioLevelIndicatorProps {
  /** Controlled mode: pass a level value (0-1) directly */
  level?: number;
  /** Self-managed mode: device ID to monitor */
  deviceId?: string;
  /** Self-managed mode: whether monitoring is enabled */
  enabled?: boolean;
  /** Number of bars to display */
  bars?: number;
  /** Visual style variant */
  variant?: 'vertical' | 'horizontal';
}

const AudioLevelIndicator: React.FC<AudioLevelIndicatorProps> = ({
  level: controlledLevel,
  deviceId,
  enabled = true,
  bars = 30,
  variant = 'horizontal',
}) => {
  const isControlled = controlledLevel !== undefined;
  const [internalLevel, setInternalLevel] = useState(0);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Self-managed mode: create own stream and analyze
  useEffect(() => {
    if (isControlled || !enabled) return;

    const startAnalysis = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: deviceId ? { deviceId: { exact: deviceId } } : true,
          video: false,
        });

        streamRef.current = stream;

        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);
        const analyzer = audioContext.createAnalyser();
        analyzer.fftSize = 256;
        source.connect(analyzer);
        analyzerRef.current = analyzer;

        const dataArray = new Uint8Array(analyzer.frequencyBinCount);

        const updateLevel = () => {
          if (!analyzerRef.current) return;
          analyzer.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
          setInternalLevel(Math.min(average / 128, 1));
          animationFrameRef.current = requestAnimationFrame(updateLevel);
        };

        updateLevel();
      } catch (error) {
        console.error('Audio analysis error:', error);
      }
    };

    startAnalysis();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      setInternalLevel(0);
    };
  }, [deviceId, enabled, isControlled]);

  const currentLevel = isControlled ? controlledLevel : internalLevel;

  if (variant === 'vertical') {
    return (
      <div className="flex gap-1 items-end h-8">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className={`w-1 rounded-full transition-all ${
              currentLevel * 10 > i ? 'bg-green-500' : 'bg-gray-300'
            }`}
            style={{ height: `${20 + i * 8}%` }}
          />
        ))}
      </div>
    );
  }

  // Horizontal bar variant (matches lobby style)
  return (
    <div className="flex items-center gap-2">
      <svg
        className="w-4 h-4 text-gray-400 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
        />
      </svg>
      <div
        className="flex-1 flex items-center gap-0.5 h-2"
        role="progressbar"
        aria-label="Microphone volume level"
        aria-valuenow={Math.round(currentLevel * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        {[...Array(bars)].map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-full rounded-full transition-all duration-100 ${
              i < currentLevel * bars
                ? i < bars * 0.66
                  ? 'bg-brand-500'
                  : i < bars * 0.86
                    ? 'bg-warning-500'
                    : 'bg-danger-500'
                : 'bg-gray-700'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default AudioLevelIndicator;
