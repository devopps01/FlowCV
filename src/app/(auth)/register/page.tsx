'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import Link from 'next/link';
import { FileText, Eye, EyeOff, Loader2, AlertCircle, Check, User, Mail, Lock, ArrowRight, Sparkles, Shield, Zap } from 'lucide-react';

function RegisterForm() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'authenticated') router.replace(redirect || '/dashboard');
  }, [status, router, redirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) { setError('Please enter your full name'); return; }
    if (!email) { setError('Please enter your email'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Registration failed'); return; }

      const result = await signIn('credentials', { email: email.toLowerCase().trim(), password, redirect: false });
      if (result?.ok) {
        router.push(redirect || '/dashboard');
        router.refresh();
      } else {
        router.push('/login?registered=true');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--app-primary)' }} />
    </div>
  );

  const inputStyle = (field: string) => ({
    backgroundColor: 'var(--app-bg-elevated)',
    border: `1.5px solid ${focused === field ? 'var(--app-primary)' : 'var(--app-border)'}`,
    color: 'var(--app-text)',
    boxShadow: focused === field ? '0 0 0 3px rgba(65,1,125,0.08)' : 'none',
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {error && (
        <div className="flex items-center gap-3 rounded-2xl p-4 text-sm" style={{ backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}>
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Full Name */}
      <div className="space-y-1.5">
        <label htmlFor="reg-name" className="block text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--app-text-secondary)' }}>Full Name</label>
        <div className="relative">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none transition-colors" style={{ color: focused === 'name' ? 'var(--app-primary)' : 'var(--app-text-muted)' }} />
          <input id="reg-name" name="name" type="text" autoComplete="name" required value={name} onChange={e => setName(e.target.value)} onFocus={() => setFocused('name')} onBlur={() => setFocused(null)} placeholder="John Doe"
            className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm font-medium outline-none transition-all duration-200" style={inputStyle('name')} />
        </div>
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <label htmlFor="reg-email" className="block text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--app-text-secondary)' }}>Email Address</label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none transition-colors" style={{ color: focused === 'email' ? 'var(--app-primary)' : 'var(--app-text-muted)' }} />
          <input id="reg-email" name="email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} onFocus={() => setFocused('email')} onBlur={() => setFocused(null)} placeholder="you@example.com"
            className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm font-medium outline-none transition-all duration-200" style={inputStyle('email')} />
        </div>
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <label htmlFor="reg-password" className="block text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--app-text-secondary)' }}>Password</label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none transition-colors" style={{ color: focused === 'password' ? 'var(--app-primary)' : 'var(--app-text-muted)' }} />
          <input id="reg-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required value={password} onChange={e => setPassword(e.target.value)} onFocus={() => setFocused('password')} onBlur={() => setFocused(null)} placeholder="Min. 6 characters"
            className="w-full pl-11 pr-12 py-3.5 rounded-2xl text-sm font-medium outline-none transition-all duration-200" style={inputStyle('password')} />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors" style={{ color: 'var(--app-text-muted)' }}>
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Confirm Password */}
      <div className="space-y-1.5">
        <label htmlFor="reg-confirm" className="block text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--app-text-secondary)' }}>Confirm Password</label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none transition-colors" style={{ color: focused === 'confirm' ? 'var(--app-primary)' : 'var(--app-text-muted)' }} />
          <input id="reg-confirm" name="confirmPassword" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} onFocus={() => setFocused('confirm')} onBlur={() => setFocused(null)} placeholder="Confirm your password"
            className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm font-medium outline-none transition-all duration-200" style={inputStyle('confirm')} />
          {confirmPassword && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              {password === confirmPassword
                ? <Check className="h-4 w-4 text-emerald-500" />
                : <AlertCircle className="h-4 w-4 text-red-400" />}
            </div>
          )}
        </div>
      </div>

      {/* Terms */}
      <label className="flex items-start gap-3 cursor-pointer">
        <input id="terms" name="terms" type="checkbox" required className="mt-0.5 h-4 w-4 rounded accent-purple-600 cursor-pointer flex-shrink-0" />
        <span className="text-xs leading-relaxed" style={{ color: 'var(--app-text-secondary)' }}>
          I agree to the{' '}
          <Link href="/terms-of-service" className="font-semibold hover:underline" style={{ color: 'var(--app-primary)' }}>Terms of Service</Link>{' '}
          and{' '}
          <Link href="/privacy-policy" className="font-semibold hover:underline" style={{ color: 'var(--app-primary)' }}>Privacy Policy</Link>
        </span>
      </label>

      {/* Submit */}
      <button type="submit" disabled={loading}
        className="w-full py-3.5 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] disabled:opacity-70"
        style={{ background: 'linear-gradient(135deg, #41017d 0%, #c026d3 100%)', boxShadow: '0 4px 24px rgba(65,1,125,0.35)' }}>
        {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating Account...</> : <> Create Account <ArrowRight className="h-4 w-4" /></>}
      </button>

      <div className="flex items-center justify-center gap-1.5">
        <Check className="h-3.5 w-3.5 text-emerald-500" />
        <span className="text-xs font-medium" style={{ color: 'var(--app-text-muted)' }}>Free forever — No credit card required</span>
      </div>

      <p className="text-center text-xs" style={{ color: 'var(--app-text-muted)' }}>
        Already have an account?{' '}
        <Link href="/login" className="font-bold hover:underline" style={{ color: 'var(--app-primary)' }}>Sign in</Link>
      </p>
    </form>
  );
}

export default function RegisterPage() {
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

        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="text-5xl font-black text-white leading-tight mb-4">
              Start your<br />
              <span style={{ background: 'linear-gradient(90deg, #c084fc, #f0abfc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                career journey
              </span>
            </h1>
            <p className="text-lg" style={{ color: 'rgba(255,255,255,0.65)' }}>
              Join thousands of professionals who have landed their dream jobs using FlowCV.
            </p>
          </div>
          <div className="space-y-4">
            {[
              { icon: Sparkles, label: 'AI writes your resume content' },
              { icon: Shield, label: 'Beat Applicant Tracking Systems' },
              { icon: Zap, label: '100+ professional templates' },
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

        <div className="relative z-10 rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <p className="text-sm italic leading-relaxed mb-3" style={{ color: 'rgba(255,255,255,0.7)' }}>
            "I created my resume in 20 minutes and got 3 interview calls the next week!"
          </p>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-pink-500/40 flex items-center justify-center text-xs font-bold text-white">S</div>
            <div>
              <p className="text-xs font-bold text-white">Sarah Chen</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>Product Manager @ Meta</p>
            </div>
          </div>
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
          <div className="mb-7">
            <h2 className="text-3xl font-black mb-2" style={{ color: 'var(--app-text)' }}>Create your account</h2>
            <p className="text-sm" style={{ color: 'var(--app-text-secondary)' }}>Free forever. No credit card needed.</p>
          </div>

          <Suspense fallback={<div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin" style={{ color: 'var(--app-primary)' }} /></div>}>
            <RegisterForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
