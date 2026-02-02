import { type ButtonHTMLAttributes, forwardRef, type ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "success" | "gradient";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      isLoading = false,
      fullWidth = false,
      disabled,
      className = "",
      leftIcon,
      rightIcon,
      ...props
    },
    ref
  ) => {
    const baseClasses =
      "font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center relative overflow-hidden group";

    const variantClasses = {
      primary:
        "bg-brand-500 text-white hover:bg-brand-600 hover:-translate-y-0.5 hover:shadow-lg focus:ring-brand-500 active:scale-[0.98]",
      secondary:
        "bg-gray-200 text-gray-900 hover:bg-gray-300 hover:-translate-y-0.5 hover:shadow-md focus:ring-gray-500 active:scale-[0.98]",
      danger:
        "bg-danger-500 text-white hover:bg-danger-600 hover:-translate-y-0.5 hover:shadow-lg focus:ring-danger-500 active:scale-[0.98]",
      ghost:
        "bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500 active:scale-[0.98]",
      success:
        "bg-success-500 text-white hover:bg-success-600 hover:-translate-y-0.5 hover:shadow-lg focus:ring-success-500 active:scale-[0.98]",
      gradient:
        "bg-linear-to-r from-brand-500 to-purple-600 text-white hover:from-brand-600 hover:to-purple-700 hover:-translate-y-0.5 hover:shadow-glow focus:ring-brand-500 active:scale-[0.98]",
    };

    const sizeClasses = {
      sm: "px-3 py-1.5 text-sm gap-1.5",
      md: "px-4 py-2 text-base gap-2",
      lg: "px-6 py-3 text-lg gap-2.5",
    };

    const widthClass = fullWidth ? "w-full" : "";

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`}
        {...props}
      >
        {/* Ripple effect on click */}
        <span className="absolute inset-0 overflow-hidden rounded-lg">
          <span className="absolute inset-0 bg-white opacity-0 group-active:opacity-20 transition-opacity duration-300 scale-0 group-active:scale-100" />
        </span>

        {/* Button content */}
        {isLoading ? (
          <>
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span className="opacity-70">Loading...</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="shrink-0">{leftIcon}</span>}
            <span>{children}</span>
            {rightIcon && <span className="shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
