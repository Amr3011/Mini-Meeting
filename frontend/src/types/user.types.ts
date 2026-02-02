// User model matching backend response
export interface User {
  id: number;
  email: string;
  name: string;
  role: "user" | "admin";
  email_verified: boolean;
  created_at: string;
  updated_at: string;
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

export interface UserUpdateResponse {
  message: string;
  data: User;
}

export interface UserDeleteResponse {
  message: string;
}
