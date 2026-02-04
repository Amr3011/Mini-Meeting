import { type InputHTMLAttributes, forwardRef, useState, type ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  showClearButton?: boolean;
  onClear?: () => void;
  floatingLabel?: boolean;
  showCharCount?: boolean;
  hideValidationIcon?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      className = "",
      id,
      leftIcon,
      rightIcon,
      showClearButton = false,
      onClear,
      floatingLabel = false,
      showCharCount = false,
      maxLength,
      value,
      type = "text",
      hideValidationIcon = false,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, "-")}`;
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [internalValue, setInternalValue] = useState("");
    
    const currentValue = value !== undefined ? value : internalValue;
    const hasValue = currentValue && String(currentValue).length > 0;
    const isPasswordField = type === "password";
    const inputType = isPasswordField && showPassword ? "text" : type;

    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);
    
    const handleClear = () => {
      if (onClear) {
        onClear();
      }
      setInternalValue("");
    };

    return (
      <div className="w-full">
        <div className="relative">
          {/* Floating label or regular label */}
          {label && !floatingLabel && (
            <label
              htmlFor={inputId}
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              {label}
              {props.required && <span className="text-danger-500 ml-1">*</span>}
            </label>
          )}

          <div className="relative">
            {/* Left icon */}
            {leftIcon && (
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                {leftIcon}
              </div>
            )}

            {/* Input field */}
            <input
              ref={ref}
              id={inputId}
              type={inputType}
              value={value}
              maxLength={maxLength}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onChange={(e) => {
                setInternalValue(e.target.value);
                props.onChange?.(e);
              }}
              className={`
                w-full px-3 py-2.5 border rounded-lg shadow-sm
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:border-transparent
                disabled:bg-gray-100 disabled:cursor-not-allowed
                ${leftIcon ? "pl-10" : ""}
                ${rightIcon || showClearButton || isPasswordField ? "pr-10" : ""}
                ${floatingLabel ? "pt-6 pb-2" : ""}
                ${error
                  ? "border-danger-500 focus:ring-danger-500/20 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]"
                  : isFocused
                    ? "border-brand-500 focus:ring-brand-500/20 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.1)]"
                    : "border-gray-300 hover:border-gray-400"
                }
                ${className}
              `}
              {...props}
            />

            {/* Floating label */}
            {label && floatingLabel && (
              <label
                htmlFor={inputId}
                className={`
                  absolute left-3 transition-all duration-200 pointer-events-none
                  ${leftIcon ? "left-10" : "left-3"}
                  ${isFocused || hasValue
                    ? "top-1.5 text-xs text-brand-600 font-medium"
                    : "top-1/2 -translate-y-1/2 text-base text-gray-500"
                  }
                `}
              >
                {label}
                {props.required && <span className="text-danger-500 ml-1">*</span>}
              </label>
            )}

            {/* Right side icons/buttons */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {/* Validation icon */}
              {!error && hasValue && !isPasswordField && !hideValidationIcon && (
                <div className="text-success-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}

              {/* Error icon */}
              {error && (
                <div className="text-danger-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              )}

              {/* Clear button */}
              {showClearButton && hasValue && !isPasswordField && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}

              {/* Password toggle */}
              {isPasswordField && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              )}

              {/* Right icon */}
              {rightIcon && !error && !hasValue && !isPasswordField && (
                <div className="text-gray-400">
                  {rightIcon}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Helper text, error message, and character count */}
        <div className="flex justify-between items-start mt-1.5">
          <div className="flex-1">
            {error && (
              <p className="text-sm text-danger-600 animate-slide-down" role="alert">
                {error}
              </p>
            )}
            {helperText && !error && (
              <p className="text-sm text-gray-500">{helperText}</p>
            )}
          </div>

          {/* Character counter */}
          {showCharCount && maxLength && (
            <p className="text-xs text-gray-400 ml-2">
              {String(currentValue).length} / {maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Input.displayName = "Input";
