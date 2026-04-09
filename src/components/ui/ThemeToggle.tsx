'use client';

import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

export function ThemeToggle() {
  const { mode, isDark, toggleTheme, setThemeMode } = useTheme();

  const getIcon = () => {
    if (mode === 'system') {
      return <Monitor className="h-4 w-4" />;
    }
    return isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />;
  };

  const getLabel = () => {
    if (mode === 'system') return 'System';
    return isDark ? 'Dark' : 'Light';
  };

  return (
    <div className="relative group">
      <button
        onClick={toggleTheme}
        className="flex items-center gap-2 px-2 py-2 rounded-lg border transition-all duration-300 hover:scale-105"
        style={{
          backgroundColor: 'var(--app-bg)',
          borderColor: 'var(--app-border)',
          color: 'var(--app-text)',
          minHeight: '40px'
        }}
      >
        {getIcon()}
        <span className="text-sm font-medium hidden sm:inline">{getLabel()}</span>
      </button>
      
      {/* Dropdown for theme selection */}
      <div 
        className="absolute top-full mt-2 right-0 rounded-lg shadow-lg border invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50"
        style={{
          backgroundColor: 'var(--app-bg)',
          borderColor: 'var(--app-border)'
        }}
      >
        <button
          onClick={() => setThemeMode('light')}
          className="flex items-center gap-2 px-2 py-2 text-sm rounded transition-colors hover:scale-105"
          style={{
            color: 'var(--app-text)',
            width: '100%',
            minHeight: '40px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--app-bg-gray)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <Sun className="h-4 w-4" />
          Light
        </button>
        <button
          onClick={() => setThemeMode('dark')}
          className="flex items-center gap-2 px-2 py-2 text-sm rounded transition-colors hover:scale-105"
          style={{
            color: 'var(--app-text)',
            width: '100%',
            minHeight: '40px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--app-bg-gray)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <Moon className="h-4 w-4" />
          Dark
        </button>
        <button
          onClick={() => setThemeMode('system')}
          className="flex items-center gap-2 px-2 py-2 text-sm rounded transition-colors hover:scale-105"
          style={{
            color: 'var(--app-text)',
            width: '100%',
            minHeight: '40px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--app-bg-gray)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <Monitor className="h-4 w-4" />
          System
        </button>
      </div>
    </div>
  );
}
