'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Menu, X, User, LogOut, FileText, Briefcase, Mail, ChevronDown } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useTheme } from '@/hooks/useTheme';

export function EnhancedHeader() {
  const { data: session, status } = useSession();
  const { isDark } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigation = [
    { name: 'Resume Templates', href: '/templates' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'About', href: '/about' },
    { name: 'Features', href: '/features' },
  ];

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
    setUserMenuOpen(false);
  };

  return (
    <header 
      className="sticky top-0 z-50 w-full transition-all duration-300"
      style={{
        backgroundColor: scrolled ? 'var(--app-bg)' : 'var(--app-bg)',
        backdropFilter: scrolled ? 'blur(16px)' : 'blur(12px)',
        borderBottom: '1px solid ' + (scrolled ? 'var(--app-border)' : 'var(--app-border-light)'),
        boxShadow: scrolled ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none'
      }}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-3 group">
            <div 
              className="flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
              style={{ backgroundColor: 'var(--app-primary)' }}
            >
              <FileText className="h-5 w-5 text-white" />
            </div>
            <span 
              className="text-xl font-bold transition-colors duration-300"
              style={{ color: 'var(--app-text)' }}
            >
              FlowCV
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8 ml-10">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="relative text-sm font-medium transition-all duration-300 hover:scale-105 py-2 group"
                style={{ color: 'var(--app-text-secondary)' }}
              >
                {item.name}
                <span 
                  className="absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full"
                  style={{ backgroundColor: 'var(--app-primary)' }}
                />
              </Link>
            ))}
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Actions */}
          <div className="hidden md:flex items-center gap-3">
            {status === 'loading' ? (
              <div className="h-10 w-20 animate-pulse rounded-lg" 
                   style={{ backgroundColor: 'var(--app-bg-gray)' }} />
            ) : session ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105"
                  style={{
                    backgroundColor: 'var(--app-bg-gray)',
                    border: '1px solid var(--app-border)'
                  }}
                >
                  <div className="h-8 w-8 rounded-full flex items-center justify-center"
                       style={{ backgroundColor: 'var(--app-primary)' }}>
                    <span className="text-white text-sm font-bold">
                      {session.user?.name?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span className="text-sm font-medium" style={{ color: 'var(--app-text)' }}>
                    {session.user?.name || 'User'}
                  </span>
                  <ChevronDown className="h-4 w-4" style={{ color: 'var(--app-text-muted)' }} />
                </button>

                {/* User Dropdown */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl shadow-xl border overflow-hidden"
                       style={{
                         backgroundColor: 'var(--app-bg)',
                         borderColor: 'var(--app-border)'
                       }}>
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:opacity-80"
                      style={{ color: 'var(--app-text)' }}
                    >
                      <User className="h-4 w-4" />
                      Dashboard
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-3 w-full px-4 py-3 text-sm transition-colors hover:opacity-80"
                      style={{ color: 'var(--app-error)' }}
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="btn-ghost"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="btn-primary"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg transition-all duration-300 hover:scale-110"
            style={{ color: 'var(--app-text)' }}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t"
             style={{ borderColor: 'var(--app-border)' }}>
          <div className="px-4 py-4 space-y-3">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block px-4 py-2 text-base font-medium rounded-lg transition-colors"
                style={{ color: 'var(--app-text)' }}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            
            {!session && (
              <div className="pt-4 space-y-3 border-t"
                   style={{ borderColor: 'var(--app-border)' }}>
                <Link
                  href="/login"
                  className="btn-ghost"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="btn-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
