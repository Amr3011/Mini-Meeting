import { forwardRef } from "react";
import { InputLabel } from "./InputLabel";
import { InputField } from "./InputField";

interface InputWithLabelsProps extends React.InputHTMLAttributes<HTMLInputElement> {
  inputId: string;
  inputType: string;
  label?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showClear: boolean;
  error?: string;
  isFocused: boolean;
  floatingLabel: boolean;
  isPasswordField: boolean;
  setInternalValue: (value: string) => void;
  maxLength?: number;
  handleFocus: () => void;
  handleBlur: () => void;
  required?: boolean;
  hasValue: boolean;
}

/**
 * Input field with floating and static labels
 * Combines InputField with optional labels
 */
export const InputWithLabels = forwardRef<
  HTMLInputElement,
  InputWithLabelsProps
>(
  (
    {
      inputId,
      inputType,
      label,
      leftIcon,
      rightIcon,
      showClear,
      error,
      isFocused,
      floatingLabel,
      isPasswordField,
      setInternalValue,
      value,
      maxLength,
      handleFocus,
      handleBlur,
      className,
      required,
      hasValue,
      ...props
    },
    ref,
  ) => (
    <>
      <InputField
        ref={ref}
        inputId={inputId}
        inputType={inputType}
        leftIcon={leftIcon}
        rightIcon={rightIcon}
        showClear={showClear}
        error={error}
        isFocused={isFocused}
        floatingLabel={floatingLabel}
        isPasswordField={isPasswordField}
        setInternalValue={setInternalValue}
        value={value}
        maxLength={maxLength}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={className}
        {...props}
      />

      {label && floatingLabel && (
        <InputLabel
          label={label}
          inputId={inputId}
          required={required}
          floating={true}
          isFocused={isFocused}
          hasValue={hasValue}
          hasLeftIcon={!!leftIcon}
        />
      )}
    </>
  ),
);

InputWithLabels.displayName = "InputWithLabels";
