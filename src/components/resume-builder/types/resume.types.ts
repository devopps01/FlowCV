export interface ThemeConfig {
  primaryColor: string;
  secondaryColor?: string;
  textColor: string;
  backgroundColor: string;
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  marginLR: number;
  marginTB: number;
  entrySpacing: number;
  sectionSpacing: number;
  headingSize: 's' | 'm' | 'l' | 'xl';
  headingStyle: string;
  headingCapitalization: 'uppercase' | 'capitalize' | 'none';
  borderRadius?: 'none' | 'md' | 'lg' | 'xl';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  personalAlign?: 'left' | 'center' | 'right';
  photoShow?: boolean;
  photoShape?: 'circle' | 'rounded' | 'square';
  nameSize?: 'xs' | 's' | 'm' | 'l' | 'xl';
  nameBold?: boolean;
}

export interface ResumeBlock {
  id: string;
  type: BlockType;
  content: any;
  style?: Record<string, any>;
  props?: Record<string, any>;
  visible?: boolean;
}

export type BlockType =
  | 'heading'
  | 'text'
  | 'paragraph'
  | 'name'
  | 'professionalTitle'
  | 'contactInfo'
  | 'photo'
  | 'experience'
  | 'education'
  | 'skills'
  | 'languages'
  | 'certifications'
  | 'projects'
  | 'awards'
  | 'interests'
  | 'socials'
  | 'courses'
  | 'organisations'
  | 'publications'
  | 'references'
  | 'declaration'
  | 'custom'
  | 'richText'
  | 'divider'
  | 'spacer'
  | 'list'
  | 'signature';

export interface ResumeSection {
  id: string;
  type: string;
  title: string;
  visible: boolean;
  order: number;
  style?: Record<string, any>;
  props?: Record<string, any>;
  blocks: ResumeBlock[];
}

export interface ResumeData {
  id: string;
  title: string;
  template: string;
  layout: LayoutType;
  theme: ThemeConfig;
  sections: ResumeSection[];
  activeLayout?: string;
  design?: Record<string, any>;
}

export type LayoutType =
  | 'single'
  | 'sidebar-left'
  | 'sidebar-right'
  | 'two-column'
  | 'modern-header'
  | 'double-header'
  | 'creative'
  | 'minimal';

export interface BlockRendererProps {
  block: ResumeBlock;
  sectionId: string;
  data: ResumeData;
  onUpdate?: (blockId: string, content: any) => void;
  isEditing?: boolean;
  zoom?: number;
}

export interface SectionRendererProps {
  section: ResumeSection;
  data: ResumeData;
  onUpdateSection?: (sectionId: string, updates: Partial<ResumeSection>) => void;
  onUpdateBlock?: (sectionId: string, blockId: string, content: any) => void;
  isEditing?: boolean;
  zoom?: number;
}

export interface LayoutRendererProps {
  data: ResumeData;
  onUpdate?: (sectionId: string, blockId: string, content: any) => void;
  onUpdateSection?: (sectionId: string, updates: Partial<ResumeSection>) => void;
  isEditing?: boolean;
  zoom?: number;
}