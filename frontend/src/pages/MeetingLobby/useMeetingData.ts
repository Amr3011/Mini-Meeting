import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { meetingService } from "../../services/api/meeting.service";
import { getParticipantCount } from "../../services/api/livekit";
import type { Meeting } from "../../types/meeting.types";
import { ERROR_MESSAGES } from "../../utils/constants";

export function useMeetingData(meetingCode: string | undefined) {
  const navigate = useNavigate();
  const [meetingData, setMeetingData] = useState<Meeting | null>(null);
  const [participantCount, setParticipantCount] = useState<number | null>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

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

        try {
          const count = await getParticipantCount(meetingCode);
          setParticipantCount(count);
        } catch (err) {
          console.warn("Failed to get participant count:", err);
        }
      } catch (err) {
        console.error("Failed to verify meeting:", err);
        const axiosError = err as { response?: { status: number } };
        setError(
          axiosError.response?.status === 404
            ? ERROR_MESSAGES.INVALID_MEETING_CODE
            : ERROR_MESSAGES.NETWORK_ERROR,
        );
        setTimeout(() => navigate("/"), 3000);
      } finally {
        setLoading(false);
      }
    };

    verifyMeeting();
  }, [meetingCode, navigate]);

  return { meetingData, participantCount, error, setError, loading };
}
