'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import {
  FileText, Mail, Target, Sparkles, LogOut,
  Menu, X, CreditCard, GraduationCap,
  Home, ChevronLeft, ChevronRight, Settings,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

const NAV = [
  { name: 'Resume', icon: FileText, href: '/dashboard' },
  { name: 'Cover Letter', icon: Mail, href: '/cover-letters' },
  { name: 'Job Tracker', icon: Target, href: '/job-tracker' },
  { name: 'AI Generator', icon: Sparkles, href: '/ai-resume-generator' },
];

const BOTTOM_NAV = [
  { name: 'Dashboard', icon: Home, href: '/dashboard' },
  { name: 'Cover Letters', icon: Mail, href: '/cover-letters' },
  { name: 'Tracker', icon: Target, href: '/job-tracker' },
  { name: 'AI', icon: Sparkles, href: '/ai-resume-generator' },
  { name: 'More', icon: Settings, href: '#' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === href : pathname.startsWith(href);

  const isResumeEditor = pathname.startsWith('/resume/');
  const isCoverLetterEditor = pathname.startsWith('/cover-letter/');

  // Hide app layout for resume editor and cover letter editor (have their own layout)
  if (isResumeEditor || isCoverLetterEditor) {
    return <>{children}</>;
  }

  const sidebarWidth = sidebarCollapsed ? 'w-[72px]' : 'w-[280px]';

  return (
    <div className="min-h-screen w-full flex flex-col" style={{ background: 'var(--app-bg)' }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ══════ DESKTOP VIEW (lg+) ══════ */}
      {/* Fixed top bar */}
      <header
        className="hidden lg:flex fixed top-0 left-0 right-0 h-14 z-50 items-center justify-between px-6 border-b shrink-0"
        style={{ background: 'var(--app-bg-card)', borderColor: 'var(--app-border)' }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarCollapsed(v => !v)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            style={{ color: 'var(--app-text-secondary)' }}
          >
            <Menu className="w-4 h-4" />
          </button>
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center text-white text-[8px] font-black" style={{ background: 'linear-gradient(135deg, var(--app-primary), var(--app-secondary))' }}>
              FC
            </div>
            <span className="text-xs font-black tracking-tight" style={{ color: 'var(--app-text)' }}>FlowCV</span>
          </Link>
          <ThemeToggle />
        </div>
        <span className="text-xs font-bold" style={{ color: 'var(--app-text-muted)' }}>
          {session?.user?.email || ''}
        </span>
      </header>

      {/* Fixed sidebar (below top bar) */}
      <aside
        className={`hidden lg:flex fixed left-0 ${sidebarCollapsed ? 'w-[72px]' : 'w-[280px]'} flex-col border-r app-sidebar`}
        style={{ top: '56px', bottom: 0, background: 'var(--app-bg-sidebar)', borderColor: 'var(--app-border)' }}
      >
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto custom-scrollbar">
          <p className={`px-3 pb-2 text-[9px] font-black uppercase tracking-widest ${sidebarCollapsed ? 'text-center' : ''}`} style={{ color: 'var(--app-text-muted)' }}>
            {sidebarCollapsed ? 'Menu' : 'Main Menu'}
          </p>
          {NAV.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${active ? 'app-sidebar-link active' : 'app-sidebar-link'}`}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {!sidebarCollapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
          {!sidebarCollapsed && <div className="my-3 border-t" style={{ borderColor: 'var(--app-border)' }} />}
          {!sidebarCollapsed && <p className="px-3 pb-2 text-[9px] font-black uppercase tracking-widest" style={{ color: 'var(--app-text-muted)' }}>More</p>}
          <Link href="/pricing" className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-xl text-xs font-bold transition-all app-sidebar-link`}>
            <CreditCard className="w-4 h-4 shrink-0" />
            {!sidebarCollapsed && <span>Plans & Pricing</span>}
          </Link>
        </nav>
        <div className="px-3 py-3 border-t shrink-0" style={{ borderColor: 'var(--app-border)' }}>
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${sidebarCollapsed ? 'justify-center' : ''}`} style={{ background: 'var(--app-bg-gray)' }}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: 'linear-gradient(135deg, var(--app-primary), var(--app-secondary))' }}>
              {session?.user?.name?.[0] || 'U'}
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold truncate" style={{ color: 'var(--app-text)' }}>{session?.user?.name || 'User'}</p>
                <p className="text-[9px] truncate" style={{ color: 'var(--app-text-muted)' }}>{session?.user?.email || ''}</p>
              </div>
            )}
          </div>
          <button onClick={() => signOut()} className="w-full flex items-center justify-center gap-2 px-3 py-2 mt-1 rounded-lg text-[10px] font-bold hover:bg-red-50" style={{ color: 'var(--app-text-muted)' }}>
            <LogOut className="w-3.5 h-3.5" />
            {!sidebarCollapsed && 'Sign Out'}
          </button>
        </div>
      </aside>

      {/* ══════ MOBILE VIEW (< lg) ══════ */}
      {/* Mobile sidebar */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-[280px] flex flex-col border-r app-sidebar transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: 'var(--app-bg-sidebar)', borderColor: 'var(--app-border)' }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b shrink-0" style={{ borderColor: 'var(--app-border)' }}>
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[10px] font-black" style={{ background: 'linear-gradient(135deg, var(--app-primary), var(--app-secondary))' }}>
              FC
            </div>
            <span className="text-sm font-black tracking-tight" style={{ color: 'var(--app-text)' }}>FlowCV</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100" style={{ color: 'var(--app-text-muted)' }}>
            <X className="w-4 h-4" />
          </button>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="px-3 pb-2 text-[9px] font-black uppercase tracking-widest" style={{ color: 'var(--app-text-muted)' }}>Main Menu</p>
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${isActive(item.href) ? 'app-sidebar-link active' : 'app-sidebar-link'}`}>
              <item.icon className="w-4 h-4 shrink-0" />
              <span>{item.name}</span>
            </Link>
          ))}
          <div className="my-3 border-t" style={{ borderColor: 'var(--app-border)' }} />
          <Link href="/pricing" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all app-sidebar-link">
            <CreditCard className="w-4 h-4 shrink-0" />
            <span>Plans & Pricing</span>
          </Link>
          <button onClick={() => { setSidebarOpen(false); signOut(); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all mt-2" style={{ color: 'var(--app-text-muted)' }}>
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </nav>
      </aside>

      {/* Main Content Area — padded for desktop sidebar + top bar */}
      <div className="flex-1 flex flex-col" style={{ marginLeft: 0 }}>
        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b shrink-0" style={{ background: 'var(--app-bg-card)', borderColor: 'var(--app-border)' }}>
          <div className="flex items-center gap-2">
            <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-1 rounded-lg" style={{ color: 'var(--app-text-secondary)' }}>
              <Menu className="w-5 h-5" />
            </button>
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md flex items-center justify-center text-white text-[8px] font-black" style={{ background: 'linear-gradient(135deg, var(--app-primary), var(--app-secondary))' }}>
                FC
              </div>
              <span className="text-xs font-black" style={{ color: 'var(--app-text)' }}>FlowCV</span>
            </Link>
          </div>
          <ThemeToggle />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto custom-scrollbar bg-[var(--app-bg-gray)]" style={{ minHeight: 0, paddingTop: '56px', marginLeft: sidebarCollapsed ? '72px' : '280px' }}>
          {children}
        </main>

        {/* Mobile bottom nav */}
        <nav className="lg:hidden flex items-center justify-around border-t shrink-0 safe-area-bottom z-30 px-1 py-0.5" style={{ background: 'var(--app-bg-card)', borderColor: 'var(--app-border)' }}>
          {BOTTOM_NAV.map((item) => {
            if (item.href === '#') {
              return (
                <div key="more" className="relative">
                  <button onClick={() => setShowMoreMenu(o => !o)} className={`flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl transition-all ${showMoreMenu ? 'text-[var(--app-primary)]' : ''}`} style={{ color: showMoreMenu ? undefined : 'var(--app-text-secondary)' }}>
                    <item.icon className="w-5 h-5" />
                    <span className="text-[8px] font-bold uppercase">{item.name}</span>
                  </button>
                  {showMoreMenu && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowMoreMenu(false)} />
                      <div className="absolute bottom-full right-0 mb-2 z-50 rounded-xl shadow-2xl p-2 w-44" style={{ background: 'var(--app-bg-card)', border: '1px solid var(--app-border)' }}>
                        <Link href="/pricing" onClick={() => setShowMoreMenu(false)} className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold" style={{ color: 'var(--app-text)' }}><CreditCard className="w-4 h-4" /> Plans & Pricing</Link>
                        <div className="border-t my-1" style={{ borderColor: 'var(--app-border)' }} />
                        <button onClick={() => signOut()} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold" style={{ color: 'var(--app-text)' }}><LogOut className="w-4 h-4" /> Sign Out</button>
                      </div>
                    </>
                  )}
                </div>
              );
            }
            return (
              <Link key={item.href} href={item.href} className={`flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl transition-all ${isActive(item.href) ? 'text-[var(--app-primary)]' : ''}`} style={{ color: isActive(item.href) ? undefined : 'var(--app-text-secondary)' }}>
                <item.icon className="w-5 h-5" />
                <span className="text-[8px] font-bold uppercase">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}