import { 
  Square, 
  Circle, 
  Hexagon, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Layout, 
  Columns, 
  Grid3X3,
} from 'lucide-react';

export const FONT_OPTIONS = {
  sans: [
    'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins', 'Outfit', 'Source Sans Pro', 'Karla', 'Mulish', 'Work Sans', 'Nunito'
  ],
  serif: [
    'Playfair Display', 'Merriweather', 'Lora', 'PT Serif', 'Libre Baskerville'
  ],
  mono: [
    'Fira Code', 'Source Code Pro', 'IBM Plex Mono', 'Space Mono'
  ]
};

export type HeadingStylePreview =
  | 'plain'
  | 'underline'
  | 'border-bottom'
  | 'border-left'
  | 'border-right'
  | 'background'
  | 'double-line'
  | 'dot'
  | 'badge'
  | 'capsule'
  | 'overline'
  | 'double-side'
  | 'shadow'
  | 'gradient'
  | 'strikethrough';

export type HeadingStyleOption = {
  id: string;
  label: string;
  preview: HeadingStylePreview;
};

const baseHeadingStyles: HeadingStyleOption[] = [
  { id: 'none',            label: 'Plain',        preview: 'plain' },
  { id: 'underline',       label: 'Underline',    preview: 'underline' },
  { id: 'border-bottom',   label: 'Full Line',    preview: 'border-bottom' },
  { id: 'border-left',     label: 'Left Bar',     preview: 'border-left' },
  { id: 'border-right',    label: 'Right Bar',    preview: 'border-right' },
  { id: 'background',      label: 'Fill BG',      preview: 'background' },
  { id: 'double-line',     label: 'Double',       preview: 'double-line' },
  { id: 'dot',             label: 'Dot',          preview: 'dot' },
  { id: 'badge',           label: 'Badge',        preview: 'badge' },
  { id: 'capsule',         label: 'Capsule',      preview: 'capsule' },
  { id: 'overline',        label: 'Overline',     preview: 'overline' },
  { id: 'double-side',     label: 'Double Bar',   preview: 'double-side' },
  { id: 'shadow',          label: 'Shadow',       preview: 'shadow' },
  { id: 'gradient',        label: 'Gradient',     preview: 'gradient' },
  { id: 'strikethrough',   label: 'Strike',       preview: 'strikethrough' },
  // New styles
  { id: 'dotted-bottom',   label: 'Dotted Line',  preview: 'border-bottom' },
  { id: 'dashed-bottom',   label: 'Dashed Line',  preview: 'border-bottom' },
  { id: 'wave-bottom',     label: 'Wave Line',    preview: 'border-bottom' },
  { id: 'zigzag-bottom',   label: 'Zigzag',       preview: 'border-bottom' },
  { id: 'diamond',         label: 'Diamond',      preview: 'dot' },
  { id: 'star',            label: 'Star',         preview: 'dot' },
  { id: 'arrow-left',      label: 'Arrow Left',   preview: 'border-left' },
  { id: 'arrow-right',     label: 'Arrow Right',  preview: 'border-right' },
  { id: 'bracket-left',    label: 'Bracket [',    preview: 'border-left' },
  { id: 'bracket-right',   label: 'Bracket ]',    preview: 'border-right' },
  { id: 'pill',            label: 'Pill',         preview: 'capsule' },
  { id: 'tag',             label: 'Tag',          preview: 'badge' },
  { id: 'ribbon',          label: 'Ribbon',       preview: 'background' },
  { id: 'flag',            label: 'Flag',         preview: 'border-left' },
  { id: 'ornament',        label: 'Ornament',     preview: 'double-side' },
  { id: 'layered',         label: 'Layered',      preview: 'double-line' },
  { id: 'glow',            label: 'Glow',         preview: 'shadow' },
  { id: 'neon',            label: 'Neon',         preview: 'shadow' },
  { id: 'emboss',          label: 'Emboss',       preview: 'shadow' },
  { id: 'outline',         label: 'Outline',      preview: 'border-bottom' },
  { id: 'filled-outline',  label: 'Filled Outline', preview: 'background' },
  { id: 'split-bg',        label: 'Split BG',     preview: 'background' },
  { id: 'bottom-accent',   label: 'Bottom Accent', preview: 'border-bottom' },
  { id: 'top-accent',      label: 'Top Accent',   preview: 'overline' },
  { id: 'double-underline', label: 'Double Under', preview: 'underline' },
  { id: 'thick-underline', label: 'Thick Under',  preview: 'underline' },
];

const pct = (n: number) => `${n}%`;
const px = (n: number) => `${n}px`;

// Build a large pattern library (~100) using small, renderer-parsable variants.
const generatedHeadingStyles = (): HeadingStyleOption[] => {
  const out: HeadingStyleOption[] = [...baseHeadingStyles];

  const widths = [15, 20, 25, 33, 40, 50, 60, 66, 75, 85, 100];
  const thicks = [1, 2, 3, 4, 5];
  const radii = [0, 4, 6, 10, 14, 18, 999];
  const aligns = [
    { id: 0, label: 'L' },
    { id: 1, label: 'C' },
    { id: 2, label: 'R' },
  ];
  const opacities = [1, 2, 3, 4, 5]; // maps to 8..40 alpha in renderer
  const paddings = [0, 1, 2, 3, 4, 5];

  // Underline variants (width + thickness)
  for (const w of widths) {
    for (const t of thicks) {
      for (const a of aligns) {
        if (w === 100 && t === 2 && a.id === 0) continue; // base already covers this well
        out.push({
          id: `underline_w${w}_t${t}_a${a.id}`,
          label: `Underline ${pct(w)} · ${px(t)} · ${a.label}`,
          preview: 'underline',
        });
      }
    }
  }

  // Overline variants
  for (const w of widths) {
    for (const t of thicks) {
      for (const a of aligns) {
        if (w === 75 && t === 2 && a.id === 0) continue;
        out.push({
          id: `overline_w${w}_t${t}_a${a.id}`,
          label: `Overline ${pct(w)} · ${px(t)} · ${a.label}`,
          preview: 'overline',
        });
      }
    }
  }

  // Full-line variants (thickness)
  for (const t of thicks) {
    if (t === 2) continue;
    out.push({
      id: `border-bottom_t${t}`,
      label: `Full Line · ${px(t)}`,
      preview: 'border-bottom',
    });
  }

  // Side bars (thickness)
  for (const t of thicks) {
    if (t === 2) continue;
    out.push({ id: `border-left_t${t}`, label: `Left Bar · ${px(t)}`, preview: 'border-left' });
    out.push({ id: `border-right_t${t}`, label: `Right Bar · ${px(t)}`, preview: 'border-right' });
  }

  // Badge variants (radius)
  for (const r of radii) {
    if (r === 6) continue;
    out.push({
      id: `badge_r${r}`,
      label: r === 999 ? 'Badge · Pill' : `Badge · r${r}`,
      preview: 'badge',
    });
  }

  // Capsule border thickness variants
  for (const t of thicks) {
    if (t === 2) continue;
    out.push({
      id: `capsule_t${t}`,
      label: `Capsule · ${px(t)}`,
      preview: 'capsule',
    });
  }

  // Background fill variants (radius)
  for (const r of [0, 4, 6, 10, 14, 18, 24]) {
    if (r === 6) continue;
    for (const o of opacities) {
      for (const p of paddings) {
        out.push({
          id: `background_r${r}_o${o}_p${p}`,
          label: r === 0 ? `Fill BG · Square · o${o} · p${p}` : `Fill BG · r${r} · o${o} · p${p}`,
          preview: 'background',
        });
      }
    }
  }

  // Shadow & gradient subtle variants (radius)
  for (const r of [0, 4, 6, 10, 14, 18, 24]) {
    if (r === 6) continue;
    out.push({ id: `shadow_r${r}`, label: r === 0 ? 'Shadow · Square' : `Shadow · r${r}`, preview: 'shadow' });
    out.push({ id: `gradient_r${r}`, label: r === 0 ? 'Gradient · Square' : `Gradient · r${r}`, preview: 'gradient' });
  }

  // Double-line thickness variants
  for (const t of [1, 2, 3, 4, 5]) {
    if (t === 2) continue;
    out.push({ id: `double-line_t${t}`, label: `Double · ${px(t)}`, preview: 'double-line' });
  }

  // Double-side thickness variants
  for (const t of thicks) {
    if (t === 2) continue;
    out.push({ id: `double-side_t${t}`, label: `Double Bar · ${px(t)}`, preview: 'double-side' });
  }

  // Dot size variants
  for (const s of [4, 5, 6, 7, 8, 9, 10, 11, 12]) {
    if (s === 7) continue;
    out.push({ id: `dot_s${s}`, label: `Dot · ${s}px`, preview: 'dot' });
  }

  // Strike thickness variants
  for (const t of [1, 2, 3, 4]) {
    if (t === 2) continue;
    out.push({ id: `strikethrough_t${t}`, label: `Strike · ${px(t)}`, preview: 'strikethrough' });
  }

  // Ensure stable ordering and unique ids
  const seen = new Set<string>();
  return out.filter(o => (seen.has(o.id) ? false : (seen.add(o.id), true)));
};

export const HEADING_STYLES: HeadingStyleOption[] = generatedHeadingStyles();

export const ACCENT_TARGETS = [
  { id: 'name', label: 'Name' },
  { id: 'jobTitle', label: 'Job title' },
  { id: 'headings', label: 'Headings' },
  { id: 'headingsLine', label: 'Headings Line' },
  { id: 'dots', label: 'Dots/Bars/Bubbles' },
  { id: 'dates', label: 'Dates' },
  { id: 'entrySubtitle', label: 'Entry subtitle' },
  { id: 'linkIcons', label: 'Link icons' },
  { id: 'headerIcons', label: 'Header icons' },
];

export const PHOTO_SHAPES = [
  { id: 'circle', icon: Circle },
  { id: 'rounded', icon: Square },
  { id: 'square', icon: Square },
  { id: 'hexagon', icon: Hexagon },
];

export const ENTRY_LAYOUTS = [
  { id: 'default', label: 'Default' },
  { id: 'side-date', label: 'Side Date' },
  { id: 'compact', label: 'Compact' },
  { id: 'split', label: 'Split' },
];

export const SECTION_LAYOUT_OPTIONS = [
  { id: 'single', name: 'One Column', icon: Layout },
  { id: 'two-column', name: 'Two Columns', icon: Columns },
  { id: 'mix', name: 'Mix', icon: Grid3X3 },
];

export const SKILLS_STYLES = [
  { id: 'grid', label: 'Grid' },
  { id: 'level', label: 'Level' },
  { id: 'compact', label: 'Compact' },
  { id: 'bubble', label: 'Bubble' },
];
