import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterFormData } from "../../utils/validators";
import { authService } from "../../services/api/auth.service";
import { Button } from "../common/Button";
import { Input } from "../common/Input";
import { ErrorMessage } from "../common/ErrorMessage";
import type { AxiosError } from "axios";
import type { ApiError } from "../../types/auth.types";

export const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch("password", "");

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

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      await authService.register(data);
      navigate("/verify-email", { state: { email: data.email } });
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      
      if (axiosError.response?.status === 409) {
        setError("An account with this email already exists.");
      } else {
        setError(
          axiosError.response?.data?.message ||
            "Registration failed. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = (provider: "google" | "github") => {
    authService.initiateOAuthLogin(provider);
  };

  return (
    <div className="w-full max-w-md space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-bold text-gray-900 animate-slide-up">
          Create account
        </h2>
        <p className="text-lg text-gray-600 animate-slide-up" style={{ animationDelay: '100ms' }}>
          Join Mini Meeting today
        </p>
      </div>

      {/* Glassmorphic Form Card */}
      <div className="glass rounded-2xl shadow-xl p-8 space-y-6 animate-scale-up" style={{ animationDelay: '200ms' }}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {error && <ErrorMessage message={error} />}

        <Input
          label="Full Name"
          type="text"
          placeholder="Enter your full name"
          error={errors.name?.message}
          {...register("name")}
        />

        <Input
          label="Email"
          type="email"
          placeholder="Enter your email"
          error={errors.email?.message}
          {...register("email")}
        />

        <div>
          <Input
            label="Password"
            type="password"
            placeholder="Create a password"
            error={errors.password?.message}
            {...register("password")}
          />
          
          {/* Enhanced Password Strength Indicator */}
          {password && (
            <div className="mt-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Password strength:</span>
                <span className={`text-sm font-semibold ${
                  passwordStrength.label === 'Weak' ? 'text-danger-600' : 
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
                  className={`absolute inset-y-0 left-0 rounded-full transition-all duration-300 ${
                    passwordStrength.label === 'Weak' ? 'bg-linear-to-r from-danger-400 to-danger-600' :
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
                <div className={`flex items-center gap-2 transition-colors ${
                  password.length >= 6 ? 'text-success-600' : 'text-gray-400'
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
                <div className={`flex items-center gap-2 transition-colors ${
                  /[a-z]/.test(password) && /[A-Z]/.test(password) ? 'text-success-600' : 'text-gray-400'
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
                <div className={`flex items-center gap-2 transition-colors ${
                  /\d/.test(password) ? 'text-success-600' : 'text-gray-400'
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

        {/* Create Account Button */}
        <Button 
          type="submit" 
          variant="gradient"
          size="lg"
          fullWidth 
          isLoading={isLoading}
        >
          Create account
        </Button>
      </form>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-500">Or sign up with</span>
        </div>
      </div>

      {/* Social Login Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => handleOAuthLogin("google")}
          className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span className="text-sm font-medium text-gray-700">Google</span>
        </button>
        <button
          type="button"
          onClick={() => handleOAuthLogin("github")}
          className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
          </svg>
          <span className="text-sm font-medium text-gray-700">GitHub</span>
        </button>
      </div>
    </div>

    {/* Sign In Link */}
    <div className="text-center">
      <span className="text-gray-600">Already have an account? </span>
      <Link
        to="/login"
        className="font-semibold text-brand-600 hover:text-brand-700 transition-colors"
      >
        Sign in
      </Link>
    </div>
  </div>
  );
};
