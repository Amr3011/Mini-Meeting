import { useState, useEffect } from "react";

const useMediaDevices = () => {
  const [devices, setDevices] = useState<{
    videoInputs: MediaDeviceInfo[];
    audioInputs: MediaDeviceInfo[];
    audioOutputs: MediaDeviceInfo[];
  }>({
    videoInputs: [],
    audioInputs: [],
    audioOutputs: [],
  });
  const [permission, setPermission] = useState<"granted" | "denied" | "prompt">(
    "prompt",
  );

  useEffect(() => {
    const getDevices = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        setPermission("granted");

        const deviceList = await navigator.mediaDevices.enumerateDevices();

        setDevices({
          videoInputs: deviceList.filter((d) => d.kind === "videoinput"),
          audioInputs: deviceList.filter((d) => d.kind === "audioinput"),
          audioOutputs: deviceList.filter((d) => d.kind === "audiooutput"),
        });

        stream.getTracks().forEach((track) => track.stop());
      } catch (error) {
        setPermission("denied");
        console.error("Device access error:", error);
      }
    };

    getDevices();

    navigator.mediaDevices.addEventListener("devicechange", getDevices);
    return () => {
      navigator.mediaDevices.removeEventListener("devicechange", getDevices);
    };
  }, []);

  return { devices, permission };
};

export default useMediaDevices;
