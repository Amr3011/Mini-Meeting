import { Button } from "../../common/Button";

interface JoinButtonProps {
  isValidFormat: boolean;
  onJoin: () => void;
}

/**
 * Join meeting button with validation tooltip
 */
export const JoinButton = ({ isValidFormat, onJoin }: JoinButtonProps) => (
  <div className="relative group sm:w-auto w-full">
    <Button
      variant="primary"
      size="lg"
      onClick={onJoin}
      disabled={!isValidFormat}
      className="sm:w-auto w-full"
      aria-label="Join meeting"
    >
      Join Meeting
    </Button>
    {!isValidFormat && (
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
        Enter a valid meeting code or URL first
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
      </div>
    )}
  </div>
);
