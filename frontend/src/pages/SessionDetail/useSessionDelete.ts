import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { userService } from "../../services/api/user";

export const useSessionDelete = () => {
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = async (sessionId: number) => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await userService.deleteSession(sessionId);
      setShowDeleteModal(false);
      navigate("/sessions");
    } catch (err) {
      console.error("Failed to delete session:", err);
      const error = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      setDeleteError(
        error.response?.data?.message ||
          error.message ||
          "Failed to delete session. Please try again.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    showDeleteModal,
    setShowDeleteModal,
    isDeleting,
    deleteError,
    handleDelete,
  };
};
