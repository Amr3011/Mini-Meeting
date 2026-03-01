export interface NavLinkItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

export interface NavLinkProps {
  link: NavLinkItem;
  isActive: boolean;
  onClick?: () => void;
}

export interface UserMenuProps {
  isOpen: boolean;
  onToggle: () => void;
  onLogout: () => void;
}

export interface MobileMenuButtonProps {
  isOpen: boolean;
  onToggle: () => void;
}

export interface MobileNavigationProps {
  isOpen: boolean;
  navLinks: NavLinkItem[];
  isActiveRoute: (path: string) => boolean;
  onClose: () => void;
}
