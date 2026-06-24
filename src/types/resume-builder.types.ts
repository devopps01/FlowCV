import type { CSSProperties } from 'react';

export type UUID = string;
export type DeviceMode = 'desktop' | 'tablet' | 'mobile';
export type ResumeVisibility = 'visible' | 'hidden';

export type LayoutId =
  | 'single'
  | 'double'
  | 'sidebar'
  | 'modern'
  | 'creative'
  | 'ats'
  | 'compact';

export type ThemeId = 'default' | 'midnight' | 'executive' | 'creative' | 'ats';
export type TemplateId = 'modern-pro' | 'classic-pro' | 'creative-pro' | 'ats-pro';

export type ResumeBlockType =
  | 'heading'
  | 'text'
  | 'skills'
  | 'experience'
  | 'education'
  | 'social'
  | 'image'
  | 'custom';

export type ResumeSectionType =
  | 'header'
  | 'summary'
  | 'experience'
  | 'education'
  | 'skills'
  | 'projects'
  | 'languages'
  | 'certifications'
  | 'social'
  | 'custom';

export interface TypographyScale {
  h1: number;
  h2: number;
  h3: number;
  body: number;
  small: number;
  lineHeight: number;
  letterSpacing: number;
}

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    textMuted: string;
    background: string;
    surface: string;
    border: string;
  };
  fonts: {
    body: string;
    heading: string;
    mono?: string;
  };
  typography: TypographyScale;
  spacing: {
    sectionGap: number;
    blockGap: number;
    pagePaddingX: number;
    pagePaddingY: number;
  };
  radius: {
    sm: number;
    md: number;
    lg: number;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
  borders: {
    width: number;
    style: CSSProperties['borderStyle'];
  };
}

export interface GlobalStyle {
  fontSize: number;
  lineHeight: number;
  fontFamily: string;
  headingFontFamily: string;
  page: {
    size: 'A4' | 'Letter';
    widthPx: number;
    minHeightPx: number;
    marginX: number;
    marginY: number;
  };
  typography: {
    scale: TypographyScale;
    paragraphSpacing: number;
  } & Record<string, any>;
  colors: {
    text: string;
    background: string;
  } & Record<string, any>;
  fonts?: {
    body: string;
    heading: string;
  };
  spacing?: {
    sectionGap: number;
    blockGap: number;
    pagePaddingX: number;
    pagePaddingY: number;
  };
  customCSSVars?: Record<string, string | number>;
}

export interface SectionStyle {
  visibility?: ResumeVisibility;
  backgroundColor?: string;
  color?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  padding?: number;
  marginBottom?: number;
  columnSpan?: 1 | 2;
  typography?: Partial<TypographyScale>;
  className?: string;
  customCss?: CSSProperties;
}

export interface BlockStyle {
  visibility?: ResumeVisibility;
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  padding?: number;
  marginBottom?: number;
  textAlign?: CSSProperties['textAlign'];
  fontSize?: number;
  fontWeight?: CSSProperties['fontWeight'];
  className?: string;
  customCss?: CSSProperties;
}

export interface ResumeBlock<T = Record<string, unknown>> {
  id: UUID;
  type: ResumeBlockType;
  content: T;
  visible: boolean;
  order: number;
  styleProps?: BlockStyle;
  props?: Record<string, unknown>;
  tags?: string[];
}

export interface ResumeSection {
  id: UUID;
  type: ResumeSectionType;
  title: string;
  visible: boolean;
  order: number;
  styleProps?: SectionStyle;
  layoutProps?: Record<string, unknown>;
  blocks: ResumeBlock[];
}

export interface ResumeMetadata {
  title: string;
  role?: string;
  locale?: string;
  version: number;
  atsFriendly: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ResumeData {
  id: UUID;
  templateId: TemplateId;
  layoutId: LayoutId;
  themeId: ThemeId;
  sections: ResumeSection[];
  globalStyle: GlobalStyle;
  metadata: ResumeMetadata;
}

export interface LayoutContext {
  resume: ResumeData;
  visibleSections: ResumeSection[];
  device: DeviceMode;
}

export interface LayoutDefinition {
  id: LayoutId;
  name: string;
  description: string;
  columns: number;
  supportsAts: boolean;
  sectionBuckets: {
    primary: ResumeSectionType[];
    secondary?: ResumeSectionType[];
  };
}

export interface TemplateDefinition {
  id: TemplateId;
  name: string;
  description: string;
  layoutId: LayoutId;
  themeId: ThemeId;
  defaultSections: ResumeSection[];
  atsOptimized: boolean;
}

export interface HistorySnapshot {
  id: UUID;
  timestamp: number;
  reason: string;
  state: ResumeData;
}

export interface PaginationPage {
  id: UUID;
  pageNumber: number;
  sectionIds: UUID[];
}

export interface CollaborationPresence {
  userId: UUID;
  userName: string;
  color: string;
  cursorPath?: string;
  lastSeenAt: number;
}

export interface AIContext {
  enabled: boolean;
  suggestionQueue: Array<{
    id: UUID;
    sectionId?: UUID;
    blockId?: UUID;
    type: 'content' | 'style' | 'layout';
    payload: Record<string, unknown>;
  }>;
}

/** Layout component props — all layouts receive these */
export interface LayoutComponentProps {
  resume: ResumeData;
  sidebarPosition?: 'left' | 'right';
  sidebarWidth?: string;
  [key: string]: any;
}