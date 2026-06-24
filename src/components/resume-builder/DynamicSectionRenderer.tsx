'use client';

import React from 'react';
import { ResumeSection, ResumeData } from './types/resume.types';
import DynamicBlockRenderer from './blocks/DynamicBlockRenderer';

interface DynamicSectionRendererProps {
  section: ResumeSection;
  data: ResumeData;
  onUpdateBlock?: (sectionId: string, blockId: string, content: any) => void;
  isEditing?: boolean;
  layout?: string;
  getAccentColor?: (target: string, fallback?: string) => string;
  getHeadingMeta?: () => { headingStyleId: string; lineColor: string; lineThick: string; lineWidth: string };
}

/**
 * Compute heading style CSS from design settings — shared with src/sections/DynamicSectionRenderer
 */
const getHeadingBase = (styleId: string): string => {
  if (!styleId || styleId === 'none') return 'none';
  return styleId.split('_')[0];
};

const computeResumeHeadingStyle = (
  design: any,
  theme: any,
  headingColor: string,
): React.CSSProperties => {
  const headingStyle = design?.headingStyle || theme.headingStyle || 'none';
  const base = getHeadingBase(headingStyle);
  const capitalization = design?.headingCapitalization || theme.headingCapitalization || 'uppercase';
  const headingSize = design?.headingSize || theme.headingSize || 'm';

  const sizeMap: Record<string, string> = { s: '11px', m: '12px', l: '13px', xl: '14px' };
  const fontSize = sizeMap[headingSize] || '12px';

  const baseStyle: React.CSSProperties = {
    color: headingColor,
    textTransform: capitalization === 'uppercase' ? 'uppercase' : capitalization === 'lowercase' ? 'lowercase' : capitalization === 'capitalize' ? 'capitalize' : 'none',
    fontWeight: 700,
    fontSize,
    letterSpacing: '0.05em',
    margin: 0,
    padding: 0,
  };

  switch (base) {
    case 'underline':
      return { ...baseStyle, borderBottom: `2px solid ${headingColor}`, paddingBottom: '4px', display: 'inline-block' };
    case 'line-bottom':
    case 'border-bottom':
      return { ...baseStyle, borderBottom: `1px solid ${headingColor}`, paddingBottom: '4px' };
    case 'border-left':
      return { ...baseStyle, borderLeft: `3px solid ${headingColor}`, paddingLeft: '8px' };
    case 'border-right':
      return { ...baseStyle, textAlign: 'right', borderRight: `3px solid ${headingColor}`, paddingRight: '8px' };
    case 'background':
    case 'box': {
      const subType = headingStyle.split('_')[1] || 'filled';
      if (subType === 'filled' || subType === 't3') {
        return { ...baseStyle, backgroundColor: headingColor, color: '#ffffff', padding: '4px 10px', borderRadius: '3px' };
      } else if (subType === 'outlined' || subType === 't2') {
        return { ...baseStyle, border: `1.5px solid ${headingColor}`, padding: '3px 10px', borderRadius: '3px' };
      }
      return { ...baseStyle, backgroundColor: `${headingColor}15`, padding: '4px 10px', borderRadius: '3px' };
    }
    case 'double-line':
      return { ...baseStyle, borderTop: `1px solid ${headingColor}`, borderBottom: `1px solid ${headingColor}`, paddingTop: '2px', paddingBottom: '2px' };
    case 'dot':
      return { ...baseStyle, display: 'flex', alignItems: 'center', gap: '6px' };
    case 'badge':
      return { ...baseStyle, backgroundColor: headingColor, color: '#ffffff', padding: '3px 12px', borderRadius: '4px', display: 'inline-block' };
    case 'capsule':
      return { ...baseStyle, border: `1.5px solid ${headingColor}`, color: headingColor, padding: '3px 14px', borderRadius: '20px', display: 'inline-block' };
    case 'gradient':
      return { ...baseStyle, background: `linear-gradient(90deg, ${headingColor}22, transparent)`, padding: '4px 10px', borderRadius: '3px' };
    case 'overline':
      return { ...baseStyle, borderTop: `2px solid ${headingColor}`, paddingTop: '4px' };
    case 'strikethrough':
      return { ...baseStyle, textDecoration: 'line-through', textDecorationColor: headingColor };
    case 'shadow':
      return { ...baseStyle, textShadow: `2px 2px 0 ${headingColor}22` };
    case 'double-side':
      return { ...baseStyle, display: 'flex', alignItems: 'center', gap: '8px' };
    default:
      return { ...baseStyle, borderBottom: `1px solid ${headingColor}40`, paddingBottom: '4px' };
  }
};

const renderStyledHeading = (
  title: string,
  headingProps: React.CSSProperties,
  headingStyle: string,
  headingColor: string,
): React.ReactNode => {
  const base = getHeadingBase(headingStyle);
  if (base === 'dot') {
    return (
      <h3 style={headingProps}>
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: headingColor, display: 'inline-block', flexShrink: 0 }} />
        {title}
      </h3>
    );
  }
  if (base === 'double-side') {
    return (
      <h3 style={headingProps}>
        <span style={{ flex: 1, height: '1px', backgroundColor: headingColor, opacity: 0.4 }} />
        {title}
        <span style={{ flex: 1, height: '1px', backgroundColor: headingColor, opacity: 0.4 }} />
      </h3>
    );
  }
  return <h3 style={headingProps}>{title}</h3>;
};

const DynamicSectionRenderer: React.FC<DynamicSectionRendererProps> = ({
  section,
  data,
  onUpdateBlock,
  isEditing = true,
  layout = 'single',
  getAccentColor,
  getHeadingMeta,
}) => {
  if (!section.visible) return null;

  const theme = data.theme;
  const sectionSpacing = `${theme.sectionSpacing || 10}mm`;
  const headingColor = getAccentColor ? getAccentColor('headings', theme.textColor) : theme.primaryColor;

  const sectionStyle: React.CSSProperties = {
    marginBottom: sectionSpacing,
    breakInside: 'avoid',
    pageBreakInside: 'avoid',
    fontFamily: theme.fontFamily,
  };

  if (section.style) {
    Object.assign(sectionStyle, section.style);
  }

  const handleBlockUpdate = (blockId: string, content: any) => {
    onUpdateBlock?.(section.id, blockId, content);
  };

  // Compute heading style from design settings (or theme defaults)
  const headingProps = computeResumeHeadingStyle(data.design || {}, theme, headingColor);
  const headingStyleId = data.design?.headingStyle || theme.headingStyle || 'none';

  return (
    <div className="dynamic-section" data-section-id={section.id} style={sectionStyle}>
      {/* Section Header — using full computeResumeHeadingStyle for all heading styles */}
      <div className="mb-2">
        {renderStyledHeading(section.title, headingProps, headingStyleId, headingColor)}
      </div>

      {/* Section Blocks */}
      <div className="section-blocks space-y-2">
        {section.blocks.map((block, index) => {
          if (block.visible === false) return null;
          return (
            <div key={block.id} className="block-wrapper">
              <DynamicBlockRenderer
                block={block}
                sectionId={section.id}
                data={data}
                onUpdate={handleBlockUpdate}
                isEditing={isEditing}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DynamicSectionRenderer;