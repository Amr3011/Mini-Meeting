import type { SkeletonProps } from "./types";
import { skeletonVariantClasses, skeletonDefaultSizes } from "./loadingConfig";

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = "rectangular",
  width,
  height,
  className = "",
}) => {
  const finalWidth = width || skeletonDefaultSizes[variant].width;
  const finalHeight = height || skeletonDefaultSizes[variant].height;

  return (
    <div
      className={`bg-gray-200 animate-skeleton ${skeletonVariantClasses[variant]} ${className}`}
      style={{ width: finalWidth, height: finalHeight }}
    />
  );
};
