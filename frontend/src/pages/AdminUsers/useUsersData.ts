import { useState, useEffect, useRef } from "react";
import { userService } from "../../services/api/user";
import type { User } from "../../types/user.types";
import type { AxiosError } from "axios";
import type { ApiError } from "../../types/auth.types";

export function useUsersData(
  currentPage: number,
  pageSize: number,
  debouncedSearch: string,
) {
  const lastFetchedKeyRef = useRef("");
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchUsers = async (force = false) => {
    const paramsKey = `${currentPage}-${pageSize}-${debouncedSearch}`;

    // Prevent duplicate calls with the same parameters (unless forced)
    if (!force && paramsKey === lastFetchedKeyRef.current) {
      return;
    }

    lastFetchedKeyRef.current = paramsKey;
    setIsLoading(true);
    setError(null);

    try {
      const data = await userService.getAllUsers(
        currentPage,
        pageSize,
        debouncedSearch,
      );
      setUsers(data.data);
      setTotalUsers(data.total);
      setTotalPages(data.total_pages);
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      setError(
        axiosError.response?.data?.message ||
          "Failed to fetch users. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize, debouncedSearch]);

  return {
    users,
    isLoading,
    error,
    setError,
    totalUsers,
    totalPages,
    refetch: () => fetchUsers(true),
  };
}
