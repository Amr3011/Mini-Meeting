import { Skeleton } from "./Skeleton";
import type { SkeletonListProps } from "./types";

export const SkeletonList: React.FC<SkeletonListProps> = ({
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
