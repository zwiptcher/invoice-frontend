import { useState, useEffect, useCallback } from 'react';
import { LayoutDashboard, FileText, PlusCircle, PieChart, Moon, Sun, BarChart2, LogOut, User, Settings, ChevronRight } from 'lucide-react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { logoutUser } from '../services/api';
import LogoutModal from './LogoutModal';

const Sidebar = () => {
    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: FileText, label: 'Invoices', path: '/invoices' },
        { icon: PlusCircle, label: 'New Invoice', path: '/invoices/create' },
        { icon: BarChart2, label: 'Analytics', path: '/analytics' },
    ];

    const { theme, toggleTheme } = useTheme();
    const [user, setUser] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
        setUser(storedUser);
    }, []);

    const handleLogout = useCallback(async () => {
        setIsLoggingOut(true);
        try {
            await logoutUser();
        } catch (e) {
            console.error('Logout API failed:', e);
        }
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        setIsLoggingOut(false);
        setIsLogoutModalOpen(false);
        navigate('/login?message=logout');
    }, [navigate]);

    return (
        <>
            <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-screen fixed left-0 top-0 hidden md:flex flex-col transition-colors duration-200 z-50">
                <div className="p-6 flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                        <PieChart className="w-5 h-5 text-white" />
                    </div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">InvoiceMgr</h1>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                    ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 font-medium'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200'
                                }`
                            }
                        >
                            <item.icon className="w-5 h-5" />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
                    <button
                        onClick={toggleTheme}
                        className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                    </button>

                    {user && (
                        <div className="relative">
                            {isMenuOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
                                    <div className="absolute bottom-full left-0 mb-2 w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 py-2 z-50 animate-in slide-in-from-bottom-2 fade-in duration-200">
                                        <Link
                                            to="/settings"
                                            className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            <User className="w-4 h-4" /> Profile
                                        </Link>
                                        <Link
                                            to="/settings"
                                            className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            <Settings className="w-4 h-4" /> Settings
                                        </Link>
                                        <hr className="my-1 border-gray-100 dark:border-gray-700" />
                                        <button
                                            onClick={() => { setIsMenuOpen(false); setIsLogoutModalOpen(true); }}
                                            className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 transition-colors font-bold"
                                        >
                                            <LogOut className="w-4 h-4" /> Logout
                                        </button>
                                    </div>
                                </>
                            )}
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all border ${isMenuOpen ? 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600' : 'bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700/30'}`}
                            >
                                {user.avatar ? (
                                    <img src={user.avatar} alt={user.fullName} className="w-9 h-9 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm" />
                                ) : (
                                    <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm shrink-0">
                                        {user.fullName?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                )}
                                <div className="flex-1 min-w-0 text-left">
                                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">{user.fullName}</p>
                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium truncate uppercase tracking-tight">
                                        {user.provider || 'Local'} Account
                                    </p>
                                </div>
                                <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${isMenuOpen ? '-rotate-90' : ''}`} />
                            </button>
                        </div>
                    )}
                </div>
            </aside>

            <LogoutModal
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                onConfirm={handleLogout}
                isLoggingOut={isLoggingOut}
            />
        </>
    );
};
export default Sidebar;
