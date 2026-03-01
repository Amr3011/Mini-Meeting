import { useCallback } from "react";

export function useNotificationSound() {
  const playNotificationSound = useCallback(() => {
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as Window & { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioContextClass) return;

      const ctx = new AudioContextClass();

      const playTone = (
        frequency: number,
        startTime: number,
        duration: number,
        gainValue: number,
      ) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(frequency, startTime);

        gainNode.gain.setValueAtTime(gainValue, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      };

      const now = ctx.currentTime;
      playTone(880, now, 0.4, 0.35); // A5
      playTone(1108.73, now + 0.15, 0.5, 0.25); // C#6

      setTimeout(() => ctx.close(), 800);
    } catch (err) {
      console.warn("Could not play notification sound:", err);
    }
  }, []);

  return playNotificationSound;
}
