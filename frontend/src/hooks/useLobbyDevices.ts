import { useState, useEffect, useRef, useCallback } from "react";
import { VIDEO_CONSTRAINTS, ERROR_MESSAGES } from "../utils/constants";
import { isMobileDevice } from "../utils/browser";

export interface LobbyDeviceState {
  // Device lists
  videoDevices: MediaDeviceInfo[];
  audioDevices: MediaDeviceInfo[];
  audioOutputDevices: MediaDeviceInfo[];

  // Selected device IDs
  selectedCamera: string;
  selectedMic: string;
  selectedSpeaker: string;
  setSelectedCamera: (id: string) => void;
  setSelectedMic: (id: string) => void;
  setSelectedSpeaker: (id: string) => void;

  // Toggle states
  cameraEnabled: boolean;
  micEnabled: boolean;

  // Stream & permissions
  stream: MediaStream | null;
  permissionsGranted: boolean;
  showPermissionButton: boolean;

  // Audio monitoring
  audioLevel: number;

  // Error handling
  error: string;
  deviceError: "access-denied" | "not-found" | "generic" | null;

  // Actions
  toggleCamera: () => void;
  toggleMic: () => void;
  requestPermissions: () => Promise<void>;
  clearError: () => void;
  clearDeviceError: () => void;
  cleanup: () => void;
}

export function useLobbyDevices(meetingReady: boolean): LobbyDeviceState {
  // Device lists
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioOutputDevices, setAudioOutputDevices] = useState<
    MediaDeviceInfo[]
  >([]);

  // Selected devices
  const [selectedCamera, setSelectedCamera] = useState("");
  const [selectedMic, setSelectedMic] = useState("");
  const [selectedSpeaker, setSelectedSpeaker] = useState("");

  // Toggle states
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);

  // Stream & permissions
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [showPermissionButton, setShowPermissionButton] = useState(false);

  // Audio level
  const [audioLevel, setAudioLevel] = useState(0);

  // Errors
  const [error, setError] = useState("");
  const [deviceError, setDeviceError] = useState<
    "access-denied" | "not-found" | "generic" | null
  >(null);

  // Internal refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const micEnabledRef = useRef(micEnabled);

  // Keep ref in sync for animation frame callback
  useEffect(() => {
    micEnabledRef.current = micEnabled;
  }, [micEnabled]);

  // ---------- Audio analyzer ----------

  const startMonitoringLoop = useCallback((analyser: AnalyserNode) => {
    // Cancel any existing loop
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    const checkLevel = () => {
      if (analyserRef.current && micEnabledRef.current) {
        analyserRef.current.getByteFrequencyData(dataArray);
        const average =
          dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        setAudioLevel(Math.min(average / 128, 1));
        animationFrameRef.current = requestAnimationFrame(checkLevel);
      }
    };
    checkLevel();
  }, []);

  const setupAudioAnalyzer = useCallback((mediaStream: MediaStream) => {
    try {
      // Close existing context
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

      // Start monitoring loop
      startMonitoringLoop(analyser);
    } catch (err) {
      console.error("Failed to setup audio analyzer:", err);
    }
  }, [startMonitoringLoop]);

  // ---------- Device setup ----------

  const setupDevices = useCallback(async () => {
    try {
      let mediaStream: MediaStream | null = null;

      // Try combined audio + video first
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: VIDEO_CONSTRAINTS.lobby,
          audio: true,
        });
      } catch (combinedError) {
        console.warn(
          "Failed to get both audio and video, trying separately:",
          combinedError,
        );

        const tracks: MediaStreamTrack[] = [];

        // Try video only
        try {
          const videoStream = await navigator.mediaDevices.getUserMedia({
            video: VIDEO_CONSTRAINTS.lobby,
            audio: false,
          });
          tracks.push(...videoStream.getVideoTracks());
        } catch {
          console.warn("Failed to get video");
          setCameraEnabled(false);
        }

        // Try audio only
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({
            video: false,
            audio: true,
          });
          tracks.push(...audioStream.getAudioTracks());
        } catch {
          console.warn("Failed to get audio");
          setMicEnabled(false);
        }

        if (tracks.length > 0) {
          mediaStream = new MediaStream(tracks);
        } else {
          throw combinedError;
        }
      }

      setStream(mediaStream);
      setPermissionsGranted(true);
      setDeviceError(null);
      setError("");

      // Enumerate devices after permission is granted
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videos = devices.filter((d) => d.kind === "videoinput");
      const audios = devices.filter((d) => d.kind === "audioinput");
      const speakers = devices.filter((d) => d.kind === "audiooutput");

      setVideoDevices(videos);
      setAudioDevices(audios);
      setAudioOutputDevices(speakers);

      // Set default selections (only if not already set)
      if (videos.length > 0) {
        setSelectedCamera((prev) => prev || videos[0].deviceId);
      }
      if (audios.length > 0) {
        setSelectedMic((prev) => prev || audios[0].deviceId);
      }
      if (speakers.length > 0) {
        setSelectedSpeaker((prev) => prev || speakers[0].deviceId);
      }

      // Setup audio analyzer if we have audio tracks
      const audioTracks = mediaStream?.getAudioTracks() || [];
      if (audioTracks.length > 0) {
        setupAudioAnalyzer(mediaStream!);
      }
    } catch (err) {
      console.error("Failed to get device permissions:", err);
      const mediaError = err as { name?: string };

      if (
        mediaError.name === "NotAllowedError" ||
        mediaError.name === "PermissionDeniedError"
      ) {
        setDeviceError("access-denied");
        setError(ERROR_MESSAGES.DEVICE_ACCESS_DENIED);
      } else if (mediaError.name === "NotFoundError") {
        setDeviceError("not-found");
        setError(ERROR_MESSAGES.NO_DEVICES_FOUND);
      } else {
        setDeviceError("generic");
        setError(ERROR_MESSAGES.DEVICE_ERROR);
      }
      setPermissionsGranted(false);
    }
  }, [setupAudioAnalyzer]);

  // ---------- Mobile detection ----------

  useEffect(() => {
    if (isMobileDevice()) {
      setShowPermissionButton(true);
    }
  }, []);

  // ---------- Auto-request on desktop ----------

  useEffect(() => {
    if (meetingReady && !permissionsGranted && !isMobileDevice()) {
      setupDevices();
    }
  }, [meetingReady, permissionsGranted, setupDevices]);

  // ---------- Cleanup on meeting data change ----------

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meetingReady]);

  // ---------- Switch camera ----------

  useEffect(() => {
    const updateVideoStream = async () => {
      if (!selectedCamera || !cameraEnabled || !permissionsGranted) return;

      try {
        const constraints: MediaStreamConstraints = {
          video: {
            deviceId: { exact: selectedCamera },
            ...VIDEO_CONSTRAINTS.lobby,
          },
          audio: selectedMic ? { deviceId: { exact: selectedMic } } : true,
        };

        const newStream =
          await navigator.mediaDevices.getUserMedia(constraints);

        // Stop old tracks
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }

        setStream(newStream);

        // Update audio analyzer if we have audio
        const audioTracks = newStream.getAudioTracks();
        if (audioTracks.length > 0 && micEnabled) {
          setupAudioAnalyzer(newStream);
        }
      } catch (err) {
        console.error("Failed to update video stream:", err);
        const mediaError = err as { name?: string };

        if (
          mediaError.name === "NotFoundError" ||
          mediaError.name === "OverconstrainedError"
        ) {
          setError(
            "Selected camera is not available. Please choose another camera.",
          );
          if (videoDevices.length > 0) {
            setSelectedCamera(videoDevices[0].deviceId);
          }
        } else {
          setError("Failed to switch camera. Please try again.");
        }
      }
    };

    if (permissionsGranted && selectedCamera) {
      updateVideoStream();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCamera, permissionsGranted]);

  // ---------- Switch microphone ----------

  useEffect(() => {
    const updateAudioStream = async () => {
      if (!selectedMic || !micEnabled || !permissionsGranted) return;

      try {
        const constraints: MediaStreamConstraints = {
          video:
            cameraEnabled && selectedCamera
              ? {
                deviceId: { exact: selectedCamera },
                ...VIDEO_CONSTRAINTS.lobby,
              }
              : false,
          audio: { deviceId: { exact: selectedMic } },
        };

        const newStream =
          await navigator.mediaDevices.getUserMedia(constraints);

        // Stop old tracks
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }

        setStream(newStream);

        // Update audio analyzer
        const audioTracks = newStream.getAudioTracks();
        if (audioTracks.length > 0) {
          setupAudioAnalyzer(newStream);
        }
      } catch (err) {
        console.error("Failed to update audio stream:", err);
        const mediaError = err as { name?: string };

        if (
          mediaError.name === "NotFoundError" ||
          mediaError.name === "OverconstrainedError"
        ) {
          setError(
            "Selected microphone is not available. Please choose another microphone.",
          );
          if (audioDevices.length > 0) {
            setSelectedMic(audioDevices[0].deviceId);
          }
        } else {
          setError("Failed to switch microphone. Please try again.");
        }
      }
    };

    if (permissionsGranted && selectedMic) {
      updateAudioStream();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMic, permissionsGranted]);

  // ---------- Toggle handlers ----------

  const toggleCamera = useCallback(() => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !cameraEnabled;
      }
    }
    setCameraEnabled((prev) => !prev);
  }, [stream, cameraEnabled]);

  const toggleMic = useCallback(() => {
    const newMicEnabled = !micEnabled;
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = newMicEnabled;
      }
    }
    setMicEnabled(newMicEnabled);

    if (newMicEnabled && analyserRef.current) {
      // Restart the monitoring loop when mic is re-enabled
      micEnabledRef.current = true;
      startMonitoringLoop(analyserRef.current);
    } else if (!newMicEnabled) {
      // Stop the loop and reset level when mic is muted
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      setAudioLevel(0);
    }
  }, [stream, micEnabled, startMonitoringLoop]);

  // ---------- Permission request (mobile) ----------

  const requestPermissions = useCallback(async () => {
    setShowPermissionButton(false);
    await setupDevices();
  }, [setupDevices]);

  // ---------- Error handlers ----------

  const clearError = useCallback(() => setError(""), []);

  const clearDeviceError = useCallback(() => {
    setDeviceError(null);
    setError("");
  }, []);

  // ---------- Manual cleanup (called before joining) ----------

  const cleanup = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, [stream]);

  return {
    videoDevices,
    audioDevices,
    audioOutputDevices,
    selectedCamera,
    selectedMic,
    selectedSpeaker,
    setSelectedCamera,
    setSelectedMic,
    setSelectedSpeaker,
    cameraEnabled,
    micEnabled,
    stream,
    permissionsGranted,
    showPermissionButton,
    audioLevel,
    error,
    deviceError,
    toggleCamera,
    toggleMic,
    requestPermissions,
    clearError,
    clearDeviceError,
    cleanup,
  };
}
