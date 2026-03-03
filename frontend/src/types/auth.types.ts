import type { User } from "./user.types";

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiError {
  message: string;
  error?: string;
}
