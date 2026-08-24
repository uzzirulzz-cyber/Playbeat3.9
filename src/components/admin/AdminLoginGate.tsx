import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { useAuthStore } from '../../store/useAuthStore';
import {
  Shield, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, ArrowRight,
} from 'lucide-react';
import { motion } from 'motion/react';

/**
 * Admin Login Gate — password-protects the /admin route.
 *
 * SECURITY (per operator policy, Aug 2026):
 *   - Email and password fields are BLANK on every page load. The user must
 *     type both fields manually each time.
 *   - autoComplete="off" plus non-standard field names to suppress browser
 *     password managers from saving or pre-filling admin credentials.
 *   - No hardcoded credential fallback in the browser. Every login attempt
 *     goes through POST /api/auth/login. The server still has a hardcoded
 *     admin fallback for cold-start resilience, but the browser never sees
 *     or stores the password.
 *   - No credential hint is rendered anywhere in the UI.
 */
export const AdminLoginGate: React.FC = () => {
  const { setCurrentUser, addToast, setActiveView, brandingLogoUrl } = useStore();

  // Both fields start empty — no prefilled email, no saved password.
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Force a remount of the password input on every submit attempt — this
  // reliably clears the value across all browsers (Chrome/Firefox/Safari)
  // and also defeats the browser's autofill cache that lingers even when
  // autoComplete="off" is set.
  const [pwKey, setPwKey] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // API health check — pings /api/health on mount so the user immediately
  // sees whether the server is reachable (green dot) or down (red dot).
  // On Vercel, the first request triggers a cold start which can take 5-30s.
  // The health check runs in the background and updates the status indicator.
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  useEffect(() => {
    let cancelled = false;
    const checkHealth = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        const res = await fetch('/api/health', { signal: controller.signal });
        clearTimeout(timeoutId);
        if (cancelled) return;
        if (res.ok) {
          setApiStatus('online');
        } else {
          setApiStatus('offline');
        }
      } catch {
        if (!cancelled) setApiStatus('offline');
      }
    };
    checkHealth();
    return () => { cancelled = true; };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setLoading(true);

    const adminRoles = ['super_admin', 'admin', 'product_manager', 'order_manager', 'finance_manager', 'support_agent', 'content_manager', 'marketing_manager', 'read_only'];

    // AbortController — give the server up to 60s to respond (Vercel cold
    // starts + MongoDB Atlas connection can take 5-30s on the first request).
    // After 60s, abort and show a clear timeout message.
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
        signal: controller.signal,
      });

      // Handle non-JSON responses gracefully (e.g., Vercel 504 HTML error page,
      // 502 Bad Gateway, etc.) — res.json() would throw on these.
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        if (res.status === 504) {
          throw new Error('The server took too long to respond (cold start). Please retry — the second attempt will be faster.');
        }
        throw new Error(`Server returned ${res.status} ${res.statusText}. The API may be starting up — please retry in a few seconds.`);
      }

      const data = await res.json();

      if (data.success && adminRoles.includes(data.user.role)) {
        setCurrentUser(data.user);
        useAuthStore.setState({ currentUser: data.user, token: data.token, isAuthenticated: true });
        addToast('success', 'Admin Access Granted', `Welcome, ${data.user.name}!`);
        setPassword('');
        setPwKey((k) => k + 1);
        setLoading(false);
        clearTimeout(timeoutId);
        return;
      }

      if (data.success && !adminRoles.includes(data.user.role)) {
        setError('This account does not have admin access. Please use an admin account.');
      } else {
        setError(data.error || 'Invalid credentials. Please try again.');
      }
    } catch (err: any) {
      // Distinguish between a timeout/abort and a real network error
      if (err?.name === 'AbortError') {
        setError('The server took too long to respond (60s timeout). This usually happens on the first request after a deploy — the serverless function is cold-starting. Please click "Access Admin Panel" again.');
      } else if (err?.message?.includes('Failed to fetch') || err?.message?.includes('NetworkError')) {
        setError('Network error — unable to reach the authentication server. Check your internet connection and retry. If the problem persists, the API may be down.');
      } else {
        setError(err?.message || 'Network error — unable to reach the authentication server. Please retry.');
      }
    } finally {
      clearTimeout(timeoutId);
    }
    // Clear the password and force a remount so the browser does not retain
    // the value in its autofill cache.
    setPassword('');
    setPwKey((k) => k + 1);
    setLoading(false);
  };

  const handleBackToStore = () => {
    setActiveView('store');
    window.history.pushState({ view: 'store' }, '', '/');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-playbeat-mesh opacity-30" />

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-32 h-20 rounded-2xl bg-black/40 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-600/20 border border-orange-400/30 p-2">
            <img src={brandingLogoUrl} alt="PlayBeat" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-white font-display">PlayBeat Admin</h1>
          <p className="text-xs text-gray-500 mt-1 font-mono uppercase tracking-wider">Restricted Access — Authorized Personnel Only</p>
        </div>

        <div className="bg-[#0F111A] border border-white/10 rounded-2xl shadow-2xl p-8">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form ref={formRef} onSubmit={handleLogin} className="space-y-4" autoComplete="off">
            <div>
              <label className="block text-[11px] text-gray-400 mb-1.5 font-mono uppercase tracking-wider">Admin Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your admin email"
                  className="input-sharp w-full pl-10 pr-3 py-3 text-sm text-white placeholder-gray-600"
                  // Suppress browser password managers from auto-filling the email.
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  // Random-ish name so the browser does not match it against
                  // a saved "email" or "username" credential entry.
                  name="pb-admin-identity"
                  data-lpignore="true"
                  data-1p-ignore="true"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-gray-400 mb-1.5 font-mono uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  key={`pw-${pwKey}`}
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="input-sharp w-full pl-10 pr-10 py-3 text-sm text-white placeholder-gray-600 font-mono"
                  // "new-password" tells most browsers: do NOT offer a saved password here.
                  autoComplete="new-password"
                  name="pb-admin-secret"
                  data-lpignore="true"
                  data-1p-ignore="true"
                />
                <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-200">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-glossy btn-glossy-blue w-full flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed" style={{ padding: '0.75rem 1.5rem' }}>
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /><span>Authenticating...</span></>
              ) : (
                <><span>Access Admin Panel</span><ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          {/* API status indicator — shows if the server is reachable */}
          <div className="mt-4 flex items-center justify-between text-[10px] font-mono">
            <span className="text-gray-500 uppercase tracking-wider">API Status:</span>
            <span className={`flex items-center gap-1.5 ${
              apiStatus === 'online' ? 'text-emerald-400'
              : apiStatus === 'offline' ? 'text-red-400'
              : 'text-amber-400'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                apiStatus === 'online' ? 'bg-emerald-400'
                : apiStatus === 'offline' ? 'bg-red-400'
                : 'bg-amber-400 animate-pulse'
              }`} />
              {apiStatus === 'online' ? 'Online'
              : apiStatus === 'offline' ? 'Offline — check backends'
              : 'Checking connection...'}
            </span>
          </div>

          <div className="mt-3 p-3 rounded-lg bg-blue-500/5 border border-blue-500/15 flex items-start gap-2">
            <Shield className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
            <p className="text-[10px] text-gray-400 leading-relaxed">
              Enter your admin email and password to continue. Credentials are never saved or pre-filled on this device — re-enter them every time you visit.
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <button onClick={handleBackToStore} className="text-xs text-gray-500 hover:text-white transition-colors">
            ← Back to Storefront
          </button>
        </div>
      </motion.div>
    </div>
  );
};
