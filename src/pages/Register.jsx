import { useState, useCallback, useEffect, useRef } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { Eye, EyeOff, CheckCircle2, CheckCircle, AlertCircle, FileText, Shield, Lock, Sparkles, XCircle } from 'lucide-react';
import apiService from '../services/api';

console.log('Register.jsx loaded (fixed-v2)');

/* ─── Password strength (unchanged) ─── */
const getStrength = (pw) => {
    if (!pw) return null;
    let s = 0;
    if (pw.length >= 8) s++;
    if (pw.length >= 12) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    if (s <= 1) return { label: 'Weak', color: 'bg-red-500', text: 'text-red-500', w: 'w-1/4' };
    if (s <= 2) return { label: 'Fair', color: 'bg-amber-500', text: 'text-amber-500', w: 'w-2/4' };
    if (s <= 3) return { label: 'Good', color: 'bg-yellow-400', text: 'text-yellow-500', w: 'w-3/4' };
    return { label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-500', w: 'w-full' };
};

const PASS_REQS = [
    { label: 'At least 8 characters', test: (pw) => pw.length >= 8 },
    { label: 'One uppercase letter (A-Z)', test: (pw) => /[A-Z]/.test(pw) },
    { label: 'One lowercase letter (a-z)', test: (pw) => /[a-z]/.test(pw) },
    { label: 'One number (0-9)', test: (pw) => /[0-9]/.test(pw) },
    { label: 'One special character (!@#$%^&*)', test: (pw) => /[!@#$%^&*]/.test(pw) },
];

/* ─── Google Icon (unchanged) ─── */
const GoogleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
);

/* ─── Dashboard mockup (unchanged) ─── */
const DashboardMockup = () => (
    <div className="relative w-full max-w-sm mx-auto">
        <style>{`
            @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
            @keyframes pulse-bar { 0%,100% { opacity:.6 } 50% { opacity:1 } }
            .slide-1 { animation: slideUp .6s ease forwards; }
            .slide-2 { animation: slideUp .6s .15s ease both; }
            .slide-3 { animation: slideUp .6s .3s ease both; }
            .slide-4 { animation: slideUp .6s .45s ease both; }
            .pulse-bar { animation: pulse-bar 2s ease-in-out infinite; }
        `}</style>

        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 shadow-2xl slide-1">
            <div className="flex items-center justify-between mb-4">
                <div><p className="text-white/50 text-xs">Total Revenue</p><p className="text-white font-bold text-2xl">$48,290</p></div>
                <span className="text-xs bg-emerald-400/20 text-emerald-300 px-2.5 py-1 rounded-full font-semibold">↑ 24%</span>
            </div>
            <div className="flex items-end gap-1.5 h-14 mb-4">
                {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 100].map((h, i) => (
                    <div key={i} className="flex-1 rounded-t-sm pulse-bar"
                        style={{ height: `${h}%`, background: i === 11 ? 'rgba(167,139,250,0.9)' : 'rgba(255,255,255,0.15)', animationDelay: `${i * 0.1}s` }} />
                ))}
            </div>
            <div className="space-y-2">
                {[
                    { name: 'Acme Corp', amount: '$4,200', status: 'Paid', color: 'text-emerald-300 bg-emerald-400/15' },
                    { name: 'Globex Inc', amount: '$1,850', status: 'Pending', color: 'text-amber-300 bg-amber-400/15' },
                    { name: 'Initech LLC', amount: '$9,100', status: 'Sent', color: 'text-blue-300 bg-blue-400/15' },
                ].map((row, i) => (
                    <div key={i} className={`flex items-center justify-between slide-${i + 2}`}>
                        <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white/60 text-xs font-bold">{row.name[0]}</div><span className="text-white/80 text-xs">{row.name}</span></div>
                        <div className="flex items-center gap-2"><span className="text-white text-xs font-semibold">{row.amount}</span><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${row.color}`}>{row.status}</span></div>
                    </div>
                ))}
            </div>
        </div>
        <div className="absolute -top-4 -right-4 bg-white/15 backdrop-blur border border-white/25 rounded-xl px-3 py-2 slide-2"><p className="text-white/60 text-xs">Invoices Sent</p><p className="text-white font-bold text-lg">1,284</p></div>
        <div className="absolute -bottom-4 -left-4 bg-white/15 backdrop-blur border border-white/25 rounded-xl px-3 py-2 slide-3"><p className="text-white/60 text-xs">Avg. Payment</p><p className="text-white font-bold text-lg">3.2 days</p></div>
    </div>
);

/* ─── Benefit item (unchanged) ─── */
const Benefit = ({ text }) => (
    <div className="flex items-center gap-3">
        <div className="w-5 h-5 rounded-full bg-emerald-400/20 border border-emerald-400/40 flex items-center justify-center shrink-0"><CheckCircle className="w-3 h-3 text-emerald-400" /></div>
        <span className="text-white/85 text-sm">{text}</span>
    </div>
);

/* ─── Input field ─── */
const Field = ({ label, id, type, value, onChange, onBlur, error, valid, placeholder, disabled, max, children }) => (
    <div className="space-y-1.5">
        <label htmlFor={id} className={`block text-sm font-medium transition-colors ${error ? 'text-red-500' : 'text-gray-700'}`}>{label}</label>
        <div className="relative group">
            <input
                id={id} type={type} value={value} onChange={onChange} onBlur={onBlur} placeholder={placeholder} disabled={disabled} maxLength={max}
                className={`w-full px-4 py-3 rounded-xl border text-sm transition-all outline-none
                    ${error ? 'border-red-400 bg-red-50 focus:ring-4 focus:ring-red-100 animate-shake' :
                        valid ? 'border-emerald-200 bg-emerald-50/30 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100' :
                            'border-gray-200 bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-100 text-gray-900'}
                    ${disabled ? 'bg-gray-100/80 border-gray-200 cursor-not-allowed text-gray-500' : ''}
                    ${children ? 'pr-12' : ''}`}
            />
            {valid && !error && !disabled && (
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 animate-bounce-in">
                    <CheckCircle className="w-4.5 h-4.5 text-emerald-500" />
                </div>
            )}
            {children}
        </div>
        {error && <p className="flex items-center gap-1.5 text-xs text-red-500 animate-slide-in"><AlertCircle className="w-3.5 h-3.5 shrink-0" />{error}</p>}
    </div>
);

const Register = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const emailParam = searchParams.get('email');
    const emailInputRef = useRef(null);

    const [form, setForm] = useState({ name: '', email: '', company: '', password: '', confirm: '' });
    const [emailReadOnly, setEmailReadOnly] = useState(false);

    /* Real-time Validation States */
    const [validity, setValidity] = useState({ name: false, email: false, password: false, confirm: false });
    const [errors, setErrors] = useState({});
    const [emailChecking, setEmailChecking] = useState(false);

    const [showPw, setShowPw] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [agreed, setAgreed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState('Account created successfully! 🎉');

    // Debounced email check
    useEffect(() => {
        if (!form.email || emailReadOnly || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            setValidity(v => ({ ...v, email: false }));
            return;
        }

        const handler = setTimeout(async () => {
            setEmailChecking(true);
            try {
                const { data } = await apiService.post('/auth/check-email', { email: form.email });
                if (data.exists) {
                    setErrors(prev => ({ ...prev, email: <span>This email is already registered. <Link to={`/login?email=${encodeURIComponent(form.email)}`} className="font-bold underline">Sign in instead?</Link></span> }));
                    setValidity(v => ({ ...v, email: false }));
                } else {
                    setErrors(prev => ({ ...prev, email: undefined }));
                    setValidity(v => ({ ...v, email: true }));
                }
            } catch (err) {
                console.error('Email check failed', err);
                setErrors(prev => ({ ...prev, email: 'Failed to check email availability.' }));
                setValidity(v => ({ ...v, email: false }));
            } finally {
                setEmailChecking(false);
            }
        }, 500);

        return () => clearTimeout(handler);
    }, [form.email, emailReadOnly]);

    // Name Validation
    useEffect(() => {
        const nameValid = form.name.trim().length >= 2 && /^[a-zA-Z\s\-']+$/.test(form.name);
        setValidity(v => ({ ...v, name: nameValid }));
        if (form.name && !nameValid) {
            setErrors(prev => ({ ...prev, name: 'Please enter a valid full name (min 2 chars, letters, spaces, hyphens, apostrophes only).' }));
        } else {
            setErrors(prev => ({ ...prev, name: undefined }));
        }
    }, [form.name]);

    // Password Validation
    useEffect(() => {
        const allReqsMet = PASS_REQS.every(req => req.test(form.password));
        setValidity(v => ({ ...v, password: allReqsMet }));
        if (form.password && !allReqsMet) {
            setErrors(prev => ({ ...prev, password: 'Password does not meet all requirements.' }));
        } else {
            setErrors(prev => ({ ...prev, password: undefined }));
        }
    }, [form.password]);

    // Confirm Match Validation
    useEffect(() => {
        const matches = form.confirm === form.password && form.confirm.length > 0;
        setValidity(v => ({ ...v, confirm: matches }));
        if (form.confirm && !matches) {
            setErrors(prev => ({ ...prev, confirm: "Passwords don't match." }));
        } else {
            setErrors(prev => ({ ...prev, confirm: undefined }));
        }
    }, [form.confirm, form.password]);

    // Synchronize email param with form state
    useEffect(() => {
        if (emailParam) {
            setForm(prev => ({ ...prev, email: emailParam }));
            setEmailReadOnly(true);
            setValidity(v => ({ ...v, email: true }));
        }

        // Debug Automation: Auto-fill registration if coming from test flow
        const automationData = JSON.parse(localStorage.getItem('test_automation') || 'null');
        if (automationData && automationData.flow === 'new_user') {
            setForm(prev => ({
                ...prev,
                name: 'Test User',
                company: 'Test Company LLC',
                password: 'Password123!',
                confirm: 'Password123!'
            }));
            setAgreed(true);

            // Auto-submit after small delay
            setTimeout(() => {
                const formEl = document.querySelector('form');
                if (formEl) formEl.requestSubmit();
                localStorage.removeItem('test_automation');
            }, 1500);
        }
    }, [emailParam]);

    const strength = getStrength(form.password);
    const isFormValid = validity.name && validity.email && validity.password && validity.confirm && agreed;

    const handleChange = useCallback((field) => (e) => {
        setForm(prev => ({ ...prev, [field]: e.target.value }));
        setErrors(prev => ({ ...prev, [field]: undefined })); // Clear error on change
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Final frontend validation check
        const fieldsToValidate = {
            name: validity.name,
            email: validity.email,
            password: validity.password,
            confirm: validity.confirm,
            terms: agreed
        };

        const newErrors = {};
        if (!validity.name) newErrors.name = 'Full name is required';
        if (!validity.email) newErrors.email = errors.email || 'Valid email is required';
        if (!validity.password) newErrors.password = 'Strong password is required';
        if (!validity.confirm) newErrors.confirm = "Passwords don't match";
        if (!agreed) newErrors.terms = 'You must agree to the terms';

        if (Object.keys(newErrors).length > 0) {
            setErrors(prev => ({ ...prev, ...newErrors }));
            // Find first error and scroll to it if needed
            const firstError = Object.keys(newErrors)[0];
            const el = document.getElementById(firstError);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        setLoading(true);
        try {
            const { data } = await apiService.post('/auth/register', {
                fullName: form.name,
                email: form.email,
                company: form.company || null,
                password: form.password
            });

            // On SUCCESS (201)
            setSuccess(true);
            setSuccessMessage('Account created successfully! 🎉');

            // Store auth data
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('currentUser', JSON.stringify(data.user));

            console.log('[DEBUG] Registration successful');
            setTimeout(() => setSuccessMessage('Setting up your dashboard...'), 500);

            setTimeout(() => {
                console.log('[DEBUG] Navigating to /dashboard');
                navigate('/dashboard');

                setTimeout(() => {
                    if (window.location.pathname !== '/dashboard') {
                        window.location.href = '/dashboard';
                    }
                }, 1500);
            }, 1500);

        } catch (err) {
            setLoading(false);
            const status = err.response?.status;
            const errorData = err.response?.data;

            if (status === 409) {
                // Email exists
                setErrors({
                    email: (
                        <div className="flex flex-col gap-2">
                            <span>This email is already registered.</span>
                            <Link to={`/login?email=${encodeURIComponent(form.email)}`} className="px-3 py-1 bg-violet-100 text-violet-700 rounded-lg text-[10px] font-bold w-fit hover:bg-violet-200 transition-colors">Sign in instead</Link>
                        </div>
                    )
                });
                setValidity(v => ({ ...v, email: false }));
            } else if (status === 400 && errorData?.fields) {
                // Server validation failed
                setErrors(errorData.fields);
            } else {
                // Global error
                const detailedError = errorData?.details || errorData?.error || 'Registration failed. Please try again.';
                setErrors({ global: detailedError });
            }
        }
    };

    const handleGoogleSuccess = async (response) => {
        setLoading(true);
        setErrors({});
        try {
            const { data } = await apiService.post('/auth/google', {
                credential: response.credential,
                action: 'register'
            });

            // On SUCCESS
            setSuccess(true);
            setSuccessMessage(`Welcome ${data.user.fullName}! 🚀`);

            localStorage.setItem('authToken', data.token);
            localStorage.setItem('currentUser', JSON.stringify(data.user));

            console.log('[DEBUG] Google Register successful');
            setTimeout(() => setSuccessMessage('Setting up your workspace...'), 500);

            setTimeout(() => {
                console.log('[DEBUG] Navigating to /dashboard');
                navigate('/dashboard');

                setTimeout(() => {
                    if (window.location.pathname !== '/dashboard') {
                        window.location.href = '/dashboard';
                    }
                }, 1500);
            }, 1500);

        } catch (err) {
            setLoading(false);
            setErrors({ global: err.response?.data?.message || 'Google signup failed. Please try again.' });
            console.error('Google Signup Error:', err);
        }
    };

    const resetEmail = () => {
        setSearchParams({});
        setForm(prev => ({ ...prev, email: '' }));
        setEmailReadOnly(false);
        setValidity(v => ({ ...v, email: false }));
        setErrors(prev => ({ ...prev, email: undefined }));
        setTimeout(() => emailInputRef.current?.focus(), 0);
    };

    /* Success screen (unchanged) */
    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-900 via-purple-900 to-blue-900 px-4 overflow-hidden">
                <style>{`
                    @keyframes pulse-ring { 0% { transform: scale(0.8); opacity: 0.5; } 100% { transform: scale(1.5); opacity: 0; } }
                    @keyframes check-bounce { 0% { transform: scale(0.5); opacity: 0; } 50% { transform: scale(1.2); } 100% { transform: scale(1); opacity: 1; } }
                    .pulse-ring { animation: pulse-ring 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite; }
                    .check-bounce { animation: check-bounce 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
                `}</style>
                <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-sm text-center relative animate-slide-in">
                    <div className="relative w-24 h-24 mx-auto mb-8">
                        <div className="absolute inset-0 bg-emerald-400/20 rounded-full pulse-ring" />
                        <div className="absolute inset-0 bg-emerald-400/10 rounded-full pulse-ring" style={{ animationDelay: '0.5s' }} />
                        <div className="w-full h-full bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 shadow-inner">
                            <CheckCircle2 className="w-12 h-12 check-bounce" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2 transition-all duration-500">{successMessage}</h2>
                    <p className="text-gray-500 text-sm mb-6">Redirecting to your dashboard workspace...</p>
                    <div className="flex gap-1 justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-violet-600 animate-bounce" style={{ animationDelay: '0s' }} />
                        <div className="w-1.5 h-1.5 rounded-full bg-violet-600 animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-1.5 h-1.5 rounded-full bg-violet-600 animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex">
            {/* ══════════════ LEFT SIDE ══════════════ */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-violet-700 via-purple-700 to-blue-700 flex-col overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
                <div className="absolute top-[-10%] left-[-10%] w-80 h-80 bg-violet-500 rounded-full blur-3xl opacity-30" />
                <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-blue-500 rounded-full blur-3xl opacity-30" />
                <div className="relative z-10 p-8 flex items-center gap-3"><div className="w-9 h-9 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center border border-white/30 text-white"><FileText className="w-5 h-5" /></div><span className="text-white font-bold text-lg tracking-tight">InvoiceFlow</span></div>
                <style>{`
                    @keyframes slideDownIn { from { opacity: 0; transform: translateY(-15px); } to { opacity: 1; transform: translateY(0); } }
                    @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-8px); } 50% { transform: translateX(8px); } 75% { transform: translateX(-8px); } }
                    @keyframes bounceIn { 0% { opacity:0; transform: translateY(-50%) scale(0.3); } 50% { opacity:1; transform: translateY(-50%) scale(1.1); } 100% { opacity:1; transform: translateY(-50%) scale(1); } }
                    .animate-shake { animation: shake 0.4s ease-in-out; }
                    .animate-bounce-in { animation: bounceIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
                    .animate-slide-in { animation: slideDownIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                `}</style>

                <div className="relative z-10 flex-1 flex flex-col justify-center px-12 pb-8 gap-8">
                    <div><div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-5 text-white text-xs font-medium"><Sparkles className="w-3.5 h-3.5 text-yellow-300" />Free 14-Day Trial</div><h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-3">Start Your<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300">Free Trial</span></h1><p className="text-white/65 text-sm leading-relaxed">Join <span className="text-white font-semibold">10,000+</span> businesses automating their invoicing with AI.</p></div>
                    <div className="space-y-3"><Benefit text="No credit card required" /><Benefit text="14-day free trial, full access" /><Benefit text="Cancel anytime, no questions asked" /></div>
                    <div className="py-4"><DashboardMockup /></div>
                    <div className="flex items-center gap-6 pt-2"><div className="flex items-center gap-2 text-white/50 text-xs text-emerald-400"><Lock className="w-3.5 h-3.5" /><span>256-bit SSL Encryption</span></div><div className="w-px h-4 bg-white/20" /><div className="flex items-center gap-2 text-white/50 text-xs text-blue-400"><Shield className="w-3.5 h-3.5" /><span>GDPR Compliant</span></div></div>
                </div>
            </div>

            {/* ══════════════ RIGHT SIDE ══════════════ */}
            <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 px-6 py-10 overflow-y-auto">
                <div className="w-full max-w-[460px]">
                    <div className="flex items-center gap-2 mb-7 lg:hidden"><div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-blue-600 rounded-xl flex items-center justify-center text-white"><FileText className="w-4 h-4" /></div><span className="font-bold text-gray-900">InvoiceFlow</span></div>
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-1.5">{emailReadOnly ? 'Finalize Account' : 'Create Account'}</h2>
                        <p className="text-gray-500 text-sm">Start your free trial — no credit card needed</p>
                    </div>

                    {errors.global && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-700 text-sm animate-shake">
                            <XCircle className="w-5 h-5 shrink-0" />
                            {errors.global}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} noValidate className="space-y-5 bg-white p-8 lg:p-10 rounded-3xl shadow-xl border border-gray-100 transition-all">
                        {/* Status bar for pre-filled email */}
                        {emailReadOnly && (
                            <div className="bg-emerald-50 border border-emerald-100 p-3.5 rounded-2xl flex items-center gap-3 mb-6 animate-slide-in">
                                <div className="w-9 h-9 rounded-xl bg-emerald-400/20 flex items-center justify-center shrink-0">
                                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-emerald-900 text-xs font-bold leading-none mb-1">Email verified</p>
                                    <p className="text-emerald-700/80 text-[11px] leading-tight">Continue as <span className="font-bold">{form.email}</span> or <button type="button" onClick={resetEmail} className="text-violet-600 font-bold hover:underline">use different email</button></p>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-5">
                            <Field
                                label="Full Name" id="name" type="text" value={form.name}
                                onChange={handleChange('name')} error={errors.name} valid={validity.name}
                                placeholder="John Doe" disabled={loading}
                            />

                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                                <Field
                                    label="Email Address" id="email" type="email" value={form.email}
                                    onChange={handleChange('email')} error={errors.email} valid={validity.email && !emailChecking}
                                    placeholder="you@company.com"
                                    disabled={emailReadOnly}
                                >
                                    {emailChecking && <div className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 border-2 border-violet-500/30 border-t-violet-600 rounded-full animate-spin" />}
                                    {emailReadOnly && !emailChecking && <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400 bg-gray-100/10 rounded" />}
                                </Field>

                                <Field
                                    label="Company (Optional)" id="company" type="text" value={form.company}
                                    onChange={handleChange('company')} max={100}
                                    placeholder="Your Business Name" disabled={loading}
                                />
                            </div>

                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                                    <div className="relative group">
                                        <input
                                            id="password" type={showPw ? 'text' : 'password'} value={form.password} onChange={handleChange('password')} placeholder="Min. 8 characters"
                                            className={`w-full px-4 py-3 pr-12 rounded-xl border text-sm transition-all outline-none ${validity.password ? 'border-emerald-200 bg-emerald-50/20' : 'border-gray-200 bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-100'}`}
                                            disabled={loading}
                                        />
                                        <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors" disabled={loading}>{showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                                    </div>

                                    {/* Strength meter */}
                                    {form.password && strength && (
                                        <div className="space-y-2 mt-3 px-1 animate-slide-in">
                                            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                                <div className={`h-full rounded-full transition-all duration-500 ${strength.color} ${strength.w}`} />
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <p className={`text-[11px] font-bold ${strength.text}`}>{strength.label}</p>
                                                <span className="text-[10px] text-gray-400 font-medium">Strength Indicator</span>
                                            </div>

                                            {/* Requirement Checklist */}
                                            <div className="grid grid-cols-1 gap-1.5 mt-3 pt-3 border-t border-gray-100">
                                                {PASS_REQS.map((req, i) => {
                                                    const met = req.test(form.password);
                                                    return (
                                                        <div key={i} className="flex items-center gap-2">
                                                            <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-colors ${met ? 'bg-emerald-500' : 'bg-gray-200'}`}>
                                                                {met && <CheckCircle className="w-2.5 h-2.5 text-white" />}
                                                            </div>
                                                            <span className={`text-[10px] transition-colors ${met ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>{req.label}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <label htmlFor="confirm" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                                    <Field
                                        id="confirm" type={showConfirm ? 'text' : 'password'} value={form.confirm}
                                        onChange={handleChange('confirm')} error={form.confirm && !validity.confirm ? "Passwords don't match" : undefined}
                                        valid={validity.confirm} placeholder="Repeat" disabled={loading}
                                    >
                                        <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors pr-8 xl:pr-0" disabled={loading}>
                                            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </Field>
                                </div>
                            </div>
                        </div>

                        <div><label className="flex items-start gap-3 cursor-pointer group mt-2"><div className="relative mt-1 shrink-0"><input type="checkbox" checked={agreed} onChange={e => { if (!loading) { setAgreed(e.target.checked); setErrors(p => ({ ...p, terms: undefined })); } }} className="sr-only" disabled={loading} /><div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${agreed ? 'bg-violet-600 border-violet-600' : 'border-gray-300 bg-white group-hover:border-violet-400'}`}>{agreed && <CheckCircle className="w-3.5 h-3.5 text-white" />}</div></div><span className="text-xs text-gray-600 leading-snug">I agree to the <span className="text-violet-600 font-bold hover:underline">Terms of Service</span> &amp; <span className="text-violet-600 font-bold hover:underline">Privacy Policy</span></span></label>{errors.terms && <p className="text-xs text-red-500 mt-2 ml-8 animate-slide-in">{errors.terms}</p>}</div>

                        <div className="group/btn relative">
                            {!isFormValid && (
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-1.5 bg-gray-900 text-white text-[10px] rounded-lg opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                                    Complete all fields correctly
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900" />
                                </div>
                            )}
                            <button
                                type="submit" disabled={!isFormValid || loading}
                                className={`w-full py-4 rounded-xl font-bold text-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4 shadow-lg
                                    ${isFormValid ? 'bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-violet-200 hover:from-violet-700 hover:to-blue-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'}`}
                            >
                                {loading ? (<><div className="w-4.5 h-4.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating Account...</>) : 'Create Account Now'}
                            </button>
                        </div>

                        <div className="flex items-center gap-3 py-2"><div className="flex-1 h-px bg-gray-100" /><span className="text-[10px] text-gray-300 font-bold tracking-widest uppercase">OR</span><div className="flex-1 h-px bg-gray-100" /></div>

                        <div className="flex justify-center w-full overflow-hidden rounded-xl border border-gray-100 hover:border-gray-200 transition-all">
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={() => setErrors({ global: 'Google sign-up failed' })}
                                useOneTap
                                width="100%"
                                text="signup_with"
                                shape="rectangular"
                                theme="outline"
                            />
                        </div>
                    </form>

                    <p className="text-center text-sm text-gray-500 mt-8">Already have an account? <Link to="/login" className="text-violet-600 font-bold hover:underline">Sign In</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Register;
