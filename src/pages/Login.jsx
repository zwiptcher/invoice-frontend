import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import {
    Eye, EyeOff, Mail, Lock, Sparkles, Globe, Bell,
    FileText, CheckCircle, ChevronRight, Star, ArrowLeft, User, AlertCircle
} from 'lucide-react';
import apiService from '../services/api';

/* ─── Floating Invoice Card (unchanged) ─── */
const FloatingCard = ({ className, invoice }) => (
    <div className={`absolute bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 shadow-2xl animate-pulse-shadow ${className}`}>
        <div className="flex items-center justify-between mb-3">
            <div>
                <p className="text-white/60 text-xs">Invoice</p>
                <p className="text-white font-bold text-sm">{invoice.id}</p>
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${invoice.statusClass}`}>
                {invoice.status}
            </span>
        </div>
        <p className="text-white/80 text-xs mb-1">{invoice.client}</p>
        <p className="text-white font-bold text-lg">{invoice.amount}</p>
        <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${invoice.barClass}`} style={{ width: invoice.progress }} />
        </div>
    </div>
);

/* ─── Feature Item (unchanged) ─── */
const Feature = ({ icon: Icon, text }) => (
    <div className="flex items-center gap-3 group">
        <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 group-hover:bg-white/20 transition-colors">
            <Icon className="w-4.5 h-4.5 text-white" />
        </div>
        <span className="text-white/85 text-sm font-medium">{text}</span>
        <ChevronRight className="w-4 h-4 text-white/30 ml-auto group-hover:text-white/60 transition-colors" />
    </div>
);

/* ─── Google Icon (unchanged) ─── */
const GoogleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
);

const Login = () => {
    const navigate = useNavigate();
    const pwRef = useRef(null);

    // States
    const [step, setStep] = useState('email'); // email | password | new_user
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [userData, setUserData] = useState(null);

    const [showPw, setShowPw] = useState(false);
    const [remember, setRemember] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [shake, setShake] = useState(false);
    const [toast, setToast] = useState(null); // { message, type }

    // Auto-focus password field when transitioning to password step
    useEffect(() => {
        if (step === 'password' && pwRef.current) {
            pwRef.current.focus();
        }
    }, [step]);

    // Check for logout or session expiry message
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const message = params.get('message');
        const session = params.get('session');

        const emailParam = params.get('email');
        if (emailParam && !email) {
            setEmail(emailParam);
        }

        if (session === 'expired' && !toast) {
            setToast({ message: "Session expired. Please login again. 🔒", type: 'error' });
            window.history.replaceState({}, document.title, window.location.pathname);
        } else if (message === 'logout' && !toast) {
            setToast({ message: "Logged out successfully. See you soon! 👋", type: 'success' });
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, [toast]);

    // Debug Automation Hook
    useEffect(() => {
        const automationData = JSON.parse(localStorage.getItem('test_automation') || 'null');
        if (!automationData) return;

        const runAutomation = async () => {
            if (automationData.flow === 'new_user' || automationData.flow === 'existing_user') {
                if (step === 'email') {
                    setEmail(automationData.email);
                    setTimeout(() => handleContinue(), 800);
                } else if (step === 'password' && automationData.flow === 'existing_user') {
                    setPassword('password123'); // Default test password
                    setTimeout(() => {
                        const form = document.querySelector('form');
                        if (form) form.requestSubmit();
                    }, 800);
                    localStorage.removeItem('test_automation');
                } else if (step === 'new_user' && automationData.flow === 'new_user') {
                    // Automatically click the 'Create New Account' button
                    setTimeout(() => {
                        const registerLink = document.querySelector('a[href*="/register"]');
                        if (registerLink) registerLink.click();
                    }, 800);
                }
            }
        };

        runAutomation();
    }, [step]);

    const validateEmail = () => {
        if (!email.trim()) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Invalid email address';
        return null;
    };

    const handleContinue = async (e) => {
        if (e) e.preventDefault();
        const err = validateEmail();
        if (err) { setErrors({ email: err }); return; }

        setLoading(true);
        setErrors({});

        try {
            const { data } = await apiService.post('/auth/check-email', { email });
            if (data.exists) {
                setUserData(data.user);
                setStep('password');
            } else {
                setStep('new_user');
            }
        } catch (err) {
            setErrors({ email: err.response?.data?.error || 'Failed to check account. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!password) { setErrors({ password: 'Password is required' }); return; }

        setLoading(true);
        setErrors({});

        try {
            const { data } = await apiService.post('/auth/login', {
                email,
                password,
                rememberMe: remember
            });

            // On SUCCESS
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('currentUser', JSON.stringify(data.user));

            console.log('[DEBUG] Login successful. Data:', data);
            setToast({ message: `Success! Entering your dashboard... 🚀`, type: 'success' });

            // Robust navigation
            setTimeout(() => {
                console.log('[DEBUG] Triggering navigation to /dashboard');
                navigate('/dashboard');

                // Absolute fallback if SPA navigation fails
                setTimeout(() => {
                    if (window.location.pathname !== '/dashboard') {
                        console.log('[DEBUG] SPA navigation failed or was interrupted, falling back to window.location');
                        window.location.href = '/dashboard';
                    }
                }, 1000);
            }, 600);

        } catch (err) {
            setLoading(false);
            if (err.response?.status === 401) {
                // Incorrect password
                setErrors({ password: 'Incorrect password. Please try again.' });
                setShake(true);
                setPassword('');
                setTimeout(() => {
                    setShake(false);
                    if (pwRef.current) pwRef.current.focus();
                }, 400);
            } else if (err.response?.status === 500) {
                const detailedError = err.response?.data?.details || err.response?.data?.error || 'Server error';
                setToast({ message: `Something went wrong: ${detailedError}`, type: 'error' });
            } else if (!err.response) {
                setToast({ message: 'Connection failed. Check your internet.', type: 'error' });
            } else {
                setErrors({ password: err.response?.data?.error || 'Login failed.' });
            }
        }
    };

    const handleGoogleSuccess = async (response) => {
        setLoading(true);
        try {
            const { data } = await apiService.post('/auth/google', {
                credential: response.credential,
                action: 'login'
            });

            localStorage.setItem('authToken', data.token);
            localStorage.setItem('currentUser', JSON.stringify(data.user));

            console.log('[DEBUG] Google Login successful. Data:', data);
            setToast({ message: `Google Sign-in Success! 🌐`, type: 'success' });

            setTimeout(() => {
                console.log('[DEBUG] Navigating to /dashboard');
                navigate('/dashboard');

                setTimeout(() => {
                    if (window.location.pathname !== '/dashboard') {
                        window.location.href = '/dashboard';
                    }
                }, 1000);
            }, 600);
        } catch (err) {
            setToast({ message: 'Google sign-in failed. Please try again.', type: 'error' });
            console.error('Google Login Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setStep('email');
        setErrors({});
        setPassword('');
        setUserData(null);
    };

    const invoiceCards = [
        {
            id: '#INV-2401', client: 'Acme Corporation', amount: '$4,200.00', status: 'Paid',
            statusClass: 'bg-emerald-400/20 text-emerald-300', progress: '100%', barClass: 'bg-emerald-400',
            className: 'w-48 top-[2%] -left-[4%] animate-float-1 z-0'
        },
        {
            id: '#INV-2402', client: 'Globex Corp', amount: '$1,850.50', status: 'Pending',
            statusClass: 'bg-amber-400/20 text-amber-300', progress: '60%', barClass: 'bg-amber-400',
            className: 'w-44 top-[25%] -right-[12%] animate-float-2 z-0 hidden xl:block'
        },
        {
            id: '#INV-2403', client: 'Initech LLC', amount: '$9,100.00', status: 'Overdue',
            statusClass: 'bg-red-400/20 text-red-300', progress: '30%', barClass: 'bg-red-400',
            className: 'w-48 bottom-[2%] -left-[2%] animate-float-3 z-0'
        },
    ];

    return (
        <div className="bg-gray-50 min-h-screen relative overflow-hidden">
            {/* Toast Notification */}
            {toast && (
                <div className={`fixed top-6 right-6 z-[100] px-6 py-3.5 rounded-2xl shadow-2xl border flex items-center gap-3 animate-slide-in
                    ${toast.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-red-50 border-red-100 text-red-800'}`}>
                    {toast.type === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 text-red-600" />}
                    <span className="font-semibold text-sm">{toast.message}</span>
                </div>
            )}

            <style>{`
                @keyframes float-1 { 0%, 100% { transform: translate(0, 0) rotate(0deg); } 33% { transform: translate(10px, -15px) rotate(1deg); } 66% { transform: translate(-5px, -25px) rotate(-1deg); } }
                @keyframes float-2 { 0%, 100% { transform: translate(0, 0) rotate(0deg); } 50% { transform: translate(-12px, -20px) rotate(-1.5deg); } }
                @keyframes float-3 { 0%, 100% { transform: translate(0, 0) rotate(0deg); } 50% { transform: translate(15px, -18px) rotate(1.2deg); } }
                @keyframes pulse-shadow { 0%, 100% { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); } 50% { box-shadow: 0 35px 60px -15px rgba(124, 58, 237, 0.4); } }
                @keyframes slideDownIn { from { opacity: 0; transform: translateY(-15px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-8px); } 50% { transform: translateX(8px); } 75% { transform: translateX(-8px); } }
                .animate-float-1 { animation: float-1 8s ease-in-out infinite; }
                .animate-float-2 { animation: float-2 7s ease-in-out infinite; }
                .animate-float-3 { animation: float-3 9s ease-in-out infinite; }
                .animate-pulse-shadow { animation: pulse-shadow 4s ease-in-out infinite; }
                .animate-slide-in { animation: slideDownIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                .animate-shake { animation: shake 0.4s ease-in-out; }
            `}</style>

            <div className="min-h-screen flex flex-col lg:flex-row">
                {/* ══════════════ LEFT SIDE ══════════════ */}
                <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-violet-700 via-purple-700 to-blue-700 flex-col overflow-hidden">
                    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
                        <div className="absolute top-[-10%] left-[-10%] w-80 h-80 bg-violet-500 rounded-full blur-3xl opacity-30" />
                        <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-blue-500 rounded-full blur-3xl opacity-30" />
                        {invoiceCards.map((card, i) => (
                            <FloatingCard key={i} className={`${card.className} opacity-30 group-hover:opacity-50 transition-opacity duration-700 scale-[0.85]`} invoice={card} />
                        ))}
                    </div>

                    <div className="relative z-10 flex flex-col h-full">
                        <div className="p-8 flex items-center gap-3">
                            <div className="w-9 h-9 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center border border-white/30 text-white"><FileText className="w-5 h-5" /></div>
                            <span className="text-white font-bold text-lg tracking-tight">InvoiceFlow</span>
                        </div>

                        <div className="flex-1 flex flex-col justify-center px-16 pb-12">
                            <div className="mb-10">
                                <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-6 text-white text-xs font-medium"><Sparkles className="w-3.5 h-3.5 text-yellow-300" />AI-Powered Platform</div>
                                <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-4 drop-shadow-sm">Welcome Back to<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300">InvoiceFlow</span></h1>
                                <p className="text-white/70 text-base leading-relaxed max-w-sm">Manage your invoices with AI-powered automation. Save time, get paid faster.</p>
                            </div>

                            <div className="space-y-4 mb-12">
                                <Feature icon={Sparkles} text="AI-Powered Invoice Generation" />
                                <Feature icon={Globe} text="Multi-Currency Support" />
                                <Feature icon={Bell} text="Automated Payment Reminders" />
                            </div>

                            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 max-w-md shadow-xl">
                                <div className="flex gap-1 mb-4">{[...Array(5)].map((_, i) => (<Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />))}</div>
                                <p className="text-white/90 text-sm italic leading-relaxed mb-4">"This tool saved me 10 hours a week. Invoice generation is instant and the AI suggestions are spot on."</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-400 to-violet-400 flex items-center justify-center text-white text-xs font-bold ring-2 ring-white/20">JD</div>
                                    <div><p className="text-white text-xs font-semibold">John Doe</p><p className="text-white/50 text-xs">Freelance Designer</p></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ══════════════ RIGHT SIDE ══════════════ */}
                <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 px-6 py-12 overflow-y-auto">
                    <div className="w-full max-w-[420px] bg-white rounded-3xl p-8 lg:p-10 shadow-xl border border-gray-100 animate-slide-in">
                        {/* Header Container */}
                        <div className="mb-8">
                            {/* Logo for mobile */}
                            <div className="flex items-center gap-2 mb-8 lg:hidden">
                                <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-blue-600 rounded-xl flex items-center justify-center text-white"><FileText className="w-4 h-4" /></div>
                                <span className="font-bold text-gray-900">InvoiceFlow</span>
                            </div>

                            {/* Step 1: Email Header */}
                            {step === 'email' && (
                                <div className="animate-slide-in">
                                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign In</h2>
                                    <p className="text-gray-500 text-sm">Enter your email to access your account</p>
                                </div>
                            )}

                            {/* Step 2A: Existing User Greeting */}
                            {step === 'password' && userData && (
                                <div className="animate-slide-in flex flex-col items-center text-center">
                                    <div className="w-20 h-20 rounded-full bg-violet-100 flex items-center justify-center border-4 border-white shadow-md mb-4 overflow-hidden">
                                        {userData.avatar ? (
                                            <img src={userData.avatar} alt={userData.fullName} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="text-violet-600 font-bold text-2xl uppercase">{userData.fullName[0]}</div>
                                        )}
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome back, {userData.fullName.split(' ')[0]}!</h2>
                                    <p className="text-gray-500 text-sm">{userData.email}</p>
                                </div>
                            )}

                            {/* Step 2B: New User Header */}
                            {step === 'new_user' && (
                                <div className="animate-slide-in flex flex-col items-center text-center">
                                    <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 mb-4 text-2xl">👋</div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Looks like you're new here!</h2>
                                    <p className="text-gray-500 text-sm px-4">Create an account to start managing your invoices with AI.</p>
                                </div>
                            )}
                        </div>

                        {/* Forms */}
                        <div className="space-y-6">
                            {/* STEP 1: Email Form */}
                            {step === 'email' && (
                                <form onSubmit={handleContinue} className="space-y-6">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-gray-700 ml-1">Email Address</label>
                                        <div className="relative group">
                                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400 group-focus-within:text-violet-500 transition-colors" />
                                            <input
                                                type="email" value={email} onChange={e => { setEmail(e.target.value); setErrors({}); }}
                                                placeholder="you@company.com"
                                                className={`w-full pl-11 pr-4 py-3.5 rounded-xl border text-sm text-gray-900 transition-all outline-none
                                                    ${errors.email ? 'border-red-400 bg-red-50 focus:ring-4 focus:ring-red-100' : 'border-gray-200 bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-100'}`}
                                            />
                                        </div>
                                        {errors.email && <p className="text-xs text-red-500 flex items-center gap-1.5 ml-1 mt-1.5 animate-slide-in"><AlertCircle className="w-3.5 h-3.5" />{errors.email}</p>}
                                    </div>

                                    <button type="submit" disabled={loading}
                                        className="w-full py-4 bg-gradient-to-r from-violet-600 to-blue-600 text-white rounded-xl font-bold text-sm hover:from-violet-700 hover:to-blue-700 active:scale-[0.98] transition-all shadow-lg shadow-violet-200 disabled:opacity-70 flex items-center justify-center gap-3">
                                        {loading ? <><div className="w-4.5 h-4.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Processing...</> : <>Continue <ChevronRight className="w-4.5 h-4.5" /></>}
                                    </button>

                                    <div className="relative py-2"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-3 text-gray-400 font-medium">OR</span></div></div>

                                    <div className="flex justify-center w-full overflow-hidden rounded-xl border border-gray-100 hover:border-gray-200 transition-all">
                                        <GoogleLogin
                                            onSuccess={handleGoogleSuccess}
                                            onError={() => setToast({ message: 'Google sign-in failed', type: 'error' })}
                                            useOneTap
                                            width="100%"
                                            text="signin_with"
                                            shape="rectangular"
                                            theme="outline"
                                        />
                                    </div>

                                    <p className="text-center text-sm text-gray-500 pt-2">Don't have an account? <Link to="/register" className="text-violet-600 font-bold hover:underline">Register free</Link></p>
                                </form>
                            )}

                            {/* STEP 2A: Password Form */}
                            {step === 'password' && (
                                <form onSubmit={handleLogin} className="space-y-6 animate-slide-in">
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between items-center ml-1">
                                            <label className="text-sm font-medium text-gray-700">Password</label>
                                            <button type="button" className="text-xs text-violet-600 font-bold hover:underline py-1 px-2 hover:bg-violet-50 rounded-lg transition-all">Forgot Password?</button>
                                        </div>
                                        <div className={`relative group ${shake ? 'animate-shake' : ''}`}>
                                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400 group-focus-within:text-violet-500 transition-colors" />
                                            <input
                                                ref={pwRef} type={showPw ? 'text' : 'password'} value={password} onChange={e => { setPassword(e.target.value); setErrors({}); }}
                                                placeholder="••••••••"
                                                disabled={loading}
                                                className={`w-full pl-11 pr-12 py-3.5 rounded-xl border text-sm text-gray-900 transition-all outline-none
                                                    ${errors.password ? 'border-red-400 bg-red-50 focus:ring-4 focus:ring-red-100' : 'border-gray-200 bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-100'}`}
                                            />
                                            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                                                {showPw ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                                            </button>
                                        </div>
                                        {errors.password && <p className="text-xs text-red-500 flex items-center gap-1.5 ml-1 mt-1.5"><AlertCircle className="w-3.5 h-3.5" />{errors.password}</p>}
                                    </div>

                                    <div className="bg-gray-50/50 p-3 rounded-xl border border-gray-100 flex items-center justify-between">
                                        <label className="flex items-center gap-2.5 cursor-pointer group">
                                            <div className="relative flex items-center">
                                                <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} className="sr-only" />
                                                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${remember ? 'bg-violet-600 border-violet-600' : 'border-gray-300 bg-white'}`}>
                                                    {remember && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                                                </div>
                                            </div>
                                            <span className="text-xs font-semibold text-gray-600">Trust this device</span>
                                        </label>
                                    </div>

                                    <button type="submit" disabled={loading}
                                        className="w-full py-4 bg-gradient-to-r from-violet-600 to-blue-600 text-white rounded-xl font-bold text-sm hover:from-violet-700 hover:to-blue-700 active:scale-[0.98] transition-all shadow-lg shadow-violet-200 disabled:opacity-70 flex items-center justify-center">
                                        {loading ? <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" /> : 'Sign In Now'}
                                    </button>

                                    <button type="button" onClick={handleReset} className="w-full flex items-center justify-center gap-2 text-sm text-gray-400 font-medium hover:text-gray-600 transition-colors">
                                        <ArrowLeft className="w-4 h-4" /> Not you? Use different email
                                    </button>
                                </form>
                            )}

                            {/* STEP 2B: New User Selection */}
                            {step === 'new_user' && (
                                <div className="space-y-6 animate-slide-in">
                                    <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100 flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-amber-400/20 flex items-center justify-center shrink-0"><User className="w-5 h-5 text-amber-600" /></div>
                                        <div><p className="text-amber-900 text-sm font-bold mb-0.5">Account check</p><p className="text-amber-700/80 text-xs leading-relaxed">We couldn't find an account for <span className="font-bold text-amber-800">{email}</span>. Join our platform to get started!</p></div>
                                    </div>

                                    <Link to={`/register?email=${encodeURIComponent(email)}`}
                                        className="w-full py-4 bg-violet-600 text-white rounded-xl font-bold text-sm hover:bg-violet-700 active:scale-[0.98] transition-all shadow-lg shadow-violet-100 flex items-center justify-center gap-2">
                                        Create New Account <ChevronRight className="w-4.5 h-4.5" />
                                    </Link>

                                    <button type="button" onClick={handleReset} className="w-full flex items-center justify-center gap-2 text-sm text-gray-400 font-medium hover:text-gray-600 transition-colors">
                                        <ArrowLeft className="w-4 h-4" /> Wrong email? Try again
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
