import { useState } from "react";
import { userService } from "../../services/api/user";
import type { User } from "../../types/user.types";
import type { AxiosError } from "axios";
import type { ApiError } from "../../types/auth.types";

/**
 * Hook for managing user deletion
 * Handles modal state, loading, and delete operation
 */
export function useDeleteUser(
  currentUserId: number | undefined,
  setError: (msg: string) => void,
  refetch: () => Promise<void>,
) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    // Prevent admin from deleting themselves
    if (selectedUser.id === currentUserId) {
      setError("You cannot delete your own account.");
      return;
    }

    setActionLoading(true);
    try {
      await userService.deleteUser(selectedUser.id);
      await refetch();
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      setError(
        axiosError.response?.data?.message ||
          "Failed to delete user. Please try again.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const openDeleteModal = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedUser(null);
  };

  return {
    isDeleteModalOpen,
    selectedUser,
    actionLoading,
    handleDeleteUser,
    openDeleteModal,
    closeDeleteModal,
  };
}
