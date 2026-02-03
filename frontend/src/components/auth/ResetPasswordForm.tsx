import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema, type ResetPasswordFormData } from "../../utils/validators";
import { authService } from "../../services/api/auth.service";
import { Button } from "../common/Button";
import { Input } from "../common/Input";
import { ErrorMessage } from "../common/ErrorMessage";
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
  const [resendTimer, setResendTimer] = useState(60); // Start timer at 60 seconds since code already sent
  const [showPasswordMatch, setShowPasswordMatch] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

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

  // Calculate password strength
  const getPasswordStrength = (pwd: string): { strength: number; label: string; color: string } => {
    if (!pwd) return { strength: 0, label: "", color: "" };

    let strength = 0;
    if (pwd.length >= 6) strength++;
    if (pwd.length >= 10) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[^a-zA-Z\d]/.test(pwd)) strength++;

    if (strength <= 2) return { strength, label: "Weak", color: "bg-red-500" };
    if (strength <= 3) return { strength, label: "Fair", color: "bg-yellow-500" };
    if (strength <= 4) return { strength, label: "Good", color: "bg-blue-500" };
    return { strength, label: "Strong", color: "bg-green-500" };
  };

  const passwordStrength = getPasswordStrength(password);

  // Timer for resend button
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

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

  const handleCodeChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);

    if (/^\d+$/.test(pastedData)) {
      const newCode = pastedData.split("").concat(Array(6).fill("")).slice(0, 6);
      setCode(newCode);
      const nextIndex = Math.min(pastedData.length, 5);
      inputRefs.current[nextIndex]?.focus();
    }
  };

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
    if (!email || resendTimer > 0) return;

    try {
      await authService.forgotPassword({ email });
      setSuccess("Reset code sent successfully!");
      setResendTimer(60);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      const errorMessage =
        axiosError.response?.data?.error ||
        axiosError.response?.data?.message ||
        "Failed to resend code. Please try again.";
      setError(errorMessage);
    }
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
                Reset Code
              </label>
              <div className="flex gap-3 justify-center">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className={`
                      w-14 h-16 text-center text-3xl font-bold 
                      border-2 rounded-xl transition-all duration-200
                      focus:outline-none focus:ring-4
                      ${digit
                        ? 'border-brand-500 bg-brand-50 text-brand-700 ring-brand-100'
                        : 'border-gray-300 hover:border-gray-400 focus:border-brand-500 focus:ring-brand-100'
                      }
                      ${digit && 'animate-pulse'}
                    `}
                  />
                ))}
              </div>
            </div>

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

          {/* Resend Code with Circular Timer */}
          <div className="flex items-center justify-center gap-4 pt-4 border-t border-gray-200">
            {resendTimer > 0 ? (
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12">
                  {/* Background circle */}
                  <svg className="w-12 h-12 transform -rotate-90">
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      className="text-gray-200"
                    />
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 20}`}
                      strokeDashoffset={`${2 * Math.PI * 20 * (1 - resendTimer / 60)}`}
                      className="text-brand-500 transition-all duration-1000"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-gray-700">
                    {resendTimer}
                  </span>
                </div>
                <span className="text-sm text-gray-600">Wait before resending</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleResendCode}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-brand-600 hover:text-brand-700 hover:bg-brand-50 rounded-lg transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Resend code
              </button>
            )}
          </div>
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

            {/* Enhanced Password Strength Indicator */}
            {password && (
              <div className="mt-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Password strength:</span>
                  <span className={`text-sm font-semibold ${passwordStrength.label === 'Weak' ? 'text-danger-600' :
                      passwordStrength.label === 'Fair' ? 'text-warning-600' :
                        passwordStrength.label === 'Good' ? 'text-brand-600' :
                          'text-success-600'
                    }`}>
                    {passwordStrength.label}
                  </span>
                </div>

                {/* Colorful Progress Bar */}
                <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`absolute inset-y-0 left-0 rounded-full transition-all duration-300 ${passwordStrength.label === 'Weak' ? 'bg-linear-to-r from-danger-400 to-danger-600' :
                        passwordStrength.label === 'Fair' ? 'bg-linear-to-r from-warning-400 to-warning-600' :
                          passwordStrength.label === 'Good' ? 'bg-linear-to-r from-brand-400 to-brand-600' :
                            'bg-linear-to-r from-success-400 to-success-600'
                      }`}
                    style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                  >
                    <div className="absolute inset-0 shimmer" />
                  </div>
                </div>

                {/* Password Requirements */}
                <div className="space-y-2 text-xs">
                  <div className={`flex items-center gap-2 transition-colors ${password.length >= 6 ? 'text-success-600' : 'text-gray-400'
                    }`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {password.length >= 6 ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      ) : (
                        <circle cx="12" cy="12" r="10" strokeWidth={2} />
                      )}
                    </svg>
                    <span>At least 6 characters</span>
                  </div>
                  <div className={`flex items-center gap-2 transition-colors ${/[a-z]/.test(password) && /[A-Z]/.test(password) ? 'text-success-600' : 'text-gray-400'
                    }`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {/[a-z]/.test(password) && /[A-Z]/.test(password) ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      ) : (
                        <circle cx="12" cy="12" r="10" strokeWidth={2} />
                      )}
                    </svg>
                    <span>Uppercase & lowercase letters</span>
                  </div>
                  <div className={`flex items-center gap-2 transition-colors ${/\d/.test(password) ? 'text-success-600' : 'text-gray-400'
                    }`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {/\d/.test(password) ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      ) : (
                        <circle cx="12" cy="12" r="10" strokeWidth={2} />
                      )}
                    </svg>
                    <span>At least one number</span>
                  </div>
                </div>
              </div>
            )}
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
