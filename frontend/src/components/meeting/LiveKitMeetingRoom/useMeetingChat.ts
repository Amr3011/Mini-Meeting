import { useState, useEffect } from "react";
import { useChat } from "@livekit/components-react";

export const useMeetingChat = () => {
  const { chatMessages } = useChat();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [lastReadIndex, setLastReadIndex] = useState(0);
  const unreadCount = Math.max(0, chatMessages.length - lastReadIndex);

  useEffect(() => {
    if (isChatOpen && chatMessages.length > lastReadIndex) {
      setLastReadIndex(chatMessages.length); // eslint-disable-line react-hooks/set-state-in-effect
    }
  }, [isChatOpen, chatMessages.length, lastReadIndex]);

  return {
    isChatOpen,
    setIsChatOpen,
    unreadCount,
  };
};
