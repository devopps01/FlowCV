'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Palette, Type, Layout, AlignLeft, AlignCenter, AlignRight,
  ChevronDown, ChevronRight, Sliders, Image, Eye,
  Circle, Square, Hexagon, Grid, List, Minus, Plus,
  LayoutTemplate, Columns, Rows, Layers, Settings2,
  Check, RotateCcw, Sparkles, BookOpen, Wand2,
  Search, Loader2, RefreshCw,
} from 'lucide-react';
import { ResumeData } from './types';
import { FONT_OPTIONS, HEADING_STYLES, ACCENT_TARGETS } from './design-options';

interface DesignEditorProps {
  data: ResumeData;
  updateDesign: (key: keyof ResumeData['design'], value: any) => void;
  updateContent: (path: string, value: any) => void;
  selectedSectionId?: string;
  setSelectedSectionId?: (id?: string) => void;
  onOpenTemplates?: () => void;
}

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Reusable sub-components Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

const SectionBlock = ({
  title,
  icon: Icon,
  children,
  defaultOpen = false,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: '1px solid var(--app-border)', background: 'var(--app-bg-card)' }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 transition-colors"
        style={{ background: 'transparent' }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--app-bg-gray)'}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
      >
        <div className="flex items-center gap-2.5">
          <Icon className="w-4 h-4" style={{ color: 'var(--app-primary)' }} />
          <span className="text-[11px] font-black uppercase tracking-widest" style={{ color: 'var(--app-text)' }}>{title}</span>
        </div>
        {open ? (
          <ChevronDown className="w-4 h-4" style={{ color: 'var(--app-text-muted)' }} />
        ) : (
          <ChevronRight className="w-4 h-4" style={{ color: 'var(--app-text-muted)' }} />
        )}
      </button>
      {open && <div className="px-4 pb-4 pt-1 space-y-3" style={{ borderTop: '1px solid var(--app-border-light)' }}>{children}</div>}
    </div>
  );
};

const Label = ({ children }: { children: React.ReactNode }) => (
  <span className="text-[9px] font-black uppercase tracking-widest block mb-1" style={{ color: 'var(--app-text-muted)' }}>{children}</span>
);

const SliderRow = ({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (v: number) => void;
}) => (
  <div>
    <div className="flex items-center justify-between mb-1">
      <Label>{label}</Label>
      <span className="text-[10px] font-bold" style={{ color: 'var(--app-text-secondary)' }}>
        {value}{unit}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={e => onChange(Number(e.target.value))}
      className="w-full h-1.5 rounded-full accent-[#ff4d7d] cursor-pointer"
    />
  </div>
);

const ColorSwatch = ({
  color,
  active,
  onClick,
}: {
  color: string;
  active?: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`w-7 h-7 rounded-full border-2 transition-all hover:scale-110 ${active ? 'border-gray-800 scale-110' : 'border-transparent'}`}
    style={{ backgroundColor: color }}
    title={color}
  />
);

const ToggleChip = ({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all"
    style={active
      ? { background: 'var(--app-primary)', color: '#fff', border: '1px solid var(--app-primary)' }
      : { background: 'var(--app-bg-gray)', color: 'var(--app-text-secondary)', border: '1px solid var(--app-border)' }}
  >
    {children}
  </button>
);

const IconToggle = ({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
}) => (
  <button
    onClick={onClick}
    title={label}
    className="p-2 rounded-lg transition-all"
    style={active
      ? { background: 'var(--app-primary-light)', border: '1px solid var(--app-primary)', color: 'var(--app-primary)' }
      : { background: 'var(--app-bg-gray)', border: '1px solid var(--app-border)', color: 'var(--app-text-secondary)' }}
  >
    <Icon className="w-4 h-4" />
  </button>
);

const BoolToggle = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) => (
  <div className="flex items-center justify-between">
    <span className="text-[10px] font-bold" style={{ color: 'var(--app-text-secondary)' }}>{label}</span>
    <button
      onClick={() => onChange(!value)}
      className="relative w-9 h-5 rounded-full transition-colors"
      style={{ background: value ? 'var(--app-primary)' : 'var(--app-bg-medium)' }}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-4' : 'translate-x-0'}`}
      />
    </button>
  </div>
);

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Preset color palettes Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

const COLOR_PRESETS = [
  '#ff4d7d', '#7c3aed', '#2563eb', '#0891b2', '#059669',
  '#d97706', '#dc2626', '#db2777', '#4f46e5', '#0f172a',
  '#64748b', '#374151', '#1e40af', '#065f46', '#92400e',
];

const LAYOUT_OPTIONS = [
  // Single column variants
  { id: 'single',              label: 'Classic',      group: 'Single Column' },
  { id: 'single-centered',     label: 'Centered',     group: 'Single Column' },
  { id: 'single-compact',      label: 'Compact',      group: 'Single Column' },
  { id: 'single-minimal',      label: 'Minimal',      group: 'Single Column' },
  // Sidebar left variants
  { id: 'sidebar-left',        label: 'Sidebar L',    group: 'Sidebar' },
  { id: 'sidebar-left-wide',   label: 'Sidebar L+',   group: 'Sidebar' },
  { id: 'sidebar-left-narrow', label: 'Sidebar L−',   group: 'Sidebar' },
  // Sidebar right variants
  { id: 'sidebar-right',       label: 'Sidebar R',    group: 'Sidebar' },
  { id: 'sidebar-right-wide',  label: 'Sidebar R+',   group: 'Sidebar' },
  { id: 'sidebar-right-narrow',label: 'Sidebar R−',   group: 'Sidebar' },
  // Modern header variants
  { id: 'modern-header',       label: 'Modern',       group: 'Header' },
  { id: 'modern-header-dark',  label: 'Modern Dark',  group: 'Header' },
  { id: 'modern-header-split', label: 'Modern Split', group: 'Header' },
  // Double header variants
  { id: 'double-header',       label: 'Double',       group: 'Header' },
  { id: 'double-header-bold',  label: 'Double Bold',  group: 'Header' },
  // Two column variants
  { id: 'two-column',          label: 'Two Col',      group: 'Multi-Column' },
  { id: 'two-column-reverse',  label: 'Two Col Rev',  group: 'Multi-Column' },
  // Timeline variants
  { id: 'timeline',            label: 'Timeline',     group: 'Special' },
  { id: 'timeline-left',       label: 'Timeline L',   group: 'Special' },
  // Card/infographic
  { id: 'card-header',         label: 'Card',         group: 'Special' },
  { id: 'infographic',         label: 'Infographic',  group: 'Special' },
];

const HEADING_SIZE_OPTIONS = ['s', 'm', 'l', 'xl'] as const;
const NAME_SIZE_OPTIONS = ['xs', 's', 'm', 'l', 'xl'] as const;
const PHOTO_SIZE_OPTIONS = ['xs', 's', 'm', 'l', 'xl'] as const;
const PHOTO_SHAPE_OPTIONS = [
  { id: 'circle', icon: Circle },
  { id: 'rounded', icon: Square },
  { id: 'square', icon: Square },
  { id: 'hexagon', icon: Hexagon },
] as const;

const SKILL_STYLE_OPTIONS = ['grid', 'level', 'compact', 'bubble'] as const;
const ENTRY_LAYOUT_OPTIONS = ['default', 'side-date', 'compact', 'split'] as const;
const LIST_STYLE_OPTIONS = ['bullet', 'hyphen', 'none'] as const;

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Heading style preview renderer Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

const HeadingStylePreview = ({
  styleId,
  color,
  active,
  onClick,
}: {
  styleId: string;
  color: string;
  active: boolean;
  onClick: () => void;
}) => {
  const base = styleId.split('_')[0];
  const label = HEADING_STYLES.find(s => s.id === styleId)?.label || styleId;

  const lineStyle: React.CSSProperties = {
    backgroundColor: color,
    height: '2px',
    width: '100%',
  };

  const renderPreview = () => {
    switch (base) {
      case 'underline':
        return (
          <div className="flex flex-col gap-0.5">
            <div className="h-2 w-3/4 bg-gray-300 rounded-sm" />
            <div style={{ ...lineStyle, width: '75%' }} />
          </div>
        );
      case 'border-bottom':
        return (
          <div className="flex flex-col gap-0.5">
            <div className="h-2 w-full bg-gray-300 rounded-sm" />
            <div style={lineStyle} />
          </div>
        );
      case 'border-left':
        return (
          <div className="flex items-center gap-1">
            <div style={{ width: '2px', height: '12px', backgroundColor: color }} />
            <div className="h-2 w-3/4 bg-gray-300 rounded-sm" />
          </div>
        );
      case 'background':
        return (
          <div className="h-4 w-full rounded-sm flex items-center px-1" style={{ backgroundColor: `${color}22` }}>
            <div className="h-1.5 w-3/4 bg-gray-400 rounded-sm" />
          </div>
        );
      case 'badge':
        return (
          <div className="h-4 w-3/4 rounded flex items-center px-1" style={{ backgroundColor: color }}>
            <div className="h-1.5 w-full bg-white/60 rounded-sm" />
          </div>
        );
      case 'capsule':
        return (
          <div className="h-4 w-3/4 rounded-full border flex items-center px-1" style={{ borderColor: color }}>
            <div className="h-1.5 w-full bg-gray-300 rounded-sm" />
          </div>
        );
      case 'double-line':
        return (
          <div className="flex flex-col gap-0.5">
            <div style={lineStyle} />
            <div className="h-2 w-full bg-gray-300 rounded-sm" />
            <div style={lineStyle} />
          </div>
        );
      case 'dot':
        return (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
            <div className="h-2 w-3/4 bg-gray-300 rounded-sm" />
          </div>
        );
      case 'gradient':
        return (
          <div className="h-4 w-full rounded-sm flex items-center px-1" style={{ background: `linear-gradient(90deg, ${color}33, transparent)` }}>
            <div className="h-1.5 w-3/4 bg-gray-400 rounded-sm" />
          </div>
        );
      case 'overline':
        return (
          <div className="flex flex-col gap-0.5">
            <div style={{ ...lineStyle, width: '75%' }} />
            <div className="h-2 w-3/4 bg-gray-300 rounded-sm" />
          </div>
        );
      case 'double-side':
        return (
          <div className="flex items-center gap-1">
            <div style={{ flex: 1, height: '1px', backgroundColor: color, opacity: 0.4 }} />
            <div className="h-2 w-1/2 bg-gray-300 rounded-sm" />
            <div style={{ flex: 1, height: '1px', backgroundColor: color, opacity: 0.4 }} />
          </div>
        );
      case 'shadow':
        return (
          <div className="h-4 w-full rounded-sm flex items-center px-1" style={{ backgroundColor: `${color}12`, boxShadow: `2px 2px 0 ${color}22` }}>
            <div className="h-1.5 w-3/4 bg-gray-400 rounded-sm" />
          </div>
        );
      default:
        return <div className="h-2 w-3/4 bg-gray-300 rounded-sm" />;
    }
  };

  return (
    <button
      onClick={onClick}
      title={label}
      className={`p-2 rounded-lg border transition-all hover:border-[#ff4d7d]/40 ${
        active ? 'border-[#ff4d7d] bg-[#ff4d7d]/5 ring-1 ring-[#ff4d7d]/20' : ''
      }`}
    >
      <div className="h-8 flex items-center justify-center">{renderPreview()}</div>
      <p className="text-[8px] font-bold text-center mt-1 truncate max-w-[60px]" style={{ color: 'var(--app-text-muted)' }}>{label}</p>
    </button>
  );
};

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Font Option row Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

const FontOption = React.memo(({
  font,
  active,
  onSelect,
  onHover,
}: {
  font: string;
  active: boolean;
  onSelect: (f: string) => void;
  onHover: (f: string) => void;
}) => (
  <button
    onMouseEnter={() => onHover(font)}
    onClick={() => onSelect(font)}
    className={`w-full flex items-center justify-between px-3 py-2 text-left transition-colors ${
      active ? 'bg-[#ff4d7d]/8 text-[#ff4d7d]' : ''
    }`}
  >
    <span className="text-[12px] font-medium" style={{ fontFamily: font }}>{font}</span>
    {active && <Check className="w-3.5 h-3.5 text-[#ff4d7d] shrink-0" />}
  </button>
));
FontOption.displayName = 'FontOption';

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Main DesignEditor Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

export default function DesignEditor({
  data,
  updateDesign,
  updateContent,
  selectedSectionId,
  setSelectedSectionId,
  onOpenTemplates,
}: DesignEditorProps) {
  const d = data.design;
  const [headingSearch, setHeadingSearch] = useState('');

  // Ã¢â€â‚¬Ã¢â€â‚¬ Google Fonts state Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  const [fontSearch, setFontSearch] = useState('');
  const [googleFonts, setGoogleFonts] = useState<string[]>([]);
  const [fontsLoading, setFontsLoading] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [fontDropdownOpen, setFontDropdownOpen] = useState(false);
  const fontDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (fontDropdownRef.current && !fontDropdownRef.current.contains(e.target as Node)) {
        setFontDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const loadGoogleFonts = useCallback(async () => {
    if (fontsLoaded || fontsLoading) return;
    setFontsLoading(true);
    try {
      const res = await fetch('/api/google-fonts');
      const json = await res.json();
      if (json.ok && Array.isArray(json.families)) {
        setGoogleFonts(json.families);
        setFontsLoaded(true);
      }
    } catch {
      // silently fail Ã¢â‚¬â€ fallback to static list
    } finally {
      setFontsLoading(false);
    }
  }, [fontsLoaded, fontsLoading]);

  // Merge static + google fonts, deduplicate
  const allFonts: string[] = fontsLoaded
    ? Array.from(new Set([
        ...FONT_OPTIONS.sans,
        ...FONT_OPTIONS.serif,
        ...FONT_OPTIONS.mono,
        ...googleFonts,
      ])).sort((a, b) => a.localeCompare(b))
    : [
        ...FONT_OPTIONS.sans,
        ...FONT_OPTIONS.serif,
        ...FONT_OPTIONS.mono,
      ];

  const filteredFonts = fontSearch
    ? allFonts.filter(f => f.toLowerCase().includes(fontSearch.toLowerCase()))
    : allFonts;

  // Load font preview via Google Fonts link
  const loadFontPreview = useCallback((font: string) => {
    const id = `gf-${font.replace(/\s+/g, '-').toLowerCase()}`;
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${font.replace(/\s+/g, '+')}:wght@400;700&display=swap`;
    document.head.appendChild(link);
  }, []);

  const selectFont = useCallback((font: string) => {
    loadFontPreview(font);
    updateDesign('fontFamily', font);
    // Detect category
    const cat = FONT_OPTIONS.serif.includes(font) ? 'serif'
      : FONT_OPTIONS.mono.includes(font) ? 'mono'
      : 'sans';
    updateDesign('fontCategory', cat);
    setFontDropdownOpen(false);
    setFontSearch('');
  }, [loadFontPreview, updateDesign]);

  // Filtered heading styles (show base styles + search results)
  const baseHeadingIds = ['none', 'underline', 'border-bottom', 'border-left', 'border-right', 'background', 'double-line', 'dot', 'badge', 'capsule', 'overline', 'double-side', 'shadow', 'gradient', 'strikethrough'];
  const filteredHeadings = headingSearch
    ? HEADING_STYLES.filter(s => s.label.toLowerCase().includes(headingSearch.toLowerCase())).slice(0, 24)
    : HEADING_STYLES.filter(s => baseHeadingIds.includes(s.id));

  const accentColor = d.primaryColor || '#ff4d7d';

  return (
    <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar" style={{ background: 'var(--app-bg-gray)' }}>
      <div className="p-3 space-y-2 pb-32">

        {/* Ã¢â€â‚¬Ã¢â€â‚¬ Templates Quick Pick Ã¢â€â‚¬Ã¢â€â‚¬ */}
        <div className="bg-gradient-to-r from-[#ff4d7d]/10 to-purple-500/10 rounded-xl p-3 border border-[#ff4d7d]/10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#ff4d7d]" />
              <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest">Templates</span>
            </div>
            <button
              onClick={onOpenTemplates}
              className="px-3 py-1.5 bg-[#ff4d7d] text-white text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-[#ff3366] transition-colors shadow-sm"
            >
              Browse All
            </button>
          </div>
          <p className="text-[10px] font-medium" style={{ color: 'var(--app-text-secondary)' }}>Apply a full design preset to instantly transform your resume style.</p>
        </div>

        {/* Ã¢â€â‚¬Ã¢â€â‚¬ Layout Ã¢â€â‚¬Ã¢â€â‚¬ */}
        <SectionBlock title="Layout" icon={Layout} defaultOpen>
          <div>
            <Label>Page Layout</Label>
            {/* Group layouts by category */}
            {['Single Column', 'Sidebar', 'Header', 'Multi-Column', 'Special'].map(group => {
              const groupLayouts = LAYOUT_OPTIONS.filter(o => o.group === group);
              return (
                <div key={group} className="mb-3">
                  <p className="text-[8px] font-black uppercase tracking-widest mb-1.5" style={{ color: 'var(--app-text-muted)' }}>{group}</p>
                  <div className="grid grid-cols-4 gap-1.5">
                    {groupLayouts.map(opt => {
                      const active = d.layout === opt.id;
                      // Visual mini-preview icon based on layout type
                      const preview = (() => {
                        const id = opt.id;
                        if (id.includes('sidebar-left')) return (
                          <div className="flex gap-0.5 w-full h-full items-stretch">
                            <div className="rounded-sm" style={{ width: id.includes('wide') ? '40%' : id.includes('narrow') ? '25%' : '32%', background: active ? 'var(--app-primary)' : 'currentColor', opacity: 0.7 }} />
                            <div className="flex-1 flex flex-col gap-0.5">
                              <div className="rounded-sm h-1" style={{ background: 'currentColor', opacity: 0.4 }} />
                              <div className="rounded-sm h-1" style={{ background: 'currentColor', opacity: 0.3 }} />
                              <div className="rounded-sm h-1" style={{ background: 'currentColor', opacity: 0.2 }} />
                            </div>
                          </div>
                        );
                        if (id.includes('sidebar-right')) return (
                          <div className="flex gap-0.5 w-full h-full items-stretch">
                            <div className="flex-1 flex flex-col gap-0.5">
                              <div className="rounded-sm h-1" style={{ background: 'currentColor', opacity: 0.4 }} />
                              <div className="rounded-sm h-1" style={{ background: 'currentColor', opacity: 0.3 }} />
                              <div className="rounded-sm h-1" style={{ background: 'currentColor', opacity: 0.2 }} />
                            </div>
                            <div className="rounded-sm" style={{ width: id.includes('wide') ? '40%' : id.includes('narrow') ? '25%' : '32%', background: active ? 'var(--app-primary)' : 'currentColor', opacity: 0.7 }} />
                          </div>
                        );
                        if (id.includes('modern-header')) return (
                          <div className="flex flex-col gap-0.5 w-full">
                            <div className="rounded-sm h-2.5 w-full" style={{ background: active ? 'var(--app-primary)' : 'currentColor', opacity: 0.8 }} />
                            <div className="rounded-sm h-1 w-3/4" style={{ background: 'currentColor', opacity: 0.4 }} />
                            <div className="rounded-sm h-1 w-full" style={{ background: 'currentColor', opacity: 0.3 }} />
                          </div>
                        );
                        if (id.includes('double-header')) return (
                          <div className="flex flex-col gap-0.5 w-full">
                            <div className="rounded-sm h-1.5 w-full" style={{ background: active ? 'var(--app-primary)' : 'currentColor', opacity: 0.8 }} />
                            <div className="rounded-sm h-1 w-full" style={{ background: 'currentColor', opacity: 0.5 }} />
                            <div className="rounded-sm h-1 w-3/4" style={{ background: 'currentColor', opacity: 0.3 }} />
                          </div>
                        );
                        if (id.includes('two-column')) return (
                          <div className="flex gap-0.5 w-full h-full items-stretch">
                            <div className="flex-1 flex flex-col gap-0.5">
                              <div className="rounded-sm h-1" style={{ background: 'currentColor', opacity: 0.5 }} />
                              <div className="rounded-sm h-1" style={{ background: 'currentColor', opacity: 0.3 }} />
                            </div>
                            <div className="flex-1 flex flex-col gap-0.5">
                              <div className="rounded-sm h-1" style={{ background: 'currentColor', opacity: 0.5 }} />
                              <div className="rounded-sm h-1" style={{ background: 'currentColor', opacity: 0.3 }} />
                            </div>
                          </div>
                        );
                        if (id.includes('timeline')) return (
                          <div className="flex gap-0.5 w-full h-full items-stretch">
                            <div className="rounded-full" style={{ width: '2px', background: active ? 'var(--app-primary)' : 'currentColor', opacity: 0.6 }} />
                            <div className="flex-1 flex flex-col gap-0.5">
                              <div className="rounded-sm h-1" style={{ background: 'currentColor', opacity: 0.4 }} />
                              <div className="rounded-sm h-1" style={{ background: 'currentColor', opacity: 0.3 }} />
                              <div className="rounded-sm h-1" style={{ background: 'currentColor', opacity: 0.2 }} />
                            </div>
                          </div>
                        );
                        if (id.includes('card')) return (
                          <div className="flex flex-col gap-0.5 w-full">
                            <div className="rounded-md h-3 w-full" style={{ background: active ? 'var(--app-primary)' : 'currentColor', opacity: 0.7 }} />
                            <div className="rounded-sm h-1 w-2/3" style={{ background: 'currentColor', opacity: 0.4 }} />
                          </div>
                        );
                        if (id.includes('infographic')) return (
                          <div className="flex gap-0.5 w-full h-full">
                            <div className="flex flex-col gap-0.5 flex-1">
                              <div className="rounded-full w-3 h-3 mx-auto" style={{ background: active ? 'var(--app-primary)' : 'currentColor', opacity: 0.7 }} />
                              <div className="rounded-sm h-1" style={{ background: 'currentColor', opacity: 0.3 }} />
                            </div>
                            <div className="flex-1 flex flex-col gap-0.5">
                              <div className="rounded-sm h-1" style={{ background: 'currentColor', opacity: 0.4 }} />
                              <div className="rounded-sm h-1" style={{ background: 'currentColor', opacity: 0.3 }} />
                            </div>
                          </div>
                        );
                        // Default: single column
                        return (
                          <div className="flex flex-col gap-0.5 w-full">
                            <div className="rounded-sm h-1.5 w-1/2 mx-auto" style={{ background: active ? 'var(--app-primary)' : 'currentColor', opacity: 0.7 }} />
                            <div className="rounded-sm h-1 w-full" style={{ background: 'currentColor', opacity: 0.4 }} />
                            <div className="rounded-sm h-1 w-3/4" style={{ background: 'currentColor', opacity: 0.3 }} />
                            <div className="rounded-sm h-1 w-full" style={{ background: 'currentColor', opacity: 0.2 }} />
                          </div>
                        );
                      })();
                      return (
                        <button
                          key={opt.id}
                          onClick={() => updateDesign('layout', opt.id)}
                          className="flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all hover:scale-105"
                          style={active
                            ? { border: '1.5px solid var(--app-primary)', background: 'var(--app-primary-light)', color: 'var(--app-primary)' }
                            : { border: '1px solid var(--app-border)', background: 'var(--app-bg-gray)', color: 'var(--app-text-muted)' }}
                        >
                          <div className="w-10 h-7 flex items-center justify-center">
                            {preview}
                          </div>
                          <span className="text-[7px] font-black uppercase tracking-wide leading-tight text-center">{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </SectionBlock>

        {/* Ã¢â€â‚¬Ã¢â€â‚¬ Colors Ã¢â€â‚¬Ã¢â€â‚¬ */}
        <SectionBlock title="Colors" icon={Palette} defaultOpen>
          <div>
            <Label>Accent Color</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {COLOR_PRESETS.map(c => (
                <ColorSwatch key={c} color={c} active={d.primaryColor === c} onClick={() => updateDesign('primaryColor', c)} />
              ))}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <label className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'var(--app-text-muted)' }}>Custom</label>
              <input
                type="color"
                value={d.primaryColor || '#ff4d7d'}
                onChange={e => updateDesign('primaryColor', e.target.value)}
                className="w-8 h-8 rounded-lg border border-gray-200 cursor-pointer p-0.5"
              />
              <input
                type="text"
                value={d.primaryColor || '#ff4d7d'}
                onChange={e => {
                  if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) updateDesign('primaryColor', e.target.value);
                }}
                className="flex-1 p-1.5 bg-gray-50 border border-gray-100 rounded-lg text-[10px] font-mono font-bold focus:ring-1 focus:ring-[#ff4d7d]"
              />
            </div>
          </div>

          <div>
            <Label>Text Color</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={d.textColor || '#1f2937'}
                onChange={e => updateDesign('textColor', e.target.value)}
                className="w-8 h-8 rounded-lg border border-gray-200 cursor-pointer p-0.5"
              />
              <input
                type="text"
                value={d.textColor || '#1f2937'}
                onChange={e => {
                  if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) updateDesign('textColor', e.target.value);
                }}
                className="flex-1 p-1.5 bg-gray-50 border border-gray-100 rounded-lg text-[10px] font-mono font-bold focus:ring-1 focus:ring-[#ff4d7d]"
              />
            </div>
          </div>

          <div>
            <Label>Background Color</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={d.backgroundColor || '#ffffff'}
                onChange={e => updateDesign('backgroundColor', e.target.value)}
                className="w-8 h-8 rounded-lg border border-gray-200 cursor-pointer p-0.5"
              />
              <input
                type="text"
                value={d.backgroundColor || '#ffffff'}
                onChange={e => {
                  if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) updateDesign('backgroundColor', e.target.value);
                }}
                className="flex-1 p-1.5 bg-gray-50 border border-gray-100 rounded-lg text-[10px] font-mono font-bold focus:ring-1 focus:ring-[#ff4d7d]"
              />
              <button
                onClick={() => updateDesign('backgroundColor', '#ffffff')}
                title="Reset to white"
                className="p-1.5 transition-colors" style={{ color: 'var(--app-text-muted)' }}
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div>
            <Label>Apply Accent To</Label>
            <div className="flex flex-wrap gap-1.5">
              {ACCENT_TARGETS.map(t => {
                const active = (d.applyAccentTo || []).includes(t.id);
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      const current = d.applyAccentTo || [];
                      updateDesign('applyAccentTo', active ? current.filter(x => x !== t.id) : [...current, t.id]);
                    }}
                    className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider border transition-all ${
                      active ? 'bg-[#ff4d7d] text-white border-[#ff4d7d]' : ''
                    }`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>
        </SectionBlock>

        {/* Ã¢â€â‚¬Ã¢â€â‚¬ Typography Ã¢â€â‚¬Ã¢â€â‚¬ */}
        <SectionBlock title="Typography" icon={Type} defaultOpen>
          {/* Font Family Picker */}
          <div>
            <Label>Font Family</Label>

            {/* Selected font display + dropdown trigger */}
            <div ref={fontDropdownRef} className="relative">
              <button
                onClick={() => {
                  setFontDropdownOpen(o => !o);
                  if (!fontsLoaded && !fontsLoading) loadGoogleFonts();
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all" style={{ background: 'var(--app-bg-gray)', border: '1px solid var(--app-border)' }}
              >
                <span
                  className="text-sm font-semibold text-gray-800 truncate"
                  style={{ fontFamily: d.fontFamily || 'Inter' }}
                >
                  {d.fontFamily || 'Inter'}
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform shrink-0 ${fontDropdownOpen ? 'rotate-180' : ''}`} style={{ color: 'var(--app-text-muted)' }} />
              </button>

              {fontDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 rounded-xl shadow-2xl z-50 overflow-hidden" style={{ background: 'var(--app-bg-card)', border: '1px solid var(--app-border)' }}>
                  {/* Search + Load All */}
                  <div className="p-2 space-y-1.5" style={{ borderBottom: '1px solid var(--app-border)' }}>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search fonts..."
                        value={fontSearch}
                        onChange={e => setFontSearch(e.target.value)}
                        autoFocus
                        className="w-full pl-8 pr-3 py-1.5 text-[11px] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff4d7d]" style={{ background: 'var(--app-bg-gray)', border: '1px solid var(--app-border)', color: 'var(--app-text)' }}
                      />
                    </div>
                    {!fontsLoaded && (
                      <button
                        onClick={loadGoogleFonts}
                        disabled={fontsLoading}
                        className="w-full flex items-center justify-center gap-2 py-1.5 text-[10px] font-bold text-[#ff4d7d] bg-[#ff4d7d]/5 rounded-lg hover:bg-[#ff4d7d]/10 transition-colors disabled:opacity-60"
                      >
                        {fontsLoading ? (
                          <><Loader2 className="w-3 h-3 animate-spin" /> Loading all Google Fonts...</>
                        ) : (
                          <><RefreshCw className="w-3 h-3" /> Load All Google Fonts ({'>'}1000)</>
                        )}
                      </button>
                    )}
                    {fontsLoaded && (
                      <p className="text-[9px] text-center text-gray-400 font-medium">
                        {filteredFonts.length} fonts available
                      </p>
                    )}
                  </div>

                  {/* Font list */}
                  <div className="max-h-64 overflow-y-auto custom-scrollbar">
                    {/* Group: static presets first */}
                    {!fontSearch && !fontsLoaded && (
                      <>
                        {(['sans', 'serif', 'mono'] as const).map(cat => (
                          <div key={cat}>
                            <div className="px-3 py-1" style={{ background: 'var(--app-bg-gray)', borderBottom: '1px solid var(--app-border)' }}>
                              <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'var(--app-text-muted)' }}>{cat}</span>
                            </div>
                            {FONT_OPTIONS[cat].map(font => (
                              <FontOption
                                key={font}
                                font={font}
                                active={d.fontFamily === font}
                                onSelect={selectFont}
                                onHover={loadFontPreview}
                              />
                            ))}
                          </div>
                        ))}
                      </>
                    )}

                    {/* All fonts (after load or search) */}
                    {(fontSearch || fontsLoaded) && filteredFonts.map(font => (
                      <FontOption
                        key={font}
                        font={font}
                        active={d.fontFamily === font}
                        onSelect={selectFont}
                        onHover={loadFontPreview}
                      />
                    ))}

                    {filteredFonts.length === 0 && (
                      <div className="py-6 text-center text-[11px]" style={{ color: 'var(--app-text-muted)' }}>No fonts found</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick preset chips */}
            <div className="mt-2 space-y-1.5">
              {(['sans', 'serif', 'mono'] as const).map(cat => (
                <div key={cat} className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest w-8 shrink-0">{cat}</span>
                  {FONT_OPTIONS[cat].slice(0, 6).map(font => (
                    <button
                      key={font}
                      onClick={() => selectFont(font)}
                      className={`px-2 py-1 rounded-md text-[10px] border transition-all ${
                        d.fontFamily === font ? 'bg-[#ff4d7d] text-white border-[#ff4d7d]' : ''
                      }`}
                      style={{ fontFamily: font }}
                    >
                      {font}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <SliderRow label="Font Size (pt)" value={d.fontSize ?? 10.5} min={8} max={14} step={0.5} unit="pt" onChange={v => updateDesign('fontSize', v)} />
          <SliderRow label="Line Height" value={d.lineHeight ?? 1.45} min={1.2} max={1.8} step={0.05} onChange={v => updateDesign('lineHeight', v)} />
        </SectionBlock>

        {/* Ã¢â€â‚¬Ã¢â€â‚¬ Spacing Ã¢â€â‚¬Ã¢â€â‚¬ */}
        <SectionBlock title="Spacing" icon={Sliders}>
          <SliderRow label="Left & Right Margin" value={d.marginLR ?? 12} min={6} max={25} unit="mm" onChange={v => updateDesign('marginLR', v)} />
          <SliderRow label="Top & Bottom Margin" value={d.marginTB ?? 16} min={6} max={25} unit="mm" onChange={v => updateDesign('marginTB', v)} />
          <SliderRow label="Entry Spacing" value={d.entrySpacing ?? 4} min={1} max={10} unit="mm" onChange={v => updateDesign('entrySpacing', v)} />
          <SliderRow label="Section Spacing" value={d.sectionSpacing ?? 8} min={2} max={20} unit="mm" onChange={v => updateDesign('sectionSpacing', v)} />
        </SectionBlock>

        {/* Ã¢â€â‚¬Ã¢â€â‚¬ Section Headings Ã¢â€â‚¬Ã¢â€â‚¬ */}
        <SectionBlock title="Section Headings" icon={BookOpen}>
          <div>
            <Label>Heading Style</Label>
            <input
              type="text"
              placeholder="Search styles..."
              value={headingSearch}
              onChange={e => setHeadingSearch(e.target.value)}
              className="w-full p-2 rounded-lg text-[10px] font-bold mb-2 focus:ring-1 focus:ring-[#ff4d7d] focus:outline-none" style={{ background: 'var(--app-bg-gray)', border: '1px solid var(--app-border)', color: 'var(--app-text)' }}
            />
            <div className="grid grid-cols-4 gap-1.5 max-h-48 overflow-y-auto custom-scrollbar pr-1">
              {filteredHeadings.map(s => (
                <HeadingStylePreview
                  key={s.id}
                  styleId={s.id}
                  color={accentColor}
                  active={d.headingStyle === s.id}
                  onClick={() => updateDesign('headingStyle', s.id)}
                />
              ))}
            </div>
          </div>

          <div>
            <Label>Capitalization</Label>
            <div className="flex gap-1.5">
              {(['uppercase', 'capitalize', 'none'] as const).map(c => (
                <ToggleChip key={c} active={d.headingCapitalization === c} onClick={() => updateDesign('headingCapitalization', c)}>
                  {c === 'none' ? 'Normal' : c}
                </ToggleChip>
              ))}
            </div>
          </div>

          <div>
            <Label>Heading Size</Label>
            <div className="flex gap-1.5">
              {HEADING_SIZE_OPTIONS.map(s => (
                <ToggleChip key={s} active={d.headingSize === s} onClick={() => updateDesign('headingSize', s)}>
                  {s.toUpperCase()}
                </ToggleChip>
              ))}
            </div>
          </div>
        </SectionBlock>

        {/* Ã¢â€â‚¬Ã¢â€â‚¬ Entry Layout Ã¢â€â‚¬Ã¢â€â‚¬ */}
        <SectionBlock title="Entry Layout" icon={LayoutTemplate}>
          <div>
            <Label>Entry Style</Label>
            <div className="grid grid-cols-2 gap-1.5">
              {ENTRY_LAYOUT_OPTIONS.map(opt => (
                <ToggleChip key={opt} active={d.entryLayout === opt} onClick={() => updateDesign('entryLayout', opt)}>
                  {opt}
                </ToggleChip>
              ))}
            </div>
          </div>

          <div>
            <Label>Entry Title Size</Label>
            <div className="flex gap-1.5">
              {(['s', 'm', 'l'] as const).map(s => (
                <ToggleChip key={s} active={d.entryTitleSize === s} onClick={() => updateDesign('entryTitleSize', s)}>
                  {s.toUpperCase()}
                </ToggleChip>
              ))}
            </div>
          </div>

          <div>
            <Label>Subtitle Style</Label>
            <div className="flex gap-1.5">
              {(['normal', 'bold', 'italic'] as const).map(s => (
                <ToggleChip key={s} active={d.entrySubtitleStyle === s} onClick={() => updateDesign('entrySubtitleStyle', s)}>
                  {s}
                </ToggleChip>
              ))}
            </div>
          </div>

          <div>
            <Label>Subtitle Placement</Label>
            <div className="flex gap-1.5">
              {(['same-line', 'next-line'] as const).map(s => (
                <ToggleChip key={s} active={d.entrySubtitlePlacement === s} onClick={() => updateDesign('entrySubtitlePlacement', s)}>
                  {s === 'same-line' ? 'Same Line' : 'Next Line'}
                </ToggleChip>
              ))}
            </div>
          </div>

          <div>
            <Label>List Style</Label>
            <div className="flex gap-1.5">
              {LIST_STYLE_OPTIONS.map(s => (
                <ToggleChip key={s} active={d.listStyle === s} onClick={() => updateDesign('listStyle', s)}>
                  {s}
                </ToggleChip>
              ))}
            </div>
          </div>

          <BoolToggle label="Indent Description" value={d.descriptionIndent ?? false} onChange={v => updateDesign('descriptionIndent', v)} />
        </SectionBlock>

        {/* Ã¢â€â‚¬Ã¢â€â‚¬ Personal Details Ã¢â€â‚¬Ã¢â€â‚¬ */}
        <SectionBlock title="Personal Details" icon={Settings2}>
          <div>
            <Label>Alignment</Label>
            <div className="flex gap-1.5">
              <IconToggle active={d.personalAlign === 'left'} onClick={() => updateDesign('personalAlign', 'left')} icon={AlignLeft} label="Left" />
              <IconToggle active={d.personalAlign === 'center'} onClick={() => updateDesign('personalAlign', 'center')} icon={AlignCenter} label="Center" />
              <IconToggle active={d.personalAlign === 'right'} onClick={() => updateDesign('personalAlign', 'right')} icon={AlignRight} label="Right" />
            </div>
          </div>

          <div>
            <Label>Name Size</Label>
            <div className="flex gap-1.5">
              {NAME_SIZE_OPTIONS.map(s => (
                <ToggleChip key={s} active={d.nameSize === s} onClick={() => updateDesign('nameSize', s)}>
                  {s.toUpperCase()}
                </ToggleChip>
              ))}
            </div>
          </div>

          <BoolToggle label="Bold Name" value={d.nameBold ?? true} onChange={v => updateDesign('nameBold', v)} />

          <div>
            <Label>Title Size</Label>
            <div className="flex gap-1.5">
              {(['s', 'm', 'l'] as const).map(s => (
                <ToggleChip key={s} active={d.titleSize === s} onClick={() => updateDesign('titleSize', s)}>
                  {s.toUpperCase()}
                </ToggleChip>
              ))}
            </div>
          </div>

          <div>
            <Label>Title Style</Label>
            <div className="flex gap-1.5">
              {(['normal', 'italic'] as const).map(s => (
                <ToggleChip key={s} active={d.titleStyle === s} onClick={() => updateDesign('titleStyle', s)}>
                  {s}
                </ToggleChip>
              ))}
            </div>
          </div>

          <div>
            <Label>Title Position</Label>
            <div className="flex gap-1.5">
              {(['below', 'same-line'] as const).map(s => (
                <ToggleChip key={s} active={d.titlePosition === s} onClick={() => updateDesign('titlePosition', s)}>
                  {s === 'below' ? 'Below Name' : 'Same Line'}
                </ToggleChip>
              ))}
            </div>
          </div>

          <BoolToggle label="Show Icons" value={d.personalIconShow ?? true} onChange={v => updateDesign('personalIconShow', v)} />
          <BoolToggle label="Show Bullets" value={d.personalBulletShow ?? false} onChange={v => updateDesign('personalBulletShow', v)} />
          <BoolToggle label="Show Separator Bar" value={d.personalBarShow ?? false} onChange={v => updateDesign('personalBarShow', v)} />
        </SectionBlock>

        {/* Ã¢â€â‚¬Ã¢â€â‚¬ Photo Ã¢â€â‚¬Ã¢â€â‚¬ */}
        <SectionBlock title="Photo" icon={Image}>
          <BoolToggle label="Show Photo" value={d.photoShow ?? true} onChange={v => updateDesign('photoShow', v)} />

          {d.photoShow && (
            <>
              <div>
                <Label>Photo Size</Label>
                <div className="flex gap-1.5">
                  {PHOTO_SIZE_OPTIONS.map(s => (
                    <ToggleChip key={s} active={d.photoSize === s} onClick={() => updateDesign('photoSize', s)}>
                      {s.toUpperCase()}
                    </ToggleChip>
                  ))}
                </div>
              </div>

              <div>
                <Label>Photo Shape</Label>
                <div className="flex gap-2">
                  {PHOTO_SHAPE_OPTIONS.map(opt => {
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => updateDesign('photoShape', opt.id)}
                        title={opt.id}
                        className={`p-2.5 rounded-lg border transition-all ${
                          d.photoShape === opt.id
                            ? 'border-[#ff4d7d] bg-[#ff4d7d]/5 text-[#ff4d7d]'
                            : ''
                        }`}
                        style={{ borderRadius: opt.id === 'circle' ? '50%' : opt.id === 'rounded' ? '8px' : opt.id === 'hexagon' ? '4px' : '0' }}
                      >
                        <Icon className="w-4 h-4" />
                      </button>
                    );
                  })}
                </div>
              </div>

              <BoolToggle label="Grayscale Photo" value={d.photoGrayscale ?? false} onChange={v => updateDesign('photoGrayscale', v)} />
            </>
          )}
        </SectionBlock>

        {/* Ã¢â€â‚¬Ã¢â€â‚¬ Skills & Languages Ã¢â€â‚¬Ã¢â€â‚¬ */}
        <SectionBlock title="Skills & Languages" icon={Grid}>
          <div>
            <Label>Skills Style</Label>
            <div className="grid grid-cols-2 gap-1.5">
              {SKILL_STYLE_OPTIONS.map(s => (
                <ToggleChip key={s} active={d.skillsStyle === s} onClick={() => updateDesign('skillsStyle', s)}>
                  {s}
                </ToggleChip>
              ))}
            </div>
          </div>

          <div>
            <Label>Skills Columns</Label>
            <div className="flex items-center gap-3">
              <button onClick={() => updateDesign('skillsColumns', Math.max(1, (d.skillsColumns ?? 2) - 1))} className="p-1.5 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                <Minus className="w-3.5 h-3.5 text-gray-500" />
              </button>
              <span className="text-sm font-black text-gray-700 w-6 text-center">{d.skillsColumns ?? 2}</span>
              <button onClick={() => updateDesign('skillsColumns', Math.min(4, (d.skillsColumns ?? 2) + 1))} className="p-1.5 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                <Plus className="w-3.5 h-3.5 text-gray-500" />
              </button>
            </div>
          </div>

          <div>
            <Label>Languages Style</Label>
            <div className="grid grid-cols-2 gap-1.5">
              {SKILL_STYLE_OPTIONS.map(s => (
                <ToggleChip key={s} active={d.languagesStyle === s} onClick={() => updateDesign('languagesStyle', s)}>
                  {s}
                </ToggleChip>
              ))}
            </div>
          </div>

          <div>
            <Label>Languages Columns</Label>
            <div className="flex items-center gap-3">
              <button onClick={() => updateDesign('languagesColumns', Math.max(1, (d.languagesColumns ?? 2) - 1))} className="p-1.5 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                <Minus className="w-3.5 h-3.5 text-gray-500" />
              </button>
              <span className="text-sm font-black text-gray-700 w-6 text-center">{d.languagesColumns ?? 2}</span>
              <button onClick={() => updateDesign('languagesColumns', Math.min(4, (d.languagesColumns ?? 2) + 1))} className="p-1.5 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                <Plus className="w-3.5 h-3.5 text-gray-500" />
              </button>
            </div>
          </div>

          <div>
            <Label>Interests Style</Label>
            <div className="grid grid-cols-2 gap-1.5">
              {(['grid', 'compact', 'bubble'] as const).map(s => (
                <ToggleChip key={s} active={d.interestsStyle === s} onClick={() => updateDesign('interestsStyle', s)}>
                  {s}
                </ToggleChip>
              ))}
            </div>
          </div>
        </SectionBlock>

        {/* Ã¢â€â‚¬Ã¢â€â‚¬ Work & Education Order Ã¢â€â‚¬Ã¢â€â‚¬ */}
        <SectionBlock title="Content Order" icon={List}>
          <div>
            <Label>Work Entry Order</Label>
            <div className="flex gap-1.5">
              {(['title-employer', 'employer-title'] as const).map(s => (
                <ToggleChip key={s} active={d.workOrder === s} onClick={() => updateDesign('workOrder', s)}>
                  {s === 'title-employer' ? 'Title First' : 'Employer First'}
                </ToggleChip>
              ))}
            </div>
          </div>

          <div>
            <Label>Education Entry Order</Label>
            <div className="flex gap-1.5">
              {(['degree-school', 'school-degree'] as const).map(s => (
                <ToggleChip key={s} active={d.educationOrder === s} onClick={() => updateDesign('educationOrder', s)}>
                  {s === 'degree-school' ? 'Degree First' : 'School First'}
                </ToggleChip>
              ))}
            </div>
          </div>

          <BoolToggle label="Group Promotions" value={d.workGroupPromotions ?? false} onChange={v => updateDesign('workGroupPromotions', v)} />
          <BoolToggle label="Show Summary Heading" value={d.showSummaryHeading ?? true} onChange={v => updateDesign('showSummaryHeading', v)} />
        </SectionBlock>

        {/* Ã¢â€â‚¬Ã¢â€â‚¬ Links Ã¢â€â‚¬Ã¢â€â‚¬ */}
        <SectionBlock title="Links" icon={Wand2}>
          <BoolToggle label="Underline Links" value={d.linkUnderline ?? true} onChange={v => updateDesign('linkUnderline', v)} />
          <BoolToggle label="Blue Link Color" value={d.linkBlueColor ?? false} onChange={v => updateDesign('linkBlueColor', v)} />
          <BoolToggle label="Show Link Icons" value={d.linkIcon ?? true} onChange={v => updateDesign('linkIcon', v)} />
        </SectionBlock>

        {/* Ã¢â€â‚¬Ã¢â€â‚¬ Footer Ã¢â€â‚¬Ã¢â€â‚¬ */}
        <SectionBlock title="Footer" icon={Eye}>
          <BoolToggle label="Show Page Numbers" value={d.showPageNumbers ?? true} onChange={v => updateDesign('showPageNumbers', v)} />
          <BoolToggle label="Show Email in Footer" value={d.showEmailInFooter ?? false} onChange={v => updateDesign('showEmailInFooter', v)} />
          <BoolToggle label="Show Name in Footer" value={d.showNameInFooter ?? false} onChange={v => updateDesign('showNameInFooter', v)} />
        </SectionBlock>

      </div>
    </div>
  );
}
