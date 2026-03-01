export interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export interface ToastProps {
  id: string;
  type?: "success" | "error" | "warning" | "info";
  message: string;
  description?: string;
  duration?: number;
  onClose: (id: string) => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ToastContainerProps {
  toasts: Array<Omit<ToastProps, "onClose">>;
  onClose: (id: string) => void;
  position?:
    | "top-right"
    | "top-left"
    | "bottom-right"
    | "bottom-left"
    | "top-center"
    | "bottom-center";
}

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastConfig {
  bgColor: string;
  borderColor: string;
  iconColor: string;
  icon: React.ReactNode;
}
