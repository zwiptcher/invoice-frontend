import { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    DollarSign, FileCheck, FileClock, Users,
    LogOut, User, Settings, Plus,
    ArrowUpRight, ArrowDownRight, MoreVertical,
    FileText, Calendar, Wallet, AlertCircle, X,
    Loader2, BellRing, Clock
} from 'lucide-react';
import { getDashboardData, logoutUser } from '../services/api';
import LogoutModal from '../components/LogoutModal';

/* ─── Skeleton Loading ─── */
const Skeleton = ({ className }) => (
    <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`} />
);

const StatCardSkeleton = () => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex justify-between items-start mb-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-10 rounded-xl" />
        </div>
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-3 w-16" />
    </div>
);

/* ─── Components ─── */
const StatCard = ({ title, value, icon: Icon, color, subtext, trend }) => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 transition-all hover:shadow-md group">
        <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${color} bg-opacity-10 dark:bg-opacity-20 group-hover:scale-110 transition-transform`}>
                <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
            </div>
            {trend && (
                <span className={`flex items-center gap-0.5 text-xs font-bold px-2 py-1 rounded-full ${trend > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                    {trend > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {Math.abs(trend)}%
                </span>
            )}
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
            {subtext && <p className="text-xs text-gray-400 mt-2">{subtext}</p>}
        </div>
    </div>
);

const UserMenu = ({ user, onLogoutClick }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
                <div className="hidden text-right lg:block">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{user.fullName}</p>
                    <p className="text-[10px] text-gray-500 font-medium capitalize">{user.provider || 'Local'} Account</p>
                </div>
                {user.avatar ? (
                    <img src={user.avatar} alt={user.fullName} className="w-10 h-10 rounded-xl border border-gray-200" />
                ) : (
                    <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center font-bold">
                        {user.fullName[0].toUpperCase()}
                    </div>
                )}
            </button>
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 py-2 z-50 animate-bounce-in">
                        <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700 lg:hidden">
                            <p className="text-sm font-bold text-gray-900 dark:text-white">{user.fullName}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                        <button className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors">
                            <User className="w-4 h-4" /> Profile
                        </button>
                        <button className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors">
                            <Settings className="w-4 h-4" /> Settings
                        </button>
                        <hr className="my-1 border-gray-100 dark:border-gray-700" />
                        <button
                            onClick={() => { setIsOpen(false); onLogoutClick(); }}
                            className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 transition-colors font-medium"
                        >
                            <LogOut className="w-4 h-4" /> Logout
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};


/* ─── Main Page ─── */
const Dashboard = () => {
    const navigate = useNavigate();

    // States
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [toast, setToast] = useState(null);

    const performLogout = useCallback(async (reason) => {
        setIsLoggingOut(true);
        try {
            await logoutUser();
        } catch (e) {
            console.error('Logout API failed:', e);
        }

        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');

        setToast({ message: "Logged out successfully. See you soon! 👋", type: 'success' });

        setTimeout(() => {
            navigate(`/login?message=logout${reason ? `&session=${reason}` : ''}`);
        }, 1000);
    }, [navigate]);

    useEffect(() => {
        // ProtectedRoute handles initial auth presence, we just grad data for UI
        const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
        setCurrentUser(user);
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getDashboardData();
            setData(response.data);
        } catch (err) {
            console.error('Fetch error:', err);
            // 401s handled by Global Interceptor
            if (err.response?.status !== 401) {
                setError('Failed to load dashboard. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading && !data) {
        return (
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex items-center justify-between">
                    <div>
                        <Skeleton className="h-8 w-48 mb-2" />
                        <Skeleton className="h-4 w-64" />
                    </div>
                    <Skeleton className="h-12 w-12 rounded-xl" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCardSkeleton />
                    <StatCardSkeleton />
                    <StatCardSkeleton />
                    <StatCardSkeleton />
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 h-96">
                    <Skeleton className="h-6 w-32 mb-8" />
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mb-6">
                    <AlertCircle className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{error}</h2>
                <button
                    onClick={fetchDashboard}
                    className="mt-4 px-6 py-2.5 bg-violet-600 text-white rounded-xl font-bold hover:bg-violet-700 transition-colors"
                >
                    Retry Loading
                </button>
            </div>
        );
    }

    const { stats, recentActivity, userProfile } = data || {};
    const hasInvoices = recentActivity && recentActivity.length > 0;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 min-h-screen">
            {/* ─── Page Toast (Local actions) ─── */}
            {toast && (
                <div className={`fixed top-6 right-6 z-[200] max-w-sm w-full px-6 py-4 rounded-3xl shadow-2xl border flex items-center gap-4 animate-in slide-in-from-right-8 fade-in
                    ${toast.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-red-50 border-red-100 text-red-800'}`}>
                    <FileCheck className="w-5 h-5 text-emerald-600" />
                    <p className="font-bold text-sm flex-1">{toast.message}</p>
                    <button onClick={() => setToast(null)} className="opacity-40 hover:opacity-100">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* ─── Logout Confirmation Modal ─── */}
            <LogoutModal
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                onConfirm={() => performLogout()}
                isLoggingOut={isLoggingOut}
            />

            {/* ─── Header ─── */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                        Welcome back, {userProfile?.fullName || currentUser?.fullName}! 👋
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Last login: {userProfile?.lastLogin ? new Date(userProfile.lastLogin).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : 'Just now'}
                    </p>
                </div>
            </div>

            {/* ─── Stats ─── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Invoices"
                    value={stats?.totalInvoices || 0}
                    icon={FileText}
                    color="bg-violet-500"
                />
                <StatCard
                    title="Paid Invoices"
                    value={stats?.paidInvoices?.count || 0}
                    icon={FileCheck}
                    color="bg-emerald-500"
                    trend={stats?.paidInvoices?.percentage}
                    subtext={`${stats?.paidInvoices?.percentage || 0}% completion rate`}
                />
                <StatCard
                    title="Total Revenue"
                    value={`$${(stats?.totalRevenue || 0).toLocaleString()}`}
                    icon={DollarSign}
                    color="bg-blue-500"
                />
                <StatCard
                    title="Pending Amount"
                    value={`$${(stats?.pendingAmount || 0).toLocaleString()}`}
                    icon={Wallet}
                    color="bg-amber-500"
                />
            </div>

            {/* ─── Recent Activity / Empty State ─── */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-all hover:shadow-md mb-12">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Activity</h3>
                        <p className="text-xs text-gray-400">Your latest 5 invoices</p>
                    </div>
                    <Link
                        to="/invoices"
                        className="text-sm font-bold text-violet-600 hover:text-violet-700 transition-colors"
                    >
                        View all
                    </Link>
                </div>

                {!hasInvoices ? (
                    <div className="py-16 flex flex-col items-center justify-center text-center px-6">
                        <div className="w-24 h-24 bg-gray-50 dark:bg-gray-900/50 rounded-full flex items-center justify-center mb-6 animate-pulse">
                            <FileClock className="w-12 h-12 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No invoices yet</h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-xs mb-8">Create your first invoice to start tracking your business revenue and clients.</p>
                        <Link
                            to="/invoices/create"
                            className="bg-violet-600 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-violet-700 active:scale-95 transition-all shadow-lg shadow-violet-200"
                        >
                            <Plus className="w-5 h-5" /> Create Invoice
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-900/50 text-[11px] uppercase tracking-wider text-gray-400 font-bold">
                                    <th className="px-6 py-4">Invoice No.</th>
                                    <th className="px-6 py-4">Client</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {recentActivity.map((inv) => (
                                    <tr key={inv.id} className="group hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-sm text-violet-600">#{inv.invoiceNumber}</td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-sm text-gray-900 dark:text-white">{inv.clientName}</p>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-sm text-gray-900 dark:text-white">
                                            ${Number(inv.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wide
                                                ${inv.status === 'paid' ? 'bg-emerald-50 text-emerald-600' :
                                                    inv.status === 'overdue' ? 'bg-red-50 text-red-600' :
                                                        'bg-amber-50 text-amber-600'}`}
                                            >
                                                {inv.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-500">
                                            {new Date(inv.date || inv.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
