import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Layout } from "../components/layout/Layout";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import { ErrorMessage } from "../components/common/ErrorMessage";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateUserSchema, type UpdateUserFormData } from "../utils/validators";
import { userService } from "../services/api/user.service";
import type { AxiosError } from "axios";
import type { ApiError } from "../types/auth.types";

export default function Profile() {
  const { user, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateUserFormData>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: user?.name,
      email: user?.email,
    },
  });

  const onSubmit = async (data: UpdateUserFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    // Only send fields that have values
    const updateData: UpdateUserFormData = {};
    if (data.name && data.name !== user?.name) updateData.name = data.name;
    if (data.email && data.email !== user?.email) updateData.email = data.email;
    if (data.password) updateData.password = data.password;

    if (Object.keys(updateData).length === 0) {
      setError("No changes detected");
      setIsLoading(false);
      return;
    }

    try {
      const updatedUser = await userService.updateCurrentUser(updateData);
      setUser(updatedUser);
      setSuccess("Profile updated successfully!");
      setIsEditing(false);
      reset({ name: updatedUser.name, email: updatedUser.email, password: "" });
      
      if (updateData.email) {
        setSuccess("Profile updated! Please verify your new email address.");
      }
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      setError(
        axiosError.response?.data?.message ||
          "Failed to update profile. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
    setSuccess(null);
    reset({ name: user?.name, email: user?.email, password: "" });
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Manage your account information
                </p>
              </div>
              {!isEditing && (
                <Button onClick={() => setIsEditing(true)} variant="secondary">
                  Edit Profile
                </Button>
              )}
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

            {!isEditing ? (
              /* View Mode */
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <p className="mt-1 text-lg text-gray-900">{user?.name}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <div className="flex items-center mt-1">
                    <p className="text-lg text-gray-900">{user?.email}</p>
                    {user?.email_verified ? (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        <svg
                          className="mr-1 h-3 w-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Verified
                      </span>
                    ) : (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                        Not Verified
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Role
                  </label>
                  <p className="mt-1 text-lg text-gray-900 capitalize">
                    {user?.role}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Member Since
                  </label>
                  <p className="mt-1 text-lg text-gray-900">
                    {user?.created_at &&
                      new Date(user.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                  </p>
                </div>
              </div>
            ) : (
              /* Edit Mode */
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  label="Full Name"
                  type="text"
                  placeholder="Enter your full name"
                  error={errors.name?.message}
                  {...register("name")}
                />

                <Input
                  label="Email Address"
                  type="email"
                  placeholder="Enter your email"
                  error={errors.email?.message}
                  helperText="Changing your email will require verification"
                  {...register("email")}
                />

                <Input
                  label="New Password"
                  type="password"
                  placeholder="Leave blank to keep current password"
                  error={errors.password?.message}
                  helperText="Minimum 6 characters"
                  {...register("password")}
                />

                <div className="flex gap-3 pt-4">
                  <Button type="submit" isLoading={isLoading}>
                    Save Changes
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleCancel}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
