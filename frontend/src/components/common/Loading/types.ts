export interface LoadingProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  fullScreen?: boolean;
  type?: "spinner" | "dots" | "pulse" | "bars";
}

export interface SkeletonProps {
  variant?: "text" | "circular" | "rectangular";
  width?: string;
  height?: string;
  className?: string;
}

export interface SkeletonListProps {
  items?: number;
  className?: string;
}

export interface SkeletonTableProps {
  rows?: number;
  className?: string;
}

export interface SkeletonCardProps {
  className?: string;
}
