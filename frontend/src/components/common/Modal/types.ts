import type { ReactNode } from "react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  type?: "default" | "info" | "success" | "warning" | "danger";
  glassmorphic?: boolean;
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  footer?: ReactNode;
}

export type ModalSize = "sm" | "md" | "lg" | "xl" | "full";
export type ModalType = "default" | "info" | "success" | "warning" | "danger";
