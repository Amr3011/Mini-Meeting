import { Skeleton } from "./Skeleton";
import type { SkeletonTableProps } from "./types";

export const SkeletonTable: React.FC<SkeletonTableProps> = ({
  rows = 5,
  className = "",
}) => (
  <div className={`space-y-3 ${className}`}>
    <div className="flex gap-4">
      <Skeleton variant="text" width="20%" />
      <Skeleton variant="text" width="30%" />
      <Skeleton variant="text" width="25%" />
      <Skeleton variant="text" width="25%" />
    </div>
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
