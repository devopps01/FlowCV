/**
 * Central theme configuration — single source of truth for all colors,
 * spacing, typography, and component styles across the app.
 *
 * Usage:
 *   import { theme, cssVar } from '@/config/theme';
 *   style={{ color: cssVar('--app-primary') }}
 *   className={theme.btn.primary}
 */

// ─── CSS variable helper ──────────────────────────────────────────────────────
export const cssVar = (name: string) => `var(${name})`;

// ─── Color tokens ─────────────────────────────────────────────────────────────
export const colors = {
  // Brand
  primary:       '#41017d',
  primaryLight:  'rgba(65,1,125,0.08)',
  primaryHover:  '#5a1fa8',
  secondary:     '#ee14ff',
  accent:        '#ee14ff',

  // Semantic
  success:  '#10b981',
  error:    '#ef4444',
  warning:  '#f59e0b',
  info:     '#3b82f6',

  // Light mode surfaces
  light: {
    bg:           '#ffffff',
    bgGray:       '#f8fafc',
    bgMedium:     '#f1f5f9',
    bgSidebar:    '#ffffff',
    bgCard:       '#ffffff',
    text:         '#0f172a',
    textSecondary:'#475569',
    textMuted:    '#94a3b8',
    border:       '#e2e8f0',
    borderLight:  '#f1f5f9',
  },

  // Dark mode surfaces
  dark: {
    bg:           '#0f172a',
    bgGray:       '#1e293b',
    bgMedium:     '#334155',
    bgSidebar:    '#1e293b',
    bgCard:       '#1e293b',
    text:         '#f1f5f9',
    textSecondary:'#94a3b8',
    textMuted:    '#64748b',
    border:       '#334155',
    borderLight:  '#1e293b',
  },

  // Resume paper — ALWAYS light, never affected by dark mode
  paper: {
    bg:           '#ffffff',
    text:         '#1f2937',
    textMuted:    '#6b7280',
    border:       '#e5e7eb',
    sidebarBg:    '#f8fafc',
  },
} as const;

// ─── Typography ───────────────────────────────────────────────────────────────
export const typography = {
  fontSans:  'Inter, system-ui, sans-serif',
  fontSerif: 'Merriweather, Georgia, serif',
  fontMono:  'Fira Code, monospace',

  sizes: {
    xs:   '0.75rem',   // 12px
    sm:   '0.875rem',  // 14px
    base: '1rem',      // 16px
    lg:   '1.125rem',  // 18px
    xl:   '1.25rem',   // 20px
    '2xl':'1.5rem',    // 24px
    '3xl':'1.875rem',  // 30px
    '4xl':'2.25rem',   // 36px
  },

  weights: {
    normal:    '400',
    medium:    '500',
    semibold:  '600',
    bold:      '700',
    black:     '900',
  },
} as const;

// ─── Spacing ──────────────────────────────────────────────────────────────────
export const spacing = {
  xs:  '0.25rem',
  sm:  '0.5rem',
  md:  '0.75rem',
  lg:  '1rem',
  xl:  '1.5rem',
  '2xl':'2rem',
  '3xl':'3rem',
} as const;

// ─── Border radius ────────────────────────────────────────────────────────────
export const radius = {
  sm:   '0.5rem',   // 8px
  md:   '0.75rem',  // 12px
  lg:   '1rem',     // 16px
  xl:   '1.25rem',  // 20px
  '2xl':'1.5rem',   // 24px
  full: '9999px',
} as const;

// ─── Shadows ──────────────────────────────────────────────────────────────────
export const shadows = {
  sm:  '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
  md:  '0 4px 16px rgba(0,0,0,0.08)',
  lg:  '0 8px 32px rgba(0,0,0,0.10)',
  xl:  '0 20px 50px rgba(0,0,0,0.12)',
  // Dark mode
  smDark: '0 1px 3px rgba(0,0,0,0.3)',
  mdDark: '0 4px 16px rgba(0,0,0,0.3)',
  lgDark: '0 8px 32px rgba(0,0,0,0.4)',
} as const;

// ─── Component class presets ──────────────────────────────────────────────────
export const theme = {
  // Buttons
  btn: {
    primary:   'btn-primary',
    secondary: 'btn-secondary',
    ghost:     'btn-ghost',
    danger:    'inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-bold text-white bg-red-500 hover:bg-red-600 transition-all',
    icon:      'p-2 rounded-lg transition-all hover:bg-gray-100 text-gray-500 hover:text-gray-800',
  },

  // Cards
  card: {
    base:    'app-card',
    glass:   'glass-card',
    section: 'rounded-xl border p-4',
  },

  // Inputs
  input: {
    base:    'app-input',
    label:   'text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1',
  },

  // Layout
  layout: {
    page:     'app-page',
    pageGray: 'app-page-gray',
    sidebar:  'app-sidebar',
    sidebarLink: 'app-sidebar-link',
  },

  // Text
  text: {
    heading:   'font-black tracking-tight',
    subheading:'font-bold',
    body:      'text-sm',
    muted:     'text-sm opacity-60',
    label:     'text-[9px] font-black uppercase tracking-widest',
    gradient:  'gradient-text',
  },

  // Transitions
  transition: {
    fast:   'transition-all duration-150',
    normal: 'transition-all duration-200',
    slow:   'transition-all duration-300',
  },
} as const;

// ─── CSS variable map (for inline styles) ─────────────────────────────────────
export const cv = {
  bg:            'var(--app-bg)',
  bgGray:        'var(--app-bg-gray)',
  bgMedium:      'var(--app-bg-medium)',
  bgCard:        'var(--app-bg-card)',
  bgSidebar:     'var(--app-bg-sidebar)',
  text:          'var(--app-text)',
  textSecondary: 'var(--app-text-secondary)',
  textMuted:     'var(--app-text-muted)',
  border:        'var(--app-border)',
  borderLight:   'var(--app-border-light)',
  primary:       'var(--app-primary)',
  primaryLight:  'var(--app-primary-light)',
  secondary:     'var(--app-secondary)',
  shadow:        'var(--app-shadow)',
  shadowMd:      'var(--app-shadow-md)',
  shadowLg:      'var(--app-shadow-lg)',
} as const;

// ─── Resume-specific design defaults ─────────────────────────────────────────
export const resumeDefaults = {
  fontSize:     10.5,   // pt
  lineHeight:   1.45,
  marginLR:     12,     // mm
  marginTB:     14,     // mm
  entrySpacing: 4,      // mm
  sectionSpacing: 8,    // mm
  primaryColor: '#ff4d7d',
  secondaryColor: '#f8fafc',
  textColor:    '#1f2937',
  backgroundColor: '#ffffff',
  fontFamily:   'Inter',
  layout:       'sidebar-left' as const,
} as const;
