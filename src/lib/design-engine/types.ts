export interface ResumeContent {
  name?: string;
  role?: string;
  skills?: string[];
  experience?: Array<{
    title?: string;
    company?: string;
    description?: string;
    years?: number;
  }>;
  education?: Array<{
    degree?: string;
    school?: string;
    year?: number;
  }>;
  projects?: Array<{
    name?: string;
    description?: string;
  }>;
  certifications?: string[];
  languages?: string[];
  summary?: string;
}

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  textLight: string;
  background: string;
  border: string;
}

export interface TypographyConfig {
  headingFont: string;
  bodyFont: string;
  nameSize: number;
  headingSize: number;
  subheadingSize: number;
  bodySize: number;
  smallSize: number;
  lineHeight: number;
}

export interface LayoutConfig {
  type: 'single' | 'two-column' | 'sidebar' | 'modern';
  sidebarWidth?: number;
  marginX: number;
  marginY: number;
  sectionGap: number;
  itemGap: number;
}

export interface DesignConfig {
  colors: ColorPalette;
  typography: TypographyConfig;
  layout: LayoutConfig;
}

export interface DesignScore {
  score: number;
  layoutScore: number;
  colorScore: number;
  typographyScore: number;
  spacingScore: number;
  issues: string[];
  suggestions: string[];
}

export interface DesignSuggestion {
  type: 'layout' | 'color' | 'typography' | 'spacing' | 'content';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  action: string;
}

export interface AutoLayoutPosition {
  sectionId: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TemplateRecommendation {
  templateId: string;
  templateName: string;
  score: number;
  reason: string;
}
