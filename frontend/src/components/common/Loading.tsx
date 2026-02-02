interface LoadingProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  fullScreen?: boolean;
  type?: "spinner" | "dots" | "pulse" | "bars";
}

interface SkeletonProps {
  variant?: "text" | "circular" | "rectangular";
  width?: string;
  height?: string;
  className?: string;
}

export const Loading: React.FC<LoadingProps> = ({
  size = "md",
  text,
  fullScreen = false,
  type = "spinner",
}) => {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  };

  const dotSizes = {
    sm: "w-1.5 h-1.5",
    md: "w-2.5 h-2.5",
    lg: "w-3.5 h-3.5",
  };

  const barSizes = {
    sm: "w-1 h-4",
    md: "w-1.5 h-8",
    lg: "w-2 h-12",
  };

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
            ></div>
          </div>
        );

      case "dots":
        return (
          <div className="flex space-x-2">
            <div
              className={`${dotSizes[size]} bg-brand-500 rounded-full animate-bounce`}
              style={{ animationDelay: "0ms" }}
            ></div>
            <div
              className={`${dotSizes[size]} bg-brand-500 rounded-full animate-bounce`}
              style={{ animationDelay: "150ms" }}
            ></div>
            <div
              className={`${dotSizes[size]} bg-brand-500 rounded-full animate-bounce`}
              style={{ animationDelay: "300ms" }}
            ></div>
          </div>
        );

      case "pulse":
        return (
          <div className="relative">
            <div
              className={`${sizeClasses[size]} bg-brand-500 rounded-full animate-pulse`}
            ></div>
            <div
              className={`${sizeClasses[size]} bg-brand-400 rounded-full absolute inset-0 animate-ping`}
            ></div>
          </div>
        );

      case "bars":
        return (
          <div className="flex items-end space-x-1">
            <div
              className={`${barSizes[size]} bg-brand-500 rounded-sm animate-bounce`}
              style={{ animationDelay: "0ms", animationDuration: "0.6s" }}
            ></div>
            <div
              className={`${barSizes[size]} bg-brand-500 rounded-sm animate-bounce`}
              style={{ animationDelay: "100ms", animationDuration: "0.6s" }}
            ></div>
            <div
              className={`${barSizes[size]} bg-brand-500 rounded-sm animate-bounce`}
              style={{ animationDelay: "200ms", animationDuration: "0.6s" }}
            ></div>
            <div
              className={`${barSizes[size]} bg-brand-500 rounded-sm animate-bounce`}
              style={{ animationDelay: "300ms", animationDuration: "0.6s" }}
            ></div>
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

// Skeleton Loader Component
export const Skeleton: React.FC<SkeletonProps> = ({
  variant = "rectangular",
  width,
  height,
  className = "",
}) => {
  const variantClasses = {
    text: "rounded h-4",
    circular: "rounded-full",
    rectangular: "rounded-lg",
  };

  const defaultSizes = {
    text: { width: "100%", height: "1rem" },
    circular: { width: "3rem", height: "3rem" },
    rectangular: { width: "100%", height: "4rem" },
  };

  const finalWidth = width || defaultSizes[variant].width;
  const finalHeight = height || defaultSizes[variant].height;

  return (
    <div
      className={`bg-gray-200 animate-skeleton ${variantClasses[variant]} ${className}`}
      style={{
        width: finalWidth,
        height: finalHeight,
      }}
    />
  );
};

// Skeleton variants for common use cases
export const SkeletonCard: React.FC<{ className?: string }> = ({
  className = "",
}) => (
  <div className={`bg-white rounded-lg shadow p-6 space-y-4 ${className}`}>
    <div className="flex items-center gap-4">
      <Skeleton variant="circular" width="3rem" height="3rem" />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" width="40%" />
      </div>
    </div>
    <Skeleton variant="rectangular" height="8rem" />
    <div className="space-y-2">
      <Skeleton variant="text" />
      <Skeleton variant="text" width="80%" />
      <Skeleton variant="text" width="90%" />
    </div>
  </div>
);

export const SkeletonTable: React.FC<{ rows?: number; className?: string }> = ({
  rows = 5,
  className = "",
}) => (
  <div className={`space-y-3 ${className}`}>
    {/* Header */}
    <div className="flex gap-4">
      <Skeleton variant="text" width="20%" />
      <Skeleton variant="text" width="30%" />
      <Skeleton variant="text" width="25%" />
      <Skeleton variant="text" width="25%" />
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4 items-center">
        <Skeleton variant="circular" width="2.5rem" height="2.5rem" />
        <Skeleton variant="text" width="20%" />
        <Skeleton variant="text" width="30%" />
        <Skeleton variant="text" width="25%" />
        <Skeleton variant="text" width="25%" />
      </div>
    ))}
  </div>
);

export const SkeletonList: React.FC<{ items?: number; className?: string }> = ({
  items = 3,
  className = "",
}) => (
  <div className={`space-y-4 ${className}`}>
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="flex items-center gap-4">
        <Skeleton variant="circular" width="3rem" height="3rem" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="70%" />
          <Skeleton variant="text" width="50%" />
        </div>
      </div>
    ))}
  </div>
);
