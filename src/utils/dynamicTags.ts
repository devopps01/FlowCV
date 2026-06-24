import type { ResumeBlock, ResumeData } from '@/types/resume-builder.types';

const TAG_PATTERN = /\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g;

const getValueByPath = (obj: unknown, path: string): string => {
  if (!obj || typeof obj !== 'object') return '';
  const keys = path.split('.');
  let current: unknown = obj;
  for (const key of keys) {
    if (current && typeof current === 'object' && key in (current as Record<string, unknown>)) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return '';
    }
  }
  return (typeof current === 'string' || typeof current === 'number') ? String(current) : '';
};

const stripHtml = (html: string): string => {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<li[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/"/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .trim();
};

/**
 * Automatically generate ALL dynamic tags from resume data.
 * Extracts every piece of data from all sections and blocks,
 * so {{name}}, {{email}}, {{phone}}, {{experience.0.company}}, etc.
 * all work automatically in any text field.
 */
export const generateDynamicTags = (resume: ResumeData): Record<string, string> => {
  const tags: Record<string, string> = {};

  // ── Metadata fallbacks ──
  tags.name = resume.metadata?.title || '';
  tags.headline = resume.metadata?.role || '';

  // ── Iterate ALL sections and blocks to extract data ──
  resume.sections.forEach((section) => {
    section.blocks.forEach((block, blockIndex) => {
      const content = block.content as Record<string, unknown>;

      if (block.type === 'heading') {
        const text = content.text as string | undefined;
        if (text) {
          tags.name = tags.name || text;
          // Heading with level 1 = name
          if ((content.level as number) === 1) tags.name = text;
        }
      }

      if (block.type === 'text') {
        const text = content.text as string | undefined;
        if (!text) return;
        const editPath = (content._editPath as string) || '';
        // Extract from _editPath for precise field mapping
        if (editPath.includes('email')) tags.email = text;
        else if (editPath.includes('phone')) tags.phone = text;
        else if (editPath.includes('location')) tags.location = text;
        else if (editPath.includes('summary')) tags.summary = stripHtml(text);
        // Extract by field name patterns
        if (/@/.test(text) && !tags.email) tags.email = text;
        if (/[\d\-\(\)\+\.\s]{7,}/.test(text) && !tags.phone) tags.phone = text;
      }

      if (block.type === 'experience') {
        const exp = content as {
          role?: string; company?: string; startDate?: string;
          endDate?: string; bullets?: string[];
        };
        const idx = blockIndex;
        if (exp.role) {
          tags[`experience.${idx}.role`] = exp.role;
          tags[`experience.${idx}.position`] = exp.role;
          tags.experience_role = tags.experience_role || exp.role;
        }
        if (exp.company) {
          tags[`experience.${idx}.company`] = exp.company;
          tags[`experience.${idx}.employer`] = exp.company;
          tags.experience_company = tags.experience_company || exp.company;
        }
        if (exp.startDate) tags[`experience.${idx}.startDate`] = exp.startDate;
        if (exp.endDate) tags[`experience.${idx}.endDate`] = exp.endDate;
        if (exp.bullets?.length) {
          tags[`experience.${idx}.bullets`] = exp.bullets.join('\n');
          exp.bullets.forEach((b, bi) => {
            tags[`experience.${idx}.bullet.${bi}`] = b;
          });
        }
      }

      if (block.type === 'education') {
        const edu = content as {
          school?: string; degree?: string; year?: string; field?: string;
        };
        const idx = blockIndex;
        if (edu.degree) {
          tags[`education.${idx}.degree`] = edu.degree;
          tags.education_degree = tags.education_degree || edu.degree;
        }
        if (edu.school) {
          tags[`education.${idx}.school`] = edu.school;
          tags[`education.${idx}.institution`] = edu.school;
          tags.education_school = tags.education_school || edu.school;
        }
        if (edu.year) tags[`education.${idx}.year`] = edu.year;
        if (edu.field) tags[`education.${idx}.field`] = edu.field;
      }

      if (block.type === 'skills') {
        const skillContent = content as { items?: string[] };
        if (skillContent.items?.length) {
          tags.skills = skillContent.items.join(', ');
          tags.skills_list = skillContent.items.join(', ');
          skillContent.items.forEach((s, si) => {
            tags[`skills.${si}`] = s;
          });
        }
      }

      if (block.type === 'image') {
        const img = content as { src?: string; alt?: string };
        if (img.src) tags.photo = img.src;
        if (img.alt) tags.photo_alt = img.alt;
      }

      // Extract from social/contact blocks
      if (block.type === 'social') {
        const soc = content as { items?: Array<{ label: string; url: string }> };
        soc.items?.forEach((item, idx) => {
          tags[`social.${idx}.label`] = item.label;
          tags[`social.${idx}.url`] = item.url;
          if (item.label.toLowerCase().includes('email') || item.url.includes('mailto:')) {
            tags.email = tags.email || item.url.replace('mailto:', '');
          }
          if (item.label.toLowerCase().includes('phone') || item.label.toLowerCase().includes('mobile')) {
            tags.phone = tags.phone || item.url.replace('tel:', '');
          }
        });
      }
    });
  });

  // ── Contact blocks in header section ──
  const headerSection = resume.sections.find((s) => s.type === 'header');
  if (headerSection) {
    headerSection.blocks.forEach((block) => {
      if (block.type === 'text') {
        const text = (block.content as { text?: string }).text || '';
        const path = (block.content as { _editPath?: string })._editPath || '';
        if (path.includes('email') || (text.includes('@') && text.includes('.'))) tags.email = tags.email || text;
        if (path.includes('phone') || /[\+\d\-\(\)\s]{7,}/.test(text)) tags.phone = tags.phone || text;
        if (path.includes('location')) tags.location = tags.location || text;
      }
    });
  }

  return tags;
};

/**
 * Replace all {{tag}} placeholders in a string with their actual values
 * from the resume data. Falls back to empty string for unknown tags.
 */
export const replaceTags = (input: string, resume: ResumeData, injected?: Record<string, string>): string => {
  if (!input || !TAG_PATTERN.test(input)) return input;
  // Reset the regex state
  TAG_PATTERN.lastIndex = 0;
  const generated = generateDynamicTags(resume);
  return input.replace(TAG_PATTERN, (_, rawPath: string) => {
    const path = String(rawPath).trim();
    // Priority: injected > generated tags > direct resume path
    if (injected && injected[path] !== undefined) return injected[path];
    if (generated[path] !== undefined) return generated[path];
    const value = getValueByPath(resume, path);
    if (value) return value;
    return '';
  });
};