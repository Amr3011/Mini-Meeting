import { useState, useCallback } from "react";

export function useDeviceEnumeration() {
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioOutputDevices, setAudioOutputDevices] = useState<
    MediaDeviceInfo[]
  >([]);

  const [selectedCamera, setSelectedCamera] = useState("");
  const [selectedMic, setSelectedMic] = useState("");
  const [selectedSpeaker, setSelectedSpeaker] = useState("");

  const enumerateDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videos = devices.filter((d) => d.kind === "videoinput");
      const audios = devices.filter((d) => d.kind === "audioinput");
      const speakers = devices.filter((d) => d.kind === "audiooutput");

      setVideoDevices(videos);
      setAudioDevices(audios);
      setAudioOutputDevices(speakers);

      if (videos.length > 0) {
        setSelectedCamera((prev) => prev || videos[0].deviceId);
      }
      if (audios.length > 0) {
        setSelectedMic((prev) => prev || audios[0].deviceId);
      }
      if (speakers.length > 0) {
        setSelectedSpeaker((prev) => prev || speakers[0].deviceId);
      }

      return { videos, audios, speakers };
    } catch (err) {
      console.error("Failed to enumerate devices:", err);
      return { videos: [], audios: [], speakers: [] };
    }
  }, []);

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
    enumerateDevices,
  };
}
