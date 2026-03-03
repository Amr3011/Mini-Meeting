import type { InputHTMLAttributes, ReactNode } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
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

export interface InputLabelProps {
  label: string;
  inputId: string;
  required?: boolean;
  floating: boolean;
  isFocused: boolean;
  hasValue: boolean;
  hasLeftIcon: boolean;
}

export interface InputHelperTextProps {
  error?: string;
  helperText?: string;
  showCharCount: boolean;
  maxLength?: number;
  currentLength: number;
}

export interface InputContainerProps extends InputProps {
  inputId: string;
  inputType: string;
  isPasswordField: boolean;
  isFocused: boolean;
  showPassword: boolean;
  hasValue: boolean;
  showClear: boolean;
  currentValue: string | number | readonly string[];
  handleFocus: () => void;
  handleBlur: () => void;
  togglePassword: () => void;
  handleClear: () => void;
  setInternalValue: (value: string) => void;
}
