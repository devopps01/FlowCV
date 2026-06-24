'use client';

import React, { useMemo } from 'react';
import type { ResumeData } from '@/types/resume-builder.types';
import { getThemeById } from '@/themes/themeRegistry';
import { layoutMap } from '@/layouts/layoutMap';
import { replaceTags } from '@/utils/dynamicTags';
import { getPageStyle } from '@/core/dynamicStyleEngine';

export interface DynamicResumePreviewProps {
  resume: ResumeData;
  className?: string;
  style?: React.CSSProperties;
  pageHeight?: number;
  /** Explicit content width in px — if set, overrides globalStyle.page.widthPx */
  contentWidth?: number;
  /** Explicit page height in px — if set, overrides pageHeight from style */
  pageSizeHeight?: number;
}

const applyTagInterpolation = (resume: ResumeData): ResumeData => ({
  ...resume,
  sections: resume.sections.map((section) => ({
    ...section,
    title: replaceTags(section.title, resume),
    blocks: section.blocks.map((block) => {
      if (typeof block.content === 'string') return { ...block, content: replaceTags(block.content, resume) };
      return block;
    }),
  })),
});

const DynamicResumePreview: React.FC<DynamicResumePreviewProps> = ({ resume, className, style, pageHeight, contentWidth, pageSizeHeight }) => {
  const hydrated = useMemo(() => applyTagInterpolation(resume), [resume]);
  const theme = getThemeById(hydrated.themeId);

  // Get the layout component — fallback to 'single' if not found
  const LayoutComponent = layoutMap[hydrated.layoutId] || layoutMap.single;

  // Use globalStyle overrides if available, otherwise fall back to theme
  const globalStyle = hydrated.globalStyle as any;
  const typography = globalStyle?.typography || theme.typography;
  const customColors = globalStyle?.colors;
  const customFonts = globalStyle?.fonts;

  // Resolve width: contentWidth prop > globalStyle.page.widthPx > theme default > fallback 794
  const resolvedWidth = contentWidth ?? globalStyle?.page?.widthPx ?? 794;

  // Resolve page height for layout components (for overflow clipping reference)
  const resolvedPageHeight = pageSizeHeight ?? pageHeight ?? 0;

  // Build merged page style: globalStyle overrides > theme defaults
  const pageStyle = React.useMemo(() => {
    const style = getPageStyle(theme);
    if (customColors) {
      style.backgroundColor = customColors.background || style.backgroundColor;
      style.color = customColors.text || style.color;
    }
    if (customFonts) {
      style.fontFamily = customFonts.body || style.fontFamily;
    }
    return style;
  }, [theme, customColors, customFonts]);

  // Use globalStyle spacing if available, otherwise fall back to theme
  // When paginated (style override present OR contentWidth passed), set padding to 0 since page container handles margins
  const hasStyleOverride = !!style || !!contentWidth;
  const pagePaddingY = hasStyleOverride ? 0 : (globalStyle?.spacing?.pagePaddingY ?? theme.spacing.pagePaddingY);
  const pagePaddingX = hasStyleOverride ? 0 : (globalStyle?.spacing?.pagePaddingX ?? theme.spacing.pagePaddingX);

  // Build layout-specific props from design settings
  const design = (resume as any).__design || {};
  const rawLayout = design.layout || '';
  const sidebarPosition = rawLayout.includes('right') ? 'right' : 'left';
  const sidebarWidth = rawLayout.includes('wide') ? '1.2fr' : rawLayout.includes('narrow') ? '0.6fr' : '1fr';

  return (
    <div
      className={className}
      style={{
        ...pageStyle,
        fontSize: `${typography.body}px`,
        lineHeight: typography.lineHeight || theme.typography.lineHeight,
        width: `${resolvedWidth}px`,
        padding: `${pagePaddingY}px ${pagePaddingX}px`,
        minHeight: 0,
        ...style,
      }}
    >
      <LayoutComponent
        resume={hydrated}
        sidebarPosition={sidebarPosition}
        sidebarWidth={sidebarWidth}
        pageHeight={resolvedPageHeight}
      />
    </div>
  );
};

export default React.memo(DynamicResumePreview);
export { DynamicResumePreview };