'use client';

import { usePathname } from 'next/navigation';
import { Home, FileText, Star, Users, Zap, ChevronRight } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

export function PageIndicator() {
  const pathname = usePathname();
  const { isDark } = useTheme();

  const getPageInfo = (path: string) => {
    if (path === '/') {
      return {
        title: 'Home',
        icon: Home,
        description: 'Welcome to FlowCV - Build your professional resume'
      };
    }
    if (path === '/templates') {
      return {
        title: 'Templates',
        icon: FileText,
        description: 'Browse 50+ professional resume templates'
      };
    }
    if (path === '/pricing') {
      return {
        title: 'Pricing',
        icon: Star,
        description: 'Simple, transparent pricing plans for everyone'
      };
    }
    if (path === '/about') {
      return {
        title: 'About',
        icon: Users,
        description: 'Learn more about FlowCV and our mission'
      };
    }
    if (path === '/features') {
      return {
        title: 'Features',
        icon: Zap,
        description: 'Discover powerful features for your career'
      };
    }
    
    // Default for other pages
    return {
      title: 'FlowCV',
      icon: Home,
      description: 'Build your professional resume'
    };
  };

  const pageInfo = getPageInfo(pathname);

  return (
    <div 
      className="px-4 sm:px-6 lg:px-8 py-4 border-b transition-all duration-300"
      style={{
        backgroundColor: 'var(--app-bg)',
        borderColor: 'var(--app-border-light)'
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-sm">
            <div 
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-300"
              style={{ 
                backgroundColor: 'var(--app-bg-gray)',
                color: 'var(--app-primary)'
              }}
            >
              <Home className="h-4 w-4" />
              <span className="font-medium">Home</span>
            </div>
            
            <ChevronRight className="h-4 w-4" style={{ color: 'var(--app-text-muted)' }} />
            
            <div 
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-300"
              style={{ 
                backgroundColor: 'var(--app-primary)',
                color: 'white'
              }}
            >
              <pageInfo.icon className="h-4 w-4" />
              <span className="font-medium">{pageInfo.title}</span>
            </div>
          </div>
        </div>

        {/* Page Description */}
        <div className="hidden md:block">
          <p 
            className="text-sm font-medium"
            style={{ color: 'var(--app-text-secondary)' }}
          >
            {pageInfo.description}
          </p>
        </div>
      </div>
    </div>
  );
}
