// ============================================================
// STYLE ENGINE - Dynamic Style Resolution & Generation
// ============================================================

import type {
  GlobalStyle,
  SectionStyle,
  BlockStyle,
  TypographyStyle,
  SpacingStyle,
  BorderStyle,
  BackgroundStyle,
  ThemeDefinition,
  ResumeBlock,
  ResumeSection,
  DeviceMode,
} from '@/types/resume.types';
import { themeRegistry } from '@/core/theme-engine/ThemeEngine';

// ─── Deep Merge ───
function deepMerge<T extends Record<string, any>>(target: T, ...sources: Partial<T>[]): T {
  const result = { ...target };
  for (const source of sources) {
    if (!source) continue;
    for (const key of Object.keys(source)) {
      const val = source[key];
      if (val !== undefined && val !== null) {
        if (typeof val === 'object' && !Array.isArray(val) && typeof result[key] === 'object' && result[key] !== null) {
          (result as any)[key] = deepMerge(result[key] as any, val as any);
        } else {
          (result as any)[key] = val;
        }
      }
    }
  }
  return result;
}

// ─── Typography to CSS ───
function typographyToCSS(typography?: TypographyStyle): React.CSSProperties {
  if (!typography) return {};
  const style: React.CSSProperties = {};
  if (typography.fontFamily) style.fontFamily = typography.fontFamily;
  if (typography.fontSize) style.fontSize = typography.fontSize;
  if (typography.fontWeight) style.fontWeight = typography.fontWeight;
  if (typography.lineHeight) style.lineHeight = typography.lineHeight;
  if (typography.letterSpacing !== undefined) {
    style.letterSpacing = typeof typography.letterSpacing === 'number'
      ? `${typography.letterSpacing}em`
      : typography.letterSpacing;
  }
  if (typography.textAlign) style.textAlign = typography.textAlign;
  if (typography.textTransform) style.textTransform = typography.textTransform;
  if (typography.textDecoration) style.textDecoration = typography.textDecoration;
  if (typography.fontStyle) style.fontStyle = typography.fontStyle;
  return style;
}

// ─── Spacing to CSS ───
function spacingToCSS(spacing?: SpacingStyle): React.CSSProperties {
  if (!spacing) return {};
  const style: React.CSSProperties = {};
  if (spacing.padding) style.padding = spacing.padding;
  if (spacing.margin) style.margin = spacing.margin;
  if (spacing.paddingTop !== undefined) style.paddingTop = spacing.paddingTop;
  if (spacing.paddingRight !== undefined) style.paddingRight = spacing.paddingRight;
  if (spacing.paddingBottom !== undefined) style.paddingBottom = spacing.paddingBottom;
  if (spacing.paddingLeft !== undefined) style.paddingLeft = spacing.paddingLeft;
  if (spacing.marginTop !== undefined) style.marginTop = spacing.marginTop;
  if (spacing.marginRight !== undefined) style.marginRight = spacing.marginRight;
  if (spacing.marginBottom !== undefined) style.marginBottom = spacing.marginBottom;
  if (spacing.marginLeft !== undefined) style.marginLeft = spacing.marginLeft;
  if (spacing.gap !== undefined) style.gap = spacing.gap;
  return style;
}

// ─── Border to CSS ───
function borderToCSS(border?: BorderStyle): React.CSSProperties {
  if (!border) return {};
  const style: React.CSSProperties = {};
  if (border.borderWidth !== undefined) style.borderWidth = border.borderWidth;
  if (border.borderColor) style.borderColor = border.borderColor;
  if (border.borderStyle) style.borderStyle = border.borderStyle;
  if (border.borderRadius !== undefined) style.borderRadius = border.borderRadius;
  if (border.borderTop) style.borderTop = border.borderTop;
  if (border.borderBottom) style.borderBottom = border.borderBottom;
  if (border.borderLeft) style.borderLeft = border.borderLeft;
  if (border.borderRight) style.borderRight = border.borderRight;
  return style;
}

// ─── Background to CSS ───
function backgroundToCSS(background?: BackgroundStyle): React.CSSProperties {
  if (!background) return {};
  const style: React.CSSProperties = {};
  if (background.backgroundColor) style.backgroundColor = background.backgroundColor;
  if (background.backgroundImage) style.backgroundImage = background.backgroundImage;
  if (background.backgroundSize) style.backgroundSize = background.backgroundSize;
  if (background.backgroundPosition) style.backgroundPosition = background.backgroundPosition;
  if (background.backgroundRepeat) style.backgroundRepeat = background.backgroundRepeat;
  return style;
}

// ─── Section Style to CSS ───
function sectionStyleToCSS(sectionStyle?: SectionStyle): React.CSSProperties {
  if (!sectionStyle) return {};
  const style: React.CSSProperties = {
    ...typographyToCSS(sectionStyle),
    ...spacingToCSS(sectionStyle),
    ...borderToCSS(sectionStyle),
    ...backgroundToCSS(sectionStyle),
  };
  const s = sectionStyle;
  if (s.width !== undefined) style.width = typeof s.width === 'number' ? `${s.width}px` : s.width;
  if (s.height !== undefined) style.height = typeof s.height === 'number' ? `${s.height}px` : s.height;
  if (s.minHeight !== undefined) style.minHeight = typeof s.minHeight === 'number' ? `${s.minHeight}px` : s.minHeight;
  if (s.opacity !== undefined) style.opacity = s.opacity;
  if (s.display) style.display = s.display;
  if (s.flexDirection) style.flexDirection = s.flexDirection;
  if (s.alignItems) style.alignItems = s.alignItems;
  if (s.justifyContent) style.justifyContent = s.justifyContent;
  if (s.flexWrap) style.flexWrap = s.flexWrap;
  if (s.columnGap !== undefined) style.columnGap = s.columnGap;
  if (s.rowGap !== undefined) style.rowGap = s.rowGap;
  if (s.columns !== undefined) style.columns = s.columns;
  if (s.columnRule) style.columnRule = s.columnRule;
  if (s.visibility) style.visibility = s.visibility === 'hidden' ? 'hidden' : 'visible';
  return style;
}

// ─── Block Style to CSS ───
function blockStyleToCSS(blockStyle?: BlockStyle): React.CSSProperties {
  if (!blockStyle) return {};
  const style: React.CSSProperties = {
    ...typographyToCSS(blockStyle),
    ...spacingToCSS(blockStyle),
    ...borderToCSS(blockStyle),
    ...backgroundToCSS(blockStyle),
  };
  const s = blockStyle;
  if (s.width !== undefined) style.width = typeof s.width === 'number' ? `${s.width}px` : s.width;
  if (s.height !== undefined) style.height = typeof s.height === 'number' ? `${s.height}px` : s.height;
  if (s.minHeight !== undefined) style.minHeight = typeof s.minHeight === 'number' ? `${s.minHeight}px` : s.minHeight;
  if (s.opacity !== undefined) style.opacity = s.opacity;
  if (s.display) style.display = s.display;
  if (s.position) style.position = s.position;
  if (s.top !== undefined) style.top = typeof s.top === 'number' ? `${s.top}px` : s.top;
  if (s.right !== undefined) style.right = typeof s.right === 'number' ? `${s.right}px` : s.right;
  if (s.bottom !== undefined) style.bottom = typeof s.bottom === 'number' ? `${s.bottom}px` : s.bottom;
  if (s.left !== undefined) style.left = typeof s.left === 'number' ? `${s.left}px` : s.left;
  if (s.zIndex !== undefined) style.zIndex = s.zIndex;
  if (s.overflow) style.overflow = s.overflow;
  if (s.boxShadow) style.boxShadow = s.boxShadow;
  if (s.transform) style.transform = s.transform;
  if (s.transition) style.transition = s.transition;
  return style;
}

// ─── Generate inline style for any style object ───
function generateInlineStyle(styleObj: Record<string, any>): React.CSSProperties {
  const result: React.CSSProperties = {};
  for (const [key, value] of Object.entries(styleObj)) {
    if (value !== undefined && value !== null) {
      (result as any)[key] = value;
    }
  }
  return result;
}

// ─── Global Style to CSS ───
function globalStyleToCSS(globalStyle: GlobalStyle): React.CSSProperties {
  const style: React.CSSProperties = {
    fontFamily: globalStyle.fontFamily,
    fontSize: globalStyle.fontSize,
    fontWeight: globalStyle.fontWeight,
    lineHeight: globalStyle.lineHeight,
    letterSpacing: globalStyle.letterSpacing,
    color: globalStyle.color,
    backgroundColor: globalStyle.backgroundColor,
    width: globalStyle.pageWidth,
    minHeight: globalStyle.pageHeight,
    padding: globalStyle.pagePadding,
    borderRadius: globalStyle.borderRadius,
    boxSizing: 'border-box',
  };
  if (globalStyle.shadow && globalStyle.shadow !== 'none') {
    style.boxShadow = globalStyle.shadow;
  }
  return style;
}

// ─── Build full section style ───
function buildSectionStyle(
  section: ResumeSection,
  theme?: ThemeDefinition
): React.CSSProperties {
  const styles: React.CSSProperties[] = [];

  // Apply theme context
  if (theme) {
    styles.push({
      fontFamily: theme.fonts.body,
      color: theme.colors.text,
    });
  }

  if (section.typography) styles.push(typographyToCSS(section.typography));
  if (section.spacing) styles.push(spacingToCSS(section.spacing));
  if (section.border) styles.push(borderToCSS(section.border));
  if (section.background) styles.push(backgroundToCSS(section.background));
  if (section.styleProps) styles.push(sectionStyleToCSS(section.styleProps));

  // Apply layout props
  if (section.layoutProps) {
    const lp = section.layoutProps;
    const layoutStyle: React.CSSProperties = {};
    if (lp.display) layoutStyle.display = lp.display;
    if (lp.width) layoutStyle.width = typeof lp.width === 'number' ? `${lp.width}%` : lp.width;
    if (lp.minHeight) layoutStyle.minHeight = typeof lp.minHeight === 'number' ? `${lp.minHeight}px` : lp.minHeight;
    if (lp.flex) layoutStyle.flex = lp.flex;
    styles.push(layoutStyle);
  }

  // Visibility
  if (!section.visible) {
    styles.push({ display: 'none' });
  }

  return Object.assign({}, ...styles);
}

// ─── Build full block style ───
function buildBlockStyle(
  block: ResumeBlock,
  theme?: ThemeDefinition
): React.CSSProperties {
  const styles: React.CSSProperties[] = [];

  if (theme) {
    styles.push({
      fontFamily: theme.fonts.body,
      color: theme.colors.text,
    });
  }

  if (block.typography) styles.push(typographyToCSS(block.typography));
  if (block.spacing) styles.push(spacingToCSS(block.spacing));
  if (block.border) styles.push(borderToCSS(block.border));
  if (block.background) styles.push(backgroundToCSS(block.background));
  if (block.styleProps) styles.push(blockStyleToCSS(block.styleProps));

  // Visibility
  if (block.visibility === 'hidden') {
    styles.push({ display: 'none' });
  }

  return Object.assign({}, ...styles);
}

// ─── Build global style ───
function buildGlobalStyle(
  globalStyle: GlobalStyle,
  themeId?: string
): { container: React.CSSProperties; page: React.CSSProperties } {
  const theme = themeId ? themeRegistry.get(themeId as any) : undefined;

  const container: React.CSSProperties = {
    fontFamily: globalStyle.fontFamily || theme?.fonts.body,
    color: globalStyle.color || theme?.colors.text,
    backgroundColor: globalStyle.backgroundColor || theme?.colors.background,
    fontSize: globalStyle.fontSize,
    lineHeight: globalStyle.lineHeight,
    width: '100%',
    minHeight: '100%',
  };

  const page: React.CSSProperties = {
    width: globalStyle.pageWidth || '210mm',
    minHeight: globalStyle.pageHeight || '297mm',
    padding: globalStyle.pagePadding || '20mm',
    backgroundColor: globalStyle.backgroundColor || theme?.colors.background || '#ffffff',
    borderRadius: globalStyle.borderRadius,
    boxShadow: globalStyle.shadow && globalStyle.shadow !== 'none' ? globalStyle.shadow : undefined,
    boxSizing: 'border-box',
    margin: '0 auto',
    position: 'relative',
    overflow: 'hidden',
  };

  return { container, page };
}

// ─── Responsive style resolution ───
function resolveResponsiveStyle(
  baseStyle: React.CSSProperties,
  device: DeviceMode,
  responsiveStyles?: {
    tablet?: Partial<React.CSSProperties>;
    mobile?: Partial<React.CSSProperties>;
  }
): React.CSSProperties {
  if (!responsiveStyles) return baseStyle;

  let modifications: Partial<React.CSSProperties> = {};

  if (device === 'tablet' && responsiveStyles.tablet) {
    modifications = responsiveStyles.tablet;
  } else if (device === 'mobile' && responsiveStyles.mobile) {
    modifications = responsiveStyles.mobile;
  }

  if (Object.keys(modifications).length === 0) return baseStyle;

  return { ...baseStyle, ...modifications };
}

// ─── Style Resolver singleton ───
class StyleResolver {
  buildSectionStyle(
    section: ResumeSection,
    theme?: ThemeDefinition
  ): React.CSSProperties {
    return buildSectionStyle(section, theme);
  }

  buildBlockStyle(
    block: ResumeBlock,
    theme?: ThemeDefinition
  ): React.CSSProperties {
    return buildBlockStyle(block, theme);
  }

  buildGlobalStyle(
    globalStyle: GlobalStyle,
    themeId?: string
  ): { container: React.CSSProperties; page: React.CSSProperties } {
    return buildGlobalStyle(globalStyle, themeId);
  }

  resolveResponsiveStyle(
    baseStyle: React.CSSProperties,
    device: DeviceMode,
    responsiveStyles?: {
      tablet?: Partial<React.CSSProperties>;
      mobile?: Partial<React.CSSProperties>;
    }
  ): React.CSSProperties {
    return resolveResponsiveStyle(baseStyle, device, responsiveStyles);
  }

  deepMerge<T extends Record<string, any>>(target: T, ...sources: Partial<T>[]): T {
    return deepMerge(target, ...sources);
  }
}

export const styleResolver = new StyleResolver();
export {
  deepMerge,
  typographyToCSS,
  spacingToCSS,
  borderToCSS,
  backgroundToCSS,
  sectionStyleToCSS,
  blockStyleToCSS,
  generateInlineStyle,
  globalStyleToCSS,
  buildSectionStyle,
  buildBlockStyle,
  buildGlobalStyle,
  resolveResponsiveStyle,
  StyleResolver,
};