import { Layout } from "../../components/layout/Layout";
import { ErrorMessage } from "../../components/common/ErrorMessage";
import { NameField } from "./NameField";
import { ProfileInfoField } from "./ProfileInfoField";
import { useProfileEdit } from "./useProfileEdit";

export default function Profile() {
  const {
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
  } = useProfileEdit();

  const providerBadge =
    user?.provider === "github" ? (
      <span className="inline-flex items-center px-4 py-1 rounded-full text-sm font-bold bg-[#111827] text-white">
        Github
      </span>
    ) : user?.provider === "google" ? (
      <span className="inline-flex items-center px-4 py-1 rounded-full text-sm font-bold bg-danger-50 text-danger-800">
        Google
      </span>
    ) : (
      user?.provider
    );

  const memberSince =
    user?.created_at &&
    new Date(user.created_at).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your account information
            </p>
          </div>
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
              <NameField
                isEditing={isEditingName}
                currentName={user?.name || ""}
                editedName={editedName}
                isLoading={isLoading}
                onEdit={handleEditName}
                onChange={setEditedName}
                onSave={handleSaveName}
                onCancel={handleCancelEdit}
              />
              <ProfileInfoField
                label="Email Address"
                value={user?.email || ""}
              />
              <ProfileInfoField label="Login Method" value={providerBadge} />
              <ProfileInfoField
                label="Member Since"
                value={memberSince || ""}
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
