'use client';

import React, { useState, useEffect } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeColors {
  primary: string;
  primaryHover: string;
  secondary: string;
  secondaryHover: string;
  accent: string;
  buttonGradient: string[];
  buttonBackground: string;
  buttonHover: string;
  background: {
    light: string;
    gray: string;
    medium: string;
  };
  text: {
    primary: string;
    secondary: string;
    muted: string;
  };
  border: {
    default: string;
    light: string;
  };
  success: string;
  error: string;
  warning: string;
}

// Load theme from config file
const loadThemeFromConfig = async (): Promise<ThemeColors> => {
  try {
    const response = await fetch('/api/theme');
    if (!response.ok) {
      throw new Error('Failed to fetch theme config');
    }
    const config = await response.json();
    
    // Validate that config has the expected structure
    if (!config?.theme?.colors) {
      throw new Error('Invalid theme config structure');
    }
    
    return config.theme.colors;
  } catch (error) {
    console.error('Failed to load theme config:', error);
    // Return fallback theme
    return lightTheme;
  }
};

const lightTheme: ThemeColors = {
  primary: '#41017d',
  primaryHover: '#5a1fa8',
  secondary: '#ee14ff',
  secondaryHover: '#f566ff',
  accent: '#ee14ff',
  buttonGradient: ['#41017d', '#ee14ff'],
  buttonBackground: '#41017d',
  buttonHover: '#5a1fa8',
  background: {
    light: '#ffffff',
    gray: '#f9fafb',
    medium: '#f3f4f6'
  },
  text: {
    primary: '#111827',
    secondary: '#6b7280',
    muted: '#9ca3af'
  },
  border: {
    default: '#e5e7eb',
    light: '#f3f4f6'
  },
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b'
};

const darkTheme: ThemeColors = {
  ...lightTheme,
  buttonBackground: '#5a1fa8',
  buttonHover: '#41017d',
  background: {
    light: '#0f172a',
    gray: '#1e293b',
    medium: '#334155'
  },
  text: {
    primary: '#f1f5f9',
    secondary: '#cbd5e1',
    muted: '#94a3b8'
  },
  border: {
    default: '#334155',
    light: '#475569'
  }
};

export function useTheme() {
  const [mode, setMode] = useState<ThemeMode>('system');
  const [isDark, setIsDark] = useState(false);
  const [colors, setColors] = useState<ThemeColors>(lightTheme);

  useEffect(() => {
    const savedMode = localStorage.getItem('theme-mode') as ThemeMode;
    if (savedMode) {
      setMode(savedMode);
    } else {
      // Check system preference on first load
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDark(systemPrefersDark);
      setColors(systemPrefersDark ? darkTheme : lightTheme);
      updateThemeVariables(systemPrefersDark ? darkTheme : lightTheme);
    }

    // Load theme from config file
    const loadAndApplyTheme = async () => {
      try {
        const configColors = await loadThemeFromConfig();
        const shouldBeDark = mode === 'system' ? 
          window.matchMedia('(prefers-color-scheme: dark)').matches : 
          mode === 'dark';
        
        const updatedColors = shouldBeDark ? 
          { ...configColors, ...darkTheme } : 
          configColors;
        
        setColors(updatedColors);
        updateThemeVariables(updatedColors);
      } catch (error) {
        console.error('Error loading theme:', error);
        // Use fallback theme
        const shouldBeDark = mode === 'system' ? 
          window.matchMedia('(prefers-color-scheme: dark)').matches : 
          mode === 'dark';
        const fallbackColors = shouldBeDark ? darkTheme : lightTheme;
        setColors(fallbackColors);
        updateThemeVariables(fallbackColors);
      }
    };

    loadAndApplyTheme();
  }, [mode]);

  const updateThemeVariables = (themeColors: ThemeColors) => {
    const root = document.documentElement;
    
    // Safely set properties with fallbacks
    root.style.setProperty('--app-primary', themeColors?.primary || '#41017d');
    root.style.setProperty('--app-primary-hover', themeColors?.primaryHover || '#5a1fa8');
    root.style.setProperty('--app-secondary', themeColors?.secondary || '#ee14ff');
    root.style.setProperty('--app-secondary-hover', themeColors?.secondaryHover || '#f566ff');
    root.style.setProperty('--app-accent', themeColors?.accent || '#ee14ff');
    root.style.setProperty('--app-bg', themeColors?.background?.light || '#ffffff');
    root.style.setProperty('--app-bg-gray', themeColors?.background?.gray || '#f9fafb');
    root.style.setProperty('--app-bg-medium', themeColors?.background?.medium || '#f3f4f6');
    root.style.setProperty('--app-text', themeColors?.text?.primary || '#111827');
    root.style.setProperty('--app-text-secondary', themeColors?.text?.secondary || '#6b7280');
    root.style.setProperty('--app-text-muted', themeColors?.text?.muted || '#9ca3af');
    root.style.setProperty('--app-border', themeColors?.border?.default || '#e5e7eb');
    root.style.setProperty('--app-border-light', themeColors?.border?.light || '#f3f4f6');
    root.style.setProperty('--app-success', themeColors?.success || '#10b981');
    root.style.setProperty('--app-error', themeColors?.error || '#ef4444');
    root.style.setProperty('--app-warning', themeColors?.warning || '#f59e0b');
    root.style.setProperty('--app-button-bg', themeColors?.buttonBackground || '#41017d');
    root.style.setProperty('--app-button-hover', themeColors?.buttonHover || '#5a1fa8');
    root.style.setProperty('--app-button-gradient-start', themeColors?.buttonGradient?.[0] || '#41017d');
    root.style.setProperty('--app-button-gradient-end', themeColors?.buttonGradient?.[1] || '#ee14ff');
  };

  useEffect(() => {
    const updateTheme = () => {
      let shouldBeDark = false;
      
      if (mode === 'system') {
        shouldBeDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      } else {
        shouldBeDark = mode === 'dark';
      }
      
      setIsDark(shouldBeDark);
      setColors(shouldBeDark ? darkTheme : lightTheme);
      
      const themeColors = shouldBeDark ? darkTheme : lightTheme;
      updateThemeVariables(themeColors);
      
      // Update html + body class for CSS variable scoping
      if (shouldBeDark) {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
      }
    };

    updateTheme();

    if (mode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => updateTheme();
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [mode]);

  const toggleTheme = () => {
    const newMode: ThemeMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('theme-mode', newMode);
  };

  const setThemeMode = (newMode: ThemeMode) => {
    setMode(newMode);
    localStorage.setItem('theme-mode', newMode);
  };

  return {
    mode,
    isDark,
    colors,
    toggleTheme,
    setThemeMode
  };
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return React.createElement(React.Fragment, null, children);
}
