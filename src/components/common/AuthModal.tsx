import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { useAuthStore } from '../../store/useAuthStore';
import {
  X, Shield, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle,
  User as UserIcon, ArrowRight, Globe, Phone, KeyRound, CheckCircle2, ArrowLeft,
  MessageCircle, Music2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type FormErrors = Record<string, string | undefined>;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France',
  'Pakistan', 'India', 'Bangladesh', 'United Arab Emirates', 'Saudi Arabia',
  'Malaysia', 'Singapore', 'Indonesia', 'Philippines', 'Brazil', 'Mexico',
  'Spain', 'Italy', 'Netherlands', 'Sweden', 'Norway', 'Denmark', 'Other',
];

type Mode = 'login' | 'signup' | 'forgot' | 'reset';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, setCurrentUser, addToast, authMode, setIsCustomerPortalOpen } = useStore();

  const [mode, setMode] = useState<Mode>('login');

  // Sync mode with authMode whenever the modal opens (Sign Up button → signup mode)
  useEffect(() => {
    if (isAuthModalOpen) {
      setMode(authMode === 'signup' ? 'signup' : 'login');
    }
  }, [isAuthModalOpen, authMode]);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [country, setCountry] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const [socialProvider, setSocialProvider] = useState<string | null>(null);

  // Forgot password flow state
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetTokenFromApi, setResetTokenFromApi] = useState('');
  const [showResetToken, setShowResetToken] = useState(false);

  const resetForm = () => {
    setEmail(''); setName(''); setPassword(''); setConfirmPassword('');
    setCountry(''); setPhone(''); setResetToken(''); setNewPassword('');
    setResetTokenFromApi('');
    setErrors({}); setShowPassword(false); setShowResetToken(false);
    setApiError('');
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setIsAuthModalOpen(false);
    setTimeout(() => { resetForm(); setMode('login'); }, 200);
  };

  const switchMode = (newMode: Mode) => {
    setMode(newMode);
    setErrors({});
    setApiError('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
  };

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (mode === 'signup' && name.trim().length < 2) next.name = 'Please enter your full name (at least 2 characters).';
    if (mode === 'signup' && name.trim().length > 100) next.name = 'Full name must be 100 characters or fewer.';
    if (!email.trim()) next.email = 'Email is required.';
    else if (!EMAIL_RE.test(email.trim())) next.email = 'Please enter a valid email address.';
    if (mode === 'login' || mode === 'signup') {
      if (!password) next.password = 'Password is required.';
      else if (mode === 'signup' && (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password))) next.password = 'Use uppercase, lowercase, and a number.';
    }
    if (mode === 'signup' && password !== confirmPassword) next.confirmPassword = 'Passwords do not match.';
    if (mode === 'signup' && !country) next.country = 'Please select your country.';
    if (mode === 'reset' && !resetToken) next.resetToken = 'Reset token is required.';
    if (mode === 'reset' && !newPassword) next.newPassword = 'New password is required.';
    else if (mode === 'reset' && newPassword.length < 8) next.newPassword = 'Minimum 8 characters.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!validate()) return;
    setIsSubmitting(true);
    setApiError('');

    try {
      let endpoint = '';
      let body: Record<string, any> = {};

      if (mode === 'login') {
        endpoint = '/api/auth/login';
        body = { email: email.trim(), password };
      } else if (mode === 'signup') {
        endpoint = '/api/auth/signup';
        body = { email: email.trim().toLowerCase(), password, name: name.trim(), country, phone: phone.trim() };
      } else if (mode === 'forgot') {
        endpoint = '/api/auth/forgot-password';
        body = { email: email.trim() };
      } else if (mode === 'reset') {
        endpoint = '/api/auth/reset-password';
        body = { email: email.trim(), resetToken, newPassword };
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (data.success) {
        if (mode === 'login' || mode === 'signup') {
          setCurrentUser(data.user);
          useAuthStore.setState({ currentUser: data.user, token: data.token, isAuthenticated: true });
          addToast('success', mode === 'login' ? 'Logged In' : 'Account Created', `Welcome, ${data.user.name}!`);
          handleClose();
          // After signup, auto-open the customer profile so the user sees
          // their complete detailed profile immediately.
          if (mode === 'signup') {
            setTimeout(() => setIsCustomerPortalOpen(true), 800);
          }
        } else if (mode === 'forgot') {
          // Show the reset token (in production this would be emailed)
          if (data.resetToken) {
            setResetTokenFromApi(data.resetToken);
            setShowResetToken(true);
            setResetToken(data.resetToken);
            addToast('success', 'Reset Token Generated', 'Copy the token and set your new password.');
          } else {
            addToast('info', 'Check Your Email', data.message || 'If the email exists, a reset link has been sent.');
            handleClose();
          }
        } else if (mode === 'reset') {
          addToast('success', 'Password Reset', 'You can now log in with your new password.');
          switchMode('login');
          setPassword('');
        }
      } else {
        setApiError(data.error || 'Operation failed.');
      }
    } catch {
      setApiError('Network error. Please try again.');
    }
    setIsSubmitting(false);
  };

  const titleMap: Record<Mode, string> = {
    login: 'Sign in to PlayBeat',
    signup: 'Create your account',
    forgot: 'Forgot Password',
    reset: 'Set New Password',
  };
  const subtitleMap: Record<Mode, string> = {
    login: 'Access your locker, orders & wishlist',
    signup: 'Join 25,000+ verified shoppers',
    forgot: 'Enter your email to receive a secure reset link',
    reset: 'Enter the reset token and your new password',
  };

  const inputClass = (field: string) => `input-sharp w-full px-3 py-2.5 text-xs text-white placeholder-neutral-500 ${errors[field] ? 'input-error' : ''}`;

  const passwordStrength = password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password)
    ? (password.length >= 12 ? 'Strong' : 'Medium') : password.length > 0 ? 'Weak' : '';

  const handleSocialAuth = (provider: 'google' | 'facebook' | 'x' | 'tiktok') => {
    setSocialProvider(provider);
    window.location.assign(`/api/auth/oauth/${provider}?returnTo=${encodeURIComponent(window.location.pathname)}`);
  };

  return (
    <AnimatePresence>
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleClose} className="absolute inset-0 bg-black/85 backdrop-blur-md" />
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-md max-h-[92vh] overflow-y-auto scrollbar-thin rounded-2xl bg-[#0F111A] border border-white/10 shadow-2xl p-6 z-10"
            role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                {mode !== 'login' && mode !== 'signup' && (
                  <button onClick={() => switchMode('login')} className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white mr-1">
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                )}
                <div className="w-8 h-8 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h3 id="auth-modal-title" className="text-base font-bold text-white font-display">{titleMap[mode]}</h3>
                  <p className="text-xs text-neutral-400">{subtitleMap[mode]}</p>
                </div>
              </div>
              <button onClick={handleClose} disabled={isSubmitting} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Close">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* API error */}
            {apiError && (
              <div className="mt-4 p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-[11px] text-red-300 flex items-start gap-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" /><span>{apiError}</span>
              </div>
            )}

            {/* Reset token display (after forgot-password succeeds) */}
            {showResetToken && resetTokenFromApi && (
              <div className="mt-4 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-300">Reset Token Generated</span>
                </div>
                <p className="text-[10px] text-gray-400 mb-2">Copy this token (expires in 15 minutes):</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-2 rounded-lg bg-black/40 border border-white/10 text-[10px] text-emerald-400 font-mono break-all">{resetTokenFromApi}</code>
                  <button onClick={() => { navigator.clipboard.writeText(resetTokenFromApi); addToast('success', 'Copied', 'Token copied to clipboard.'); }} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold">Copy</button>
                </div>
                <button onClick={() => { setShowResetToken(false); switchMode('reset'); }} className="mt-2 w-full py-2 rounded-lg btn-glossy btn-glossy-emerald btn-glossy-sm">
                  Continue to Reset Password →
                </button>
              </div>
            )}

            {(mode === 'login' || mode === 'signup') && (
              <div className="mt-4 space-y-2">
                <button
                  type="button"
                  onClick={() => handleSocialAuth('google')}
                  disabled={Boolean(socialProvider)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-white/10"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[10px] font-black text-slate-900">G</span>
                  <span>{socialProvider === 'google' ? 'Connecting to Google...' : 'Continue with Google'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSocialAuth('facebook')}
                  disabled={Boolean(socialProvider)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-[#1877F2]/30 bg-[#1877F2]/10 px-3 py-2.5 text-xs font-semibold text-[#7bb7ff] transition-colors hover:bg-[#1877F2]/20"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1877F2] text-[10px] font-black text-white">f</span>
                  <span>{socialProvider === 'facebook' ? 'Connecting to Facebook...' : 'Continue with Facebook'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSocialAuth('x')}
                  disabled={Boolean(socialProvider)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-white/10 disabled:opacity-60"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black border border-white/20 text-xs font-black text-white">𝕏</span>
                  <span>{socialProvider === 'x' ? 'Connecting to X...' : 'Continue with X'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSocialAuth('tiktok')}
                  disabled={Boolean(socialProvider)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-3 py-2.5 text-xs font-semibold text-cyan-200 transition-colors hover:bg-cyan-400/20 disabled:opacity-60"
                >
                  <Music2 className="w-5 h-5" />
                  <span>{socialProvider === 'tiktok' ? 'Connecting to TikTok...' : 'Continue with TikTok'}</span>
                </button>
              </div>
            )}

            {(mode === 'login' || mode === 'signup') && (
              <div className="mt-4 flex items-center gap-3 text-[10px] text-neutral-500">
                <div className="h-px flex-1 bg-white/10" />
                <span>or continue with email</span>
                <div className="h-px flex-1 bg-white/10" />
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-4 space-y-3" noValidate>
              {/* Name — signup only */}
              {mode === 'signup' && (
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1 font-mono">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" className={`pl-9 ${inputClass('name')}`} />
                  </div>
                  {errors.name && <p className="mt-1 text-[10px] text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.name}</p>}
                </div>
              )}

              {/* Email — all modes */}
              <div>
                <label className="block text-[11px] text-neutral-400 mb-1 font-mono">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={`pl-9 ${inputClass('email')}`} autoComplete="email" />
                </div>
                {errors.email && <p className="mt-1 text-[10px] text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.email}</p>}
              </div>

              {/* Country — signup only */}
              {mode === 'signup' && (
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1 font-mono">Country</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500 z-10" />
                    <select value={country} onChange={(e) => setCountry(e.target.value)} className={`pl-9 ${inputClass('country')} appearance-none cursor-pointer`}>
                      <option value="">Select your country</option>
                      {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  {errors.country && <p className="mt-1 text-[10px] text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.country}</p>}
                </div>
              )}

              {/* Phone — signup only */}
              {mode === 'signup' && (
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1 font-mono">Mobile Number <span className="text-neutral-600">(optional)</span></label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" className={`pl-9 ${inputClass('phone')}`} autoComplete="tel" />
                  </div>
                </div>
              )}

              {/* Password — login + signup */}
              {(mode === 'login' || mode === 'signup') && (
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1 font-mono">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
                    <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                      placeholder={mode === 'signup' ? 'Minimum 8 characters' : 'Enter your password'}
                      className={`pl-9 pr-10 ${inputClass('password')}`} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
                    <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-neutral-500 hover:text-neutral-200">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="mt-1 text-[10px] text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.password}</p>}
                  {mode === 'signup' && password && !errors.password && <p className={`mt-1 text-[10px] ${passwordStrength === 'Strong' ? 'text-emerald-400' : passwordStrength === 'Medium' ? 'text-amber-400' : 'text-red-400'}`}>Password strength: {passwordStrength}</p>}
                </div>
              )}

              {/* Confirm Password — signup only */}
              {mode === 'signup' && (
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1 font-mono">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
                    <input type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter password" className={`pl-9 ${inputClass('confirmPassword')}`} autoComplete="new-password" />
                  </div>
                  {errors.confirmPassword && <p className="mt-1 text-[10px] text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.confirmPassword}</p>}
                </div>
              )}

              {/* Reset Token — reset mode only */}
              {mode === 'reset' && (
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1 font-mono">Reset Token</label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
                    <input type="text" value={resetToken} onChange={(e) => setResetToken(e.target.value)} placeholder="Paste your reset token here" className={`pl-9 ${inputClass('resetToken')} font-mono`} />
                  </div>
                  {errors.resetToken && <p className="mt-1 text-[10px] text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.resetToken}</p>}
                </div>
              )}

              {/* New Password — reset mode only */}
              {mode === 'reset' && (
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1 font-mono">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
                    <input type={showPassword ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Minimum 8 characters" className={`pl-9 pr-10 ${inputClass('newPassword')}`} autoComplete="new-password" />
                    <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-neutral-500 hover:text-neutral-200">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.newPassword && <p className="mt-1 text-[10px] text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.newPassword}</p>}
                </div>
              )}

              {/* Forgot password link — login only */}
              {mode === 'login' && (
                <div className="flex items-center justify-between gap-3 text-[11px]">
                  <div className="flex items-center gap-1.5 text-neutral-400">
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Need help with access?</span>
                  </div>
                  <button type="button" onClick={() => switchMode('forgot')} className="text-blue-400 hover:text-blue-300 underline transition-colors">
                    Forgot password?
                  </button>
                </div>
              )}

              {/* Submit button */}
              <button type="submit" disabled={isSubmitting} className="btn-glossy btn-glossy-blue w-full flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed" style={{padding:"0.625rem 1.5rem"}}>
                {isSubmitting ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" /><span>{mode === 'login' ? 'Signing in...' : mode === 'signup' ? 'Creating account...' : mode === 'forgot' ? 'Generating token...' : 'Resetting password...'}</span></>
                ) : (
                  <>
                    <span>{mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : mode === 'forgot' ? 'Get Reset Token' : 'Reset Password'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            {/* Mode switcher */}
            {(mode === 'login' || mode === 'signup') && (
              <div className="mt-4 text-center text-[11px] text-neutral-400">
                {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
                <button onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')} disabled={isSubmitting} className="text-red-400 hover:text-red-300 font-bold transition-colors underline disabled:opacity-60">
                  {mode === 'login' ? 'Sign Up' : 'Sign In'}
                </button>
              </div>
            )}

            {/* Security note */}
            <div className="mt-4 p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/15 flex items-start gap-2 text-[10px] text-neutral-400 leading-snug">
              <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                Sign up creates a customer account. Passwords are hashed with bcrypt — we never store plaintext.
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
