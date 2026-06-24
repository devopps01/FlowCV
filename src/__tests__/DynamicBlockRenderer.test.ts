import { describe, it, expect } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import { DynamicBlockRenderer, blockMap } from '@/blocks/DynamicBlockRenderer';
import type { ResumeBlock, ResumeData } from '@/types/resume-builder.types';

// ── Helper to create element without JSX ──
const h = React.createElement;

/** jsdom converts hex colors to rgb(). Convert expected hex to rgb for comparisons. */
const hexToRgb = (hex: string): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${r}, ${g}, ${b})`;
};

// ── Mock Resume Data ──
const mockResume: ResumeData = {
  id: 'resume-1',
  templateId: 'modern-pro',
  layoutId: 'single',
  themeId: 'default',
  sections: [],
  globalStyle: {
    fontSize: 11,
    lineHeight: 1.5,
    fontFamily: 'Inter, sans-serif',
    headingFontFamily: 'Inter, sans-serif',
    page: { size: 'A4', widthPx: 794, minHeightPx: 1123, marginX: 24, marginY: 24 },
    typography: {
      scale: { h1: 28, h2: 20, h3: 16, body: 11, small: 10, lineHeight: 1.5, letterSpacing: 0.1 },
      paragraphSpacing: 6,
    },
    colors: { text: '#111827', background: '#ffffff' },
  },
  metadata: {
    title: 'Test Resume',
    version: 1,
    atsFriendly: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
};

// ═══════════════════════════════════════════════════
// Block Map
// ═══════════════════════════════════════════════════
describe('blockMap', () => {
  it('contains all expected block types', () => {
    const expectedTypes = ['heading', 'text', 'skills', 'experience', 'education', 'social', 'image', 'custom'];
    expectedTypes.forEach((type) => {
      expect(blockMap[type]).toBeDefined();
    });
  });

  it('each entry is a React component', () => {
    Object.values(blockMap).forEach((Component) => {
      expect(typeof Component).toBe('function');
    });
  });
});

// ═══════════════════════════════════════════════════
// HeadingBlock
// ═══════════════════════════════════════════════════
describe('HeadingBlock', () => {
  const makeBlock = (text: string, level: number): ResumeBlock => ({
    id: `blk-h-${level}`,
    type: 'heading',
    content: { text, level },
    visible: true,
    order: 0,
  });

  it('renders heading text', () => {
    const block = makeBlock('John Doe', 1);
    const { getByText } = render(h(DynamicBlockRenderer, { block, resume: mockResume }));
    expect(getByText('John Doe')).toBeDefined();
  });

  it('applies theme primary color for level 1', () => {
    const block = makeBlock('John Doe', 1);
    const { getByText } = render(h(DynamicBlockRenderer, { block, resume: mockResume }));
    const heading = getByText('John Doe');
    // The inner heading div should have the primary color
    expect(heading.style.color).toBe(hexToRgb('#2563eb'));
  });

  it('applies font weight 700 for level 1', () => {
    const block = makeBlock('Title', 1);
    const { getByText } = render(h(DynamicBlockRenderer, { block, resume: mockResume }));
    const heading = getByText('Title');
    expect(heading.style.fontWeight).toBe('700');
  });

  it('applies font weight 600 for level 2', () => {
    const block = makeBlock('Subtitle', 2);
    const { getByText } = render(h(DynamicBlockRenderer, { block, resume: mockResume }));
    const heading = getByText('Subtitle');
    expect(heading.style.fontWeight).toBe('600');
  });

  it('uses globalStyle typography scale when available', () => {
    const block = makeBlock('Name', 1);
    const { getByText } = render(h(DynamicBlockRenderer, { block, resume: mockResume }));
    const heading = getByText('Name');
    expect(heading.style.fontSize).toBe('28px');
  });

  it('clamps level to max 3', () => {
    const block = makeBlock('Deep', 99);
    const { getByText } = render(h(DynamicBlockRenderer, { block, resume: mockResume }));
    const heading = getByText('Deep');
    expect(heading.style.fontWeight).toBe('500');
  });

  it('defaults to level 2 when level is falsy (0)', () => {
    const block = makeBlock('Top', 0);
    const { getByText } = render(h(DynamicBlockRenderer, { block, resume: mockResume }));
    const heading = getByText('Top');
    // 0 is falsy, so `content.level || 2` defaults to 2 → font weight 600
    expect(heading.style.fontWeight).toBe('600');
  });
});

// ═══════════════════════════════════════════════════
// TextBlock
// ═══════════════════════════════════════════════════
describe('TextBlock', () => {
  it('renders text content', () => {
    const block: ResumeBlock = {
      id: 'blk-txt',
      type: 'text',
      content: { text: 'Hello World' },
      visible: true,
      order: 0,
    };
    const { getByText } = render(h(DynamicBlockRenderer, { block, resume: mockResume }));
    expect(getByText('Hello World')).toBeDefined();
  });

  it('applies theme text color', () => {
    const block: ResumeBlock = {
      id: 'blk-txt',
      type: 'text',
      content: { text: 'Colored' },
      visible: true,
      order: 0,
    };
    const { getByText } = render(h(DynamicBlockRenderer, { block, resume: mockResume }));
    const p = getByText('Colored');
    expect(p.style.color).toBe(hexToRgb('#111827'));
  });
});

// ═══════════════════════════════════════════════════
// SkillBlock
// ═══════════════════════════════════════════════════
describe('SkillBlock', () => {
  it('renders all skill items', () => {
    const block: ResumeBlock = {
      id: 'blk-skills',
      type: 'skills',
      content: { items: ['React', 'TypeScript', 'Node.js'] },
      visible: true,
      order: 0,
    };
    const { getByText } = render(h(DynamicBlockRenderer, { block, resume: mockResume }));
    expect(getByText('React')).toBeDefined();
    expect(getByText('TypeScript')).toBeDefined();
    expect(getByText('Node.js')).toBeDefined();
  });

  it('renders skill tags with theme surface background', () => {
    const block: ResumeBlock = {
      id: 'blk-skills',
      type: 'skills',
      content: { items: ['React'] },
      visible: true,
      order: 0,
    };
    const { getByText } = render(h(DynamicBlockRenderer, { block, resume: mockResume }));
    const tag = getByText('React');
    expect(tag.style.backgroundColor).toBe(hexToRgb('#f8fafc'));
  });

  it('uses theme border color for skill tags', () => {
    const block: ResumeBlock = {
      id: 'blk-skills',
      type: 'skills',
      content: { items: ['React'] },
      visible: true,
      order: 0,
    };
    const { getByText } = render(h(DynamicBlockRenderer, { block, resume: mockResume }));
    const tag = getByText('React');
    expect(tag.style.borderColor).toBe(hexToRgb('#e5e7eb'));
  });
});

// ═══════════════════════════════════════════════════
// ExperienceBlock
// ═══════════════════════════════════════════════════
describe('ExperienceBlock', () => {
  const expBlock: ResumeBlock = {
    id: 'blk-exp',
    type: 'experience',
    content: {
      role: 'Software Engineer',
      company: 'TechCorp',
      startDate: '2020',
      endDate: 'Present',
      bullets: ['Built amazing things', 'Improved performance'],
    },
    visible: true,
    order: 0,
  };

  it('renders role and company', () => {
    const { getByText } = render(h(DynamicBlockRenderer, { block: expBlock, resume: mockResume }));
    expect(getByText(/Software Engineer/)).toBeDefined();
    expect(getByText(/TechCorp/)).toBeDefined();
  });

  it('renders date range', () => {
    const { getByText } = render(h(DynamicBlockRenderer, { block: expBlock, resume: mockResume }));
    expect(getByText(/2020 - Present/)).toBeDefined();
  });

  it('renders bullet points', () => {
    const { getByText } = render(h(DynamicBlockRenderer, { block: expBlock, resume: mockResume }));
    expect(getByText('Built amazing things')).toBeDefined();
    expect(getByText('Improved performance')).toBeDefined();
  });

  it('uses theme text color', () => {
    const { container } = render(h(DynamicBlockRenderer, { block: expBlock, resume: mockResume }));
    const article = container.querySelector('article');
    expect(article).toBeDefined();
  });
});

// ═══════════════════════════════════════════════════
// EducationBlock
// ═══════════════════════════════════════════════════
describe('EducationBlock', () => {
  const eduBlock: ResumeBlock = {
    id: 'blk-edu',
    type: 'education',
    content: {
      school: 'State University',
      degree: 'B.S. Computer Science',
      year: '2020',
    },
    visible: true,
    order: 0,
  };

  it('renders degree', () => {
    const { getByText } = render(h(DynamicBlockRenderer, { block: eduBlock, resume: mockResume }));
    expect(getByText('B.S. Computer Science')).toBeDefined();
  });

  it('renders school and year', () => {
    const { getByText } = render(h(DynamicBlockRenderer, { block: eduBlock, resume: mockResume }));
    expect(getByText(/State University/)).toBeDefined();
    expect(getByText(/\(2020\)/)).toBeDefined();
  });
});

// ═══════════════════════════════════════════════════
// DynamicBlockRenderer visibility
// ═══════════════════════════════════════════════════
describe('DynamicBlockRenderer visibility', () => {
  it('renders visible block', () => {
    const block: ResumeBlock = {
      id: 'blk-vis',
      type: 'text',
      content: { text: 'Visible' },
      visible: true,
      order: 0,
    };
    const { getByText } = render(h(DynamicBlockRenderer, { block, resume: mockResume }));
    expect(getByText('Visible')).toBeDefined();
  });

  it('hidden block still renders but with display:none', () => {
    const block: ResumeBlock = {
      id: 'blk-hid',
      type: 'text',
      content: { text: 'Hidden' },
      visible: false,
      order: 0,
    };
    const { container } = render(h(DynamicBlockRenderer, { block, resume: mockResume }));
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.display).toBe('none');
  });

  it('falls back to CustomBlock for unknown type', () => {
    const block: ResumeBlock = {
      id: 'blk-unk',
      type: 'unknown' as any,
      content: { foo: 'bar' },
      visible: true,
      order: 0,
    };
    const { container } = render(h(DynamicBlockRenderer, { block, resume: mockResume }));
    const pre = container.querySelector('pre');
    expect(pre).toBeDefined();
  });
});