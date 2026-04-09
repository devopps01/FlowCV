'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Loader2, FileText } from 'lucide-react';
import { CommonHeader } from '@/components/layout/CommonHeader';
import { useTheme } from '@/hooks/useTheme';

export default function ForgotPasswordPage() {
  const { isDark } = useTheme();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Password reset instructions have been sent to your email.');
        setIsSubmitted(true);
      } else {
        setError(data.error || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
        
        {/* Back to Login */}
        <div className="text-center mb-6">
          <Link 
            href="/login" 
            className="inline-flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80"
            style={{ color: 'var(--app-text-secondary)' }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {/* Success Message */}
        {isSubmitted ? (
          <div className="bg-white py-8 px-4 shadow-sm border border-gray-100 sm:rounded-xl sm:px-10 text-center"
               style={{ backgroundColor: 'var(--app-bg)', borderColor: 'var(--app-border)' }}>
            <CheckCircle className="h-12 w-12 mx-auto mb-4" style={{ color: '#22c55e' }} />
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--app-text)' }}>
              Check your email
            </h3>
            <p className="text-sm mb-6" style={{ color: 'var(--app-text-secondary)' }}>
              {success}
            </p>
            <div className="space-y-2">
              <p className="text-xs" style={{ color: 'var(--app-text-muted)' }}>
                Didn&apos;t receive the email?
              </p>
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setSuccess('');
                }}
                className="text-xs font-medium hover:opacity-80 transition-opacity"
                style={{ color: 'var(--app-primary)' }}
              >
                Try again
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white py-8 px-4 shadow-sm border border-gray-100 sm:rounded-xl sm:px-10"
               style={{ backgroundColor: 'var(--app-bg)', borderColor: 'var(--app-border)' }}>
            {/* Header */}
            <div className="text-center mb-8">
              <div 
                className="mx-auto h-16 w-16 rounded-full flex items-center justify-center mb-6"
                style={{ backgroundColor: 'var(--app-primary)' }}
              >
                <Mail className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold" style={{ color: 'var(--app-text)' }}>
                Forgot your password?
              </h2>
              <p className="mt-2 text-sm" style={{ color: 'var(--app-text-secondary)' }}>
                Enter your email address and we&apos;ll send you a link to reset your password.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 rounded-lg p-3 text-sm"
                     style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2"
                      style={{ color: 'var(--app-text)' }}>
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5"
                        style={{ color: 'var(--app-text-muted)' }} />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: 'var(--app-bg)',
                      borderColor: 'var(--app-border)',
                      color: 'var(--app-text)'
                    }}
                    placeholder="Enter your email"
                  />
                </div>
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
                      Sending...
                    </>
                  ) : (
                    <>
                      Send reset link
                      <Mail className="ml-2 h-4 w-4" />
                    </>
                  )}
                </span>
              </button>
            </form>

            {/* Additional Links */}
            <div className="mt-6 text-center space-y-4">
              <div className="text-sm" style={{ color: 'var(--app-text-secondary)' }}>
                Remember your password?{' '}
                <Link 
                  href="/login" 
                  className="font-medium hover:opacity-80 transition-opacity"
                  style={{ color: 'var(--app-primary)' }}
                >
                  Sign in
                </Link>
              </div>
              
              <div className="text-sm" style={{ color: 'var(--app-text-secondary)' }}>
                Don&apos;t have an account?{' '}
                <Link 
                  href="/register" 
                  className="font-medium hover:opacity-80 transition-opacity"
                  style={{ color: 'var(--app-primary)' }}
                >
                  Sign up
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
