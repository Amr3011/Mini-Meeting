import type { User } from "./user.types";

// Response types
export interface AuthResponse {
  token: string;
  user: User;
}

// API Error Response
export interface ApiError {
  message: string;
  error?: string;
}
