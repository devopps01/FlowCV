'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { CommonHeader } from '@/components/layout/CommonHeader';
import { useTheme } from '@/hooks/useTheme';

export default function ResetPasswordPage() {
  const { isDark } = useTheme();
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
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token');
      setIsTokenValid(false);
      return;
    }

    // TODO: Validate token with API
    // For now, we'll assume it's valid
    setIsTokenValid(true);
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setError(data.error || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isTokenValid === null) {
    return (
      <div className="min-h-screen transition-colors duration-500" style={{ backgroundColor: 'var(--app-bg)' }}>
        <CommonHeader />
        <main className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" style={{ color: 'var(--app-primary)' }} />
            <p style={{ color: 'var(--app-text)' }}>Validating reset token...</p>
          </div>
        </main>
      </div>
    );
  }

  if (isTokenValid === false) {
    return (
      <div className="min-h-screen transition-colors duration-500" style={{ backgroundColor: 'var(--app-bg)' }}>
        <CommonHeader />
        <main className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full text-center">
            <AlertCircle className="h-16 w-16 mx-auto mb-4" style={{ color: '#ef4444' }} />
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--app-text)' }}>
              Invalid Reset Link
            </h2>
            <p className="mb-8" style={{ color: 'var(--app-text-secondary)' }}>
              This password reset link is invalid or has expired.
            </p>
            <Link href="/forgot-password" className="btn-primary">
              Request new reset link
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen transition-colors duration-500" style={{ backgroundColor: 'var(--app-bg)' }}>
        <CommonHeader />
        <main className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full text-center">
            <CheckCircle className="h-16 w-16 mx-auto mb-4" style={{ color: '#22c55e' }} />
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--app-text)' }}>
              Password Reset Successfully
            </h2>
            <p className="mb-8" style={{ color: 'var(--app-text-secondary)' }}>
              Your password has been updated. You will be redirected to the login page shortly.
            </p>
            <Link href="/login" className="btn-primary">
              Go to login
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-colors duration-500" style={{ backgroundColor: 'var(--app-bg)' }}>
      <CommonHeader />
      
      <main className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-md w-full space-y-8">
          {/* Back to Login */}
          <Link 
            href="/login" 
            className="inline-flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80 mb-8"
            style={{ color: 'var(--app-text-secondary)' }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>

          {/* Header */}
          <div className="text-center">
            <div 
              className="mx-auto h-16 w-16 rounded-full flex items-center justify-center mb-6"
              style={{ backgroundColor: 'var(--app-primary)' }}
            >
              <Lock className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold" style={{ color: 'var(--app-text)' }}>
              Reset your password
            </h2>
            <p className="mt-2 text-sm" style={{ color: 'var(--app-text-secondary)' }}>
              Enter your new password below.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="rounded-xl p-4 flex items-center gap-3"
                   style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                <AlertCircle className="h-5 w-5 flex-shrink-0" style={{ color: '#ef4444' }} />
                <p className="text-sm" style={{ color: '#ef4444' }}>
                  {error}
                </p>
              </div>
            )}

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2"
                    style={{ color: 'var(--app-text)' }}>
                New password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5"
                      style={{ color: 'var(--app-text-muted)' }} />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--app-bg)',
                    borderColor: 'var(--app-border)',
                    color: 'var(--app-text)'
                  }}
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  style={{ color: 'var(--app-text-muted)' }}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2"
                    style={{ color: 'var(--app-text)' }}>
                Confirm new password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5"
                      style={{ color: 'var(--app-text-muted)' }} />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--app-bg)',
                    borderColor: 'var(--app-border)',
                    color: 'var(--app-text)'
                  }}
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  style={{ color: 'var(--app-text-muted)' }}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="text-xs space-y-1" style={{ color: 'var(--app-text-muted)' }}>
              <p>Password must:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Be at least 8 characters long</li>
                <li>Match the confirmation password</li>
              </ul>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center">
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Resetting password...
                  </>
                ) : (
                  <>
                    Reset password
                    <Lock className="ml-2 h-4 w-4" />
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Additional Links */}
          <div className="text-center">
            <Link 
              href="/login" 
              className="text-sm font-medium hover:opacity-80 transition-opacity"
              style={{ color: 'var(--app-primary)' }}
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
