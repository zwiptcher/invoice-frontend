import { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthCheck } from '../hooks/useAuthCheck';
import { Clock, X, Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
    const location = useLocation();
    const [toast, setToast] = useState(null);

    const { isChecking } = useAuthCheck(() => {
        setToast({
            message: "Your session will expire in 5 minutes. Save your work!",
            type: 'warning',
            action: {
                label: "Extend Session",
                onClick: () => setToast(null)
            }
        });
    });

    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('currentUser');

    console.log('[DEBUG] ProtectedRoute Check:', {
        hasToken: !!token,
        hasUser: !!user,
        isChecking,
        path: location.pathname
    });

    if (isChecking) {
        return (
            <div className="fixed inset-0 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 z-[999]">
                <div className="relative">
                    <div className="w-20 h-20 rounded-3xl bg-violet-600/10 flex items-center justify-center animate-pulse">
                        <Loader2 className="w-10 h-10 text-violet-600 animate-spin" />
                    </div>
                </div>
                <p className="mt-4 text-sm font-medium text-gray-500 animate-pulse">Verifying secure session...</p>
            </div>
        );
    }

    if (!token || !user) {
        console.warn('[DEBUG] ProtectedRoute: Missing auth. Redirecting to /login');
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return (
        <>
            {toast && (
                <div className="fixed top-6 right-6 z-[300] max-w-sm w-full px-6 py-4 rounded-3xl shadow-2xl border bg-amber-50 border-amber-100 text-amber-800 flex items-start gap-4 animate-in slide-in-from-right-8 fade-in">
                    <div className="shrink-0 w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                        <Clock className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                        <p className="font-bold text-sm">{toast.message}</p>
                        {toast.action && (
                            <button
                                onClick={toast.action.onClick}
                                className="mt-2 text-xs font-bold uppercase tracking-wider text-amber-700 underline"
                            >
                                {toast.action.label}
                            </button>
                        )}
                    </div>
                    <button onClick={() => setToast(null)} className="opacity-40 hover:opacity-100">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}
            {children}
        </>
    );
};

export default ProtectedRoute;
