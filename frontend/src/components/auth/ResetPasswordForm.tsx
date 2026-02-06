import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema, type ResetPasswordFormData } from "../../utils/validators";
import { authService } from "../../services/api/auth.service";
import { Button } from "../common/Button";
import { Input } from "../common/Input";
import { ErrorMessage } from "../common/ErrorMessage";
import { PasswordStrengthIndicator } from "../common/PasswordStrengthIndicator";
import { CodeInput } from "../common/CodeInput";
import { ResendCodeButton } from "../common/ResendCodeButton";
import type { AxiosError } from "axios";
import type { ApiError } from "../../types/auth.types";

export const ResetPasswordForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || "");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [step, setStep] = useState<"code" | "password">("code");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordMatch, setShowPasswordMatch] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email },
  });

  const password = watch("password", "");
  const confirmPassword = watch("confirmPassword", "");

  // Debounce password match validation
  useEffect(() => {
    if (confirmPassword) {
      setShowPasswordMatch(false);
      const timer = setTimeout(() => {
        setShowPasswordMatch(true);
      }, 500); // Show validation 500ms after user stops typing
      return () => clearTimeout(timer);
    } else {
      setShowPasswordMatch(false);
    }
  }, [confirmPassword]);

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    const fullCode = code.join("");
    if (fullCode.length !== 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await authService.verifyPasswordCode({ email, code: fullCode });
      setStep("password");
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      const errorMessage =
        axiosError.response?.data?.error ||
        axiosError.response?.data?.message ||
        "Invalid or expired code. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) return;

    await authService.forgotPassword({ email });
    setSuccess("Reset code sent successfully!");
    setTimeout(() => setSuccess(null), 3000);
  };

  const onSubmitPassword = async (data: ResetPasswordFormData) => {
    const fullCode = code.join("");

    setIsLoading(true);
    setError(null);

    try {
      await authService.resetPassword({
        email: data.email,
        code: fullCode,
        password: data.password,
      });

      navigate("/login", {
        state: { message: "Password reset successfully! Please login with your new password." },
      });
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      const errorMessage =
        axiosError.response?.data?.error ||
        axiosError.response?.data?.message ||
        "Failed to reset password. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (step === "code") {
    return (
      <div className="w-full max-w-lg mx-auto space-y-8">
        {/* Header with animated icon */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-linear-to-br from-brand-500 to-purple-600 rounded-2xl shadow-xl animate-bounce-gentle">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 animate-slide-up">
            Enter reset code
          </h2>
          <p className="text-lg text-gray-600 animate-slide-up" style={{ animationDelay: '100ms' }}>
            Enter the 6-digit code sent to your email
          </p>
        </div>

        {/* Glassmorphic Form Card */}
        <div className="glass rounded-2xl shadow-2xl p-8 space-y-6 animate-scale-up" style={{ animationDelay: '200ms' }}>
          <form onSubmit={handleVerifyCode} className="space-y-6">
            {error && <ErrorMessage message={error} />}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800">
                {success}
              </div>
            )}

            <Input
              label="Email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={!!location.state?.email}
            />

            <CodeInput code={code} onChange={setCode} label="Reset Code" />

            {/* Verify Button */}
            <Button
              type="submit"
              variant="gradient"
              size="lg"
              fullWidth
              isLoading={isLoading}
            >
              Verify Code
            </Button>
          </form>

          <ResendCodeButton onResend={handleResendCode} initialTimer={60} />
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
  }

  return (
    <div className="w-full max-w-lg mx-auto space-y-8">
      {/* Header with animated icon */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-linear-to-br from-brand-500 to-purple-600 rounded-2xl shadow-xl animate-bounce-gentle">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
        </div>
        <h2 className="text-4xl font-bold text-gray-900 animate-slide-up">
          Reset password
        </h2>
        <p className="text-lg text-gray-600 animate-slide-up" style={{ animationDelay: '100ms' }}>
          Enter your new password
        </p>
      </div>

      {/* Glassmorphic Form Card */}
      <div className="glass rounded-2xl shadow-2xl p-8 space-y-6 animate-scale-up" style={{ animationDelay: '200ms' }}>
        <form onSubmit={handleSubmit(onSubmitPassword)} className="space-y-6">
          {error && <ErrorMessage message={error} />}

          <input type="hidden" {...register("email")} value={email} />
          <input type="hidden" {...register("code")} value={code.join("")} />

          <div>
            <Input
              label="New Password"
              type="password"
              placeholder="Enter new password"
              error={errors.password?.message}
              {...register("password")}
            />
            <PasswordStrengthIndicator password={password} />
          </div>

          <div>
            <Input
              label="Confirm Password"
              type="password"
              placeholder="Confirm new password"
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
            />

            {/* Password Match Indicator */}
            {confirmPassword && showPasswordMatch && (
              <div className={`mt-2 flex items-center gap-2 text-sm transition-colors ${
                confirmPassword === password 
                  ? 'text-success-600' 
                  : 'text-danger-600'
              }`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {confirmPassword === password ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  )}
                </svg>
                <span className="font-medium">
                  {confirmPassword === password 
                    ? 'Passwords match' 
                    : 'Passwords do not match'}
                </span>
              </div>
            )}
          </div>

          <Button
            type="submit"
            variant="gradient"
            size="lg"
            fullWidth
            isLoading={isLoading}
          >
            Reset Password
          </Button>
        </form>
      </div>

      {/* Back to Login */}
      <div className="text-center mt-6">
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
