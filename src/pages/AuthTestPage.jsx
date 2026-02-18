import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    ShieldCheck,
    ShieldAlert,
    Key,
    User,
    Clock,
    Terminal,
    UserPlus,
    LogIn,
    LogOut,
    Bug,
    ArrowRight,
    Loader2,
    Database
} from 'lucide-react';
import { jwtDecode } from 'jwt-decode';

const AuthTestPage = () => {
    const navigate = useNavigate();
    const [authState, setAuthState] = useState({
        isAuthenticated: false,
        token: null,
        expiry: null,
        user: null
    });
    const [logs, setLogs] = useState([]);

    const log = (message, type = 'info') => {
        const entry = {
            id: Date.now(),
            time: new Date().toLocaleTimeString(),
            message,
            type
        };
        setLogs(prev => [entry, ...prev].slice(0, 50));
        console.log(`[AUTH-TEST] [${type.toUpperCase()}] ${message}`);
    };

    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem('authToken');
            const user = JSON.parse(localStorage.getItem('currentUser') || 'null');

            if (token) {
                try {
                    const decoded = jwtDecode(token);
                    setAuthState({
                        isAuthenticated: true,
                        token,
                        expiry: new Date(decoded.exp * 1000).toLocaleString(),
                        user
                    });
                } catch (e) {
                    log('Invalid token found in storage', 'error');
                }
            } else {
                setAuthState({
                    isAuthenticated: false,
                    token: null,
                    expiry: null,
                    user: null
                });
            }
        };

        checkAuth();
        window.addEventListener('storage', checkAuth);
        return () => window.removeEventListener('storage', checkAuth);
    }, []);

    const automateNewUserFlow = () => {
        log('Starting New User Flow Automation...');
        localStorage.setItem('test_automation', JSON.stringify({
            flow: 'new_user',
            email: `test_${Date.now()}@example.com`,
            step: 'email'
        }));
        navigate('/login');
    };

    const automateExistingUserFlow = () => {
        log('Starting Existing User Flow Automation...');
        localStorage.setItem('test_automation', JSON.stringify({
            flow: 'existing_user',
            email: 'existing@example.com',
            step: 'password'
        }));
        navigate('/login');
    };

    const simulateSessionExpiry = () => {
        log('Simulating Session Expiry...');
        try {
            // Create a fake token that is already expired
            const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
            const payload = btoa(JSON.stringify({
                userId: 'fake-id',
                email: 'test@expired.com',
                exp: Math.floor(Date.now() / 1000) - 3600 // 1 hour ago
            }));
            const fakeToken = `${header}.${payload}.signature`;

            localStorage.setItem('authToken', fakeToken);
            log('Injected expired token. Triggering check...', 'warning');

            // Reload to trigger useAuthCheck and ProtectedRoute
            window.location.reload();
        } catch (e) {
            log('Failed to simulate expiry', 'error');
        }
    };

    const clearAuthState = () => {
        log('Clearing local auth state...');
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('test_automation');
        log('Storage cleared', 'success');
        window.location.reload();
    };

    const simulateGoogleOAuth = () => {
        log('Simulating Google OAuth Response...');
        // In a real test, this would trigger the actual Google popup, 
        // but here we'll simulate the successful redirect/post-login state
        log('Injecting mock Google profile data...', 'success');
        localStorage.setItem('currentUser', JSON.stringify({
            fullName: 'Google Test User',
            email: 'google@test.com',
            provider: 'google',
            avatar: null
        }));
        localStorage.setItem('authToken', 'mock-google-jwt-token');
        setTimeout(() => navigate('/dashboard'), 1000);
    };

    return (
        <div className="max-w-6xl mx-auto p-8 space-y-8 animate-in fade-in duration-700">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-violet-600 rounded-2xl text-white">
                    <Bug className="w-8 h-8" />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white mt-1">Auth Debugger</h1>
                    <p className="text-gray-500 font-medium tracking-tight">Development Workspace • Authentication Utilities</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* ─── Auth State Card ─── */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 shadow-xl border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                <Database className="w-5 h-5 text-violet-500" /> Current Auth Context
                            </h2>
                            {authState.isAuthenticated ? (
                                <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold flex items-center gap-2 border border-emerald-100">
                                    <ShieldCheck className="w-4 h-4" /> AUTHENTICATED
                                </span>
                            ) : (
                                <span className="px-4 py-1.5 bg-red-50 text-red-600 rounded-full text-xs font-bold flex items-center gap-2 border border-red-100">
                                    <ShieldAlert className="w-4 h-4" /> UNINITIALIZED
                                </span>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Active Token (JWT)</label>
                                    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 overflow-hidden">
                                        <p className="text-xs font-mono text-gray-500 break-all">
                                            {authState.token ? `${authState.token.substring(0, 40)}...` : 'N/A • Token not found in storage'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                                    <Clock className="w-4 h-4 text-violet-400" />
                                    <span>Expires: {authState.expiry || 'Session inactive'}</span>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3">User Profile Object</label>
                                    {authState.user ? (
                                        <div className="flex items-center gap-4 p-4 bg-violet-50 dark:bg-violet-900/20 rounded-2xl border border-violet-100 dark:border-violet-800/50">
                                            {authState.user.avatar ? (
                                                <img src={authState.user.avatar} className="w-12 h-12 rounded-xl" alt="UI" />
                                            ) : (
                                                <div className="w-12 h-12 rounded-xl bg-violet-600 text-white flex items-center justify-center font-bold text-xl">
                                                    {authState.user.fullName[0]}
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-bold text-sm text-gray-900 dark:text-white">{authState.user.fullName}</p>
                                                <p className="text-xs text-violet-600 dark:text-violet-400 opacity-70">{authState.user.email}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-200 dark:border-gray-700 text-center text-xs text-gray-400 font-medium py-8">
                                            No user data cached
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ─── Control Panel ─── */}
                    <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 shadow-sm border border-gray-100 dark:border-gray-700">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-8">Verification Workbench</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                                onClick={automateNewUserFlow}
                                className="group p-5 bg-violet-50 hover:bg-violet-600 text-violet-600 hover:text-white rounded-3xl transition-all border border-violet-100 flex items-center gap-4 text-left"
                            >
                                <div className="p-3 bg-white group-hover:bg-violet-500 rounded-2xl shadow-sm transition-colors">
                                    <UserPlus className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="font-bold">Automated Sign-Up</p>
                                    <p className="text-xs opacity-70">Pre-fills new user data</p>
                                </div>
                            </button>

                            <button
                                onClick={automateExistingUserFlow}
                                className="group p-5 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white rounded-3xl transition-all border border-blue-100 flex items-center gap-4 text-left"
                            >
                                <div className="p-3 bg-white group-hover:bg-blue-500 rounded-2xl shadow-sm transition-colors">
                                    <LogIn className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="font-bold">Existing User Flow</p>
                                    <p className="text-xs opacity-70">Pre-fills login data</p>
                                </div>
                            </button>

                            <button
                                onClick={simulateGoogleOAuth}
                                className="group p-5 bg-pink-50 hover:bg-pink-600 text-pink-600 hover:text-white rounded-3xl transition-all border border-pink-100 flex items-center gap-4 text-left"
                            >
                                <div className="p-3 bg-white group-hover:bg-pink-500 rounded-2xl shadow-sm transition-colors">
                                    <Globe className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="font-bold">Simulate Google OAuth</p>
                                    <p className="text-xs opacity-70">Verifies OAuth redirect logic</p>
                                </div>
                            </button>

                            <button
                                onClick={simulateSessionExpiry}
                                className="group p-5 bg-amber-50 hover:bg-amber-600 text-amber-600 hover:text-white rounded-3xl transition-all border border-amber-100 flex items-center gap-4 text-left"
                            >
                                <div className="p-3 bg-white group-hover:bg-amber-500 rounded-2xl shadow-sm transition-colors">
                                    <Clock className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="font-bold">Force Session Expiry</p>
                                    <p className="text-xs opacity-70">Simulates JWT timeout</p>
                                </div>
                            </button>

                            <button
                                onClick={clearAuthState}
                                className="group p-5 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white rounded-3xl transition-all border border-red-100 flex items-center gap-4 text-left"
                            >
                                <div className="p-3 bg-white group-hover:bg-red-500 rounded-2xl shadow-sm transition-colors">
                                    <LogOut className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="font-bold">Hard Logout</p>
                                    <p className="text-xs opacity-70">Total cache purge</p>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* ─── Log Console ─── */}
                <div className="bg-gray-900 rounded-[2.5rem] p-8 shadow-2xl flex flex-col h-[600px] border-[12px] border-gray-800">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-800">
                        <h2 className="text-sm font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                            <Terminal className="w-4 h-4" /> Live Events
                        </h2>
                        <button
                            onClick={() => setLogs([])}
                            className="text-[10px] font-bold text-violet-500 hover:text-violet-400"
                        >
                            CLEAR
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-3 font-mono text-[11px] pr-2 scrollbar-thin scrollbar-thumb-gray-800">
                        {logs.length === 0 && (
                            <p className="text-gray-700 italic">Listening for authentication events...</p>
                        )}
                        {logs.map((l) => (
                            <div key={l.id} className="animate-in slide-in-from-left-4 fade-in duration-300">
                                <span className="text-gray-600">[{l.time}]</span>{' '}
                                <span className={`font-bold ${l.type === 'error' ? 'text-red-500' :
                                    l.type === 'success' ? 'text-emerald-500' :
                                        l.type === 'warning' ? 'text-amber-500' :
                                            'text-violet-400'
                                    }`}>
                                    {l.type.toUpperCase()}
                                </span>{' '}
                                <span className="text-gray-300">{l.message}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthTestPage;
