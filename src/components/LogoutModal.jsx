import { LogOut, Loader2 } from 'lucide-react';

const LogoutModal = ({ isOpen, onClose, onConfirm, isLoggingOut }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={isLoggingOut ? null : onClose} />
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-white/20 z-10 animate-in zoom-in-95 fade-in slide-in-from-bottom-8 duration-300">
                <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-2xl flex items-center justify-center mb-6">
                    <LogOut className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Are you sure you want to logout?</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 leading-relaxed">You will need to enter your credentials again to access your invoices and dashboard.</p>
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={isLoggingOut}
                        className="flex-1 px-6 py-3 rounded-2xl text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoggingOut}
                        className="flex-1 px-6 py-3 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-red-200 dark:shadow-none disabled:opacity-70"
                    >
                        {isLoggingOut ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Logout'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LogoutModal;
