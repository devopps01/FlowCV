'use client';

/**
 * EditorTopBar — Figma-style top panel for the resume editor.
 * Shows context-sensitive controls based on selected section/element.
 * Also provides pre-built style presets.
 */

import React, { useState } from 'react';
import {
  Palette, Type, Layout, AlignLeft, AlignCenter, AlignRight,
  Bold, Italic, Underline, Minus, Plus, RotateCcw,
  Sparkles, ChevronDown, Check, Layers, Grid,
  FileDown, Printer, Share2, Save, Loader2,
  Undo2, Redo2, ZoomIn, ZoomOut, Eye,
} from 'lucide-react';
import { ResumeData } from './types';

// ─── Pre-built style presets ──────────────────────────────────────────────────

const STYLE_PRESETS = [
  {
    id: 'classic',
    name: 'Classic',
    preview: { bg: '#ffffff', accent: '#1e293b', sidebar: '#f8fafc' },
    design: {
      primaryColor: '#1e293b', secondaryColor: '#f8fafc', textColor: '#1e293b',
      backgroundColor: '#ffffff', fontFamily: 'Inter', headingStyle: 'border-bottom',
      headingCapitalization: 'uppercase', layout: 'sidebar-left',
    },
  },
  {
    id: 'modern-blue',
    name: 'Modern Blue',
    preview: { bg: '#ffffff', accent: '#2563eb', sidebar: '#eff6ff' },
    design: {
      primaryColor: '#2563eb', secondaryColor: '#eff6ff', textColor: '#1e293b',
      backgroundColor: '#ffffff', fontFamily: 'Poppins', headingStyle: 'underline',
      headingCapitalization: 'uppercase', layout: 'sidebar-left',
    },
  },
  {
    id: 'elegant',
    name: 'Elegant',
    preview: { bg: '#ffffff', accent: '#7c3aed', sidebar: '#faf5ff' },
    design: {
      primaryColor: '#7c3aed', secondaryColor: '#faf5ff', textColor: '#1e293b',
      backgroundColor: '#ffffff', fontFamily: 'Playfair Display', headingStyle: 'border-bottom',
      headingCapitalization: 'capitalize', layout: 'sidebar-left',
    },
  },
  {
    id: 'minimal',
    name: 'Minimal',
    preview: { bg: '#ffffff', accent: '#374151', sidebar: '#f9fafb' },
    design: {
      primaryColor: '#374151', secondaryColor: '#f9fafb', textColor: '#374151',
      backgroundColor: '#ffffff', fontFamily: 'Inter', headingStyle: 'none',
      headingCapitalization: 'uppercase', layout: 'single',
    },
  },
  {
    id: 'bold-pink',
    name: 'Bold',
    preview: { bg: '#ffffff', accent: '#ff4d7d', sidebar: '#fff0f3' },
    design: {
      primaryColor: '#ff4d7d', secondaryColor: '#fff0f3', textColor: '#1e293b',
      backgroundColor: '#ffffff', fontFamily: 'Montserrat', headingStyle: 'badge',
      headingCapitalization: 'uppercase', layout: 'sidebar-left',
    },
  },
  {
    id: 'dark',
    name: 'Dark',
    preview: { bg: '#0f172a', accent: '#a855f7', sidebar: '#1e293b' },
    design: {
      primaryColor: '#a855f7', secondaryColor: '#1e293b', textColor: '#f1f5f9',
      backgroundColor: '#0f172a', fontFamily: 'Inter', headingStyle: 'border-left',
      headingCapitalization: 'uppercase', layout: 'sidebar-left',
    },
  },
  {
    id: 'green',
    name: 'Nature',
    preview: { bg: '#ffffff', accent: '#059669', sidebar: '#ecfdf5' },
    design: {
      primaryColor: '#059669', secondaryColor: '#ecfdf5', textColor: '#1e293b',
      backgroundColor: '#ffffff', fontFamily: 'Lato', headingStyle: 'border-bottom',
      headingCapitalization: 'uppercase', layout: 'sidebar-left',
    },
  },
  {
    id: 'executive',
    name: 'Executive',
    preview: { bg: '#ffffff', accent: '#0f172a', sidebar: '#f1f5f9' },
    design: {
      primaryColor: '#0f172a', secondaryColor: '#f1f5f9', textColor: '#0f172a',
      backgroundColor: '#ffffff', fontFamily: 'Merriweather', headingStyle: 'double-line',
      headingCapitalization: 'uppercase', layout: 'single',
    },
  },
];

const LAYOUT_OPTIONS = [
  { id: 'single', label: 'Single' },
  { id: 'sidebar-left', label: 'Sidebar L' },
  { id: 'sidebar-right', label: 'Sidebar R' },
  { id: 'modern-header', label: 'Modern' },
  { id: 'double-header', label: 'Double' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const TBBtn = ({
  onClick, active, title, children, disabled,
}: {
  onClick: () => void; active?: boolean; title: string;
  children: React.ReactNode; disabled?: boolean;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={title}
    className="p-2 rounded-lg transition-all text-sm disabled:opacity-40 disabled:cursor-not-allowed"
    style={{
      background: active ? 'var(--app-primary-light)' : 'transparent',
      color: active ? 'var(--app-primary)' : 'var(--app-text-secondary)',
    }}
    onMouseEnter={e => {
      if (!active && !disabled) {
        (e.currentTarget as HTMLElement).style.background = 'var(--app-bg-gray)';
        (e.currentTarget as HTMLElement).style.color = 'var(--app-text)';
      }
    }}
    onMouseLeave={e => {
      if (!active) {
        (e.currentTarget as HTMLElement).style.background = 'transparent';
        (e.currentTarget as HTMLElement).style.color = 'var(--app-text-secondary)';
      }
    }}
  >
    {children}
  </button>
);

const TBDivider = () => (
  <div className="w-px h-5 mx-1" style={{ background: 'var(--app-border)' }} />
);

// ─── Main EditorTopBar ────────────────────────────────────────────────────────

interface EditorTopBarProps {
  data: ResumeData;
  updateDesign: (key: keyof ResumeData['design'], value: any) => void;
  updateNested: (path: string, value: any) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onSave: () => void;
  onExport: () => void;
  onPrint: () => void;
  onShare: () => void;
  saving: boolean;
  isExporting: boolean;
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  numPages: number;
}

export function EditorTopBar({
  data, updateDesign, updateNested,
  onUndo, onRedo, canUndo, canRedo,
  onSave, onExport, onPrint, onShare,
  saving, isExporting,
  zoomLevel, onZoomIn, onZoomOut, onZoomReset,
  numPages,
}: EditorTopBarProps) {
  const d = data.design;
  const [showPresets, setShowPresets] = useState(false);
  const [showLayoutPicker, setShowLayoutPicker] = useState(false);

  const applyPreset = (preset: typeof STYLE_PRESETS[0]) => {
    Object.entries(preset.design).forEach(([k, v]) => {
      updateDesign(k as keyof ResumeData['design'], v);
    });
    setShowPresets(false);
  };

  return (
    <div
      className="flex items-center gap-1 px-3 py-2 border-b select-none shrink-0"
      style={{
        background: 'var(--app-bg-card)',
        borderColor: 'var(--app-border)',
        height: '48px',
      }}
    >
      {/* ── History ── */}
      <TBBtn onClick={onUndo} disabled={!canUndo} title="Undo (Ctrl+Z)">
        <Undo2 className="w-4 h-4" />
      </TBBtn>
      <TBBtn onClick={onRedo} disabled={!canRedo} title="Redo (Ctrl+Y)">
        <Redo2 className="w-4 h-4" />
      </TBBtn>

      <TBDivider />

      {/* ── Pre-built Styles ── */}
      <div className="relative">
        <button
          onClick={() => { setShowPresets(p => !p); setShowLayoutPicker(false); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
          style={{ color: 'var(--app-text)', background: showPresets ? 'var(--app-bg-gray)' : 'transparent' }}
          onMouseEnter={e => { if (!showPresets) (e.currentTarget as HTMLElement).style.background = 'var(--app-bg-gray)'; }}
          onMouseLeave={e => { if (!showPresets) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
        >
          <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--app-primary)' }} />
          Styles
          <ChevronDown className={`w-3 h-3 transition-transform ${showPresets ? 'rotate-180' : ''}`} />
        </button>

        {showPresets && (
          <div
            className="absolute top-full left-0 mt-1 z-50 rounded-xl shadow-2xl p-3"
            style={{
              background: 'var(--app-bg-card)',
              border: '1px solid var(--app-border)',
              width: '320px',
              boxShadow: 'var(--app-shadow-lg)',
            }}
          >
            <p className="text-[9px] font-black uppercase tracking-widest mb-2" style={{ color: 'var(--app-text-muted)' }}>Pre-built Styles</p>
            <div className="grid grid-cols-4 gap-2">
              {STYLE_PRESETS.map(preset => (
                <button
                  key={preset.id}
                  onClick={() => applyPreset(preset)}
                  className="flex flex-col items-center gap-1.5 p-2 rounded-lg transition-all"
                  style={{ border: '1px solid var(--app-border)', background: 'var(--app-bg-gray)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--app-primary)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--app-border)'; }}
                >
                  <div className="w-full h-8 rounded-md overflow-hidden flex">
                    <div className="w-1/3 h-full" style={{ background: preset.preview.sidebar }} />
                    <div className="flex-1 h-full flex flex-col justify-center items-center gap-0.5 px-1" style={{ background: preset.preview.bg }}>
                      <div className="w-full h-1 rounded-full" style={{ background: preset.preview.accent }} />
                      <div className="w-3/4 h-0.5 rounded-full" style={{ background: '#e5e7eb' }} />
                      <div className="w-1/2 h-0.5 rounded-full" style={{ background: '#e5e7eb' }} />
                    </div>
                  </div>
                  <span className="text-[9px] font-bold" style={{ color: 'var(--app-text-secondary)' }}>
                    {preset.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Layout ── */}
      <div className="relative">
        <button
          onClick={() => { setShowLayoutPicker(p => !p); setShowPresets(false); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
          style={{ color: 'var(--app-text)', background: showLayoutPicker ? 'var(--app-bg-gray)' : 'transparent' }}
          onMouseEnter={e => { if (!showLayoutPicker) (e.currentTarget as HTMLElement).style.background = 'var(--app-bg-gray)'; }}
          onMouseLeave={e => { if (!showLayoutPicker) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
        >
          <Layout className="w-3.5 h-3.5" style={{ color: 'var(--app-primary)' }} />
          {LAYOUT_OPTIONS.find(l => l.id === d.layout)?.label || 'Layout'}
          <ChevronDown className={`w-3 h-3 transition-transform ${showLayoutPicker ? 'rotate-180' : ''}`} />
        </button>

        {showLayoutPicker && (
          <div
            className="absolute top-full left-0 mt-1 z-50 rounded-xl shadow-2xl p-2"
            style={{ background: 'var(--app-bg-card)', border: '1px solid var(--app-border)', width: '160px', boxShadow: 'var(--app-shadow-lg)' }}
          >
            {LAYOUT_OPTIONS.map(opt => (
              <button
                key={opt.id}
                onClick={() => { updateDesign('layout', opt.id); setShowLayoutPicker(false); }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all"
                style={{ color: 'var(--app-text)' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--app-bg-gray)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
              >
                {opt.label}
                {d.layout === opt.id && <Check className="w-3 h-3" style={{ color: 'var(--app-primary)' }} />}
              </button>
            ))}
          </div>
        )}
      </div>

      <TBDivider />

      {/* ── Accent Color ── */}
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] font-bold" style={{ color: 'var(--app-text-muted)' }}>Color</span>
        <label className="relative cursor-pointer">
          <div
            className="w-6 h-6 rounded-full shadow-md transition-transform hover:scale-110"
            style={{ background: d.primaryColor || '#41017d', border: '2px solid var(--app-border)' }}
          />
          <input
            type="color"
            value={d.primaryColor || '#41017d'}
            onChange={e => updateDesign('primaryColor', e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
        </label>
      </div>

      <TBDivider />

      {/* ── Font Size ── */}
      <div className="flex items-center gap-1">
        <span className="text-[10px] font-bold" style={{ color: 'var(--app-text-muted)' }}>Size</span>
        <button
          onClick={() => updateDesign('fontSize', Math.max(8, (d.fontSize ?? 10.5) - 0.5))}
          className="p-1 rounded transition-all"
          style={{ color: 'var(--app-text-secondary)' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--app-bg-gray)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
        >
          <Minus className="w-3 h-3" />
        </button>
        <span className="text-xs font-bold w-8 text-center" style={{ color: 'var(--app-text)' }}>
          {d.fontSize ?? 10.5}
        </span>
        <button
          onClick={() => updateDesign('fontSize', Math.min(14, (d.fontSize ?? 10.5) + 0.5))}
          className="p-1 rounded transition-all"
          style={{ color: 'var(--app-text-secondary)' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--app-bg-gray)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>

      <TBDivider />

      {/* ── Alignment ── */}
      <div className="flex items-center gap-0.5">
        <TBBtn
          onClick={() => updateDesign('personalAlign', 'left')}
          active={d.personalAlign === 'left'}
          title="Align left"
        >
          <AlignLeft className="w-3.5 h-3.5" />
        </TBBtn>
        <TBBtn
          onClick={() => updateDesign('personalAlign', 'center')}
          active={d.personalAlign === 'center'}
          title="Align center"
        >
          <AlignCenter className="w-3.5 h-3.5" />
        </TBBtn>
        <TBBtn
          onClick={() => updateDesign('personalAlign', 'right')}
          active={d.personalAlign === 'right'}
          title="Align right"
        >
          <AlignRight className="w-3.5 h-3.5" />
        </TBBtn>
      </div>

      <TBDivider />

      {/* ── Bold Name ── */}
      <TBBtn
        onClick={() => updateDesign('nameBold', !d.nameBold)}
        active={d.nameBold}
        title="Bold name"
      >
        <Bold className="w-3.5 h-3.5" />
      </TBBtn>

      {/* ── Spacer ── */}
      <div className="flex-1" />

      {/* ── Zoom ── */}
      <div className="flex items-center gap-1 px-2 py-1 rounded-lg" style={{ background: 'var(--app-bg-gray)' }}>
        <button onClick={onZoomOut} className="p-0.5 hover:opacity-70 transition-opacity">
          <ZoomOut className="w-3.5 h-3.5" style={{ color: 'var(--app-text-secondary)' }} />
        </button>
        <button
          onClick={onZoomReset}
          className="text-[10px] font-black w-10 text-center transition-opacity hover:opacity-70"
          style={{ color: 'var(--app-text)' }}
        >
          {zoomLevel}%
        </button>
        <button onClick={onZoomIn} className="p-0.5 hover:opacity-70 transition-opacity">
          <ZoomIn className="w-3.5 h-3.5" style={{ color: 'var(--app-text-secondary)' }} />
        </button>
      </div>

      {/* ── Pages ── */}
      <div
        className="px-2 py-1 rounded-lg text-[10px] font-black"
        style={{ background: 'var(--app-primary-light)', color: 'var(--app-primary)' }}
      >
        {numPages}p
      </div>

      <TBDivider />

      {/* ── Actions ── */}
      <TBBtn onClick={onSave} disabled={saving} title="Save (Ctrl+S)">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
      </TBBtn>
      <TBBtn onClick={onShare} title="Share">
        <Share2 className="w-4 h-4" />
      </TBBtn>
      <TBBtn onClick={onPrint} title="Print">
        <Printer className="w-4 h-4" />
      </TBBtn>

      <button
        onClick={onExport}
        disabled={isExporting}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black text-white transition-all hover:opacity-90 disabled:opacity-50 ml-1"
        style={{ background: 'linear-gradient(135deg, #41017d, #ee14ff)' }}
      >
        {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5" />}
        Export PDF
      </button>

      {/* Close dropdowns on outside click */}
      {(showPresets || showLayoutPicker) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => { setShowPresets(false); setShowLayoutPicker(false); }}
        />
      )}
    </div>
  );
}
