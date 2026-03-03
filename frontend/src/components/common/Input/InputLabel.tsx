import type { InputLabelProps } from "./types";

export const InputLabel: React.FC<InputLabelProps> = ({
  label,
  inputId,
  required,
  floating,
  isFocused,
  hasValue,
  hasLeftIcon,
}) => {
  if (floating) {
    return (
      <label
        htmlFor={inputId}
        className={`
          absolute transition-all duration-200 pointer-events-none
          ${hasLeftIcon ? "left-10" : "left-3"}
          ${
            isFocused || hasValue
              ? "top-1.5 text-xs text-brand-600 font-medium"
              : "top-1/2 -translate-y-1/2 text-base text-gray-500"
          }
        `}
      >
        {label}
        {required && <span className="text-danger-500 ml-1">*</span>}
      </label>
    );
  }

  return (
    <label
      htmlFor={inputId}
      className="block text-sm font-medium text-gray-700 mb-1.5"
    >
      {label}
      {required && <span className="text-danger-500 ml-1">*</span>}
    </label>
  );
};
