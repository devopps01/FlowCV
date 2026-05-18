'use client';

import { useState, Suspense, useEffect } from 'react';
import { signIn, getSession, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FileText, Eye, EyeOff, Loader2, AlertCircle, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

function LoginForm() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Redirect if already logged in via Session or LocalStorage
    const userInStorage = localStorage.getItem('user');
    if (status === 'authenticated' || userInStorage) {
      router.replace('/dashboard');
    }
  }, [status, router]);

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      setError('Authentication failed. Please try again.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Please enter both email and password');
      setLoading(false);
      return;
    }

    try {
      const result = await signIn('credentials', {
        email: email.toLowerCase().trim(),
        password: password,
        redirect: false,
      });

      if (result?.error) {
        if (result.error === 'CredentialsSignin') {
          setError('Invalid email or password');
          toast.error('Invalid email or password');
        } else {
          setError('Login failed. Please try again.');
          toast.error('Login failed. Please try again.');
        }
      } else if (result?.ok) {
        // Get session data to store in localStorage
        const session = await getSession();
        if (session?.user) {
          localStorage.setItem('user', JSON.stringify(session.user));
        }
        toast.success('Welcome back!');
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'authenticated') {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-[#41017d]" />
      </div>
    );
  }

  return (
    <div className="glass-card py-10 px-6 sm:px-10 shadow-2xl border border-white/10 dark:border-gray-800/50 relative z-10 overflow-hidden">
      {/* Background card glow subtle details */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl pointer-events-none" />

      <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
        {error && (
          <div className="flex items-center gap-3 rounded-xl p-4 text-sm animate-fade-in"
               style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider mb-2"
                style={{ color: 'var(--app-text-secondary)' }}>
            Email Address
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-[#41017d]"
                 style={{ color: 'var(--app-text-muted)' }}>
              <Mail className="h-5 w-5" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 hover:border-purple-300 dark:hover:border-purple-800"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                borderColor: 'var(--app-border)',
                color: 'var(--app-text)'
              }}
              placeholder="you@example.com"
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider"
                  style={{ color: 'var(--app-text-secondary)' }}>
              Password
            </label>
            <Link href="/forgot-password" className="text-xs font-bold hover:underline transition-all"
                  style={{ color: 'var(--app-primary)' }}>
              Forgot password?
            </Link>
          </div>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-[#41017d]"
                 style={{ color: 'var(--app-text-muted)' }}>
              <Lock className="h-5 w-5" />
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-11 pr-12 py-3.5 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 hover:border-purple-300 dark:hover:border-purple-800"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                borderColor: 'var(--app-border)',
                color: 'var(--app-text)'
              }}
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              style={{ color: 'var(--app-text-muted)' }}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary py-3.5 relative overflow-hidden active:scale-[0.98] transition-transform"
        >
          <span className="relative z-10 flex items-center justify-center font-bold text-base tracking-wide">
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </span>
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-500" 
         style={{ backgroundColor: 'var(--app-bg)' }}>
      
      {/* Decorative Interactive Background Blobs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-purple-600/10 dark:bg-purple-500/15 rounded-full blur-[100px] pointer-events-none animate-float" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[300px] sm:w-[450px] h-[300px] sm:h-[450px] bg-pink-500/10 dark:bg-pink-500/15 rounded-full blur-[100px] pointer-events-none animate-float" style={{ animationDelay: '-3s' }} />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link href="/" className="flex items-center justify-center gap-3 mb-8 group">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl shadow-lg transition-transform duration-300 group-hover:scale-105"
               style={{ background: 'linear-gradient(135deg, #41017d 0%, #ee14ff 100%)' }}>
            <FileText className="h-6 w-6 text-white" />
          </div>
          <span className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500 dark:from-purple-400 dark:to-pink-400">
            FlowCV
          </span>
        </Link>
        
        <h2 className="text-center text-4xl font-extrabold tracking-tight mb-2" style={{ color: 'var(--app-text)' }}>
          Welcome Back
        </h2>
        
        <p className="text-center text-sm mb-8" style={{ color: 'var(--app-text-secondary)' }}>
          Don't have an account?{' '}
          <Link href="/register" className="font-bold hover:underline transition-all"
                style={{ color: 'var(--app-primary)' }}>
            Create one for free
          </Link>
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Suspense fallback={
          <div className="glass-card py-12 px-10 flex items-center justify-center"
               style={{ backgroundColor: 'var(--app-bg)', borderColor: 'var(--app-border)' }}>
            <Loader2 className="h-10 w-10 animate-spin" style={{ color: 'var(--app-primary)' }} />
          </div>
        }>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
