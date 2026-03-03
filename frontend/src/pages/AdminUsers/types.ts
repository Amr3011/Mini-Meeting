import type { User } from "../../types/user.types";

export interface UsersDataState {
  users: User[];
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  pageSize: number;
  totalUsers: number;
  totalPages: number;
  searchTerm: string;
  debouncedSearch: string;
}

export interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export interface UsersTableProps {
  users: User[];
  currentUserId?: number;
  onDeleteUser: (user: User) => void;
}

export interface UserRowProps {
  user: User;
  currentUserId?: number;
  onDeleteClick: (user: User) => void;
}

export interface DeleteModalProps {
  isOpen: boolean;
  user: User | null;
  isLoading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}
