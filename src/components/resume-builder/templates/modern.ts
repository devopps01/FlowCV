import { ThemeConfig, LayoutType } from '../types/resume.types';

export interface TemplateConfig {
  name: string;
  layout: LayoutType;
  theme: ThemeConfig;
}

export const modern: TemplateConfig = {
  name: 'Modern',
  layout: 'sidebar-left',
  theme: {
    primaryColor: '#2563eb',
    textColor: '#1f2937',
    backgroundColor: '#ffffff',
    fontFamily: 'Inter',
    fontSize: 10.5,
    lineHeight: 1.45,
    marginLR: 20,
    marginTB: 20,
    entrySpacing: 8,
    sectionSpacing: 10,
    headingSize: 'm',
    headingStyle: 'underline',
    headingCapitalization: 'uppercase',
    personalAlign: 'left',
    photoShow: true,
    photoShape: 'circle',
    nameSize: 'xl',
    nameBold: true,
  },
};

export const minimal: TemplateConfig = {
  name: 'Minimal',
  layout: 'single',
  theme: {
    primaryColor: '#000000',
    textColor: '#333333',
    backgroundColor: '#ffffff',
    fontFamily: 'Inter',
    fontSize: 10,
    lineHeight: 1.5,
    marginLR: 25,
    marginTB: 25,
    entrySpacing: 6,
    sectionSpacing: 12,
    headingSize: 's',
    headingStyle: 'overline',
    headingCapitalization: 'uppercase',
    personalAlign: 'center',
    photoShow: false,
    photoShape: 'square',
    nameSize: 'l',
    nameBold: false,
  },
};

export const professional: TemplateConfig = {
  name: 'Professional',
  layout: 'two-column',
  theme: {
    primaryColor: '#1e3a5f',
    textColor: '#2d3748',
    backgroundColor: '#ffffff',
    fontFamily: 'system-ui',
    fontSize: 11,
    lineHeight: 1.4,
    marginLR: 18,
    marginTB: 18,
    entrySpacing: 10,
    sectionSpacing: 8,
    headingSize: 'm',
    headingStyle: 'border-bottom',
    headingCapitalization: 'uppercase',
    personalAlign: 'left',
    photoShow: true,
    photoShape: 'rounded',
    nameSize: 'xl',
    nameBold: true,
  },
};

export const creative: TemplateConfig = {
  name: 'Creative',
  layout: 'modern-header',
  theme: {
    primaryColor: '#7c3aed',
    textColor: '#1f2937',
    backgroundColor: '#faf5ff',
    fontFamily: 'Poppins',
    fontSize: 10.5,
    lineHeight: 1.45,
    marginLR: 20,
    marginTB: 20,
    entrySpacing: 8,
    sectionSpacing: 10,
    headingSize: 'l',
    headingStyle: 'badge',
    headingCapitalization: 'capitalize',
    personalAlign: 'center',
    photoShow: true,
    photoShape: 'circle',
    nameSize: 'xl',
    nameBold: true,
  },
};