'use client';

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
  Palette, Type, Layout, Sliders, Image, Eye, Square, Circle, Hexagon,
  ChevronDown, ChevronRight, Check, RotateCcw, Sparkles, Copy, Upload,
  Download, Trash2, Settings2, AlignLeft, AlignCenter, AlignRight,
  Bold, Italic, Underline, Minus, Plus, Sun, Moon, Grid3x3,
  Columns, Rows, Layers, GripHorizontal, Maximize2, Minimize2,
  X, Search, RefreshCw, FileJson, FileImage, Scissors,
  PanelRightOpen, PanelRightClose, Undo2, Redo2,
} from 'lucide-react';
import { ResumeData } from './types';
import { 
  COLOR_PALETTES, 
  SHADOW_PRESETS, 
  RADIUS_PRESETS, 
  FONT_PAIRS,
  LAYOUT_PRESETS,
  useResumeStyleEngine,
  type PaletteName
} from '@/hooks/useResumeStyleEngine';
import { FONT_OPTIONS, HEADING_STYLES, ACCENT_TARGETS } from './design-options';

/* ─────────────────────────────────────────────────────────────────────
   Types
   ───────────────────────────────────────────────────────────────────── */

interface AdvancedStylePanelProps {
  data: ResumeData;
  updateDesign: (key: keyof ResumeData['design'], value: any) => void;
  updateNested: (path: string, value: any) => void;
  selectedSectionId?: string | null;
  onClose?: () => void;
  onStylePresetChange?: (presetId: string) => void;
}

type TabId = 'colors' | 'typography' | 'spacing' | 'effects' | 'layout' | 'advanced';

interface TabConfig {
  id: TabId;
  label: string;
  icon: React.ElementType;
  description: string;
}

const TABS: TabConfig[] = [
  { id: 'colors', label: 'Colors', icon: Palette, description: 'Color palettes, gradients, accents' },
  { id: 'typography', label: 'Typography', icon: Type, description: 'Fonts, sizes, spacing, transformations' },
  { id: 'spacing', label: 'Spacing', icon: Sliders, description: 'Margins, padding, section gaps' },
  { id: 'effects', label: 'Effects', icon: Eye, description: 'Borders, shadows, backgrounds, opacity' },
  { id: 'layout', label: 'Layout', icon: Layout, description: 'Column layouts, sidebar, headers' },
  { id: 'advanced', label: 'Advanced', icon: Settings2, description: 'Export/import, presets, CSS vars' },
];

/* ─────────────────────────────────────────────────────────────────────
   Utility Sub-Components
   ───────────────────────────────────────────────────────────────────── */

const Label = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <span className={`text-[9px] font-black uppercase tracking-widest block mb-1 ${className}`} style={{ color: 'var(--app-text-muted)' }}>{children}</span>
);

const SectionBlock = ({ title, icon: Icon, children, defaultOpen = false }: { title: string; icon: React.ElementType; children: React.ReactNode; defaultOpen?: boolean }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl overflow-hidden mb-2" style={{ border: '1px solid var(--app-border)', background: 'var(--app-bg-card)' }}>
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between px-3 py-2.5 transition-colors hover:bg-black/5">
        <div className="flex items-center gap-2">
          <Icon className="w-3.5 h-3.5" style={{ color: 'var(--app-primary)' }} />
          <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--app-text)' }}>{title}</span>
        </div>
        {open ? <ChevronDown className="w-3.5 h-3.5" style={{ color: 'var(--app-text-muted)' }} /> : <ChevronRight className="w-3.5 h-3.5" style={{ color: 'var(--app-text-muted)' }} />}
      </button>
      {open && <div className="px-3 pb-3 space-y-2.5">{children}</div>}
    </div>
  );
};

const SliderRow = ({ label, value, min, max, step = 1, unit = '', onChange }: { label: string; value: number; min: number; max: number; step?: number; unit?: string; onChange: (v: number) => void }) => (
  <div>
    <div className="flex items-center justify-between mb-1">
      <Label>{label}</Label>
      <span className="text-[10px] font-bold" style={{ color: 'var(--app-text-secondary)' }}>{value}{unit}</span>
    </div>
    <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))} className="w-full h-1.5 rounded-full accent-[#ff4d7d] cursor-pointer" />
  </div>
);

const ColorSwatch = ({ color, active, onClick, size = 'md' }: { color: string; active?: boolean; onClick: () => void; size?: 'sm' | 'md' | 'lg' }) => {
  const dim = size === 'sm' ? 'w-5 h-5' : size === 'lg' ? 'w-8 h-8' : 'w-6 h-6';
  return (
    <button
      onClick={onClick}
      className={`${dim} rounded-full border-2 transition-all hover:scale-110 ${active ? 'border-gray-800 scale-110 ring-2 ring-indigo-400 ring-offset-1' : 'border-transparent'}`}
      style={{ backgroundColor: color }}
      title={color}
    />
  );
};

const ToggleChip = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button
    onClick={onClick}
    className="px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all"
    style={active ? { background: 'var(--app-primary)', color: '#fff', border: '1px solid var(--app-primary)' } : { background: 'var(--app-bg-gray)', color: 'var(--app-text-secondary)', border: '1px solid var(--app-border)' }}
  >
    {children}
  </button>
);

const BoolToggle = ({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) => (
  <div className="flex items-center justify-between">
    <span className="text-[10px] font-bold" style={{ color: 'var(--app-text-secondary)' }}>{label}</span>
    <button onClick={() => onChange(!value)} className="relative w-8 h-4.5 rounded-full transition-colors" style={{ background: value ? 'var(--app-primary)' : 'var(--app-bg-medium)' }}>
      <span className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-3.5' : 'translate-x-0'}`} />
    </button>
  </div>
);

/* ─────────────────────────────────────────────────────────────────────
   Color Preset Cards
   ───────────────────────────────────────────────────────────────────── */

const COLOR_PRESET_SWATCHES = ['#ff4d7d', '#7c3aed', '#2563eb', '#0891b2', '#059669', '#d97706', '#dc2626', '#db2777', '#4f46e5', '#0f172a'];

const ColorPresetCard = ({ palette, active, onApply }: { palette: [string, typeof COLOR_PALETTES.professional]; active: boolean; onApply: () => void }) => {
  const [name, colors] = palette;
  return (
    <button
      onClick={onApply}
      className={`w-full p-2 rounded-xl border-2 transition-all text-left ${active ? 'border-[#ff4d7d] bg-[#ff4d7d]/5' : 'border-transparent hover:border-gray-200 bg-white/50'}`}
    >
      <div className="flex gap-1 mb-1.5">
        {[colors.primary, colors.accent, colors.background, colors.text].map((c, i) => (
          <div key={i} className="w-4 h-4 rounded-full border border-gray-200" style={{ backgroundColor: c }} />
        ))}
      </div>
      <span className="text-[9px] font-bold capitalize" style={{ color: 'var(--app-text)' }}>{name}</span>
    </button>
  );
};

/* ─────────────────────────────────────────────────────────────────────
   Border Radius Preset Grid
   ───────────────────────────────────────────────────────────────────── */

const RadiusPreview = ({ value, active, onClick }: { value: string; active: boolean; onClick: () => void }) => {
  const numeric = parseInt(value) || 0;
  const label = Object.entries(RADIUS_PRESETS).find(([, v]) => v === value)?.[0] || `${numeric}px`;
  return (
    <button
      onClick={onClick}
      className={`p-2 rounded-lg border-2 transition-all ${active ? 'border-[#ff4d7d] bg-[#ff4d7d]/5' : 'border-transparent hover:border-gray-200'}`}
    >
      <div className="w-8 h-6 bg-gray-300 mx-auto" style={{ borderRadius: value }} />
      <span className="text-[8px] font-bold text-center block mt-1" style={{ color: 'var(--app-text-muted)' }}>{label}</span>
    </button>
  );
};

/* ─────────────────────────────────────────────────────────────────────
   Main AdvancedStylePanel
   ───────────────────────────────────────────────────────────────────── */

export default function AdvancedStylePanel({
  data,
  updateDesign,
  updateNested,
  selectedSectionId,
  onClose,
  onStylePresetChange,
}: AdvancedStylePanelProps) {
  const d = data.design;
  const { cssVariables, containerStyle } = useResumeStyleEngine(data);
  const [activeTab, setActiveTab] = useState<TabId>('colors');
  const [showExporter, setShowExporter] = useState(false);
  const [searchFont, setSearchFont] = useState('');
  const [cssVarsExpanded, setCssVarsExpanded] = useState(false);

  /* ── Helper ────────────────────────────────────────────────────── */
  const update = useCallback((key: keyof ResumeData['design'], value: any) => {
    updateDesign(key, value);
  }, [updateDesign]);

  /* ── Apply full color palette ──────────────────────────────────── */
  const applyPalette = useCallback((name: PaletteName) => {
    const palette = COLOR_PALETTES[name];
    update('primaryColor', palette.primary);
    update('accentColor', palette.accent);
    update('textColor', palette.text);
    update('backgroundColor', palette.background);
    update('borderColor', palette.border);
  }, [update]);

  /* ── Apply font pair ────────────────────────────────────────────── */
  const applyFontPair = useCallback((pairId: string) => {
    const pair = FONT_PAIRS[pairId];
    if (pair) {
      update('fontFamily', pair.body);
    }
  }, [update]);

  /* ── Apply layout preset ────────────────────────────────────────── */
  const applyLayoutPreset = useCallback((layoutId: string) => {
    update('layout', layoutId as any);
    const preset = LAYOUT_PRESETS[layoutId as keyof typeof LAYOUT_PRESETS];
    if (preset?.name?.toLowerCase().includes('elegant')) {
      update('fontFamily', 'Merriweather');
      update('headingStyle', 'double-side_t1');
    } else if (preset?.name?.toLowerCase().includes('modern')) {
      update('fontFamily', 'Inter');
      update('headingStyle', 'underline_w60_t3');
    } else if (preset?.name?.toLowerCase().includes('compact')) {
      update('fontFamily', 'Inter');
      update('entrySpacing', 2);
      update('sectionSpacing', 4);
    }
  }, [update]);

  /* ── Export style config as JSON ───────────────────────────────── */
  const handleExportStyles = useCallback(() => {
    const exportObj = {
      version: 1,
      exportedAt: new Date().toISOString(),
      design: data.design,
      activeSections: data.activeSections,
      styleOverrides: data.styleOverrides,
    };
    const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.title || 'resume'}-styles.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [data]);

  /* ── Import style config ────────────────────────────────────────── */
  const handleImportStyles = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const config = JSON.parse(ev.target?.result as string);
          if (config.design) {
            Object.entries(config.design).forEach(([key, value]) => {
              updateDesign(key as keyof ResumeData['design'], value);
            });
          }
          if (config.styleOverrides) {
            updateNested('styleOverrides', config.styleOverrides);
          }
        } catch {
          // silently fail
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, [updateDesign, updateNested]);

  /* ── Reset all styles to defaults ───────────────────────────────── */
  const handleResetAll = useCallback(() => {
    const resetKey: (keyof ResumeData['design'])[] = [
      'fontFamily', 'fontSize', 'lineHeight', 'marginLR', 'marginTB',
      'entrySpacing', 'sectionSpacing', 'primaryColor', 'textColor',
      'backgroundColor', 'headingStyle', 'headingCapitalization',
      'headingSize', 'entryLayout', 'listStyle', 'personalAlign',
      'nameSize', 'nameBold', 'photoShow', 'photoSize', 'photoShape',
      'skillsStyle', 'skillsColumns', 'layout',
    ];
    resetKey.forEach(k => {
      // We just set known defaults
      switch(k) {
        case 'fontFamily': update(k, 'Inter'); break;
        case 'fontSize': update(k, 10.5); break;
        case 'lineHeight': update(k, 1.45); break;
        case 'marginLR': update(k, 12); break;
        case 'marginTB': update(k, 14); break;
        case 'entrySpacing': update(k, 4); break;
        case 'sectionSpacing': update(k, 8); break;
        case 'primaryColor': update(k, '#000000'); break;
        case 'textColor': update(k, '#1f2937'); break;
        case 'backgroundColor': update(k, '#ffffff'); break;
        case 'headingStyle': update(k, 'none'); break;
        case 'headingCapitalization': update(k, 'uppercase'); break;
        case 'nameSize': update(k, 'm'); break;
        case 'layout': update(k, 'single' as any); break;
        default: break;
      }
    });
    updateNested('styleOverrides', {});
  }, [update, updateNested]);

  const accentColor = d.primaryColor || '#ff4d7d';

  /* ────────────────────────────────────────────────────────────────
     Tab: Colors
     ──────────────────────────────────────────────────────────────── */
  const renderColorsTab = () => (
    <div className="space-y-3">
      {/* Color Palettes */}
      <SectionBlock title="Color Palettes" icon={Palette} defaultOpen={true}>
        <div className="grid grid-cols-2 gap-2">
          {(Object.entries(COLOR_PALETTES) as [PaletteName, typeof COLOR_PALETTES.professional][]).map(([name, colors]) => {
            const isActive = d.primaryColor === colors.primary && d.backgroundColor === colors.background;
            return (
              <ColorPresetCard
                key={name}
                palette={[name, colors]}
                active={isActive}
                onApply={() => applyPalette(name)}
              />
            );
          })}
        </div>
      </SectionBlock>

      {/* Accent Color */}
      <SectionBlock title="Accent Color" icon={Circle} defaultOpen={true}>
        <div className="flex flex-wrap gap-2 mb-2">
          {COLOR_PRESET_SWATCHES.map(c => (
            <ColorSwatch key={c} color={c} active={d.primaryColor === c} onClick={() => update('primaryColor', c)} size="md" />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input type="color" value={d.primaryColor || '#ff4d7d'} onChange={e => update('primaryColor', e.target.value)} className="w-8 h-8 rounded-lg border border-gray-200 cursor-pointer p-0.5" />
          <input type="text" value={d.primaryColor || '#ff4d7d'} onChange={e => { if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) update('primaryColor', e.target.value); }} className="flex-1 p-1.5 bg-gray-50 border border-gray-100 rounded-lg text-[10px] font-mono font-bold focus:ring-1 focus:ring-[#ff4d7d]" />
        </div>
      </SectionBlock>

      {/* Text & Background */}
      <SectionBlock title="Text & Background" icon={Sun} defaultOpen={false}>
        <div>
          <Label>Text Color</Label>
          <div className="flex items-center gap-2">
            <input type="color" value={d.textColor || '#1f2937'} onChange={e => update('textColor', e.target.value)} className="w-7 h-7 rounded-lg border border-gray-200 cursor-pointer p-0.5" />
            <input type="text" value={d.textColor || '#1f2937'} onChange={e => { if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) update('textColor', e.target.value); }} className="flex-1 p-1.5 bg-gray-50 border border-gray-100 rounded-lg text-[10px] font-mono font-bold" />
          </div>
        </div>
        <div>
          <Label>Background Color</Label>
          <div className="flex items-center gap-2">
            <input type="color" value={d.backgroundColor || '#ffffff'} onChange={e => update('backgroundColor', e.target.value)} className="w-7 h-7 rounded-lg border border-gray-200 cursor-pointer p-0.5" />
            <input type="text" value={d.backgroundColor || '#ffffff'} onChange={e => { if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) update('backgroundColor', e.target.value); }} className="flex-1 p-1.5 bg-gray-50 border border-gray-100 rounded-lg text-[10px] font-mono font-bold" />
          </div>
        </div>
      </SectionBlock>

      {/* Accent Targets */}
      <SectionBlock title="Apply Accent To" icon={Layers} defaultOpen={false}>
        <div className="flex flex-wrap gap-1.5">
          {ACCENT_TARGETS.map(t => {
            const active = (d.applyAccentTo || []).includes(t.id);
            return (
              <button
                key={t.id}
                onClick={() => {
                  const current = d.applyAccentTo || [];
                  update('applyAccentTo', active ? current.filter(x => x !== t.id) : [...current, t.id]);
                }}
                className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-wider border transition-all ${active ? 'bg-[#ff4d7d] text-white border-[#ff4d7d]' : 'border-gray-200 text-gray-500'}`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </SectionBlock>
    </div>
  );

  /* ────────────────────────────────────────────────────────────────
     Tab: Typography
     ──────────────────────────────────────────────────────────────── */
  const renderTypographyTab = () => (
    <div className="space-y-3">
      {/* Font Family */}
      <SectionBlock title="Font Family" icon={Type} defaultOpen={true}>
        <div>
          <Label>Current: {d.fontFamily || 'Inter'}</Label>
          <input
            type="text"
            placeholder="Search fonts..."
            value={searchFont}
            onChange={e => setSearchFont(e.target.value)}
            className="w-full p-2 rounded-lg text-[10px] font-bold mb-2 focus:ring-1 focus:ring-[#ff4d7d] bg-gray-50 border border-gray-100"
          />
          <div className="max-h-36 overflow-y-auto space-y-0.5 custom-scrollbar">
            {(['sans', 'serif', 'mono'] as const).map(cat => {
              const fonts = FONT_OPTIONS[cat].filter(f => f.toLowerCase().includes(searchFont.toLowerCase()));
              if (fonts.length === 0) return null;
              return (
                <div key={cat}>
                  <div className="text-[8px] font-black uppercase tracking-widest px-1 py-0.5 text-gray-400">{cat}</div>
                  {fonts.map(font => (
                    <button
                      key={font}
                      onClick={() => update('fontFamily', font)}
                      className={`w-full flex items-center justify-between px-2 py-1.5 rounded-md text-[11px] transition-colors ${d.fontFamily === font ? 'bg-[#ff4d7d]/10 text-[#ff4d7d]' : 'hover:bg-gray-50'}`}
                      style={{ fontFamily: font }}
                    >
                      {font}
                      {d.fontFamily === font && <Check className="w-3 h-3" />}
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </SectionBlock>

      {/* Font Presets */}
      <SectionBlock title="Font Pairs" icon={Sparkles} defaultOpen={false}>
        <div className="grid grid-cols-2 gap-1.5">
          {Object.entries(FONT_PAIRS).map(([id, pair]) => (
            <button
              key={id}
              onClick={() => applyFontPair(id)}
              className={`p-2 rounded-lg border text-left transition-all ${d.fontFamily === pair.body ? 'border-[#ff4d7d] bg-[#ff4d7d]/5' : 'border-gray-100 hover:border-gray-200'}`}
            >
              <span className="text-[9px] font-black uppercase block capitalize" style={{ color: 'var(--app-text)' }}>{id}</span>
              <span className="text-[9px] text-gray-500 block" style={{ fontFamily: pair.body }}>{pair.body}</span>
              <span className="text-[8px] text-gray-400 block" style={{ fontFamily: pair.heading }}>{pair.heading}</span>
            </button>
          ))}
        </div>
      </SectionBlock>

      {/* Font Size & Line Height */}
      <SectionBlock title="Sizing" icon={Maximize2} defaultOpen={true}>
        <SliderRow label="Font Size (pt)" value={d.fontSize ?? 10.5} min={8} max={14} step={0.5} unit="pt" onChange={v => update('fontSize', v)} />
        <SliderRow label="Line Height" value={d.lineHeight ?? 1.45} min={1.2} max={1.8} step={0.05} onChange={v => update('lineHeight', v)} />
      </SectionBlock>

      {/* Name & Title */}
      <SectionBlock title="Name & Title" icon={AlignLeft} defaultOpen={false}>
        <div>
          <Label>Name Size</Label>
          <div className="flex gap-1.5">
            {(['xs', 's', 'm', 'l', 'xl'] as const).map(s => (
              <ToggleChip key={s} active={d.nameSize === s} onClick={() => update('nameSize', s)}>{s.toUpperCase()}</ToggleChip>
            ))}
          </div>
        </div>
        <BoolToggle label="Bold Name" value={d.nameBold ?? true} onChange={v => update('nameBold', v)} />
        <div>
          <Label>Title Size</Label>
          <div className="flex gap-1.5">
            {(['s', 'm', 'l'] as const).map(s => (
              <ToggleChip key={s} active={d.titleSize === s} onClick={() => update('titleSize', s)}>{s.toUpperCase()}</ToggleChip>
            ))}
          </div>
        </div>
        <div>
          <Label>Title Style</Label>
          <div className="flex gap-1.5">
            {(['normal', 'italic'] as const).map(s => (
              <ToggleChip key={s} active={d.titleStyle === s} onClick={() => update('titleStyle', s)}>{s}</ToggleChip>
            ))}
          </div>
        </div>
      </SectionBlock>

      {/* Headings */}
      <SectionBlock title="Headings" icon={Bold} defaultOpen={false}>
        <div>
          <Label>Capitalization</Label>
          <div className="flex gap-1.5">
            {(['uppercase', 'capitalize', 'none'] as const).map(c => (
              <ToggleChip key={c} active={d.headingCapitalization === c} onClick={() => update('headingCapitalization', c)}>
                {c === 'none' ? 'Normal' : c}
              </ToggleChip>
            ))}
          </div>
        </div>
        <div>
          <Label>Size</Label>
          <div className="flex gap-1.5">
            {(['s', 'm', 'l', 'xl'] as const).map(s => (
              <ToggleChip key={s} active={d.headingSize === s} onClick={() => update('headingSize', s)}>{s.toUpperCase()}</ToggleChip>
            ))}
          </div>
        </div>
      </SectionBlock>
    </div>
  );

  /* ────────────────────────────────────────────────────────────────
     Tab: Spacing
     ──────────────────────────────────────────────────────────────── */
  const renderSpacingTab = () => (
    <div className="space-y-3">
      <SectionBlock title="Page Margins" icon={Minus} defaultOpen={true}>
        <SliderRow label="Left & Right" value={d.marginLR ?? 12} min={6} max={25} unit="mm" onChange={v => update('marginLR', v)} />
        <SliderRow label="Top & Bottom" value={d.marginTB ?? 14} min={6} max={25} unit="mm" onChange={v => update('marginTB', v)} />
      </SectionBlock>

      <SectionBlock title="Element Spacing" icon={Rows} defaultOpen={true}>
        <SliderRow label="Between Entries" value={d.entrySpacing ?? 4} min={1} max={10} unit="mm" onChange={v => update('entrySpacing', v)} />
        <SliderRow label="Between Sections" value={d.sectionSpacing ?? 8} min={2} max={20} unit="mm" onChange={v => update('sectionSpacing', v)} />
        <BoolToggle label="Indent Descriptions" value={d.descriptionIndent ?? false} onChange={v => update('descriptionIndent', v)} />
      </SectionBlock>

      <SectionBlock title="Photo" icon={Image} defaultOpen={false}>
        <BoolToggle label="Show Photo" value={d.photoShow ?? true} onChange={v => update('photoShow', v)} />
        {d.photoShow && (
          <>
            <div>
              <Label>Size</Label>
              <div className="flex gap-1.5">
                {(['xs', 's', 'm', 'l', 'xl'] as const).map(s => (
                  <ToggleChip key={s} active={d.photoSize === s} onClick={() => update('photoSize', s)}>{s.toUpperCase()}</ToggleChip>
                ))}
              </div>
            </div>
            <div>
              <Label>Shape</Label>
              <div className="flex gap-2">
                {([{ id: 'circle' }, { id: 'rounded' }, { id: 'square' }, { id: 'hexagon' }] as const).map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => update('photoShape', opt.id as any)}
                    className={`p-2 rounded-lg border transition-all ${d.photoShape === opt.id ? 'border-[#ff4d7d] bg-[#ff4d7d]/5 text-[#ff4d7d]' : 'border-gray-200 text-gray-400'}`}
                  >
                    {opt.id === 'circle' ? <Circle className="w-4 h-4" /> : opt.id === 'rounded' ? <Square className="w-4 h-4" /> : opt.id === 'hexagon' ? <Hexagon className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </div>
            <BoolToggle label="Grayscale" value={d.photoGrayscale ?? false} onChange={v => update('photoGrayscale', v)} />
          </>
        )}
      </SectionBlock>

      {/* Personal Details */}
      <SectionBlock title="Personal Details" icon={AlignLeft} defaultOpen={false}>
        <div>
          <Label>Alignment</Label>
          <div className="flex gap-1.5">
            <button onClick={() => update('personalAlign', 'left')} className={`p-2 rounded-lg border transition-all ${d.personalAlign === 'left' ? 'border-[#ff4d7d] bg-[#ff4d7d]/5 text-[#ff4d7d]' : 'border-gray-200 text-gray-400'}`}><AlignLeft className="w-4 h-4" /></button>
            <button onClick={() => update('personalAlign', 'center')} className={`p-2 rounded-lg border transition-all ${d.personalAlign === 'center' ? 'border-[#ff4d7d] bg-[#ff4d7d]/5 text-[#ff4d7d]' : 'border-gray-200 text-gray-400'}`}><AlignCenter className="w-4 h-4" /></button>
            <button onClick={() => update('personalAlign', 'right')} className={`p-2 rounded-lg border transition-all ${d.personalAlign === 'right' ? 'border-[#ff4d7d] bg-[#ff4d7d]/5 text-[#ff4d7d]' : 'border-gray-200 text-gray-400'}`}><AlignRight className="w-4 h-4" /></button>
          </div>
        </div>
        <BoolToggle label="Show Icons" value={d.personalIconShow ?? true} onChange={v => update('personalIconShow', v)} />
        <BoolToggle label="Show Bullets" value={d.personalBulletShow ?? false} onChange={v => update('personalBulletShow', v)} />
        <BoolToggle label="Show Separator Bar" value={d.personalBarShow ?? false} onChange={v => update('personalBarShow', v)} />
      </SectionBlock>

      {/* Entry Layout */}
      <SectionBlock title="Entry Layout" icon={Columns} defaultOpen={false}>
        <div className="grid grid-cols-2 gap-1.5">
          {(['default', 'side-date', 'compact', 'split'] as const).map(opt => (
            <ToggleChip key={opt} active={d.entryLayout === opt} onClick={() => update('entryLayout', opt)}>{opt}</ToggleChip>
          ))}
        </div>
        <div>
          <Label>List Style</Label>
          <div className="flex gap-1.5">
            {(['bullet', 'hyphen', 'none'] as const).map(s => (
              <ToggleChip key={s} active={d.listStyle === s} onClick={() => update('listStyle', s)}>{s}</ToggleChip>
            ))}
          </div>
        </div>
        <div>
          <Label>Entry Title Size</Label>
          <div className="flex gap-1.5">
            {(['s', 'm', 'l'] as const).map(s => (
              <ToggleChip key={s} active={d.entryTitleSize === s} onClick={() => update('entryTitleSize', s)}>{s.toUpperCase()}</ToggleChip>
            ))}
          </div>
        </div>
      </SectionBlock>
    </div>
  );

  /* ────────────────────────────────────────────────────────────────
     Tab: Effects
     ──────────────────────────────────────────────────────────────── */
  const renderEffectsTab = () => (
    <div className="space-y-3">
      {/* Border Radius */}
      <SectionBlock title="Border Radius" icon={Square} defaultOpen={true}>
        <div className="grid grid-cols-4 gap-1.5">
          {Object.entries(RADIUS_PRESETS).map(([key, value]) => (
            <RadiusPreview
              key={key}
              value={value}
              active={d.borderRadius === (key as any) || false}
              onClick={() => update('borderRadius', key as any)}
            />
          ))}
        </div>
      </SectionBlock>

      {/* Shadows */}
      <SectionBlock title="Shadow" icon={Eye} defaultOpen={true}>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(SHADOW_PRESETS).map(([key, value]) => (
            <button
              key={key}
              onClick={() => update('shadow', key as any)}
              className={`p-3 rounded-lg border-2 transition-all text-center ${d.shadow === key ? 'border-[#ff4d7d] bg-[#ff4d7d]/5' : 'border-transparent hover:border-gray-200'}`}
              style={{ boxShadow: value === 'none' ? '0 1px 3px rgba(0,0,0,0.08)' : value }}
            >
              <span className="text-[8px] font-black uppercase block" style={{ color: 'var(--app-text)' }}>{key}</span>
            </button>
          ))}
        </div>
      </SectionBlock>

      {/* Skills/Interests Styles */}
      <SectionBlock title="Skills & Languages" icon={Grid3x3} defaultOpen={false}>
        <div>
          <Label>Skills Style</Label>
          <div className="grid grid-cols-2 gap-1.5">
            {(['grid', 'level', 'compact', 'bubble'] as const).map(s => (
              <ToggleChip key={s} active={d.skillsStyle === s} onClick={() => update('skillsStyle', s)}>{s}</ToggleChip>
            ))}
          </div>
        </div>
        <SliderRow label="Skills Columns" value={d.skillsColumns ?? 2} min={1} max={4} step={1} onChange={v => update('skillsColumns', v)} />
        <div>
          <Label>Languages Style</Label>
          <div className="grid grid-cols-2 gap-1.5">
            {(['grid', 'level', 'compact', 'bubble'] as const).map(s => (
              <ToggleChip key={s} active={d.languagesStyle === s} onClick={() => update('languagesStyle', s)}>{s}</ToggleChip>
            ))}
          </div>
        </div>
      </SectionBlock>

      {/* Links & Footer */}
      <SectionBlock title="Links & Footer" icon={Layers} defaultOpen={false}>
        <BoolToggle label="Underline Links" value={d.linkUnderline ?? true} onChange={v => update('linkUnderline', v)} />
        <BoolToggle label="Blue Link Color" value={d.linkBlueColor ?? false} onChange={v => update('linkBlueColor', v)} />
        <BoolToggle label="Show Link Icons" value={d.linkIcon ?? true} onChange={v => update('linkIcon', v)} />
        <BoolToggle label="Show Page Numbers" value={d.showPageNumbers ?? true} onChange={v => update('showPageNumbers', v)} />
        <BoolToggle label="Show Email in Footer" value={d.showEmailInFooter ?? false} onChange={v => update('showEmailInFooter', v)} />
        <BoolToggle label="Show Name in Footer" value={d.showNameInFooter ?? false} onChange={v => update('showNameInFooter', v)} />
      </SectionBlock>

      {/* Section heading styles */}
      <SectionBlock title="Section Heading Styles" icon={Bold} defaultOpen={false}>
        <div className="grid grid-cols-4 gap-1.5 max-h-48 overflow-y-auto">
          {HEADING_STYLES.filter(s => ['none', 'underline', 'background', 'badge', 'dot', 'double-side', 'capsule', 'shadow', 'gradient', 'double-line', 'overline', 'border-left', 'border-right', 'strikethrough', 'border-bottom'].includes(s.id)).map(s => (
            <button
              key={s.id}
              onClick={() => update('headingStyle', s.id)}
              className={`p-1.5 rounded-lg border transition-all text-center ${d.headingStyle === s.id ? 'border-[#ff4d7d] bg-[#ff4d7d]/5' : 'border-gray-100 hover:border-gray-200'}`}
            >
              <div className="w-full h-4 flex items-center justify-center">
                {/* Mini preview of heading style */}
                {s.id === 'none' && <span className="text-[6px] font-bold text-gray-400">─</span>}
                {s.id === 'underline' && <div className="w-3/4 h-3 flex flex-col justify-end"><div className="h-1 bg-gray-400 rounded-sm" style={{ width: '60%' }} /><div className="h-0.5 bg-gray-500 mt-0.5" /></div>}
                {s.id === 'background' && <div className="w-3/4 h-3 rounded-sm bg-gray-200 flex items-center"><div className="h-1 w-1/2 bg-gray-400 rounded-sm mx-auto" /></div>}
                {s.id === 'badge' && <div className="w-3/4 h-3 rounded-sm" style={{ backgroundColor: accentColor }} />}
                {s.id === 'dot' && <div className="flex items-center gap-0.5"><div className="w-1.5 h-1.5 rounded-full bg-gray-500" /><div className="h-1 w-1/2 bg-gray-300 rounded-sm" /></div>}
                {s.id !== 'none' && !['underline', 'background', 'badge', 'dot'].includes(s.id) && <span className="text-[6px] font-bold text-gray-400">{s.label.slice(0, 6)}</span>}
              </div>
              <span className="text-[6px] font-medium text-gray-500 block mt-0.5 truncate">{s.label}</span>
            </button>
          ))}
        </div>
      </SectionBlock>
    </div>
  );

  /* ────────────────────────────────────────────────────────────────
     Tab: Layout
     ──────────────────────────────────────────────────────────────── */
  const renderLayoutTab = () => (
    <div className="space-y-3">
      {/* Layout Presets */}
      <SectionBlock title="Layout Presets" icon={Layout} defaultOpen={true}>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(LAYOUT_PRESETS).map(([id, preset]) => {
            const isActive = d.layout === id;
            return (
              <button
                key={id}
                onClick={() => applyLayoutPreset(id)}
                className={`p-2.5 rounded-xl border-2 text-left transition-all ${isActive ? 'border-[#ff4d7d] bg-[#ff4d7d]/5' : 'border-gray-100 hover:border-gray-200'}`}
              >
                {/* Layout mini preview */}
                <div className="w-full h-10 mb-1.5 flex items-center gap-0.5 p-1 bg-gray-50 rounded-lg">
                  {id.includes('sidebar-left') ? (
                    <><div className="w-1/3 h-full rounded-sm bg-gray-300" /><div className="flex-1 flex flex-col gap-0.5"><div className="h-1 bg-gray-200 rounded-sm" /><div className="h-1 bg-gray-100 rounded-sm" /></div></>
                  ) : id.includes('sidebar-right') ? (
                    <><div className="flex-1 flex flex-col gap-0.5"><div className="h-1 bg-gray-200 rounded-sm" /><div className="h-1 bg-gray-100 rounded-sm" /></div><div className="w-1/3 h-full rounded-sm bg-gray-300" /></>
                  ) : id.includes('modern-header') || id.includes('double-header') ? (
                    <><div className="w-full h-1/2 rounded-sm bg-gray-300 mb-0.5" /><div className="flex-1 flex flex-col gap-0.5"><div className="h-1 bg-gray-200 rounded-sm" /><div className="h-0.5 bg-gray-100 rounded-sm" /></div></>
                  ) : id.includes('timeline') ? (
                    <><div className="w-0.5 h-full rounded-full bg-gray-300" /><div className="flex-1 flex flex-col gap-0.5 ml-0.5"><div className="h-1 bg-gray-200 rounded-sm" /><div className="h-0.5 bg-gray-100 rounded-sm" /></div></>
                  ) : (
                    <><div className="flex-1 flex flex-col gap-0.5"><div className="h-1 bg-gray-200 rounded-sm w-1/2" /><div className="h-1 bg-gray-200 rounded-sm" /><div className="h-0.5 bg-gray-100 rounded-sm" /></div></>
                  )}
                </div>
                <span className="text-[9px] font-bold block" style={{ color: 'var(--app-text)' }}>{preset.name}</span>
              </button>
            );
          })}
        </div>
      </SectionBlock>
      
      {/* Work & Education Order */}
      <SectionBlock title="Content Order" icon={Rows} defaultOpen={false}>
        <div>
          <Label>Work Entry Order</Label>
          <div className="flex gap-1.5">
            {(['title-employer', 'employer-title'] as const).map(s => (
              <ToggleChip key={s} active={d.workOrder === s} onClick={() => update('workOrder', s)}>
                {s === 'title-employer' ? 'Title First' : 'Employer First'}
              </ToggleChip>
            ))}
          </div>
        </div>
        <div>
          <Label>Education Order</Label>
          <div className="flex gap-1.5">
            {(['degree-school', 'school-degree'] as const).map(s => (
              <ToggleChip key={s} active={d.educationOrder === s} onClick={() => update('educationOrder', s)}>
                {s === 'degree-school' ? 'Degree First' : 'School First'}
              </ToggleChip>
            ))}
          </div>
        </div>
        <BoolToggle label="Group Promotions" value={d.workGroupPromotions ?? false} onChange={v => update('workGroupPromotions', v)} />
        <BoolToggle label="Show Summary Heading" value={d.showSummaryHeading ?? true} onChange={v => update('showSummaryHeading', v)} />
      </SectionBlock>
    </div>
  );

  /* ────────────────────────────────────────────────────────────────
     Tab: Advanced
     ──────────────────────────────────────────────────────────────── */
  const renderAdvancedTab = () => (
    <div className="space-y-3">
      {/* Export/Import */}
      <SectionBlock title="Export / Import" icon={Download} defaultOpen={true}>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleExportStyles}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all"
          >
            <Download className="w-5 h-5" style={{ color: 'var(--app-primary)' }} />
            <span className="text-[9px] font-black uppercase" style={{ color: 'var(--app-text)' }}>Export</span>
            <span className="text-[8px] text-gray-400">Save style config</span>
          </button>
          <button
            onClick={handleImportStyles}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all"
          >
            <Upload className="w-5 h-5" style={{ color: 'var(--app-primary)' }} />
            <span className="text-[9px] font-black uppercase" style={{ color: 'var(--app-text)' }}>Import</span>
            <span className="text-[8px] text-gray-400">Load style config</span>
          </button>
        </div>
      </SectionBlock>

      {/* Reset All */}
      <SectionBlock title="Danger Zone" icon={Trash2} defaultOpen={true}>
        <p className="text-[10px] text-gray-500 mb-2">Reset all style settings to factory defaults. This cannot be undone.</p>
        <button
          onClick={handleResetAll}
          className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl border-2 border-red-200 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition-all"
        >
          <RotateCcw className="w-4 h-4" /> Reset All Styles
        </button>
      </SectionBlock>

      {/* CSS Variables Inspector */}
      <SectionBlock title="CSS Variables" icon={FileJson} defaultOpen={false}>
        <button
          onClick={() => setCssVarsExpanded(!cssVarsExpanded)}
          className="w-full text-left text-[10px] font-bold p-2 rounded-lg bg-gray-50 border border-gray-100 mb-2"
        >
          {cssVarsExpanded ? 'Hide' : 'Show'} CSS Custom Properties ({Object.keys(cssVariables).length} vars)
        </button>
        {cssVarsExpanded && (
          <div className="max-h-48 overflow-y-auto bg-gray-900 text-green-300 p-2 rounded-lg font-mono text-[8px] leading-relaxed">
            {Object.entries(cssVariables).map(([key, value]) => (
              <div key={key}>{key}: {value};</div>
            ))}
          </div>
        )}
      </SectionBlock>

      {/* Style Overrides Stats */}
      {data.styleOverrides && Object.keys(data.styleOverrides).length > 0 && (
        <SectionBlock title="Item Overrides" icon={Layers} defaultOpen={false}>
          <p className="text-[10px] text-gray-500">
            {Object.keys(data.styleOverrides).length} custom style override(s) applied to individual items.
          </p>
          <button
            onClick={() => updateNested('styleOverrides', {})}
            className="text-[10px] font-bold text-red-500 hover:text-red-600"
          >
            Clear all item overrides
          </button>
        </SectionBlock>
      )}
    </div>
  );

  /* ────────────────────────────────────────────────────────────────
     Render
     ──────────────────────────────────────────────────────────────── */
  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--app-bg-gray)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b shrink-0" style={{ borderColor: 'var(--app-border)', background: 'var(--app-bg-card)' }}>
        <div className="flex items-center gap-2">
          <Settings2 className="w-4 h-4" style={{ color: 'var(--app-primary)' }} />
          <span className="text-[11px] font-black uppercase tracking-widest" style={{ color: 'var(--app-text)' }}>Advanced Style</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[8px] text-gray-400 font-medium">v1.0</span>
          {onClose && (
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" style={{ color: 'var(--app-text-muted)' }}>
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex border-b overflow-x-auto shrink-0" style={{ borderColor: 'var(--app-border)', background: 'var(--app-bg-card)' }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-1.5 px-3 py-2.5 text-[9px] font-black uppercase tracking-widest border-b-2 transition-all shrink-0"
            style={{
              borderColor: activeTab === tab.id ? 'var(--app-primary)' : 'transparent',
              color: activeTab === tab.id ? 'var(--app-primary)' : 'var(--app-text-muted)',
              background: activeTab === tab.id ? 'var(--app-primary-light)' : 'transparent',
            }}
            title={tab.description}
          >
            <tab.icon className="w-3 h-3" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
        {activeTab === 'colors' && renderColorsTab()}
        {activeTab === 'typography' && renderTypographyTab()}
        {activeTab === 'spacing' && renderSpacingTab()}
        {activeTab === 'effects' && renderEffectsTab()}
        {activeTab === 'layout' && renderLayoutTab()}
        {activeTab === 'advanced' && renderAdvancedTab()}
      </div>

      {/* Footer - quick stats */}
      <div className="px-4 py-2 border-t shrink-0 flex items-center justify-between" style={{ borderColor: 'var(--app-border)', background: 'var(--app-bg-card)' }}>
        <div className="flex items-center gap-3">
          <span className="text-[8px] font-medium text-gray-400">
            <span className="inline-block w-2 h-2 rounded-full mr-1" style={{ backgroundColor: d.primaryColor || '#000' }} />
            {d.fontFamily || 'Inter'}
          </span>
          <span className="text-[8px] text-gray-400">
            {d.layout || 'single'} · {d.fontSize || 10.5}pt
          </span>
        </div>
        <button
          onClick={() => setShowExporter(!showExporter)}
          className="text-[8px] font-bold uppercase tracking-wider text-gray-400 hover:text-gray-600 transition-colors"
        >
          {showExporter ? 'Hide' : 'Export'}
        </button>
      </div>
    </div>
  );
}