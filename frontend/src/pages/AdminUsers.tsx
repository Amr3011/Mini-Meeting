import { useState, useEffect, useRef } from "react";
import { Layout } from "../components/layout/Layout";
import { Button } from "../components/common/Button";
import { Modal } from "../components/common/Modal";
import { Input } from "../components/common/Input";
import { ErrorMessage } from "../components/common/ErrorMessage";
import { Loading } from "../components/common/Loading";
import { Pagination } from "../components/common/Pagination";
import { userService } from "../services/api/user.service";
import type { User, CreateUserRequest } from "../types/user.types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "../utils/validators";
import type { AxiosError } from "axios";
import type { ApiError } from "../types/auth.types";
import { useAuth } from "../hooks/useAuth";

// Session storage keys
const STORAGE_KEY = 'adminUsersState';

// Helper to get cached state
const getCachedState = (search: string) => {
  try {
    const cached = sessionStorage.getItem(`${STORAGE_KEY}_${search}`);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
};

// Helper to save state
const saveState = (state: {
  users: User[];
  currentPage: number;
  pageSize: number;
  totalUsers: number;
  totalPages: number;
  search: string;
}) => {
  try {
    sessionStorage.setItem(`${STORAGE_KEY}_${state.search}`, JSON.stringify(state));
  } catch {
    // Ignore storage errors
  }
};

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const cachedState = getCachedState(searchTerm);
  const hasFetchedRef = useRef(false);
  
  const [users, setUsers] = useState<User[]>(cachedState?.users || []);
  const [isLoading, setIsLoading] = useState(!cachedState);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(cachedState?.currentPage || 1);
  const [pageSize, setPageSize] = useState(cachedState?.pageSize || 10);
  const [totalUsers, setTotalUsers] = useState(cachedState?.totalUsers || 0);
  const [totalPages, setTotalPages] = useState(cachedState?.totalPages || 0);

  // Fetch users
  const fetchUsers = async (force = false) => {
    // Prevent duplicate calls in strict mode
    if (!force && hasFetchedRef.current) {
      return;
    }
    
    hasFetchedRef.current = true;
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await userService.getAllUsers(currentPage, pageSize, searchTerm);
      setUsers(data.data);
      setTotalUsers(data.total);
      setTotalPages(data.total_pages);
      
      // Save to session storage
      saveState({
        users: data.data,
        currentPage,
        pageSize,
        totalUsers: data.total,
        totalPages: data.total_pages,
        search: searchTerm,
      });
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      setError(
        axiosError.response?.data?.message ||
          "Failed to fetch users. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search input change with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      // Reset to page 1 when search term changes
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        hasFetchedRef.current = false;
        fetchUsers();
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  useEffect(() => {
    // If we have cached data that matches current page/pageSize/search, don't refetch
    const cached = getCachedState(searchTerm);
    if (
      cached &&
      cached.currentPage === currentPage &&
      cached.pageSize === pageSize &&
      cached.search === searchTerm &&
      cached.users.length > 0 &&
      !hasFetchedRef.current
    ) {
      // Mark as fetched to prevent duplicate calls
      hasFetchedRef.current = true;
      return;
    }
    
    // Reset fetch flag and fetch new data
    hasFetchedRef.current = false;
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize]);

  // Create user form
  const {
    register: registerCreate,
    handleSubmit: handleSubmitCreate,
    formState: { errors: createErrors },
    reset: resetCreate,
  } = useForm<CreateUserRequest>({
    resolver: zodResolver(registerSchema),
  });

  const handleCreateUser = async (data: CreateUserRequest) => {
    setActionLoading(true);
    try {
      await userService.createUser(data);
      hasFetchedRef.current = false;
      await fetchUsers(true);
      setIsCreateModalOpen(false);
      resetCreate();
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      setError(
        axiosError.response?.data?.message ||
          "Failed to create user. Please try again."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    // Prevent admin from deleting themselves
    if (selectedUser.id === currentUser?.id) {
      setError("You cannot delete your own account.");
      return;
    }

    setActionLoading(true);
    try {
      await userService.deleteUser(selectedUser.id);
      hasFetchedRef.current = false;
      await fetchUsers(true);
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      setError(
        axiosError.response?.data?.message ||
          "Failed to delete user. Please try again."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const openDeleteModal = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

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
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                User Management
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage all users in the system
              </p>
            </div>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              Create User
            </Button>
          </div>

          {error && (
            <div className="mb-4">
              <ErrorMessage message={error} onRetry={() => setError(null)} />
            </div>
          )}

          {/* Search */}
          <div className="mb-4 flex justify-center">
            <div className="relative max-w-md w-full">
              <Input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10"
                hideValidationIcon={true}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Clear search"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sign Up Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                              {user.name}
                              {user.role === "admin" && (
                                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                                  Admin
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.email_verified ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Verified
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Unverified
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.provider === "google"
                              ? "bg-red-100 text-red-800"
                              : user.provider === "github"
                              ? "bg-gray-800 text-white"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {user.provider === "local"
                            ? "Email"
                            : user.provider.charAt(0).toUpperCase() + user.provider.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => openDeleteModal(user)}
                          className="text-red-600 hover:text-red-900"
                          disabled={user.id === currentUser?.id}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
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
              setCurrentPage(1); // Reset to first page when changing page size
            }}
          />
        </div>

        {/* Create User Modal */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            resetCreate();
          }}
          title="Create New User"
        >
          <form
            onSubmit={handleSubmitCreate(handleCreateUser)}
            className="space-y-4"
          >
            <Input
              label="Full Name"
              type="text"
              placeholder="Enter full name"
              error={createErrors.name?.message}
              {...registerCreate("name")}
            />
            <Input
              label="Email"
              type="email"
              placeholder="Enter email"
              error={createErrors.email?.message}
              {...registerCreate("email")}
            />
            <Input
              label="Password"
              type="password"
              placeholder="Enter password"
              error={createErrors.password?.message}
              {...registerCreate("password")}
            />
            <div className="flex gap-3 pt-4">
              <Button type="submit" isLoading={actionLoading}>
                Create User
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  resetCreate();
                }}
                disabled={actionLoading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setSelectedUser(null);
          }}
          title="Delete User"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to delete{" "}
              <span className="font-semibold">{selectedUser?.name}</span>? This
              action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button
                variant="danger"
                onClick={handleDeleteUser}
                isLoading={actionLoading}
              >
                Delete User
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSelectedUser(null);
                }}
                disabled={actionLoading}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
}
