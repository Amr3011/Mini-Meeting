interface InputIconsProps {
  error?: string;
  hasValue: boolean;
  isPasswordField: boolean;
  hideValidationIcon: boolean;
}

export const InputIcons: React.FC<InputIconsProps> = ({
  error,
  hasValue,
  isPasswordField,
  hideValidationIcon,
}) => {
  if (error) {
    return (
      <div className="text-danger-500">
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </div>
    );
  }

  if (!hideValidationIcon && hasValue && !isPasswordField) {
    return (
      <div className="text-success-500">
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
    );
  }

  return null;
};
