import apiClient from "./client";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  VerifyEmailRequest,
  VerifyEmailResponse,
  ResendCodeRequest,
  ResendCodeResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  VerifyPasswordCodeRequest,
  VerifyPasswordCodeResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  AuthResponse,
} from "../../types/auth.types";

export const authService = {
  /**
   * Register a new user
   */
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const response = await apiClient.post<RegisterResponse>("/auth/register", data);
    return response.data;
  },

  /**
   * Login user and receive JWT token
   */
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<LoginResponse>("/auth/login", data);
    return response.data.data;
  },

  /**
   * Verify email with 6-digit code
   */
  verifyEmail: async (data: VerifyEmailRequest): Promise<VerifyEmailResponse> => {
    const response = await apiClient.post<VerifyEmailResponse>("/auth/verify-email", data);
    return response.data;
  },

  /**
   * Resend verification code
   */
  resendCode: async (data: ResendCodeRequest): Promise<ResendCodeResponse> => {
    const response = await apiClient.post<ResendCodeResponse>("/auth/resend-code", data);
    return response.data;
  },

  /**
   * Initiate password reset
   */
  forgotPassword: async (data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> => {
    const response = await apiClient.post<ForgotPasswordResponse>("/auth/forgot-password", data);
    return response.data;
  },

  /**
   * Verify password reset code
   */
  verifyPasswordCode: async (data: VerifyPasswordCodeRequest): Promise<VerifyPasswordCodeResponse> => {
    const response = await apiClient.post<VerifyPasswordCodeResponse>("/auth/verify-password-code", data);
    return response.data;
  },

  /**
   * Reset password with verified code
   */
  resetPassword: async (data: ResetPasswordRequest): Promise<ResetPasswordResponse> => {
    const response = await apiClient.patch<ResetPasswordResponse>("/auth/reset-password", data);
    return response.data;
  },

  /**
   * Initiate OAuth login flow
   * Redirects to OAuth provider's authorization page
   */
  initiateOAuthLogin: (provider: "google" | "github"): void => {
    const backendUrl = import.meta.env.VITE_API_BASE_URL;
    window.location.href = `${backendUrl}/auth/${provider}`;
  },
};
