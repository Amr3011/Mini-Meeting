import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { authService } from "../../services/api/auth.service";
import { Button } from "../common/Button";
import { Input } from "../common/Input";
import { ErrorMessage } from "../common/ErrorMessage";
import { CodeInput } from "../common/CodeInput";
import { ResendCodeButton } from "../common/ResendCodeButton";
import type { AxiosError } from "axios";
import type { ApiError } from "../../types/auth.types";

export const VerifyEmailForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || "");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
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
    setSuccess(null);

    try {
      await authService.verifyEmail({ email, code: fullCode });
      setSuccess("Email verified successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
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

    await authService.resendCode({ email });
    setSuccess("Verification code sent successfully!");
    setTimeout(() => setSuccess(null), 3000);
  };

  return (
    <div className="w-full max-w-lg mx-auto space-y-8">
      {/* Header with animated icon */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-linear-to-br from-brand-500 to-purple-600 rounded-2xl shadow-xl animate-bounce-gentle">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-4xl font-bold text-gray-900 animate-slide-up">
          Verify your email
        </h2>
        <p className="text-lg text-gray-600 animate-slide-up" style={{ animationDelay: '100ms' }}>
          Enter the 6-digit code sent to your email
        </p>
      </div>

      {/* Glassmorphic Form Card */}
      <div className="glass rounded-2xl shadow-2xl p-8 space-y-6 animate-scale-up" style={{ animationDelay: '200ms' }}>
        <form onSubmit={handleSubmit} className="space-y-6">
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

          <CodeInput code={code} onChange={setCode} label="Verification Code" />

          {/* Verify Button */}
          <Button
            type="submit"
            variant="gradient"
            size="lg"
            fullWidth
            isLoading={isLoading}
          >
            Verify Email
          </Button>
        </form>

        <ResendCodeButton onResend={handleResendCode} />
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
