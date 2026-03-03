/**
 * Button variant styles
 * Defines Tailwind classes for each button variant
 */
export const variantClasses = {
  primary:
    "bg-brand-500 text-white hover:bg-brand-600 hover:-translate-y-0.5 hover:shadow-lg focus:ring-brand-500 active:scale-[0.98]",
  secondary:
    "bg-gray-200 text-gray-900 hover:bg-gray-300 hover:-translate-y-0.5 hover:shadow-md focus:ring-gray-500 active:scale-[0.98]",
  danger:
    "bg-danger-500 text-white hover:bg-danger-600 hover:-translate-y-0.5 hover:shadow-lg focus:ring-danger-500 active:scale-[0.98]",
  ghost:
    "bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500 active:scale-[0.98]",
  success:
    "bg-success-500 text-white hover:bg-success-600 hover:-translate-y-0.5 hover:shadow-lg focus:ring-success-500 active:scale-[0.98]",
  gradient:
    "bg-linear-to-r from-brand-500 to-purple-600 text-white hover:from-brand-600 hover:to-purple-700 hover:-translate-y-0.5 hover:shadow-glow focus:ring-brand-500 active:scale-[0.98]",
};

/**
 * Button size styles
 * Defines padding, text size, and gap for each button size
 */
export const sizeClasses = {
  sm: "px-3 py-1.5 text-sm gap-1.5",
  md: "px-4 py-2 text-base gap-2",
  lg: "px-6 py-3 text-lg gap-2.5",
};
