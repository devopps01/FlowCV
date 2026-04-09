'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, getSession, useSession } from 'next-auth/react';
import Link from 'next/link';
import { FileText, Eye, EyeOff, Loader2, AlertCircle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';

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

  useEffect(() => {
    const userInStorage = localStorage.getItem('user');
    if (status === 'authenticated' || userInStorage) {
      router.replace(redirect || '/dashboard');
    }
  }, [status, router, redirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed');
        toast.error(data.error || 'Registration failed');
        setLoading(false);
        return;
      }

      toast.success('Account created successfully!');

      const result = await signIn('credentials', {
        email: email.toLowerCase().trim(),
        password: password,
        redirect: false,
      });

      if (result?.ok) {
        const session = await getSession();
        if (session?.user) {
          localStorage.setItem('user', JSON.stringify(session.user));
        }
        router.push(redirect || '/dashboard');
        router.refresh();
      } else {
        router.push('/login?registered=true');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  if (status === 'authenticated') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

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
          Create your free account
        </h2>
        <p className="mt-2 text-center text-sm" style={{ color: 'var(--app-text-secondary)' }}>
          Already have an account?{' '}
          <Link href="/login" className="font-medium hover:opacity-80 transition-opacity"
                style={{ color: 'var(--app-primary)' }}>
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
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
              <label htmlFor="name" className="block text-sm font-medium mb-2"
                    style={{ color: 'var(--app-text)' }}>
                Full name
              </label>
              <div className="relative">
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--app-bg)',
                    borderColor: 'var(--app-border)',
                    color: 'var(--app-text)'
                  }}
                  placeholder="John Doe"
                />
              </div>
            </div>

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
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--app-bg)',
                    borderColor: 'var(--app-border)',
                    color: 'var(--app-text)'
                  }}
                  placeholder="Minimum 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors hover:opacity-80"
                  style={{ color: 'var(--app-text-muted)' }}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2"
                    style={{ color: 'var(--app-text)' }}>
                Confirm password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--app-bg)',
                    borderColor: 'var(--app-border)',
                    color: 'var(--app-text)'
                  }}
                  placeholder="Confirm your password"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-start">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className="h-4 w-4 rounded border-gray-300 mt-1"
                  style={{ color: 'var(--app-primary)' }}
                />
                <span className="ml-2 block text-sm" style={{ color: 'var(--app-text-secondary)' }}>
                  I agree to the{' '}
                  <Link href="/terms-of-service" className="font-medium hover:opacity-80 transition-opacity"
                        style={{ color: 'var(--app-primary)' }}>
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy-policy" className="font-medium hover:opacity-80 transition-opacity"
                        style={{ color: 'var(--app-primary)' }}>
                    Privacy Policy
                  </Link>
                </span>
              </label>
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
                    Creating account...
                  </>
                ) : (
                  <>
                    Create account
                    <Check className="ml-2 h-4 w-4" />
                  </>
                )}
              </span>
            </button>
          </form>

          <div className="mt-6 text-center text-sm" style={{ color: 'var(--app-text-muted)' }}>
            <p>
              <Check className="inline h-4 w-4 mr-1" style={{ color: '#22c55e' }} />
              Free forever - No credit card required
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
