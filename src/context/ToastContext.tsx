import React, { useState, useCallback, createContext, useContext } from 'react';

interface ToastContextValue {
    addToast: (toast: { type: string; message: string; }) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
    const [toasts, setToasts] = useState<{ id: number; type: string; message: string; }[]>([]);

    const addToast = useCallback((toast: { type: string; message: string; }) => {
        const id = Date.now();
        setToasts(prev => [...prev, { ...toast, id }]);
        setTimeout(() => {
            setToasts(current => current.filter(t => t.id !== id));
        }, 5000);
    }, []);

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className="toast-container">
                {toasts.map(toast => (
                    <div key={toast.id} className={`toast toast-${toast.type}`}>
                        {toast.message}
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToasts = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToasts must be used within a ToastProvider');
    }
    return context;
};
