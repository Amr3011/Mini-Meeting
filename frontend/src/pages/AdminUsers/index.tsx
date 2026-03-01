import { useState, useEffect } from "react";
import { Layout } from "../../components/layout/Layout";
import { Loading } from "../../components/common/Loading";
import { Pagination } from "../../components/common/Pagination";
import { useAuth } from "../../hooks/useAuth";
import { useSearchDebounce } from "./useSearchDebounce";
import { useUsersData } from "./useUsersData";
import { useDeleteUser } from "./useDeleteUser";
import { PageHeader } from "./PageHeader";
import { UsersTable } from "./UsersTable";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";

/**
 * Admin Users page
 * Displays user list with search, pagination, and delete functionality
 */
export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useSearchDebounce(searchTerm);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { users, isLoading, error, setError, totalUsers, totalPages, refetch } =
    useUsersData(currentPage, pageSize, debouncedSearch);

  const {
    isDeleteModalOpen,
    selectedUser,
    actionLoading,
    handleDeleteUser,
    openDeleteModal,
    closeDeleteModal,
  } = useDeleteUser(currentUser?.id, setError, refetch);

  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  if (isLoading) {
    return (
      <Layout>
        <Loading fullScreen text="Loading users..." />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader
          error={error}
          searchTerm={searchTerm}
          onClearError={() => setError(null)}
          onSearchChange={setSearchTerm}
        />

        {/* Users Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <UsersTable
            users={users}
            currentUserId={currentUser?.id}
            onDeleteUser={openDeleteModal}
          />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalUsers}
            onPageChange={(page) => {
              setCurrentPage(page);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onPageSizeChange={(newPageSize) => {
              setPageSize(newPageSize);
              setCurrentPage(1);
            }}
          />
        </div>

        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          user={selectedUser}
          isLoading={actionLoading}
          onConfirm={handleDeleteUser}
          onCancel={closeDeleteModal}
        />
      </div>
    </Layout>
  );
}
