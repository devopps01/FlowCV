'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, Loader2, ArrowLeft, FileText } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

function ResetPasswordContent() {
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

    // Assume token is valid on client side
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
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: 'var(--app-bg)' }}>
        {/* Decorative Background Blobs */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none animate-float" />
        <div className="text-center relative z-10">
          <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4" style={{ color: 'var(--app-primary)' }} />
          <p className="font-medium" style={{ color: 'var(--app-text)' }}>Validating reset token...</p>
        </div>
      </div>
    );
  }

  if (isTokenValid === false) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden" style={{ backgroundColor: 'var(--app-bg)' }}>
        {/* Decorative Background Blobs */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-red-600/5 rounded-full blur-[100px] pointer-events-none animate-float" />
        
        <div className="glass-card max-w-md w-full text-center py-10 px-6 sm:px-10 shadow-2xl border border-white/10 dark:border-gray-800/50 relative z-10 overflow-hidden">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="mx-auto h-16 w-16 rounded-full flex items-center justify-center mb-6"
               style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>

          <h2 className="text-2xl font-extrabold mb-3" style={{ color: 'var(--app-text)' }}>
            Invalid Reset Link
          </h2>
          <p className="text-sm mb-8 leading-relaxed" style={{ color: 'var(--app-text-secondary)' }}>
            This password reset link is invalid, expired, or has already been used.
          </p>
          <Link href="/forgot-password" className="btn-primary w-full py-3 px-6 rounded-xl flex items-center justify-center font-bold">
            Request New Reset Link
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden" style={{ backgroundColor: 'var(--app-bg)' }}>
        {/* Decorative Background Blobs */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-green-600/5 rounded-full blur-[100px] pointer-events-none animate-float" />

        <div className="glass-card max-w-md w-full text-center py-10 px-6 sm:px-10 shadow-2xl border border-white/10 dark:border-gray-800/50 relative z-10 overflow-hidden">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-green-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="mx-auto h-16 w-16 rounded-full flex items-center justify-center mb-6"
               style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>

          <h2 className="text-2xl font-extrabold mb-3" style={{ color: 'var(--app-text)' }}>
            Password Reset Success
          </h2>
          <p className="text-sm mb-8 leading-relaxed" style={{ color: 'var(--app-text-secondary)' }}>
            Your password has been updated successfully. You will be redirected to the login page shortly.
          </p>
          <Link href="/login" className="btn-primary w-full py-3 px-6 rounded-xl flex items-center justify-center font-bold">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-500" 
         style={{ backgroundColor: 'var(--app-bg)' }}>
      
      {/* Decorative Background Blobs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-purple-600/10 dark:bg-purple-500/15 rounded-full blur-[100px] pointer-events-none animate-float" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[300px] sm:w-[450px] h-[300px] sm:h-[450px] bg-pink-500/10 dark:bg-pink-500/15 rounded-full blur-[100px] pointer-events-none animate-float" style={{ animationDelay: '-3s' }} />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link href="/" className="flex items-center justify-center gap-3 mb-6 group">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl shadow-lg transition-transform duration-300 group-hover:scale-105"
               style={{ background: 'linear-gradient(135deg, #41017d 0%, #ee14ff 100%)' }}>
            <FileText className="h-6 w-6 text-white" />
          </div>
          <span className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500 dark:from-purple-400 dark:to-pink-400">
            FlowCV
          </span>
        </Link>
        
        {/* Back to Login */}
        <div className="text-center mb-6">
          <Link 
            href="/login" 
            className="inline-flex items-center gap-2 text-sm font-bold transition-all hover:translate-x-[-2px]"
            style={{ color: 'var(--app-text-secondary)' }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="glass-card py-10 px-6 sm:px-10 shadow-2xl border border-white/10 dark:border-gray-800/50 relative z-10 overflow-hidden">
          {/* Background card glow subtle details */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Header */}
          <div className="text-center mb-8">
            <div 
              className="mx-auto h-14 w-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg"
              style={{ background: 'linear-gradient(135deg, #41017d 0%, #ee14ff 100%)' }}
            >
              <Lock className="h-7 w-7 text-white" />
            </div>
            <h2 className="text-3xl font-extrabold mb-2" style={{ color: 'var(--app-text)' }}>
              Reset Password
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--app-text-secondary)' }}>
              Enter your new password below.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-3 rounded-xl p-4 text-sm animate-fade-in"
                   style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider mb-2"
                    style={{ color: 'var(--app-text-secondary)' }}>
                New password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-[#41017d]"
                     style={{ color: 'var(--app-text-muted)' }}>
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3.5 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 hover:border-purple-300 dark:hover:border-purple-800"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    borderColor: 'var(--app-border)',
                    color: 'var(--app-text)'
                  }}
                  placeholder="Enter new password"
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

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-bold uppercase tracking-wider mb-2"
                    style={{ color: 'var(--app-text-secondary)' }}>
                Confirm new password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-[#41017d]"
                     style={{ color: 'var(--app-text-muted)' }}>
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3.5 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 hover:border-purple-300 dark:hover:border-purple-800"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    borderColor: 'var(--app-border)',
                    color: 'var(--app-text)'
                  }}
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  style={{ color: 'var(--app-text-muted)' }}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="text-[11px] font-medium leading-relaxed rounded-xl p-3 border border-white/5" style={{ backgroundColor: 'rgba(255, 255, 255, 0.01)', color: 'var(--app-text-muted)' }}>
              <p className="font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--app-text-secondary)' }}>Password must:</p>
              <ul className="list-disc list-inside space-y-0.5 ml-1">
                <li>Be at least 8 characters long</li>
                <li>Match the confirmation password</li>
              </ul>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3.5 relative overflow-hidden active:scale-[0.98] transition-transform"
            >
              <span className="relative z-10 flex items-center justify-center font-bold text-base tracking-wide">
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Resetting password...
                  </>
                ) : (
                  <>
                    Reset Password
                    <Lock className="ml-2 h-5 w-5" />
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Additional Links */}
          <div className="mt-6 text-center border-t border-white/5 pt-4 text-xs font-bold uppercase tracking-wider">
            <Link 
              href="/login" 
              className="hover:underline transition-all"
              style={{ color: 'var(--app-primary)' }}
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[var(--app-bg)]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
