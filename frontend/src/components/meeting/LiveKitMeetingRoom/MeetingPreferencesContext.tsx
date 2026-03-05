import { createContext, useContext } from "react";
import type { DevicePreferences } from "../../../pages/MeetingLobby";

const MeetingPreferencesContext = createContext<DevicePreferences | null>(null);

export const MeetingPreferencesProvider = MeetingPreferencesContext.Provider;

export function useMeetingPreferences(): DevicePreferences | null {
  return useContext(MeetingPreferencesContext);
}
