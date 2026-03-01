import { useEffect, useRef, useState } from "react";

interface UseAudioAnalysisProps {
  deviceId?: string;
  enabled?: boolean;
  isControlled: boolean;
}

/**
 * Hook for analyzing audio levels from a microphone
 * Creates audio context and analyzes frequency data
 */
export function useAudioAnalysis({
  deviceId,
  enabled = true,
  isControlled,
}: UseAudioAnalysisProps) {
  const [internalLevel, setInternalLevel] = useState(0);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

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
          const average =
            dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
          setInternalLevel(Math.min(average / 128, 1));
          animationFrameRef.current = requestAnimationFrame(updateLevel);
        };

        updateLevel();
      } catch (error) {
        console.error("Audio analysis error:", error);
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

  return internalLevel;
}
