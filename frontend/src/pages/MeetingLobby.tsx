import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import { ErrorMessage } from "../components/common/ErrorMessage";
import { DeviceErrorMessage } from "../components/common/DeviceErrorMessage";
import { useAuth } from "../hooks/useAuth";
import { meetingService } from "../services/api/meeting.service";
import { generateToken, type LiveKitTokenResponse } from "../services/api/livekit.service";
import type { Meeting } from "../types/meeting.types";
import { ERROR_MESSAGES, VIDEO_CONSTRAINTS } from "../utils/constants";

export interface DevicePreferences {
  videoDeviceId: string;
  audioDeviceId: string;
  audioOutputDeviceId?: string;
  videoEnabled: boolean;
  audioEnabled: boolean;
}

interface MeetingLobbyProps {
  onJoin: (prefs: DevicePreferences, token: LiveKitTokenResponse) => void;
}

export const MeetingLobby: React.FC<MeetingLobbyProps> = ({ onJoin }) => {
  const { meetingCode } = useParams<{ meetingCode: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // Meeting state
  const [meetingData, setMeetingData] = useState<Meeting | null>(null);
  const [displayName, setDisplayName] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [deviceError, setDeviceError] = useState<'access-denied' | 'not-found' | 'generic' | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isJoining, setIsJoining] = useState<boolean>(false);

  // Device state
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioOutputDevices, setAudioOutputDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>("");
  const [selectedMic, setSelectedMic] = useState<string>("");
  const [selectedSpeaker, setSelectedSpeaker] = useState<string>("");
  const [cameraEnabled, setCameraEnabled] = useState<boolean>(true);
  const [micEnabled, setMicEnabled] = useState<boolean>(true);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [permissionsGranted, setPermissionsGranted] = useState<boolean>(false);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [linkCopied, setLinkCopied] = useState<boolean>(false);
  const [showPermissionButton, setShowPermissionButton] = useState<boolean>(false);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Initialize display name from auth
  useEffect(() => {
    if (isAuthenticated && user) {
      setDisplayName(user.name || user.email.split("@")[0]);
    }
  }, [isAuthenticated, user]);

  // Verify meeting exists
  useEffect(() => {
    const verifyMeeting = async () => {
      if (!meetingCode) {
        setError("Invalid meeting code");
        setTimeout(() => navigate("/"), 3000);
        return;
      }

      try {
        setLoading(true);
        const meeting = await meetingService.getMeetingByCode(meetingCode);
        setMeetingData(meeting);
      } catch (err) {
        console.error("Failed to verify meeting:", err);
        const axiosError = err as { response?: { status: number } };
        setError(axiosError.response?.status === 404
          ? ERROR_MESSAGES.INVALID_MEETING_CODE
          : ERROR_MESSAGES.NETWORK_ERROR
        );
        setTimeout(() => navigate("/"), 3000);
      } finally {
        setLoading(false);
      }
    };

    verifyMeeting();
  }, [meetingCode, navigate]);

  // Check if mobile device to show permission button
  useEffect(() => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      // On mobile, show button to request permissions (requires user gesture)
      setShowPermissionButton(true);
    }
  }, []);

  // Request device permissions and enumerate devices
  const setupDevices = async () => {
    try {
      let mediaStream: MediaStream | null = null;

      // Try to get both audio and video first
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: VIDEO_CONSTRAINTS.lobby,
          audio: true,
        });
      } catch (combinedError) {
        console.warn("Failed to get both audio and video, trying separately:", combinedError);

        // If combined request fails, try to get them separately
        const tracks: MediaStreamTrack[] = [];

        // Try video only
        try {
          const videoStream = await navigator.mediaDevices.getUserMedia({
            video: VIDEO_CONSTRAINTS.lobby,
            audio: false,
          });
          tracks.push(...videoStream.getVideoTracks());
        } catch (videoError) {
          console.warn("Failed to get video:", videoError);
          setCameraEnabled(false);
        }

        // Try audio only
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({
            video: false,
            audio: true,
          });
          tracks.push(...audioStream.getAudioTracks());
        } catch (audioError) {
          console.warn("Failed to get audio:", audioError);
          setMicEnabled(false);
        }

        // If we got at least one track, create a stream
        if (tracks.length > 0) {
          mediaStream = new MediaStream(tracks);
        } else {
          // If both failed, throw to be caught by outer catch
          throw combinedError;
        }
      }

      setStream(mediaStream);
      setPermissionsGranted(true);
      setDeviceError(null);
      setError("");

      // Get device list after permissions granted
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videos = devices.filter((d) => d.kind === "videoinput");
      const audios = devices.filter((d) => d.kind === "audioinput");
      const speakers = devices.filter((d) => d.kind === "audiooutput");

      setVideoDevices(videos);
      setAudioDevices(audios);
      setAudioOutputDevices(speakers);

      // Set default selections
      if (videos.length > 0 && !selectedCamera) {
        setSelectedCamera(videos[0].deviceId);
      }
      if (audios.length > 0 && !selectedMic) {
        setSelectedMic(audios[0].deviceId);
      }
      if (speakers.length > 0 && !selectedSpeaker) {
        setSelectedSpeaker(speakers[0].deviceId);
      }

      // Setup audio analyzer for microphone level if we have audio tracks
      const audioTracks = mediaStream?.getAudioTracks() || [];
      if (audioTracks.length > 0) {
        setupAudioAnalyzer(mediaStream!);
      }

    } catch (err) {
      console.error("Failed to get device permissions:", err);
      const mediaError = err as { name?: string };

      // Set specific device error type
      if (mediaError.name === "NotAllowedError" || mediaError.name === "PermissionDeniedError") {
        setDeviceError('access-denied');
        setError(ERROR_MESSAGES.DEVICE_ACCESS_DENIED);
      } else if (mediaError.name === "NotFoundError") {
        setDeviceError('not-found');
        setError(ERROR_MESSAGES.NO_DEVICES_FOUND);
      } else {
        setDeviceError('generic');
        setError(ERROR_MESSAGES.DEVICE_ERROR);
      }
      setPermissionsGranted(false);
    }
  };

  // Auto-request on desktop, manual on mobile
  useEffect(() => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (meetingData && !permissionsGranted && !isMobile) {
      setupDevices();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meetingData, permissionsGranted]);

  // Handler for manual permission request
  const handleRequestPermissions = async () => {
    setShowPermissionButton(false);
    await setupDevices();
  };

  useEffect(() => {
    return () => {
      // Cleanup
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
  }, [meetingData]);

  // Update video preview when camera changes
  useEffect(() => {
    const updateVideoStream = async () => {
      if (!selectedCamera || !cameraEnabled || !permissionsGranted) return;

      try {
        // Build constraints for new stream
        const constraints: MediaStreamConstraints = {
          video: { deviceId: { exact: selectedCamera }, ...VIDEO_CONSTRAINTS.lobby },
          audio: selectedMic ? { deviceId: { exact: selectedMic } } : true,
        };

        const newStream = await navigator.mediaDevices.getUserMedia(constraints);

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

        if (mediaError.name === "NotFoundError" || mediaError.name === "OverconstrainedError") {
          setError("Selected camera is not available. Please choose another camera.");
          // Revert to first available camera
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

  // Update audio stream when microphone changes
  useEffect(() => {
    const updateAudioStream = async () => {
      if (!selectedMic || !micEnabled || !permissionsGranted) return;

      try {
        // Build constraints for new stream
        const constraints: MediaStreamConstraints = {
          video: cameraEnabled && selectedCamera
            ? { deviceId: { exact: selectedCamera }, ...VIDEO_CONSTRAINTS.lobby }
            : false,
          audio: { deviceId: { exact: selectedMic } },
        };

        const newStream = await navigator.mediaDevices.getUserMedia(constraints);

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

        if (mediaError.name === "NotFoundError" || mediaError.name === "OverconstrainedError") {
          setError("Selected microphone is not available. Please choose another microphone.");
          // Revert to first available microphone
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

  // Display video preview
  useEffect(() => {
    if (videoRef.current && stream && cameraEnabled) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, cameraEnabled]);

  // Setup audio analyzer for microphone level indicator
  const setupAudioAnalyzer = (mediaStream: MediaStream) => {
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

      // Start monitoring
      monitorAudioLevel();
    } catch (err) {
      console.error("Failed to setup audio analyzer:", err);
    }
  };

  // Monitor audio level for visualization
  const monitorAudioLevel = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

    const checkLevel = () => {
      if (analyserRef.current && micEnabled) {
        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        setAudioLevel(Math.min(average / 128, 1)); // Normalize to 0-1
        animationFrameRef.current = requestAnimationFrame(checkLevel);
      }
    };

    checkLevel();
  };

  // Toggle camera
  const handleToggleCamera = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !cameraEnabled;
      }
    }
    setCameraEnabled(!cameraEnabled);
  };

  // Toggle microphone
  const handleToggleMic = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !micEnabled;
      }
    }
    setMicEnabled(!micEnabled);
  };

  // Copy meeting link
  const handleCopyLink = async () => {
    if (!meetingData || !meetingCode) return;

    try {
      // Create the correct URL format: http://localhost:5173/meeting-code (without extra slash)
      const baseUrl = window.location.origin; // e.g., http://localhost:5173
      const meetingUrl = `${baseUrl}/${meetingCode}`;

      await navigator.clipboard.writeText(meetingUrl);
      setLinkCopied(true);

      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setLinkCopied(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
      setError("Failed to copy link to clipboard");
    }
  };

  // Join meeting
  const handleJoinClick = async () => {
    if (!meetingCode) return;

    // Validate display name for non-authenticated users
    if (!isAuthenticated && !displayName.trim()) {
      setError("Please enter a display name");
      return;
    }

    try {
      setIsJoining(true);
      setError("");

      const tokenData = await generateToken(
        meetingCode,
        isAuthenticated ? undefined : displayName.trim()
      );

      // Stop preview tracks before joining
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }

      // Call parent's onJoin callback
      onJoin(
        {
          videoDeviceId: selectedCamera,
          audioDeviceId: selectedMic,
          audioOutputDeviceId: selectedSpeaker,
          videoEnabled: cameraEnabled,
          audioEnabled: micEnabled,
        },
        tokenData
      );
    } catch (err) {
      console.error("Failed to join meeting:", err);
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError.response?.data?.message || ERROR_MESSAGES.TOKEN_GENERATION_FAILED);
      setIsJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center" role="status" aria-live="polite">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading meeting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4 relative">
      {/* Joining overlay */}
      {isJoining && (
        <div className="fixed inset-0 bg-gray-900/95 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center px-4">
            <div className="relative inline-flex items-center justify-center mb-6">
              {/* Outer spinning ring */}
              <div className="absolute w-24 h-24 border-4 border-brand-600/30 rounded-full"></div>
              <div className="absolute w-24 h-24 border-4 border-transparent border-t-brand-600 rounded-full animate-spin"></div>
              
              {/* Inner pulsing circle */}
              <div className="relative w-16 h-16 bg-brand-600/20 rounded-full flex items-center justify-center animate-pulse">
                <svg 
                  className="w-8 h-8 text-brand-500" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" 
                  />
                </svg>
              </div>
            </div>
            
            <h3 className="text-xl font-semibold text-white mb-2">Joining meeting...</h3>
            <p className="text-gray-400 text-sm">Please wait while we connect you</p>
            
            {/* Animated dots */}
            <div className="flex items-center justify-center gap-1.5 mt-4">
              <div className="w-2 h-2 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      )}
      <div className="w-full max-w-2xl">
        {/* Device Error Message with instructions */}
        {deviceError && (
          <div className="mb-6">
            <DeviceErrorMessage
              type={deviceError}
              onRetry={() => {
                setDeviceError(null);
                setError("");
                setPermissionsGranted(false);
              }}
              onDismiss={() => {
                setDeviceError(null);
                setError("");
              }}
            />
          </div>
        )}

        {/* Error message */}
        {error && !deviceError && (
          <div className="mb-6">
            <ErrorMessage message={error} onRetry={() => setError("")} />
          </div>
        )}

        {/* Main content card */}
        <div className="bg-gray-800 rounded-2xl overflow-hidden shadow-2xl">
          {/* Video preview with overlay controls */}
          <div className="relative aspect-video bg-black" role="region" aria-label="Video preview">
            {cameraEnabled && stream ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-gray-900 to-gray-800">
                <div className="text-center px-4">
                  <p className="text-white text-lg md:text-base font-semibold mb-4">Camera is off</p>
                  <div className="w-24 h-24 md:w-20 md:h-20 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto" aria-hidden="true">
                    <svg
                      className="w-12 h-12 md:w-10 md:h-10 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            )}

            {/* Display name overlay */}
            <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg">
              <span className="text-sm font-medium">
                {displayName || "You"}
              </span>
            </div>

            {/* Control buttons overlay - centered at bottom */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3">
              <button
                onClick={handleToggleMic}
                className={`p-3.5 rounded-full transition-all ${micEnabled
                  ? "bg-gray-700/80 hover:bg-gray-600/80 backdrop-blur-sm text-white"
                  : "bg-danger-500 hover:bg-danger-600 text-white"
                  }`}
                title={micEnabled ? "Mute microphone" : "Unmute microphone"}
                aria-label={micEnabled ? "Mute microphone" : "Unmute microphone"}
                aria-pressed={micEnabled}
              >
                {micEnabled ? (
                  <svg
                    className="w-5 h-5"
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
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                    />
                  </svg>
                )}
              </button>

              <button
                onClick={handleToggleCamera}
                className={`p-3.5 rounded-full transition-all ${cameraEnabled
                  ? "bg-gray-700/80 hover:bg-gray-600/80 backdrop-blur-sm text-white"
                  : "bg-danger-500 hover:bg-danger-600 text-white"
                  }`}
                title={cameraEnabled ? "Turn off camera" : "Turn on camera"}
                aria-label={cameraEnabled ? "Turn off camera" : "Turn on camera"}
                aria-pressed={cameraEnabled}
              >
                {cameraEnabled ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Device selection and controls */}
          <div className="p-6 space-y-4">
            {/* Device selection dropdowns - horizontal layout */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Microphone selection */}
              <div className="relative">
                <select
                  id="mic-select"
                  value={selectedMic}
                  onChange={(e) => setSelectedMic(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2.5 pr-8 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 appearance-none cursor-pointer"
                  disabled={!micEnabled || audioDevices.length === 0}
                  aria-label="Select microphone device"
                  title="Select microphone"
                >
                  {audioDevices.map((device) => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label || `Microphone ${device.deviceId.slice(0, 5)}`}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Speaker selection */}
              <div className="relative">
                <select
                  id="speaker-select"
                  value={selectedSpeaker}
                  onChange={(e) => setSelectedSpeaker(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2.5 pr-8 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 appearance-none cursor-pointer"
                  disabled={audioOutputDevices.length === 0}
                  aria-label="Select speaker device"
                  title="Select speaker"
                >
                  {audioOutputDevices.map((device) => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label || `Speaker ${device.deviceId.slice(0, 5)}`}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Camera selection */}
              <div className="relative">
                <select
                  id="camera-select"
                  value={selectedCamera}
                  onChange={(e) => setSelectedCamera(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2.5 pr-8 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 appearance-none cursor-pointer"
                  disabled={!cameraEnabled || videoDevices.length === 0}
                  aria-label="Select camera device"
                  title="Select camera"
                >
                  {videoDevices.map((device) => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label || `Camera ${device.deviceId.slice(0, 5)}`}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Microphone level indicator */}
            {micEnabled && (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                <div className="flex-1 flex items-center gap-0.5 h-2" role="progressbar" aria-label="Microphone volume level" aria-valuenow={Math.round(audioLevel * 100)} aria-valuemin={0} aria-valuemax={100}>
                  {[...Array(30)].map((_, i) => (
                    <div
                      key={i}
                      className={`flex-1 h-full rounded-full transition-all duration-100 ${i < audioLevel * 30
                        ? i < 20
                          ? "bg-brand-500"
                          : i < 26
                            ? "bg-warning-500"
                            : "bg-danger-500"
                        : "bg-gray-700"
                        }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Display name input (for non-authenticated users) */}
            {!isAuthenticated && (
              <div className="pt-2">
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your name"
                  className="bg-gray-700 border-gray-600"
                  maxLength={50}
                  aria-label="Enter your display name"
                  aria-required="true"
                />
              </div>
            )}

            {/* Permission request button for mobile devices */}
            {showPermissionButton && !permissionsGranted && (
              <div className="pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={handleRequestPermissions}
                  className="bg-brand-600 hover:bg-brand-700"
                >
                  <svg className="w-5 h-5 mr-2 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Allow Camera & Microphone
                </Button>
                <p className="text-xs text-center text-gray-400 mt-2">
                  Tap to grant camera and microphone permissions
                </p>
              </div>
            )}

            {/* Join button */}
            <div className="relative group mt-2">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={handleJoinClick}
                disabled={isJoining || !permissionsGranted || (!isAuthenticated && !displayName.trim())}
                isLoading={isJoining}
              >
                {isJoining ? "Joining..." : "Join Now"}
              </Button>
              {!isAuthenticated && !displayName.trim() && permissionsGranted && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                  Enter your name first
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                </div>
              )}
            </div>

            {/* Help text */}
            {!permissionsGranted && (
              <p className="text-xs text-center text-gray-400">
                Please allow camera and microphone access to join
              </p>
            )}

            {/* Meeting info - compact */}
            {meetingData && (
              <div className="pt-2 border-t border-gray-700">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">Meeting Code:</span>
                    <span className="font-mono text-brand-500 font-semibold">{meetingData.meeting_code}</span>
                  </div>
                  <button
                    onClick={handleCopyLink}
                    className={`transition-colors p-1.5 rounded-lg ${linkCopied
                      ? "text-success-500 bg-success-500/10"
                      : "text-gray-400 hover:text-white hover:bg-gray-700"
                      }`}
                    title={linkCopied ? "Link copied!" : "Copy meeting link"}
                  >
                    {linkCopied ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
