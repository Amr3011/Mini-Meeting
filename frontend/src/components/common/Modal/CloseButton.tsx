interface CloseButtonProps {
  onClose: () => void;
  withTitle: boolean;
}

export const CloseButton: React.FC<CloseButtonProps> = ({
  onClose,
  withTitle,
}) => (
  <button
    onClick={onClose}
    className={`${withTitle ? "" : "absolute top-4 right-4 z-10"} text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500`}
    aria-label="Close modal"
  >
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  </button>
);
