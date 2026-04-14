'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import { Menu, X, User, LogOut, FileText, Briefcase, Mail } from 'lucide-react';

export function Header() {
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#41017d]">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">FlowCV</span>
          </Link>

          <div className="hidden items-center gap-8 ml-10 md:flex">
            <Link
              href="/templates"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Resume Templates
            </Link>
            <Link
              href="/pricing"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              About
            </Link>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-4">
          {status === 'loading' ? (
            <div className="h-10 w-20 animate-pulse rounded-lg bg-gray-100" />
          ) : session ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <User className="h-5 w-5" />
                {session.user?.name || 'Account'}
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-lg border bg-white py-1 shadow-lg">
                  <div className="border-b px-4 py-2">
                    <p className="text-xs text-gray-500">My Account</p>
                  </div>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <FileText className="h-4 w-4" />
                    My Resumes
                  </Link>
                  <Link
                    href="/cover-letters"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <Mail className="h-4 w-4" />
                    Cover Letters
                  </Link>
                  <Link
                    href="/job-tracker"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <Briefcase className="h-4 w-4" />
                    Job Tracker
                  </Link>
                  <div className="border-t mt-1 pt-1">
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        localStorage.removeItem('user');
                        signOut({ callbackUrl: '/' });
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="btn-primary"
              >
                Start now
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden rounded-lg p-2 text-gray-600 hover:bg-gray-100"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </nav>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="space-y-1 px-4 py-4">
            <Link
              href="/templates"
              className="block rounded-lg px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              Resume Templates
            </Link>
            <Link
              href="/pricing"
              className="block rounded-lg px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link
              href="/about"
              className="block rounded-lg px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            {session ? (
              <>
                <Link
                  href="/dashboard"
                  className="block rounded-lg px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Resumes
                </Link>
                <Link
                  href="/cover-letters"
                  className="block rounded-lg px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Cover Letters
                </Link>
                <Link
                  href="/job-tracker"
                  className="block rounded-lg px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Job Tracker
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    localStorage.removeItem('user');
                    signOut({ callbackUrl: '/' });
                  }}
                  className="block w-full text-left rounded-lg px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-50"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block rounded-lg px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="block rounded-lg bg-[#41017d] px-3 py-2 text-base font-medium text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Start now
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
