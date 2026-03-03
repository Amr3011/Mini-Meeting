import { useRef, useCallback, useEffect } from "react";

export function useAudioAnalyzer(micEnabled: boolean) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const micEnabledRef = useRef(micEnabled);

  useEffect(() => {
    micEnabledRef.current = micEnabled;
  }, [micEnabled]);

  const startMonitoringLoop = useCallback(
    (analyser: AnalyserNode, onLevel: (level: number) => void) => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const checkLevel = () => {
        if (analyserRef.current && micEnabledRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray);
          const average =
            dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
          onLevel(Math.min(average / 128, 1));
          animationFrameRef.current = requestAnimationFrame(checkLevel);
        }
      };
      checkLevel();
    },
    [],
  );

  const setupAudioAnalyzer = useCallback(
    (mediaStream: MediaStream, onLevel: (level: number) => void) => {
      try {
        if (audioContextRef.current) {
          audioContextRef.current.close();
        }
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }

        const audioContext = new AudioContext();
        const analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaStreamSource(mediaStream);

        analyser.fftSize = 256;
        source.connect(analyser);

        audioContextRef.current = audioContext;
        analyserRef.current = analyser;

        startMonitoringLoop(analyser, onLevel);
      } catch (err) {
        console.error("Failed to setup audio analyzer:", err);
      }
    },
    [startMonitoringLoop],
  );

  const restartMonitoring = useCallback(
    (onLevel: (level: number) => void) => {
      if (analyserRef.current) {
        micEnabledRef.current = true;
        startMonitoringLoop(analyserRef.current, onLevel);
      }
    },
    [startMonitoringLoop],
  );

  const stopMonitoring = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

  const cleanup = useCallback(() => {
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

  return {
    setupAudioAnalyzer,
    restartMonitoring,
    stopMonitoring,
    cleanup,
  };
}
