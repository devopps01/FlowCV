'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import {
  FileText, Mail, Target, Plus, CreditCard,
  GraduationCap, LogOut, ChevronDown, Sparkles,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

const NAV = [
  { name: 'Resume', icon: FileText, href: '/dashboard' },
  { name: 'Cover Letter', icon: Mail, href: '/cover-letters' },
  { name: 'Job Tracker', icon: Target, href: '/job-tracker' },
  { name: 'AI Generator', icon: Sparkles, href: '/ai-resume-generator' },
];

const BOTTOM_NAV = [
  { name: 'Plans & Pricing', icon: CreditCard, href: '/pricing' },
  { name: 'Student Benefits', icon: GraduationCap, href: '#' },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === href : pathname.startsWith(href);

  return (
    <aside
      className="w-64 flex flex-col fixed inset-y-0 z-20 app-sidebar"
      style={{ background: 'var(--app-bg-sidebar)', borderRight: '1px solid var(--app-border)' }}
    >
      {/* Logo */}
      <div className="p-6 pb-4">
        <Link href="/" className="flex items-center gap-2.5 mb-8 group">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-transform group-hover:scale-110"
            style={{ background: 'linear-gradient(135deg, #41017d, #ee14ff)' }}
          >
            <FileText className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-black tracking-tight" style={{ color: 'var(--app-text)' }}>
            flowcv
          </span>
        </Link>

        {/* Main nav */}
        <nav className="space-y-0.5">
          {NAV.map(link => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`app-sidebar-link ${active ? 'active' : ''}`}
              >
                <link.icon className="h-4 w-4 shrink-0" />
                {link.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom section */}
      <div
        className="mt-auto p-6 pt-4 space-y-0.5"
        style={{ borderTop: '1px solid var(--app-border-light)' }}
      >
        {BOTTOM_NAV.map(link => (
          <Link key={link.name} href={link.href} className="app-sidebar-link">
            <link.icon className="h-4 w-4 shrink-0" />
            {link.name}
          </Link>
        ))}

        {/* Theme toggle */}
        <div className="pt-2 pb-1">
          <ThemeToggle />
        </div>

        {/* User */}
        {session?.user && (
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl mt-1"
            style={{ background: 'var(--app-bg-gray)' }}
          >
            <div
              className="h-7 w-7 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0"
              style={{ background: 'linear-gradient(135deg, #41017d, #ee14ff)' }}
            >
              {session.user.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate" style={{ color: 'var(--app-text)' }}>
                {session.user.name}
              </p>
              <p className="text-[10px] truncate" style={{ color: 'var(--app-text-muted)' }}>
                {session.user.email}
              </p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              title="Sign out"
              className="p-1 rounded-lg transition-colors hover:opacity-70"
              style={{ color: 'var(--app-text-muted)' }}
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
