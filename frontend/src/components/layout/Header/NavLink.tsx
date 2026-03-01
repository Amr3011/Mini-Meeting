import { Link } from "react-router-dom";
import type { NavLinkProps } from "./types";

export const NavLink: React.FC<NavLinkProps> = ({
  link,
  isActive,
  onClick,
}) => (
  <Link
    to={link.path}
    onClick={onClick}
    className={`
      flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
      transition-all duration-200 relative group
      ${
        isActive
          ? "text-brand-600 bg-brand-50"
          : "text-gray-700 hover:text-brand-600 hover:bg-gray-50"
      }
    `}
  >
    {link.icon}
    <span>{link.label}</span>
    {isActive && (
      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-linear-to-r from-brand-500 to-purple-600 rounded-full" />
    )}
  </Link>
);
