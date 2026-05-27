import { EditTarget, StyleOverride, FieldType } from './types';

/**
 * Detect field type from path, label, and tag
 */
export function detectFieldType(
  path: string,
  label: string,
  tagName: string,
  value: string,
): FieldType {
  const p = path.toLowerCase();
  const l = label.toLowerCase();

  if (p.includes('email') || l.includes('email')) return 'email';
  if (p.includes('phone') || l.includes('phone')) return 'tel';
  if (p.includes('url') || p.includes('website') || p.includes('linkedin') || l.includes('url')) return 'url';
  if (p.includes('date') || p.includes('startdate') || p.includes('enddate') || p.includes('graduationyear') || l.includes('date') || l.includes('year')) return 'date';
  if (p.includes('description') || p.includes('summary') || p.includes('content') || p.includes('text') || l.includes('description') || l.includes('summary') || tagName === 'P' || tagName === 'LI' || tagName === 'DIV') return 'textarea';
  if (value && (value.length > 80 || value.includes('. ') || value.split(' ').length > 10)) return 'textarea';

  return 'text';
}

/**
 * HTML to plain text (for editing)
 */
export function htmlToPlainText(html: string): string {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<li[^>]*>/gi, '- ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .trim()
    .replace(/\n{3,}/g, '\n\n');
}

/**
 * Plain text to HTML (for saving)
 */
export function plainTextToHtml(text: string): string {
  if (!text) return '';
  if (text.trim().startsWith('<')) return text;
  const lines = text.split('\n').filter(l => l.trim());
  if (lines.length === 0) return '';
  if (lines.length === 1) return `<p>${lines[0]}</p>`;
  const allBullets = lines.every(l => /^[-*\u2022]/.test(l.trim()));
  if (allBullets) {
    const items = lines.map(l => `<li>${l.replace(/^[-*\u2022]\s*/, '').trim()}</li>`).join('');
    return `<ul>${items}</ul>`;
  }
  return lines.map(l => `<p>${l}</p>`).join('');
}

/**
 * Get human-friendly label from path
 */
export function getFieldLabel(path: string, tagName: string): string {
  const p = path.toLowerCase();
  if (p.includes('fullname') || p.includes('firstname') || p.includes('lastname')) return 'Full Name';
  if (p.includes('professionaltitle') || p.includes('jobtitle')) return 'Job Title';
  if (p.includes('summary')) return 'Summary';
  if (p.includes('description')) return 'Description';
  if (p.includes('email')) return 'Email';
  if (p.includes('phone')) return 'Phone';
  if (p.includes('location')) return 'Location';
  if (p.includes('website') || p.includes('url')) return 'Website';
  if (p.includes('linkedin')) return 'LinkedIn';
  if (p.includes('company')) return 'Company';
  if (p.includes('position')) return 'Position';
  if (p.includes('school')) return 'School';
  if (p.includes('degree')) return 'Degree';
  if (p.includes('field')) return 'Field of Study';
  if (p.includes('startdate')) return 'Start Date';
  if (p.includes('enddate')) return 'End Date';
  if (p.includes('date')) return 'Date';
  if (p.includes('name')) return 'Name';
  if (p.includes('title')) return 'Title';
  if (p.includes('professionaltitle')) return 'Job Title';
  if (p.includes('sectiontitles')) return 'Section Heading';
  if (p.includes('declaration')) return 'Declaration';
  if (p.includes('certification')) return 'Certification';
  if (p.includes('language')) return 'Language';
  if (p.includes('skill')) return 'Skill';
  if (p.includes('interest')) return 'Interest';
  if (p.includes('social')) return 'Social Link';
  if (p.includes('project')) return 'Project';
  if (p.includes('education')) return 'Education';
  if (p.includes('experience')) return 'Experience';
  if (p.includes('organisation')) return 'Organisation';
  if (p.includes('publication')) return 'Publication';
  if (p.includes('reference')) return 'Reference';
  if (p.includes('custom')) return 'Custom Section';
  const tagLabels: Record<string, string> = {
    H1: 'Heading 1', H2: 'Heading 2', H3: 'Heading 3',
    H4: 'Heading 4', H5: 'Heading 5', H6: 'Heading 6',
    P: 'Paragraph', A: 'Link', SPAN: 'Text', LI: 'List item',
    TD: 'Cell', TH: 'Header', DIV: 'Text block',
  };
  return tagLabels[tagName] || 'Text';
}

/**
 * Check if element or its parent has a specific data attribute
 */
export function getClosestDataAttr(el: HTMLElement | null, attr: string): string | null {
  let current: HTMLElement | null = el;
  let depth = 0;
  while (current && depth < 12) {
    if (current.dataset[attr.replace('data-', '').replace(/-([a-z])/g, (_, c) => c.toUpperCase())]) {
      return current.dataset[attr.replace('data-', '').replace(/-([a-z])/g, (_, c) => c.toUpperCase())] || null;
    }
    current = current.parentElement;
    depth++;
  }
  return null;
}

/**
 * Format path to style path (normalize)
 */
export function toStylePath(path: string): string {
  return path;
}

/**
 * Style override helpers
 */
export function getElementStyle(overrides: Record<string, any> | undefined, path: string, baseStyle: React.CSSProperties = {}): React.CSSProperties {
  const override = overrides?.[path];
  if (!override) return baseStyle;
  return { ...baseStyle, ...override };
}

export function saveStyleOverride(
  currentOverrides: Record<string, any> | undefined,
  stylePath: string,
  overrides: StyleOverride,
  updateNested: (path: string, value: any) => void,
): void {
  const current = { ...(currentOverrides || {}) };
  const merged: any = { ...(current[stylePath] || {}), ...overrides };
  // Remove empty values
  Object.keys(merged).forEach(k => { if (!merged[k] && merged[k] !== 0 && merged[k] !== false) delete merged[k]; });
  // If no overrides left, delete the entry
  if (Object.keys(merged).length === 0) {
    delete current[stylePath];
  } else {
    current[stylePath] = merged;
  }
  updateNested('styleOverrides', current);
}

export function resetStyleOverride(
  currentOverrides: Record<string, any> | undefined,
  stylePath: string,
  updateNested: (path: string, value: any) => void,
): void {
  const current = { ...(currentOverrides || {}) };
  delete current[stylePath];
  updateNested('styleOverrides', current);
}