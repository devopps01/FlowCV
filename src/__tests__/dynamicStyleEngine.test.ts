import { describe, it, expect } from 'vitest';
import { getPageStyle, getSectionStyle, getBlockStyle, mergeBlockStyles } from '@/core/dynamicStyleEngine';
import type { ResumeSection, ResumeBlock, ThemeDefinition } from '@/types/resume-builder.types';

// ── Test Theme ──
const testTheme: ThemeDefinition = {
  id: 'default',
  name: 'Test Theme',
  colors: {
    primary: '#2563eb',
    secondary: '#4f46e5',
    accent: '#06b6d4',
    text: '#111827',
    textMuted: '#4b5563',
    background: '#ffffff',
    surface: '#f8fafc',
    border: '#e5e7eb',
  },
  fonts: {
    body: 'Inter, sans-serif',
    heading: 'Inter, sans-serif',
  },
  typography: { h1: 16, h2: 14, h3: 12, body: 10, small: 9, lineHeight: 1.5, letterSpacing: 0.1 },
  spacing: { sectionGap: 12, blockGap: 6, pagePaddingX: 20, pagePaddingY: 20 },
  radius: { sm: 4, md: 8, lg: 12 },
  shadows: { sm: 'none', md: '0 1px 3px rgba(0,0,0,0.12)', lg: '0 8px 20px rgba(0,0,0,0.12)' },
  borders: { width: 1, style: 'solid' },
};

// ═══════════════════════════════════════════════════
// getPageStyle
// ═══════════════════════════════════════════════════
describe('getPageStyle', () => {
  it('returns correct background color from theme', () => {
    const style = getPageStyle(testTheme);
    expect(style.backgroundColor).toBe('#ffffff');
  });

  it('returns correct text color from theme', () => {
    const style = getPageStyle(testTheme);
    expect(style.color).toBe('#111827');
  });

  it('returns correct font family from theme', () => {
    const style = getPageStyle(testTheme);
    expect(style.fontFamily).toBe('Inter, sans-serif');
  });

  it('returns correct font size from theme typography', () => {
    const style = getPageStyle(testTheme);
    expect(style.fontSize).toBe('10px');
  });

  it('returns correct line height from theme typography', () => {
    const style = getPageStyle(testTheme);
    expect(style.lineHeight).toBe(1.5);
  });

  it('returns correct letter spacing from theme typography', () => {
    const style = getPageStyle(testTheme);
    expect(style.letterSpacing).toBe('0.1px');
  });

  it('handles midnight theme with dark background', () => {
    const midnightTheme: ThemeDefinition = {
      ...testTheme,
      colors: { ...testTheme.colors, background: '#0f172a' },
    };
    const style = getPageStyle(midnightTheme);
    expect(style.backgroundColor).toBe('#0f172a');
  });
});

// ═══════════════════════════════════════════════════
// getSectionStyle
// ═══════════════════════════════════════════════════
describe('getSectionStyle', () => {
  const mockSection: ResumeSection = {
    id: 'sec-1',
    type: 'experience',
    title: 'Experience',
    visible: true,
    order: 0,
    blocks: [],
  };

  it('returns block display for visible section', () => {
    const style = getSectionStyle(mockSection, testTheme);
    expect(style.display).toBe('block');
  });

  it('returns none display for hidden section', () => {
    const hiddenSection = { ...mockSection, visible: false };
    const style = getSectionStyle(hiddenSection, testTheme);
    expect(style.display).toBe('none');
  });

  it('uses theme sectionGap as default marginBottom', () => {
    const style = getSectionStyle(mockSection, testTheme);
    expect(style.marginBottom).toBe('12px');
  });

  it('uses custom marginBottom from styleProps', () => {
    const sectionWithMargin = { ...mockSection, styleProps: { marginBottom: 20 } };
    const style = getSectionStyle(sectionWithMargin, testTheme);
    expect(style.marginBottom).toBe('20px');
  });

  it('uses theme radius.md as default borderRadius', () => {
    const style = getSectionStyle(mockSection, testTheme);
    expect(style.borderRadius).toBe('8px');
  });

  it('uses theme border color as default', () => {
    const sectionWithBorder = { ...mockSection, styleProps: { borderWidth: 1 } };
    const style = getSectionStyle(sectionWithBorder, testTheme);
    expect(style.borderColor).toBe('#e5e7eb');
    expect(style.borderStyle).toBe('solid');
  });

  it('applies custom backgroundColor from styleProps', () => {
    const sectionWithBg = { ...mockSection, styleProps: { backgroundColor: '#f0f0f0' } };
    const style = getSectionStyle(sectionWithBg, testTheme);
    expect(style.backgroundColor).toBe('#f0f0f0');
  });

  it('does not set borderStyle when no borderWidth', () => {
    const style = getSectionStyle(mockSection, testTheme);
    expect(style.borderStyle).toBeUndefined();
  });
});

// ═══════════════════════════════════════════════════
// getBlockStyle
// ═══════════════════════════════════════════════════
describe('getBlockStyle', () => {
  const mockBlock: ResumeBlock = {
    id: 'blk-1',
    type: 'text',
    content: { text: 'Hello' },
    visible: true,
    order: 0,
  };

  it('returns block display for visible block', () => {
    const style = getBlockStyle(mockBlock, testTheme);
    expect(style.display).toBe('block');
  });

  it('returns none display for hidden block', () => {
    const hiddenBlock = { ...mockBlock, visible: false };
    const style = getBlockStyle(hiddenBlock, testTheme);
    expect(style.display).toBe('none');
  });

  it('uses theme blockGap as default marginBottom', () => {
    const style = getBlockStyle(mockBlock, testTheme);
    expect(style.marginBottom).toBe('6px');
  });

  it('uses theme text color as default', () => {
    const style = getBlockStyle(mockBlock, testTheme);
    expect(style.color).toBe('#111827');
  });

  it('uses theme radius.sm as default borderRadius', () => {
    const style = getBlockStyle(mockBlock, testTheme);
    expect(style.borderRadius).toBe('4px');
  });

  it('applies custom textAlign from styleProps', () => {
    const blockWithAlign = { ...mockBlock, styleProps: { textAlign: 'center' as const } };
    const style = getBlockStyle(blockWithAlign, testTheme);
    expect(style.textAlign).toBe('center');
  });

  it('applies custom color from styleProps', () => {
    const blockWithColor = { ...mockBlock, styleProps: { color: '#ff0000' } };
    const style = getBlockStyle(blockWithColor, testTheme);
    expect(style.color).toBe('#ff0000');
  });

  it('applies customCss from styleProps', () => {
    const blockWithCss = { ...mockBlock, styleProps: { customCss: { opacity: 0.5 } } };
    const style = getBlockStyle(blockWithCss, testTheme);
    expect(style.opacity).toBe(0.5);
  });
});

// ═══════════════════════════════════════════════════
// mergeBlockStyles
// ═══════════════════════════════════════════════════
describe('mergeBlockStyles', () => {
  it('returns undefined when both inputs are undefined', () => {
    expect(mergeBlockStyles(undefined, undefined)).toBeUndefined();
  });

  it('returns base when override is undefined', () => {
    const base = { color: '#000' };
    const result = mergeBlockStyles(base, undefined);
    expect(result?.color).toBe('#000');
    expect(result?.customCss).toEqual({});
  });

  it('returns override when base is undefined', () => {
    const override = { color: '#fff' };
    const result = mergeBlockStyles(undefined, override);
    expect(result?.color).toBe('#fff');
    expect(result?.customCss).toEqual({});
  });

  it('merges override into base', () => {
    const base = { color: '#000', padding: 10 };
    const override = { color: '#fff' };
    const result = mergeBlockStyles(base, override);
    expect(result?.color).toBe('#fff');
    expect(result?.padding).toBe(10);
  });

  it('deep merges customCss', () => {
    const base = { customCss: { fontSize: 12, color: 'red' } };
    const override = { customCss: { fontSize: 16 } };
    const result = mergeBlockStyles(base, override);
    expect(result?.customCss).toEqual({ fontSize: 16, color: 'red' });
  });

  it('creates customCss when only override has it', () => {
    const base = { color: '#000' };
    const override = { customCss: { opacity: 0.5 } };
    const result = mergeBlockStyles(base, override);
    expect(result?.customCss).toEqual({ opacity: 0.5 });
  });
});