import { Toast } from "./Toast";
import type { ToastContainerProps } from "./types";
import { positionClasses } from "./toastConfig";

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onClose,
  position = "top-right",
}) => (
  <div className={`fixed ${positionClasses[position]} z-50`}>
    {toasts.map((toast) => (
      <Toast key={toast.id} {...toast} onClose={onClose} />
    ))}
  </div>
);
