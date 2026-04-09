'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Settings, FileDown, Users, Star, Plus, Search, Bell, HelpCircle, ChevronDown } from 'lucide-react';
import { CommonHeader } from './CommonHeader';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

interface DashboardHeaderProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function DashboardHeader({ title = 'Dashboard', subtitle, actions }: DashboardHeaderProps) {
  const { data: session, status } = useSession();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const extraPanel = (
    <div className="hidden lg:flex items-center gap-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: 'var(--app-text-muted)' }} />
        <input
          type="text"
          placeholder="Search..."
          className="pl-10 pr-4 py-2 rounded-lg border transition-all duration-300 focus:outline-none focus:ring-2 w-48"
          style={{
            backgroundColor: 'var(--app-bg)',
            borderColor: 'var(--app-border)',
            color: 'var(--app-text)'
          }}
        />
      </div>

      {/* Notifications */}
      <button className="relative p-2 rounded-lg transition-all duration-300 hover:scale-110"
              style={{ color: 'var(--app-text)' }}>
        <Bell className="h-5 w-5" />
        <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--app-error)' }} />
      </button>

      {/* Help */}
      <Link href="/help" className="p-2 rounded-lg transition-all duration-300 hover:scale-110"
            style={{ color: 'var(--app-text)' }}>
        <HelpCircle className="h-5 w-5" />
      </Link>

      {/* Actions */}
      {actions}
    </div>
  );

  return (
    <>
      <CommonHeader 
        variant="minimal"
        showUserMenu={true}
        showThemeToggle={true}
        extraPanels={extraPanel}
      />
      
      {/* Dashboard Header Content */}
      <div className="border-b" style={{ backgroundColor: 'var(--app-bg)', borderColor: 'var(--app-border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold" style={{ color: 'var(--app-text)' }}>
                {title}
              </h1>
              {subtitle && (
                <p className="text-lg mt-1" style={{ color: 'var(--app-text-secondary)' }}>
                  {subtitle}
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              {/* Quick Actions */}
              <Link href="/resumes/new" className="btn-primary flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Resume
              </Link>
              <Link href="/templates" className="btn-secondary">
                Browse Templates
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
