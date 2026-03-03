import { Skeleton } from "./Skeleton";
import type { SkeletonCardProps } from "./types";

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
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
