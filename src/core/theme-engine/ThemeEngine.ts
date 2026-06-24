// ============================================================
// THEME ENGINE - Dynamic Theme Resolution & Registry
// ============================================================

import type { ThemeId, ThemeDefinition, ThemeColors, ThemeFonts, ThemeTypography, ThemeSpacingValues, ThemeBorderRadius, ThemeShadows, ThemeBorders, ThemeEffects, SectionStyle } from '@/types/resume.types';

// ─── Default Theme: Default (Light Professional) ───
const defaultTheme: ThemeDefinition = {
  id: 'default',
  name: 'Default',
  label: 'Default Light',
  description: 'Clean professional light theme',
  colors: {
    primary: '#2563eb',
    primaryLight: '#3b82f6',
    primaryDark: '#1d4ed8',
    secondary: '#64748b',
    secondaryLight: '#94a3b8',
    secondaryDark: '#475569',
    accent: '#f59e0b',
    accentLight: '#fbbf24',
    accentDark: '#d97706',
    background: '#ffffff',
    surface: '#f8fafc',
    surfaceAlt: '#f1f5f9',
    text: '#0f172a',
    textSecondary: '#475569',
    textMuted: '#94a3b8',
    textOnPrimary: '#ffffff',
    textOnSecondary: '#ffffff',
    textOnAccent: '#1a1a2e',
    border: '#e2e8f0',
    borderLight: '#f1f5f9',
    divider: '#e2e8f0',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#6366f1',
    heading: '#0f172a',
    link: '#2563eb',
    linkHover: '#1d4ed8',
  },
  fonts: {
    heading: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    body: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    mono: '"JetBrains Mono", "Fira Code", monospace',
    sizes: {
      xs: '0.625rem',
      sm: '0.75rem',
      base: '0.875rem',
      md: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      icon: '1rem',
      small: '0.75rem',
      body: '0.875rem',
      heading1: '1.75rem',
      heading2: '1.375rem',
      heading3: '1.125rem',
      heading4: '1rem',
      heading5: '0.875rem',
      heading6: '0.75rem',
    },
    weights: {
      thin: '100',
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
      heading: '700',
      body: '400',
    },
  },
  typography: {
    heading1: { fontFamily: '"Inter", sans-serif', fontSize: 1.75, fontWeight: '700', lineHeight: 1.3, letterSpacing: '-0.01em', textTransform: 'none' },
    heading2: { fontFamily: '"Inter", sans-serif', fontSize: 1.375, fontWeight: '600', lineHeight: 1.35, letterSpacing: '-0.005em', textTransform: 'none' },
    heading3: { fontFamily: '"Inter", sans-serif', fontSize: 1.125, fontWeight: '600', lineHeight: 1.4, letterSpacing: 0, textTransform: 'none' },
    heading4: { fontFamily: '"Inter", sans-serif', fontSize: 1, fontWeight: '600', lineHeight: 1.4, letterSpacing: 0, textTransform: 'none' },
    heading5: { fontFamily: '"Inter", sans-serif', fontSize: 0.875, fontWeight: '600', lineHeight: 1.4, textTransform: 'uppercase', letterSpacing: '0.05em' },
    heading6: { fontFamily: '"Inter", sans-serif', fontSize: 0.75, fontWeight: '600', lineHeight: 1.4, textTransform: 'uppercase', letterSpacing: '0.08em' },
    body: { fontFamily: '"Inter", sans-serif', fontSize: 0.875, fontWeight: '400', lineHeight: 1.6 },
    small: { fontFamily: '"Inter", sans-serif', fontSize: 0.75, fontWeight: '400', lineHeight: 1.5, color: '#64748b' },
    caption: { fontFamily: '"Inter", sans-serif', fontSize: 0.6875, fontWeight: '400', lineHeight: 1.4, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' },
    sectionTitle: { fontFamily: '"Inter", sans-serif', fontSize: 0.875, fontWeight: '600', lineHeight: 1.4, textTransform: 'uppercase', letterSpacing: '0.05em' },
    blockTitle: { fontFamily: '"Inter", sans-serif', fontSize: 1, fontWeight: '600', lineHeight: 1.4 },
  },
  spacing: {
    page: '20mm',
    section: '1.5rem',
    block: '0.75rem',
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    gap: '1rem',
    gapSmall: '0.5rem',
    gapLarge: '1.5rem',
  },
  borderRadius: {
    none: '0',
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
    section: '0',
    block: '4px',
    card: '8px',
    button: '6px',
  },
  shadows: {
    none: 'none',
    sm: '0 1px 2px rgba(0,0,0,0.05)',
    md: '0 4px 6px -1px rgba(0,0,0,0.07)',
    lg: '0 10px 15px -3px rgba(0,0,0,0.08)',
    xl: '0 20px 25px -5px rgba(0,0,0,0.1)',
    section: 'none',
    block: 'none',
    card: '0 1px 3px rgba(0,0,0,0.08)',
    dropdown: '0 10px 15px -3px rgba(0,0,0,0.1)',
  },
  borders: {
    none: 'none',
    thin: '1px solid #e2e8f0',
    normal: '2px solid #e2e8f0',
    thick: '3px solid #e2e8f0',
    section: 'none',
    block: '1px solid #e2e8f0',
    divider: '1px solid #e2e8f0',
  },
  effects: {
    hover: 'opacity-80 transition-opacity',
    transition: 'all 0.2s ease-in-out',
    blur: 'blur(8px)',
    gradient: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
    glassEffect: 'rgba(255, 255, 255, 0.7)',
  },
  isDark: false,
};

// ─── Dark Theme ───
const darkTheme: ThemeDefinition = {
  ...defaultTheme,
  id: 'dark',
  name: 'Dark',
  label: 'Dark Professional',
  isDark: true,
  colors: {
    ...defaultTheme.colors,
    primary: '#3b82f6',
    primaryLight: '#60a5fa',
    primaryDark: '#2563eb',
    background: '#0f172a',
    surface: '#1e293b',
    surfaceAlt: '#334155',
    text: '#f1f5f9',
    textSecondary: '#94a3b8',
    textMuted: '#64748b',
    textOnPrimary: '#ffffff',
    border: '#334155',
    borderLight: '#1e293b',
    divider: '#334155',
    heading: '#f8fafc',
    link: '#60a5fa',
    linkHover: '#93c5fd',
  },
  effects: {
    ...defaultTheme.effects,
    glassEffect: 'rgba(30, 41, 59, 0.7)',
  },
};

// ─── Minimal Theme ───
const minimalTheme: ThemeDefinition = {
  ...defaultTheme,
  id: 'minimal',
  name: 'Minimal',
  label: 'Minimal',
  colors: {
    ...defaultTheme.colors,
    primary: '#111827',
    primaryLight: '#374151',
    primaryDark: '#030712',
    secondary: '#6b7280',
    accent: '#111827',
    background: '#ffffff',
    surface: '#ffffff',
    surfaceAlt: '#f9fafb',
    text: '#111827',
    textSecondary: '#6b7280',
    textMuted: '#9ca3af',
    border: '#e5e7eb',
    borderLight: '#f3f4f6',
    divider: '#e5e7eb',
    heading: '#111827',
  },
  spacing: {
    ...defaultTheme.spacing,
    page: '25mm',
    section: '1.25rem',
    gap: '0.75rem',
  },
  borders: {
    ...defaultTheme.borders,
    block: 'none',
    divider: '1px solid #e5e7eb',
  },
  shadows: {
    ...defaultTheme.shadows,
    card: 'none',
  },
};

// ─── Elegant Theme ───
const elegantTheme: ThemeDefinition = {
  ...defaultTheme,
  id: 'elegant',
  name: 'Elegant',
  label: 'Elegant',
  colors: {
    ...defaultTheme.colors,
    primary: '#1e293b',
    primaryLight: '#334155',
    primaryDark: '#0f172a',
    secondary: '#78716c',
    accent: '#d97706',
    background: '#fafaf9',
    surface: '#ffffff',
    surfaceAlt: '#f5f5f4',
    text: '#292524',
    textSecondary: '#78716c',
    textMuted: '#a8a29e',
    border: '#e7e5e4',
    borderLight: '#f5f5f4',
    divider: '#e7e5e4',
    heading: '#1c1917',
  },
  fonts: {
    ...defaultTheme.fonts,
    heading: '"Playfair Display", Georgia, serif',
    body: '"Lora", Georgia, serif',
  },
  typography: {
    ...defaultTheme.typography,
    heading1: { ...defaultTheme.typography.heading1, fontFamily: '"Playfair Display", Georgia, serif', fontWeight: '600' },
    heading2: { ...defaultTheme.typography.heading2, fontFamily: '"Playfair Display", Georgia, serif', fontWeight: '600' },
    heading3: { ...defaultTheme.typography.heading3, fontFamily: '"Playfair Display", Georgia, serif' },
    body: { ...defaultTheme.typography.body, fontFamily: '"Lora", Georgia, serif' },
    sectionTitle: { ...defaultTheme.typography.sectionTitle, fontFamily: '"Playfair Display", Georgia, serif', fontStyle: 'italic' },
  },
};

// ─── Professional Theme ───
const professionalTheme: ThemeDefinition = {
  ...defaultTheme,
  id: 'professional',
  name: 'Professional',
  label: 'Professional',
  colors: {
    ...defaultTheme.colors,
    primary: '#1e40af',
    primaryLight: '#2563eb',
    primaryDark: '#1e3a8a',
    secondary: '#475569',
    accent: '#0f766e',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#0f172a',
    textSecondary: '#475569',
    textMuted: '#94a3b8',
    border: '#e2e8f0',
    divider: '#e2e8f0',
  },
};

// ─── Creative Theme ───
const creativeTheme: ThemeDefinition = {
  ...defaultTheme,
  id: 'creative',
  name: 'Creative',
  label: 'Creative',
  colors: {
    ...defaultTheme.colors,
    primary: '#7c3aed',
    primaryLight: '#8b5cf6',
    primaryDark: '#6d28d9',
    secondary: '#ec4899',
    accent: '#f59e0b',
    background: '#faf5ff',
    surface: '#ffffff',
    text: '#1e1b4b',
    textSecondary: '#6b21a8',
    textMuted: '#a78bfa',
    border: '#e9d5ff',
    divider: '#e9d5ff',
    heading: '#4c1d95',
    link: '#7c3aed',
  },
  fonts: {
    ...defaultTheme.fonts,
    heading: '"Space Grotesk", sans-serif',
    body: '"Inter", sans-serif',
  },
  borderRadius: {
    ...defaultTheme.borderRadius,
    section: '12px',
    block: '8px',
    card: '12px',
  },
};

// ─── Modern Theme ───
const modernTheme: ThemeDefinition = {
  ...defaultTheme,
  id: 'modern',
  name: 'Modern',
  label: 'Modern',
  colors: {
    ...defaultTheme.colors,
    primary: '#0891b2',
    primaryLight: '#06b6d4',
    primaryDark: '#0e7490',
    secondary: '#2dd4bf',
    accent: '#f97316',
    background: '#ffffff',
    surface: '#ecfeff',
    text: '#164e63',
    textSecondary: '#155e75',
    textMuted: '#22d3ee',
    border: '#cffafe',
    divider: '#cffafe',
    heading: '#083344',
  },
  borderRadius: {
    ...defaultTheme.borderRadius,
    section: '8px',
    block: '6px',
    card: '8px',
  },
};

// ─── Classic Theme ───
const classicTheme: ThemeDefinition = {
  ...defaultTheme,
  id: 'classic',
  name: 'Classic',
  label: 'Classic',
  colors: {
    ...defaultTheme.colors,
    primary: '#991b1b',
    primaryLight: '#b91c1c',
    primaryDark: '#7f1d1d',
    secondary: '#78716c',
    accent: '#d97706',
    background: '#fefcfb',
    surface: '#faf8f7',
    text: '#292524',
    textSecondary: '#78716c',
    textMuted: '#a8a29e',
    border: '#e7e5e4',
    divider: '#e7e5e4',
    heading: '#1c1917',
  },
  fonts: {
    ...defaultTheme.fonts,
    heading: '"Libre Baskerville", Georgia, serif',
    body: '"Source Sans Pro", sans-serif',
  },
};

// ─── Vibrant Theme ───
const vibrantTheme: ThemeDefinition = {
  ...defaultTheme,
  id: 'vibrant',
  name: 'Vibrant',
  label: 'Vibrant',
  colors: {
    ...defaultTheme.colors,
    primary: '#dc2626',
    primaryLight: '#ef4444',
    primaryDark: '#b91c1c',
    secondary: '#2563eb',
    accent: '#16a34a',
    background: '#ffffff',
    surface: '#fef2f2',
    text: '#1f2937',
    textSecondary: '#6b7280',
    textMuted: '#9ca3af',
    border: '#fecaca',
    divider: '#fecaca',
    heading: '#991b1b',
  },
  borderRadius: {
    ...defaultTheme.borderRadius,
    section: '0',
    block: '0',
    card: '0',
  },
};

// ─── Corporate Theme ───
const corporateTheme: ThemeDefinition = {
  ...defaultTheme,
  id: 'corporate',
  name: 'Corporate',
  label: 'Corporate',
  colors: {
    ...defaultTheme.colors,
    primary: '#0f172a',
    primaryLight: '#1e293b',
    primaryDark: '#020617',
    secondary: '#3b82f6',
    accent: '#10b981',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#0f172a',
    textSecondary: '#475569',
    textMuted: '#94a3b8',
    border: '#e2e8f0',
    divider: '#e2e8f0',
    heading: '#020617',
  },
  fonts: {
    ...defaultTheme.fonts,
    heading: '"SF Pro Display", "Inter", sans-serif',
    body: '"SF Pro Text", "Inter", sans-serif',
  },
  spacing: {
    ...defaultTheme.spacing,
    page: '18mm',
    section: '1rem',
    gap: '0.75rem',
  },
};

// ─── Theme Registry ───
export const themeDefinitions: Record<ThemeId, ThemeDefinition> = {
  default: defaultTheme,
  dark: darkTheme,
  minimal: minimalTheme,
  elegant: elegantTheme,
  professional: professionalTheme,
  creative: creativeTheme,
  modern: modernTheme,
  classic: classicTheme,
  vibrant: vibrantTheme,
  corporate: corporateTheme,
  custom: defaultTheme,
};

class ThemeRegistry {
  private themes: Map<ThemeId, ThemeDefinition> = new Map();

  constructor() {
    Object.entries(themeDefinitions).forEach(([id, theme]) => {
      this.themes.set(id as ThemeId, theme);
    });
  }

  get(id: ThemeId): ThemeDefinition {
    const theme = this.themes.get(id);
    if (!theme) {
      console.warn(`Theme "${id}" not found, falling back to default`);
      return this.themes.get('default')!;
    }
    return theme;
  }

  getAll(): ThemeDefinition[] {
    return Array.from(this.themes.values());
  }

  register(theme: ThemeDefinition): void {
    this.themes.set(theme.id, theme);
  }

  unregister(id: ThemeId): void {
    this.themes.delete(id);
  }

  has(id: ThemeId): boolean {
    return this.themes.has(id);
  }
}

export const themeRegistry = new ThemeRegistry();

// ─── Theme Engine ───
class ThemeEngine {
  private registry: ThemeRegistry;

  constructor(registry: ThemeRegistry) {
    this.registry = registry;
  }

  getTheme(id: ThemeId): ThemeDefinition {
    return this.registry.get(id);
  }

  getAllThemes(): ThemeDefinition[] {
    return this.registry.getAll();
  }

  applyTheme(themeId: ThemeId): React.CSSProperties {
    const theme = this.registry.get(themeId);
    return generateThemeCSS(theme);
  }

  resolveThemeColors(themeId: ThemeId, customColors?: Partial<ThemeColors>): ThemeColors {
    const theme = this.registry.get(themeId);
    if (customColors) {
      return { ...theme.colors, ...customColors };
    }
    return theme.colors;
  }
}

export const themeEngine = new ThemeEngine(themeRegistry);

// ─── Theme CSS Generator ───
function generateThemeCSS(theme: ThemeDefinition): React.CSSProperties {
  const { colors, fonts, spacing, borderRadius, shadows, borders } = theme;
  return {
    '--color-primary': colors.primary,
    '--color-primary-light': colors.primaryLight,
    '--color-primary-dark': colors.primaryDark,
    '--color-secondary': colors.secondary,
    '--color-secondary-light': colors.secondaryLight,
    '--color-secondary-dark': colors.secondaryDark,
    '--color-accent': colors.accent,
    '--color-accent-light': colors.accentLight,
    '--color-accent-dark': colors.accentDark,
    '--color-background': colors.background,
    '--color-surface': colors.surface,
    '--color-surface-alt': colors.surfaceAlt,
    '--color-text': colors.text,
    '--color-text-secondary': colors.textSecondary,
    '--color-text-muted': colors.textMuted,
    '--color-text-on-primary': colors.textOnPrimary,
    '--color-border': colors.border,
    '--color-border-light': colors.borderLight,
    '--color-divider': colors.divider,
    '--color-success': colors.success,
    '--color-warning': colors.warning,
    '--color-error': colors.error,
    '--color-info': colors.info,
    '--color-heading': colors.heading,
    '--color-link': colors.link,
    '--color-link-hover': colors.linkHover,
    '--font-heading': fonts.heading,
    '--font-body': fonts.body,
    '--font-mono': fonts.mono || 'monospace',
    '--font-size-xs': fonts.sizes.xs,
    '--font-size-sm': fonts.sizes.sm,
    '--font-size-base': fonts.sizes.base,
    '--font-size-md': fonts.sizes.md,
    '--font-size-lg': fonts.sizes.lg,
    '--font-size-xl': fonts.sizes.xl,
    '--font-size-2xl': fonts.sizes['2xl'],
    '--font-size-3xl': fonts.sizes['3xl'],
    '--font-size-4xl': fonts.sizes['4xl'],
    '--spacing-page': spacing.page,
    '--spacing-section': spacing.section,
    '--spacing-block': spacing.block,
    '--spacing-xs': spacing.xs,
    '--spacing-sm': spacing.sm,
    '--spacing-md': spacing.md,
    '--spacing-lg': spacing.lg,
    '--spacing-xl': spacing.xl,
    '--spacing-2xl': spacing['2xl'],
    '--radius-sm': borderRadius.sm,
    '--radius-md': borderRadius.md,
    '--radius-lg': borderRadius.lg,
    '--radius-xl': borderRadius.xl,
    '--radius-full': borderRadius.full,
    '--shadow-sm': shadows.sm,
    '--shadow-md': shadows.md,
    '--shadow-lg': shadows.lg,
    '--shadow-xl': shadows.xl,
    '--border-section': borders.section,
    '--border-block': borders.block,
    '--border-divider': borders.divider,
  } as unknown as React.CSSProperties;
}

function generateThemeVariables(theme: ThemeDefinition): Record<string, string> {
  const props = generateThemeCSS(theme) as Record<string, string>;
  const variables: Record<string, string> = {};
  Object.entries(props).forEach(([key, value]) => {
    if (key.startsWith('--')) {
      variables[key] = value;
    }
  });
  return variables;
}

function applyThemeToStyles(theme: ThemeDefinition, existingStyles?: SectionStyle): React.CSSProperties {
  const themeStyles = generateThemeCSS(theme);
  if (existingStyles) {
    return { ...themeStyles, ...existingStyles } as unknown as React.CSSProperties;
  }
  return themeStyles as unknown as React.CSSProperties;
}

function isDarkMode(themeId: ThemeId): boolean {
  const theme = themeRegistry.get(themeId);
  return theme.isDark ?? false;
}

function detectSystemDarkMode(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export {
  generateThemeCSS,
  generateThemeVariables,
  applyThemeToStyles,
  isDarkMode,
  detectSystemDarkMode,
  ThemeRegistry,
};

export type { ThemeEngine };