import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../../components/layout/Layout";
import { SessionCard } from "./SessionCard";
import { EmptyState } from "./EmptyState";
import { LoadingState } from "./LoadingState";
import { SessionsPagination } from "./SessionsPagination";
import { useSessions } from "./useSessions";

export default function Sessions() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const { sessions, isLoading, totalPages } = useSessions(page, pageSize);

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Sessions</h1>
          <p className="mt-2 text-gray-500">
            View your meeting summarizer sessions and their transcripts &amp;
            summaries.
          </p>
        </div>

        {isLoading ? (
          <LoadingState />
        ) : sessions.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-4">
            {sessions.map((session, idx) => (
              <SessionCard
                key={session.id}
                session={session}
                index={idx}
                onClick={() => navigate(`/sessions/${session.id}`)}
              />
            ))}
          </div>
        )}

        {!isLoading && totalPages > 1 && (
          <SessionsPagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        )}
      </div>
    </Layout>
  );
}
