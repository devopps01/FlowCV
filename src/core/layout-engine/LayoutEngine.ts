// ============================================================
// LAYOUT ENGINE - Dynamic Layout Resolution & Registry
// ============================================================

import type { LayoutType, LayoutDefinition } from '@/types/resume.types';

// ─── Default Layout Definitions ───
const defaultLayouts: Record<LayoutType, LayoutDefinition> = {
  'single-column': {
    id: 'single-column',
    name: 'Single Column',
    label: 'Single Column',
    description: 'Clean single column layout, perfect for professional resumes',
    columns: 1,
    columnRatios: [1],
    gap: '0',
    sectionOrder: ['header', 'summary', 'experience', 'education', 'skills', 'certifications', 'projects'],
  },
  'two-column': {
    id: 'two-column',
    name: 'Two Column',
    label: 'Two Column',
    description: 'Balanced two-column layout for side-by-side content',
    columns: 2,
    columnRatios: [0.5, 0.5],
    gap: '1.5rem',
    sectionOrder: ['header', 'summary', 'experience', 'education', 'skills'],
  },
  'three-column': {
    id: 'three-column',
    name: 'Three Column',
    label: 'Three Column',
    description: 'Three-column layout for comprehensive resumes',
    columns: 3,
    columnRatios: [0.33, 0.34, 0.33],
    gap: '1rem',
  },
  'sidebar-left': {
    id: 'sidebar-left',
    name: 'Sidebar Left',
    label: 'Sidebar Left',
    description: 'Professional layout with left sidebar for contact and skills',
    columns: 2,
    columnRatios: [0.3, 0.7],
    gap: '0',
    sectionOrder: ['header', 'contact', 'skills', 'languages', 'social'],
    style: {
      backgroundColor: '#f8fafc',
      padding: '0',
    },
  },
  'sidebar-right': {
    id: 'sidebar-right',
    name: 'Sidebar Right',
    label: 'Sidebar Right',
    description: 'Professional layout with right sidebar for contact and skills',
    columns: 2,
    columnRatios: [0.7, 0.3],
    gap: '0',
  },
  modern: {
    id: 'modern',
    name: 'Modern',
    label: 'Modern',
    description: 'Modern layout with header highlight and clean sections',
    columns: 2,
    columnRatios: [0.65, 0.35],
    gap: '1.5rem',
    sectionOrder: ['header', 'summary', 'experience', 'education', 'skills', 'projects'],
    style: {
      columnGap: 24,
    },
  },
  creative: {
    id: 'creative',
    name: 'Creative',
    label: 'Creative',
    description: 'Creative layout for design and artistic roles',
    columns: 2,
    columnRatios: [0.6, 0.4],
    gap: '1rem',
    style: {
      borderRadius: 8,
    },
  },
  compact: {
    id: 'compact',
    name: 'Compact',
    label: 'Compact',
    description: 'Space-efficient compact layout for experienced professionals',
    columns: 1,
    columnRatios: [1],
    gap: '0.5rem',
    style: {
      padding: '12mm',
    },
  },
  'ats-friendly': {
    id: 'ats-friendly',
    name: 'ATS Friendly',
    label: 'ATS Friendly',
    description: 'Simple ATS-optimized layout for applicant tracking systems',
    columns: 1,
    columnRatios: [1],
    gap: '0',
    style: {
      fontFamily: 'Arial, sans-serif',
      fontSize: 11,
      lineHeight: 1.4,
    },
  },
  magazine: {
    id: 'magazine',
    name: 'Magazine',
    label: 'Magazine',
    description: 'Magazine-style layout with bold headers and columns',
    columns: 2,
    columnRatios: [0.4, 0.6],
    gap: '2rem',
    style: {
      columnGap: 32,
    },
  },
  minimalist: {
    id: 'minimalist',
    name: 'Minimalist',
    label: 'Minimalist',
    description: 'Clean minimalist layout with plenty of white space',
    columns: 1,
    columnRatios: [1],
    gap: '0',
    style: {
      padding: '25mm',
    },
  },
};

// ─── Layout Registry ───
class LayoutRegistry {
  private layouts: Map<LayoutType, LayoutDefinition> = new Map();

  constructor() {
    this.registerDefaults();
  }

  private registerDefaults(): void {
    Object.entries(defaultLayouts).forEach(([key, layout]) => {
      this.layouts.set(key as LayoutType, layout);
    });
  }

  get(id: LayoutType): LayoutDefinition {
    const layout = this.layouts.get(id);
    if (!layout) {
      console.warn(`Layout "${id}" not found, falling back to single-column`);
      return this.layouts.get('single-column')!;
    }
    return layout;
  }

  getAll(): LayoutDefinition[] {
    return Array.from(this.layouts.values());
  }

  register(layout: LayoutDefinition): void {
    this.layouts.set(layout.id, layout);
  }

  unregister(id: LayoutType): void {
    this.layouts.delete(id);
  }

  has(id: LayoutType): boolean {
    return this.layouts.has(id);
  }

  getIds(): LayoutType[] {
    return Array.from(this.layouts.keys());
  }
}

export const layoutRegistry = new LayoutRegistry();

// ─── Layout Engine ───
class LayoutEngine {
  private registry: LayoutRegistry;

  constructor(registry: LayoutRegistry) {
    this.registry = registry;
  }

  getLayout(id: LayoutType): LayoutDefinition {
    return this.registry.get(id);
  }

  getAllLayouts(): LayoutDefinition[] {
    return this.registry.getAll();
  }

  getColumnRatios(id: LayoutType): number[] {
    return this.registry.get(id).columnRatios;
  }

  getColumnCount(id: LayoutType): number {
    return this.registry.get(id).columns;
  }

  resolveLayout(id: LayoutType): {
    layout: LayoutDefinition;
    columnStyles: React.CSSProperties[];
    containerStyle: React.CSSProperties;
  } {
    const layout = this.registry.get(id);
    const columnStyles = this.generateColumnStyles(layout);
    const containerStyle = this.generateContainerStyle(layout);
    return { layout, columnStyles, containerStyle };
  }
}

function generateColumnStyles(layout: LayoutDefinition): React.CSSProperties[] {
  return layout.columnRatios.map((ratio) => ({
    flex: `${ratio * 100}%`,
    maxWidth: `${ratio * 100}%`,
    padding: layout.gap ? `0 ${parseFloat(layout.gap) / 2}px` : '0',
    boxSizing: 'border-box' as const,
  }));
}

function generateContainerStyle(layout: LayoutDefinition): React.CSSProperties {
  const style: React.CSSProperties = {
    display: layout.columns > 1 ? 'flex' : 'block',
    flexDirection: 'row',
    width: '100%',
    gap: layout.gap,
    boxSizing: 'border-box',
  };

  if (layout.style) {
    if (layout.style.backgroundColor) style.backgroundColor = layout.style.backgroundColor;
    if (layout.style.padding) style.padding = layout.style.padding;
    if (layout.style.borderRadius) style.borderRadius = layout.style.borderRadius;
    if (layout.style.columnGap) style.columnGap = layout.style.columnGap;
  }

  return style;
}

function generateLayoutStyles(layoutType: LayoutType): React.CSSProperties {
  const layout = layoutRegistry.get(layoutType);
  return generateContainerStyle(layout);
}

export const layoutEngine = new LayoutEngine(layoutRegistry);
export { generateLayoutStyles, generateContainerStyle, generateColumnStyles };
export type { LayoutRegistry };
export { LayoutRegistry };