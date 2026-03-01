import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { Logo } from "./Logo";
import { NavLink } from "./NavLink";
import { UserMenu } from "./UserMenu";
import { MobileMenuButton } from "./MobileMenuButton";
import { MobileNavigation } from "./MobileNavigation";
import { getNavLinks } from "./navigationConfig";

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = getNavLinks(user?.role === "admin");

  const handleLogout = () => {
    logout();
    navigate("/login");
    setIsMenuOpen(false);
  };

  const isActiveRoute = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 glass border-b border-white/20 shadow-sm backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Logo />

          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                link={link}
                isActive={isActiveRoute(link.path)}
              />
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <UserMenu
              isOpen={isMenuOpen}
              onToggle={() => setIsMenuOpen(!isMenuOpen)}
              onLogout={handleLogout}
            />
            <MobileMenuButton
              isOpen={isMobileMenuOpen}
              onToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </div>
        </div>

        <MobileNavigation
          isOpen={isMobileMenuOpen}
          navLinks={navLinks}
          isActiveRoute={isActiveRoute}
          onClose={() => setIsMobileMenuOpen(false)}
        />
      </div>
    </header>
  );
};
