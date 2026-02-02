import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info' | 'message';

export interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
    avatarUrl?: string;
    title?: string;
    actionPath?: string;
}

interface ToastState {
    toasts: Toast[];
    addToast: (toast: Omit<Toast, 'id'>) => void;
    removeToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
    toasts: [],
    addToast: (toast) => {
        const id = Math.random().toString(36).substring(2, 9);
        const newToast = { ...toast, id };

        set((state) => ({ toasts: [...state.toasts, newToast] }));

        if (toast.duration !== 0) {
            setTimeout(() => {
                set((state) => ({
                    toasts: state.toasts.filter((t) => t.id !== id),
                }));
            }, toast.duration || 4000);
        }
    },
    removeToast: (id) =>
        set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id),
        })),
}));
