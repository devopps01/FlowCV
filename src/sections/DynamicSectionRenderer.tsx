'use client';

import React from 'react';
import type { ResumeData, ResumeSection } from '@/types/resume-builder.types';
import { DynamicBlockRenderer } from '@/blocks/DynamicBlockRenderer';
import { getThemeById } from '@/themes/themeRegistry';
import { getSectionStyle } from '@/core/dynamicStyleEngine';

export interface DynamicSectionRendererProps {
  section: ResumeSection;
  resume: ResumeData;
}

/**
 * Determines if a section is a "header" type section (name/contact/title area)
 */
const isHeaderSection = (section: ResumeSection): boolean => {
  return section.type === 'header';
};

/**
 * Get the base heading style from a headingStyle ID (e.g., "underline_t1" → "underline")
 */
const getHeadingBase = (styleId: string): string => {
  if (!styleId || styleId === 'none') return 'none';
  return styleId.split('_')[0];
};

/**
 * Apply section heading style based on design settings
 */
const getHeadingStyleProps = (
  design: any,
  sectionColors: any,
  theme: any,
  blockGap: number,
  globalTypography?: any,
): React.CSSProperties => {
  const headingStyle = design?.headingStyle || 'none';
  const base = getHeadingBase(headingStyle);
  const capitalization = design?.headingCapitalization || 'uppercase';
  const accentColor = design?.primaryColor || sectionColors.primary || theme.colors.primary;

  // Use computed typography from globalStyle (set by computeGlobalStyle in normalizeResume)
  // Fall back to hardcoded size map for backward compatibility
  const computedHeadingSize = globalTypography?.h3;
  const sizeMap: Record<string, number> = { s: 10, m: 12, l: 14, xl: 16 };
  const fontSize = computedHeadingSize || sizeMap[design?.headingSize || 'm'] || 12;

  // Text transform
  const textTransform = capitalization === 'uppercase' ? 'uppercase' : capitalization === 'capitalize' ? 'capitalize' : 'none';

  const baseStyle: React.CSSProperties = {
    fontSize: `${fontSize}px`,
    fontWeight: 700,
    textTransform,
    letterSpacing: '0.5px',
    color: accentColor,
    margin: 0,
    padding: 0,
    lineHeight: 1.3,
    fontFamily: theme.fonts.heading,
  };

  switch (base) {
    case 'underline':
      return {
        ...baseStyle,
        borderBottom: `2px solid ${accentColor}`,
        paddingBottom: `${blockGap / 2}px`,
        display: 'inline-block',
      };
    case 'line-bottom':
    case 'border-bottom':
      return {
        ...baseStyle,
        borderBottom: `${theme.borders?.width || 1}px ${theme.borders?.style || 'solid'} ${accentColor}`,
        paddingBottom: `${blockGap / 2}px`,
      };
    case 'border-left':
      return {
        ...baseStyle,
        borderLeft: `3px solid ${accentColor}`,
        paddingLeft: '8px',
      };
    case 'border-right':
      return {
        ...baseStyle,
        textAlign: 'right' as const,
        borderRight: `3px solid ${accentColor}`,
        paddingRight: '8px',
      };
    case 'background':
    case 'box': {
      const subType = headingStyle.split('_')[1] || 'filled';
      if (subType === 'filled' || subType === 't3') {
        return {
          ...baseStyle,
          backgroundColor: accentColor,
          color: '#ffffff',
          padding: '4px 10px',
          borderRadius: '3px',
        };
      } else if (subType === 'outlined' || subType === 't2') {
        return {
          ...baseStyle,
          border: `1.5px solid ${accentColor}`,
          padding: '3px 10px',
          borderRadius: '3px',
        };
      } else {
        return {
          ...baseStyle,
          backgroundColor: `${accentColor}15`,
          padding: '4px 10px',
          borderRadius: '3px',
        };
      }
    }
    case 'double-line':
      return {
        ...baseStyle,
        borderTop: `1px solid ${accentColor}`,
        borderBottom: `1px solid ${accentColor}`,
        paddingTop: '2px',
        paddingBottom: '2px',
      };
    case 'dot':
      return {
        ...baseStyle,
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
      };
    case 'badge':
      return {
        ...baseStyle,
        backgroundColor: accentColor,
        color: '#ffffff',
        padding: '3px 12px',
        borderRadius: '4px',
        display: 'inline-block',
      };
    case 'capsule':
      return {
        ...baseStyle,
        border: `1.5px solid ${accentColor}`,
        color: accentColor,
        padding: '3px 14px',
        borderRadius: '20px',
        display: 'inline-block',
      };
    case 'gradient':
      return {
        ...baseStyle,
        background: `linear-gradient(90deg, ${accentColor}22, transparent)`,
        padding: '4px 10px',
        borderRadius: '3px',
      };
    case 'overline':
      return {
        ...baseStyle,
        borderTop: `2px solid ${accentColor}`,
        paddingTop: '4px',
      };
    case 'strikethrough':
      return {
        ...baseStyle,
        textDecoration: 'line-through',
        textDecorationColor: accentColor,
      };
    case 'shadow':
      return {
        ...baseStyle,
        textShadow: `2px 2px 0 ${accentColor}22`,
      };
    case 'double-side':
      return {
        ...baseStyle,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      };
    // New heading styles
    case 'dotted-bottom':
      return {
        ...baseStyle,
        borderBottom: `2px dotted ${accentColor}`,
        paddingBottom: `${blockGap / 2}px`,
      };
    case 'dashed-bottom':
      return {
        ...baseStyle,
        borderBottom: `2px dashed ${accentColor}`,
        paddingBottom: `${blockGap / 2}px`,
      };
    case 'wave-bottom':
      return {
        ...baseStyle,
        borderBottom: `3px wavy ${accentColor}`,
        paddingBottom: `${blockGap / 2}px`,
      };
    case 'zigzag-bottom':
      return {
        ...baseStyle,
        borderBottom: `2px ${accentColor}`,
        borderBottomStyle: 'zigzag' as any,
        paddingBottom: `${blockGap / 2}px`,
      };
    case 'diamond':
      return {
        ...baseStyle,
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
      };
    case 'star':
      return {
        ...baseStyle,
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
      };
    case 'arrow-left':
      return {
        ...baseStyle,
        borderLeft: `3px solid ${accentColor}`,
        paddingLeft: '8px',
      };
    case 'arrow-right':
      return {
        ...baseStyle,
        borderRight: `3px solid ${accentColor}`,
        paddingRight: '8px',
        textAlign: 'right' as const,
      };
    case 'bracket-left':
      return {
        ...baseStyle,
        borderLeft: `2px solid ${accentColor}`,
        paddingLeft: '8px',
      };
    case 'bracket-right':
      return {
        ...baseStyle,
        borderRight: `2px solid ${accentColor}`,
        paddingRight: '8px',
        textAlign: 'right' as const,
      };
    case 'pill':
      return {
        ...baseStyle,
        border: `2px solid ${accentColor}`,
        color: accentColor,
        padding: '3px 14px',
        borderRadius: '999px',
        display: 'inline-block',
      };
    case 'tag':
      return {
        ...baseStyle,
        backgroundColor: `${accentColor}18`,
        padding: '3px 10px',
        borderRadius: '3px',
        display: 'inline-block',
      };
    case 'ribbon':
      return {
        ...baseStyle,
        backgroundColor: accentColor,
        color: '#ffffff',
        padding: '4px 14px',
        display: 'inline-block',
      };
    case 'flag':
      return {
        ...baseStyle,
        borderLeft: `4px solid ${accentColor}`,
        paddingLeft: '8px',
      };
    case 'ornament':
      return {
        ...baseStyle,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      };
    case 'layered':
      return {
        ...baseStyle,
        borderTop: `1px solid ${accentColor}44`,
        borderBottom: `1px solid ${accentColor}44`,
        paddingTop: '2px',
        paddingBottom: '2px',
      };
    case 'glow':
      return {
        ...baseStyle,
        textShadow: `0 0 8px ${accentColor}66`,
      };
    case 'neon':
      return {
        ...baseStyle,
        color: accentColor,
        textShadow: `0 0 10px ${accentColor}88, 0 0 20px ${accentColor}44`,
      };
    case 'emboss':
      return {
        ...baseStyle,
        textShadow: `1px 1px 0 #fff, -1px -1px 0 ${accentColor}44`,
      };
    case 'outline':
      return {
        ...baseStyle,
        WebkitTextStroke: `1px ${accentColor}`,
        color: 'transparent',
      };
    case 'filled-outline':
      return {
        ...baseStyle,
        WebkitTextStroke: `1px ${accentColor}`,
        backgroundColor: `${accentColor}15`,
        padding: '2px 8px',
      };
    case 'split-bg':
      return {
        ...baseStyle,
        background: `linear-gradient(90deg, ${accentColor}33 0%, ${accentColor}33 33%, transparent 33%)`,
        padding: '3px 10px',
      };
    case 'bottom-accent':
      return {
        ...baseStyle,
        borderBottom: `3px solid ${accentColor}`,
        paddingBottom: `${blockGap / 2}px`,
      };
    case 'top-accent':
      return {
        ...baseStyle,
        borderTop: `3px solid ${accentColor}`,
        paddingTop: '4px',
      };
    case 'double-underline':
      return {
        ...baseStyle,
        borderBottom: `2px double ${accentColor}`,
        paddingBottom: `${blockGap / 2}px`,
      };
    case 'thick-underline':
      return {
        ...baseStyle,
        borderBottom: `3px solid ${accentColor}`,
        paddingBottom: `${blockGap / 2}px`,
      };
    default:
      return {
        ...baseStyle,
        borderBottom: `${theme.borders?.width || 1}px ${theme.borders?.style || 'solid'} ${theme.colors.border}`,
        paddingBottom: `${blockGap / 2}px`,
      };
  }
};

/**
 * Read style overrides for the section title at the given path.
 */
const getSectionTitleOverride = (resume: ResumeData, path: string): React.CSSProperties => {
  const overrides = (resume as any).styleOverrides as Record<string, any> | undefined;
  if (!overrides || !path) return {};
  const o = overrides[path];
  if (!o) return {};
  const css: React.CSSProperties = {};
  if (o.fontSize) css.fontSize = `${o.fontSize}px`;
  if (o.fontWeight) css.fontWeight = o.fontWeight;
  if (o.fontStyle) css.fontStyle = o.fontStyle;
  if (o.textDecoration) css.textDecoration = o.textDecoration;
  if (o.textAlign) css.textAlign = o.textAlign as any;
  if (o.fontFamily) css.fontFamily = `'${o.fontFamily}', sans-serif`;
  if (o.color) css.color = o.color;
  if (o.backgroundColor && o.backgroundColor !== 'transparent') css.backgroundColor = o.backgroundColor;
  return css;
};

/**
 * Render the heading with decorative elements based on style
 */
const renderStyledHeading = (
  title: string,
  headingProps: React.CSSProperties,
  design: any,
  accentColor: string,
  overrideStyle: React.CSSProperties = {},
): React.ReactNode => {
  const headingStyle = design?.headingStyle || 'none';
  const base = getHeadingBase(headingStyle);

  // Apply user overrides on top of the design defaults
  const finalHeadingProps: React.CSSProperties = { ...headingProps, ...overrideStyle };

  if (base === 'dot') {
    return (
      <h3 style={finalHeadingProps}>
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: accentColor, display: 'inline-block', flexShrink: 0 }} />
        {title}
      </h3>
    );
  }

  if (base === 'double-side') {
    return (
      <h3 style={finalHeadingProps}>
        <span style={{ flex: 1, height: '1px', backgroundColor: accentColor, opacity: 0.4 }} />
        {title}
        <span style={{ flex: 1, height: '1px', backgroundColor: accentColor, opacity: 0.4 }} />
      </h3>
    );
  }

  if (base === 'diamond') {
    return (
      <h3 style={finalHeadingProps}>
        <span style={{ width: '6px', height: '6px', backgroundColor: accentColor, display: 'inline-block', transform: 'rotate(45deg)', flexShrink: 0 }} />
        {title}
      </h3>
    );
  }

  if (base === 'star') {
    return (
      <h3 style={finalHeadingProps}>
        <span style={{ color: accentColor, fontSize: '10px', flexShrink: 0 }}>★</span>
        {title}
      </h3>
    );
  }

  if (base === 'ornament') {
    return (
      <h3 style={finalHeadingProps}>
        <span style={{ color: accentColor, fontSize: '8px', flexShrink: 0 }}>✦</span>
        <span style={{ flex: 1, height: '1px', backgroundColor: accentColor, opacity: 0.3 }} />
        {title}
        <span style={{ flex: 1, height: '1px', backgroundColor: accentColor, opacity: 0.3 }} />
        <span style={{ color: accentColor, fontSize: '8px', flexShrink: 0 }}>✦</span>
      </h3>
    );
  }

  if (base === 'arrow-left') {
    return (
      <h3 style={finalHeadingProps}>
        <span style={{ width: 0, height: 0, borderTop: '4px solid transparent', borderBottom: '4px solid transparent', borderRight: `5px solid ${accentColor}`, display: 'inline-block', flexShrink: 0 }} />
        {title}
      </h3>
    );
  }

  if (base === 'arrow-right') {
    return (
      <h3 style={finalHeadingProps}>
        {title}
        <span style={{ width: 0, height: 0, borderTop: '4px solid transparent', borderBottom: '4px solid transparent', borderLeft: `5px solid ${accentColor}`, display: 'inline-block', flexShrink: 0, marginLeft: '4px' }} />
      </h3>
    );
  }

  if (base === 'bracket-left') {
    return (
      <h3 style={finalHeadingProps}>
        <span style={{ color: accentColor, fontWeight: 700, marginRight: '4px' }}>[</span>
        {title}
      </h3>
    );
  }

  if (base === 'bracket-right') {
    return (
      <h3 style={finalHeadingProps}>
        {title}
        <span style={{ color: accentColor, fontWeight: 700, marginLeft: '4px' }}>]</span>
      </h3>
    );
  }

  // Wrap heading in a div with bottom border for reliable html2canvas rendering
  return <h3 style={finalHeadingProps}>{title}</h3>;
};

const DynamicSectionRenderer: React.FC<DynamicSectionRendererProps> = ({ section, resume }) => {
  const theme = getThemeById(resume.themeId);
  if (!section.visible) return null;

  const typography = resume.globalStyle?.typography || theme.typography;
  const globalStyle = resume.globalStyle as any;
  const design = (resume as any).__design || {};

  // Use globalStyle spacing if available, fallback to theme
  const blockGap = globalStyle?.spacing?.blockGap ?? theme.spacing.blockGap;
  const sectionGap = globalStyle?.spacing?.sectionGap ?? theme.spacing.sectionGap;

  // Use globalStyle colors if available, fallback to theme
  const sectionColors = globalStyle?.colors || theme.colors;
  const sectionFonts = globalStyle?.fonts || theme.fonts;

  // Per-section accent color override
  const sectionType = section.type === 'custom' ? (section.title || '').toLowerCase() : section.type;
  const perSectionColor = design?.sectionAccentColor?.[sectionType];

  const headerSection = isHeaderSection(section);
  const isContinued = (section as any)._continued === true;

  // Get heading style props from design settings — use computed typography for heading size
  const headingProps = getHeadingStyleProps(design, sectionColors, theme, blockGap, typography);

  // Strip any borderBottom from h3 style — render it on a wrapper div instead
  // This ensures html2canvas can reliably render the line/decorations
  const { borderBottom, ...headingPropsNoBorder } = headingProps as any;
  const headingWrapperStyle: React.CSSProperties | null = borderBottom
    ? {
        borderBottom,
        display: 'inline-block',
        paddingBottom: (headingProps as any).paddingBottom || '0',
        width: '100%',
        marginBottom: 0,
      }
    : null;

  // Section title path: used by the inline editor to save style overrides
  // (font size, color, etc.) and apply them to the section heading.
  // We use section.id directly so the override is keyed to the section itself.
  const sectionTitlePath = `sections.${section.id}.title`;
  const sectionTitleOverride = getSectionTitleOverride(resume, sectionTitlePath);

  return (
    <div
      style={{}}
      className="break-inside-avoid"
      data-resume-section={section.id}
    >
      {/* Section Header - only show for non-header sections, not for continued sections */}
      {!headerSection && !isContinued && section.title && (
        <header
          data-resume-section-header={section.id}
          data-edit-path={sectionTitlePath}
          data-style-path={sectionTitlePath}
          data-edit-label={section.title}
          style={{
            display: 'block',
            margin: 0,
            padding: 0,
            width: '100%',
          }}
        >
          {headingWrapperStyle ? (
            <div
              style={{
                ...headingWrapperStyle,
                marginTop: `${Math.max(blockGap, 6)}px`,
                marginBottom: `${Math.max(blockGap, 4)}px`,
                // paddingBottom: `${Math.max(blockGap, 4)}px`,
              }}
            >
              {renderStyledHeading(section.title, headingPropsNoBorder, design, perSectionColor || design?.primaryColor || sectionColors.primary || theme.colors.primary, sectionTitleOverride)}
            </div>
          ) : (
            <div
              style={{
                marginTop: `${Math.max(blockGap, 6)}px`,
                marginBottom: `${Math.max(blockGap, 4)}px`,
              }}
            >
              {renderStyledHeading(section.title, headingPropsNoBorder, design, perSectionColor || design?.primaryColor || sectionColors.primary || theme.colors.primary, sectionTitleOverride)}
            </div>
          )}
        </header>
      )}

      {/* Section Blocks */}
      {headerSection && (design?.profileLayout === 'left' || design?.profileLayout === 'right') ? (
        // Side-by-side layout: image on one side, text content on the other
        (() => {
          const allBlocks = section.blocks
            .filter((b) => b.visible)
            .sort((a, b) => a.order - b.order);
          const imageBlock = allBlocks.find(b => b.type === 'image');
          const textBlocks = allBlocks.filter(b => b.type !== 'image');
          const isImageLeft = design?.profileLayout === 'left';

          if (!imageBlock) {
            // No image block, render normally
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: `${blockGap}px` }}>
                {allBlocks.map((block) => (
                  <DynamicBlockRenderer key={block.id} block={block} resume={resume} sectionType={sectionType} />
                ))}
              </div>
            );
          }

          return (
            <div style={{
              display: 'flex',
              flexDirection: isImageLeft ? 'row' : 'row-reverse',
              gap: '16px',
              alignItems: 'flex-start',
            }}>
              {/* Image column */}
              <div style={{ flexShrink: 0 }}>
                <DynamicBlockRenderer key={imageBlock.id} block={imageBlock} resume={resume} />
              </div>
              {/* Text content column */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: `${blockGap}px`, minWidth: 0 }}>
                {textBlocks.map((block) => (
                  <DynamicBlockRenderer key={block.id} block={block} resume={resume} sectionType={sectionType} />
                ))}
              </div>
            </div>
          );
        })()
      ) : (
        // Default: vertical layout
        <div style={{ display: 'flex', flexDirection: 'column', gap: `${blockGap}px` }}>
          {section.blocks
            .filter((b) => b.visible)
            .sort((a, b) => a.order - b.order)
            .map((block) => (
              <DynamicBlockRenderer key={block.id} block={block} resume={resume} sectionType={sectionType} />
            ))}
        </div>
      )}
    </div>
  );
};

export default React.memo(DynamicSectionRenderer);
export { DynamicSectionRenderer };