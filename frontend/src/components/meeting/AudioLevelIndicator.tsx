import { useEffect, useRef, useState } from 'react';

interface AudioLevelIndicatorProps {
  deviceId?: string;
  enabled: boolean;
}

const AudioLevelIndicator: React.FC<AudioLevelIndicatorProps> = ({ deviceId, enabled }) => {
  const [level, setLevel] = useState(0);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const startAnalysis = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: deviceId ? { deviceId: { exact: deviceId } } : true,
          video: false
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
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setLevel(average / 255 * 100);

          requestAnimationFrame(updateLevel);
        };

        updateLevel();
      } catch (error) {
        console.error('Audio analysis error:', error);
      }
    };

    startAnalysis();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (!enabled) {
        setLevel(0);
      }
    };
  }, [deviceId, enabled]);

  return (
    <div className="flex gap-1 items-end h-8">
      {[...Array(10)].map((_, i) => (
        <div
          key={i}
          className={`w-1 rounded-full transition-all ${
            level > i * 10 ? 'bg-green-500' : 'bg-gray-300'
          }`}
          style={{
            height: `${20 + i * 8}%`
          }}
        />
      ))}
    </div>
  );
};

export default AudioLevelIndicator;
