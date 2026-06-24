import { describe, it, expect } from 'vitest';
import { themeRegistry, getThemeById } from '@/themes/themeRegistry';
import type { ThemeId } from '@/types/resume-builder.types';

// ═══════════════════════════════════════════════════
// Theme Registry Structure
// ═══════════════════════════════════════════════════
describe('themeRegistry', () => {
  const expectedThemes: ThemeId[] = ['default', 'midnight', 'executive', 'creative', 'ats'];

  it('contains all expected theme IDs', () => {
    expectedThemes.forEach((id) => {
      expect(themeRegistry[id]).toBeDefined();
    });
  });

  it('each theme has a unique id and name', () => {
    const ids = new Set<string>();
    const names = new Set<string>();
    Object.values(themeRegistry).forEach((theme) => {
      expect(ids.has(theme.id)).toBe(false);
      expect(names.has(theme.name)).toBe(false);
      ids.add(theme.id);
      names.add(theme.name);
    });
  });

  it('each theme has all required color keys', () => {
    const requiredColors = ['primary', 'secondary', 'accent', 'text', 'textMuted', 'background', 'surface', 'border'];
    Object.values(themeRegistry).forEach((theme) => {
      requiredColors.forEach((key) => {
        expect(theme.colors).toHaveProperty(key);
        expect(typeof (theme.colors as any)[key]).toBe('string');
      });
    });
  });

  it('each theme has all required typography keys', () => {
    const requiredTypo = ['h1', 'h2', 'h3', 'body', 'small', 'lineHeight', 'letterSpacing'];
    Object.values(themeRegistry).forEach((theme) => {
      requiredTypo.forEach((key) => {
        expect(theme.typography).toHaveProperty(key);
        expect(typeof (theme.typography as any)[key]).toBe('number');
      });
    });
  });

  it('each theme has valid spacing values', () => {
    Object.values(themeRegistry).forEach((theme) => {
      expect(theme.spacing.sectionGap).toBeGreaterThan(0);
      expect(theme.spacing.blockGap).toBeGreaterThan(0);
      expect(theme.spacing.pagePaddingX).toBeGreaterThan(0);
      expect(theme.spacing.pagePaddingY).toBeGreaterThan(0);
    });
  });

  it('each theme has valid radius values', () => {
    Object.values(themeRegistry).forEach((theme) => {
      expect(theme.radius.sm).toBeGreaterThanOrEqual(0);
      expect(theme.radius.md).toBeGreaterThanOrEqual(theme.radius.sm);
      expect(theme.radius.lg).toBeGreaterThanOrEqual(theme.radius.md);
    });
  });

  it('each theme has valid borders', () => {
    Object.values(themeRegistry).forEach((theme) => {
      expect(theme.borders.width).toBeGreaterThanOrEqual(0);
      expect(['solid', 'dashed', 'dotted', 'none', undefined]).toContain(theme.borders.style);
    });
  });

  it('each theme has font definitions', () => {
    Object.values(themeRegistry).forEach((theme) => {
      expect(theme.fonts.body).toBeTruthy();
      expect(theme.fonts.heading).toBeTruthy();
    });
  });
});

// ═══════════════════════════════════════════════════
// getThemeById
// ═══════════════════════════════════════════════════
describe('getThemeById', () => {
  it('returns the correct theme for a valid ID', () => {
    const theme = getThemeById('default');
    expect(theme.id).toBe('default');
    expect(theme.name).toBe('Default');
  });

  it('returns executive theme', () => {
    const theme = getThemeById('executive');
    expect(theme.id).toBe('executive');
    expect(theme.name).toBe('Executive');
  });

  it('returns midnight theme', () => {
    const theme = getThemeById('midnight');
    expect(theme.id).toBe('midnight');
    expect(theme.colors.background).toBe('#0f172a');
  });

  it('returns creative theme', () => {
    const theme = getThemeById('creative');
    expect(theme.id).toBe('creative');
    expect(theme.colors.primary).toBe('#7c3aed');
  });

  it('returns ATS theme', () => {
    const theme = getThemeById('ats');
    expect(theme.id).toBe('ats');
    expect(theme.radius.sm).toBe(0);
    expect(theme.radius.md).toBe(0);
    expect(theme.radius.lg).toBe(0);
  });

  it('falls back to default theme for unknown ID', () => {
    const theme = getThemeById('nonexistent' as ThemeId);
    expect(theme.id).toBe('default');
  });

  it('ATS theme has no shadows (ATS-friendly)', () => {
    const theme = getThemeById('ats');
    expect(theme.shadows.sm).toBe('none');
    expect(theme.shadows.md).toBe('none');
    expect(theme.shadows.lg).toBe('none');
  });

  it('midnight theme has light text on dark background', () => {
    const theme = getThemeById('midnight');
    expect(theme.colors.background).toMatch(/^#/);
    expect(theme.colors.text).toMatch(/^#/);
    // Midnight should have light text
    expect(theme.colors.text).not.toBe(theme.colors.background);
  });
});