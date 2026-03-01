import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { UIStore, Toast } from "./ui.types";

export const useUIStore = create<UIStore>()(
  devtools((set) => ({
    toasts: [],
    modals: {},
    isLoading: false,
    loadingMessage: undefined,
    showToast: (message, type = "info", duration = 5000) => {
      const toast: Toast = {
        id: `${Date.now()}-${Math.random()}`,
        message,
        type,
        duration,
      };

      set((state) => ({
        toasts: [...state.toasts, toast],
      }));

      if (duration > 0) {
        setTimeout(() => {
          set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== toast.id),
          }));
        }, duration);
      }
    },

    hideToast: (id) => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    },

    openModal: (id, data) => {
      set((state) => ({
        modals: {
          ...state.modals,
          [id]: { id, isOpen: true, data },
        },
      }));
    },

    closeModal: (id) => {
      set((state) => ({
        modals: {
          ...state.modals,
          [id]: { ...state.modals[id], isOpen: false },
        },
      }));
    },

    setLoading: (isLoading, message) => {
      set({ isLoading, loadingMessage: message });
    },
  })),
);
