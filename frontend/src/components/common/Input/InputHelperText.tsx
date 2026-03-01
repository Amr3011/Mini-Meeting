import type { InputHelperTextProps } from "./types";

export const InputHelperText: React.FC<InputHelperTextProps> = ({
  error,
  helperText,
  showCharCount,
  maxLength,
  currentLength,
}) => (
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
    {showCharCount && maxLength && (
      <p className="text-xs text-gray-400 ml-2">
        {currentLength} / {maxLength}
      </p>
    )}
  </div>
);
