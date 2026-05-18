const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '..', 'src', 'components', 'resume-builder', 'design-templates.ts');

const fontFamilies = [
  'Inter', 'Poppins', 'Outfit', 'Merriweather', 'Playfair Display', 
  'Georgia', 'Lora', 'JetBrains Mono', 'Roboto', 'Montserrat', 
  'Nunito', 'Lato', 'Open Sans', 'Raleway', 'Ubuntu'
];

const layouts = [
  'sidebar-left', 'sidebar-right', 'single', 'modern-header', 'double-header'
];

const colorPalettes = [
  { name: 'Purple Rain', primary: '#7c3aed', secondary: '#f5f3ff', accent: '#5b21b6' },
  { name: 'Pink Blossom', primary: '#ff4d7d', secondary: '#fff1f2', accent: '#be185d' },
  { name: 'Executive Navy', primary: '#1e40af', secondary: '#eff6ff', accent: '#1d4ed8' },
  { name: 'Minimal Slate', primary: '#18181b', secondary: '#fafafa', accent: '#27272a' },
  { name: 'Sunset Violet', primary: '#8b5cf6', secondary: '#faf5ff', accent: '#7c3aed' },
  { name: 'Royal Amber', primary: '#b45309', secondary: '#fffbeb', accent: '#d97706' },
  { name: 'Forest Emerald', primary: '#059669', secondary: '#ecfdf5', accent: '#047857' },
  { name: 'Classic Crimson', primary: '#881337', secondary: '#fff1f2', accent: '#9f1239' },
  { name: 'Midnight Blue', primary: '#0f172a', secondary: '#f8fafc', accent: '#1e293b' },
  { name: 'Teal Oasis', primary: '#0d9488', secondary: '#f0fdfa', accent: '#115e59' },
  { name: 'Rose Gold', primary: '#db2777', secondary: '#fdf2f8', accent: '#9d174d' },
  { name: 'Ocean Cyan', primary: '#0284c7', secondary: '#f0f9ff', accent: '#0369a1' },
  { name: 'Warm Terracotta', primary: '#c2410c', secondary: '#fff7ed', accent: '#9a3412' },
  { name: 'Olive Garden', primary: '#65a30d', secondary: '#f7fee7', accent: '#3f6212' },
  { name: 'Steel Grey', primary: '#475569', secondary: '#f8fafc', accent: '#334155' }
];

const headingStyles = ['underline', 'dot', 'left-bar', 'background', 'none'];
const headingSizes = ['s', 'm', 'l'];
const nameSizes = ['s', 'm', 'l'];
const personalArrangements = ['default', 'horizontal', 'stacked'];
const personalIconStyles = ['default', 'minimal', 'icon-only'];
const skillsStyles = ['grid', 'list', 'compact', 'bubble', 'level'];

const templates = [];

// Base 8 templates to preserve or adapt beautifully
const baseTemplates = [
  {
    id: 'professional-purple',
    name: 'Professional Purple',
    description: 'Classic purple theme perfect for corporate positions',
    preview: {
      primaryColor: '#7c3aed',
      secondaryColor: '#f5f3ff',
      accentColor: '#5b21b6',
      fontFamily: 'Inter',
      layout: 'sidebar-left',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
    },
    design: {
      fontSize: 10.5,
      lineHeight: 1.45,
      marginLR: 12,
      marginTB: 16,
      entrySpacing: 8,
      sectionSpacing: 16,
      headingStyle: 'underline',
      headingCapitalization: 'uppercase',
      headingSize: 'm',
      nameSize: 'm',
      nameBold: true,
      titleSize: 'm',
      titleStyle: 'normal',
      titlePosition: 'below',
      personalAlign: 'left',
      personalArrangement: 'default',
      personalIconShow: true,
      personalBulletShow: false,
      personalBarShow: false,
      personalIconStyle: 'default',
      photoShow: false,
      photoGrayscale: false,
      photoSize: 'm',
      photoShape: 'circle',
      skillsStyle: 'grid',
      skillsColumns: 1,
      languagesStyle: 'grid',
      languagesColumns: 1,
      interestsStyle: 'grid',
      interestsColumns: 1,
      certificationsStyle: 'grid',
      certificationsColumns: 1,
      showSummaryHeading: true,
      showPageNumbers: true,
      showEmailInFooter: false,
      showNameInFooter: false,
      linkUnderline: true,
      linkBlueColor: false,
      linkIcon: true,
      entryLayout: 'default',
      entryTitleSize: 'm',
      entrySubtitleStyle: 'normal',
      entrySubtitlePlacement: 'next-line',
      descriptionIndent: false,
      listStyle: 'bullet',
      educationOrder: 'degree-school',
      workOrder: 'title-employer',
      workGroupPromotions: false,
      accentType: 'basic',
      applyAccentTo: ['headings', 'headingLine'],
    }
  },
  {
    id: 'modern-pink',
    name: 'Modern Pink',
    description: 'Fresh pink accent for creative professionals',
    preview: {
      primaryColor: '#ff4d7d',
      secondaryColor: '#fff1f2',
      accentColor: '#be185d',
      fontFamily: 'Outfit',
      layout: 'single',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
    },
    design: {
      fontSize: 10.5,
      lineHeight: 1.5,
      marginLR: 15,
      marginTB: 18,
      entrySpacing: 6,
      sectionSpacing: 14,
      headingStyle: 'underline',
      headingCapitalization: 'uppercase',
      headingSize: 'm',
      nameSize: 'l',
      nameBold: true,
      titleSize: 's',
      titleStyle: 'italic',
      titlePosition: 'below',
      personalAlign: 'center',
      personalArrangement: 'horizontal',
      personalIconShow: false,
      personalBulletShow: true,
      personalBarShow: false,
      personalIconStyle: 'default',
      photoShow: false,
      photoGrayscale: false,
      photoSize: 'm',
      photoShape: 'circle',
      skillsStyle: 'bubble',
      skillsColumns: 4,
      languagesStyle: 'grid',
      languagesColumns: 2,
      interestsStyle: 'grid',
      interestsColumns: 3,
      certificationsStyle: 'grid',
      certificationsColumns: 2,
      showSummaryHeading: true,
      showPageNumbers: false,
      showEmailInFooter: false,
      showNameInFooter: false,
      linkUnderline: false,
      linkBlueColor: false,
      linkIcon: true,
      entryLayout: 'default',
      entryTitleSize: 'm',
      entrySubtitleStyle: 'italic',
      entrySubtitlePlacement: 'next-line',
      descriptionIndent: false,
      listStyle: 'bullet',
      educationOrder: 'degree-school',
      workOrder: 'title-employer',
      workGroupPromotions: false,
      accentType: 'basic',
      applyAccentTo: ['headings', 'name'],
    }
  },
  {
    id: 'executive-blue',
    name: 'Executive Blue',
    description: 'Professional blue for senior leadership roles',
    preview: {
      primaryColor: '#1e40af',
      secondaryColor: '#eff6ff',
      accentColor: '#1d4ed8',
      fontFamily: 'Merriweather',
      layout: 'sidebar-left',
      backgroundColor: '#ffffff',
      textColor: '#1e3a8a',
    },
    design: {
      fontSize: 10,
      lineHeight: 1.5,
      marginLR: 14,
      marginTB: 18,
      entrySpacing: 10,
      sectionSpacing: 18,
      headingStyle: 'underline',
      headingCapitalization: 'uppercase',
      headingSize: 'm',
      nameSize: 'l',
      nameBold: true,
      titleSize: 'm',
      titleStyle: 'normal',
      titlePosition: 'below',
      personalAlign: 'left',
      personalArrangement: 'default',
      personalIconShow: true,
      personalBulletShow: false,
      personalBarShow: false,
      personalIconStyle: 'default',
      photoShow: false,
      photoGrayscale: false,
      photoSize: 'm',
      photoShape: 'square',
      skillsStyle: 'list',
      skillsColumns: 1,
      languagesStyle: 'grid',
      languagesColumns: 2,
      interestsStyle: 'grid',
      interestsColumns: 2,
      certificationsStyle: 'grid',
      certificationsColumns: 2,
      showSummaryHeading: true,
      showPageNumbers: true,
      showEmailInFooter: true,
      showNameInFooter: true,
      linkUnderline: true,
      linkBlueColor: true,
      linkIcon: false,
      entryLayout: 'detailed',
      entryTitleSize: 'm',
      entrySubtitleStyle: 'normal',
      entrySubtitlePlacement: 'next-line',
      descriptionIndent: true,
      listStyle: 'bullet',
      educationOrder: 'degree-school',
      workOrder: 'title-employer',
      workGroupPromotions: true,
      accentType: 'basic',
      applyAccentTo: ['headings', 'headingLine'],
    }
  },
  {
    id: 'minimal-dark',
    name: 'Minimal Dark',
    description: 'Elegant minimal design with dark accents',
    preview: {
      primaryColor: '#18181b',
      secondaryColor: '#fafafa',
      accentColor: '#27272a',
      fontFamily: 'Inter',
      layout: 'single',
      backgroundColor: '#ffffff',
      textColor: '#18181b',
    },
    design: {
      fontSize: 11,
      lineHeight: 1.6,
      marginLR: 18,
      marginTB: 20,
      entrySpacing: 5,
      sectionSpacing: 12,
      headingStyle: 'none',
      headingCapitalization: 'none',
      headingSize: 's',
      nameSize: 'l',
      nameBold: true,
      titleSize: 's',
      titleStyle: 'normal',
      titlePosition: 'below',
      personalAlign: 'left',
      personalArrangement: 'horizontal',
      personalIconShow: false,
      personalBulletShow: true,
      personalBarShow: false,
      personalIconStyle: 'default',
      photoShow: false,
      photoGrayscale: false,
      photoSize: 'm',
      photoShape: 'rounded',
      skillsStyle: 'compact',
      skillsColumns: 3,
      languagesStyle: 'compact',
      languagesColumns: 2,
      interestsStyle: 'compact',
      interestsColumns: 3,
      certificationsStyle: 'compact',
      certificationsColumns: 2,
      showSummaryHeading: false,
      showPageNumbers: false,
      showEmailInFooter: false,
      showNameInFooter: false,
      linkUnderline: true,
      linkBlueColor: true,
      linkIcon: false,
      entryLayout: 'compact',
      entryTitleSize: 's',
      entrySubtitleStyle: 'normal',
      entrySubtitlePlacement: 'next-line',
      descriptionIndent: false,
      listStyle: 'none',
      educationOrder: 'degree-school',
      workOrder: 'title-employer',
      workGroupPromotions: false,
      accentType: 'outline',
      applyAccentTo: ['name'],
    }
  },
  {
    id: 'creative-gradient',
    name: 'Creative Gradient',
    description: 'Vibrant gradient design for creative roles',
    preview: {
      primaryColor: '#8b5cf6',
      secondaryColor: '#faf5ff',
      accentColor: '#7c3aed',
      fontFamily: 'Poppins',
      layout: 'modern-header',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
    },
    design: {
      fontSize: 10.5,
      lineHeight: 1.45,
      marginLR: 12,
      marginTB: 16,
      entrySpacing: 8,
      sectionSpacing: 16,
      headingStyle: 'dot',
      headingCapitalization: 'uppercase',
      headingSize: 'm',
      nameSize: 'l',
      nameBold: true,
      titleSize: 'm',
      titleStyle: 'normal',
      titlePosition: 'below',
      personalAlign: 'center',
      personalArrangement: 'default',
      personalIconShow: true,
      personalBulletShow: false,
      personalBarShow: false,
      personalIconStyle: 'minimal',
      photoShow: false,
      photoGrayscale: false,
      photoSize: 'm',
      photoShape: 'circle',
      skillsStyle: 'level',
      skillsColumns: 2,
      languagesStyle: 'grid',
      languagesColumns: 2,
      interestsStyle: 'bubble',
      interestsColumns: 3,
      certificationsStyle: 'grid',
      certificationsColumns: 2,
      showSummaryHeading: true,
      showPageNumbers: false,
      showEmailInFooter: false,
      showNameInFooter: false,
      linkUnderline: false,
      linkBlueColor: false,
      linkIcon: true,
      entryLayout: 'default',
      entryTitleSize: 'm',
      entrySubtitleStyle: 'italic',
      entrySubtitlePlacement: 'next-line',
      descriptionIndent: false,
      listStyle: 'bullet',
      educationOrder: 'degree-school',
      workOrder: 'title-employer',
      workGroupPromotions: false,
      accentType: 'gradient',
      applyAccentTo: ['headings', 'name', 'sections'],
    }
  },
  {
    id: 'elegant-gold',
    name: 'Elegant Gold',
    description: 'Sophisticated design with gold accents',
    preview: {
      primaryColor: '#b45309',
      secondaryColor: '#fffbeb',
      accentColor: '#d97706',
      fontFamily: 'Playfair Display',
      layout: 'sidebar-right',
      backgroundColor: '#ffffff',
      textColor: '#1c1917',
    },
    design: {
      fontSize: 10.5,
      lineHeight: 1.5,
      marginLR: 14,
      marginTB: 18,
      entrySpacing: 8,
      sectionSpacing: 16,
      headingStyle: 'underline',
      headingCapitalization: 'uppercase',
      headingSize: 'm',
      nameSize: 'l',
      nameBold: true,
      titleSize: 'm',
      titleStyle: 'normal',
      titlePosition: 'below',
      personalAlign: 'left',
      personalArrangement: 'default',
      personalIconShow: true,
      personalBulletShow: false,
      personalBarShow: false,
      personalIconStyle: 'default',
      photoShow: false,
      photoGrayscale: false,
      photoSize: 'm',
      photoShape: 'circle',
      skillsStyle: 'grid',
      skillsColumns: 1,
      languagesStyle: 'grid',
      languagesColumns: 1,
      interestsStyle: 'grid',
      interestsColumns: 1,
      certificationsStyle: 'grid',
      certificationsColumns: 1,
      showSummaryHeading: true,
      showPageNumbers: true,
      showEmailInFooter: false,
      showNameInFooter: true,
      linkUnderline: true,
      linkBlueColor: false,
      linkIcon: false,
      entryLayout: 'default',
      entryTitleSize: 'm',
      entrySubtitleStyle: 'normal',
      entrySubtitlePlacement: 'next-line',
      descriptionIndent: false,
      listStyle: 'dash',
      educationOrder: 'school-degree',
      workOrder: 'employer-title',
      workGroupPromotions: false,
      accentType: 'basic',
      applyAccentTo: ['headings', 'headingLine'],
    }
  },
  {
    id: 'tech-green',
    name: 'Tech Green',
    description: 'Modern green theme for tech professionals',
    preview: {
      primaryColor: '#059669',
      secondaryColor: '#ecfdf5',
      accentColor: '#047857',
      fontFamily: 'JetBrains Mono',
      layout: 'single',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
    },
    design: {
      fontSize: 10,
      lineHeight: 1.5,
      marginLR: 14,
      marginTB: 16,
      entrySpacing: 6,
      sectionSpacing: 14,
      headingStyle: 'underline',
      headingCapitalization: 'uppercase',
      headingSize: 'm',
      nameSize: 'l',
      nameBold: true,
      titleSize: 's',
      titleStyle: 'normal',
      titlePosition: 'below',
      personalAlign: 'center',
      personalArrangement: 'horizontal',
      personalIconShow: true,
      personalBulletShow: false,
      personalBarShow: false,
      personalIconStyle: 'icon-only',
      photoShow: false,
      photoGrayscale: false,
      photoSize: 'm',
      photoShape: 'rounded',
      skillsStyle: 'list',
      skillsColumns: 2,
      languagesStyle: 'compact',
      languagesColumns: 3,
      interestsStyle: 'grid',
      interestsColumns: 3,
      certificationsStyle: 'list',
      certificationsColumns: 1,
      showSummaryHeading: true,
      showPageNumbers: true,
      showEmailInFooter: false,
      showNameInFooter: false,
      linkUnderline: true,
      linkBlueColor: true,
      linkIcon: true,
      entryLayout: 'default',
      entryTitleSize: 'm',
      entrySubtitleStyle: 'normal',
      entrySubtitlePlacement: 'next-line',
      descriptionIndent: false,
      listStyle: 'bullet',
      educationOrder: 'degree-school',
      workOrder: 'title-employer',
      workGroupPromotions: false,
      accentType: 'basic',
      applyAccentTo: ['headings', 'headingLine'],
    }
  },
  {
    id: 'classic-maroon',
    name: 'Classic Maroon',
    description: 'Traditional maroon design for conservative industries',
    preview: {
      primaryColor: '#881337',
      secondaryColor: '#fff1f2',
      accentColor: '#9f1239',
      fontFamily: 'Georgia',
      layout: 'sidebar-left',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
    },
    design: {
      fontSize: 10.5,
      lineHeight: 1.45,
      marginLR: 12,
      marginTB: 16,
      entrySpacing: 8,
      sectionSpacing: 16,
      headingStyle: 'underline',
      headingCapitalization: 'uppercase',
      headingSize: 'm',
      nameSize: 'm',
      nameBold: true,
      titleSize: 'm',
      titleStyle: 'normal',
      titlePosition: 'below',
      personalAlign: 'left',
      personalArrangement: 'default',
      personalIconShow: true,
      personalBulletShow: false,
      personalBarShow: false,
      personalIconStyle: 'default',
      photoShow: false,
      photoGrayscale: false,
      photoSize: 'm',
      photoShape: 'circle',
      skillsStyle: 'grid',
      skillsColumns: 1,
      languagesStyle: 'grid',
      languagesColumns: 1,
      interestsStyle: 'grid',
      interestsColumns: 1,
      certificationsStyle: 'grid',
      certificationsColumns: 1,
      showSummaryHeading: true,
      showPageNumbers: true,
      showEmailInFooter: false,
      showNameInFooter: false,
      linkUnderline: true,
      linkBlueColor: false,
      linkIcon: false,
      entryLayout: 'default',
      entryTitleSize: 'm',
      entrySubtitleStyle: 'normal',
      entrySubtitlePlacement: 'next-line',
      descriptionIndent: false,
      listStyle: 'bullet',
      educationOrder: 'degree-school',
      workOrder: 'title-employer',
      workGroupPromotions: false,
      accentType: 'basic',
      applyAccentTo: ['headings', 'headingLine'],
    }
  }
];

// Seed templates up to 50
const generatedTemplates = [...baseTemplates];
const templateNames = [
  'Royal Ruby', 'Oceanic Wave', 'Mint Fresh', 'Warm Sand', 
  'Charcoal Professional', 'Sunset Orange', 'Lavender Field', 
  'Slate Executive', 'Olive Branch', 'Forest Pine', 'Chocolate Luxe', 
  'Steel Bold', 'Champagne Gold', 'Merlot Elegant', 'Petal Pink',
  'Teal Modern', 'Emerald Corporate', 'Bronze Premium', 'Midnight Clean', 
  'Warm Terracotta', 'Coral Creative', 'Plum velvet', 'Classic Blue', 
  'Modern Crimson', 'Alpine White', 'Glacier Mint', 'Dusk Purple', 
  'Nordic Slate', 'Earthy Ochre', 'Cyber Cyberpunk', 'Neon Tech', 
  'Sleek Monochrome', 'Retro Sepia', 'Imperial Gold', 'Deep Violet', 
  'Vibrant Salmon', 'Calm Turquoise', 'Rich Maroon', 'Clean Minimalist', 
  'Academic Classic', 'Executive Charcoal', 'Creative Sunset'
];

for (let i = 0; i < 42; i++) {
  const palette = colorPalettes[i % colorPalettes.length];
  const font = fontFamilies[i % fontFamilies.length];
  const layout = layouts[i % layouts.length];
  const hStyle = headingStyles[i % headingStyles.length];
  const hSize = headingSizes[i % headingSizes.length];
  const nSize = nameSizes[i % nameSizes.length];
  const arrange = personalArrangements[i % personalArrangements.length];
  const iconStyle = personalIconStyles[i % personalIconStyles.length];
  const skillStyle = skillsStyles[i % skillsStyles.length];

  const name = templateNames[i] || `Template ${i + 9}`;
  const id = name.toLowerCase().replace(/\s+/g, '-');

  generatedTemplates.push({
    id,
    name,
    description: `A premium ${layout.replace('-', ' ')} template using ${font} with ${palette.name} highlights.`,
    preview: {
      primaryColor: palette.primary,
      secondaryColor: palette.secondary,
      accentColor: palette.accent,
      fontFamily: font,
      layout: layout,
      backgroundColor: '#ffffff',
      textColor: '#1f2937'
    },
    design: {
      fontSize: 10 + (i % 3) * 0.5,
      lineHeight: 1.4 + (i % 4) * 0.05,
      marginLR: 12 + (i % 7),
      marginTB: 14 + (i % 7),
      entrySpacing: 6 + (i % 5),
      sectionSpacing: 14 + (i % 5),
      headingStyle: hStyle,
      headingCapitalization: i % 2 === 0 ? 'uppercase' : 'none',
      headingSize: hSize,
      nameSize: nSize,
      nameBold: true,
      titleSize: 'm',
      titleStyle: i % 3 === 0 ? 'italic' : 'normal',
      titlePosition: 'below',
      personalAlign: layout.includes('sidebar') ? 'left' : (i % 3 === 0 ? 'center' : 'left'),
      personalArrangement: arrange,
      personalIconShow: i % 4 !== 0,
      personalBulletShow: i % 4 === 0,
      personalBarShow: false,
      personalIconStyle: iconStyle,
      photoShow: true,
      photoGrayscale: i % 3 === 0,
      photoSize: 'm',
      photoShape: i % 2 === 0 ? 'circle' : 'rounded',
      skillsStyle: skillStyle,
      skillsColumns: skillStyle === 'grid' ? 2 : 3,
      languagesStyle: 'grid',
      languagesColumns: 2,
      interestsStyle: 'compact',
      interestsColumns: 3,
      certificationsStyle: 'list',
      certificationsColumns: 1,
      showSummaryHeading: i % 5 !== 0,
      showPageNumbers: true,
      showEmailInFooter: false,
      showNameInFooter: false,
      linkUnderline: true,
      linkBlueColor: i % 2 === 0,
      linkIcon: i % 3 === 0,
      entryLayout: i % 3 === 0 ? 'compact' : 'default',
      entryTitleSize: 'm',
      entrySubtitleStyle: 'normal',
      entrySubtitlePlacement: 'next-line',
      descriptionIndent: i % 4 === 0,
      listStyle: 'bullet',
      educationOrder: 'degree-school',
      workOrder: 'title-employer',
      workGroupPromotions: false,
      accentType: i % 4 === 0 ? 'gradient' : 'basic',
      applyAccentTo: ['headings', 'headingLine'],
    }
  });
}

// Generate the TypeScript file contents
let fileContent = `export interface DesignTemplate {
  id: string;
  name: string;
  description: string;
  preview: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    fontFamily: string;
    layout: 'sidebar-left' | 'sidebar-right' | 'single' | 'modern-header' | 'double-header';
    backgroundColor: string;
    textColor: string;
  };
  design: {
    fontSize: number;
    lineHeight: number;
    marginLR: number;
    marginTB: number;
    entrySpacing: number;
    sectionSpacing: number;
    headingStyle: string;
    headingCapitalization: 'uppercase' | 'none';
    headingSize: 's' | 'm' | 'l';
    nameSize: 's' | 'm' | 'l';
    nameBold: boolean;
    titleSize: 's' | 'm' | 'l';
    titleStyle: 'normal' | 'italic';
    titlePosition: 'below' | 'beside';
    personalAlign: 'left' | 'center' | 'right';
    personalArrangement: 'default' | 'horizontal' | 'stacked';
    personalIconShow: boolean;
    personalBulletShow: boolean;
    personalBarShow: boolean;
    personalIconStyle: 'default' | 'minimal' | 'icon-only';
    photoShow: boolean;
    photoGrayscale: boolean;
    photoSize: 's' | 'm' | 'l';
    photoShape: 'circle' | 'square' | 'rounded';
    skillsStyle: 'grid' | 'list' | 'compact' | 'bubble' | 'level';
    skillsColumns: number;
    languagesStyle: 'grid' | 'list' | 'compact' | 'bubble' | 'level';
    languagesColumns: number;
    interestsStyle: 'grid' | 'list' | 'compact' | 'bubble';
    interestsColumns: number;
    certificationsStyle: 'grid' | 'list' | 'compact' | 'bubble';
    certificationsColumns: number;
    showSummaryHeading: boolean;
    showPageNumbers: boolean;
    showEmailInFooter: boolean;
    showNameInFooter: boolean;
    linkUnderline: boolean;
    linkBlueColor: boolean;
    linkIcon: boolean;
    entryLayout: 'default' | 'compact' | 'detailed';
    entryTitleSize: 's' | 'm' | 'l';
    entrySubtitleStyle: 'normal' | 'italic';
    entrySubtitlePlacement: 'next-line' | 'same-line';
    descriptionIndent: boolean;
    listStyle: 'bullet' | 'dash' | 'number' | 'none';
    educationOrder: 'degree-school' | 'school-degree';
    workOrder: 'title-employer' | 'employer-title';
    workGroupPromotions: boolean;
    accentType: 'basic' | 'gradient' | 'outline';
    applyAccentTo: Array<'headings' | 'headingLine' | 'name' | 'photo' | 'sections'>;
  };
}

export const DESIGN_TEMPLATES: DesignTemplate[] = ${JSON.stringify(generatedTemplates, null, 2)};

export function getDesignTemplate(id: string): DesignTemplate | undefined {
  return DESIGN_TEMPLATES.find(t => t.id === id);
}

export function getDesignTemplateByLayout(layout: string): DesignTemplate[] {
  return DESIGN_TEMPLATES.filter(t => t.preview.layout === layout);
}

export function applyDesignTemplate(template: DesignTemplate, customOverrides?: Partial<DesignTemplate['design']>): DesignTemplate['design'] {
  return {
    ...template.design,
    ...customOverrides,
  };
}
`;

fs.writeFileSync(targetPath, fileContent, 'utf-8');
console.log('Successfully wrote 50 unique premium design templates to design-templates.ts!');
