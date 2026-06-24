// ============================================================
// CORE DATA MODEL - Resume Builder Enterprise Types
// ============================================================

// ─── Unique ID ───
export type EntityId = string;

// ─── Font Weight ───
export type FontWeight = '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';

// ─── Text Alignment ───
export type TextAlignment = 'left' | 'center' | 'right' | 'justify';

// ─── Visibility ───
export type Visibility = 'visible' | 'hidden' | 'print-only' | 'screen-only';

// ════════════════════════════════════════════════════════════
// GLOBAL STYLE
// ════════════════════════════════════════════════════════════
export interface GlobalStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: FontWeight;
  lineHeight: number;
  letterSpacing: number;
  color: string;
  backgroundColor: string;
  pageWidth: string;
  pageHeight: string;
  pagePadding: string;
  pageMargin: string;
  orientation: 'portrait' | 'landscape';
  borderRadius: number;
  borderColor: string;
  borderWidth: number;
  borderStyle: 'solid' | 'dashed' | 'dotted' | 'none';
  shadow: string;
  fontFamilyHeading: string;
  fontFamilyBody: string;
}

export const defaultGlobalStyle: GlobalStyle = {
  fontFamily: 'Inter, sans-serif',
  fontSize: 11,
  fontWeight: '400',
  lineHeight: 1.5,
  letterSpacing: 0,
  color: '#1a1a2e',
  backgroundColor: '#ffffff',
  pageWidth: '210mm',
  pageHeight: '297mm',
  pagePadding: '20mm',
  pageMargin: '0',
  orientation: 'portrait',
  borderRadius: 0,
  borderColor: '#e2e8f0',
  borderWidth: 0,
  borderStyle: 'none',
  shadow: 'none',
  fontFamilyHeading: 'Inter, sans-serif',
  fontFamilyBody: 'Inter, sans-serif',
};

// ════════════════════════════════════════════════════════════
// TYPOGRAPHY STYLE
// ════════════════════════════════════════════════════════════
export interface TypographyStyle {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: FontWeight;
  lineHeight?: number;
  letterSpacing?: number;
  textAlign?: TextAlignment;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  textDecoration?: 'none' | 'underline' | 'line-through';
  fontStyle?: 'normal' | 'italic';
}

// ════════════════════════════════════════════════════════════
// SPACING STYLE
// ════════════════════════════════════════════════════════════
export interface SpacingStyle {
  padding?: string;
  margin?: string;
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  marginTop?: number;
  marginRight?: number;
  marginBottom?: number;
  marginLeft?: number;
  gap?: number;
}

// ════════════════════════════════════════════════════════════
// BORDER STYLE
// ════════════════════════════════════════════════════════════
export interface BorderStyle {
  borderWidth?: number;
  borderColor?: string;
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none';
  borderRadius?: number;
  borderTop?: string;
  borderBottom?: string;
  borderLeft?: string;
  borderRight?: string;
}

// ════════════════════════════════════════════════════════════
// BACKGROUND STYLE
// ════════════════════════════════════════════════════════════
export interface BackgroundStyle {
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundSize?: 'cover' | 'contain' | 'auto';
  backgroundPosition?: string;
  backgroundRepeat?: 'repeat' | 'no-repeat' | 'repeat-x' | 'repeat-y';
}

// ════════════════════════════════════════════════════════════
// SECTION STYLE
// ════════════════════════════════════════════════════════════
export interface SectionStyle
  extends TypographyStyle,
    SpacingStyle,
    BorderStyle,
    BackgroundStyle {
  width?: string | number;
  height?: string | number;
  minHeight?: string | number;
  opacity?: number;
  visibility?: Visibility;
  display?: 'block' | 'flex' | 'grid' | 'none';
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  columnGap?: number;
  rowGap?: number;
  columns?: number;
  columnRule?: string;
}

// ════════════════════════════════════════════════════════════
// BLOCK STYLE
// ════════════════════════════════════════════════════════════
export interface BlockStyle
  extends TypographyStyle,
    SpacingStyle,
    BorderStyle,
    BackgroundStyle {
  width?: string | number;
  height?: string | number;
  minHeight?: string | number;
  opacity?: number;
  display?: 'block' | 'inline' | 'inline-block' | 'flex' | 'none';
  position?: 'static' | 'relative' | 'absolute';
  top?: string | number;
  right?: string | number;
  bottom?: string | number;
  left?: string | number;
  zIndex?: number;
  overflow?: 'visible' | 'hidden' | 'auto';
  boxShadow?: string;
  transform?: string;
  transition?: string;
}

// ════════════════════════════════════════════════════════════
// BLOCK TYPES
// ════════════════════════════════════════════════════════════
export type BlockType =
  | 'heading'
  | 'text'
  | 'paragraph'
  | 'rich-text'
  | 'experience'
  | 'education'
  | 'skills'
  | 'social'
  | 'contact'
  | 'image'
  | 'avatar'
  | 'badge'
  | 'divider'
  | 'list'
  | 'bullet-list'
  | 'ordered-list'
  | 'icon-list'
  | 'progress-bar'
  | 'rating'
  | 'tag-cloud'
  | 'date-range'
  | 'certification'
  | 'project'
  | 'publication'
  | 'language'
  | 'reference'
  | 'link'
  | 'button'
  | 'table'
  | 'chart'
  | 'timeline'
  | 'quote'
  | 'custom-html'
  | 'custom';

// ════════════════════════════════════════════════════════════
// SECTION TYPES
// ════════════════════════════════════════════════════════════
export type SectionType =
  | 'header'
  | 'summary'
  | 'experience'
  | 'education'
  | 'skills'
  | 'certifications'
  | 'projects'
  | 'publications'
  | 'languages'
  | 'references'
  | 'social'
  | 'contact'
  | 'interests'
  | 'achievements'
  | 'volunteer'
  | 'custom';

// ════════════════════════════════════════════════════════════
// LAYOUT TYPES
// ════════════════════════════════════════════════════════════
export type LayoutType =
  | 'single-column'
  | 'two-column'
  | 'three-column'
  | 'sidebar-left'
  | 'sidebar-right'
  | 'modern'
  | 'creative'
  | 'compact'
  | 'ats-friendly'
  | 'magazine'
  | 'magazine-header'
  | 'minimalist';

// ════════════════════════════════════════════════════════════
// THEME TYPES
// ════════════════════════════════════════════════════════════
export type ThemeId =
  | 'default'
  | 'dark'
  | 'minimal'
  | 'elegant'
  | 'professional'
  | 'creative'
  | 'modern'
  | 'classic'
  | 'vibrant'
  | 'corporate'
  | 'custom';

// ════════════════════════════════════════════════════════════
// TEMPLATE TYPES
// ════════════════════════════════════════════════════════════
export type TemplateId =
  | 'default'
  | 'modern'
  | 'classic'
  | 'minimal'
  | 'creative'
  | 'professional'
  | 'executive'
  | 'academic'
  | 'tech'
  | 'ats'
  | 'custom';

// ════════════════════════════════════════════════════════════
// CONTENT TYPES
// ════════════════════════════════════════════════════════════
export interface ExperienceContent {
  company: string;
  position: string;
  location?: string;
  startDate: string;
  endDate: string | 'Present';
  current: boolean;
  description: string;
  highlights?: string[];
  technologies?: string[];
  companyUrl?: string;
  companyLogo?: string;
}

export interface EducationContent {
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string | 'Present';
  current: boolean;
  gpa?: string;
  description?: string;
  highlights?: string[];
  logo?: string;
  location?: string;
}

export interface SkillContent {
  name: string;
  level: number; // 1-10
  category?: string;
  yearsOfExperience?: number;
  icon?: string;
  color?: string;
}

export interface SocialContent {
  platform: string;
  url: string;
  label?: string;
  icon?: string;
  username?: string;
}

export interface ContactContent {
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  website?: string;
  linkedin?: string;
  github?: string;
  twitter?: string;
  portfolio?: string;
}

export interface HeadingContent {
  text: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'span' | 'p';
}

export interface TextContent {
  text: string;
  html?: string;
  richText?: RichTextContent;
}

export interface RichTextContent {
  html: string;
  text: string;
  blocks?: any[];
}

export interface ImageContent {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  shape?: 'circle' | 'square' | 'rounded';
  objectFit?: 'cover' | 'contain' | 'fill';
}

export interface ListContent {
  items: string[];
  type: 'bullet' | 'ordered' | 'icon' | 'check';
  icon?: string;
}

export interface DateRangeContent {
  label: string;
  startDate: string;
  endDate: string | 'Present';
  current?: boolean;
}

export interface BadgeContent {
  text: string;
  color?: string;
  icon?: string;
  variant?: 'filled' | 'outlined' | 'ghost';
}

export interface DividerContent {
  style?: 'solid' | 'dashed' | 'dotted';
  thickness?: number;
  color?: string;
  width?: string | number;
  withIcon?: boolean;
  icon?: string;
}

export interface ProgressBarContent {
  label: string;
  value: number; // 0-100
  color?: string;
  showLabel?: boolean;
}

export interface RatingContent {
  label: string;
  value: number; // 0-5
  max?: number;
  icon?: 'star' | 'circle' | 'bar' | 'percentage';
}

export interface TagCloudContent {
  tags: string[];
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}

export interface CertificationContent {
  name: string;
  issuer: string;
  date: string;
  url?: string;
  expires?: string;
  credentialId?: string;
}

export interface ProjectContent {
  name: string;
  role?: string;
  description: string;
  technologies?: string[];
  url?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  highlights?: string[];
}

export interface PublicationContent {
  title: string;
  publisher: string;
  date: string;
  url?: string;
  description?: string;
  authors?: string[];
}

export interface LanguageContent {
  language: string;
  proficiency: 'native' | 'fluent' | 'advanced' | 'intermediate' | 'basic';
  certification?: string;
}

export interface ReferenceContent {
  name: string;
  position: string;
  company: string;
  email?: string;
  phone?: string;
  relationship?: string;
}

export interface LinkContent {
  label: string;
  url: string;
  icon?: string;
  newTab?: boolean;
}

export interface TimelineContent {
  title: string;
  subtitle: string;
  date: string;
  description: string;
  icon?: string;
  color?: string;
}

export interface QuoteContent {
  text: string;
  author?: string;
  source?: string;
}

export interface CustomHTMLContent {
  html: string;
}

// ════════════════════════════════════════════════════════════
// BLOCK DATA MODEL
// ════════════════════════════════════════════════════════════
export type BlockContent =
  | ExperienceContent
  | EducationContent
  | SkillContent
  | SocialContent
  | ContactContent
  | HeadingContent
  | TextContent
  | ImageContent
  | ListContent
  | DateRangeContent
  | BadgeContent
  | DividerContent
  | ProgressBarContent
  | RatingContent
  | TagCloudContent
  | CertificationContent
  | ProjectContent
  | PublicationContent
  | LanguageContent
  | ReferenceContent
  | LinkContent
  | TimelineContent
  | QuoteContent
  | CustomHTMLContent
  | RichTextContent
  | Record<string, any>;

export interface ResumeBlock {
  id: EntityId;
  type: BlockType;
  content: BlockContent;
  styleProps?: BlockStyle;
  typography?: TypographyStyle;
  spacing?: SpacingStyle;
  border?: BorderStyle;
  background?: BackgroundStyle;
  props?: Record<string, any>;
  visibility?: Visibility;
  order: number;
  locked?: boolean;
  collapsed?: boolean;
  tags?: string[];
  meta?: Record<string, any>;
}

// ════════════════════════════════════════════════════════════
// SECTION DATA MODEL
// ════════════════════════════════════════════════════════════
export interface ResumeSection {
  id: EntityId;
  type: SectionType;
  title: string;
  visible: boolean;
  collapsed?: boolean;
  locked?: boolean;
  styleProps?: SectionStyle;
  typography?: TypographyStyle;
  spacing?: SpacingStyle;
  border?: BorderStyle;
  background?: BackgroundStyle;
  layoutProps?: Record<string, any>;
  blocks: ResumeBlock[];
  order: number;
  minBlocks?: number;
  maxBlocks?: number;
  tags?: string[];
  meta?: Record<string, any>;
}

// ════════════════════════════════════════════════════════════
// PAGE DATA MODEL
// ════════════════════════════════════════════════════════════
export interface ResumePage {
  id: EntityId;
  pageNumber: number;
  sections: EntityId[];
  height?: string;
  width?: string;
  breakBefore?: boolean;
  breakAfter?: boolean;
  styleProps?: SectionStyle;
}

// ════════════════════════════════════════════════════════════
// THEME DEFINITION
// ════════════════════════════════════════════════════════════
export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  label: string;
  description?: string;
  colors: ThemeColors;
  fonts: ThemeFonts;
  typography: ThemeTypography;
  spacing: ThemeSpacingValues;
  borderRadius: ThemeBorderRadius;
  shadows: ThemeShadows;
  borders: ThemeBorders;
  effects: ThemeEffects;
  isDark?: boolean;
}

export interface ThemeColors {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  secondaryLight: string;
  secondaryDark: string;
  accent: string;
  accentLight: string;
  accentDark: string;
  background: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  textOnPrimary: string;
  textOnSecondary: string;
  textOnAccent: string;
  border: string;
  borderLight: string;
  divider: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  heading: string;
  link: string;
  linkHover: string;
  [key: string]: string;
}

export interface ThemeFonts {
  heading: string;
  body: string;
  mono?: string;
  sizes: FontSizes;
  weights: FontWeights;
}

export interface FontSizes {
  xs: string;
  sm: string;
  base: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
  icon: string;
  small: string;
  body: string;
  heading1: string;
  heading2: string;
  heading3: string;
  heading4: string;
  heading5: string;
  heading6: string;
}

export interface FontWeights {
  thin: FontWeight;
  light: FontWeight;
  normal: FontWeight;
  medium: FontWeight;
  semibold: FontWeight;
  bold: FontWeight;
  extrabold: FontWeight;
  heading: FontWeight;
  body: FontWeight;
  [key: string]: FontWeight;
}

export interface ThemeTypography {
  heading1: TypographyStyle;
  heading2: TypographyStyle;
  heading3: TypographyStyle;
  heading4: TypographyStyle;
  heading5: TypographyStyle;
  heading6: TypographyStyle;
  body: TypographyStyle;
  small: TypographyStyle;
  caption: TypographyStyle;
  sectionTitle: TypographyStyle;
  blockTitle: TypographyStyle;
}

export interface ThemeSpacingValues {
  page: string;
  section: string;
  block: string;
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  gap: string;
  gapSmall: string;
  gapLarge: string;
}

export interface ThemeBorderRadius {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  full: string;
  section: string;
  block: string;
  card: string;
  button: string;
}

export interface ThemeShadows {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  section: string;
  block: string;
  card: string;
  dropdown: string;
}

export interface ThemeBorders {
  none: string;
  thin: string;
  normal: string;
  thick: string;
  section: string;
  block: string;
  divider: string;
}

export interface ThemeEffects {
  hover: string;
  transition: string;
  blur: string;
  gradient: string;
  glassEffect: string;
}

// ════════════════════════════════════════════════════════════
// LAYOUT DEFINITION
// ════════════════════════════════════════════════════════════
export interface LayoutDefinition {
  id: LayoutType;
  name: string;
  label: string;
  description?: string;
  columns: number;
  columnRatios: number[];
  gap: string;
  sectionOrder?: string[];
  defaultSectionAlignment?: Record<string, TextAlignment>;
  style?: SectionStyle;
  preview?: string;
  responsive?: {
    tablet?: Partial<LayoutDefinition>;
    mobile?: Partial<LayoutDefinition>;
  };
}

// ════════════════════════════════════════════════════════════
// TEMPLATE DEFINITION
// ════════════════════════════════════════════════════════════
export interface TemplateDefinition {
  id: TemplateId;
  name: string;
  label: string;
  description?: string;
  layout: LayoutType;
  theme: ThemeId;
  sections: TemplateSectionConfig[];
  globalStyle?: Partial<GlobalStyle>;
  preview?: string;
  category?: string;
  tags?: string[];
  isAtsFriendly?: boolean;
  metadata?: Record<string, any>;
}

export interface TemplateSectionConfig {
  type: SectionType;
  title: string;
  visible: boolean;
  blocks: TemplateBlockConfig[];
  styleProps?: Partial<SectionStyle>;
  layoutProps?: Record<string, any>;
}

export interface TemplateBlockConfig {
  type: BlockType;
  content: Record<string, any>;
  styleProps?: Partial<BlockStyle>;
  props?: Record<string, any>;
}

// ════════════════════════════════════════════════════════════
// RESUME DATA
// ════════════════════════════════════════════════════════════
export interface ResumeData {
  id: EntityId;
  name: string;
  templateId: TemplateId;
  layoutId: LayoutType;
  themeId: ThemeId;
  sections: ResumeSection[];
  globalStyle: GlobalStyle;
  metadata: ResumeMetadata;
  pages?: ResumePage[];
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface ResumeMetadata {
  title?: string;
  description?: string;
  tags?: string[];
  category?: string;
  thumbnail?: string;
  targetRole?: string;
  targetIndustry?: string;
  experienceLevel?: 'entry' | 'mid' | 'senior' | 'executive';
  isAtsFriendly?: boolean;
  pageCount?: number;
  language?: string;
  customFields?: Record<string, any>;
}

// ════════════════════════════════════════════════════════════
// EDITOR STATE
// ════════════════════════════════════════════════════════════
export type EditorMode = 'edit' | 'preview' | 'print' | 'export';
export type ZoomLevel = 0.25 | 0.5 | 0.75 | 1 | 1.25 | 1.5 | 2;
export type DeviceMode = 'desktop' | 'tablet' | 'mobile';

export interface EditorState {
  mode: EditorMode;
  zoom: ZoomLevel;
  device: DeviceMode;
  selectedSectionId: EntityId | null;
  selectedBlockId: EntityId | null;
  isDragging: boolean;
  isResizing: boolean;
  showGrid: boolean;
  showRulers: boolean;
  snapToGrid: boolean;
  gridSize: number;
}

// ════════════════════════════════════════════════════════════
// HISTORY (UNDO/REDO)
// ════════════════════════════════════════════════════════════
export interface HistoryEntry {
  id: EntityId;
  timestamp: number;
  snapshot: ResumeData;
  description: string;
  type: 'manual' | 'auto' | 'undo' | 'redo';
}

export interface HistoryState {
  past: HistoryEntry[];
  future: HistoryEntry[];
  currentIndex: number;
  maxEntries: number;
  isLocked: boolean;
}

// ════════════════════════════════════════════════════════════
// EXPORT OPTIONS
// ════════════════════════════════════════════════════════════
export type ExportFormat = 'pdf' | 'png' | 'jpg' | 'svg' | 'json' | 'docx' | 'txt';
export type ExportQuality = 'draft' | 'normal' | 'high' | 'ultra';
export type PageSize = 'a4' | 'letter' | 'legal' | 'custom';

export interface ExportOptions {
  format: ExportFormat;
  quality: ExportQuality;
  pageSize: PageSize;
  includeMetadata: boolean;
  includeLinks: boolean;
  includeImages: boolean;
  flattenTags: boolean;
  dpi: number;
  filename?: string;
  pages?: number[];
  customPageSize?: { width: number; height: number };
}

// ════════════════════════════════════════════════════════════
// DRAG & DROP TYPES
// ════════════════════════════════════════════════════════════
export type DragItemType = 'section' | 'block' | 'layout' | 'template' | 'theme';

export interface DragItem {
  id: EntityId;
  type: DragItemType;
  parentId?: EntityId;
  index: number;
  data?: any;
}

export interface DropResult {
  item: DragItem;
  targetParentId: EntityId;
  targetIndex: number;
  action: 'move' | 'copy' | 'reorder';
}

// ════════════════════════════════════════════════════════════
// TAG ENGINE TYPES
// ════════════════════════════════════════════════════════════
export type TagSource =
  | 'resume'
  | 'global'
  | 'section'
  | 'block'
  | 'experience'
  | 'education'
  | 'skill'
  | 'contact'
  | 'social'
  | 'custom';

export interface TagDefinition {
  id: EntityId;
  tag: string;
  label: string;
  source: TagSource;
  resolver: string;
  description?: string;
  category?: string;
}

// ════════════════════════════════════════════════════════════
// COLLABORATION TYPES (future-ready)
// ════════════════════════════════════════════════════════════
export interface Collaborator {
  id: EntityId;
  email: string;
  name: string;
  role: 'owner' | 'editor' | 'viewer';
  avatar?: string;
  lastActive?: string;
  permissions: string[];
}

export interface CollaborationState {
  enabled: boolean;
  collaborators: Collaborator[];
  locks: Record<EntityId, { userId: EntityId; lockedAt: string }>;
  changes: any[];
  lastSync: string;
}

// ════════════════════════════════════════════════════════════
// AI-READY TYPES
// ════════════════════════════════════════════════════════════
export interface AISuggestion {
  id: EntityId;
  type: 'content' | 'style' | 'layout' | 'template' | 'complete';
  sectionId?: EntityId;
  blockId?: EntityId;
  suggestion: any;
  confidence: number;
  reason: string;
  applied: boolean;
}

export interface AIAnalysis {
  score: number;
  readability: number;
  atsScore: number;
  suggestions: AISuggestion[];
  keywordMatch: Record<string, number>;
  missingSections: string[];
  improvements: string[];
}

// ════════════════════════════════════════════════════════════
// STORE TYPES
// ════════════════════════════════════════════════════════════
export interface ResumeStore {
  // State
  resume: ResumeData;
  editor: EditorState;
  history: HistoryState;
  isDirty: boolean;
  isLoading: boolean;
  error: string | null;

  // Resume Actions
  setResume: (resume: ResumeData) => void;
  updateGlobalStyle: (style: Partial<GlobalStyle>) => void;
  updateMetadata: (metadata: Partial<ResumeMetadata>) => void;

  // Section Actions
  addSection: (section: Omit<ResumeSection, 'id' | 'order'>) => void;
  removeSection: (sectionId: EntityId) => void;
  updateSection: (sectionId: EntityId, updates: Partial<ResumeSection>) => void;
  reorderSections: (sectionIds: EntityId[]) => void;
  duplicateSection: (sectionId: EntityId) => void;
  toggleSectionVisibility: (sectionId: EntityId) => void;

  // Block Actions
  addBlock: (sectionId: EntityId, block: Omit<ResumeBlock, 'id' | 'order'>) => void;
  removeBlock: (sectionId: EntityId, blockId: EntityId) => void;
  updateBlock: (sectionId: EntityId, blockId: EntityId, updates: Partial<ResumeBlock>) => void;
  reorderBlocks: (sectionId: EntityId, blockIds: EntityId[]) => void;
  duplicateBlock: (sectionId: EntityId, blockId: EntityId) => void;
  moveBlock: (fromSectionId: EntityId, toSectionId: EntityId, blockId: EntityId, index: number) => void;

  // Theme Actions
  setTheme: (themeId: ThemeId) => void;

  // Layout Actions
  setLayout: (layoutId: LayoutType) => void;

  // Template Actions
  setTemplate: (templateId: TemplateId) => void;

  // Editor Actions
  setEditorMode: (mode: EditorMode) => void;
  setZoom: (zoom: ZoomLevel) => void;
  setDevice: (device: DeviceMode) => void;
  selectSection: (sectionId: EntityId | null) => void;
  selectBlock: (blockId: EntityId | null) => void;
  setDragging: (isDragging: boolean) => void;
  setResizing: (isResizing: boolean) => void;

  // History Actions
  undo: () => void;
  redo: () => void;
  saveSnapshot: (description?: string) => void;
  clearHistory: () => void;

  // Utility Actions
  loadResume: (id: EntityId) => Promise<void>;
  saveResume: () => Promise<void>;
  resetResume: () => void;
  setError: (error: string | null) => void;
  setLoading: (isLoading: boolean) => void;
}