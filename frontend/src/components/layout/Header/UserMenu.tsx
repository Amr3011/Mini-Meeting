import { useAuth } from "../../../hooks/useAuth";
import { useClickOutside } from "./useClickOutside";
import type { UserMenuProps } from "./types";

export const UserMenu: React.FC<UserMenuProps> = ({
  isOpen,
  onToggle,
  onLogout,
}) => {
  const { user } = useAuth();
  const dropdownRef = useClickOutside<HTMLDivElement>(isOpen, () => onToggle());

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={onToggle}
        className="flex items-center gap-2 p-1.5 pr-3 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all duration-200"
      >
        <div className="relative">
          {user?.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.name}
              className="w-9 h-9 rounded-full object-cover shadow-md"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-linear-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm shadow-md">
              {user?.name.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-success-500 border-2 border-white rounded-full" />
        </div>
        <span className="hidden md:block text-sm font-medium text-gray-900">
          {user?.name}
        </span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl py-2 z-50 border border-gray-200 animate-scale-up">
          <div className="px-4 py-3 border-b border-gray-200/50">
            <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-600 mt-0.5">{user?.email}</p>
            {user?.role === "admin" && (
              <span className="inline-flex items-center gap-1 mt-2 px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-md">
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                Admin
              </span>
            )}
          </div>
          <div className="pt-1">
            <button
              onClick={onLogout}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-danger-600 hover:bg-danger-50 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
