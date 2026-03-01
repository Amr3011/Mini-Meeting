interface LeftIconWrapperProps {
  leftIcon: React.ReactNode;
}

/**
 * Left icon wrapper for input
 * Positions icon inside input field
 */
export const LeftIconWrapper = ({ leftIcon }: LeftIconWrapperProps) =>
  leftIcon ? (
    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
      {leftIcon}
    </div>
  ) : null;
