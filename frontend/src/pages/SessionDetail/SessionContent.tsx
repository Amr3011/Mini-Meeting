import { SessionHeader } from "./SessionHeader";
import { ErrorNotice } from "./ErrorNotice";
import { ContentSection } from "./ContentSection";
import type { SummarizerSession } from "../../types/user.types";

interface SessionContentProps {
  session: SummarizerSession;
  onDelete: () => void;
}

export const SessionContent: React.FC<SessionContentProps> = ({
  session,
  onDelete,
}) => (
  <div className="space-y-6 animate-fade-in">
    <SessionHeader session={session} onDelete={onDelete} />

    {session.error && <ErrorNotice error={session.error} onDelete={onDelete} />}

    {!session.error && (
      <>
        <ContentSection
          title="Summary"
          content={session.summary}
          copyLabel="Summary"
          icon={
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          }
        />
        <ContentSection
          title="Transcript"
          content={session.transcript}
          copyLabel="Transcript"
          icon={
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          }
        />
      </>
    )}
  </div>
);
