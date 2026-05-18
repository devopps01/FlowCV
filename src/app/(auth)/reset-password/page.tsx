'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, Loader2, ArrowLeft, FileText, ShieldCheck } from 'lucide-react';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);

  useEffect(() => {
    if (!token) {
      setTokenValid(false);
    } else {
      setTokenValid(true);
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess(true);
        setTimeout(() => router.push('/login'), 3000);
      } else {
        setError(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = (field: string) => ({
    backgroundColor: 'var(--app-bg-elevated)',
    border: `1.5px solid ${focused === field ? 'var(--app-primary)' : 'var(--app-border)'}`,
    color: 'var(--app-text)',
    boxShadow: focused === field ? '0 0 0 3px rgba(65,1,125,0.08)' : 'none',
  });

  // Strength calc
  const strength = (() => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength];
  const strengthColor = ['', '#ef4444', '#f59e0b', '#3b82f6', '#22c55e'][strength];

  // Loading state
  if (tokenValid === null) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--app-bg)' }}>
      <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--app-primary)' }} />
    </div>
  );

  // Invalid token
  if (!tokenValid) return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: 'var(--app-bg)' }}>
      <div className="w-full max-w-md text-center">
        <div className="h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: 'rgba(239,68,68,0.1)', border: '2px solid rgba(239,68,68,0.2)' }}>
          <AlertCircle className="h-10 w-10 text-red-500" />
        </div>
        <h2 className="text-3xl font-black mb-3" style={{ color: 'var(--app-text)' }}>Invalid Reset Link</h2>
        <p className="text-sm mb-8 leading-relaxed" style={{ color: 'var(--app-text-secondary)' }}>
          This password reset link is invalid, expired, or has already been used. Please request a new one.
        </p>
        <Link href="/forgot-password"
          className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl font-bold text-sm text-white transition-all active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg, #41017d 0%, #c026d3 100%)', boxShadow: '0 4px 24px rgba(65,1,125,0.35)' }}>
          Request New Link
        </Link>
        <Link href="/login" className="block mt-4 text-sm font-semibold hover:underline" style={{ color: 'var(--app-primary)' }}>
          Back to sign in
        </Link>
      </div>
    </div>
  );

  // Success state
  if (success) return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: 'var(--app-bg)' }}>
      <div className="w-full max-w-md text-center">
        <div className="h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: 'rgba(34,197,94,0.1)', border: '2px solid rgba(34,197,94,0.2)' }}>
          <CheckCircle className="h-10 w-10 text-emerald-500" />
        </div>
        <h2 className="text-3xl font-black mb-3" style={{ color: 'var(--app-text)' }}>Password Updated!</h2>
        <p className="text-sm mb-6 leading-relaxed" style={{ color: 'var(--app-text-secondary)' }}>
          Your password has been reset successfully. Redirecting you to the login page...
        </p>
        <div className="flex items-center justify-center gap-2 mb-8">
          <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
          <span className="text-xs" style={{ color: 'var(--app-text-muted)' }}>Redirecting in 3 seconds</span>
        </div>
        <Link href="/login"
          className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl font-bold text-sm text-white transition-all active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg, #41017d 0%, #c026d3 100%)', boxShadow: '0 4px 24px rgba(65,1,125,0.35)' }}>
          Go to Sign In Now
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--app-bg)' }}>
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-[45%] relative flex-col justify-between p-12 overflow-hidden" style={{ background: 'linear-gradient(145deg, #1a0033 0%, #2d0060 50%, #4a007a 100%)' }}>
        <div className="absolute top-[-80px] right-[-80px] w-[320px] h-[320px] rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #c026d3, transparent 70%)' }} />
        <div className="absolute bottom-[-100px] left-[-60px] w-[280px] h-[280px] rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #7c3aed, transparent 70%)' }} />

        <Link href="/" className="flex items-center gap-3 relative z-10">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl" style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}>
            <FileText className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-black text-white tracking-tight">FlowCV</span>
        </Link>

        <div className="relative z-10">
          <div className="h-20 w-20 rounded-3xl flex items-center justify-center mb-8" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
            <ShieldCheck className="h-10 w-10 text-purple-300" />
          </div>
          <h1 className="text-4xl font-black text-white leading-tight mb-4">
            Secure your<br />
            <span style={{ background: 'linear-gradient(90deg, #c084fc, #f0abfc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              account
            </span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)' }}>
            Choose a strong, unique password to keep your resume data safe and secure.
          </p>
        </div>

        <div className="relative z-10 space-y-3">
          {['At least 8 characters', 'Mix of uppercase & lowercase', 'Include numbers or symbols'].map(tip => (
            <div key={tip} className="flex items-center gap-3">
              <div className="h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(34,197,94,0.2)' }}>
                <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
              </div>
              <span className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>{tip}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16 xl:px-24">
        <div className="lg:hidden mb-10">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl" style={{ background: 'linear-gradient(135deg, #41017d, #c026d3)' }}>
              <FileText className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight" style={{ color: 'var(--app-text)' }}>FlowCV</span>
          </Link>
        </div>

        <div className="w-full max-w-md mx-auto">
          <Link href="/login" className="inline-flex items-center gap-2 text-sm font-semibold mb-8 transition-colors hover:opacity-70" style={{ color: 'var(--app-text-secondary)' }}>
            <ArrowLeft className="h-4 w-4" /> Back to login
          </Link>

          <div className="mb-8">
            <h2 className="text-3xl font-black mb-2" style={{ color: 'var(--app-text)' }}>Set new password</h2>
            <p className="text-sm" style={{ color: 'var(--app-text-secondary)' }}>Choose a strong password for your account.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {error && (
              <div className="flex items-center gap-3 rounded-2xl p-4 text-sm" style={{ backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}>
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* New Password */}
            <div className="space-y-1.5">
              <label htmlFor="rp-password" className="block text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--app-text-secondary)' }}>New Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none transition-colors" style={{ color: focused === 'password' ? 'var(--app-primary)' : 'var(--app-text-muted)' }} />
                <input id="rp-password" name="password" type={showPassword ? 'text' : 'password'} required minLength={8}
                  value={password} onChange={e => setPassword(e.target.value)} onFocus={() => setFocused('password')} onBlur={() => setFocused(null)}
                  placeholder="Min. 8 characters" className="w-full pl-11 pr-12 py-3.5 rounded-2xl text-sm font-medium outline-none transition-all duration-200" style={inputStyle('password')} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors" style={{ color: 'var(--app-text-muted)' }}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {/* Password strength bar */}
              {password && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300" style={{ backgroundColor: i <= strength ? strengthColor : 'var(--app-border)' }} />
                    ))}
                  </div>
                  <p className="text-xs font-semibold" style={{ color: strengthColor }}>{strengthLabel}</p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label htmlFor="rp-confirm" className="block text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--app-text-secondary)' }}>Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none transition-colors" style={{ color: focused === 'confirm' ? 'var(--app-primary)' : 'var(--app-text-muted)' }} />
                <input id="rp-confirm" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} required
                  value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} onFocus={() => setFocused('confirm')} onBlur={() => setFocused(null)}
                  placeholder="Repeat your password" className="w-full pl-11 pr-12 py-3.5 rounded-2xl text-sm font-medium outline-none transition-all duration-200" style={inputStyle('confirm')} />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors" style={{ color: 'var(--app-text-muted)' }}>
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {confirmPassword && (
                <p className="text-xs font-semibold flex items-center gap-1.5" style={{ color: password === confirmPassword ? '#22c55e' : '#ef4444' }}>
                  {password === confirmPassword ? <><CheckCircle className="h-3.5 w-3.5" /> Passwords match</> : <><AlertCircle className="h-3.5 w-3.5" /> Passwords don't match</>}
                </p>
              )}
            </div>

            {/* Submit */}
            <button type="submit" disabled={isLoading}
              className="w-full py-3.5 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] disabled:opacity-70"
              style={{ background: 'linear-gradient(135deg, #41017d 0%, #c026d3 100%)', boxShadow: '0 4px 24px rgba(65,1,125,0.35)' }}>
              {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Resetting...</> : <><ShieldCheck className="h-4 w-4" /> Reset Password</>}
            </button>

            <p className="text-center text-xs" style={{ color: 'var(--app-text-muted)' }}>
              <Link href="/login" className="font-bold hover:underline" style={{ color: 'var(--app-primary)' }}>Back to sign in</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--app-bg)' }}>
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#41017d' }} />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
