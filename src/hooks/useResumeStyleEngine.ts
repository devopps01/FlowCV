/**
 * Advanced resume style engine hook.
 * Provides granular controls over every CSS property on any resume element,
 * with memoized style computation, theme presets, and serialization.
 */

import { useCallback, useMemo } from 'react';
import type { ResumeData } from '@/components/resume-builder/types';

/* ── Default style palette ─────────────────────────────────────────── */
export const COLOR_PALETTES = {
  professional: {
    primary: '#1f2937',
    accent: '#3b82f6',
    background: '#ffffff',
    text: '#1f2937',
    muted: '#6b7280',
    border: '#e5e7eb',
    heading: '#111827',
    link: '#2563eb',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
  },
  modern: {
    primary: '#6366f1',
    accent: '#ec4899',
    background: '#ffffff',
    text: '#111827',
    muted: '#9ca3af',
    border: '#d1d5db',
    heading: '#0f172a',
    link: '#6366f1',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
  },
  elegant: {
    primary: '#1e3a5f',
    accent: '#c9a84c',
    background: '#fafaf9',
    text: '#292524',
    muted: '#a8a29e',
    border: '#e7e5e4',
    heading: '#1c1917',
    link: '#1e3a5f',
    success: '#059669',
    warning: '#d97706',
    danger: '#dc2626',
  },
  minimal: {
    primary: '#000000',
    accent: '#333333',
    background: '#ffffff',
    text: '#000000',
    muted: '#737373',
    border: '#e0e0e0',
    heading: '#000000',
    link: '#000000',
    success: '#333333',
    warning: '#666666',
    danger: '#999999',
  },
  creative: {
    primary: '#7c3aed',
    accent: '#f43f5e',
    background: '#ffffff',
    text: '#18181b',
    muted: '#a1a1aa',
    border: '#d4d4d8',
    heading: '#09090b',
    link: '#7c3aed',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
  },
  dark: {
    primary: '#e2e8f0',
    accent: '#818cf8',
    background: '#0f172a',
    text: '#e2e8f0',
    muted: '#64748b',
    border: '#334155',
    heading: '#f8fafc',
    link: '#818cf8',
    success: '#34d399',
    warning: '#fbbf24',
    danger: '#f87171',
  },
};

export type PaletteName = keyof typeof COLOR_PALETTES;

/* ── Shadow presets ────────────────────────────────────────────────── */
export const SHADOW_PRESETS = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0,0,0,0.05)',
  md: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
  lg: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)',
  xl: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
};

/* ── Border radius presets ─────────────────────────────────────────── */
export const RADIUS_PRESETS = {
  none: '0px',
  sm: '2px',
  md: '4px',
  lg: '8px',
  xl: '12px',
  '2xl': '16px',
  full: '9999px',
};

/* ── Font pair presets ─────────────────────────────────────────────── */
export const FONT_PAIRS: Record<string, { heading: string; body: string; mono: string }> = {
  classic: { heading: 'Playfair Display', body: 'Lora', mono: 'Fira Code' },
  modern: { heading: 'Inter', body: 'Inter', mono: 'JetBrains Mono' },
  professional: { heading: 'Montserrat', body: 'Open Sans', mono: 'Source Code Pro' },
  creative: { heading: 'Outfit', body: 'Karla', mono: 'Space Mono' },
  elegant: { heading: 'Merriweather', body: 'PT Serif', mono: 'IBM Plex Mono' },
  minimal: { heading: 'Helvetica', body: 'Helvetica', mono: 'Courier New' },
  bold: { heading: 'Poppins', body: 'Nunito', mono: 'Fira Code' },
  playful: { heading: 'Fredoka One', body: 'Nunito', mono: 'Space Mono' },
};

/* ── Layout presets ────────────────────────────────────────────────── */
export interface LayoutPreset {
  name: string;
  columns: number;
  sidebar: boolean;
  sidebarPosition?: 'left' | 'right';
  headerStyle: 'centered' | 'left-aligned' | 'right-aligned' | 'full-width' | 'sidebar' | 'large' | 'double' | 'minimal' | 'split' | 'banner' | 'overlay' | 'sticky';
  description: string;
}

export const LAYOUT_PRESETS: Record<string, LayoutPreset> = {
  // ── Single Column (10 variants) ──
  'single': {
    name: 'Classic Single',
    columns: 1, sidebar: false, headerStyle: 'centered',
    description: 'Traditional single-column with centered header',
  },
  'single-centered': {
    name: 'Centered Single',
    columns: 1, sidebar: false, headerStyle: 'centered',
    description: 'All content and header center-aligned',
  },
  'single-compact': {
    name: 'Compact Single',
    columns: 1, sidebar: false, headerStyle: 'minimal',
    description: 'Reduced spacing, minimal header — fits more',
  },
  'single-minimal': {
    name: 'Minimal Single',
    columns: 1, sidebar: false, headerStyle: 'minimal',
    description: 'Ultra-minimal — just name and content',
  },
  'single-elegant': {
    name: 'Elegant Single',
    columns: 1, sidebar: false, headerStyle: 'left-aligned',
    description: 'Serif font, elegant left-aligned header',
  },
  'single-modern': {
    name: 'Modern Single',
    columns: 1, sidebar: false, headerStyle: 'split',
    description: 'Clean modern sans-serif with split header',
  },
  'single-executive': {
    name: 'Executive Single',
    columns: 1, sidebar: false, headerStyle: 'left-aligned',
    description: 'Bold typography for senior positions',
  },
  'single-bold': {
    name: 'Bold Single',
    columns: 1, sidebar: false, headerStyle: 'centered',
    description: 'Heavy font weights with strong accent color',
  },
  'single-clean': {
    name: 'Clean Single',
    columns: 1, sidebar: false, headerStyle: 'left-aligned',
    description: 'Clean, airy design with lots of white space',
  },
  'single-playful': {
    name: 'Playful Single',
    columns: 1, sidebar: false, headerStyle: 'centered',
    description: 'Rounded fonts, colorful accents, fun layout',
  },
  'single-boxed': {
    name: 'Boxed Single',
    columns: 1, sidebar: false, headerStyle: 'left-aligned',
    description: 'Content in a bordered box with background fill',
  },

  // ── Sidebar Left (10 variants) ──
  'sidebar-left': {
    name: 'Sidebar Left',
    columns: 1, sidebar: true, sidebarPosition: 'left', headerStyle: 'sidebar',
    description: 'Left sidebar for contact + skills (32%)',
  },
  'sidebar-left-wide': {
    name: 'Sidebar L Wide',
    columns: 1, sidebar: true, sidebarPosition: 'left', headerStyle: 'sidebar',
    description: 'Wider left sidebar (40%) for more content',
  },
  'sidebar-left-narrow': {
    name: 'Sidebar L Narrow',
    columns: 1, sidebar: true, sidebarPosition: 'left', headerStyle: 'sidebar',
    description: 'Narrower left sidebar (25%) more space for main',
  },
  'sidebar-left-elegant': {
    name: 'Sidebar L Elegant',
    columns: 1, sidebar: true, sidebarPosition: 'left', headerStyle: 'sidebar',
    description: 'Serif fonts, elegant sidebar with gold accents',
  },
  'sidebar-left-modern': {
    name: 'Sidebar L Modern',
    columns: 1, sidebar: true, sidebarPosition: 'left', headerStyle: 'sidebar',
    description: 'Clean sans-serif sidebar with accent color',
  },
  'sidebar-left-bold': {
    name: 'Sidebar L Bold',
    columns: 1, sidebar: true, sidebarPosition: 'left', headerStyle: 'sidebar',
    description: 'Bold sidebar with thick accent borders',
  },
  'sidebar-left-dark': {
    name: 'Sidebar L Dark',
    columns: 1, sidebar: true, sidebarPosition: 'left', headerStyle: 'sidebar',
    description: 'Dark sidebar background, light text',
  },
  'sidebar-left-clean': {
    name: 'Sidebar L Clean',
    columns: 1, sidebar: true, sidebarPosition: 'left', headerStyle: 'sidebar',
    description: 'Clean light sidebar with minimal styling',
  },
  'sidebar-left-boxed': {
    name: 'Sidebar L Boxed',
    columns: 1, sidebar: true, sidebarPosition: 'left', headerStyle: 'sidebar',
    description: 'Boxed sections inside sidebar with borders',
  },
  'sidebar-left-creative': {
    name: 'Sidebar L Creative',
    columns: 1, sidebar: true, sidebarPosition: 'left', headerStyle: 'sidebar',
    description: 'Creative sidebar with gradient and icons',
  },

  // ── Sidebar Right (8 variants) ──
  'sidebar-right': {
    name: 'Sidebar Right',
    columns: 1, sidebar: true, sidebarPosition: 'right', headerStyle: 'sidebar',
    description: 'Right sidebar for additional information (32%)',
  },
  'sidebar-right-wide': {
    name: 'Sidebar R Wide',
    columns: 1, sidebar: true, sidebarPosition: 'right', headerStyle: 'sidebar',
    description: 'Wider right sidebar (40%)',
  },
  'sidebar-right-narrow': {
    name: 'Sidebar R Narrow',
    columns: 1, sidebar: true, sidebarPosition: 'right', headerStyle: 'sidebar',
    description: 'Narrower right sidebar (25%)',
  },
  'sidebar-right-elegant': {
    name: 'Sidebar R Elegant',
    columns: 1, sidebar: true, sidebarPosition: 'right', headerStyle: 'sidebar',
    description: 'Elegant right sidebar with serif fonts',
  },
  'sidebar-right-modern': {
    name: 'Sidebar R Modern',
    columns: 1, sidebar: true, sidebarPosition: 'right', headerStyle: 'sidebar',
    description: 'Modern right sidebar with clean lines',
  },
  'sidebar-right-bold': {
    name: 'Sidebar R Bold',
    columns: 1, sidebar: true, sidebarPosition: 'right', headerStyle: 'sidebar',
    description: 'Bold right sidebar with thick accent lines',
  },
  'sidebar-right-dark': {
    name: 'Sidebar R Dark',
    columns: 1, sidebar: true, sidebarPosition: 'right', headerStyle: 'sidebar',
    description: 'Dark right sidebar background, light text',
  },
  'sidebar-right-clean': {
    name: 'Sidebar R Clean',
    columns: 1, sidebar: true, sidebarPosition: 'right', headerStyle: 'sidebar',
    description: 'Clean right sidebar with minimal styling',
  },

  // ── Modern Header (8 variants) ──
  'modern-header': {
    name: 'Modern Header',
    columns: 1, sidebar: false, headerStyle: 'large',
    description: 'Large colored header with contact bar',
  },
  'modern-header-dark': {
    name: 'Modern Header Dark',
    columns: 1, sidebar: false, headerStyle: 'large',
    description: 'Dark background header, white text',
  },
  'modern-header-split': {
    name: 'Modern Header Split',
    columns: 1, sidebar: false, headerStyle: 'split',
    description: 'Split header — name left, contact right',
  },
  'modern-header-elegant': {
    name: 'Mod Header Elegant',
    columns: 1, sidebar: false, headerStyle: 'large',
    description: 'Elegant header with serif name and subtle bg',
  },
  'modern-header-bold': {
    name: 'Mod Header Bold',
    columns: 1, sidebar: false, headerStyle: 'large',
    description: 'Bold header with heavy typography and color',
  },
  'modern-header-clean': {
    name: 'Mod Header Clean',
    columns: 1, sidebar: false, headerStyle: 'large',
    description: 'Clean header with light background',
  },
  'modern-header-minimal': {
    name: 'Mod Header Minimal',
    columns: 1, sidebar: false, headerStyle: 'minimal',
    description: 'Minimal header with just name underline',
  },
  'modern-header-banner': {
    name: 'Mod Header Banner',
    columns: 1, sidebar: false, headerStyle: 'banner',
    description: 'Full-width banner header with photo',
  },

  // ── Double Header (6 variants) ──
  'double-header': {
    name: 'Double Header',
    columns: 1, sidebar: false, headerStyle: 'double',
    description: 'Double-row: accent bg + info bar below',
  },
  'double-header-bold': {
    name: 'Double Header Bold',
    columns: 1, sidebar: false, headerStyle: 'double',
    description: 'Bold double header with heavy accent',
  },
  'double-header-clean': {
    name: 'Double Header Clean',
    columns: 1, sidebar: false, headerStyle: 'double',
    description: 'Clean double header with subtle colors',
  },
  'double-header-elegant': {
    name: 'Double Header Eleg',
    columns: 1, sidebar: false, headerStyle: 'double',
    description: 'Elegant double header with serif fonts',
  },
  'double-header-dark': {
    name: 'Double Header Dark',
    columns: 1, sidebar: false, headerStyle: 'double',
    description: 'Dark double header with white text',
  },
  'double-header-minimal': {
    name: 'Double Header Min',
    columns: 1, sidebar: false, headerStyle: 'double',
    description: 'Minimal double header with thin lines',
  },

  // ── Two Column (6 variants) ──
  'two-column': {
    name: 'Two Column',
    columns: 2, sidebar: false, headerStyle: 'full-width',
    description: 'Balanced two-column layout',
  },
  'two-column-reverse': {
    name: 'Two Column Rev',
    columns: 2, sidebar: false, headerStyle: 'full-width',
    description: 'Reversed two-column (contact on right)',
  },
  'two-column-elegant': {
    name: 'Two Col Elegant',
    columns: 2, sidebar: false, headerStyle: 'full-width',
    description: 'Elegant two-column with serif fonts',
  },
  'two-column-modern': {
    name: 'Two Col Modern',
    columns: 2, sidebar: false, headerStyle: 'full-width',
    description: 'Modern two-column with clean lines',
  },
  'two-column-bold': {
    name: 'Two Col Bold',
    columns: 2, sidebar: false, headerStyle: 'full-width',
    description: 'Bold two-column with heavy accents',
  },
  'two-column-clean': {
    name: 'Two Col Clean',
    columns: 2, sidebar: false, headerStyle: 'full-width',
    description: 'Clean two-column with subtle styling',
  },

  // ── Timeline (4 variants) ──
  'timeline': {
    name: 'Timeline',
    columns: 1, sidebar: false, headerStyle: 'centered',
    description: 'Experience as timeline with date markers',
  },
  'timeline-left': {
    name: 'Timeline Left',
    columns: 1, sidebar: false, headerStyle: 'left-aligned',
    description: 'Timeline left-aligned for more structure',
  },
  'timeline-elegant': {
    name: 'Timeline Elegant',
    columns: 1, sidebar: false, headerStyle: 'centered',
    description: 'Elegant timeline with serif fonts',
  },
  'timeline-modern': {
    name: 'Timeline Modern',
    columns: 1, sidebar: false, headerStyle: 'centered',
    description: 'Modern timeline with clean dot markers',
  },
  'timeline-bold': {
    name: 'Timeline Bold',
    columns: 1, sidebar: false, headerStyle: 'centered',
    description: 'Bold timeline with thick date accents',
  },

  // ── Special (8 variants) ──
  'card-header': {
    name: 'Card Header',
    columns: 1, sidebar: false, headerStyle: 'overlay',
    description: 'Accent card behind name and title',
  },
  'card-elegant': {
    name: 'Card Elegant',
    columns: 1, sidebar: false, headerStyle: 'overlay',
    description: 'Elegant card header with soft background',
  },
  'card-modern': {
    name: 'Card Modern',
    columns: 1, sidebar: false, headerStyle: 'overlay',
    description: 'Modern card header with sharp borders',
  },
  'infographic': {
    name: 'Infographic',
    columns: 1, sidebar: false, headerStyle: 'centered',
    description: 'Visual infographic-style resume with icons',
  },
  'infographic-bold': {
    name: 'Info Bold',
    columns: 1, sidebar: false, headerStyle: 'centered',
    description: 'Bold infographic with heavy visual elements',
  },
  'infographic-clean': {
    name: 'Info Clean',
    columns: 1, sidebar: false, headerStyle: 'centered',
    description: 'Clean infographic with subtle icons',
  },
  'academic': {
    name: 'Academic',
    columns: 1, sidebar: false, headerStyle: 'left-aligned',
    description: 'Academic/CV style with publications focus',
  },
  'portfolio': {
    name: 'Portfolio',
    columns: 1, sidebar: false, headerStyle: 'banner',
    description: 'Portfolio style with project focus',
  },
};

/** ── Get label for any layout ID ─────────────────────────────────── */
export function getLayoutLabel(layoutId: string): string {
  return LAYOUT_PRESETS[layoutId]?.name || layoutId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

/** ── Group layouts by category ───────────────────────────────────── */
export const LAYOUT_CATEGORIES: Record<string, string[]> = {
  'Single Column': ['single', 'single-centered', 'single-compact', 'single-minimal', 'single-elegant', 'single-modern', 'single-executive', 'single-bold', 'single-clean', 'single-playful', 'single-boxed'],
  'Sidebar Left': ['sidebar-left', 'sidebar-left-wide', 'sidebar-left-narrow', 'sidebar-left-elegant', 'sidebar-left-modern', 'sidebar-left-bold', 'sidebar-left-dark', 'sidebar-left-clean', 'sidebar-left-boxed', 'sidebar-left-creative'],
  'Sidebar Right': ['sidebar-right', 'sidebar-right-wide', 'sidebar-right-narrow', 'sidebar-right-elegant', 'sidebar-right-modern', 'sidebar-right-bold', 'sidebar-right-dark', 'sidebar-right-clean'],
  'Modern Header': ['modern-header', 'modern-header-dark', 'modern-header-split', 'modern-header-elegant', 'modern-header-bold', 'modern-header-clean', 'modern-header-minimal', 'modern-header-banner'],
  'Double Header': ['double-header', 'double-header-bold', 'double-header-clean', 'double-header-elegant', 'double-header-dark', 'double-header-minimal'],
  'Two Column': ['two-column', 'two-column-reverse', 'two-column-elegant', 'two-column-modern', 'two-column-bold', 'two-column-clean'],
  'Timeline': ['timeline', 'timeline-left', 'timeline-elegant', 'timeline-modern', 'timeline-bold'],
  'Special': ['card-header', 'card-elegant', 'card-modern', 'infographic', 'infographic-bold', 'infographic-clean', 'academic', 'portfolio'],
};

/* ── Complete Style Presets (25+) ─────────────────────────────────── */
export interface CompleteStylePreset {
  id: string;
  name: string;
  description: string;
  /** Full design object to apply */
  design: Record<string, any>;
}

export const COMPLETE_STYLE_PRESETS: CompleteStylePreset[] = [
  // ── Professional (5) ──
  { id: 'pro-corporate', name: 'Corporate Classic', description: 'Dark blue, serif, double-line headings',
    design: { layout: 'single', primaryColor: '#1e3a5f', textColor: '#1f2937', backgroundColor: '#ffffff', fontFamily: 'Merriweather', fontSize: 11, lineHeight: 1.5, headingStyle: 'double-line_t2', headingCapitalization: 'uppercase', entryLayout: 'default', sectionSpacing: 10, marginLR: 15, marginTB: 18, applyAccentTo: ['name', 'headings', 'headingsLine', 'dates'] } },
  { id: 'pro-modern', name: 'Modern Professional', description: 'Indigo accent, clean sans-serif, underline headings',
    design: { layout: 'single', primaryColor: '#4f46e5', textColor: '#111827', backgroundColor: '#ffffff', fontFamily: 'Inter', fontSize: 10.5, lineHeight: 1.45, headingStyle: 'underline_w60_t3', headingCapitalization: 'uppercase', entryLayout: 'default', sectionSpacing: 8, marginLR: 12, marginTB: 14, applyAccentTo: ['name', 'headings', 'headingsLine', 'dates', 'dots'] } },
  { id: 'pro-executive', name: 'Executive Bold', description: 'Dark navy, bold fonts, strikethrough headings',
    design: { layout: 'single', primaryColor: '#0f172a', textColor: '#1e293b', backgroundColor: '#ffffff', fontFamily: 'Montserrat', fontSize: 10, lineHeight: 1.4, headingStyle: 'strikethrough_t3', headingCapitalization: 'uppercase', nameBold: true, entryLayout: 'compact', sectionSpacing: 6, marginLR: 14, marginTB: 16, applyAccentTo: ['name', 'headings', 'dates'] } },
  { id: 'pro-minimal', name: 'Minimal Clean', description: 'All black, thin lines, minimal spacing',
    design: { layout: 'single-minimal', primaryColor: '#000000', textColor: '#000000', backgroundColor: '#ffffff', fontFamily: 'Helvetica', fontSize: 9, lineHeight: 1.3, headingStyle: 'none', headingCapitalization: 'uppercase', nameBold: false, personalAlign: 'left', entryLayout: 'compact', sectionSpacing: 4, marginLR: 10, marginTB: 12, showSummaryHeading: false, applyAccentTo: [] } },
  { id: 'pro-elegant', name: 'Elegant Gold', description: 'Navy + gold, serif, double-side headings',
    design: { layout: 'single-elegant', primaryColor: '#1e3a5f', textColor: '#292524', backgroundColor: '#fafaf9', fontFamily: 'Lora', fontSize: 11, lineHeight: 1.55, headingStyle: 'double-side_t2', headingCapitalization: 'capitalize', entryLayout: 'default', sectionSpacing: 10, marginLR: 16, marginTB: 18, applyAccentTo: ['name', 'headings', 'headingsLine', 'dates'] } },

  // ── Modern (5) ──
  { id: 'mod-sans', name: 'Modern Sans', description: 'Purple accent, Inter, badge headings',
    design: { layout: 'single-modern', primaryColor: '#7c3aed', textColor: '#111827', backgroundColor: '#ffffff', fontFamily: 'Inter', fontSize: 10.5, lineHeight: 1.45, headingStyle: 'background_r6_o2_p1', headingCapitalization: 'uppercase', entryLayout: 'default', sectionSpacing: 8, marginLR: 12, marginTB: 14, applyAccentTo: ['name', 'headings', 'headingsLine', 'dates', 'dots'] } },
  { id: 'mod-pink', name: 'Modern Pink', description: 'Pink accent, Outfit, dot headings',
    design: { layout: 'single-centered', primaryColor: '#ec4899', textColor: '#1f2937', backgroundColor: '#ffffff', fontFamily: 'Outfit', fontSize: 11, lineHeight: 1.5, headingStyle: 'dot_s8', headingCapitalization: 'capitalize', personalAlign: 'center', entryLayout: 'default', sectionSpacing: 8, marginLR: 12, marginTB: 14, applyAccentTo: ['name', 'headings', 'dots', 'dates'] } },
  { id: 'mod-creative', name: 'Creative Color', description: 'Orange accent, Poppins, capsule headings',
    design: { layout: 'single-playful', primaryColor: '#f97316', textColor: '#1c1917', backgroundColor: '#ffffff', fontFamily: 'Poppins', fontSize: 10, lineHeight: 1.4, headingStyle: 'capsule_t2', headingCapitalization: 'uppercase', entryLayout: 'default', sectionSpacing: 8, marginLR: 12, marginTB: 14, applyAccentTo: ['name', 'headings', 'dots', 'dates'] } },
  { id: 'mod-tech', name: 'Tech/Startup', description: 'Blue accent, Fira Code, shadow headings',
    design: { layout: 'single-modern', primaryColor: '#2563eb', textColor: '#0f172a', backgroundColor: '#ffffff', fontFamily: 'Fira Code', fontSize: 9.5, lineHeight: 1.35, headingStyle: 'shadow_r6', headingCapitalization: 'uppercase', entryLayout: 'compact', sectionSpacing: 6, marginLR: 10, marginTB: 12, applyAccentTo: ['name', 'headings', 'dots', 'dates'] } },
  { id: 'mod-bold', name: 'Modern Bold', description: 'Teal accent, heavy weights, gradient headings',
    design: { layout: 'single-bold', primaryColor: '#0d9488', textColor: '#111827', backgroundColor: '#ffffff', fontFamily: 'Montserrat', fontSize: 10.5, lineHeight: 1.45, headingStyle: 'gradient_r4', headingCapitalization: 'uppercase', nameBold: true, entryLayout: 'default', sectionSpacing: 8, marginLR: 12, marginTB: 14, applyAccentTo: ['name', 'headings', 'dots', 'dates'] } },

  // ── Sidebar (5) ──
  { id: 'side-classic', name: 'Sidebar Classic', description: 'Left sidebar, narrow, professional',
    design: { layout: 'sidebar-left-narrow', primaryColor: '#1f2937', textColor: '#1f2937', backgroundColor: '#ffffff', secondaryColor: '#f8fafc', fontFamily: 'Inter', fontSize: 10, lineHeight: 1.45, headingStyle: 'underline_w75_t2', headingCapitalization: 'uppercase', entryLayout: 'default', sectionSpacing: 8, marginLR: 10, marginTB: 12, applyAccentTo: ['name', 'headings', 'headingsLine', 'dates'] } },
  { id: 'side-wide', name: 'Sidebar Wide', description: 'Wide left sidebar with dark background',
    design: { layout: 'sidebar-left-wide', primaryColor: '#ffffff', textColor: '#e2e8f0', backgroundColor: '#0f172a', secondaryColor: '#1e293b', fontFamily: 'Inter', fontSize: 10, lineHeight: 1.45, headingStyle: 'border-bottom_t1', headingCapitalization: 'uppercase', entryLayout: 'default', sectionSpacing: 6, marginLR: 10, marginTB: 12, applyAccentTo: ['name', 'headings', 'dates'] } },
  { id: 'side-right', name: 'Sidebar Right', description: 'Right sidebar elegant with serif',
    design: { layout: 'sidebar-right', primaryColor: '#1e3a5f', textColor: '#292524', backgroundColor: '#fafaf9', secondaryColor: '#f1f5f9', fontFamily: 'Lora', fontSize: 10.5, lineHeight: 1.5, headingStyle: 'double-side_t1', headingCapitalization: 'capitalize', entryLayout: 'default', sectionSpacing: 8, marginLR: 10, marginTB: 12, applyAccentTo: ['name', 'headings', 'headingsLine', 'dates'] } },
  { id: 'side-modern', name: 'Sidebar Modern', description: 'Modern sidebar, bold, color accent',
    design: { layout: 'sidebar-left', primaryColor: '#6366f1', textColor: '#111827', backgroundColor: '#ffffff', secondaryColor: '#eef2ff', fontFamily: 'Inter', fontSize: 10.5, lineHeight: 1.45, headingStyle: 'badge_r6', headingCapitalization: 'uppercase', entryLayout: 'default', sectionSpacing: 8, marginLR: 10, marginTB: 12, applyAccentTo: ['name', 'headings', 'dots', 'dates'] } },
  { id: 'side-creative', name: 'Sidebar Creative', description: 'Creative sidebar with hexagon photo',
    design: { layout: 'sidebar-left-creative', primaryColor: '#7c3aed', textColor: '#18181b', backgroundColor: '#ffffff', secondaryColor: '#f5f3ff', fontFamily: 'Outfit', fontSize: 10, lineHeight: 1.4, headingStyle: 'background_r4_o2_p1', headingCapitalization: 'uppercase', entryLayout: 'compact', sectionSpacing: 6, marginLR: 10, marginTB: 12, nameBold: true, photoShape: 'hexagon', applyAccentTo: ['name', 'headings', 'dots', 'dates'] } },

  // ── Header Styles (5) ──
  { id: 'header-modern', name: 'Modern Header', description: 'Large header with accent background',
    design: { layout: 'modern-header', primaryColor: '#4f46e5', textColor: '#1f2937', backgroundColor: '#ffffff', secondaryColor: '#eef2ff', fontFamily: 'Inter', fontSize: 10.5, lineHeight: 1.45, headingStyle: 'underline_w60_t3', headingCapitalization: 'uppercase', sectionSpacing: 8, marginLR: 12, marginTB: 14, applyAccentTo: ['name', 'headings', 'headingsLine', 'dates'] } },
  { id: 'header-dark', name: 'Header Dark', description: 'Dark header with white text',
    design: { layout: 'modern-header-dark', primaryColor: '#0f172a', textColor: '#e2e8f0', backgroundColor: '#ffffff', secondaryColor: '#0f172a', fontFamily: 'Inter', fontSize: 10.5, lineHeight: 1.45, headingStyle: 'border-bottom_t2', headingCapitalization: 'uppercase', sectionSpacing: 8, marginLR: 12, marginTB: 14, applyAccentTo: ['name', 'headings', 'headingsLine'] } },
  { id: 'header-double', name: 'Double Header', description: 'Double row: accent + info bar',
    design: { layout: 'double-header', primaryColor: '#0891b2', textColor: '#1f2937', backgroundColor: '#ffffff', fontFamily: 'Inter', fontSize: 10.5, lineHeight: 1.45, headingStyle: 'underline_w75_t2', headingCapitalization: 'uppercase', sectionSpacing: 8, marginLR: 12, marginTB: 14, applyAccentTo: ['name', 'headings', 'headingsLine'] } },
  { id: 'header-split', name: 'Split Header', description: 'Name left, contact right in header',
    design: { layout: 'modern-header-split', primaryColor: '#dc2626', textColor: '#1f2937', backgroundColor: '#ffffff', secondaryColor: '#fef2f2', fontFamily: 'Poppins', fontSize: 10.5, lineHeight: 1.45, headingStyle: 'badge_r999', headingCapitalization: 'uppercase', sectionSpacing: 8, marginLR: 12, marginTB: 14, applyAccentTo: ['name', 'headings', 'dots'] } },
  { id: 'header-banner', name: 'Banner Header', description: 'Full-width banner with photo',
    design: { layout: 'modern-header-banner', primaryColor: '#059669', textColor: '#1f2937', backgroundColor: '#ffffff', secondaryColor: '#ecfdf5', fontFamily: 'Inter', fontSize: 10.5, lineHeight: 1.45, headingStyle: 'double-side_t2', headingCapitalization: 'uppercase', photoShow: true, photoSize: 'l', photoShape: 'circle', sectionSpacing: 8, marginLR: 12, marginTB: 14, applyAccentTo: ['name', 'headings', 'headingsLine'] } },

  // ── Two Column (3) ──
  { id: 'two-cols', name: 'Two Column Balanced', description: '50/50 columns for compact resumes',
    design: { layout: 'two-column', primaryColor: '#2563eb', textColor: '#1f2937', backgroundColor: '#ffffff', fontFamily: 'Inter', fontSize: 9.5, lineHeight: 1.35, headingStyle: 'border-bottom_t1', headingCapitalization: 'uppercase', entryLayout: 'compact', sectionSpacing: 6, marginLR: 10, marginTB: 12, applyAccentTo: ['name', 'headings', 'dots'] } },
  { id: 'two-reverse', name: 'Two Col Reverse', description: 'Reversed columns, experience right',
    design: { layout: 'two-column-reverse', primaryColor: '#7c3aed', textColor: '#111827', backgroundColor: '#ffffff', fontFamily: 'Inter', fontSize: 9.5, lineHeight: 1.35, headingStyle: 'dot_s7', headingCapitalization: 'uppercase', entryLayout: 'compact', sectionSpacing: 6, marginLR: 10, marginTB: 12, applyAccentTo: ['name', 'headings', 'dots', 'dates'] } },
  { id: 'two-elegant', name: 'Two Col Elegant', description: 'Elegant two-column with serif',
    design: { layout: 'two-column-elegant', primaryColor: '#1e3a5f', textColor: '#292524', backgroundColor: '#fafaf9', fontFamily: 'Merriweather', fontSize: 10, lineHeight: 1.5, headingStyle: 'double-side_t1', headingCapitalization: 'capitalize', entryLayout: 'default', sectionSpacing: 8, marginLR: 12, marginTB: 14, applyAccentTo: ['name', 'headings', 'headingsLine'] } },

  // ── Timeline (3) ──
  { id: 'timeline-work', name: 'Timeline Work', description: 'Work experience as visual timeline',
    design: { layout: 'timeline', primaryColor: '#0891b2', textColor: '#1f2937', backgroundColor: '#ffffff', fontFamily: 'Inter', fontSize: 10, lineHeight: 1.45, headingStyle: 'underline_w50_t3', headingCapitalization: 'uppercase', entryLayout: 'default', sectionSpacing: 8, marginLR: 12, marginTB: 14, applyAccentTo: ['name', 'headings', 'dots', 'dates'] } },
  { id: 'timeline-mod', name: 'Timeline Modern', description: 'Modern timeline with dot markers',
    design: { layout: 'timeline-modern', primaryColor: '#6366f1', textColor: '#111827', backgroundColor: '#ffffff', fontFamily: 'Inter', fontSize: 10.5, lineHeight: 1.5, headingStyle: 'dot_s9', headingCapitalization: 'uppercase', entryLayout: 'default', sectionSpacing: 8, marginLR: 12, marginTB: 14, applyAccentTo: ['name', 'headings', 'dot', 'dates'] } },
  { id: 'timeline-bold', name: 'Timeline Bold', description: 'Bold timeline with thick date accents',
    design: { layout: 'timeline-bold', primaryColor: '#dc2626', textColor: '#1f2937', backgroundColor: '#ffffff', fontFamily: 'Montserrat', fontSize: 10, lineHeight: 1.4, headingStyle: 'border-left_t3', headingCapitalization: 'uppercase', nameBold: true, entryLayout: 'side-date', sectionSpacing: 8, marginLR: 12, marginTB: 14, applyAccentTo: ['name', 'headings', 'dates'] } },

  // ── Special (4) ──
  { id: 'card-style', name: 'Card Header Style', description: 'Accent card behind name and title',
    design: { layout: 'card-header', primaryColor: '#4f46e5', textColor: '#1f2937', backgroundColor: '#ffffff', fontFamily: 'Inter', fontSize: 10.5, lineHeight: 1.45, headingStyle: 'background_r4_o2_p1', headingCapitalization: 'uppercase', sectionSpacing: 8, marginLR: 12, marginTB: 14, applyAccentTo: ['name', 'headings'] } },
  { id: 'infographic', name: 'Infographic Style', description: 'Visual resume with icons and color',
    design: { layout: 'infographic', primaryColor: '#7c3aed', textColor: '#18181b', backgroundColor: '#ffffff', fontFamily: 'Outfit', fontSize: 10, lineHeight: 1.4, headingStyle: 'gradient_r6', headingCapitalization: 'uppercase', skillsStyle: 'bubble', languagesStyle: 'bubble', interestsStyle: 'bubble', entryLayout: 'compact', sectionSpacing: 6, marginLR: 10, marginTB: 12, applyAccentTo: ['name', 'headings', 'dots'] } },
  { id: 'academic-cv', name: 'Academic CV', description: 'Traditional academic CV format',
    design: { layout: 'academic', primaryColor: '#1f2937', textColor: '#1f2937', backgroundColor: '#ffffff', fontFamily: 'PT Serif', fontSize: 11, lineHeight: 1.55, headingStyle: 'double-line_t1', headingCapitalization: 'uppercase', entryLayout: 'default', sectionSpacing: 10, marginLR: 18, marginTB: 20, applyAccentTo: ['headings', 'headingsLine'] } },
  { id: 'portfolio', name: 'Portfolio Style', description: 'Project-focused portfolio resume',
    design: { layout: 'portfolio', primaryColor: '#059669', textColor: '#111827', backgroundColor: '#ffffff', fontFamily: 'Inter', fontSize: 10.5, lineHeight: 1.45, headingStyle: 'badge_r6', headingCapitalization: 'uppercase', entryLayout: 'default', sectionSpacing: 8, marginLR: 12, marginTB: 14, applyAccentTo: ['name', 'headings', 'dots'] } },
];

/** ── Get a complete style preset by ID ────────────────────────────── */
export function getCompletePreset(id: string): CompleteStylePreset | undefined {
  return COMPLETE_STYLE_PRESETS.find(p => p.id === id);
}

/** ── Group style presets by category ──────────────────────────────── */
export const STYLE_PRESET_CATEGORIES: Record<string, string[]> = {
  'Professional': ['pro-corporate', 'pro-modern', 'pro-executive', 'pro-minimal', 'pro-elegant'],
  'Modern': ['mod-sans', 'mod-pink', 'mod-creative', 'mod-tech', 'mod-bold'],
  'Sidebar': ['side-classic', 'side-wide', 'side-right', 'side-modern', 'side-creative'],
  'Headers': ['header-modern', 'header-dark', 'header-double', 'header-split', 'header-banner'],
  'Two Column': ['two-cols', 'two-reverse', 'two-elegant'],
  'Timeline': ['timeline-work', 'timeline-mod', 'timeline-bold'],
  'Special': ['card-style', 'infographic', 'academic-cv', 'portfolio'],
};

/* ── Computed style result ─────────────────────────────────────────── */
export interface ComputedElementStyle {
  className: string;
  style: React.CSSProperties;
  overrides: Record<string, string>;
}

/* ── The engine hook ──────────────────────────────────────────────── */
export function useResumeStyleEngine(data: ResumeData) {
  const design = data.design;

  /* Build a full CSS custom properties map from the design object */
  const cssVariables = useMemo<Record<string, string>>(() => {
    const vars: Record<string, string> = {
      '--resume-font-family': design.fontFamily || 'Inter',
      '--resume-font-size': `${Math.max(8, Math.min(14, design.fontSize || 9))}pt`,
      '--resume-line-height': String(design.lineHeight || 1.45),
      '--resume-text-color': design.textColor || '#1f2937',
      '--resume-primary-color': design.primaryColor || '#000000',
      '--resume-bg-color': design.backgroundColor || '#ffffff',
      '--resume-border-color': design.borderColor || '#e5e7eb',
      '--resume-accent-color': design.accentColor || design.primaryColor || '#000000',
      '--resume-margin-lr': `${Math.max(6, Math.min(25, design.marginLR || 12))}mm`,
      '--resume-margin-tb': `${Math.max(6, Math.min(25, design.marginTB || 14))}mm`,
      '--resume-section-spacing': `${Math.max(2, Math.min(20, design.sectionSpacing || 8))}mm`,
      '--resume-entry-spacing': `${Math.max(1, Math.min(10, design.entrySpacing || 4))}mm`,
      '--resume-font-category': design.fontCategory || 'sans',
      '--resume-heading-size': design.headingSize === 's' ? '11px' : design.headingSize === 'm' ? '12px' : design.headingSize === 'l' ? '13px' : '12px',
      '--resume-heading-transform': design.headingCapitalization || 'uppercase',
      '--resume-name-size': design.nameSize === 'xs' ? '16px' : design.nameSize === 's' ? '20px' : design.nameSize === 'm' ? '24px' : design.nameSize === 'l' ? '28px' : '22px',
      '--resume-title-size': design.titleSize === 's' ? '10px' : design.titleSize === 'm' ? '11px' : '12px',
      '--resume-photo-size': design.photoSize === 'xs' ? '60px' : design.photoSize === 's' ? '80px' : design.photoSize === 'm' ? '100px' : design.photoSize === 'l' ? '120px' : '140px',
      '--resume-border-radius': design.borderRadius || '0px',
      '--resume-shadow': SHADOW_PRESETS[design.shadow as keyof typeof SHADOW_PRESETS] || 'none',
    };

    // Add section column counts
    if (design.skillsColumns) vars['--resume-skills-columns'] = String(design.skillsColumns);
    if (design.languagesColumns) vars['--resume-languages-columns'] = String(design.languagesColumns);
    if (design.interestsColumns) vars['--resume-interests-columns'] = String(design.interestsColumns);

    // Add spacing overrides
    if (design.entrySpacing) vars['--resume-entry-spacing'] = `${design.entrySpacing}mm`;
    if (design.sectionSpacing) vars['--resume-section-spacing'] = `${design.sectionSpacing}mm`;

    return vars;
  }, [design]);

  /* Convert CSS variables object to inline style block string */
  const cssVariablesString = useMemo(() => {
    return Object.entries(cssVariables)
      .map(([key, value]) => `${key}: ${value};`)
      .join('\n');
  }, [cssVariables]);

  /* Compute per-element override style from styleOverrides map */
  const getElementOverrides = useCallback(
    (elementPath: string): React.CSSProperties => {
      return (data.styleOverrides?.[elementPath] || {}) as React.CSSProperties;
    },
    [data.styleOverrides]
  );

  /* Resolve final style for any element: base design + overrides */
  const computeElementStyle = useCallback(
    (
      elementType: 'heading' | 'entry' | 'personalName' | 'personalTitle' | 'description' | 'skill' | 'language' | 'date',
      elementPath?: string
    ): React.CSSProperties => {
      const base: React.CSSProperties = {};

      switch (elementType) {
        case 'heading':
          base.fontSize = cssVariables['--resume-heading-size'];
          base.textTransform = cssVariables['--resume-heading-transform'] as any;
          base.fontWeight = 700;
          base.color = design.primaryColor || '#000000';
          break;
        case 'personalName':
          base.fontSize = cssVariables['--resume-name-size'];
          base.fontWeight = design.nameBold ? 900 : 700;
          base.fontFamily = design.nameFontType === 'creative' ? design.fontFamily : undefined;
          break;
        case 'personalTitle':
          base.fontSize = cssVariables['--resume-title-size'];
          base.fontStyle = design.titleStyle || 'normal';
          break;
        case 'entry':
          base.marginBottom = `${design.entrySpacing || 8}mm`;
          break;
        case 'date':
          base.color = design.accentColor || design.primaryColor || '#000000';
          break;
      }

      // Merge overrides if path provided
      if (elementPath) {
        const overrides = getElementOverrides(elementPath);
        return { ...base, ...overrides };
      }

      return base;
    },
    [design, cssVariables, getElementOverrides]
  );

  /* Compute an inline style tag that applies resume CSS variables to a container */
  const containerStyle: React.CSSProperties = useMemo(() => ({
    fontFamily: design.fontFamily || 'Inter',
    fontSize: `${Math.max(10, Math.round((design.fontSize || 9) * 1.333))}px`,
    lineHeight: Math.min(1.8, Math.max(1.2, design.lineHeight || 1.45)),
    color: design.textColor || '#1f2937',
    backgroundColor: design.backgroundColor || '#ffffff',
  }), [design]);

  return {
    cssVariables,
    cssVariablesString,
    containerStyle,
    getElementOverrides,
    computeElementStyle,
  };
}