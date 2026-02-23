import React, { useState, useRef, useEffect } from "react";
import {
  TrackToggle,
  DisconnectButton,
  useMediaDeviceSelect,
  useTracks,
  useRoomContext,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import "./CustomControlBar.css";

/**
 * Custom Control Bar Component
 * Media controls + Leave centered
 */
export const CustomControlBar: React.FC = () => {
  const [showAudioMenu, setShowAudioMenu] = useState(false);
  const [showVideoMenu, setShowVideoMenu] = useState(false);
  const audioMenuRef = useRef<HTMLDivElement>(null);
  const videoMenuRef = useRef<HTMLDivElement>(null);

  const room = useRoomContext();

  const {
    devices: audioDevices,
    activeDeviceId: activeAudioDevice,
    setActiveMediaDevice: setActiveAudio,
  } = useMediaDeviceSelect({ kind: "audioinput" });
  const {
    devices: videoDevices,
    activeDeviceId: activeVideoDevice,
    setActiveMediaDevice: setActiveVideo,
  } = useMediaDeviceSelect({ kind: "videoinput" });

  const audioTracks = useTracks([Track.Source.Microphone]);
  const videoTracks = useTracks([Track.Source.Camera]);

  const isAudioEnabled =
    audioTracks.length > 0 && audioTracks[0].publication?.isMuted === false;
  const isVideoEnabled =
    videoTracks.length > 0 && videoTracks[0].publication?.isMuted === false;

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        audioMenuRef.current &&
        !audioMenuRef.current.contains(event.target as Node)
      ) {
        setShowAudioMenu(false);
      }
      if (
        videoMenuRef.current &&
        !videoMenuRef.current.contains(event.target as Node)
      ) {
        setShowVideoMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className="lk-control-bar"
      style={{
        justifyContent: "center",
      }}
    >
      {/* Center Group - Media Controls + Leave في النص */}
      <div className="lk-button-group" style={{ gap: "12px" }}>
        {/* Microphone Button with Dropdown */}
        <div
          style={{ position: "relative", display: "flex" }}
          ref={audioMenuRef}
        >
          {/* Main Toggle Button */}
          <TrackToggle
            source={Track.Source.Microphone}
            showIcon={true}
            style={
              {
                minWidth: "48px",
                minHeight: "48px",
                borderTopRightRadius: "0",
                borderBottomRightRadius: "0",
                borderRight: "none",
              } as React.CSSProperties
            }
          />
          {/* Dropdown Menu Button */}
          <button
            className="lk-button"
            onClick={() => setShowAudioMenu(!showAudioMenu)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "var(--lk-bg2)",
              minWidth: "22px",
              minHeight: "48px",
              borderTopLeftRadius: "0",
              borderBottomLeftRadius: "0",
              padding: "0",
              marginLeft: "-1px",
            }}
            title="Select microphone device"
          >
            {/* Chevron Down Icon */}
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {showAudioMenu && (
            <div
              style={{
                position: "absolute",
                bottom: "calc(100% + 8px)",
                left: "0",
                backgroundColor: "var(--lk-bg2)",
                border: "1px solid var(--lk-border-color)",
                borderRadius: "12px",
                padding: "6px",
                minWidth: "240px",
                maxWidth: "320px",
                boxShadow:
                  "0 8px 24px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.2)",
                zIndex: 1000,
                animation: "slideUpFade 0.2s ease-out",
                backdropFilter: "blur(8px)",
              }}
            >
              {audioDevices.map((device) => (
                <button
                  key={device.deviceId}
                  onClick={() => {
                    setActiveAudio(device.deviceId);
                    setShowAudioMenu(false);
                  }}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "10px 12px",
                    backgroundColor:
                      device.deviceId === activeAudioDevice
                        ? "var(--lk-accent)"
                        : "transparent",
                    color:
                      device.deviceId === activeAudioDevice
                        ? "#fff"
                        : "var(--lk-fg)",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight:
                      device.deviceId === activeAudioDevice ? "500" : "400",
                    transition: "all 0.2s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    position: "relative",
                  }}
                  onMouseEnter={(e) => {
                    if (device.deviceId !== activeAudioDevice) {
                      e.currentTarget.style.backgroundColor = "var(--lk-bg3)";
                      e.currentTarget.style.transform = "translateX(4px)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (device.deviceId !== activeAudioDevice) {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.transform = "translateX(0)";
                    }
                  }}
                >
                  {/* Device Icon */}
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{ flexShrink: 0, opacity: 0.7 }}
                  >
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" x2="12" y1="19" y2="22" />
                  </svg>

                  {/* Device Label */}
                  <span
                    style={{
                      flex: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {device.label || "Default Microphone"}
                  </span>

                  {/* Checkmark for active device */}
                  {device.deviceId === activeAudioDevice && (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      style={{ flexShrink: 0 }}
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Camera Button with Dropdown */}
        <div
          style={{ position: "relative", display: "flex" }}
          ref={videoMenuRef}
        >
          {/* Main Toggle Button */}
          <TrackToggle
            source={Track.Source.Camera}
            showIcon={true}
            style={
              {
                minWidth: "48px",
                minHeight: "48px",
                borderTopRightRadius: "0",
                borderBottomRightRadius: "0",
                borderRight: "none",
              } as React.CSSProperties
            }
          />
          {/* Dropdown Menu Button */}
          <button
            className="lk-button"
            onClick={() => setShowVideoMenu(!showVideoMenu)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "var(--lk-bg2)",
              minWidth: "22px",
              minHeight: "48px",
              borderTopLeftRadius: "0",
              borderBottomLeftRadius: "0",
              padding: "0",
              marginLeft: "-1px",
            }}
            title="Select camera device"
          >
            {/* Chevron Down Icon */}
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {showVideoMenu && (
            <div
              style={{
                position: "absolute",
                bottom: "calc(100% + 8px)",
                left: "0",
                backgroundColor: "var(--lk-bg2)",
                border: "1px solid var(--lk-border-color)",
                borderRadius: "12px",
                padding: "6px",
                minWidth: "240px",
                maxWidth: "320px",
                boxShadow:
                  "0 8px 24px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.2)",
                zIndex: 1000,
                animation: "slideUpFade 0.2s ease-out",
                backdropFilter: "blur(8px)",
              }}
            >
              {videoDevices.map((device) => (
                <button
                  key={device.deviceId}
                  onClick={() => {
                    setActiveVideo(device.deviceId);
                    setShowVideoMenu(false);
                  }}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "10px 12px",
                    backgroundColor:
                      device.deviceId === activeVideoDevice
                        ? "var(--lk-accent)"
                        : "transparent",
                    color:
                      device.deviceId === activeVideoDevice
                        ? "#fff"
                        : "var(--lk-fg)",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight:
                      device.deviceId === activeVideoDevice ? "500" : "400",
                    transition: "all 0.2s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    position: "relative",
                  }}
                  onMouseEnter={(e) => {
                    if (device.deviceId !== activeVideoDevice) {
                      e.currentTarget.style.backgroundColor = "var(--lk-bg3)";
                      e.currentTarget.style.transform = "translateX(4px)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (device.deviceId !== activeVideoDevice) {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.transform = "translateX(0)";
                    }
                  }}
                >
                  {/* Device Icon */}
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{ flexShrink: 0, opacity: 0.7 }}
                  >
                    <path d="m22 8-6 4 6 4V8Z" />
                    <rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
                  </svg>

                  {/* Device Label */}
                  <span
                    style={{
                      flex: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {device.label || "Default Camera"}
                  </span>

                  {/* Checkmark for active device */}
                  {device.deviceId === activeVideoDevice && (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      style={{ flexShrink: 0 }}
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div
          style={{ display: "flex", alignItems: "center" }}
          title="Share Screen"
        >
          <TrackToggle
            source={Track.Source.ScreenShare}
            showIcon={true}
            style={
              {
                width: "70px",
                minHeight: "48px",
                padding: "8px 12px",
              } as React.CSSProperties
            }
          />
        </div>

        {/* Custom Leave Button with Door Icon */}
        <button
          className="lk-button lk-disconnect-button"
          onClick={() => room?.disconnect()}
          style={{
            backgroundColor: "var(--lk-danger-color, #dc2626)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "8px 12px",
            minWidth: "60px",
            minHeight: "48px",
          }}
          title="Leave Meeting"
        >
          {/* Door/Exit Icon */}
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" x2="9" y1="12" y2="12" />
          </svg>
        </button>
      </div>
    </div>
  );
};
