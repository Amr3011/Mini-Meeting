import { forwardRef } from "react";
import { InputContainer } from "./InputContainer";
import { InputHelperText } from "./InputHelperText";
import { useInputState } from "./useInputState";
import type { InputProps } from "./types";

/**
 * Input component with label, validation, and helper text
 * Supports floating labels, icons, password toggle, and character count
 */
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
    ref,
  ) => {
    const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, "-")}`;
    const isPasswordField = type === "password";

    const {
      isFocused,
      showPassword,
      currentValue,
      hasValue,
      handleFocus,
      handleBlur,
      togglePassword,
      setInternalValue,
    } = useInputState(value);

    const inputType = isPasswordField && showPassword ? "text" : type;
    const showClear = !!(showClearButton && hasValue && !isPasswordField);

    const handleClear = () => {
      onClear?.();
      setInternalValue("");
    };

    return (
      <div className="w-full">
        <InputContainer
          ref={ref}
          inputId={inputId}
          inputType={inputType}
          isPasswordField={isPasswordField}
          label={label}
          leftIcon={leftIcon}
          rightIcon={rightIcon}
          error={error}
          isFocused={isFocused}
          showPassword={showPassword}
          hasValue={!!hasValue}
          showClear={showClear}
          floatingLabel={floatingLabel}
          hideValidationIcon={hideValidationIcon}
          handleFocus={handleFocus}
          handleBlur={handleBlur}
          togglePassword={togglePassword}
          handleClear={handleClear}
          setInternalValue={setInternalValue}
          value={value}
          maxLength={maxLength}
          className={className}
          currentValue={currentValue}
          required={props.required}
          {...props}
        />

        <InputHelperText
          error={error}
          helperText={helperText}
          showCharCount={showCharCount}
          maxLength={maxLength}
          currentLength={String(currentValue).length}
        />
      </div>
    );
  },
);

Input.displayName = "Input";
