import { useState } from "react";

export const useInputState = (
  initialValue: string | number | readonly string[] | undefined,
) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [internalValue, setInternalValue] = useState("");

  const currentValue =
    initialValue !== undefined ? initialValue : internalValue;
  const hasValue = currentValue && String(currentValue).length > 0;

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);
  const togglePassword = () => setShowPassword(!showPassword);

  return {
    isFocused,
    showPassword,
    internalValue,
    currentValue,
    hasValue,
    handleFocus,
    handleBlur,
    togglePassword,
    setInternalValue,
  };
};
