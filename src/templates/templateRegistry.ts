import { nanoid } from 'nanoid';
import type { ResumeSection, TemplateDefinition, TemplateId } from '@/types/resume-builder.types';

const baseSections = (): ResumeSection[] => [
  {
    id: nanoid(),
    type: 'header',
    title: 'Header',
    visible: true,
    order: 0,
    blocks: [
      { id: nanoid(), type: 'heading', content: { text: '{{name}}', level: 1 }, visible: true, order: 0 },
      { id: nanoid(), type: 'text', content: { text: '{{email}} • {{phone}} • {{location}}' }, visible: true, order: 1 },
      { id: nanoid(), type: 'text', content: { text: '{{headline}}' }, visible: true, order: 2 },
    ],
  },
  {
    id: nanoid(),
    type: 'summary',
    title: 'Summary',
    visible: true,
    order: 1,
    blocks: [{ id: nanoid(), type: 'text', content: { text: 'Write your summary...' }, visible: true, order: 0 }],
  },
  {
    id: nanoid(),
    type: 'experience',
    title: 'Experience',
    visible: true,
    order: 2,
    blocks: [
      {
        id: nanoid(),
        type: 'experience',
        content: { role: 'Role', company: 'Company', startDate: '2020', endDate: 'Present', bullets: [] },
        visible: true,
        order: 0,
      },
    ],
  },
  {
    id: nanoid(),
    type: 'education',
    title: 'Education',
    visible: true,
    order: 3,
    blocks: [{ id: nanoid(), type: 'education', content: { school: '', degree: '', year: '' }, visible: true, order: 0 }],
  },
  {
    id: nanoid(),
    type: 'skills',
    title: 'Skills',
    visible: true,
    order: 4,
    blocks: [{ id: nanoid(), type: 'skills', content: { items: [] }, visible: true, order: 0 }],
  },
];

export const templateRegistry: Record<TemplateId, TemplateDefinition> = {
  'modern-pro': {
    id: 'modern-pro',
    name: 'Modern Pro',
    description: 'Balanced modern layout with strong readability.',
    layoutId: 'modern',
    themeId: 'default',
    defaultSections: baseSections(),
    atsOptimized: true,
  },
  'classic-pro': {
    id: 'classic-pro',
    name: 'Classic Pro',
    description: 'Traditional resume composition.',
    layoutId: 'single',
    themeId: 'executive',
    defaultSections: baseSections(),
    atsOptimized: true,
  },
  'creative-pro': {
    id: 'creative-pro',
    name: 'Creative Pro',
    description: 'Bold visual structure for creative roles.',
    layoutId: 'creative',
    themeId: 'creative',
    defaultSections: baseSections(),
    atsOptimized: false,
  },
  'ats-pro': {
    id: 'ats-pro',
    name: 'ATS Pro',
    description: 'Strict ATS-compatible structure and typography.',
    layoutId: 'ats',
    themeId: 'ats',
    defaultSections: baseSections(),
    atsOptimized: true,
  },
};

export const getTemplateById = (templateId: TemplateId): TemplateDefinition =>
  templateRegistry[templateId] || templateRegistry['modern-pro'];
