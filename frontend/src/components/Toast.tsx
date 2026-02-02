import React from 'react';
import { useToastStore, Toast as ToastType } from '@/store/toastStore';
import { X, CheckCircle, AlertCircle, Info, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ToastContainer: React.FC = () => {
    const { toasts, removeToast } = useToastStore();

    return (
        <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
            ))}
        </div>
    );
};

const ToastItem: React.FC<{ toast: ToastType; onClose: () => void }> = ({ toast, onClose }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        if (toast.actionPath) {
            navigate(toast.actionPath);
            onClose();
        }
    };

    const getIcon = () => {
        switch (toast.type) {
            case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'error': return <AlertCircle className="w-5 h-5 text-red-500" />;
            case 'message': return <MessageCircle className="w-5 h-5 text-primary-purple" />;
            default: return <Info className="w-5 h-5 text-blue-500" />;
        }
    };

    return (
        <div
            className={`
                pointer-events-auto bg-white rounded-lg shadow-lg border border-gray-100 
                p-4 min-w-[300px] max-w-sm animate-slide-in-right cursor-pointer
                hover:shadow-xl transition-shadow flex items-start gap-3
            `}
            onClick={handleClick}
        >
            {/* Avatar or Icon */}
            {toast.avatarUrl ? (
                <img
                    src={toast.avatarUrl}
                    alt="Avatar"
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                />
            ) : (
                <div className="flex-shrink-0 mt-1">{getIcon()}</div>
            )}

            <div className="flex-1 min-w-0">
                {toast.title && (
                    <h4 className="font-semibold text-gray-900 text-sm">{toast.title}</h4>
                )}
                <p className="text-gray-600 text-sm break-words line-clamp-2">{toast.message}</p>
            </div>

            <button
                onClick={(e) => { e.stopPropagation(); onClose(); }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};
