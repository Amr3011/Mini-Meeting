import { createContext, useContext } from "react";
import type { DevicePreferences } from "../../../pages/MeetingLobby";

export const MeetingPreferencesContext =
  createContext<DevicePreferences | null>(null);

export function useMeetingPreferences(): DevicePreferences | null {
  return useContext(MeetingPreferencesContext);
}
