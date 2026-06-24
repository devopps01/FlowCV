'use client';

import React from 'react';
import Image from 'next/image';
import type { ResumeBlock, ResumeData, TypographyScale } from '@/types/resume-builder.types';
import { replaceTags } from '@/utils/dynamicTags';
import { getBlockStyle } from '@/core/dynamicStyleEngine';
import { getThemeById } from '@/themes/themeRegistry';

type BlockRenderer = React.FC<{ block: ResumeBlock; resume: ResumeData; sectionType?: string }>;

/**
 * Resolve the active typography scale from the resume's globalStyle or theme.
 */
const getTypography = (resume: ResumeData): TypographyScale => {
  const theme = getThemeById(resume.themeId);
  const globalTypo = (resume as any).globalStyle?.typography;
  if (!globalTypo) return theme.typography;
  if (typeof globalTypo.body === 'number') return globalTypo as TypographyScale;
  if (globalTypo.scale) return globalTypo.scale;
  return theme.typography;
};

const getColors = (resume: ResumeData) => {
  const theme = getThemeById(resume.themeId);
  const customColors = (resume as any).globalStyle?.colors;
  return customColors || theme.colors;
};

const getFonts = (resume: ResumeData) => {
  const theme = getThemeById(resume.themeId);
  const customFonts = (resume as any).globalStyle?.fonts;
  return customFonts || theme.fonts;
};

const getBorders = (resume: ResumeData) => {
  const theme = getThemeById(resume.themeId);
  return theme.borders;
};

const getRadius = (resume: ResumeData) => {
  const theme = getThemeById(resume.themeId);
  return theme.radius;
};

const getDesign = (resume: ResumeData): any => {
  return (resume as any).__design || {};
};

const getStyleOverrideForPath = (resume: ResumeData, path: string): React.CSSProperties => {
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

const getEditPath = (block: ResumeBlock): string => {
  const content = block.content as any;
  return content?._editPath || '';
};

const getTagOverride = (resume: ResumeData, path: string): string | undefined => {
  const overrides = (resume as any).styleOverrides as Record<string, any> | undefined;
  if (!overrides || !path) return undefined;
  return overrides[path]?._tag;
};

const applyTag = (
  Tag: string,
  tagOverride: string | undefined,
  props: any,
  children: React.ReactNode,
): React.ReactNode => {
  const finalTag = (tagOverride || Tag) as keyof JSX.IntrinsicElements;
  return React.createElement(finalTag, props, children);
};

// ─── Entry title/subtitle size helpers ──────────────────────────────────────

const ENTRY_TITLE_SIZE_MAP: Record<string, string> = { s: '11px', m: '13px', l: '15px' };
const NAME_SIZE_MAP: Record<string, string> = { xs: '16px', s: '20px', m: '24px', l: '28px', xl: '34px' };
const TITLE_SIZE_MAP: Record<string, string> = { s: '10px', m: '12px', l: '14px' };
const PHOTO_SIZE_MAP: Record<string, number> = { xs: 50, s: 70, m: 90, l: 110, xl: 130, '2xl': 160, '3xl': 190, '4xl': 220 };

// ─── Block Renderers ──────────────────────────────────────────────────────────

const HeadingBlock: BlockRenderer = ({ block, resume }) => {
  const content = block.content as { text?: string; level?: number };
  const level = Math.min(Math.max(content.level || 2, 1), 3);
  const text = replaceTags(content.text || '', resume);
  const theme = getThemeById(resume.themeId);
  const typography = getTypography(resume);
  const colors = getColors(resume);
  const fonts = getFonts(resume);
  const design = getDesign(resume);

  const fontSizeKey = level === 1 ? 'h1' : level === 2 ? 'h2' : 'h3';
  const fontSize = typography[fontSizeKey] || theme.typography[fontSizeKey] || 12;
  const fontWeight = level === 1 ? '700' : level === 2 ? '600' : '500';
  const color = level === 1 ? colors.primary || theme.colors.primary : colors.text || theme.colors.text;

  // Apply personal details styles for header name/title
  let appliedFontSize = fontSize;
  let appliedFontWeight = fontWeight;
  let appliedColor = color;
  let appliedFontStyle: string | undefined;
  let appliedTextAlign: string | undefined;
  let appliedDisplay: string | undefined;
  let appliedGap: string | undefined;

  const isName = level === 1;
  const isTitle = level === 2 && content.text?.toLowerCase() === (design?.personalArrangement === 'default' ? '' : '').toLowerCase();

  if (isName) {
    appliedFontSize = parseInt(NAME_SIZE_MAP[design?.nameSize || 'm']) || fontSize;
    appliedFontWeight = design?.nameBold !== false ? '700' : '600';
    appliedTextAlign = design?.personalAlign || undefined;
  }

  if (level === 2 && !isName) {
    // This is the professional title
    appliedFontSize = parseInt(TITLE_SIZE_MAP[design?.titleSize || 'm']) || fontSize;
    appliedFontStyle = design?.titleStyle === 'italic' ? 'italic' : undefined;
    appliedTextAlign = design?.personalAlign || undefined;
  }

  const editPath = getEditPath(block);
  const overrideStyle = getStyleOverrideForPath(resume, editPath);
  const tagOverride = getTagOverride(resume, editPath);

  const defaultTag = `h${level}`;
  const finalTag = (tagOverride || defaultTag) as keyof JSX.IntrinsicElements;
  return React.createElement(
    finalTag,
    {
      'data-edit-path': editPath || undefined,
      'data-style-path': editPath || undefined,
      style: {
        fontSize: `${appliedFontSize}px`,
        fontWeight: appliedFontWeight,
        color: appliedColor,
        fontFamily: fonts.heading || theme.fonts.heading,
        margin: 0,
        padding: 0,
        lineHeight: 1.3,
        fontStyle: appliedFontStyle,
        textAlign: appliedTextAlign,
        display: appliedDisplay,
        gap: appliedGap,
        ...overrideStyle,
      },
    },
    text
  );
};

const TextBlock: BlockRenderer = ({ block, resume }) => {
  const content = block.content as { text?: string };
  const theme = getThemeById(resume.themeId);
  const typography = getTypography(resume);
  const colors = getColors(resume);
  const design = getDesign(resume);

  const editPath = getEditPath(block);
  const overrideStyle = getStyleOverrideForPath(resume, editPath);
  const tagOverride = getTagOverride(resume, editPath);

  const defaultTag = 'div';
  const finalTag = (tagOverride || defaultTag) as keyof JSX.IntrinsicElements;

  // Apply personal details alignment for header contact text
  const isHeaderContact = editPath?.includes('personalInfo');
  const textAlign = isHeaderContact ? (design?.personalAlign || undefined) : undefined;

  const rawText = content.text || '';
  const hasHtml = /<[a-z][\s\S]*>/i.test(rawText);

  // Resolve {{tags}} before rendering
  const resolvedText = replaceTags(rawText, resume);

  // Base style for the container
  const baseStyle: React.CSSProperties = {
    whiteSpace: 'normal',
    lineHeight: typography.lineHeight || theme.typography.lineHeight,
    color: colors.text || theme.colors.text,
    margin: 0,
    textAlign,
    fontSize: `${typography.small}px`,
    ...overrideStyle,
  };

  if (hasHtml) {
    // Content has HTML — render it safely using dangerouslySetInnerHTML
    // But first strip any <p> wrapping if it's simple text content
    // and replace {{tags}} within the HTML
    const htmlWithTags = resolvedText
      // Replace {{tags}} that might be inside HTML
      .replace(/<p>/gi, '<p style="margin:0">')
      .replace(/<br\s*\/?>/gi, '<br style="display:block">')
      .replace(/<\/?div[^>]*>/gi, '');

    return React.createElement(
      finalTag,
      {
        'data-edit-path': editPath || undefined,
        'data-style-path': editPath || undefined,
        style: baseStyle,
        dangerouslySetInnerHTML: { __html: htmlWithTags },
      }
    );
  }

  // Plain text with newlines — convert \n to <br> so line breaks are preserved
  if (resolvedText.includes('\n')) {
    const htmlText = resolvedText
      .split('\n')
      .map(line => line || '<br>')
      .join('<br>');
    return React.createElement(
      finalTag,
      {
        'data-edit-path': editPath || undefined,
        'data-style-path': editPath || undefined,
        style: baseStyle,
        dangerouslySetInnerHTML: { __html: htmlText },
      }
    );
  }

  // Plain text — render as normal text (no HTML wrapping)
  return React.createElement(
    finalTag,
    {
      'data-edit-path': editPath || undefined,
      'data-style-path': editPath || undefined,
      style: baseStyle,
    },
    resolvedText
  );
};

const SkillBlock: BlockRenderer = ({ block, resume, sectionType }) => {
  const content = block.content as { items?: string[] };
  const theme = getThemeById(resume.themeId);
  const typography = getTypography(resume);
  const colors = getColors(resume);
  const borders = getBorders(resume);
  const radius = getRadius(resume);
  const design = getDesign(resume);

  const basePath = getEditPath(block);

  // Determine skill style based on section type (from prop or editPath fallback)
  const st = (sectionType || '').toLowerCase();
  const isSkillsSection = st === 'skills';
  const isLanguagesSection = st === 'languages' || (typeof basePath === 'string' && (basePath === 'content.languages' || basePath.startsWith('content.languages')));
  const isInterestsSection = st === 'interests' || (typeof basePath === 'string' && (basePath === 'content.interests' || basePath.startsWith('content.interests')));
  const isCertificationsSection = st === 'certifications' || (typeof basePath === 'string' && (basePath === 'content.certifications' || basePath.startsWith('content.certifications')));
  const isReferencesSection = st === 'references' || (typeof basePath === 'string' && (basePath === 'content.references' || basePath.startsWith('content.references')));

  let skillStyle: string = 'grid';
  let columns = 2;
  if (isSkillsSection) {
    skillStyle = (design?.skillsStyle as any) || 'grid';
    columns = design?.skillsColumns ?? 2;
  } else if (isLanguagesSection) {
    skillStyle = (design?.languagesStyle as any) || 'grid';
    columns = design?.languagesColumns ?? 1;
  } else if (isInterestsSection) {
    skillStyle = (design?.interestsStyle as any) || 'grid';
    columns = design?.interestsColumns ?? 2;
  } else if (isCertificationsSection) {
    skillStyle = (design?.certificationsStyle as any) || 'grid';
    columns = design?.certificationsColumns ?? 2;
  } else if (isReferencesSection) {
    skillStyle = (design?.referencesStyle as any) || 'grid';
    columns = design?.referencesColumns ?? 1;
  }

  const items = content.items || [];
  const accentColor = design?.primaryColor || colors.primary || theme.colors.primary;

  // For languages sections, if `items` is empty/missing but the legacy
  // `content.languages` array is available on the resume (as objects with
  // `language` and `proficiency`), build the items from it. This keeps the
  // preview working for users whose saved data only has content.languages
  // and no items array yet.
  const languagesItems: string[] = (() => {
    if (!isLanguagesSection) return items;
    if (items.length > 0) return items;
    const langs = (resume as any).content?.languages;
    if (Array.isArray(langs) && langs.length > 0) {
      return langs
        .map((l: any) => {
          if (typeof l === 'string') return l;
          return [l?.language, l?.proficiency].filter(Boolean).join(' \u2014 ');
        })
        .filter(Boolean);
    }
    return items;
  })();
  const effectiveItems = isLanguagesSection ? languagesItems : items;

  // Languages-specific styling options
  const languagesGap = isLanguagesSection ? (design?.languagesGap ?? 4) : 4;
  const languagesWrap = isLanguagesSection ? (design?.languagesWrap || 'wrap') : 'wrap';
  const languagesAlign = isLanguagesSection ? (design?.languagesAlign || 'start') : 'start';
  const languagesDirection = isLanguagesSection ? (design?.languagesDirection || 'row') : 'row';
  const languagesJustify = isLanguagesSection ? (design?.languagesJustify || 'start') : 'start';

  // ───────────────────────────────────────────────────────────
  // Default style — show as bordered inline items (like old education format)
  // ───────────────────────────────────────────────────────────
  if (skillStyle === 'default') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: `${languagesGap}px` }}>
        {effectiveItems.map((item, idx) => {
          const itemPath = `${basePath}.${idx}`;
          const itemStyle = getStyleOverrideForPath(resume, itemPath);
          const parts = item.split(' — ');
          const name = parts[0] || item;
          const subtitle = parts.slice(1).join(' — ');
          return (
            <div key={item} data-edit-path={itemPath || undefined} data-style-path={itemPath || undefined} style={{ padding: '2px 0', ...itemStyle }}>
              <div style={{ fontWeight: 600, fontSize: `${typography.small}px`, color: colors.text || theme.colors.text }}>
                {replaceTags(name, resume)}
              </div>
              {subtitle && (
                <div style={{ fontSize: `${typography.small - 0.5}px`, color: colors.textMuted || theme.colors.textMuted }}>
                  {replaceTags(subtitle, resume)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────
  // Level style — show as progress bars
  // ───────────────────────────────────────────────────────────
  if (skillStyle === 'level') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: `${languagesGap}px` }}>
        {effectiveItems.map((item, idx) => {
          const itemPath = `${basePath}.${idx}`;
          const itemStyle = getStyleOverrideForPath(resume, itemPath);
          const level = Math.max(40, 100 - (idx * 12) % 60);
          return (
            <div key={item} data-edit-path={itemPath || undefined} data-style-path={itemPath || undefined} style={{ ...itemStyle }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                <span style={{ fontSize: `${typography.small}px`, color: colors.text || theme.colors.text, fontWeight: 500 }}>
                  {replaceTags(item, resume)}
                </span>
              </div>
              <div style={{ height: '4px', backgroundColor: `${accentColor}15`, borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${level}%`, backgroundColor: accentColor, borderRadius: '2px' }} />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────
  // Compact style — each item on its own line
  // ───────────────────────────────────────────────────────────
  if (skillStyle === 'compact') {
    const isRow = languagesDirection === 'row';
    return (
      <div style={isRow ? {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: languagesWrap,
        alignItems: languagesAlign,
        gap: `${languagesGap}px`,
      } : {
        display: 'flex',
        flexDirection: 'column',
        alignItems: languagesAlign === 'stretch' ? 'stretch' : languagesAlign,
        gap: `${languagesGap}px`,
      }}>
        {effectiveItems.map((item, idx) => {
          const itemPath = `${basePath}.${idx}`;
          const itemStyle = getStyleOverrideForPath(resume, itemPath);
          return (
            <div
              key={item}
              data-edit-path={itemPath || undefined}
              data-style-path={itemPath || undefined}
              style={{
                fontSize: `${typography.small}px`,
                color: colors.text || theme.colors.text,
                fontWeight: isCertificationsSection ? 700 : undefined,
                borderRadius: '2px',
                border: `1px solid ${colors.border || '#d1d5db'}`,
                padding: '2px 6px',
                width: 'fit-content',
                ...itemStyle,
              }}
            >
              {replaceTags(item, resume)}
            </div>
          );
        })}
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────
  // Bubble style — rounded pill tags with accent color
  // ───────────────────────────────────────────────────────────
  if (skillStyle === 'bubble') {
    const isRow = languagesDirection === 'row';
    return (
      <div style={isRow ? {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: languagesWrap,
        alignItems: languagesAlign,
        gap: `${languagesGap}px`,
      } : {
        display: 'flex',
        flexDirection: 'column',
        alignItems: languagesAlign === 'stretch' ? 'stretch' : languagesAlign,
        gap: `${languagesGap}px`,
      }}>
        {effectiveItems.map((item, idx) => {
          const itemPath = `${basePath}.${idx}`;
          const itemStyle = getStyleOverrideForPath(resume, itemPath);
          return (
            <span
              key={item}
              data-edit-path={itemPath || undefined}
              data-style-path={itemPath || undefined}
              style={{
                borderRadius: '20px',
                padding: '3px 10px',
                fontSize: `${typography.small}px`,
                backgroundColor: `${accentColor}15`,
                color: accentColor,
                fontWeight: 500,
                border: `1px solid ${accentColor}30`,
                ...itemStyle,
              }}
            >
              {replaceTags(item, resume)}
            </span>
          );
        })}
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────
  // Languages grid — fall through; row uses flex-basis, column uses flex-column
  // ───────────────────────────────────────────────────────────
  if (isLanguagesSection && skillStyle === 'grid') {
    const justifyContentMap: Record<string, string> = {
      start: 'flex-start',
      center: 'center',
      end: 'flex-end',
      between: 'space-between',
    };
    const isRow = languagesDirection === 'row';
    const baseFlex = 100 / Math.max(columns || 1, 1);
    return (
      <div style={isRow ? {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: languagesWrap,
        alignItems: languagesAlign,
        justifyContent: justifyContentMap[languagesJustify] || 'flex-start',
        gap: `${languagesGap}px`,
      } : {
        display: 'flex',
        flexDirection: 'column',
        flexWrap: languagesWrap,
        alignItems: languagesAlign,
        justifyContent: justifyContentMap[languagesJustify] || 'flex-start',
        gap: `${languagesGap}px`,
      }}>
        {effectiveItems.map((item, idx) => {
          const itemPath = `${basePath}.${idx}`;
          const itemStyle = getStyleOverrideForPath(resume, itemPath);
          return (
            <span
              key={item}
              data-edit-path={itemPath || undefined}
              data-style-path={itemPath || undefined}
              style={isRow ? {
                flex: `0 0 calc(${baseFlex}% - ${languagesGap}px)`,
                borderRadius: `${radius.sm || 4}px`,
                border: `${borders.width || 1}px ${borders.style || 'solid'} ${colors.border || theme.colors.border}`,
                padding: '2px 6px',
                fontSize: `${typography.small}px`,
                backgroundColor: colors.surface || theme.colors.surface,
                color: colors.text || theme.colors.text,
                whiteSpace: languagesWrap === 'nowrap' ? 'nowrap' : 'normal',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                ...itemStyle,
              } : {
                borderRadius: `${radius.sm || 4}px`,
                border: `${borders.width || 1}px ${borders.style || 'solid'} ${colors.border || theme.colors.border}`,
                padding: '2px 6px',
                fontSize: `${typography.small}px`,
                backgroundColor: colors.surface || theme.colors.surface,
                color: colors.text || theme.colors.text,
                whiteSpace: languagesWrap === 'nowrap' ? 'nowrap' : 'normal',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                ...itemStyle,
              }}
            >
              {replaceTags(item, resume)}
            </span>
          );
        })}
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────
  // Pills style — small rounded pills with text
  // ───────────────────────────────────────────────────────────
  if (skillStyle === 'pills') {
    const isRow = languagesDirection === 'row';
    return (
      <div style={isRow ? { display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: `${languagesGap}px` } : { display: 'flex', flexDirection: 'column', gap: `${languagesGap}px` }}>
        {effectiveItems.map((item, idx) => (
          <span key={item} style={{ borderRadius: '20px', padding: '2px 8px', fontSize: `${typography.small}px`, backgroundColor: `${accentColor}15`, color: accentColor, fontWeight: 500, border: `1px solid ${accentColor}30` }}>
            {replaceTags(item, resume)}
          </span>
        ))}
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────
  // Tag style — small bordered tags
  // ───────────────────────────────────────────────────────────
  if (skillStyle === 'tag') {
    return (
      <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: `${languagesGap}px` }}>
        {effectiveItems.map((item, idx) => (
          <span key={item} style={{ borderRadius: '4px', padding: '2px 6px', fontSize: `${typography.small}px`, backgroundColor: `${accentColor}08`, color: colors.text || theme.colors.text, border: `1px solid ${accentColor}40`, fontWeight: 500 }}>
            {replaceTags(item, resume)}
          </span>
        ))}
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────
  // Outlined style — bordered rectangles with transparent bg
  // ───────────────────────────────────────────────────────────
  if (skillStyle === 'outlined') {
    return (
      <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: `${languagesGap}px` }}>
        {effectiveItems.map((item, idx) => (
          <span key={item} style={{ borderRadius: '4px', padding: '2px 8px', fontSize: `${typography.small}px`, color: accentColor, border: `1.5px solid ${accentColor}`, background: 'transparent', fontWeight: 600 }}>
            {replaceTags(item, resume)}
          </span>
        ))}
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────
  // Minimal style — just text, no borders/bg
  // ───────────────────────────────────────────────────────────
  if (skillStyle === 'minimal') {
    return (
      <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: `${languagesGap}px` }}>
        {effectiveItems.map((item, idx) => {
          const sep = idx < effectiveItems.length - 1 ? ' / ' : '';
          return (
            <span key={item} style={{ fontSize: `${typography.small}px`, color: colors.text || theme.colors.text }}>
              {replaceTags(item, resume)}{sep}
            </span>
          );
        })}
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────
  // Striped style — underline stripes
  // ───────────────────────────────────────────────────────────
  if (skillStyle === 'striped') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
        {effectiveItems.map((item, idx) => (
          <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: `${typography.small}px`, color: colors.text || theme.colors.text }}>
            <span style={{ flex: 1 }}>{replaceTags(item, resume)}</span>
            <div style={{ height: '2px', backgroundColor: accentColor, opacity: 0.3, flex: 2 }} />
          </div>
        ))}
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────
  // Badge style — filled accent rounded badges
  // ───────────────────────────────────────────────────────────
  if (skillStyle === 'badge') {
    return (
      <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: `${languagesGap}px` }}>
        {effectiveItems.map((item, idx) => (
          <span key={item} style={{ borderRadius: '12px', padding: '3px 10px', fontSize: `${typography.small}px`, backgroundColor: accentColor, color: '#fff', fontWeight: 600 }}>
            {replaceTags(item, resume)}
          </span>
        ))}
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────
  // Chip style — outlined chips with rounded corners
  // ───────────────────────────────────────────────────────────
  if (skillStyle === 'chip') {
    return (
      <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: `${languagesGap}px` }}>
        {effectiveItems.map((item, idx) => (
          <span key={item} style={{ borderRadius: '16px', padding: '2px 8px', fontSize: `${typography.small}px`, color: accentColor, border: `1px solid ${accentColor}`, fontWeight: 500 }}>
            {replaceTags(item, resume)}
          </span>
        ))}
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────
  // Circle style — small circles
  // ───────────────────────────────────────────────────────────
  if (skillStyle === 'circle') {
    return (
      <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: `${languagesGap}px`, alignItems: 'center' }}>
        {effectiveItems.map((item, idx) => (
          <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: accentColor }} />
            <span style={{ fontSize: `${typography.small}px`, color: colors.text || theme.colors.text }}>{replaceTags(item, resume)}</span>
          </div>
        ))}
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────
  // Card style — larger bordered boxes
  // ───────────────────────────────────────────────────────────
  if (skillStyle === 'card') {
    const cols = Math.min(columns || 2, 3);
    return (
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '6px' }}>
        {effectiveItems.map((item, idx) => (
          <div key={item} style={{ borderRadius: '8px', padding: '6px 8px', fontSize: `${typography.small}px`, color: colors.text || theme.colors.text, border: `1px solid ${accentColor}30`, backgroundColor: `${accentColor}08`, fontWeight: 600, textAlign: 'center' }}>
            {replaceTags(item, resume)}
          </div>
        ))}
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────
  // Rounded style — medium rounded boxes with bg
  // ───────────────────────────────────────────────────────────
  if (skillStyle === 'rounded') {
    return (
      <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: `${languagesGap}px` }}>
        {effectiveItems.map((item, idx) => (
          <span key={item} style={{ borderRadius: '8px', padding: '3px 10px', fontSize: `${typography.small}px`, backgroundColor: `${accentColor}12`, color: colors.text || theme.colors.text, fontWeight: 500, border: `1px solid ${accentColor}20` }}>
            {replaceTags(item, resume)}
          </span>
        ))}
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────
  // Gradient style — gradient background
  // ───────────────────────────────────────────────────────────
  if (skillStyle === 'gradient') {
    return (
      <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: `${languagesGap}px` }}>
        {effectiveItems.map((item, idx) => (
          <span key={item} style={{ borderRadius: '6px', padding: '3px 10px', fontSize: `${typography.small}px`, color: '#fff', fontWeight: 600, background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)` }}>
            {replaceTags(item, resume)}
          </span>
        ))}
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────
  // Filled style — solid background blocks
  // ───────────────────────────────────────────────────────────
  if (skillStyle === 'filled') {
    return (
      <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: `${languagesGap}px` }}>
        {effectiveItems.map((item, idx) => (
          <span key={item} style={{ borderRadius: '4px', padding: '3px 10px', fontSize: `${typography.small}px`, backgroundColor: accentColor, color: '#fff', fontWeight: 600 }}>
            {replaceTags(item, resume)}
          </span>
        ))}
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────
  // Dotted style — dotted underline
  // ───────────────────────────────────────────────────────────
  if (skillStyle === 'dotted') {
    return (
      <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: `${languagesGap}px` }}>
        {effectiveItems.map((item, idx) => {
          const sep = idx < effectiveItems.length - 1 ? ' · ' : '';
          return (
            <span key={item} style={{ fontSize: `${typography.small}px`, color: colors.text || theme.colors.text, borderBottom: `1px dotted ${accentColor}` }}>
              {replaceTags(item, resume)}{sep}
            </span>
          );
        })}
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────
  // Dashed style — dashed border boxes
  // ───────────────────────────────────────────────────────────
  if (skillStyle === 'dashed') {
    return (
      <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: `${languagesGap}px` }}>
        {effectiveItems.map((item, idx) => (
          <span key={item} style={{ borderRadius: '4px', padding: '2px 8px', fontSize: `${typography.small}px`, color: accentColor, border: `1px dashed ${accentColor}50`, fontWeight: 500 }}>
            {replaceTags(item, resume)}
          </span>
        ))}
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────
  // Shadow style — shadowed cards
  // ───────────────────────────────────────────────────────────
  if (skillStyle === 'shadow') {
    const cols = Math.min(columns || 2, 3);
    return (
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '6px' }}>
        {effectiveItems.map((item, idx) => (
          <div key={item} style={{ borderRadius: '6px', padding: '4px 8px', fontSize: `${typography.small}px`, color: colors.text || theme.colors.text, backgroundColor: '#fff', fontWeight: 500, textAlign: 'center', boxShadow: `0 1px 3px rgba(0,0,0,0.12)` }}>
            {replaceTags(item, resume)}
          </div>
        ))}
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────
  // Icon-list style — star bullet list
  // ───────────────────────────────────────────────────────────
  if (skillStyle === 'icon-list') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {effectiveItems.map((item, idx) => (
          <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: `${typography.small}px`, color: colors.text || theme.colors.text }}>
            <span style={{ color: accentColor, fontSize: '8px' }}>&#9733;</span>
            <span>{replaceTags(item, resume)}</span>
          </div>
        ))}
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────
  // Numbered style — numbered list
  // ───────────────────────────────────────────────────────────
  if (skillStyle === 'numbered') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {effectiveItems.map((item, idx) => (
          <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: `${typography.small}px`, color: colors.text || theme.colors.text }}>
            <span style={{ color: accentColor, fontWeight: 700, minWidth: '16px' }}>{idx + 1}.</span>
            <span>{replaceTags(item, resume)}</span>
          </div>
        ))}
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────
  // Stacked style — stacked layers
  // ───────────────────────────────────────────────────────────
  if (skillStyle === 'stacked') {
    const cols = Math.min(columns || 2, 3);
    return (
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '2px' }}>
        {effectiveItems.map((item, idx) => (
          <div key={item} style={{ position: 'relative', borderRadius: '4px', padding: '4px 8px', fontSize: `${typography.small}px`, color: colors.text || theme.colors.text, backgroundColor: `${accentColor}12`, fontWeight: 500, textAlign: 'center', marginTop: idx > 0 ? '-2px' : '0' }}>
            <span style={{ position: 'relative', zIndex: 1 }}>{replaceTags(item, resume)}</span>
          </div>
        ))}
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────
  // Boxed style — bordered boxes with thicker border
  // ───────────────────────────────────────────────────────────
  if (skillStyle === 'boxed') {
    const cols = Math.min(columns || 2, 3);
    return (
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '6px' }}>
        {effectiveItems.map((item, idx) => (
          <div key={item} style={{ borderRadius: '4px', padding: '4px 6px', fontSize: `${typography.small}px`, color: accentColor, border: `2px solid ${accentColor}`, fontWeight: 600, textAlign: 'center' }}>
            {replaceTags(item, resume)}
          </div>
        ))}
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────
  // Default: Grid style for non-languages sections
  // ───────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: '4px' }}>
      {effectiveItems.map((item, idx) => {
        const itemPath = `${basePath}.${idx}`;
        const itemStyle = getStyleOverrideForPath(resume, itemPath);
        return (
          <span
            key={item}
            data-edit-path={itemPath || undefined}
            data-style-path={itemPath || undefined}
            style={{
              borderRadius: `${radius.sm || 4}px`,
              border: `${borders.width || 1}px ${borders.style || 'solid'} ${colors.border || theme.colors.border}`,
              padding: '2px 6px',
              fontSize: `${typography.small}px`,
              backgroundColor: colors.surface || theme.colors.surface,
              color: colors.text || theme.colors.text,
              display: 'block',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              ...itemStyle,
            }}
          >
            {replaceTags(item, resume)}
          </span>
        );
      })}
    </div>
  );
};

const ExperienceBlock: BlockRenderer = ({ block, resume }) => {
  const content = block.content as { role?: string; company?: string; startDate?: string; endDate?: string; bullets?: string[] };
  const theme = getThemeById(resume.themeId);
  const typography = getTypography(resume);
  const colors = getColors(resume);
  const design = getDesign(resume);

  const basePath = getEditPath(block);
  const lastDotIdx = basePath.lastIndexOf('.');
  const prefix = lastDotIdx > 0 ? basePath.substring(0, lastDotIdx) : basePath;

  const rolePath = basePath;
  const companyPath = `${prefix}.company`;
  const bulletBasePath = `${prefix}.bullets`;
  const datePath = `${prefix}.date`;

  const roleStyle = getStyleOverrideForPath(resume, rolePath);
  const companyStyle = getStyleOverrideForPath(resume, companyPath);
  const roleTag = getTagOverride(resume, rolePath);
  const companyTag = getTagOverride(resume, companyPath);
  const dateStyle = getStyleOverrideForPath(resume, datePath);

  // Entry layout settings
  const entryLayout = design?.entryLayout || 'default';
  const entryTitleSize = ENTRY_TITLE_SIZE_MAP[design?.entryTitleSize || 'm'] || '13px';
  const subtitleStyle = design?.entrySubtitleStyle || 'normal';
  const subtitlePlacement = design?.entrySubtitlePlacement || 'next-line';
  const listStyle = design?.listStyle || 'bullet';
  const descriptionIndent = design?.descriptionIndent || false;

  const subtitleFontWeight = subtitleStyle === 'bold' ? '700' : subtitleStyle === 'italic' ? '600' : '500';
  const subtitleFontStyle = subtitleStyle === 'italic' ? 'italic' : 'normal';

  // List bullet character
  const bulletChar = listStyle === 'hyphen' ? '\u2013 ' : listStyle === 'none' ? '' : '\u2022 ';

  // Determine the work order
  const workOrder = design?.workOrder || 'title-employer';
  const showRoleFirst = workOrder === 'title-employer';

  if (entryLayout === 'side-date') {
    return (
      <article style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', fontSize: `${typography.body}px` }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {showRoleFirst ? (
            <>
              {applyTag('div', roleTag, {
                'data-edit-path': rolePath || undefined,
                'data-style-path': rolePath || undefined,
                style: { fontWeight: '600', fontSize: entryTitleSize, color: colors.text || theme.colors.text, ...roleStyle },
              }, replaceTags(content.role || '', resume))}
              {content.company && applyTag('div', companyTag, {
                'data-edit-path': companyPath || undefined,
                'data-style-path': companyPath || undefined,
                style: { fontWeight: subtitleFontWeight, fontStyle: subtitleFontStyle, fontSize: `${typography.small}px`, color: colors.textMuted || theme.colors.textMuted, ...companyStyle },
              }, replaceTags(content.company, resume))}
            </>
          ) : (
            <>
              {content.company && applyTag('div', companyTag, {
                'data-edit-path': companyPath || undefined,
                'data-style-path': companyPath || undefined,
                style: { fontWeight: '600', fontSize: entryTitleSize, color: colors.text || theme.colors.text, ...companyStyle },
              }, replaceTags(content.company, resume))}
              {applyTag('div', roleTag, {
                'data-edit-path': rolePath || undefined,
                'data-style-path': rolePath || undefined,
                style: { fontWeight: subtitleFontWeight, fontStyle: subtitleFontStyle, fontSize: `${typography.small}px`, color: colors.textMuted || theme.colors.textMuted, ...roleStyle },
              }, replaceTags(content.role || '', resume))}
            </>
          )}
          <ul style={{ listStyleType: 'none', paddingLeft: descriptionIndent ? '16px' : '0', margin: 0, marginTop: '4px' }}>
            {(content.bullets || []).map((bullet, idx) => {
              const bulletPath = `${bulletBasePath}.${idx}`;
              const bulletStyle = getStyleOverrideForPath(resume, bulletPath);
              return (
                <li key={`${idx}-${bullet}`} data-edit-path={bulletPath || undefined} data-style-path={bulletPath || undefined}
                  style={{ marginBottom: '2px', fontSize: `${typography.body}px`, color: colors.text || theme.colors.text, ...bulletStyle }}>
                  {bulletChar}{replaceTags(bullet, resume)}
                </li>
              );
            })}
          </ul>
        </div>
        <span style={{ fontSize: `${typography.small}px`, color: colors.textMuted || theme.colors.textMuted, whiteSpace: 'nowrap', flexShrink: 0, paddingTop: '2px', ...dateStyle }}>
          {content.startDate} - {content.endDate}
        </span>
      </article>
    );
  }

  if (entryLayout === 'compact') {
    return (
      <article style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: `${typography.body}px` }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', flexWrap: 'wrap' }}>
          {applyTag('span', roleTag, {
            'data-edit-path': rolePath || undefined,
            'data-style-path': rolePath || undefined,
            style: { fontWeight: '600', fontSize: entryTitleSize, color: colors.text || theme.colors.text, ...roleStyle },
          }, replaceTags(content.role || '', resume))}
          {content.company && (
            <span style={{ color: colors.textMuted || theme.colors.textMuted, fontSize: `${typography.small}px` }}>
              {applyTag('span', companyTag, {
                'data-edit-path': companyPath || undefined,
                'data-style-path': companyPath || undefined,
                style: { fontWeight: subtitleFontWeight, fontStyle: subtitleFontStyle, ...companyStyle },
              }, replaceTags(content.company, resume))}
            </span>
          )}
          <span style={{ fontSize: `${typography.small}px`, color: colors.textMuted || theme.colors.textMuted, marginLeft: 'auto', ...dateStyle }}>
            {content.startDate} - {content.endDate}
          </span>
        </div>
        {(content.bullets || []).length > 0 && (
          <p style={{ fontSize: `${typography.small}px`, color: colors.text || theme.colors.text, margin: 0, lineHeight: 1.5 }}>
            {content.bullets?.map((b, i) => replaceTags(b, resume)).join(' \u00B7 ')}
          </p>
        )}
      </article>
    );
  }

  if (entryLayout === 'split') {
    return (
      <article style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: `${typography.body}px` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          {applyTag('span', roleTag, {
            'data-edit-path': rolePath || undefined,
            'data-style-path': rolePath || undefined,
            style: { fontWeight: '600', fontSize: entryTitleSize, color: colors.text || theme.colors.text, ...roleStyle },
          }, replaceTags(content.role || '', resume))}
          <span style={{ fontSize: `${typography.small}px`, color: colors.textMuted || theme.colors.textMuted, whiteSpace: 'nowrap', ...dateStyle }}>
            {content.startDate} - {content.endDate}
          </span>
        </div>
        {content.company && applyTag('div', companyTag, {
          'data-edit-path': companyPath || undefined,
          'data-style-path': companyPath || undefined,
          style: { fontWeight: subtitleFontWeight, fontStyle: subtitleFontStyle, fontSize: `${typography.small}px`, color: colors.textMuted || theme.colors.textMuted, ...companyStyle },
        }, replaceTags(content.company, resume))}
        <ul style={{ listStyleType: 'none', paddingLeft: descriptionIndent ? '16px' : '0', margin: 0 }}>
          {(content.bullets || []).map((bullet, idx) => {
            const bulletPath = `${bulletBasePath}.${idx}`;
            const bulletStyle = getStyleOverrideForPath(resume, bulletPath);
            return (
              <li key={`${idx}-${bullet}`} data-edit-path={bulletPath || undefined} data-style-path={bulletPath || undefined}
                style={{ marginBottom: '2px', fontSize: `${typography.body}px`, color: colors.text || theme.colors.text, ...bulletStyle }}>
                {bulletChar}{replaceTags(bullet, resume)}
              </li>
            );
          })}
        </ul>
      </article>
    );
  }

  // Default layout
  return (
    <article style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
        {showRoleFirst ? (
          <>
            {applyTag('span', roleTag, {
              'data-edit-path': rolePath || undefined,
              'data-style-path': rolePath || undefined,
              style: { fontWeight: '600', fontSize: entryTitleSize, color: colors.text || theme.colors.text, display: 'inline', ...roleStyle },
            }, replaceTags(content.role || '', resume))}
            {content.company ? (
              <span data-edit-path={companyPath || undefined} data-style-path={companyPath || undefined}
                style={{ fontWeight: subtitleFontWeight, fontStyle: subtitleFontStyle, fontSize: `${typography.small}px`, color: colors.textMuted || theme.colors.textMuted, display: 'inline', ...companyStyle }}>
                {`\u2022 ${replaceTags(content.company, resume)}`}
              </span>
            ) : ''}
          </>
        ) : (
          <>
            {content.company ? (
              <span data-edit-path={companyPath || undefined} data-style-path={companyPath || undefined}
                style={{ fontWeight: '600', fontSize: entryTitleSize, color: colors.text || theme.colors.text, display: 'inline', ...companyStyle }}>
                {replaceTags(content.company, resume)}
              </span>
            ) : ''}
            {applyTag('span', roleTag, {
              'data-edit-path': rolePath || undefined,
              'data-style-path': rolePath || undefined,
              style: { fontWeight: subtitleFontWeight, fontStyle: subtitleFontStyle, fontSize: `${typography.small}px`, color: colors.textMuted || theme.colors.textMuted, display: 'inline', ...roleStyle },
            }, replaceTags(content.role || '', resume))}
          </>
        )}
        <span data-edit-path={datePath || undefined} data-style-path={datePath || undefined}
          style={{ fontSize: `${typography.small}px`, color: colors.textMuted || theme.colors.textMuted, whiteSpace: 'nowrap', display: 'inline', ...dateStyle }}>
          {content.startDate} - {content.endDate}
        </span>
      </div>
      <ul style={{ listStyleType: 'none', paddingLeft: descriptionIndent ? '16px' : '0', margin: 0, fontSize: `${typography.body}px` }}>
        {(content.bullets || []).map((bullet, idx) => {
          const bulletPath = `${bulletBasePath}.${idx}`;
          const bulletStyle = getStyleOverrideForPath(resume, bulletPath);
          return (
            <li key={`${idx}-${bullet}`} data-edit-path={bulletPath || undefined} data-style-path={bulletPath || undefined}
              style={{ marginBottom: '2px', ...bulletStyle }}>
              {bulletChar}{replaceTags(bullet, resume)}
            </li>
          );
        })}
      </ul>
    </article>
  );
};

const EducationBlock: BlockRenderer = ({ block, resume }) => {
  const content = block.content as { school?: string; degree?: string; year?: string };
  const theme = getThemeById(resume.themeId);
  const typography = getTypography(resume);
  const colors = getColors(resume);
  const design = getDesign(resume);

  const editPath = getEditPath(block);
  const blockContent = block.content as any;
  const editPathSchool = blockContent._editPathSecondary || (editPath ? editPath.replace(/\.degree$/, '.school') : '');
  const overrideDegree = getStyleOverrideForPath(resume, editPath);
  const overrideSchool = getStyleOverrideForPath(resume, editPathSchool);
  const degreeTag = getTagOverride(resume, editPath);
  const schoolTag = getTagOverride(resume, editPathSchool);

  const DegreeTag = (degreeTag || 'div') as keyof JSX.IntrinsicElements;
  const SchoolTag = (schoolTag || 'div') as keyof JSX.IntrinsicElements;

  const educationOrder = design?.educationOrder || 'degree-school';
  const showDegreeFirst = educationOrder === 'degree-school';

  const entryTitleSize = ENTRY_TITLE_SIZE_MAP[design?.entryTitleSize || 'm'] || '13px';

  return (
    <article style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: `${typography.body}px` }}>
      {showDegreeFirst ? (
        <>
          <DegreeTag
            data-edit-path={editPath || undefined}
            data-style-path={editPath || undefined}
            style={{ fontWeight: '600', fontSize: entryTitleSize, color: colors.text || theme.colors.text, ...overrideDegree }}
          >
            {replaceTags(content.degree || '', resume)}
          </DegreeTag>
          <SchoolTag
            data-edit-path={editPathSchool || undefined}
            data-style-path={editPathSchool || undefined}
            style={{ color: colors.textMuted || theme.colors.textMuted, ...overrideSchool }}
          >
            {replaceTags(content.school || '', resume)} {content.year ? `(${content.year})` : ''}
          </SchoolTag>
        </>
      ) : (
        <>
          <SchoolTag
            data-edit-path={editPathSchool || undefined}
            data-style-path={editPathSchool || undefined}
            style={{ fontWeight: '600', fontSize: entryTitleSize, color: colors.text || theme.colors.text, ...overrideSchool }}
          >
            {replaceTags(content.school || '', resume)}
          </SchoolTag>
          <DegreeTag
            data-edit-path={editPath || undefined}
            data-style-path={editPath || undefined}
            style={{ color: colors.textMuted || theme.colors.textMuted, ...overrideDegree }}
          >
            {replaceTags(content.degree || '', resume)} {content.year ? `(${content.year})` : ''}
          </DegreeTag>
        </>
      )}
    </article>
  );
};

const SocialBlock: BlockRenderer = ({ block, resume }) => {
  const content = block.content as { items?: Array<{ label: string; url: string }> };
  const theme = getThemeById(resume.themeId);
  const typography = getTypography(resume);
  const colors = getColors(resume);
  const borders = getBorders(resume);
  const radius = getRadius(resume);
  const design = getDesign(resume);

  const editPath = getEditPath(block);
  const overrideStyle = getStyleOverrideForPath(resume, editPath);

  const linkUnderline = design?.linkUnderline !== false;
  const linkBlueColor = design?.linkBlueColor || false;
  const linkIcon = design?.linkIcon !== false;

  const linkColor = linkBlueColor ? '#2563eb' : (colors.primary || theme.colors.primary);

  // Links style options (inline, list, grid)
  const linksStyle = design?.linksStyle || 'inline';
  const linksGap = design?.linksGap ?? 4;
  const linksColumns = design?.linksColumns ?? 2;
  const linksDirection = design?.linksDirection || 'row';
  const linksWrap = design?.linksWrap || 'wrap';
  const linksAlign = design?.linksAlign || 'start';
  const linksJustify = design?.linksJustify || 'start';

  const justifyContentMap: Record<string, string> = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    between: 'space-between',
  };

  const linkBaseStyle: React.CSSProperties = {
    textDecoration: linkUnderline ? 'underline' : 'none',
    color: linkColor,
    fontSize: `${typography.small}px`,
  };

  const items = content.items || [];

  // ─── INLINE STYLE ───────────────────────────────────────────────────────
  if (linksStyle === 'inline') {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: linksWrap,
        alignItems: linksAlign,
        justifyContent: justifyContentMap[linksJustify] || 'flex-start',
        gap: `${linksGap}px`,
        fontSize: `${typography.small}px`,
        ...overrideStyle,
      }}>
        {items.map((item) => (
          <a
            style={linkBaseStyle}
            href={replaceTags(item.url, resume)}
            key={`${item.label}-${item.url}`}
          >
            {linkIcon && '\u{1F517} '}{replaceTags(item.label, resume)}
          </a>
        ))}
      </div>
    );
  }

  // ─── LIST STYLE ─────────────────────────────────────────────────────────
  if (linksStyle === 'list') {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: `${linksGap}px`,
        fontSize: `${typography.small}px`,
        ...overrideStyle,
      }}>
        {items.map((item, idx) => {
          const itemPath = `${editPath}.${idx}`;
          const itemStyle = getStyleOverrideForPath(resume, itemPath);
          return (
            <div
              key={`${item.label}-${item.url}`}
              data-edit-path={itemPath || undefined}
              data-style-path={itemPath || undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                ...itemStyle,
              }}
            >
              <span style={{
                width: '5px',
                height: '5px',
                borderRadius: '50%',
                backgroundColor: linkColor,
                flexShrink: 0,
              }} />
              <a
                style={{ ...linkBaseStyle, fontSize: `${typography.small}px` }}
                href={replaceTags(item.url, resume)}
              >
                {linkIcon && '\u{1F517} '}{replaceTags(item.label, resume)}
              </a>
              {item.url && (
                <span style={{
                  fontSize: `${typography.small - 1}px`,
                  color: colors.textMuted || theme.colors.textMuted,
                  opacity: 0.6,
                }}>
                  — {replaceTags(item.url, resume)}
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // ─── GRID STYLE ─────────────────────────────────────────────────────────
  if (linksStyle === 'grid') {
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${linksColumns}, 1fr)`,
        gap: `${linksGap}px`,
        fontSize: `${typography.small}px`,
        ...overrideStyle,
      }}>
        {items.map((item, idx) => {
          const itemPath = `${editPath}.${idx}`;
          const itemStyle = getStyleOverrideForPath(resume, itemPath);
          return (
            <a
              key={`${item.label}-${item.url}`}
              data-edit-path={itemPath || undefined}
              data-style-path={itemPath || undefined}
              style={{
                ...linkBaseStyle,
                borderRadius: `${radius.sm || 4}px`,
                border: `${borders.width || 1}px ${borders.style || 'solid'} ${colors.border || theme.colors.border}`,
                padding: '3px 6px',
                backgroundColor: colors.surface || theme.colors.surface,
                display: 'block',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                fontSize: `${typography.small}px`,
                ...itemStyle,
              }}
              href={replaceTags(item.url, resume)}
            >
              {linkIcon && '\u{1F517} '}{replaceTags(item.label, resume)}
            </a>
          );
        })}
      </div>
    );
  }

  // ─── DEFAULT (fallback to inline) ───────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: `${typography.small}px`, ...overrideStyle }}>
      {items.map((item) => (
        <a
          style={linkBaseStyle}
          href={replaceTags(item.url, resume)}
          key={`${item.label}-${item.url}`}
        >
          {linkIcon && '\u{1F517} '}{replaceTags(item.label, resume)}
        </a>
      ))}
    </div>
  );
};

const ImageBlock: BlockRenderer = ({ block, resume }) => {
  const content = block.content as { src?: string; alt?: string };
  const design = getDesign(resume);
  if (!content.src) return null;

  const isProfileImage = !!(content.alt || '').toLowerCase().includes('profile') || (content as any)._editPath?.includes('image');

  if (!isProfileImage) {
    return (
      <div data-edit-path={(content as any)._editPath || undefined} data-style-path={(content as any)._editPath || undefined}
        style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '8px' }}>
        <Image src={content.src} alt={content.alt || 'Resume image'} width={96} height={96}
          style={{ height: '96px', width: '96px', borderRadius: '4px', objectFit: 'cover' }} unoptimized />
      </div>
    );
  }

  const photoSize = PHOTO_SIZE_MAP[design?.photoSize || 'm'] || 90;
  const photoShape = design?.photoShape || 'circle';
  const photoGrayscale = design?.photoGrayscale || false;
  const photoShow = design?.photoShow !== false;

  if (!photoShow) return null;

  const borderRadiusMap: Record<string, string> = {
    circle: '50%',
    rounded: '12px',
    square: '4px',
    hexagon: '4px',
  };

  const photoPosition = design?.photoPosition || 'center';
  const justifyContentMap: Record<string, string> = {
    left: 'flex-start',
    center: 'center',
    right: 'flex-end',
  };

  return (
    <div
      data-edit-path={(content as any)._editPath || undefined}
      data-style-path={(content as any)._editPath || undefined}
      style={{
        display: 'flex',
        justifyContent: justifyContentMap[photoPosition] || 'center',
        marginBottom: '8px',
      }}
    >
      <Image
        src={content.src}
        alt={content.alt || 'Profile'}
        width={photoSize}
        height={photoSize}
        style={{
          height: `${photoSize}px`,
          width: `${photoSize}px`,
          borderRadius: borderRadiusMap[photoShape] || '50%',
          objectFit: 'cover',
          border: '2px solid rgba(255,255,255,0.8)',
          filter: photoGrayscale ? 'grayscale(100%)' : undefined,
        }}
        unoptimized
      />
    </div>
  );
};

const CustomBlock: BlockRenderer = ({ block }) => <pre style={{ overflowX: 'auto', fontSize: '9px' }}>{JSON.stringify(block.content, null, 2)}</pre>;

const blockMap: Record<string, BlockRenderer> = {
  heading: HeadingBlock,
  text: TextBlock,
  skills: SkillBlock,
  experience: ExperienceBlock,
  education: EducationBlock,
  social: SocialBlock,
  image: ImageBlock,
  custom: CustomBlock,
};

export interface DynamicBlockRendererProps {
  block: ResumeBlock;
  resume: ResumeData;
  sectionType?: string;
}

const DynamicBlockRenderer: React.FC<DynamicBlockRendererProps> = ({ block, resume, sectionType }) => {
  const theme = getThemeById(resume.themeId);
  const Component = blockMap[block.type] || CustomBlock;

  const baseStyle = getBlockStyle(block, theme);

  return (
    <div
      data-resume-block={block.id}
      style={baseStyle}
    >
      <Component block={block} resume={resume} sectionType={sectionType} />
    </div>
  );
};

export default React.memo(DynamicBlockRenderer);
export { DynamicBlockRenderer, blockMap };