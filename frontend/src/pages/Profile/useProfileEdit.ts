import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { userService } from "../../services/api/user";
import type { AxiosError } from "axios";
import type { ApiError } from "../../types/auth.types";

export const useProfileEdit = () => {
  const { user, setUser } = useAuth();
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || "");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleEditName = () => {
    setEditedName(user?.name || "");
    setIsEditingName(true);
    setError(null);
    setSuccess(null);
  };

  const handleSaveName = async () => {
    if (!editedName.trim()) {
      setError("Name cannot be empty");
      return;
    }
    if (editedName.trim().length < 2) {
      setError("Name must be at least 2 characters");
      return;
    }
    if (editedName === user?.name) {
      setError("No changes detected");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const updatedUser = await userService.updateCurrentUser({
        name: editedName,
      });
      setUser(updatedUser);
      setSuccess("Name updated successfully!");
      setIsEditingName(false);
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      setError(
        axiosError.response?.data?.message ||
          "Failed to update name. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingName(false);
    setEditedName(user?.name || "");
    setError(null);
    setSuccess(null);
  };

  return {
    user,
    isEditingName,
    editedName,
    error,
    success,
    isLoading,
    handleEditName,
    handleSaveName,
    handleCancelEdit,
    setEditedName,
  };
};
