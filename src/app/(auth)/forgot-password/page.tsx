'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Loader2, FileText } from 'lucide-react';
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
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-500" 
         style={{ backgroundColor: 'var(--app-bg)' }}>
      
      {/* Decorative Interactive Background Blobs */}
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
        {/* Success Message */}
        {isSubmitted ? (
          <div className="glass-card py-10 px-6 sm:px-10 shadow-2xl border border-white/10 dark:border-gray-800/50 text-center relative z-10 overflow-hidden">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-green-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="mx-auto h-16 w-16 rounded-full flex items-center justify-center mb-6"
                 style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>

            <h3 className="text-2xl font-extrabold mb-2" style={{ color: 'var(--app-text)' }}>
              Check your email
            </h3>
            
            <p className="text-sm mb-8 leading-relaxed" style={{ color: 'var(--app-text-secondary)' }}>
              {success}
            </p>
            
            <div className="space-y-3 border-t border-white/5 pt-6">
              <p className="text-xs font-semibold" style={{ color: 'var(--app-text-muted)' }}>
                Didn&apos;t receive the email?
              </p>
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setSuccess('');
                }}
                className="text-xs font-bold hover:underline transition-all"
                style={{ color: 'var(--app-primary)' }}
              >
                Try again
              </button>
            </div>
          </div>
        ) : (
          <div className="glass-card py-10 px-6 sm:px-10 shadow-2xl border border-white/10 dark:border-gray-800/50 relative z-10 overflow-hidden">
            {/* Background card glow subtle details */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Header */}
            <div className="text-center mb-8">
              <div 
                className="mx-auto h-14 w-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg"
                style={{ background: 'linear-gradient(135deg, #41017d 0%, #ee14ff 100%)' }}
              >
                <Mail className="h-7 w-7 text-white" />
              </div>
              <h2 className="text-3xl font-extrabold mb-2" style={{ color: 'var(--app-text)' }}>
                Forgot Password?
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--app-text-secondary)' }}>
                Enter your email address and we&apos;ll send you a link to reset your password.
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

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider mb-2"
                      style={{ color: 'var(--app-text-secondary)' }}>
                  Email address
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
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 hover:border-purple-300 dark:hover:border-purple-800"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
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
                className="w-full btn-primary py-3.5 relative overflow-hidden active:scale-[0.98] transition-transform"
              >
                <span className="relative z-10 flex items-center justify-center font-bold text-base tracking-wide">
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Reset Link
                      <Mail className="ml-2 h-5 w-5" />
                    </>
                  )}
                </span>
              </button>
            </form>

            {/* Additional Links */}
            <div className="mt-6 text-center space-y-3 border-t border-white/5 pt-4 text-xs font-bold uppercase tracking-wider">
              <div style={{ color: 'var(--app-text-secondary)' }}>
                Remember your password?{' '}
                <Link 
                  href="/login" 
                  className="hover:underline transition-all"
                  style={{ color: 'var(--app-primary)' }}
                >
                  Sign in
                </Link>
              </div>
              
              <div style={{ color: 'var(--app-text-secondary)' }}>
                Don&apos;t have an account?{' '}
                <Link 
                  href="/register" 
                  className="hover:underline transition-all"
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
