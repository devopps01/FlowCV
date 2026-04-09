'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Menu, X, User, LogOut, FileText, Briefcase, Mail, ChevronDown, Home, FileDown, Users, Settings, HelpCircle, Star, Zap, Award, BookOpen, Target } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useTheme } from '@/hooks/useTheme';

interface CommonHeaderProps {
  variant?: 'default' | 'minimal' | 'centered' | 'transparent';
  showUserMenu?: boolean;
  showThemeToggle?: boolean;
  extraPanels?: React.ReactNode;
}

export function CommonHeader({ 
  variant = 'default', 
  showUserMenu = true, 
  showThemeToggle = true,
  extraPanels 
}: CommonHeaderProps) {
  const { data: session, status } = useSession();
  const { isDark } = useTheme();
  const pathname = usePathname();
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
    { name: 'Home', href: '/', icon: Home },
    { name: 'Templates', href: '/templates', icon: FileText },
    { name: 'Pricing', href: '/pricing', icon: Star },
    { name: 'About', href: '/about', icon: Users },
    { name: 'Features', href: '/features', icon: Zap },
  ];

  const secondaryNav = [
    { name: 'Dashboard', href: '/dashboard', icon: Settings },
    { name: 'My Resumes', href: '/resumes', icon: FileDown },
    { name: 'Help', href: '/help', icon: HelpCircle },
  ];

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
    setUserMenuOpen(false);
  };

  const isActiveLink = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuOpen) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [userMenuOpen]);

  return (
    <>
      <header 
        className="sticky top-0 z-50 w-full transition-all duration-300"
        style={{
          backgroundColor: 'var(--app-bg)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--app-border-light)',
          boxShadow: 'none'
        }}
      >
        <nav className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
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
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8 ml-10">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`relative text-sm font-medium transition-all duration-300 hover:scale-105 py-2 group flex items-center gap-2 ${
                  isActiveLink(item.href) ? 'text-purple-600' : ''
                }`}
                style={{ 
                  color: isActiveLink(item.href) ? 'var(--app-primary)' : 'var(--app-text-secondary)'
                }}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
                <span 
                  className={`absolute bottom-0 left-0 h-0.5 transition-all duration-300 ${
                    isActiveLink(item.href) ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}
                  style={{ backgroundColor: 'var(--app-primary)' }}
                />
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {/* Extra Panels */}
            {extraPanels}

            {/* Theme Toggle */}
            {showThemeToggle && <ThemeToggle />}

            {/* User Actions */}
            {showUserMenu && (
              <div className="hidden md:flex items-center gap-3">
                {status === 'loading' ? (
                  <div className="h-10 w-20 animate-pulse rounded-lg" 
                       style={{ backgroundColor: 'var(--app-bg-gray)' }} />
                ) : session ? (
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setUserMenuOpen(!userMenuOpen);
                      }}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md"
                      style={{
                        backgroundColor: 'var(--app-bg-gray)',
                        border: 'none'
                      }}
                    >
                      <div className="h-6 w-6 rounded-full flex items-center justify-center"
                           style={{ backgroundColor: 'var(--app-primary)' }}>
                        <span className="text-white text-xs font-bold">
                          {session.user?.name?.[0]?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <span className="text-xs font-medium" style={{ color: 'var(--app-text)' }}>
                        {session.user?.name || 'User'}
                      </span>
                      <ChevronDown className="h-3 w-3" style={{ color: 'var(--app-text-muted)' }} />
                    </button>

                    {/* User Dropdown */}
                    {userMenuOpen && (
                      <div className="absolute right-0 mt-2 w-56 rounded-xl shadow-xl border overflow-hidden"
                           style={{
                             backgroundColor: 'var(--app-bg)',
                             borderColor: 'var(--app-border)'
                           }}>
                        {/* Primary Navigation */}
                        <div className="p-2 border-b" style={{ borderColor: 'var(--app-border-light)' }}>
                          {secondaryNav.map((item) => (
                            <Link
                              key={item.name}
                              href={item.href}
                              className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors hover:opacity-80"
                              style={{ color: 'var(--app-text)' }}
                            >
                              <item.icon className="h-4 w-4" />
                              {item.name}
                            </Link>
                          ))}
                        </div>
                        
                        {/* Account Actions */}
                        <div className="p-2">
                          <Link
                            href="/settings"
                            className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors hover:opacity-80"
                            style={{ color: 'var(--app-text)' }}
                          >
                            <Settings className="h-4 w-4" />
                            Settings
                          </Link>
                          <button
                            onClick={handleSignOut}
                            className="flex items-center gap-3 w-full px-3 py-2 text-sm rounded-lg transition-colors hover:opacity-80"
                            style={{ color: 'var(--app-error)' }}
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
            )}

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
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t"
             style={{ borderColor: 'var(--app-border)' }}>
          <div className="px-4 py-4 space-y-3">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2 text-base font-medium rounded-lg transition-colors ${
                  isActiveLink(item.href) ? 'bg-purple-100 text-purple-600' : ''
                }`}
                style={{ 
                  color: isActiveLink(item.href) ? 'var(--app-primary)' : 'var(--app-text)',
                  backgroundColor: isActiveLink(item.href) ? 'var(--app-bg-gray)' : 'transparent'
                }}
                onClick={() => setMobileMenuOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            ))}
            
            {/* Secondary Navigation for Mobile */}
            {session && (
              <div className="pt-4 space-y-3 border-t" style={{ borderColor: 'var(--app-border)' }}>
                {secondaryNav.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-2 text-base font-medium rounded-lg transition-colors ${
                      isActiveLink(item.href) ? 'bg-purple-100 text-purple-600' : ''
                    }`}
                    style={{ 
                      color: isActiveLink(item.href) ? 'var(--app-primary)' : 'var(--app-text)',
                      backgroundColor: isActiveLink(item.href) ? 'var(--app-bg-gray)' : 'transparent'
                    }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                ))}
              </div>
            )}
            
            {!session && (
              <div className="pt-4 space-y-3 border-t" style={{ borderColor: 'var(--app-border)' }}>
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
    </>
  );
}
