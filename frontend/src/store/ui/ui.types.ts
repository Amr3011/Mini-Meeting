export interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
  duration?: number;
}

export interface Modal {
  id: string;
  isOpen: boolean;
  data?: unknown;
}

export interface UIState {
  toasts: Toast[];
  modals: Record<string, Modal>;
  isLoading: boolean;
  loadingMessage?: string;
}

export interface UIActions {
  showToast: (message: string, type?: Toast["type"], duration?: number) => void;
  hideToast: (id: string) => void;
  openModal: (id: string, data?: unknown) => void;
  closeModal: (id: string) => void;
  setLoading: (isLoading: boolean, message?: string) => void;
}

export type UIStore = UIState & UIActions;
