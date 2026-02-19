import React, { useState, useCallback } from "react";

interface MeetingInfoBarProps {
  meetingCode: string;
  participantCount?: number | null;
}

const CheckIcon: React.FC = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 13l4 4L19 7"
    />
  </svg>
);

const CopyIcon: React.FC = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
    />
  </svg>
);

const MeetingInfoBar: React.FC<MeetingInfoBarProps> = ({ meetingCode, participantCount }) => {
  const [linkCopied, setLinkCopied] = useState(false);

  const handleCopyLink = useCallback(async () => {
    try {
      const baseUrl = window.location.origin;
      const meetingUrl = `${baseUrl}/${meetingCode}`;
      await navigator.clipboard.writeText(meetingUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  }, [meetingCode]);

  return (
    <div className="pt-2 border-t border-gray-700">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Meeting Code:</span>
            <span className="font-mono text-brand-500 font-semibold">
              {meetingCode}
            </span>
          </div>

          {typeof participantCount === 'number' && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-gray-700/50 rounded text-xs text-gray-300" title="Number of participants">
              {participantCount === 0 ? (
                <span>No one else is here</span>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span>{participantCount}</span>
                </>
              )}
            </div>
          )}
        </div>
        <button
          onClick={handleCopyLink}
          className={`transition-colors p-1.5 rounded-lg ${linkCopied
            ? "text-success-500 bg-success-500/10"
            : "text-gray-400 hover:text-white hover:bg-gray-700"
            }`}
          title={linkCopied ? "Link copied!" : "Copy meeting link"}
        >
          {linkCopied ? <CheckIcon /> : <CopyIcon />}
        </button>
      </div>
    </div>
  );
};

export default MeetingInfoBar;
