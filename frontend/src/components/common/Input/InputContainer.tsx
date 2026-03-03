import { forwardRef } from "react";
import { RightIcons } from "./RightIcons";
import { LeftIconWrapper } from "./LeftIconWrapper";
import { InputWithLabels } from "./InputWithLabels";
import { StaticLabel } from "./StaticLabel";
import type { InputContainerProps } from "./types";

/**
 * Input container with label, field, and icons
 * Handles layout and positioning of all input elements
 */
export const InputContainer = forwardRef<HTMLInputElement, InputContainerProps>(
  (
    {
      inputId,
      inputType,
      isPasswordField,
      label,
      leftIcon,
      rightIcon,
      error,
      isFocused,
      showPassword,
      hasValue,
      showClear,
      floatingLabel,
      hideValidationIcon,
      handleFocus,
      handleBlur,
      togglePassword,
      handleClear,
      setInternalValue,
      value,
      maxLength,
      className,
      required,
      ...props
    },
    ref,
  ) => {
    return (
      <div className="relative">
        <StaticLabel
          label={label}
          inputId={inputId}
          required={required}
          isFocused={isFocused}
          hasValue={hasValue}
          hasLeftIcon={!!leftIcon}
          floatingLabel={floatingLabel}
        />

        <div className="relative">
          <LeftIconWrapper leftIcon={leftIcon} />

          <InputWithLabels
            ref={ref}
            inputId={inputId}
            inputType={inputType}
            label={label}
            leftIcon={leftIcon}
            rightIcon={rightIcon}
            showClear={showClear}
            error={error}
            isFocused={isFocused}
            floatingLabel={!!floatingLabel}
            isPasswordField={isPasswordField}
            setInternalValue={setInternalValue}
            value={value}
            maxLength={maxLength}
            handleFocus={handleFocus}
            handleBlur={handleBlur}
            className={className}
            required={required}
            hasValue={hasValue}
            {...props}
          />

          <RightIcons
            error={error}
            hasValue={hasValue}
            isPasswordField={isPasswordField}
            hideValidationIcon={!!hideValidationIcon}
            showClear={showClear}
            showPassword={showPassword}
            rightIcon={rightIcon}
            onClear={handleClear}
            onTogglePassword={togglePassword}
          />
        </div>
      </div>
    );
  },
);

InputContainer.displayName = "InputContainer";
