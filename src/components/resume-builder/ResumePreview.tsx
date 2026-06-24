'use client';

import React from 'react';
import { createDynamicResume } from '@/core/resumeFactory';
import { DynamicResumePreview } from '@/preview/DynamicResumePreview';
import type { LayoutId, ResumeBlock, ResumeData, ResumeSection, ThemeId } from '@/types/resume-builder.types';
import '@/styles/resume-engine.css';

interface ResumePreviewProps {
  data: any;
  numPages?: number;
  previewRef?: React.RefObject<HTMLDivElement>;
  zoomLevel?: number;
  onReorderSections?: (newOrder: string[]) => void;
  isThumbnail?: boolean;
  isExporting?: boolean;
  selectedSectionId?: string | null;
  onSelectSection?: (sid: string) => void;
  onPageCountChange?: (count: number) => void;
  updateNested?: (path: string, value: any) => void;
  contentWidth?: number;
}

const MM_TO_PX = 3.7795;

interface PageSizeDef {
  label: string;
  widthMm: number;
  heightMm: number;
  widthPx: number;
  heightPx: number;
}

const PAGE_SIZES: Record<string, PageSizeDef> = {
  a4: {
    label: 'A4 (210×297mm)',
    widthMm: 210,
    heightMm: 297,
    widthPx: 794,
    heightPx: 1123,
  },

  letter: {
    label: 'Letter (8.5×11in)',
    widthMm: 216,
    heightMm: 279,
    widthPx: 816,
    heightPx: 1056,
  },

  legal: {
    label: 'Legal (8.5×14in)',
    widthMm: 216,
    heightMm: 356,
    widthPx: 816,
    heightPx: 1344,
  },

  a3: {
    label: 'A3 (297×420mm)',
    widthMm: 297,
    heightMm: 420,
    widthPx: 1123,
    heightPx: 1587,
  },

  b5: {
    label: 'B5 (176×250mm)',
    widthMm: 176,
    heightMm: 250,
    widthPx: 665,
    heightPx: 945,
  },

  a5: {
    label: 'A5 (148×210mm)',
    widthMm: 148,
    heightMm: 210,
    widthPx: 559,
    heightPx: 794,
  },
};

const PAGE_GAP_PX = 20;

const SIDEBAR_CUSTOM_TITLES = new Set(['certifications', 'interests', 'courses', 'awards']);
const SIDEBAR_TYPES = new Set(['skills', 'social', 'languages', 'certifications', 'header']);

const isSidebarSection = (s: ResumeSection): boolean => {
  if (SIDEBAR_TYPES.has(s.type)) return true;
  if (s.type === 'custom') return SIDEBAR_CUSTOM_TITLES.has(s.title.toLowerCase());
  return false;
};

const normalizeSections = (legacy: any): ResumeSection[] => {
  const sections: ResumeSection[] = [];
  let order = 0;
  const content = legacy?.content || {};
  const activeSections: string[] = legacy?.activeSections || ['summary', 'experience', 'education', 'skills'];

  // Stable IDs: use a counter instead of Date.now() so style override paths remain
  // consistent across re-renders. Date.now() changed every render, making saved
  // styleOverrides unreachable because their keys no longer matched.
  let sectionIdx = 0;
  let blockIdx = 0;
  const pushSection = (section: Omit<ResumeSection, 'id' | 'order'>) => {
    sections.push({ ...section, order: order++, id: `s-${section.type || 'custom'}-${sectionIdx++}` });
  };
  const bId = (prefix: string) => `b-${prefix}-${blockIdx++}`;

  const stripHtml = (html: string): string => {
    if (!html) return '';
    const a = String.fromCharCode(38);
    const l = String.fromCharCode(60);
    const g = String.fromCharCode(62);
    let text = html
      .replace(new RegExp(l + 'br[^' + g + ']*' + g, 'gi'), '\n')
      .replace(new RegExp(l + '/p' + g, 'gi'), '\n')
      .replace(new RegExp(l + '/li' + g, 'gi'), '\n')
      .replace(new RegExp(l + 'li[^' + g + ']*' + g, 'gi'), '\n')
      .replace(/<[^>]+>/g, '')
      .replace(new RegExp(a + 'amp;', 'g'), a)
      .replace(new RegExp(a + 'lt;', 'g'), l)
      .replace(new RegExp(a + 'gt;', 'g'), g)
      .replace(new RegExp(a + 'nbsp;', 'g'), ' ')
      .replace(new RegExp(a + 'quot;', 'g'), '"')
      .replace(new RegExp(a + '#x27;', 'g'), "'")
      .replace(new RegExp(a + '#39;', 'g'), "'");
    return text.trim();
  };

  const contactBlocks: ResumeBlock[] = [];
  if (content.personalInfo?.email) contactBlocks.push({ id: bId('email'), type: 'text' as const, content: { text: content.personalInfo.email, _editPath: 'content.personalInfo.email' }, visible: true, order: 0 });
  if (content.personalInfo?.phone) contactBlocks.push({ id: bId('phone'), type: 'text' as const, content: { text: content.personalInfo.phone, _editPath: 'content.personalInfo.phone' }, visible: true, order: 1 });
  if (content.personalInfo?.location) contactBlocks.push({ id: bId('location'), type: 'text' as const, content: { text: content.personalInfo.location, _editPath: 'content.personalInfo.location' }, visible: true, order: 2 });

  const imageBlock = content.personalInfo?.image || content.personalInfo?.photo ? [{
    id: bId('photo') as string,
    type: 'image' as const,
    content: { src: content.personalInfo?.image || content.personalInfo?.photo || '', alt: content.personalInfo?.fullName || 'Profile', _editPath: 'content.personalInfo.image' },
    visible: true,
    order: -1,
  }] : [];

  const headerBlocks: ResumeBlock[] = [
    ...imageBlock,
    { id: bId('name'), type: 'heading', content: { text: content.personalInfo?.fullName || '', level: 1, _editPath: 'content.personalInfo.fullName' }, visible: true, order: 0 },
    { id: bId('title'), type: 'text', content: { text: content.personalInfo?.professionalTitle || '', _editPath: 'content.personalInfo.professionalTitle' }, visible: true, order: 1 },
    ...contactBlocks,
  ];
  pushSection({ type: 'header', title: 'Header', visible: true, blocks: headerBlocks });

  if (content.personalInfo?.summary && stripHtml(content.personalInfo.summary).trim()) {
    pushSection({ type: 'summary', title: 'Summary', visible: true, blocks: [{ id: bId('summary'), type: 'text', content: { text: stripHtml(content.personalInfo.summary), _editPath: 'content.personalInfo.summary' }, visible: true, order: 0 }] });
  }

  if (activeSections.includes('experience') && Array.isArray(content.experience)) {
    const visibleBlocks = content.experience.map((exp: any, idx: number) => ({
      id: bId('exp'), type: 'experience' as const,
      content: { role: exp.position || '', company: exp.company || '', startDate: exp.startDate || '', endDate: exp.endDate || '', bullets: typeof exp.description === 'string' ? stripHtml(exp.description).split('\n').filter(Boolean).map(s => s.replace(/^-\s*/, '')) : [], _editPath: `content.experience.${idx}.position` },
      visible: exp.hidden !== true, order: idx,
    })).filter((b: any) => (b.content as any).role || (b.content as any).company || ((b.content as any).bullets?.length));
    if (visibleBlocks.length > 0) pushSection({ type: 'experience', title: 'Experience', visible: true, blocks: visibleBlocks });
  }

  if (activeSections.includes('education') && Array.isArray(content.education)) {
    pushSection({ type: 'education', title: 'Education', visible: true, blocks: content.education.map((edu: any, idx: number) => ({ id: bId('edu'), type: 'education', content: { school: edu.school || '', degree: edu.degree || '', year: edu.graduationYear || '', field: edu.field || '', _editPath: `content.education.${idx}.degree` }, visible: edu.hidden !== true, order: idx })) });
  }

  if (activeSections.includes('skills') && Array.isArray(content.skills)) {
    const vs = content.skills.filter((s: any) => s.hidden !== true);
    if (vs.length > 0) pushSection({ type: 'skills', title: 'Skills', visible: true, blocks: [{ id: bId('skills'), type: 'skills', content: { items: vs.map((s: any) => typeof s === 'string' ? s : s.name).filter(Boolean), _editPath: 'content.skills' }, visible: true, order: 0 }] });
  }

  if (activeSections.includes('languages') && Array.isArray(content.languages)) {
    const v = content.languages.filter((l: any) => l.hidden !== true);
    if (v.length > 0) pushSection({ type: 'languages', title: 'Languages', visible: true, blocks: [{ id: bId('lang'), type: 'skills', content: { items: v.map((l: any) => [l.language, l.proficiency].filter(Boolean).join(' \u2014 ')).filter(Boolean), _editPath: 'content.languages' }, visible: true, order: 0 }] });
  }

  if (activeSections.includes('certifications') && Array.isArray(content.certifications)) {
    const v = content.certifications.filter((c: any) => c.hidden !== true);
    if (v.length > 0) pushSection({ type: 'custom', title: 'Certifications', visible: true, blocks: v.map((cert: any, idx: number) => ({ id: bId('cert'), type: 'education', content: { school: cert.issuer || '', degree: cert.name || '', year: cert.date || '', _editPath: `content.certifications.${idx}.name`, _editPathSecondary: `content.certifications.${idx}.issuer` }, visible: true, order: idx })) });
  }

  if (activeSections.includes('projects') && Array.isArray(content.projects)) {
    const v = content.projects.filter((p: any) => p.hidden !== true);
    if (v.length > 0) pushSection({ type: 'custom', title: 'Projects', visible: true, blocks: v.map((proj: any, idx: number) => ({ id: bId('proj'), type: 'experience', content: { role: proj.name || '', company: Array.isArray(proj.technologies) ? proj.technologies.join(', ') : '', startDate: '', endDate: '', bullets: typeof proj.description === 'string' ? stripHtml(proj.description).split('\n').filter(Boolean).map(s => s.replace(/^-\s*/, '')) : [], _editPath: `content.projects.${idx}.name` }, visible: true, order: idx })) });
  }

  if (activeSections.includes('awards') && Array.isArray(content.awards)) {
    const v = content.awards.filter((a: any) => a.hidden !== true);
    if (v.length > 0) pushSection({ type: 'custom', title: 'Awards', visible: true, blocks: v.map((award: any, idx: number) => ({ id: bId('award'), type: 'education', content: { school: award.issuer || '', degree: award.title || '', year: award.date || '', _editPath: `content.awards.${idx}.title`, _editPathSecondary: `content.awards.${idx}.issuer` }, visible: true, order: idx })) });
  }

  if (activeSections.includes('interests') && Array.isArray(content.interests)) {
    const v = content.interests.filter((i: any) => i.hidden !== true);
    if (v.length > 0) pushSection({ type: 'custom', title: 'Interests', visible: true, blocks: [{ id: bId('interests'), type: 'skills', content: { items: v.map((i: any) => i.name || '').filter(Boolean), _editPath: 'content.interests' }, visible: true, order: 0 }] });
  }

  if (activeSections.includes('courses') && Array.isArray(content.courses)) {
    const v = content.courses.filter((c: any) => c.hidden !== true);
    if (v.length > 0) pushSection({ type: 'custom', title: 'Courses', visible: true, blocks: v.map((course: any, idx: number) => ({ id: bId('course'), type: 'education', content: { school: course.provider || '', degree: course.title || '', year: course.date || '', _editPath: `content.courses.${idx}.title`, _editPathSecondary: `content.courses.${idx}.provider` }, visible: true, order: idx })) });
  }

  if (activeSections.includes('organisations') && Array.isArray(content.organisations)) {
    const v = content.organisations.filter((o: any) => o.hidden !== true);
    if (v.length > 0) pushSection({ type: 'custom', title: 'Organisations', visible: true, blocks: v.map((org: any, idx: number) => ({ id: bId('org'), type: 'experience', content: { role: org.role || '', company: org.name || '', startDate: org.startDate || '', endDate: org.endDate || '', bullets: typeof org.description === 'string' ? stripHtml(org.description).split('\n').filter(Boolean).map(s => s.replace(/^-\s*/, '')) : [], _editPath: `content.orgs.${idx}.role` }, visible: true, order: idx })) });
  }

  if (activeSections.includes('publications') && Array.isArray(content.publications)) {
    const v = content.publications.filter((p: any) => p.hidden !== true);
    if (v.length > 0) pushSection({ type: 'custom', title: 'Publications', visible: true, blocks: v.map((pub: any, idx: number) => ({ id: bId('pub'), type: 'experience', content: { role: pub.title || '', company: pub.publisher || '', startDate: pub.date || '', endDate: '', bullets: typeof pub.description === 'string' ? stripHtml(pub.description).split('\n').filter(Boolean).map(s => s.replace(/^-\s*/, '')) : [], _editPath: `content.publications.${idx}.title` }, visible: true, order: idx })) });
  }

  if (activeSections.includes('references') && Array.isArray(content.references)) {
    const v = content.references.filter((r: any) => r.hidden !== true);
    if (v.length > 0) pushSection({ type: 'custom', title: 'References', visible: true, blocks: [{ id: bId('ref'), type: 'skills', content: { items: v.map((ref: any) => [ref.name, ref.position, ref.company].filter(Boolean).join(' — ')).filter(Boolean), _editPath: 'content.references' }, visible: true, order: 0 }] });
  }

  if (activeSections.includes('socials') && Array.isArray(content.socials)) {
    const v = content.socials.filter((s: any) => s.hidden !== true);
    if (v.length > 0) pushSection({ type: 'custom', title: 'Links', visible: true, blocks: [{
      id: bId('social'),
      type: 'social',
      content: {
        items: v.map((s: any) => ({ label: s.label || s.platform || '', url: s.url || '' })),
        _editPath: 'content.socials',
      },
      visible: true,
      order: 0,
    }] });
  }

  if (activeSections.includes('custom') && Array.isArray(content.custom)) {
    const v = content.custom.filter((c: any) => c.hidden !== true);
    if (v.length > 0) v.forEach((custom: any, idx: number) => { pushSection({ type: 'custom', title: custom.title || 'Custom', visible: true, blocks: [{ id: bId('custom'), type: 'text', content: { text: custom.content || '', _editPath: `content.custom.${idx}.content` }, visible: true, order: 0 }] }); });
  }

  if (activeSections.includes('declaration') && content.declaration?.text) {
    pushSection({ type: 'custom', title: 'Declaration', visible: true, blocks: [{ id: bId('declaration'), type: 'text', content: { text: [content.declaration.text, content.declaration.signature ? `Signature: ${content.declaration.signature}` : '', content.declaration.date ? `Date: ${content.declaration.date}` : '', content.declaration.place ? `Place: ${content.declaration.place}` : ''].filter(Boolean).join('\n'), _editPath: 'content.declaration.text' }, visible: true, order: 0 }] });
  }

  return sections;
};

const toLayout = (layout: string | undefined): LayoutId => {
  if (!layout) return 'single';
  const l = layout.toLowerCase();
  if (l.startsWith('single-') || l === 'single') return 'single';
  if (l.startsWith('sidebar-') || l === 'sidebar') return 'sidebar';
  if (l.startsWith('two-column-') || l === 'two-column' || l.startsWith('double-header-') || l === 'double-header') return 'double';
  if (l.startsWith('modern-header-') || l === 'modern-header') return 'modern';
  if (l === 'modern' || l.startsWith('modern-')) return 'modern';
  if (l === 'creative' || l.startsWith('creative-')) return 'creative';
  if (l === 'ats' || l.startsWith('ats-')) return 'ats';
  if (l === 'compact' || l.startsWith('compact-')) return 'compact';
  if (l === 'double' || l.startsWith('double-')) return 'double';
  if (l.startsWith('timeline-') || l === 'timeline') return 'double';
  if (l.startsWith('card-') || l === 'card' || l.startsWith('infographic-') || l === 'infographic') return 'creative';
  return 'single';
};

const toTheme = (layoutId: LayoutId): ThemeId => {
  if (layoutId === 'creative') return 'creative';
  if (layoutId === 'ats') return 'ats';
  if (layoutId === 'modern') return 'default';
  return 'executive';
};

const headingSizeMultiplier: Record<string, number> = { s: 0, m: 2, l: 4, xl: 6 };

/** Compute globalStyle from design settings — used in both code paths */
const computeGlobalStyle = (design: any) => {
  const baseFontSize = design.fontSize || 10.5;
  const headingMult = headingSizeMultiplier[design.headingSize || 'm'] || 2;
  const mlRounded = Math.round((design.marginLR ?? 10) * MM_TO_PX);
  const mtRounded = Math.round((design.marginTB ?? 10) * MM_TO_PX);
  const pageSizeKey = design.pageSize || 'a4';
  const pageSizeDef = PAGE_SIZES[pageSizeKey] || PAGE_SIZES.a4;
  return {
    typography: {
      body: baseFontSize,
      small: Math.max(baseFontSize - 1.5, 8),
      h3: baseFontSize + headingMult,
      h2: baseFontSize + headingMult + 2,
      h1: baseFontSize + headingMult + 4,
      lineHeight: design.lineHeight || 1.45,
      letterSpacing: 0.1,
    } as any,
    page: {
      size: design.pageSize === 'letter' ? 'Letter' as const : 'A4' as const,
      widthPx: pageSizeDef.widthPx - mlRounded * 2,
      minHeightPx: pageSizeDef.heightPx - mtRounded * 2,
      marginX: design.marginLR ?? 12,
      marginY: design.marginTB ?? 16,
    },
    spacing: {
      sectionGap: design.sectionSpacing != null ? design.sectionSpacing * MM_TO_PX : 0,
      blockGap: design.entrySpacing != null ? design.entrySpacing * MM_TO_PX : 8,
      pagePaddingX: 0,
      pagePaddingY: 0,
    },
    fonts: {
      body: `'${design.fontFamily || 'Inter'}', sans-serif`,
      heading: `'${design.fontFamily || 'Inter'}', sans-serif`,
    },
    colors: {
      primary: design.primaryColor || '#2563eb',
      secondary: design.secondaryColor || design.primaryColor || '#4f46e5',
      accent: design.accentColor || design.primaryColor || '#06b6d4',
      text: design.textColor || '#111827',
      textMuted: design.textColor ? adjustBrightness(design.textColor, 40) : '#4b5563',
      background: design.backgroundColor || '#ffffff',
      surface: design.backgroundColor === '#ffffff' ? '#f8fafc' : adjustBrightness(design.backgroundColor || '#ffffff', 5),
      border: design.borderColor || adjustBrightness(design.textColor || '#111827', -60),
    },
  };
};

/**
 * Ensure every block has a valid _editPath so the inline editor can save/read style overrides.
 * Without this, clicking on custom section content (e.g. KEY ACHIEVEMENT paragraph) would
 * find an empty path and style overrides would not persist or apply.
 *
 * Paths MUST match those generated by normalizeSections so styleOverrides saved via
 * the InlineEditor (which uses data-edit-path from the DOM) can be found by
 * getStyleOverrideForPath in DynamicBlockRenderer.
 */
const ensureBlockEditPaths = (resume: ResumeData): ResumeData => {
  const sections = (resume as any).sections;
  if (!Array.isArray(sections)) return resume;

  for (const section of sections) {
    if (!Array.isArray(section.blocks)) continue;
    for (let blockIdx = 0; blockIdx < section.blocks.length; blockIdx++) {
      const block = section.blocks[blockIdx];
      const content = block.content as any;
      if (!content) continue;

      // If _editPath is already set, skip
      if (content._editPath) continue;

      // Generate a path based on section type and block position.
      // These paths MUST stay consistent with normalizeSections so styleOverrides
      // saved via the InlineEditor (which uses data-edit-path from the DOM) can be
      // found by getStyleOverrideForPath in DynamicBlockRenderer.
      const sectionType = section.type || 'custom';

      if (sectionType === 'summary') {
        content._editPath = 'content.personalInfo.summary';
      } else if (sectionType === 'experience') {
        content._editPath = `content.experience.${blockIdx}.position`;
      } else if (sectionType === 'education') {
        content._editPath = `content.education.${blockIdx}.degree`;
      } else if (sectionType === 'skills') {
        content._editPath = 'content.skills';
      } else if (sectionType === 'languages') {
        content._editPath = 'content.languages';
      } else if (sectionType === 'header') {
        // For header blocks, try to infer from block content
        if (block.type === 'heading') {
          content._editPath = 'content.personalInfo.fullName';
        } else {
          content._editPath = `content.personalInfo.${block.type === 'text' ? 'professionalTitle' : 'fullName'}`;
        }
      } else {
        // For custom sections (certifications, projects, awards, courses, organisations, etc.)
        // use a stable content-based path instead of section-ID-based paths which
        // change across renders (sections use Date.now() in their IDs).
        content._editPath = `content.${section.title.toLowerCase()}.${blockIdx}.content`;
      }
    }
  }
  return resume;
};

/**
 * Backwards-compat migration: converts old-format Languages sections into the new
 * `skills` block format so design controls (Style/Columns/Gap/etc.) take effect.
 *
 * Handles three legacy shapes:
 *  1. One text block per language (e.g. one text block "English — Native")
 *  2. A single text block with the languages joined by " · " or " • " or ", "
 *  3. A single text block where each line is a language
 */
const migrateOldLanguagesFormat = (data: any): void => {
  const sections = (data as any).sections;
  if (!Array.isArray(sections)) return;
  for (let s = 0; s < sections.length; s++) {
    const sec = sections[s];
    if (!sec || sec.type !== 'languages' || !Array.isArray(sec.blocks) || sec.blocks.length === 0) continue;

    // Skip if already migrated (first block is type 'skills')
    if (sec.blocks[0]?.type === 'skills') continue;

    // Case 1: Multiple text blocks (old format — one per language)
    const allTextBlocks = sec.blocks.filter((b: any) => b.type === 'text' && b.content && typeof b.content.text === 'string');
    if (allTextBlocks.length > 1) {
      const items = allTextBlocks.map((b: any) => b.content.text.trim()).filter(Boolean);
      if (items.length > 0) {
        sec.blocks = [{
          id: `b-lang-${s}`,
          type: 'skills',
          content: { items, _editPath: 'content.languages' },
          visible: true,
          order: 0,
        }];
      }
      continue;
    }

    // Case 2/3: A single text block — try to split on common separators / newlines
    if (allTextBlocks.length === 1) {
      const raw = (allTextBlocks[0].content.text || '').trim();
      if (raw) {
        // Split on " · " (most common), " • ", ", " or newline — then filter empties
        const items = raw
          .split(/\s+[\u00b7\u2022]\s+|\s*,\s+|\r?\n+/g)
          .map((t: string) => t.trim())
          .filter(Boolean);
        if (items.length > 0) {
          sec.blocks = [{
            id: `b-lang-${s}`,
            type: 'skills',
            content: { items, _editPath: 'content.languages' },
            visible: true,
            order: 0,
          }];
        }
      }
    }
  }
};

const normalizeResume = (data: any): ResumeData => {
  const design = data?.design || {};

  // Compute globalStyle from design settings BEFORE any early return
  const computedStyle = computeGlobalStyle(design);

  // If data already has full resume structure, merge computed styles and return
  if (data?.sections && data?.layoutId && data?.themeId && data?.templateId) {
    const result = { ...data } as ResumeData;
    if (data.styleOverrides && !(result as any).styleOverrides) {
      (result as any).styleOverrides = data.styleOverrides;
    }
    // Migrate old-format Languages sections to new skills-block format
    migrateOldLanguagesFormat(result);
    // Ensure all blocks have valid _editPath for inline editor style overrides
    ensureBlockEditPaths(result);
    // Merge computed globalStyle over existing globalStyle
    result.globalStyle = { ...result.globalStyle, ...computedStyle };
    (result as any).__design = design;
    return result;
  }

  const layoutId = toLayout(data?.design?.layout);
  const resume = {
    ...createDynamicResume({ title: data?.title || 'Untitled Resume', layoutId, themeId: toTheme(layoutId), templateId: data?.template === 'ats' ? 'ats-pro' : 'modern-pro' }),
    sections: normalizeSections(data),
    ...(data?.styleOverrides ? { styleOverrides: data.styleOverrides } : {}),
  };
  resume.globalStyle = { ...resume.globalStyle, ...computedStyle };
  (resume as any).__design = design;
  return resume;
};

function adjustBrightness(hex: string, amount: number): string {
  const h = hex.replace('#', '');
  return `#${Math.min(255, Math.max(0, parseInt(h.slice(0, 2), 16) + amount)).toString(16).padStart(2, '0')}${Math.min(255, Math.max(0, parseInt(h.slice(2, 4), 16) + amount)).toString(16).padStart(2, '0')}${Math.min(255, Math.max(0, parseInt(h.slice(4, 6), 16) + amount)).toString(16).padStart(2, '0')}`;
}

/* ─── Page Footer Component ─── */
const PageFooter: React.FC<{
  resume: ResumeData;
  pageIndex: number;
  totalPages: number;
  pageSize: PageSizeDef;
  marginLeftPx: number;
  marginRightPx: number;
}> = ({ resume, pageIndex, totalPages, pageSize, marginLeftPx, marginRightPx }) => {
  const design = (resume as any).__design || {};
  const colors = (resume as any).globalStyle?.colors || {};

  const showPageNumbers = design?.showPageNumbers !== false && totalPages > 1;
  const showEmail = design?.showEmailInFooter || false;
  const showName = design?.showNameInFooter || false;

  let footerName = '';
  let footerEmail = '';
  if (showName || showEmail) {
    for (const section of resume.sections) {
      for (const block of section.blocks) {
        if (block.type === 'heading' && block.content && (block.content as any).level === 1) {
          footerName = (block.content as any).text || '';
        }
        if (block.type === 'text' && (block.content as any)._editPath?.includes('email')) {
          footerEmail = (block.content as any).text || '';
        }
      }
    }
  }

  const footerParts: string[] = [];
  if (showName && footerName) footerParts.push(footerName);
  if (showEmail && footerEmail) footerParts.push(footerEmail);

  if (!showPageNumbers && footerParts.length === 0) return null;

  return (
    <div style={{
      position: 'absolute', bottom: '8px', left: `${marginLeftPx}px`, right: `${marginRightPx}px`,
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      fontSize: '8px', color: '#999', fontFamily: 'system-ui, sans-serif', letterSpacing: '0.3px',
    }}>
      <span>{footerParts.join('  |  ')}</span>
      {showPageNumbers && <span>{pageIndex + 1} / {totalPages}</span>}
    </div>
  );
};

/* ══════════════════════════════════════════════════════
   PaginatedContent — paginate ALL sections by height
   ══════════════════════════════════════════════════════ */
const PaginatedContent: React.FC<{
  resume: ResumeData;
  onPageCountChange: (count: number) => void;
  zoomLevel: number;
}> = ({ resume, onPageCountChange, zoomLevel }) => {
  const measureRef = React.useRef<HTMLDivElement>(null);
  const [pages, setPages] = React.useState<ResumeSection[][]>([resume.sections]);

  const design = (resume as any).__design || {};
  const pageSizeKey = design.pageSize || 'a4';
  const pageSize = PAGE_SIZES[pageSizeKey] || PAGE_SIZES.a4;

  // Use user's margin settings, but default to 10mm (was 12mm) to reduce wasted space.
  // marginLR and marginTB are in mm. MM_TO_PX = 3.7795.
  const userMarginTB = design.marginTB ?? 10;
  const userMarginLR = design.marginLR ?? 10;
  const marginTopPx = Math.round(userMarginTB * MM_TO_PX);
  const footerReserved = (design.showPageNumbers || design.showEmailInFooter || design.showNameInFooter) ? 20 : 2;
  const marginBottomPx = Math.round(userMarginTB * MM_TO_PX) + footerReserved;
  const marginLeftPx = Math.round(userMarginLR * MM_TO_PX);
  const marginRightPx = Math.round(userMarginLR * MM_TO_PX);
  const contentWidth = pageSize.widthPx - marginLeftPx - marginRightPx;
  // Safety margin for font rendering tolerance between measurement and rendering.
  // Subtracts extra px from available height so the last row of content never
  // gets clipped at the bottom of the page (it gets pushed to the next page).
  const safetyMargin = 48;
  const availableHeight = pageSize.heightPx - marginTopPx - marginBottomPx - safetyMargin;

  const isSidebarLayout = resume.layoutId === 'sidebar';

  const measureStyle: React.CSSProperties = React.useMemo(() => ({
    width: `${contentWidth}px`,
    position: 'absolute',
    left: '-9999px',
    top: 0,
    opacity: 0,
    pointerEvents: 'none',
  }), [contentWidth]);

  // After measurement is done, we need to re-render at actual page size to verify
  const [verified, setVerified] = React.useState(false);
  React.useEffect(() => {
    if (measureRef.current && !verified) {
      // After initial measure, set verified so next render uses page-constrained measurement
      setVerified(true);
    }
  }, [verified]);

  React.useEffect(() => {
    if (!measureRef.current) return;
    const container = measureRef.current;

    const doMeasure = () => {
      if (!container) return;

      const allSections = resume.sections.filter((s) => s.visible);
      if (allSections.length === 0) {
        setPages([resume.sections]);
        onPageCountChange?.(1);
        return;
      }

      const sectionHeightMap = new Map<string, number>();
      const blockHeightMap = new Map<string, number>();
      const sectionBlockIdsMap = new Map<string, string[]>();
      const sectionTitleHeightMap = new Map<string, number>();
      const BLOCK_GAP_PX = 4;

      const measureColumn = (col: Element | null) => {
        if (!col) return;
        col.querySelectorAll('[data-resume-section]').forEach((sectionEl) => {
          const sectionId = sectionEl.getAttribute('data-resume-section');
          if (!sectionId) return;
          sectionHeightMap.set(sectionId, (sectionEl as HTMLElement).getBoundingClientRect().height);
          const titleEl = sectionEl.querySelector('[data-resume-section-header]');
          if (titleEl) sectionTitleHeightMap.set(sectionId, (titleEl as HTMLElement).getBoundingClientRect().height);
          const blockIds: string[] = [];
          sectionEl.querySelectorAll('[data-resume-block]').forEach((blockEl) => {
            const blockId = blockEl.getAttribute('data-resume-block');
            if (blockId) { blockHeightMap.set(blockId, (blockEl as HTMLElement).getBoundingClientRect().height); blockIds.push(blockId); }
          });
          sectionBlockIdsMap.set(sectionId, blockIds);
        });
      };

      if (isSidebarLayout) {
        measureColumn(container.querySelector('.sidebar-column'));
        measureColumn(container.querySelector('.main-column'));
      }
      if (sectionHeightMap.size === 0) measureColumn(container);
      if (sectionHeightMap.size === 0) { setPages([resume.sections]); onPageCountChange?.(1); return; }

      const newPages: ResumeSection[][] = [];

      // ORPHAN_THRESHOLD: minimum lines to leave at bottom of page before triggering a page break.
      // If fewer than this many lines would remain after placing a block, pull the block to the next page.
      const ORPHAN_THRESHOLD = 16;

      // WIDOW_THRESHOLD: minimum space (px) that must remain after a section title for it to stay on the current page.
      // If the title + first block would overflow, move the entire section to the next page.
      const WIDOW_THRESHOLD = 40;

      /**
       * Split a section at block level.
       * Core rule: content MUST NEVER be hidden. Only blocks that truly fit
       * (measured height ≤ remaining space) are kept on current page.
       * Remaining blocks get _continued: true for the next page.
       */
      const splitSectionBlocks = (section: ResumeSection, curH: number) => {
        const visibleBlocks = section.blocks.filter((b) => b.visible).sort((a, b) => a.order - b.order);
        const blockIds = sectionBlockIdsMap.get(section.id) || [];
        const blockObjMap = new Map(visibleBlocks.map((b) => [b.id, b]));
        const titleH = sectionTitleHeightMap.get(section.id) || 0;
        const isContinued = !!(section as any)._continued;

        // Build ordered blocks with their measured heights
        const orderedBlocks: { block: typeof visibleBlocks[0]; height: number }[] = [];
        for (const blockId of blockIds) {
          const block = blockObjMap.get(blockId);
          if (!block) continue;
          orderedBlocks.push({ block, height: blockHeightMap.get(blockId) || 40 });
        }

        // If literally no space left, everything goes to next page
        if (curH >= availableHeight) {
          return { fitting: { ...section, blocks: [] }, remainder: section };
        }

        let fittingBlocks: typeof visibleBlocks = [];
        let tempH = curH;

        // Track whether we ever push the space past the available height
        let anyFitted = false;

        // For continued sections, skip title (already rendered on previous page).
        // For fresh sections, try to fit the title.
        if (!isContinued) {
          if (titleH > 0 && tempH + titleH + BLOCK_GAP_PX <= availableHeight) {
            tempH += titleH + BLOCK_GAP_PX;
          }
        }

        // ONLY fit blocks that actually fit within available height.
        // NEVER force-fit — that causes content to be hidden/clipped.
        for (let i = 0; i < orderedBlocks.length; i++) {
          const { block, height } = orderedBlocks[i];
          if (tempH + height + BLOCK_GAP_PX <= availableHeight) {
            fittingBlocks.push(block);
            tempH += height + BLOCK_GAP_PX;
            anyFitted = true;
          } else {
            // Block doesn't fit — push it and all remaining to next page
            break;
          }
        }

        if (fittingBlocks.length >= visibleBlocks.length) return { fitting: section, remainder: null };
        
        // If no blocks fit at all on this page and the section isn't empty,
        // the entire remaining section goes to next page
        if (!anyFitted && !isContinued) {
          return { fitting: { ...section, blocks: [] }, remainder: section };
        }
        
        const remainingBlocks = visibleBlocks.filter((b) => !fittingBlocks.includes(b));
        if (remainingBlocks.length > 0) {
          return { fitting: { ...section, blocks: fittingBlocks }, remainder: { ...section, _continued: true, blocks: remainingBlocks } as ResumeSection };
        }
        return { fitting: section, remainder: null };
      };

      // ── Paginate ──
      // Content MUST NEVER be hidden. Always split at block level precisely.
      const paginateColumn = (colSections: ResumeSection[]) => {
        const pp: ResumeSection[][] = [];
        let curColPage: ResumeSection[] = [];
        let curColH = 0;

        for (const s of colSections) {
          const h = sectionHeightMap.get(s.id) || 40;
          if (curColH + h <= availableHeight || curColPage.length === 0) {
            curColPage.push(s);
            curColH += h + 10;
          } else {
            const { fitting, remainder } = splitSectionBlocks(s, curColH);
            if (fitting && fitting.blocks.length > 0) {
              curColPage.push(fitting);
              pp.push(curColPage);
              if (remainder) {
                curColPage = [remainder];
                let remH = BLOCK_GAP_PX;
                remainder.blocks.filter((b) => b.visible).forEach((b) => {
                  remH += (blockHeightMap.get(b.id) || 40) + BLOCK_GAP_PX;
                });
                curColH = remH;
              } else {
                curColPage = [];
                curColH = 0;
              }
            } else if (remainder) {
              // Entire remaining section goes to next page
              if (curColPage.length > 0) pp.push(curColPage);
              curColPage = [remainder];
              // Measure the remainder height
              let remH = BLOCK_GAP_PX;
              remainder.blocks.filter((b) => b.visible).forEach((b) => {
                remH += (blockHeightMap.get(b.id) || 40) + BLOCK_GAP_PX;
              });
              curColH = Math.min(remH, h);
            } else {
              // Fallback: push section as-is to new page
              if (curColPage.length > 0) pp.push(curColPage);
              curColPage = [s];
              curColH = h;
            }
          }
        }
        if (curColPage.length > 0) pp.push(curColPage);
        return pp;
      };

      if (isSidebarLayout) {
        const sidebarSections = allSections.filter(s => isSidebarSection(s));
        const mainSections = allSections.filter(s => !isSidebarSection(s));
        const sidebarPages = paginateColumn(sidebarSections);
        const mainPages = paginateColumn(mainSections);
        const maxPages = Math.max(sidebarPages.length, mainPages.length, 1);
        for (let p = 0; p < maxPages; p++) {
          const combinedPage: ResumeSection[] = [];
          if (p < sidebarPages.length) combinedPage.push(...sidebarPages[p]);
          if (p < mainPages.length) combinedPage.push(...mainPages[p]);
          if (combinedPage.length > 0) newPages.push(combinedPage);
        }
      } else {
        // Use the same paginateColumn logic for single-column layouts
        newPages.push(...paginateColumn(allSections));
      }

      if (newPages.length === 0) newPages.push(allSections);
      if (newPages.length > 1) {
        for (let p = 1; p < newPages.length; p++) newPages[p] = newPages[p].filter((s) => s.type !== 'header');
        const filteredPages = newPages.filter((page, idx) => idx === 0 || page.length > 0);
        setPages(filteredPages); onPageCountChange?.(filteredPages.length);
      } else { setPages(newPages); onPageCountChange?.(1); }
    };

    doMeasure();
    const raf = requestAnimationFrame(() => doMeasure());
    const timer1 = setTimeout(() => doMeasure(), 100);
    const timer2 = setTimeout(() => doMeasure(), 500);
    const timer3 = setTimeout(() => doMeasure(), 1000);
    const timer4 = setTimeout(() => doMeasure(), 2000);
    return () => { cancelAnimationFrame(raf); clearTimeout(timer1); clearTimeout(timer2); clearTimeout(timer3); clearTimeout(timer4); };
  }, [resume, onPageCountChange, availableHeight, isSidebarLayout, contentWidth]);

  return (
    <div style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}>
      <div ref={measureRef} style={measureStyle}>
        <DynamicResumePreview
          resume={resume}
          className="resume-engine-root"
          contentWidth={contentWidth}
        />
      </div>
      {pages.map((pageSections, pageIndex) => (
        <div key={`page-${pageIndex}`} className="resume-print-page" style={{
          width: `${pageSize.widthPx}px`,
          minHeight: `${pageSize.heightPx}px`,
          overflow: 'hidden',
          background: '#ffffff',
          boxShadow: '0 2px 16px rgba(0,0,0,0.10)', borderRadius: '2px',
          marginBottom: `${PAGE_GAP_PX}px`, pageBreakAfter: 'always', breakAfter: 'page',
          padding: `${marginTopPx}px ${marginRightPx}px ${marginBottomPx}px ${marginLeftPx}px`,
        }}>
          <DynamicResumePreview
            resume={{ ...resume, sections: pageSections }}
            className="resume-engine-root"
            contentWidth={contentWidth}
          />
          <PageFooter resume={resume} pageIndex={pageIndex} totalPages={pages.length} pageSize={pageSize} marginLeftPx={marginLeftPx} marginRightPx={marginRightPx} />
        </div>
      ))}
    </div>
  );
};

const ResumePreview: React.FC<ResumePreviewProps> = ({ data: incomingData, numPages = 1, previewRef, zoomLevel = 100, isThumbnail = false, onPageCountChange, contentWidth }) => {
  const resumeData = React.useMemo(() => normalizeResume(incomingData), [incomingData]);
  React.useEffect(() => onPageCountChange?.(numPages), [numPages, onPageCountChange]);
  if (isThumbnail) return <div ref={previewRef as any} className="h-full w-full overflow-hidden"><DynamicResumePreview resume={resumeData} className="resume-engine-root" contentWidth={contentWidth} /></div>;
  return <div id="resume-preview" className="flex flex-col items-center py-10" style={{ background: '#e8e8e8' }} ref={previewRef as any}><PaginatedContent resume={resumeData} onPageCountChange={onPageCountChange!} zoomLevel={zoomLevel} /></div>;
};

export { PAGE_SIZES, MM_TO_PX };
export type { PageSizeDef };
export default ResumePreview;