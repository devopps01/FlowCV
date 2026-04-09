import {
  ResumeContent,
  ColorPalette,
  TypographyConfig,
  LayoutConfig,
  DesignConfig,
  DesignScore,
  DesignSuggestion,
  AutoLayoutPosition,
  TemplateRecommendation,
} from './types';

const GRID_SIZE = 8;
const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;

export class DesignEngine {
  private content: ResumeContent;

  constructor(content: ResumeContent) {
    this.content = content;
  }

  generateCompleteDesign(): DesignConfig {
    return {
      colors: this.generateColorPalette(),
      typography: this.generateTypography(),
      layout: this.generateLayout(),
    };
  }

  generateColorPalette(): ColorPalette {
    const role = this.content.role?.toLowerCase() || '';
    const hasTech = role.includes('developer') || role.includes('engineer') || role.includes('technical');
    const hasCreative = role.includes('design') || role.includes('creative') || role.includes('art');

    const palettes: Record<string, ColorPalette> = {
      tech: {
        primary: '#2563eb',
        secondary: '#eff6ff',
        accent: '#3b82f6',
        text: '#1e293b',
        textLight: '#64748b',
        background: '#ffffff',
        border: '#e2e8f0',
      },
      creative: {
        primary: '#7c3aed',
        secondary: '#f5f3ff',
        accent: '#8b5cf6',
        text: '#1f2937',
        textLight: '#6b7280',
        background: '#ffffff',
        border: '#e5e7eb',
      },
      professional: {
        primary: '#0f766e',
        secondary: '#f0fdfa',
        accent: '#14b8a6',
        text: '#134e4a',
        textLight: '#5eead4',
        background: '#ffffff',
        border: '#ccfbf1',
      },
      modern: {
        primary: '#dc2626',
        secondary: '#fef2f2',
        accent: '#ef4444',
        text: '#1f2937',
        textLight: '#6b7280',
        background: '#ffffff',
        border: '#fee2e2',
      },
      minimal: {
        primary: '#18181b',
        secondary: '#fafafa',
        accent: '#27272a',
        text: '#09090b',
        textLight: '#71717a',
        background: '#ffffff',
        border: '#e4e4e7',
      },
    };

    if (hasTech) return palettes.tech;
    if (hasCreative) return palettes.creative;
    
    return palettes.proffessional;
  }

  generateTypography(): TypographyConfig {
    return {
      headingFont: 'Inter',
      bodyFont: 'Inter',
      nameSize: 28,
      headingSize: 14,
      subheadingSize: 12,
      bodySize: 11,
      smallSize: 9,
      lineHeight: 1.5,
    };
  }

  generateLayout(): LayoutConfig {
    const skillsCount = this.content.skills?.length || 0;
    const experienceCount = this.content.experience?.length || 0;
    const educationCount = this.content.education?.length || 0;
    const projectsCount = this.content.projects?.length || 0;

    const totalSections = (experienceCount > 0 ? 1 : 0) +
                         (educationCount > 0 ? 1 : 0) +
                         (skillsCount > 0 ? 1 : 0) +
                         (projectsCount > 0 ? 1 : 0);

    const isSidebarLayout = skillsCount >= 8 && totalSections <= 4;
    const isTwoColumnLayout = totalSections >= 4 && experienceCount >= 2;

    if (isSidebarLayout) {
      return {
        type: 'sidebar',
        sidebarWidth: 200,
        marginX: 40,
        marginY: 40,
        sectionGap: 32,
        itemGap: 8,
      };
    }

    if (isTwoColumnLayout) {
      return {
        type: 'two-column',
        marginX: 40,
        marginY: 40,
        sectionGap: 24,
        itemGap: 8,
      };
    }

    if (totalSections <= 3) {
      return {
        type: 'modern',
        marginX: 40,
        marginY: 40,
        sectionGap: 20,
        itemGap: 8,
      };
    }

    return {
      type: 'single',
      marginX: 40,
      marginY: 40,
      sectionGap: 24,
      itemGap: 8,
    };
  }

  getRecommendedTemplate(): TemplateRecommendation {
    const role = this.content.role?.toLowerCase() || '';
    const experienceYears = this.content.experience?.reduce((sum, exp) => sum + (exp.years || 0), 0) || 0;
    const skillsCount = this.content.skills?.length || 0;

    const recommendations: TemplateRecommendation[] = [];

    if (experienceYears >= 5 || role.includes('senior') || role.includes('lead')) {
      recommendations.push({
        templateId: 'classic',
        templateName: 'Classic Professional',
        score: 95,
        reason: 'Classic layout best for senior positions',
      });
    }

    if (role.includes('developer') || role.includes('engineer') || role.includes('technical')) {
      recommendations.push({
        templateId: 'modern',
        templateName: 'Modern Tech',
        score: skillsCount >= 10 ? 90 : 85,
        reason: 'Clean, modern look ideal for tech roles',
      });
    }

    if (skillsCount >= 12) {
      recommendations.push({
        templateId: 'sidebar',
        templateName: 'Sidebar Layout',
        score: 92,
        reason: 'Best for showcasing many skills',
      });
    }

    if (experienceYears <= 2) {
      recommendations.push({
        templateId: 'minimal',
        templateName: 'Minimal Clean',
        score: 88,
        reason: 'Clean layout perfect for freshers',
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        templateId: 'classic',
        templateName: 'Classic',
        score: 80,
        reason: 'Versatile layout suitable for any role',
      });
    }

    return recommendations.sort((a, b) => b.score - a.score)[0];
  }

  calculateDesignScore(design: DesignConfig): DesignScore {
    const issues: string[] = [];
    const suggestions: string[] = [];

    const layoutScore = this.evaluateLayout(design.layout, issues, suggestions);
    const colorScore = this.evaluateColors(design.colors, issues, suggestions);
    const typographyScore = this.evaluateTypography(design.typography, issues, suggestions);
    const spacingScore = this.evaluateSpacing(design.layout, issues, suggestions);

    const totalScore = Math.round(
      layoutScore * 0.25 +
      colorScore * 0.25 +
      typographyScore * 0.25 +
      spacingScore * 0.25
    );

    return {
      score: totalScore,
      layoutScore,
      colorScore,
      typographyScore,
      spacingScore,
      issues,
      suggestions,
    };
  }

  private evaluateLayout(layout: LayoutConfig, issues: string[], suggestions: string[]): number {
    let score = 100;

    if (layout.type === 'single' && this.content.skills && this.content.skills.length > 10) {
      score -= 20;
      issues.push('Too many skills for single column layout');
      suggestions.push('Consider switching to sidebar layout for better balance');
    }

    if (layout.type !== 'sidebar' && this.content.skills && this.content.skills.length > 15) {
      score -= 15;
      issues.push('Skills may be cramped in current layout');
      suggestions.push('Sidebar layout would showcase skills better');
    }

    return Math.max(0, score);
  }

  private evaluateColors(colors: ColorPalette, issues: string[], suggestions: string[]): number {
    let score = 100;

    // Validate colors object has required properties
    if (!colors || !colors.text || !colors.background) {
      return score; // Return default score if colors are invalid
    }

    const hexToLum = (hex: string): number => {
      const rgb = parseInt(hex.slice(1), 16);
      const r = (rgb >> 16) & 255;
      const g = (rgb >> 8) & 255;
      const b = rgb & 255;
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };

    const textLum = hexToLum(colors.text);
    const bgLum = hexToLum(colors.background);
    const contrast = (Math.max(textLum, bgLum) + 0.05) / (Math.min(textLum, bgLum) + 0.05);

    if (contrast < 4.5) {
      score -= 25;
      issues.push('Low color contrast - may affect readability');
      suggestions.push('Increase contrast between text and background colors');
    }

    return Math.max(0, score);
  }

  private evaluateTypography(typography: TypographyConfig, issues: string[], suggestions: string[]): number {
    let score = 100;

    if (typography.nameSize < 20) {
      score -= 10;
      issues.push('Name font size is too small');
      suggestions.push('Increase name size to at least 24px for better visibility');
    }

    if (typography.bodySize < 10) {
      score -= 15;
      issues.push('Body text may be too small');
      suggestions.push('Use at least 11px for body text to ensure readability');
    }

    if (typography.headingSize < 12) {
      score -= 10;
      issues.push('Section headings may lack prominence');
      suggestions.push('Use 12-14px for section headings');
    }

    return Math.max(0, score);
  }

  private evaluateSpacing(layout: LayoutConfig, issues: string[], suggestions: string[]): number {
    let score = 100;

    if (layout.sectionGap < 16) {
      score -= 20;
      issues.push('Sections are too close together');
      suggestions.push('Increase section gap for better visual separation');
    }

    if (layout.sectionGap > 48) {
      score -= 10;
      issues.push('Excessive spacing between sections');
      suggestions.push('Reduce section gap to fit more content');
    }

    return Math.max(0, score);
  }

  generateSuggestions(design: DesignConfig): DesignSuggestion[] {
    const suggestions: DesignSuggestion[] = [];

    if (this.content.experience && this.content.experience.length > 3) {
      suggestions.push({
        type: 'layout',
        priority: 'high',
        title: 'Consider Two-Column Layout',
        description: 'With multiple experience entries, a two-column layout may improve balance',
        action: 'Switch to two-column or sidebar layout',
      });
    }

    if (this.content.skills && this.content.skills.length > 12) {
      suggestions.push({
        type: 'layout',
        priority: 'high',
        title: 'Sidebar Recommended',
        description: 'Your skills list is extensive - sidebar layout showcases them better',
        action: 'Switch to sidebar template',
      });
    }

    if (!this.content.summary || this.content.summary.length < 50) {
      suggestions.push({
        type: 'content',
        priority: 'medium',
        title: 'Add Professional Summary',
        description: 'A strong summary improves first impression',
        action: 'Add a 2-3 sentence professional summary',
      });
    }

    if (this.content.experience && this.content.experience.length === 0) {
      suggestions.push({
        type: 'content',
        priority: 'high',
        title: 'Add Work Experience',
        description: 'Experience section is crucial for most applications',
        action: 'Add your work history',
      });
    }

    suggestions.push({
      type: 'typography',
      priority: 'low',
      title: 'Maintain Font Hierarchy',
      description: 'Ensure consistent font sizing throughout',
      action: 'Use defined sizes: Name > Headings > Body',
    });

    return suggestions.sort((a, b) => {
      const priority = { high: 0, medium: 1, low: 2 };
      return priority[a.priority] - priority[b.priority];
    });
  }

  autoFixDesign(design: DesignConfig): DesignConfig {
    const score = this.calculateDesignScore(design);

    let fixedDesign = { ...design };

    if (score.spacingScore < 80) {
      fixedDesign.layout = {
        ...fixedDesign.layout,
        sectionGap: 24,
      };
    }

    if (score.colorScore < 80) {
      fixedDesign.colors = {
        ...fixedDesign.colors,
        text: '#1f2937',
        background: '#ffffff',
      };
    }

    if (score.typographyScore < 80) {
      fixedDesign.typography = {
        ...fixedDesign.typography,
        nameSize: 26,
        headingSize: 13,
        bodySize: 11,
      };
    }

    return fixedDesign;
  }

  optimizeContent(content: string, type: 'summary' | 'experience' | 'project'): string {
    if (!content) return content;

    const enhancements: Record<string, Record<string, string>> = {
      summary: {
        'worked on': 'Contributed to',
        'did': 'Successfully completed',
        'helped': 'Supported',
        'made': 'Developed',
      },
      experience: {
        'worked on': 'Led development of',
        'made': 'Built',
        'used': 'Utilized',
        'helped': 'Collaborated on',
      },
      project: {
        'made': 'Developed',
        'worked on': 'Built',
        'created': 'Designed and implemented',
      },
    };

    let enhanced = content;
    const replacements = enhancements[type] || enhancements.summary;

    for (const [bad, good] of Object.entries(replacements)) {
      enhanced = enhanced.replace(new RegExp(`\\b${bad}\\b`, 'gi'), good);
    }

    const techTerms: Record<string, string> = {
      'js': 'JavaScript',
      'ts': 'TypeScript',
      'react': 'React.js',
      'node': 'Node.js',
      'mongodb': 'MongoDB',
      'api': 'REST API',
      'db': 'database',
    };

    for (const [short, full] of Object.entries(techTerms)) {
      enhanced = enhanced.replace(
        new RegExp(`\\b${short}\\b`, 'gi'),
        full
      );
    }

    return enhanced;
  }

  generateLayoutPositions(layout: LayoutConfig): AutoLayoutPosition[] {
    const positions: AutoLayoutPosition[] = [];
    let currentY = layout.marginY;

    const sections = [
      { id: 'personal-info', height: 100 },
      { id: 'experience-section', height: this.content.experience ? this.content.experience.length * 80 + 40 : 0 },
      { id: 'education-section', height: this.content.education ? this.content.education.length * 60 + 40 : 0 },
      { id: 'skills-section', height: 80 },
      { id: 'certifications-section', height: this.content.certifications ? this.content.certifications.length * 30 + 40 : 0 },
      { id: 'projects-section', height: this.content.projects ? this.content.projects.length * 50 + 40 : 0 },
    ].filter(s => s.height > 0);

    if (layout.type === 'sidebar') {
      const sidebarX = layout.marginX;
      const contentX = layout.marginX + (layout.sidebarWidth || 200) + layout.sectionGap;
      const contentWidth = PAGE_WIDTH - contentX - layout.marginX;

      let sidebarY = currentY + 120;
      
      if (this.content.skills) {
        positions.push({
          sectionId: 'skills-sidebar',
          x: sidebarX,
          y: sidebarY,
          width: layout.sidebarWidth || 200,
          height: Math.min(this.content.skills.length * 20 + 40, 200),
        });
        sidebarY += Math.min(this.content.skills.length * 20 + 60, 260);
      }

      if (this.content.certifications) {
        positions.push({
          sectionId: 'certifications-sidebar',
          x: sidebarX,
          y: sidebarY,
          width: layout.sidebarWidth || 200,
          height: this.content.certifications.length * 20 + 40,
        });
        sidebarY += this.content.certifications.length * 20 + 60;
      }

      positions.push({
        sectionId: 'personal-info',
        x: contentX,
        y: currentY,
        width: contentWidth,
        height: 100,
      });

      currentY += 140;

      for (const section of sections) {
        if (section.id === 'personal-info' || section.id === 'skills-section' || section.id === 'certifications-section') {
          continue;
        }
        currentY = this.snapToGrid(currentY + layout.sectionGap);
        positions.push({
          sectionId: section.id,
          x: contentX,
          y: currentY,
          width: contentWidth,
          height: section.height,
        });
        currentY += section.height;
      }
    } else {
      positions.push({
        sectionId: 'personal-info',
        x: layout.marginX,
        y: currentY,
        width: PAGE_WIDTH - layout.marginX * 2,
        height: 100,
      });

      currentY += 120;

      for (const section of sections) {
        if (section.id === 'personal-info') continue;
        currentY = this.snapToGrid(currentY + layout.sectionGap);
        positions.push({
          sectionId: section.id,
          x: layout.marginX,
          y: currentY,
          width: PAGE_WIDTH - layout.marginX * 2,
          height: section.height,
        });
        currentY += section.height;
      }
    }

    return positions;
  }

  private snapToGrid(value: number): number {
    return Math.round(value / GRID_SIZE) * GRID_SIZE;
  }

  generateCompleteOutput() {
    const design = this.generateCompleteDesign();
    const recommendations = this.getRecommendedTemplate();
    const suggestions = this.generateSuggestions(design);
    const score = this.calculateDesignScore(design);
    const positions = this.generateLayoutPositions(design.layout);
    const fixedDesign = this.autoFixDesign(design);

    return {
      design,
      recommendations,
      suggestions,
      score,
      positions,
      fixedDesign,
      generatedAt: new Date().toISOString(),
    };
  }
}

export function createDesignEngine(content: ResumeContent): DesignEngine {
  return new DesignEngine(content);
}

export function generateResumeDesign(content: ResumeContent) {
  const engine = new DesignEngine(content);
  return engine.generateCompleteOutput();
}

export function optimizeResumeContent(content: ResumeContent) {
  const engine = new DesignEngine(content);
  
  const optimized = { ...content };

  if (optimized.summary) {
    optimized.summary = engine.optimizeContent(optimized.summary, 'summary');
  }

  if (optimized.experience) {
    optimized.experience = optimized.experience.map(exp => ({
      ...exp,
      description: exp.description ? engine.optimizeContent(exp.description, 'experience') : '',
    }));
  }

  if (optimized.projects) {
    optimized.projects = optimized.projects.map(proj => ({
      ...proj,
      description: proj.description ? engine.optimizeContent(proj.description, 'project') : '',
    }));
  }

  return optimized;
}

export function scoreResumeDesign(design: DesignConfig, content: ResumeContent) {
  const engine = new DesignEngine(content);
  return engine.calculateDesignScore(design);
}
