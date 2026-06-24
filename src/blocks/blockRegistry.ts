// ============================================================
// BLOCK REGISTRY - Dynamic Block Component Mapping
// ============================================================

import React from 'react';
import type { BlockType, ResumeBlock } from '@/types/resume.types';

// ─── Block Component Interface ───
export interface BlockComponentProps {
  block: ResumeBlock;
  theme?: any;
  isSelected?: boolean;
  isEditing?: boolean;
  onUpdate?: (blockId: string, updates: Partial<ResumeBlock>) => void;
  onSelect?: (blockId: string) => void;
  style?: React.CSSProperties;
}

export type BlockComponent = React.ComponentType<BlockComponentProps>;

// ─── Lazy Loaded Block Registry ───
// Only blocks with actual files are listed; others fall back to DynamicBlockRenderer
const blockModules: Partial<Record<BlockType, () => Promise<{ default: BlockComponent }>>> = {
  heading: () => import('./HeadingBlock'),
};

// ─── Synchronously Loaded Block Components ───
// These are eagerly loaded for common blocks

// ─── Loaded Components Cache ───
const loadedComponents: Map<BlockType, BlockComponent> = new Map();

// ─── Block Registry ───
class BlockRegistry {
  private registry: Map<BlockType, BlockComponent> = new Map();

  register(type: BlockType, component: BlockComponent): void {
    this.registry.set(type, component);
  }

  get(type: BlockType): BlockComponent | undefined {
    // Check eagerly registered components first
    const eager = this.registry.get(type);
    if (eager) return eager;

    // Check lazy loaded cache
    const cached = loadedComponents.get(type);
    if (cached) return cached;

    return undefined;
  }

  has(type: BlockType): boolean {
    return this.registry.has(type) || loadedComponents.has(type) || blockModules[type] !== undefined;
  }

  async load(type: BlockType): Promise<BlockComponent | undefined> {
    // Check eagerly registered
    const eager = this.registry.get(type);
    if (eager) return eager;

    // Check cache
    const cached = loadedComponents.get(type);
    if (cached) return cached;

    // Lazy load
    const loader = blockModules[type];
    if (!loader) {
      console.warn(`No block component registered for type: ${type}`);
      return undefined;
    }

    try {
      const module = await loader();
      loadedComponents.set(type, module.default);
      return module.default;
    } catch (error) {
      console.error(`Failed to load block component for type: ${type}`, error);
      return undefined;
    }
  }

  getAllTypes(): BlockType[] {
    return Object.keys(blockModules) as BlockType[];
  }

  getVisibleTypes(): BlockType[] {
    return this.getAllTypes();
  }
}

export const blockRegistry = new BlockRegistry();

// ─── Block Component Map (static reference for synch usage) ───
// This maps block types to their display info
export const blockInfoMap: Record<BlockType, { label: string; icon: string; description: string; defaultContent: any }> = {
  heading: { label: 'Heading', icon: 'H', description: 'Section heading (H1-H6)', defaultContent: { text: 'Heading', level: 2 } },
  text: { label: 'Text', icon: 'T', description: 'Plain text or rich text content', defaultContent: { text: 'Enter text here...' } },
  paragraph: { label: 'Paragraph', icon: '¶', description: 'Paragraph text', defaultContent: { text: 'Enter paragraph text...' } },
  'rich-text': { label: 'Rich Text', icon: 'R', description: 'Rich formatted text with HTML', defaultContent: { html: '<p>Enter rich text...</p>', text: 'Enter rich text...' } },
  experience: { label: 'Experience', icon: '💼', description: 'Work experience entry', defaultContent: { company: '', position: '', startDate: '', endDate: '', current: false, description: '', highlights: [] } },
  education: { label: 'Education', icon: '🎓', description: 'Education entry', defaultContent: { institution: '', degree: '', field: '', startDate: '', endDate: '', current: false } },
  skills: { label: 'Skills', icon: '⚡', description: 'Skills with tags or levels', defaultContent: { tags: [], level: 0 } },
  social: { label: 'Social', icon: '🔗', description: 'Social media links', defaultContent: { platform: '', url: '', label: '' } },
  contact: { label: 'Contact', icon: '📧', description: 'Contact information', defaultContent: { email: '', phone: '' } },
  image: { label: 'Image', icon: '🖼️', description: 'Image or avatar', defaultContent: { src: '', alt: '' } },
  avatar: { label: 'Avatar', icon: '👤', description: 'Profile photo/avatar', defaultContent: { src: '', alt: 'Avatar', shape: 'circle' } },
  badge: { label: 'Badge', icon: '🏷️', description: 'Badge or tag', defaultContent: { text: 'Badge' } },
  divider: { label: 'Divider', icon: '―', description: 'Horizontal divider', defaultContent: {} },
  list: { label: 'List', icon: '📋', description: 'Bullet or ordered list', defaultContent: { items: ['Item 1', 'Item 2'], type: 'bullet' } },
  'bullet-list': { label: 'Bullet List', icon: '•', description: 'Bullet point list', defaultContent: { items: ['Item'], type: 'bullet' } },
  'ordered-list': { label: 'Ordered List', icon: '1.', description: 'Numbered list', defaultContent: { items: ['Item'], type: 'ordered' } },
  'icon-list': { label: 'Icon List', icon: '✨', description: 'List with icons', defaultContent: { items: ['Item'], type: 'icon', icon: 'check' } },
  'progress-bar': { label: 'Progress Bar', icon: '📊', description: 'Skill progress/level bar', defaultContent: { label: 'Skill', value: 75 } },
  rating: { label: 'Rating', icon: '⭐', description: 'Star or bar rating', defaultContent: { label: 'Rating', value: 4, max: 5 } },
  'tag-cloud': { label: 'Tag Cloud', icon: '☁️', description: 'Tag cloud display', defaultContent: { tags: ['Tag1', 'Tag2'] } },
  'date-range': { label: 'Date Range', icon: '📅', description: 'Date range display', defaultContent: { label: 'Period', startDate: '', endDate: '' } },
  certification: { label: 'Certification', icon: '📜', description: 'Certification entry', defaultContent: { name: '', issuer: '', date: '' } },
  project: { label: 'Project', icon: '📁', description: 'Project entry', defaultContent: { name: '', description: '' } },
  publication: { label: 'Publication', icon: '📄', description: 'Publication entry', defaultContent: { title: '', publisher: '', date: '' } },
  language: { label: 'Language', icon: '🌐', description: 'Language proficiency', defaultContent: { language: '', proficiency: 'intermediate' } },
  reference: { label: 'Reference', icon: '👥', description: 'Reference entry', defaultContent: { name: '', position: '', company: '' } },
  link: { label: 'Link', icon: '🔗', description: 'Hyperlink', defaultContent: { label: 'Link', url: '' } },
  button: { label: 'Button', icon: '🔘', description: 'Action button', defaultContent: { label: 'Button', url: '' } },
  table: { label: 'Table', icon: '📊', description: 'Data table', defaultContent: { headers: [], rows: [] } },
  chart: { label: 'Chart', icon: '📈', description: 'Chart/Graph', defaultContent: { type: 'bar', data: [] } },
  timeline: { label: 'Timeline', icon: '⏳', description: 'Timeline entry', defaultContent: { title: '', subtitle: '', date: '', description: '' } },
  quote: { label: 'Quote', icon: '💬', description: 'Blockquote', defaultContent: { text: 'Quote text', author: '' } },
  'custom-html': { label: 'Custom HTML', icon: '</>', description: 'Custom HTML content', defaultContent: { html: '<div>Custom content</div>' } },
  custom: { label: 'Custom', icon: '⚙️', description: 'Custom block', defaultContent: {} },
};