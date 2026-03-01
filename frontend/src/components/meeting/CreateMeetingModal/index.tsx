import { Modal } from "../../common/Modal";
import { Button } from "../../common/Button";
import { ErrorMessage } from "../../common/ErrorMessage";
import { MeetingInfoDisplay } from "./MeetingInfoDisplay";
import { useCreateMeeting } from "./useCreateMeeting";

interface CreateMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateMeetingModal: React.FC<CreateMeetingModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    meeting,
    isLoading,
    error,
    copied,
    handleCreateMeeting,
    handleCopyLink,
    reset,
  } = useCreateMeeting(isOpen);

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="md"
      showCloseButton={true}
    >
      <div className="p-6">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Creating your meeting...</p>
          </div>
        ) : error ? (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
            <ErrorMessage message={error} />
            <div className="mt-6 flex gap-3">
              <Button onClick={handleCreateMeeting} variant="primary" fullWidth>
                Try Again
              </Button>
              <Button onClick={handleClose} variant="secondary" fullWidth>
                Cancel
              </Button>
            </div>
          </div>
        ) : meeting ? (
          <MeetingInfoDisplay
            meetingLink={meeting.meeting_link}
            meetingCode={meeting.meeting_code}
            copied={copied}
            onCopy={handleCopyLink}
            onClose={handleClose}
          />
        ) : null}
      </div>
    </Modal>
  );
};
