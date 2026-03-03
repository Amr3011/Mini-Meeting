import type { LoadingProps } from "./types";
import { sizeClasses, dotSizes, barSizes } from "./loadingConfig";

export const LoadingSpinner: React.FC<LoadingProps> = ({
  size = "md",
  text,
  fullScreen = false,
  type = "spinner",
}) => {
  const containerClasses = fullScreen
    ? "flex flex-col items-center justify-center min-h-screen bg-gray-50"
    : "flex flex-col items-center justify-center p-8";

  const renderSpinner = () => {
    switch (type) {
      case "spinner":
        return (
          <div className="relative">
            <div
              className={`animate-spin rounded-full border-4 border-gray-200 border-t-brand-500 ${sizeClasses[size]}`}
            />
          </div>
        );

      case "dots":
        return (
          <div className="flex space-x-2">
            {[0, 150, 300].map((delay, idx) => (
              <div
                key={idx}
                className={`${dotSizes[size]} bg-brand-500 rounded-full animate-bounce`}
                style={{ animationDelay: `${delay}ms` }}
              />
            ))}
          </div>
        );

      case "pulse":
        return (
          <div className="relative">
            <div
              className={`${sizeClasses[size]} bg-brand-500 rounded-full animate-pulse`}
            />
            <div
              className={`${sizeClasses[size]} bg-brand-400 rounded-full absolute inset-0 animate-ping`}
            />
          </div>
        );

      case "bars":
        return (
          <div className="flex items-end space-x-1">
            {[0, 100, 200, 300].map((delay, idx) => (
              <div
                key={idx}
                className={`${barSizes[size]} bg-brand-500 rounded-sm animate-bounce`}
                style={{
                  animationDelay: `${delay}ms`,
                  animationDuration: "0.6s",
                }}
              />
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={containerClasses}>
      {renderSpinner()}
      {text && (
        <p className="mt-4 text-gray-600 font-medium animate-pulse">{text}</p>
      )}
    </div>
  );
};
