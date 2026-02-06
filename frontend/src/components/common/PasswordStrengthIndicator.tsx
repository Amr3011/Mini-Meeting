import React from "react";

interface PasswordStrengthIndicatorProps {
  password: string;
}

interface PasswordStrength {
  strength: number;
  label: string;
  color: string;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ password }) => {
  const getPasswordStrength = (pwd: string): PasswordStrength => {
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

  if (!password) return null;

  return (
    <div className="mt-3 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Password strength:</span>
        <span
          className={`text-sm font-semibold ${
            passwordStrength.label === "Weak"
              ? "text-danger-600"
              : passwordStrength.label === "Fair"
              ? "text-warning-600"
              : passwordStrength.label === "Good"
              ? "text-brand-600"
              : "text-success-600"
          }`}
        >
          {passwordStrength.label}
        </span>
      </div>

      {/* Colorful Progress Bar */}
      <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`absolute inset-y-0 left-0 rounded-full transition-all duration-300 ${
            passwordStrength.label === "Weak"
              ? "bg-linear-to-r from-danger-400 to-danger-600"
              : passwordStrength.label === "Fair"
              ? "bg-linear-to-r from-warning-400 to-warning-600"
              : passwordStrength.label === "Good"
              ? "bg-linear-to-r from-brand-400 to-brand-600"
              : "bg-linear-to-r from-success-400 to-success-600"
          }`}
          style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
        >
          <div className="absolute inset-0 shimmer" />
        </div>
      </div>

      {/* Password Requirements */}
      <div className="space-y-2 text-xs">
        <div
          className={`flex items-center gap-2 transition-colors ${
            password.length >= 6 ? "text-success-600" : "text-gray-400"
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {password.length >= 6 ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            ) : (
              <circle cx="12" cy="12" r="10" strokeWidth={2} />
            )}
          </svg>
          <span>At least 6 characters</span>
        </div>
        <div
          className={`flex items-center gap-2 transition-colors ${
            /[a-z]/.test(password) && /[A-Z]/.test(password) ? "text-success-600" : "text-gray-400"
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {/[a-z]/.test(password) && /[A-Z]/.test(password) ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            ) : (
              <circle cx="12" cy="12" r="10" strokeWidth={2} />
            )}
          </svg>
          <span>Uppercase & lowercase letters</span>
        </div>
        <div
          className={`flex items-center gap-2 transition-colors ${
            /\d/.test(password) ? "text-success-600" : "text-gray-400"
          }`}
        >
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
  );
};
