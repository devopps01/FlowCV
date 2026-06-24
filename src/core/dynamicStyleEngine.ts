import type { CSSProperties } from 'react';
import type { BlockStyle, ResumeBlock, ResumeSection, ThemeDefinition } from '@/types/resume-builder.types';

const px = (value?: number): string | undefined => (typeof value === 'number' ? `${value}px` : undefined);

export const getPageStyle = (theme: ThemeDefinition): CSSProperties => ({
  backgroundColor: theme.colors.background,
  color: theme.colors.text,
  fontFamily: theme.fonts.body,
  fontSize: `${theme.typography.body}px`,
  lineHeight: theme.typography.lineHeight,
  letterSpacing: `${theme.typography.letterSpacing}px`,
});

export const getSectionStyle = (section: ResumeSection, theme: ThemeDefinition): CSSProperties => ({
  display: section.visible ? 'block' : 'none',
  marginBottom: px(section.styleProps?.marginBottom ?? theme.spacing.sectionGap),
  backgroundColor: section.styleProps?.backgroundColor,
  borderRadius: px(section.styleProps?.borderRadius ?? theme.radius.md),
  borderColor: section.styleProps?.borderColor ?? theme.colors.border,
  borderWidth: px(section.styleProps?.borderWidth),
  borderStyle: section.styleProps?.borderWidth ? 'solid' : undefined,
  padding: px(section.styleProps?.padding),
  ...(section.styleProps?.customCss || {}),
});

export const getBlockStyle = (block: ResumeBlock, theme: ThemeDefinition): CSSProperties => ({
  display: block.visible ? 'block' : 'none',
  marginBottom: px(block.styleProps?.marginBottom),
  padding: px(block.styleProps?.padding),
  color: block.styleProps?.color ?? theme.colors.text,
  backgroundColor: block.styleProps?.backgroundColor,
  borderRadius: px(block.styleProps?.borderRadius ?? theme.radius.sm),
  borderWidth: px(block.styleProps?.borderWidth),
  borderStyle: block.styleProps?.borderWidth ? 'solid' : undefined,
  borderColor: block.styleProps?.borderColor ?? theme.colors.border,
  textAlign: block.styleProps?.textAlign,
  ...(block.styleProps?.customCss || {}),
});

export const mergeBlockStyles = (base?: BlockStyle, override?: Partial<BlockStyle>): BlockStyle | undefined => {
  if (!base && !override) return undefined;
  return {
    ...(base || {}),
    ...(override || {}),
    customCss: {
      ...(base?.customCss || {}),
      ...(override?.customCss || {}),
    },
  };
};
