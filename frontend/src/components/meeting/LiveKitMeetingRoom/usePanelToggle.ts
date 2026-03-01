import { useState } from "react";

export const usePanelToggle = () => {
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);

  return {
    isAdminPanelOpen,
    setIsAdminPanelOpen,
  };
};
