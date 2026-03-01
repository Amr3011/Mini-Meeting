import { useParams } from "react-router-dom";
import { Layout } from "../../components/layout/Layout";
import { BackLink } from "./BackLink";
import { LoadingState } from "./LoadingState";
import { ErrorState } from "./ErrorState";
import { SessionContent } from "./SessionContent";
import { DeleteModal } from "./DeleteModal";
import { useSessionData } from "./useSessionData";
import { useSessionDelete } from "./useSessionDelete";

export default function SessionDetail() {
  const { id } = useParams<{ id: string }>();
  const { session, isLoading, error } = useSessionData(id);
  const {
    showDeleteModal,
    setShowDeleteModal,
    isDeleting,
    deleteError,
    handleDelete,
  } = useSessionDelete();

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <BackLink />
        {isLoading && <LoadingState />}
        {!isLoading && error && <ErrorState error={error} />}
        {!isLoading && session && (
          <SessionContent
            session={session}
            onDelete={() => setShowDeleteModal(true)}
          />
        )}
      </div>

      <DeleteModal
        isOpen={showDeleteModal}
        isDeleting={isDeleting}
        error={deleteError}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => session && handleDelete(session.id)}
      />
    </Layout>
  );
}
