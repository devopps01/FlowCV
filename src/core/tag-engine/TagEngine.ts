// ============================================================
// TAG ENGINE - Dynamic Tag Resolution & Replacement System
// ============================================================

import type { TagDefinition, TagSource, ResumeData, ResumeSection, ResumeBlock } from '@/types/resume.types';

// ─── Tag Pattern ───
const TAG_PATTERN = /\{\{([^}]+)\}\}/g;
const TAG_VALIDATION = /^[a-zA-Z][a-zA-Z0-9._-]*$/;

// ─── Built-in Tag Definitions ───
const BUILT_IN_TAGS: TagDefinition[] = [
  { id: 'tag-name', tag: 'name', label: 'Full Name', source: 'resume', resolver: 'resume.name', description: 'Resume owner full name', category: 'Personal' },
  { id: 'tag-email', tag: 'email', label: 'Email', source: 'contact', resolver: 'contact.email', description: 'Contact email address', category: 'Contact' },
  { id: 'tag-phone', tag: 'phone', label: 'Phone', source: 'contact', resolver: 'contact.phone', description: 'Contact phone number', category: 'Contact' },
  { id: 'tag-address', tag: 'address', label: 'Address', source: 'contact', resolver: 'contact.address', description: 'Full address', category: 'Contact' },
  { id: 'tag-city', tag: 'city', label: 'City', source: 'contact', resolver: 'contact.city', description: 'City name', category: 'Contact' },
  { id: 'tag-state', tag: 'state', label: 'State', source: 'contact', resolver: 'contact.state', description: 'State/Province', category: 'Contact' },
  { id: 'tag-zip', tag: 'zip', label: 'Zip Code', source: 'contact', resolver: 'contact.zip', description: 'Zip/Postal code', category: 'Contact' },
  { id: 'tag-country', tag: 'country', label: 'Country', source: 'contact', resolver: 'contact.country', description: 'Country name', category: 'Contact' },
  { id: 'tag-linkedin', tag: 'linkedin', label: 'LinkedIn URL', source: 'contact', resolver: 'contact.linkedin', description: 'LinkedIn profile URL', category: 'Social' },
  { id: 'tag-github', tag: 'github', label: 'GitHub URL', source: 'contact', resolver: 'contact.github', description: 'GitHub profile URL', category: 'Social' },
  { id: 'tag-website', tag: 'website', label: 'Website URL', source: 'contact', resolver: 'contact.website', description: 'Personal website URL', category: 'Social' },
  { id: 'tag-portfolio', tag: 'portfolio', label: 'Portfolio URL', source: 'contact', resolver: 'contact.portfolio', description: 'Portfolio URL', category: 'Social' },
  { id: 'tag-twitter', tag: 'twitter', label: 'Twitter/X URL', source: 'contact', resolver: 'contact.twitter', description: 'Twitter/X profile URL', category: 'Social' },
  { id: 'tag-headline', tag: 'headline', label: 'Headline', source: 'global', resolver: 'metadata.title', description: 'Professional headline/title', category: 'Personal' },
  { id: 'tag-summary', tag: 'summary', label: 'Summary', source: 'global', resolver: 'sections.summary', description: 'Professional summary', category: 'Content' },
  { id: 'tag-experience-company', tag: 'experience.company', label: 'Experience Company', source: 'experience', resolver: 'experience.company', description: 'Company name from experience block', category: 'Experience' },
  { id: 'tag-experience-position', tag: 'experience.position', label: 'Experience Position', source: 'experience', resolver: 'experience.position', description: 'Job title from experience block', category: 'Experience' },
  { id: 'tag-education-institution', tag: 'education.institution', label: 'Education Institution', source: 'education', resolver: 'education.institution', description: 'School/University name', category: 'Education' },
  { id: 'tag-education-degree', tag: 'education.degree', label: 'Education Degree', source: 'education', resolver: 'education.degree', description: 'Degree earned', category: 'Education' },
];

// ─── Tag Registry ───
class TagRegistry {
  private tags: Map<string, TagDefinition> = new Map();
  private customTags: Map<string, (data: any, context?: any) => string> = new Map();

  constructor() {
    this.registerBuiltIn();
  }

  private registerBuiltIn(): void {
    for (const tagDef of BUILT_IN_TAGS) {
      this.tags.set(tagDef.tag, tagDef);
    }
  }

  register(tagDef: TagDefinition): void {
    if (!TAG_VALIDATION.test(tagDef.tag)) {
      console.warn(`Invalid tag format: "${tagDef.tag}". Tags must start with a letter and contain only letters, numbers, dots, hyphens, and underscores.`);
      return;
    }
    this.tags.set(tagDef.tag, tagDef);
  }

  registerResolver(tag: string, resolver: (data: any, context?: any) => string): void {
    this.customTags.set(tag, resolver);
  }

  get(tag: string): TagDefinition | undefined {
    return this.tags.get(tag);
  }

  has(tag: string): boolean {
    return this.tags.has(tag) || this.customTags.has(tag);
  }

  getAll(): TagDefinition[] {
    return Array.from(this.tags.values());
  }

  getBySource(source: TagSource): TagDefinition[] {
    return this.getAll().filter((t) => t.source === source);
  }

  getByCategory(category: string): TagDefinition[] {
    return this.getAll().filter((t) => t.category === category);
  }

  unregister(tag: string): void {
    this.tags.delete(tag);
    this.customTags.delete(tag);
  }

  clearCustom(): void {
    this.customTags.clear();
  }
}

export const tagRegistry = new TagRegistry();

// ─── Tag Engine ───
class TagEngine {
  private registry: TagRegistry;
  private builtInResolvers: Map<string, (data: any, context?: any) => string>;

  constructor(registry: TagRegistry) {
    this.registry = registry;
    this.builtInResolvers = new Map();
    this.registerBuiltInResolvers();
  }

  private registerBuiltInResolvers(): void {
    // Personal
    this.builtInResolvers.set('name', (data: any) => data?.name || data?.metadata?.title || '');
    this.builtInResolvers.set('headline', (data: any) => data?.metadata?.title || data?.metadata?.headline || '');

    // Contact
    this.builtInResolvers.set('email', (data: any) => this.findBlockContent(data, 'contact', 'email') || '');
    this.builtInResolvers.set('phone', (data: any) => this.findBlockContent(data, 'contact', 'phone') || '');
    this.builtInResolvers.set('address', (data: any) => this.findBlockContent(data, 'contact', 'address') || '');
    this.builtInResolvers.set('city', (data: any) => this.findBlockContent(data, 'contact', 'city') || '');
    this.builtInResolvers.set('state', (data: any) => this.findBlockContent(data, 'contact', 'state') || '');
    this.builtInResolvers.set('zip', (data: any) => this.findBlockContent(data, 'contact', 'zip') || '');
    this.builtInResolvers.set('country', (data: any) => this.findBlockContent(data, 'contact', 'country') || '');
    this.builtInResolvers.set('website', (data: any) => this.findBlockContent(data, 'contact', 'website') || '');
    this.builtInResolvers.set('linkedin', (data: any) => this.findBlockContent(data, 'contact', 'linkedin') || '');
    this.builtInResolvers.set('github', (data: any) => this.findBlockContent(data, 'contact', 'github') || '');
    this.builtInResolvers.set('twitter', (data: any) => this.findBlockContent(data, 'contact', 'twitter') || '');
    this.builtInResolvers.set('portfolio', (data: any) => this.findBlockContent(data, 'contact', 'portfolio') || '');

    // Summary
    this.builtInResolvers.set('summary', (data: any) => {
      const section = data?.sections?.find((s: any) => s.type === 'summary');
      if (section?.blocks?.[0]?.content?.text) return section.blocks[0].content.text;
      if (section?.blocks?.[0]?.content?.html) return section.blocks[0].content.html;
      return '';
    });
  }

  private findBlockContent(data: any, sectionType: string, field: string): string {
    if (!data?.sections) return '';
    const section = data.sections.find((s: any) => s.type === sectionType);
    if (!section?.blocks?.[0]?.content) return '';
    const content = section.blocks[0].content;
    return content[field] || '';
  }

  /**
   * Extract all unique tag references from a text string
   */
  extractTags(text: string): string[] {
    if (!text) return [];
    const tags: string[] = [];
    let match: RegExpExecArray | null;
    const regex = new RegExp(TAG_PATTERN.source, 'g');
    while ((match = regex.exec(text)) !== null) {
      const tag = match[1].trim();
      if (!tags.includes(tag)) {
        tags.push(tag);
      }
    }
    return tags;
  }

  /**
   * Parse all unique tags from text and return their definitions
   */
  parseTags(text: string): TagDefinition[] {
    const tagNames = this.extractTags(text);
    return tagNames
      .map((name) => this.registry.get(name))
      .filter((def): def is TagDefinition => def !== undefined);
  }

  /**
   * Replace all tags in text with their resolved values
   */
  replaceTags(text: string, data: ResumeData, context?: any): string {
    if (!text) return text;

    return text.replace(TAG_PATTERN, (_match, tagName: string) => {
      const trimmedTag = tagName.trim();
      return this.resolveTag(trimmedTag, data, context);
    });
  }

  /**
   * Resolve a single tag to its value
   */
  resolveTag(tag: string, data: ResumeData, context?: any): string {
    // Check custom resolvers first
    const customResolver = this.registry['customTags']?.get(tag);
    if (customResolver) {
      try {
        return customResolver(data, context) || '';
      } catch {
        return '';
      }
    }

    // Check built-in resolvers
    const resolver = this.builtInResolvers.get(tag);
    if (resolver) {
      try {
        return resolver(data, context) || '';
      } catch {
        return '';
      }
    }

    // Check if tag has a definition but no resolver (unregistered)
    const tagDef = this.registry.get(tag);
    if (tagDef) {
      // Try dot-notation path resolution
      return this.resolveByPath(data, tagDef.resolver);
    }

    // Tag not found - return as-is or empty string
    console.warn(`Tag "{{${tag}}}" not found. Leaving unresolved.`);
    return `{{${tag}}}`;
  }

  /**
   * Resolve a value by dot-notation path
   */
  private resolveByPath(obj: any, path: string): string {
    if (!obj || !path) return '';

    const parts = path.split('.');
    let current = obj;

    for (const part of parts) {
      if (current == null || typeof current !== 'object') return '';
      if (Array.isArray(current)) {
        // Try to find in array elements
        if (part === 'summary') {
          const section = current.find((s: any) => s.type === 'summary');
          return section?.blocks?.[0]?.content?.text || '';
        }
        return '';
      }
      current = current[part];
      if (current === undefined || current === null) return '';
    }

    return typeof current === 'string' ? current : String(current);
  }

  /**
   * Replace tags in an entire resume data object recursively
   */
  replaceTagsInData(data: ResumeData): ResumeData {
    const result = JSON.parse(JSON.stringify(data)) as ResumeData;

    for (const section of result.sections) {
      if (section.title) {
        section.title = this.replaceTags(section.title, data);
      }
      for (const block of section.blocks) {
        this.replaceTagsInBlock(block, data);
      }
    }

    return result;
  }

  /**
   * Replace tags in a single block
   */
  private replaceTagsInBlock(block: ResumeBlock, data: ResumeData): void {
    if (!block.content) return;

    const content = block.content as Record<string, any>;
    for (const [key, value] of Object.entries(content)) {
      if (typeof value === 'string') {
        content[key] = this.replaceTags(value, data);
      } else if (Array.isArray(value)) {
        content[key] = value.map((item) =>
          typeof item === 'string' ? this.replaceTags(item, data) : item
        );
      }
    }
  }

  /**
   * Get all registered tags with their definitions
   */
  getAllTags(): TagDefinition[] {
    return this.registry.getAll();
  }

  /**
   * Register a new tag with resolver function
   */
  registerTag(tag: string, resolver: (data: any, context?: any) => string, definition?: Partial<TagDefinition>): void {
    if (definition) {
      this.registry.register({
        id: definition.id || `tag-custom-${tag}`,
        tag,
        label: definition.label || tag,
        source: definition.source || 'custom',
        resolver: definition.resolver || tag,
        description: definition.description,
        category: definition.category,
      });
    }
    this.registry.registerResolver(tag, resolver);
  }

  /**
   * Get tags available for a specific source context
   */
  getTagsForSource(source: TagSource): TagDefinition[] {
    return this.registry.getBySource(source);
  }
}

export const tagEngine = new TagEngine(tagRegistry);
export { TagRegistry, TagEngine, TAG_PATTERN, BUILT_IN_TAGS };