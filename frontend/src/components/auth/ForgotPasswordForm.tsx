import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { emailSchema, type EmailFormData } from "../../utils/validators";
import { authService } from "../../services/api/auth.service";
import { Button } from "../common/Button";
import { Input } from "../common/Input";
import { ErrorMessage } from "../common/ErrorMessage";
import type { AxiosError } from "axios";
import type { ApiError } from "../../types/auth.types";

export const ForgotPasswordForm: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
  });

  const onSubmit = async (data: EmailFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      await authService.forgotPassword(data);
      navigate("/reset-password", { state: { email: data.email } });
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;

      if (axiosError.response?.status === 404) {
        setError("No account found with this email address.");
      } else {
        const errorMessage =
          axiosError.response?.data?.error ||
          axiosError.response?.data?.message ||
          "Failed to send reset code. Please try again.";
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto space-y-8">
      {/* Header with animated icon */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-linear-to-br from-brand-500 to-purple-600 rounded-2xl shadow-xl animate-bounce-gentle">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-4xl font-bold text-gray-900 animate-slide-up">
          Forgot password?
        </h2>
        <p className="text-lg text-gray-600 animate-slide-up" style={{ animationDelay: '100ms' }}>
          Enter your email and we'll send you a reset code
        </p>
      </div>

      {/* Glassmorphic Form Card */}
      <div className="glass rounded-2xl shadow-2xl p-8 space-y-6 animate-scale-up" style={{ animationDelay: '200ms' }}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && <ErrorMessage message={error} />}

          <Input
            label="Email"
            type="email"
            placeholder="Enter your email"
            error={errors.email?.message}
            {...register("email")}
          />

          <Button
            type="submit"
            variant="gradient"
            size="lg"
            fullWidth
            isLoading={isLoading}
          >
            Send reset code
          </Button>
        </form>
      </div>

      {/* Back to Login */}
      <div className="text-center">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to login
        </Link>
      </div>
    </div>
  );
};
