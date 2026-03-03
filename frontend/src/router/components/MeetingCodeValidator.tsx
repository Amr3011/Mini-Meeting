import { useParams } from "react-router-dom";
import { lazy } from "react";
import { isValidMeetingCode } from "../../utils/validators";

const NotFound = lazy(() => import("../../pages/NotFound"));
const Meeting = lazy(() => import("../../pages/Meeting"));

/**
 * Validates meeting code format before rendering Meeting page
 * Ensures meeting code matches expected pattern (xxx-xxxx-xxx)
 */
const MeetingCodeValidator = () => {
  const { meetingCode } = useParams<{ meetingCode: string }>();

  // Validate meeting code format (xxx-xxxx-xxx)
  if (!meetingCode || !isValidMeetingCode(meetingCode)) {
    return <NotFound />;
  }

  return <Meeting />;
};

export default MeetingCodeValidator;
