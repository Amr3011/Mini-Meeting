import React, { forwardRef } from "react";

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  inputId: string;
  inputType: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showClear: boolean;
  error?: string;
  isFocused: boolean;
  floatingLabel: boolean;
  isPasswordField: boolean;
  setInternalValue: (value: string) => void;
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  (
    {
      inputId,
      inputType,
      leftIcon,
      rightIcon,
      showClear,
      error,
      isFocused,
      floatingLabel,
      isPasswordField,
      setInternalValue,
      className,
      maxLength,
      value,
      onFocus,
      onBlur,
      onChange,
      ...props
    },
    ref,
  ) => (
    <input
      {...props}
      ref={ref}
      id={inputId}
      type={inputType}
      value={value}
      maxLength={maxLength}
      onFocus={onFocus}
      onBlur={onBlur}
      onChange={(e) => {
        setInternalValue(e.target.value);
        onChange?.(e);
      }}
      className={`
      w-full px-3 py-2.5 border rounded-lg shadow-sm
      transition-all duration-200
      focus:outline-none focus:ring-2 focus:border-transparent
      disabled:bg-gray-100 disabled:cursor-not-allowed
      ${leftIcon ? "pl-10" : ""}
      ${rightIcon || showClear || isPasswordField ? "pr-10" : ""}
      ${floatingLabel ? "pt-6 pb-2" : ""}
      ${
        error
          ? "border-danger-500 focus:ring-danger-500/20"
          : isFocused
            ? "border-brand-500 focus:ring-brand-500/20"
            : "border-gray-300 hover:border-gray-400"
      }
      ${className}
    `}
    />
  ),
);

InputField.displayName = "InputField";
