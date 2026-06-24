/**
 * Dynamic Tag Engine - Replaces {{placeholders}} with actual data
 * Supports nested paths like {{experience.0.company}}
 */

export function extractDataByPath(obj: any, path: string): any {
  const keys = path.trim().split('.');
  let value = obj;
  for (const key of keys) {
    if (value == null) return '';
    // Handle array indices as numbers
    const idx = parseInt(key, 10);
    if (!isNaN(idx) && Array.isArray(value)) {
      value = value[idx];
    } else {
      value = value[key];
    }
  }
  return value != null ? value : '';
}

export function replaceTags(template: string, data: any): string {
  if (!template || typeof template !== 'string') return template || '';
  return template.replace(/\{\{(.*?)\}\}/g, (match, key) => {
    const value = extractDataByPath(data, key.trim());
    return String(value !== undefined && value !== null ? value : '');
  });
}

export function getAllTags(template: string): string[] {
  if (!template) return [];
  const tags: string[] = [];
  const regex = /\{\{(.*?)\}\}/g;
  let match;
  while ((match = regex.exec(template)) !== null) {
    tags.push(match[1].trim());
  }
  return Array.from(new Set(tags));
}

export function generateDynamicTags(obj: any, prefix = ''): string[] {
  let tags: string[] = [];
  if (!obj || typeof obj !== 'object') return tags;

  for (const key of Object.keys(obj)) {
    const value = obj[key];
    const currentPath = prefix ? `${prefix}.${key}` : key;

    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      tags.push(...generateDynamicTags(value, currentPath));
    } else if (Array.isArray(value)) {
      tags.push(...generateDynamicTags(value[0] || {}, currentPath));
      tags.push(`{{${currentPath}}}`);
    } else {
      tags.push(`{{${currentPath}}}`);
    }
  }

  return tags;
}

export function extractAllFromResume(resumeData: any): Record<string, string> {
  const flat: Record<string, string> = {};

  function flatten(obj: any, prefix = '') {
    if (!obj || typeof obj !== 'object') return;
    for (const key of Object.keys(obj)) {
      const value = obj[key];
      const path = prefix ? `${prefix}.${key}` : key;
      if (value !== null && typeof value === 'object') {
        flatten(value, path);
      } else if (typeof value === 'string' || typeof value === 'number') {
        flat[path] = String(value);
      }
    }
  }

  flatten(resumeData);
  return flat;
}