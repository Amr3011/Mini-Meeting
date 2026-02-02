import type { User } from "./user.types";

// Request types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface VerifyEmailRequest {
  email: string;
  code: string;
}

export interface ResendCodeRequest {
  email: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyPasswordCodeRequest {
  email: string;
  code: string;
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  password: string;
}

// Response types
export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginResponse {
  message: string;
  data: AuthResponse;
}

export interface RegisterResponse {
  message: string;
  data: {
    email: string;
  };
}

export interface VerifyEmailResponse {
  message: string;
}

export interface ResendCodeResponse {
  message: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface VerifyPasswordCodeResponse {
  message: string;
}

export interface ResetPasswordResponse {
  message: string;
}

// API Error Response
export interface ApiError {
  message: string;
  error?: string;
}
