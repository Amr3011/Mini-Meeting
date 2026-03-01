import { Link } from "react-router-dom";
import type { MobileNavigationProps } from "./types";

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  isOpen,
  navLinks,
  isActiveRoute,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="md:hidden py-4 border-t border-gray-200/50 animate-slide-down">
      <nav className="space-y-1">
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`
              flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
              transition-all duration-200
              ${
                isActiveRoute(link.path)
                  ? "text-brand-600 bg-brand-50"
                  : "text-gray-700 hover:text-brand-600 hover:bg-gray-50"
              }
            `}
            onClick={onClose}
          >
            {link.icon}
            <span>{link.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};
