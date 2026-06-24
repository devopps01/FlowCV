import { nanoid } from 'nanoid';
import type {
  BlockStyle,
  GlobalStyle,
  ResumeBlock,
  ResumeData,
  ResumeSection,
  ResumeSectionType,
  ThemeId,
  TemplateId,
} from '@/types/resume-builder.types';

const defaultGlobalStyle: GlobalStyle = {
  fontSize: 11,
  lineHeight: 1.5,
  fontFamily: 'Inter, sans-serif',
  headingFontFamily: 'Inter, sans-serif',
  page: {
    size: 'A4',
    widthPx: 794,
    minHeightPx: 1123,
    marginX: 24,
    marginY: 24,
  },
  typography: {
    scale: {
      h1: 28,
      h2: 20,
      h3: 16,
      body: 11,
      small: 10,
      lineHeight: 1.5,
      letterSpacing: 0.1,
    },
    paragraphSpacing: 6,
  },
  colors: {
    text: '#111827',
    background: '#ffffff',
  },
};

export const defaultResumeData: ResumeData = {
  id: nanoid(),
  templateId: 'modern-pro',
  layoutId: 'single',
  themeId: 'default',
  metadata: {
    title: 'Untitled Resume',
    role: '',
    locale: 'en',
    version: 1,
    atsFriendly: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  globalStyle: defaultGlobalStyle,
  sections: [],
};

const block = <T>(type: ResumeBlock['type'], content: T, styleProps?: BlockStyle): ResumeBlock<T> => ({
  id: nanoid(),
  type,
  content,
  visible: true,
  order: 0,
  styleProps,
});

const section = (type: ResumeSectionType, title: string, blocks: ResumeBlock[]): ResumeSection => ({
  id: nanoid(),
  type,
  title,
  visible: true,
  order: 0,
  blocks: blocks.map((b, index) => ({ ...b, order: index })),
});

export const buildStarterSections = (): ResumeSection[] => {
  const starter = [
    section('header', 'Header', [
      block('heading', { text: '{{name}}', level: 1 }),
      block('text', { text: '{{email}} • {{phone}} • {{location}}' }),
      block('text', { text: '{{headline}}' }),
    ]),
    section('summary', 'Summary', [
      block('text', {
        text: 'Impact-focused engineer with experience in scalable frontend architecture, performance optimization, and cross-functional delivery.',
      }),
    ]),
    section('experience', 'Experience', [
      block('experience', {
        role: 'Senior Frontend Engineer',
        company: 'FlowCV',
        startDate: '2023',
        endDate: 'Present',
        bullets: [
          'Built dynamic resume rendering pipeline for 100+ templates.',
          'Reduced preview render time by 40% with memoized block graph.',
        ],
      }),
    ]),
    section('education', 'Education', [
      block('education', {
        school: 'State University',
        degree: 'B.S. Computer Science',
        year: '2020',
      }),
    ]),
    section('skills', 'Skills', [
      block('skills', { items: ['React', 'TypeScript', 'TailwindCSS', 'Node.js', 'System Design'] }),
    ]),
    section('social', 'Links', [
      block('social', {
        items: [
          { label: 'LinkedIn', url: 'https://linkedin.com/in/{{name}}' },
          { label: 'GitHub', url: 'https://github.com/{{name}}' },
        ],
      }),
    ]),
  ];

  return starter.map((s, index) => ({ ...s, order: index }));
};

export const createDynamicResume = (
  params?: Partial<Pick<ResumeData, 'layoutId' | 'themeId' | 'templateId'>> & {
    title?: string;
    atsFriendly?: boolean;
  },
): ResumeData => {
  const now = new Date().toISOString();
  return {
    ...defaultResumeData,
    id: nanoid(),
    templateId: (params?.templateId as TemplateId) ?? defaultResumeData.templateId,
    layoutId: params?.layoutId ?? defaultResumeData.layoutId,
    themeId: (params?.themeId as ThemeId) ?? defaultResumeData.themeId,
    metadata: {
      ...defaultResumeData.metadata,
      title: params?.title ?? 'Untitled Resume',
      atsFriendly: params?.atsFriendly ?? true,
      createdAt: now,
      updatedAt: now,
    },
    sections: buildStarterSections(),
  };
};
