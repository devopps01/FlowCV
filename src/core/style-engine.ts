import type { CSSProperties } from 'react';
import type { BlockStyle, ResumeData, ResumeSection, ResumeBlock, ThemeDefinition } from '@/types/resume-builder.types';

const px = (value?: number): string | undefined => (typeof value === 'number' ? `${value}px` : undefined);

export function generateRootCssVariables(resume: ResumeData, theme: ThemeDefinition): CSSProperties {
  return {
    '--rb-color-primary': theme.colors.primary,
    '--rb-color-secondary': theme.colors.secondary,
    '--rb-color-accent': theme.colors.accent,
    '--rb-color-text': theme.colors.text,
    '--rb-color-muted': theme.colors.textMuted,
    '--rb-color-bg': theme.colors.background,
    '--rb-color-surface': theme.colors.surface,
    '--rb-color-border': theme.colors.border,
    '--rb-font-body': theme.fonts.body,
    '--rb-font-heading': theme.fonts.heading,
    '--rb-font-size-base': `${resume.globalStyle.fontSize}px`,
    '--rb-line-height': `${resume.globalStyle.lineHeight}`,
    '--rb-page-width': `${resume.globalStyle.page.widthPx}px`,
    '--rb-page-min-height': `${resume.globalStyle.page.minHeightPx}px`,
  } as CSSProperties;
}

export function sectionStyleToCss(section: ResumeSection, theme: ThemeDefinition): CSSProperties {
  return {
    display: section.visible ? 'block' : 'none',
    color: section.styleProps?.color ?? theme.colors.text,
    backgroundColor: section.styleProps?.backgroundColor,
    borderColor: section.styleProps?.borderColor ?? theme.colors.border,
    borderStyle: section.styleProps?.borderWidth ? 'solid' : undefined,
    borderWidth: px(section.styleProps?.borderWidth),
    borderRadius: px(section.styleProps?.borderRadius ?? theme.radius.md),
    padding: px(section.styleProps?.padding),
    marginBottom: px(section.styleProps?.marginBottom ?? theme.spacing.sectionGap),
    ...section.styleProps?.customCss,
  };
}

export function blockStyleToCss(block: ResumeBlock, theme: ThemeDefinition): CSSProperties {
  const style = block.styleProps;
  return {
    display: block.visible ? 'block' : 'none',
    color: style?.color ?? theme.colors.text,
    backgroundColor: style?.backgroundColor,
    borderColor: style?.borderColor ?? theme.colors.border,
    borderStyle: style?.borderWidth ? 'solid' : undefined,
    borderWidth: px(style?.borderWidth),
    borderRadius: px(style?.borderRadius ?? theme.radius.sm),
    padding: px(style?.padding),
    marginBottom: px(style?.marginBottom ?? theme.spacing.blockGap),
    textAlign: style?.textAlign,
    fontWeight: style?.fontWeight,
    fontSize: px(style?.fontSize),
    ...style?.customCss,
  };
}

export function mergeBlockStyle(
  base: BlockStyle | undefined,
  patch: Partial<BlockStyle> | undefined,
): BlockStyle | undefined {
  if (!base && !patch) return undefined;
  return {
    ...(base ?? {}),
    ...(patch ?? {}),
    customCss: {
      ...(base?.customCss ?? {}),
      ...(patch?.customCss ?? {}),
    },
  };
}
