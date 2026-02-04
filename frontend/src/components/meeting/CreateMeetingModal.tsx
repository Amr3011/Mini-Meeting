import { useState, useEffect } from "react";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";
import { meetingService } from "../../services/api/meeting.service";
import type { Meeting } from "../../types/meeting.types";
import { ErrorMessage } from "../common/ErrorMessage";

interface CreateMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateMeetingModal: React.FC<CreateMeetingModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreateMeeting = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const newMeeting = await meetingService.createMeeting();
      setMeeting(newMeeting);
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || "Failed to create meeting");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (meeting?.meeting_link) {
      try {
        await navigator.clipboard.writeText(meeting.meeting_link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy link:", err);
      }
    }
  };

  const handleClose = () => {
    setMeeting(null);
    setError(null);
    setCopied(false);
    onClose();
  };

  // Auto-create meeting when modal opens
  useEffect(() => {
    if (isOpen && !meeting && !isLoading && !error) {
      handleCreateMeeting();
    }
  }, [isOpen, meeting, isLoading, error]);

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
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Error
            </h2>
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
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Here's your joining info
            </h2>
            <p className="text-gray-600 mb-6">
              Send this to people you want to meet with. Be sure to save it so
              you can use it later, too.
            </p>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 mr-3">
                  <p className="text-sm text-gray-500 mb-1">Meeting link</p>
                  <p className="text-blue-600 font-medium break-all">
                    {meeting.meeting_link}
                  </p>
                </div>
                <button
                  onClick={handleCopyLink}
                  className="shrink-0 p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  title="Copy link"
                >
                  {copied ? (
                    <svg
                      className="h-6 w-6 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-6 w-6 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  )}
                </button>
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-1">Meeting code</p>
                <p className="text-gray-900 font-mono font-semibold text-lg">
                  {meeting.meeting_code}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={handleCopyLink} variant="primary" fullWidth>
                {copied ? "Copied!" : "Copy Link"}
              </Button>
              <Button onClick={handleClose} variant="secondary" fullWidth>
                Close
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </Modal>
  );
};
