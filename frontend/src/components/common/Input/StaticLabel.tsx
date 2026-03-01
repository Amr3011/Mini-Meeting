import { InputLabel } from "./InputLabel";

interface StaticLabelProps {
  label?: string;
  inputId: string;
  required?: boolean;
  isFocused: boolean;
  hasValue: boolean;
  hasLeftIcon: boolean;
  floatingLabel?: boolean;
}

/**
 * Renders static (non-floating) label if needed
 */
export const StaticLabel = ({
  label,
  inputId,
  required,
  isFocused,
  hasValue,
  hasLeftIcon,
  floatingLabel,
}: StaticLabelProps) => {
  if (!label || floatingLabel) return null;

  return (
    <InputLabel
      label={label}
      inputId={inputId}
      required={required}
      floating={false}
      isFocused={isFocused}
      hasValue={hasValue}
      hasLeftIcon={hasLeftIcon}
    />
  );
};
