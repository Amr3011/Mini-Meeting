interface ClearButtonProps {
  show: boolean;
  onClick: () => void;
}

export const ClearButton: React.FC<ClearButtonProps> = ({ show, onClick }) => {
  if (!show) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      className="text-gray-400 hover:text-gray-600 transition-colors"
      tabIndex={-1}
    >
      <svg
        className="w-4 h-4"
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
    </button>
  );
};
