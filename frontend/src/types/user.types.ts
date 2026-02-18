// Summarizer session model
export interface SummarizerSession {
  id: number;
  status: "CAPTURED" | "TRANSCRIBED" | "NORMALIZED" | "SUMMARIZED" | "FAILED";
  transcript: string | null;
  summary: string | null;
  started_at: string;
  ended_at: string | null;
}

// User model matching backend response
export interface User {
  id: number;
  email: string;
  name: string;
  role: "user" | "admin";
  provider: "google" | "github";
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  summarizer_sessions?: SummarizerSession[];
}

// Request types
export interface UpdateUserRequest {
  name?: string;
  email?: string;
  password?: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
}

// Response types
export interface UserResponse {
  data: User;
}

export interface UsersResponse {
  data: User[];
}

export interface PaginatedUsersResponse {
  data: User[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface UserUpdateResponse {
  message: string;
  data: User;
}

export interface UserDeleteResponse {
  message: string;
}
