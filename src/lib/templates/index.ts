export interface TemplateSection {
  id: string;
  type: 'text' | 'image' | 'rect' | 'section';
  content?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  style: {
    fontSize?: number;
    fontWeight?: string;
    color?: string;
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
    borderRadius?: number;
    padding?: number;
    textAlign?: 'left' | 'center' | 'right';
  };
}

export interface TemplateLayout {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  type: 'classic' | 'modern' | 'minimal' | 'sidebar' | 'two-column';
  pageWidth: number;
  pageHeight: number;
  margin: { x: number; y: number };
  sections: TemplateSection[];
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    background: string;
  };
}

export const TEMPLATES: Record<string, TemplateLayout> = {
  classic: {
    id: 'classic',
    name: 'Classic Professional',
    description: 'Traditional single-column layout perfect for corporate positions',
    thumbnail: '/templates/classic.jpg',
    type: 'classic',
    pageWidth: 595,
    pageHeight: 842,
    margin: { x: 40, y: 40 },
    sections: [
      {
        id: 'personal-info',
        type: 'section',
        content: 'name',
        x: 40, y: 40, width: 515, height: 80,
        style: { fontSize: 28, fontWeight: 'bold', color: '#1e3a8a', textAlign: 'center' },
      },
      {
        id: 'contact',
        type: 'text',
        content: 'contact',
        x: 40, y: 120, width: 515, height: 30,
        style: { fontSize: 10, color: '#666', textAlign: 'center' },
      },
      {
        id: 'summary',
        type: 'section',
        content: 'summary',
        x: 40, y: 160, width: 515, height: 60,
        style: { fontSize: 12, fontWeight: 'bold', color: '#1e3a8a' },
      },
      {
        id: 'experience',
        type: 'section',
        content: 'experience',
        x: 40, y: 240, width: 515, height: 200,
        style: { fontSize: 12, fontWeight: 'bold', color: '#1e3a8a' },
      },
      {
        id: 'education',
        type: 'section',
        content: 'education',
        x: 40, y: 460, width: 515, height: 120,
        style: { fontSize: 12, fontWeight: 'bold', color: '#1e3a8a' },
      },
      {
        id: 'skills',
        type: 'section',
        content: 'skills',
        x: 40, y: 600, width: 515, height: 80,
        style: { fontSize: 12, fontWeight: 'bold', color: '#1e3a8a' },
      },
    ],
    colors: {
      primary: '#1e3a8a',
      secondary: '#f1f5f9',
      accent: '#3b82f6',
      text: '#1e293b',
      background: '#ffffff',
    },
  },

  modern: {
    id: 'modern',
    name: 'Modern Tech',
    description: 'Clean design with accent colors for tech professionals',
    thumbnail: '/templates/modern.jpg',
    type: 'modern',
    pageWidth: 595,
    pageHeight: 842,
    margin: { x: 40, y: 40 },
    sections: [
      {
        id: 'personal-info',
        type: 'section',
        content: 'name',
        x: 40, y: 40, width: 515, height: 60,
        style: { fontSize: 32, fontWeight: 'bold', color: '#dc2626' },
      },
      {
        id: 'role',
        type: 'text',
        content: 'role',
        x: 40, y: 100, width: 515, height: 25,
        style: { fontSize: 14, fontWeight: 'bold', color: '#666' },
      },
      {
        id: 'summary',
        type: 'section',
        content: 'summary',
        x: 40, y: 140, width: 515, height: 50,
        style: { fontSize: 11, color: '#333' },
      },
      {
        id: 'experience',
        type: 'section',
        content: 'experience',
        x: 40, y: 210, width: 515, height: 220,
        style: { fontSize: 11, fontWeight: 'bold', color: '#dc2626' },
      },
      {
        id: 'skills',
        type: 'section',
        content: 'skills',
        x: 40, y: 450, width: 515, height: 60,
        style: { fontSize: 11, fontWeight: 'bold', color: '#dc2626' },
      },
      {
        id: 'education',
        type: 'section',
        content: 'education',
        x: 40, y: 530, width: 515, height: 100,
        style: { fontSize: 11, fontWeight: 'bold', color: '#dc2626' },
      },
    ],
    colors: {
      primary: '#dc2626',
      secondary: '#fef2f2',
      accent: '#ef4444',
      text: '#1f2937',
      background: '#ffffff',
    },
  },

  minimal: {
    id: 'minimal',
    name: 'Minimal Clean',
    description: 'Simple and elegant design for any industry',
    thumbnail: '/templates/minimal.jpg',
    type: 'minimal',
    pageWidth: 595,
    pageHeight: 842,
    margin: { x: 50, y: 50 },
    sections: [
      {
        id: 'personal-info',
        type: 'section',
        content: 'name',
        x: 50, y: 50, width: 495, height: 50,
        style: { fontSize: 26, fontWeight: 'bold', color: '#18181b' },
      },
      {
        id: 'summary',
        type: 'section',
        content: 'summary',
        x: 50, y: 110, width: 495, height: 50,
        style: { fontSize: 11, color: '#52525b' },
      },
      {
        id: 'experience',
        type: 'section',
        content: 'experience',
        x: 50, y: 180, width: 495, height: 250,
        style: { fontSize: 11, fontWeight: 'bold', color: '#18181b' },
      },
      {
        id: 'education',
        type: 'section',
        content: 'education',
        x: 50, y: 450, width: 495, height: 120,
        style: { fontSize: 11, fontWeight: 'bold', color: '#18181b' },
      },
      {
        id: 'skills',
        type: 'section',
        content: 'skills',
        x: 50, y: 590, width: 495, height: 50,
        style: { fontSize: 11, fontWeight: 'bold', color: '#18181b' },
      },
    ],
    colors: {
      primary: '#18181b',
      secondary: '#fafafa',
      accent: '#27272a',
      text: '#09090b',
      background: '#ffffff',
    },
  },

  sidebar: {
    id: 'sidebar',
    name: 'Sidebar Layout',
    description: 'Two-column layout with sidebar for showcasing skills',
    thumbnail: '/templates/sidebar.jpg',
    type: 'sidebar',
    pageWidth: 595,
    pageHeight: 842,
    margin: { x: 0, y: 40 },
    sections: [
      {
        id: 'personal-info',
        type: 'section',
        content: 'name',
        x: 240, y: 40, width: 315, height: 60,
        style: { fontSize: 24, fontWeight: 'bold', color: '#0f766e' },
      },
      {
        id: 'contact',
        type: 'text',
        content: 'contact',
        x: 240, y: 100, width: 315, height: 40,
        style: { fontSize: 9, color: '#666' },
      },
      {
        id: 'summary',
        type: 'section',
        content: 'summary',
        x: 240, y: 150, width: 315, height: 60,
        style: { fontSize: 10, color: '#333' },
      },
      {
        id: 'experience',
        type: 'section',
        content: 'experience',
        x: 240, y: 230, width: 315, height: 200,
        style: { fontSize: 10, fontWeight: 'bold', color: '#0f766e' },
      },
      {
        id: 'education',
        type: 'section',
        content: 'education',
        x: 240, y: 450, width: 315, height: 100,
        style: { fontSize: 10, fontWeight: 'bold', color: '#0f766e' },
      },
      {
        id: 'sidebar-skills',
        type: 'section',
        content: 'skills',
        x: 40, y: 40, width: 180, height: 300,
        style: { fontSize: 11, fontWeight: 'bold', color: '#0f766e', backgroundColor: '#f0fdfa' },
      },
      {
        id: 'sidebar-certifications',
        type: 'section',
        content: 'certifications',
        x: 40, y: 360, width: 180, height: 100,
        style: { fontSize: 10, fontWeight: 'bold', color: '#0f766e', backgroundColor: '#f0fdfa' },
      },
    ],
    colors: {
      primary: '#0f766e',
      secondary: '#f0fdfa',
      accent: '#14b8a6',
      text: '#134e4a',
      background: '#ffffff',
    },
  },

  'two-column': {
    id: 'two-column',
    name: 'Two Column',
    description: 'Professional two-column layout for experienced candidates',
    thumbnail: '/templates/two-column.jpg',
    type: 'two-column',
    pageWidth: 595,
    pageHeight: 842,
    margin: { x: 40, y: 40 },
    sections: [
      {
        id: 'personal-info',
        type: 'section',
        content: 'name',
        x: 40, y: 40, width: 515, height: 50,
        style: { fontSize: 26, fontWeight: 'bold', color: '#7c3aed', textAlign: 'center' },
      },
      {
        id: 'summary',
        type: 'section',
        content: 'summary',
        x: 40, y: 100, width: 515, height: 50,
        style: { fontSize: 10, color: '#333' },
      },
      {
        id: 'left-column',
        type: 'section',
        content: 'experience',
        x: 40, y: 170, width: 250, height: 350,
        style: { fontSize: 10, fontWeight: 'bold', color: '#7c3aed' },
      },
      {
        id: 'right-column-skills',
        type: 'section',
        content: 'skills',
        x: 305, y: 170, width: 250, height: 150,
        style: { fontSize: 10, fontWeight: 'bold', color: '#7c3aed' },
      },
      {
        id: 'right-column-education',
        type: 'section',
        content: 'education',
        x: 305, y: 340, width: 250, height: 100,
        style: { fontSize: 10, fontWeight: 'bold', color: '#7c3aed' },
      },
      {
        id: 'right-column-projects',
        type: 'section',
        content: 'projects',
        x: 305, y: 460, width: 250, height: 100,
        style: { fontSize: 10, fontWeight: 'bold', color: '#7c3aed' },
      },
    ],
    colors: {
      primary: '#7c3aed',
      secondary: '#f5f3ff',
      accent: '#8b5cf6',
      text: '#1f2937',
      background: '#ffffff',
    },
  },
};

export function getTemplate(id: string): TemplateLayout | undefined {
  return TEMPLATES[id];
}

export function getAllTemplates(): TemplateLayout[] {
  return Object.values(TEMPLATES);
}

export function applyTemplate(
  templateId: string,
  existingData: any
): { elements: any[]; design: any; layout: any } {
  const template = TEMPLATES[templateId];
  if (!template) {
    return { elements: [], design: {}, layout: {} };
  }

  const elements: any[] = [];
  const layoutPositions: Record<string, { x: number; y: number }> = {};

  template.sections.forEach((section, index) => {
    const elementId = `${section.id}-${Date.now()}-${index}`;
    layoutPositions[section.id] = { x: section.x, y: section.y };

    elements.push({
      id: elementId,
      type: section.type,
      content: section.content,
      x: section.x,
      y: section.y,
      width: section.width,
      height: section.height,
      rotation: 0,
      zIndex: index,
      locked: false,
      visible: true,
      style: {
        fontSize: section.style.fontSize,
        fontWeight: section.style.fontWeight,
        color: section.style.color,
        backgroundColor: section.style.backgroundColor,
        borderColor: section.style.borderColor,
        borderWidth: section.style.borderWidth,
        borderRadius: section.style.borderRadius,
        padding: section.style.padding,
        textAlign: section.style.textAlign,
        opacity: 1,
        lineHeight: 1.4,
        letterSpacing: 0,
      },
    });
  });

  return {
    elements,
    design: {
      fontFamily: 'Inter',
      fontSize: 11,
      primaryColor: template.colors.primary,
      backgroundColor: template.colors.background,
      spacing: 1,
      pageSize: 'A4',
      layoutPositions: layoutPositions,
    },
    layout: {
      type: template.type,
      marginX: template.margin.x,
      marginY: template.margin.y,
    },
  };
}
