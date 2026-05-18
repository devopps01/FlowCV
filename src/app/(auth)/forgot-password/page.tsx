'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Loader2, FileText, ArrowRight, Send } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok) {
        setIsSubmitted(true);
      } else {
        setError(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
            <Mail className="h-10 w-10 text-purple-300" />
          </div>
          <h1 className="text-4xl font-black text-white leading-tight mb-4">
            Reset your<br />
            <span style={{ background: 'linear-gradient(90deg, #c084fc, #f0abfc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              password
            </span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)' }}>
            No worries! Enter your email and we'll send you a secure link to reset your password instantly.
          </p>
        </div>

        <div className="relative z-10 rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(34,197,94,0.2)' }}>
              <CheckCircle className="h-4 w-4 text-emerald-400" />
            </div>
            <p className="text-sm font-semibold text-white">Secure & encrypted</p>
          </div>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Reset links expire after 1 hour for your security.</p>
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

          {isSubmitted ? (
            /* Success state */
            <div className="text-center">
              <div className="h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: 'rgba(34,197,94,0.1)', border: '2px solid rgba(34,197,94,0.2)' }}>
                <CheckCircle className="h-10 w-10 text-emerald-500" />
              </div>
              <h2 className="text-3xl font-black mb-3" style={{ color: 'var(--app-text)' }}>Check your inbox</h2>
              <p className="text-sm leading-relaxed mb-8" style={{ color: 'var(--app-text-secondary)' }}>
                We've sent a password reset link to <strong style={{ color: 'var(--app-text)' }}>{email}</strong>. Check your spam folder if you don't see it.
              </p>
              <div className="rounded-2xl p-5 mb-6 text-left" style={{ backgroundColor: 'var(--app-bg-elevated)', border: '1px solid var(--app-border)' }}>
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--app-text-secondary)' }}>Next steps</p>
                <ol className="space-y-1.5 text-sm" style={{ color: 'var(--app-text-secondary)' }}>
                  <li className="flex items-start gap-2"><span className="font-bold text-purple-500 flex-shrink-0">1.</span> Open the email from FlowCV</li>
                  <li className="flex items-start gap-2"><span className="font-bold text-purple-500 flex-shrink-0">2.</span> Click the reset link</li>
                  <li className="flex items-start gap-2"><span className="font-bold text-purple-500 flex-shrink-0">3.</span> Set your new password</li>
                </ol>
              </div>
              <button onClick={() => { setIsSubmitted(false); setEmail(''); }}
                className="text-sm font-semibold hover:underline" style={{ color: 'var(--app-primary)' }}>
                Didn't receive it? Try again
              </button>
            </div>
          ) : (
            /* Form state */
            <>
              <div className="mb-8">
                <h2 className="text-3xl font-black mb-2" style={{ color: 'var(--app-text)' }}>Forgot password?</h2>
                <p className="text-sm" style={{ color: 'var(--app-text-secondary)' }}>Enter your email and we'll send you a reset link.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                {error && (
                  <div className="flex items-center gap-3 rounded-2xl p-4 text-sm" style={{ backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}>
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label htmlFor="fp-email" className="block text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--app-text-secondary)' }}>
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none transition-colors" style={{ color: focused ? 'var(--app-primary)' : 'var(--app-text-muted)' }} />
                    <input
                      id="fp-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      onFocus={() => setFocused(true)}
                      onBlur={() => setFocused(false)}
                      placeholder="you@example.com"
                      className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm font-medium outline-none transition-all duration-200"
                      style={{
                        backgroundColor: 'var(--app-bg-elevated)',
                        border: `1.5px solid ${focused ? 'var(--app-primary)' : 'var(--app-border)'}`,
                        color: 'var(--app-text)',
                        boxShadow: focused ? '0 0 0 3px rgba(65,1,125,0.08)' : 'none',
                      }}
                    />
                  </div>
                </div>

                <button type="submit" disabled={isLoading}
                  className="w-full py-3.5 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] disabled:opacity-70"
                  style={{ background: 'linear-gradient(135deg, #41017d 0%, #c026d3 100%)', boxShadow: '0 4px 24px rgba(65,1,125,0.35)' }}>
                  {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending...</> : <><Send className="h-4 w-4" /> Send Reset Link</>}
                </button>

                <p className="text-center text-xs" style={{ color: 'var(--app-text-muted)' }}>
                  Remember your password?{' '}
                  <Link href="/login" className="font-bold hover:underline" style={{ color: 'var(--app-primary)' }}>Sign in</Link>
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
