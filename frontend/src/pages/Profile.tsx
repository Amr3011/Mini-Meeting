import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Layout } from "../components/layout/Layout";
import { Button } from "../components/common/Button";
import { ErrorMessage } from "../components/common/ErrorMessage";
import { userService } from "../services/api/user.service";
import type { AxiosError } from "axios";
import type { ApiError } from "../types/auth.types";

export default function Profile() {
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
      const updatedUser = await userService.updateCurrentUser({ name: editedName });
      setUser(updatedUser);
      setSuccess("Name updated successfully!");
      setIsEditingName(false);
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      setError(
        axiosError.response?.data?.message ||
        "Failed to update name. Please try again."
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

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage your account information
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            {error && (
              <div className="mb-4">
                <ErrorMessage message={error} />
              </div>
            )}

            {success && (
              <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800">
                {success}
              </div>
            )}

            <div className="space-y-6">
              {/* Name Field with Inline Edit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                {!isEditingName ? (
                  <div className="flex items-center gap-3">
                    <p className="text-lg text-gray-900">{user?.name}</p>
                    <button
                      onClick={handleEditName}
                      className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                      title="Edit name"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your full name"
                      autoFocus
                    />
                    <Button
                      onClick={handleSaveName}
                      isLoading={isLoading}
                      disabled={isLoading}
                      className="py-2!"
                    >
                      Save
                    </Button>
                    <Button
                      onClick={handleCancelEdit}
                      variant="secondary"
                      disabled={isLoading}
                      className="py-2!"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>

              {/* Email Field (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="flex items-center">
                  <p className="text-lg text-gray-900">{user?.email}</p>
                </div>
              </div>

              {/* Login Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Login Method
                </label>
                <div className="flex">
                  {user?.provider === "github" ? (
                    <span className="inline-flex items-center px-4 py-1 rounded-full text-sm font-bold bg-[#111827] text-white">
                      Github
                    </span>
                  ) : user?.provider === "google" ? (
                    <span className="inline-flex items-center px-4 py-1 rounded-full text-sm font-bold bg-[#fef2f2] text-[#991b1b]">
                      Google
                    </span>
                  ) : (
                    <p className="text-lg text-gray-900 capitalize">{user?.provider}</p>
                  )}
                </div>
              </div>

              {/* Member Since */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Member Since
                </label>
                <p className="text-lg text-gray-900">
                  {user?.created_at &&
                    new Date(user.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
