import type { DeviceMode, LayoutContext, LayoutDefinition, ResumeSection, LayoutId } from '@/types/resume-builder.types';

export const layoutDefinitions: Record<LayoutId, LayoutDefinition> = {
  single: {
    id: 'single',
    name: 'Single Column',
    description: 'Clean one-column reading flow',
    columns: 1,
    supportsAts: true,
    sectionBuckets: { primary: ['header', 'summary', 'experience', 'education', 'skills', 'projects', 'languages', 'certifications', 'social', 'custom'] },
  },
  double: {
    id: 'double',
    name: 'Double Column',
    description: 'Balanced two-column layout',
    columns: 2,
    supportsAts: true,
    sectionBuckets: {
      primary: ['header', 'summary', 'experience', 'education', 'projects'],
      secondary: ['skills', 'languages', 'certifications', 'social', 'custom'],
    },
  },
  sidebar: {
    id: 'sidebar',
    name: 'Sidebar',
    description: 'Primary content with side rail',
    columns: 2,
    supportsAts: true,
    sectionBuckets: {
      primary: ['header', 'summary', 'experience', 'education', 'projects'],
      secondary: ['skills', 'languages', 'certifications', 'social', 'custom'],
    },
  },
  modern: {
    id: 'modern',
    name: 'Modern',
    description: 'Header-led modern composition',
    columns: 2,
    supportsAts: true,
    sectionBuckets: {
      primary: ['header', 'summary', 'experience', 'projects', 'education'],
      secondary: ['skills', 'languages', 'social', 'certifications', 'custom'],
    },
  },
  creative: {
    id: 'creative',
    name: 'Creative',
    description: 'Expressive visual hierarchy',
    columns: 2,
    supportsAts: false,
    sectionBuckets: {
      primary: ['header', 'summary', 'experience', 'projects', 'custom'],
      secondary: ['skills', 'languages', 'social', 'education', 'certifications'],
    },
  },
  ats: {
    id: 'ats',
    name: 'ATS',
    description: 'ATS-optimized plain structure',
    columns: 1,
    supportsAts: true,
    sectionBuckets: { primary: ['header', 'summary', 'experience', 'education', 'skills', 'projects', 'languages', 'certifications', 'social', 'custom'] },
  },
  compact: {
    id: 'compact',
    name: 'Compact',
    description: 'Dense layout for one-page focus',
    columns: 2,
    supportsAts: true,
    sectionBuckets: {
      primary: ['header', 'summary', 'experience', 'education'],
      secondary: ['skills', 'languages', 'certifications', 'social', 'projects', 'custom'],
    },
  },
};

export interface DistributedLayout {
  definition: LayoutDefinition;
  columns: ResumeSection[][];
}

export function buildLayoutContext(
  resume: LayoutContext['resume'],
  device: DeviceMode,
): LayoutContext {
  return {
    resume,
    device,
    visibleSections: [...resume.sections]
      .filter((section) => section.visible)
      .sort((a, b) => a.order - b.order),
  };
}

export function distributeSections(context: LayoutContext): DistributedLayout {
  const definition = layoutDefinitions[context.resume.layoutId] ?? layoutDefinitions.single;
  if (context.device !== 'desktop' || definition.columns === 1) {
    return {
      definition: { ...definition, columns: 1 },
      columns: [context.visibleSections],
    };
  }

  const primary: ResumeSection[] = [];
  const secondary: ResumeSection[] = [];
  const fallbackEven: ResumeSection[] = [];

  context.visibleSections.forEach((section) => {
    if (definition.sectionBuckets.primary.includes(section.type)) {
      primary.push(section);
      return;
    }
    if (definition.sectionBuckets.secondary?.includes(section.type)) {
      secondary.push(section);
      return;
    }
    fallbackEven.push(section);
  });

  if (definition.columns === 1) return { definition, columns: [context.visibleSections] };
  const left = [...primary];
  const right = [...secondary];
  fallbackEven.forEach((section, index) => {
    if (index % 2 === 0) left.push(section);
    else right.push(section);
  });

  return { definition, columns: [left, right] };
}
