import { HEADING_STYLES } from './design-options';

type Preset = {
  id: string;
  name: string;
  description: string;
  designPatch: Record<string, any>;
};

// Deterministic pseudo-random generator (stable across reloads)
const mulberry32 = (seed: number) => () => {
  let t = (seed += 0x6D2B79F5);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const pick = <T,>(rng: () => number, arr: T[]) => arr[Math.floor(rng() * arr.length)];

const palettes = [
  { primary: '#ff4d7d', secondary: '#f8fafc', text: '#111827', bg: '#ffffff' },
  { primary: '#2563eb', secondary: '#f1f5f9', text: '#0f172a', bg: '#ffffff' },
  { primary: '#10b981', secondary: '#ecfeff', text: '#0f172a', bg: '#ffffff' },
  { primary: '#f59e0b', secondary: '#fff7ed', text: '#111827', bg: '#ffffff' },
  { primary: '#8b5cf6', secondary: '#faf5ff', text: '#111827', bg: '#ffffff' },
  { primary: '#ef4444', secondary: '#fff1f2', text: '#111827', bg: '#ffffff' },
  { primary: '#06b6d4', secondary: '#ecfeff', text: '#0f172a', bg: '#ffffff' },
  { primary: '#0ea5e9', secondary: '#f0f9ff', text: '#0f172a', bg: '#ffffff' },
  { primary: '#111827', secondary: '#f8fafc', text: '#111827', bg: '#ffffff' },
];

const layouts = ['single', 'sidebar-left', 'sidebar-right', 'modern-header', 'double-header'] as const;
const headingSizes = ['s', 'm', 'l', 'xl'] as const;
const nameSizes = ['s', 'm', 'l', 'xl'] as const;
const shadows = ['none', 'sm', 'md', 'lg'] as const;
const radii = ['none', 'md', 'lg', 'xl'] as const;

const fontPacks = [
  { cat: 'sans', family: 'Inter' },
  { cat: 'sans', family: 'Poppins' },
  { cat: 'sans', family: 'Montserrat' },
  { cat: 'sans', family: 'Roboto' },
  { cat: 'serif', family: 'Merriweather' },
  { cat: 'serif', family: 'Lora' },
  { cat: 'serif', family: 'Playfair Display' },
  { cat: 'mono', family: 'Fira Code' },
];

const headingIds = HEADING_STYLES.map(h => h.id);

export const DESIGN_PRESETS: Preset[] = Array.from({ length: 1000 }).map((_, i) => {
  const rng = mulberry32(1337 + i * 97);
  const pal = pick(rng, palettes);
  const layout = pick(rng, [...layouts]);
  const headingStyle = pick(rng, headingIds);
  const headingSize = pick(rng, [...headingSizes]);
  const nameSize = pick(rng, [...nameSizes]);
  const sh = pick(rng, [...shadows]);
  const rad = pick(rng, [...radii]);
  const font = pick(rng, fontPacks);

  const fontSize = 9 + Math.round(rng() * 6) / 2; // 9..12 with 0.5 steps
  const lineHeight = 1.2 + Math.round(rng() * 14) / 20; // 1.2..1.9
  const marginLR = Math.floor(rng() * 26) + 12; // 12..38
  const marginTB = Math.floor(rng() * 26) + 12;
  const sectionSpacing = Math.floor(rng() * 14) + 6;
  const entrySpacing = Math.floor(rng() * 12) + 4;

  const align = pick(rng, ['left', 'center', 'right'] as const);

  return {
    id: `preset_${i + 1}`,
    name: `Preset ${i + 1}`,
    description: `${layout.replace('-', ' ')} · ${headingStyle.split('_')[0]} · ${font.family}`,
    designPatch: {
      primaryColor: pal.primary,
      secondaryColor: pal.secondary,
      textColor: pal.text,
      backgroundColor: pal.bg,
      layout,
      fontCategory: font.cat,
      fontFamily: font.family,
      fontSize,
      lineHeight,
      marginLR,
      marginTB,
      sectionSpacing,
      entrySpacing,
      headingStyle,
      headingSize,
      nameSize,
      shadow: sh,
      borderRadius: rad,
      personalAlign: align,
      applyAccentTo: ['name', 'jobTitle', 'headings', 'headingsLine', 'dates', 'dots'],
    },
  };
});

