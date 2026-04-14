'use client';

import { useState, Suspense, useEffect } from 'react';
import { signIn, getSession, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FileText, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    <div className="bg-white py-8 px-4 shadow-sm border border-gray-100 sm:rounded-xl sm:px-10"
         style={{ backgroundColor: 'var(--app-bg)', borderColor: 'var(--app-border)' }}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="flex items-center gap-2 rounded-lg p-3 text-sm"
               style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2"
                style={{ color: 'var(--app-text)' }}>
            Email address
          </label>
          <div className="relative">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'var(--app-bg)',
                borderColor: 'var(--app-border)',
                color: 'var(--app-text)'
              }}
              placeholder="you@example.com"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-2"
                style={{ color: 'var(--app-text)' }}>
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'var(--app-bg)',
                borderColor: 'var(--app-border)',
                color: 'var(--app-text)'
              }}
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors hover:opacity-80"
              style={{ color: 'var(--app-text-muted)' }}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary relative overflow-hidden"
        >
          <span className="relative z-10 flex items-center justify-center">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </span>
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link href="/forgot-password" className="text-sm font-medium hover:opacity-80 transition-opacity"
              style={{ color: 'var(--app-primary)' }}>
          Forgot password?
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-500" style={{ backgroundColor: 'var(--app-bg)' }}>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg"
               style={{ backgroundColor: 'var(--app-primary)' }}>
            <FileText className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold" style={{ color: 'var(--app-text)' }}>FlowCV</span>
        </Link>
        <h2 className="text-center text-3xl font-bold" style={{ color: 'var(--app-text)' }}>
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm" style={{ color: 'var(--app-text-secondary)' }}>
          Or{' '}
          <Link href="/register" className="font-medium hover:opacity-80 transition-opacity"
                style={{ color: 'var(--app-primary)' }}>
            create a free account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Suspense fallback={
          <div className="bg-white py-8 px-4 shadow-sm border border-gray-100 sm:rounded-xl sm:px-10 flex items-center justify-center"
               style={{ backgroundColor: 'var(--app-bg)', borderColor: 'var(--app-border)' }}>
            <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--app-primary)' }} />
          </div>
        }>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
