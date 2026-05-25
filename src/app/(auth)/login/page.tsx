'use client';

import { useState, Suspense, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FileText, Eye, EyeOff, Loader2, AlertCircle, Mail, Lock, ArrowRight, Sparkles, Shield, Zap } from 'lucide-react';

function LoginForm() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'authenticated') router.replace(callbackUrl);
  }, [status, router, callbackUrl]);

  useEffect(() => {
    const errorParam = searchParams.get('error');
    const registered = searchParams.get('registered');

    if (registered === 'true') {
      setNotice('Account created successfully. Sign in to continue.');
    } else {
      setNotice('');
    }

    if (errorParam) {
      setError(
        errorParam === 'CredentialsSignin'
          ? 'Invalid email or password'
          : 'Authentication failed. Please try again.'
      );
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNotice('');
    if (!email || !password) { setError('Please enter both email and password'); return; }
    setLoading(true);
    try {
      const result = await signIn('credentials', {
        email: email.toLowerCase().trim(),
        password,
        redirect: false,
        callbackUrl,
      });
      if (result?.error) {
        setError(result.error === 'CredentialsSignin' ? 'Invalid email or password' : 'Login failed. Please try again.');
      } else if (result?.ok) {
        router.push(result.url || callbackUrl);
        router.refresh();
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--app-primary)' }} />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {error && (
        <div className="flex items-center gap-3 rounded-2xl p-4 text-sm" style={{ backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}>
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {notice && (
        <div className="flex items-center gap-3 rounded-2xl p-4 text-sm" style={{ backgroundColor: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#059669' }}>
          <Sparkles className="h-4 w-4 flex-shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Email */}
      <div className="space-y-1.5">
        <label htmlFor="login-email" className="block text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--app-text-secondary)' }}>
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none transition-colors duration-200" style={{ color: focused === 'email' ? 'var(--app-primary)' : 'var(--app-text-muted)' }} />
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            onFocus={() => setFocused('email')}
            onBlur={() => setFocused(null)}
            placeholder="you@example.com"
            className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm font-medium outline-none transition-all duration-200"
            style={{
              backgroundColor: 'var(--app-bg-elevated)',
              border: `1.5px solid ${focused === 'email' ? 'var(--app-primary)' : 'var(--app-border)'}`,
              color: 'var(--app-text)',
              boxShadow: focused === 'email' ? '0 0 0 3px rgba(65,1,125,0.08)' : 'none',
            }}
          />
        </div>
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <label htmlFor="login-password" className="block text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--app-text-secondary)' }}>
            Password
          </label>
          <Link href="/forgot-password" className="text-xs font-semibold hover:underline transition-all" style={{ color: 'var(--app-primary)' }}>
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none transition-colors duration-200" style={{ color: focused === 'password' ? 'var(--app-primary)' : 'var(--app-text-muted)' }} />
          <input
            id="login-password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            onFocus={() => setFocused('password')}
            onBlur={() => setFocused(null)}
            placeholder="Enter your password"
            className="w-full pl-11 pr-12 py-3.5 rounded-2xl text-sm font-medium outline-none transition-all duration-200"
            style={{
              backgroundColor: 'var(--app-bg-elevated)',
              border: `1.5px solid ${focused === 'password' ? 'var(--app-primary)' : 'var(--app-border)'}`,
              color: 'var(--app-text)',
              boxShadow: focused === 'password' ? '0 0 0 3px rgba(65,1,125,0.08)' : 'none',
            }}
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors duration-200" style={{ color: 'var(--app-text-muted)' }}>
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] disabled:opacity-70"
        style={{ background: 'linear-gradient(135deg, #41017d 0%, #c026d3 100%)', boxShadow: '0 4px 24px rgba(65,1,125,0.35)' }}
      >
        {loading ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Signing in...</>
        ) : (
          <> Sign In <ArrowRight className="h-4 w-4" /></>
        )}
      </button>

      <p className="text-center text-xs" style={{ color: 'var(--app-text-muted)' }}>
        Don't have an account?{' '}
        <Link href="/register" className="font-bold hover:underline" style={{ color: 'var(--app-primary)' }}>
          Create one for free
        </Link>
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--app-bg)' }}>
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-[45%] relative flex-col justify-between p-12 overflow-hidden" style={{ background: 'linear-gradient(145deg, #1a0033 0%, #2d0060 50%, #4a007a 100%)' }}>
        {/* Static decorative circles — NO animation */}
        <div className="absolute top-[-80px] right-[-80px] w-[320px] h-[320px] rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #c026d3, transparent 70%)' }} />
        <div className="absolute bottom-[-100px] left-[-60px] w-[280px] h-[280px] rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #7c3aed, transparent 70%)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-5" style={{ background: 'radial-gradient(circle, #ffffff, transparent 70%)' }} />

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 relative z-10">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)' }}>
            <FileText className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-black text-white tracking-tight">FlowCV</span>
        </Link>

        {/* Center content */}
        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="text-5xl font-black text-white leading-tight mb-4">
              Build your<br />
              <span style={{ background: 'linear-gradient(90deg, #c084fc, #f0abfc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                dream resume
              </span>
            </h1>
            <p className="text-lg" style={{ color: 'rgba(255,255,255,0.65)' }}>
              Create a professional resume in minutes with AI-powered tools and beautiful templates.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { icon: Sparkles, label: 'AI-powered content suggestions' },
              { icon: Shield, label: 'ATS-optimized templates' },
              { icon: Zap, label: 'Export to PDF in one click' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
                  <Icon className="h-4 w-4 text-purple-300" />
                </div>
                <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <div className="relative z-10 rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <p className="text-sm italic leading-relaxed mb-3" style={{ color: 'rgba(255,255,255,0.7)' }}>
            "FlowCV helped me land my dream job. The AI suggestions made my resume stand out!"
          </p>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-purple-500/40 flex items-center justify-center text-xs font-bold text-white">A</div>
            <div>
              <p className="text-xs font-bold text-white">Alex Johnson</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>Software Engineer @ Google</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16 xl:px-24">
        {/* Mobile logo */}
        <div className="lg:hidden mb-10">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl" style={{ background: 'linear-gradient(135deg, #41017d, #c026d3)' }}>
              <FileText className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight" style={{ color: 'var(--app-text)' }}>FlowCV</span>
          </Link>
        </div>

        <div className="w-full max-w-md mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-black mb-2" style={{ color: 'var(--app-text)' }}>Welcome back</h2>
            <p className="text-sm" style={{ color: 'var(--app-text-secondary)' }}>Sign in to continue building your resume</p>
          </div>

          <Suspense fallback={<div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin" style={{ color: 'var(--app-primary)' }} /></div>}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
