'use client';

import React, { useState, useCallback } from 'react';
import {
  Bold, Italic, Underline, X,
  AlignLeft, AlignCenter, AlignRight,
  Minus, Plus, ChevronDown, RefreshCw,
  Type,
} from 'lucide-react';
import { EditTarget, StyleOverride } from './types';
import { saveStyleOverride, resetStyleOverride } from './utils';

interface FormatToolbarProps {
  target: EditTarget | null;
  data: any;
  updateNested: (path: string, value: any) => void;
  onClose: () => void;
}

const FONT_FAMILIES = [
  { value: '', label: 'Default' },
  { value: 'Inter', label: 'Inter' },
  { value: 'Poppins', label: 'Poppins' },
  { value: 'Montserrat', label: 'Montserrat' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Merriweather', label: 'Merriweather' },
  { value: 'Lora', label: 'Lora' },
  { value: 'Playfair Display', label: 'Playfair Display' },
  { value: 'Fira Code', label: 'Fira Code' },
];

const COLOR_SWATCHES = [
  '#1f2937', '#6366f1', '#8b5cf6', '#ec4899',
  '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#ffffff',
];

const BG_COLORS = [
  'transparent', '#ffffff', '#f8fafc', '#f1f5f9',
  '#fef3c7', '#ecfdf5', '#eff6ff', '#fce7f3', '#fff7ed',
];

export function FormatToolbar({ target, data, updateNested, onClose }: FormatToolbarProps) {
  const stylePath = target?.stylePath || '';
  const existingStyle: StyleOverride = (data.styleOverrides?.[stylePath] || {}) as StyleOverride;

  const [showMore, setShowMore] = useState(false);

  const handleSave = useCallback((overrides: Partial<StyleOverride>) => {
    if (!stylePath) return;
    saveStyleOverride(data.styleOverrides, stylePath, overrides, updateNested);
  }, [data.styleOverrides, stylePath, updateNested]);

  const handleReset = useCallback(() => {
    if (!stylePath) return;
    resetStyleOverride(data.styleOverrides, stylePath, updateNested);
  }, [data.styleOverrides, stylePath, updateNested]);

  if (!target) {
    return (
      <div
        className="flex items-center gap-2 px-4 py-2 rounded-xl select-none shrink-0"
        style={{
          background: 'var(--app-bg-card)',
          border: '1px solid var(--app-border)',
          height: '44px',
        }}
      >
        <Type className="w-3.5 h-3.5" style={{ color: 'var(--app-text-muted)' }} />
        <span className="text-[11px] font-bold" style={{ color: 'var(--app-text-muted)' }}>
          Click any text in resume to format
        </span>
      </div>
    );
  }

  const fs = existingStyle.fontSize || 0;
  const fw = existingStyle.fontWeight || '';
  const fst = existingStyle.fontStyle || '';
  const td = existingStyle.textDecoration || '';
  const ta = existingStyle.textAlign || '';
  const ff = existingStyle.fontFamily || '';
  const col = existingStyle.color || '';
  const bg = existingStyle.backgroundColor || '';

  const btnBase: React.CSSProperties = {
    padding: '5px 7px',
    borderRadius: 6,
    border: 'none',
    cursor: 'pointer',
    fontSize: 11,
    fontWeight: 600,
    background: 'transparent',
    color: 'var(--app-text-secondary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    transition: 'all 0.15s ease',
  };

  const btnActive = (active: boolean): React.CSSProperties => ({
    ...btnBase,
    background: active ? 'var(--app-primary-light)' : 'transparent',
    color: active ? 'var(--app-primary)' : 'var(--app-text-secondary)',
  });

  return (
    <div
      className="flex items-center gap-1 px-3 py-1.5 rounded-xl select-none shrink-0 overflow-x-auto"
      style={{
        background: 'var(--app-bg-card)',
        border: '1px solid var(--app-border)',
        height: '44px',
        minWidth: 0,
        maxWidth: '100%',
      }}
    >
      {/* Selected label */}
      <span
        className="text-[9px] font-black uppercase tracking-widest mr-1 shrink-0"
        style={{ color: 'var(--app-primary)' }}
      >
        {target.label}
      </span>

      <div className="w-px h-5 mx-0.5" style={{ background: 'var(--app-border)' }} />

      {/* Bold */}
      <button
        onClick={() => handleSave({ fontWeight: fw === 'bold' ? '' : 'bold' })}
        style={btnActive(fw === 'bold')}
        title="Bold"
        onMouseEnter={e => { if (fw !== 'bold') (e.currentTarget as HTMLElement).style.background = 'var(--app-bg-gray)'; }}
        onMouseLeave={e => { if (fw !== 'bold') (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
      >
        <Bold size={13} />
      </button>

      {/* Italic */}
      <button
        onClick={() => handleSave({ fontStyle: fst === 'italic' ? '' : 'italic' })}
        style={btnActive(fst === 'italic')}
        title="Italic"
        onMouseEnter={e => { if (fst !== 'italic') (e.currentTarget as HTMLElement).style.background = 'var(--app-bg-gray)'; }}
        onMouseLeave={e => { if (fst !== 'italic') (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
      >
        <Italic size={13} />
      </button>

      {/* Underline */}
      <button
        onClick={() => handleSave({ textDecoration: td === 'underline' ? '' : 'underline' })}
        style={btnActive(td === 'underline')}
        title="Underline"
        onMouseEnter={e => { if (td !== 'underline') (e.currentTarget as HTMLElement).style.background = 'var(--app-bg-gray)'; }}
        onMouseLeave={e => { if (td !== 'underline') (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
      >
        <Underline size={13} />
      </button>

      <div className="w-px h-5 mx-0.5" style={{ background: 'var(--app-border)' }} />

      {/* Font Size */}
      <div className="flex items-center gap-0.5">
        <button
          onClick={() => {
            const base = data.design?.fontSize || 10.5;
            const cur = fs || base;
            const v = Math.max(6, cur - 1);
            handleSave({ fontSize: v });
          }}
          style={btnBase}
          title="Decrease font size"
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--app-bg-gray)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
        >
          <Minus size={11} />
        </button>
        <span
          className="text-xs font-bold w-8 text-center"
          style={{ color: 'var(--app-text)' }}
        >
          {fs || Math.round((data.design?.fontSize || 10.5) * 1.333)}
        </span>
        <button
          onClick={() => {
            const base = data.design?.fontSize || 10.5;
            const cur = fs || base;
            const v = Math.min(48, cur + 1);
            handleSave({ fontSize: v });
          }}
          style={btnBase}
          title="Increase font size"
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--app-bg-gray)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
        >
          <Plus size={11} />
        </button>
      </div>

      <div className="w-px h-5 mx-0.5" style={{ background: 'var(--app-border)' }} />

      {/* Font Family */}
      <div className="relative shrink-0">
        <select
          value={ff}
          onChange={e => handleSave({ fontFamily: e.target.value })}
          style={{
            background: 'var(--app-bg-gray)',
            border: '1px solid var(--app-border)',
            borderRadius: 6,
            color: 'var(--app-text)',
            fontSize: 10,
            padding: '3px 20px 3px 6px',
            outline: 'none',
            appearance: 'none',
            cursor: 'pointer',
            fontWeight: 600,
            maxWidth: 90,
          }}
        >
          {FONT_FAMILIES.map(f => (
            <option key={f.value || '__default__'} value={f.value}>{f.label}</option>
          ))}
        </select>
        <ChevronDown size={10} style={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)', color: 'var(--app-text-muted)', pointerEvents: 'none' }} />
      </div>

      <div className="w-px h-5 mx-0.5" style={{ background: 'var(--app-border)' }} />

      {/* Alignment */}
      {(['left', 'center', 'right'] as const).map(align => (
        <button
          key={align}
          onClick={() => handleSave({ textAlign: ta === align ? '' : align })}
          style={btnActive(ta === align)}
          title={`Align ${align}`}
          onMouseEnter={e => { if (ta !== align) (e.currentTarget as HTMLElement).style.background = 'var(--app-bg-gray)'; }}
          onMouseLeave={e => { if (ta !== align) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
        >
          {align === 'left' && <AlignLeft size={12} />}
          {align === 'center' && <AlignCenter size={12} />}
          {align === 'right' && <AlignRight size={12} />}
        </button>
      ))}

      <div className="w-px h-5 mx-0.5" style={{ background: 'var(--app-border)' }} />

      {/* Text Color */}
      <label className="relative cursor-pointer shrink-0" title="Text color">
        <div
          className="w-5 h-5 rounded-md shadow-sm"
          style={{ background: col || data.design?.textColor || '#1f2937', border: '2px solid var(--app-border)' }}
        >
          {col && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSave({ color: '' });
              }}
              className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full flex items-center justify-center"
              style={{ background: 'var(--app-bg-card)', border: '1px solid var(--app-border)' }}
            >
              <X size={7} />
            </button>
          )}
        </div>
        <input
          type="color"
          value={col || data.design?.textColor || '#1f2937'}
          onChange={e => handleSave({ color: e.target.value })}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        />
      </label>

      {/* Background Color */}
      {showMore && (
        <>
          <div className="w-px h-5 mx-0.5" style={{ background: 'var(--app-border)' }} />
          <label className="relative cursor-pointer shrink-0" title="Background color">
            <div
              className="w-5 h-5 rounded-md"
              style={{
                background: bg && bg !== 'transparent' ? bg : 'rgba(255,255,255,0.1)',
                border: '2px solid var(--app-border)',
              }}
            />
            <input
              type="color"
              value={bg && bg !== 'transparent' ? bg : '#ffffff'}
              onChange={e => handleSave({ backgroundColor: e.target.value })}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
          </label>
        </>
      )}

      {/* Reset */}
      <button
        onClick={handleReset}
        style={btnBase}
        title="Reset style"
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--app-bg-gray)'}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
      >
        <RefreshCw size={11} />
      </button>

      <div className="w-px h-5 mx-0.5" style={{ background: 'var(--app-border)' }} />

      {/* Close */}
      <button
        onClick={onClose}
        style={btnBase}
        title="Close"
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--app-bg-gray)'; (e.currentTarget as HTMLElement).style.color = 'var(--app-text)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--app-text-secondary)'; }}
      >
        <X size={12} />
      </button>
    </div>
  );
}

export default FormatToolbar;