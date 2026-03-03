import React from "react";
import { InputIcons } from "./InputIcons";
import { ClearButton } from "./ClearButton";
import { PasswordToggle } from "./PasswordToggle";

interface RightIconsProps {
  error?: string;
  hasValue: boolean;
  isPasswordField: boolean;
  hideValidationIcon: boolean;
  showClear: boolean;
  showPassword: boolean;
  rightIcon?: React.ReactNode;
  onClear: () => void;
  onTogglePassword: () => void;
}

export const RightIcons: React.FC<RightIconsProps> = ({
  error,
  hasValue,
  isPasswordField,
  hideValidationIcon,
  showClear,
  showPassword,
  rightIcon,
  onClear,
  onTogglePassword,
}) => (
  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
    <InputIcons
      error={error}
      hasValue={hasValue}
      isPasswordField={isPasswordField}
      hideValidationIcon={hideValidationIcon}
    />
    <ClearButton show={showClear} onClick={onClear} />
    <PasswordToggle
      show={isPasswordField}
      showPassword={showPassword}
      onToggle={onTogglePassword}
    />
    {rightIcon && !error && !hasValue && !isPasswordField && (
      <div className="text-gray-400">{rightIcon}</div>
    )}
  </div>
);
