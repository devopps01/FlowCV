'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Bold, Italic, Underline, Check, X, Wand2, Loader2,
  RefreshCw, Palette, AlignLeft, AlignCenter, AlignRight,
  Minus, Plus, ChevronDown,
} from 'lucide-react';
import { FloatingPanelProps, EditTarget, StyleOverride } from './types';
import { htmlToPlainText, plainTextToHtml, saveStyleOverride, resetStyleOverride } from './utils';

// ─── Constants ────────────────────────────────────────────────────────────────

const FONT_FAMILIES = [
  'Inter', 'Poppins', 'Montserrat', 'Roboto',
  'Merriweather', 'Lora', 'Playfair Display', 'Fira Code',
];

const COLOR_SWATCHES = [
  '#1f2937', '#6366f1', '#8b5cf6', '#ec4899',
  '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#ffffff',
];

const TEXTAREA_AI_TAGS = ['impactful', 'metrics', 'shorter', 'professional', 'action_verbs', 'ats'];
const TEXT_AI_TAGS = ['professional', 'concise', 'creative', 'formal'];

const PANEL_BG = 'linear-gradient(135deg, #1e1b4b, #2d2a6e)';

// ─── AutoTextarea ─────────────────────────────────────────────────────────────

function AutoTextarea({ value, onChange, onKeyDown, style, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.max(el.scrollHeight, 80)}px`;
  }, [value]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.max(el.scrollHeight, 80)}px`;
    el.focus();
    el.setSelectionRange(el.value.length, el.value.length);
  }, []);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      style={{
        ...style as React.CSSProperties,
        resize: 'none',
        overflow: 'hidden',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}
      rows={3}
      {...props}
    />
  );
}

// ─── MonthPicker ──────────────────────────────────────────────────────────────

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function MonthPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [year, setYear] = useState(() => {
    const m = value?.match(/\d{4}/);
    return m ? parseInt(m[0]) : new Date().getFullYear();
  });
  const currentYear = new Date().getFullYear();

  const parseSelected = () => {
    if (!value) return { month: -1, year: -1 };
    const m = value.match(/(\w+)\s+(\d{4})/);
    if (m) {
      const mi = MONTHS.findIndex(mo => mo.toLowerCase() === m[1].toLowerCase().slice(0, 3));
      return { month: mi, year: parseInt(m[2]) };
    }
    if (value.toLowerCase() === 'present' || value.toLowerCase() === 'current') {
      return { month: -2, year: -2 };
    }
    return { month: -1, year: -1 };
  };

  const { month: selMonth, year: selYear } = parseSelected();

  const select = (monthIdx: number) => {
    onChange(`${MONTHS[monthIdx]} ${year}`);
  };

  return (
    <div style={{ color: '#e2e8f0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <button onClick={() => setYear(y => y - 1)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#e2e8f0', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: 14 }}>‹</button>
        <span style={{ fontWeight: 700, fontSize: 14 }}>{year}</span>
        <button onClick={() => setYear(y => Math.min(y + 1, currentYear + 5))} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#e2e8f0', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: 14 }}>›</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
        {MONTHS.map((mo, i) => {
          const isSelected = selMonth === i && selYear === year;
          return (
            <button key={mo} onClick={() => select(i)}
              style={{
                padding: '6px 4px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12,
                fontWeight: isSelected ? 700 : 400,
                background: isSelected ? '#6366f1' : 'rgba(255,255,255,0.08)',
                color: isSelected ? '#fff' : '#cbd5e1',
              }}>
              {mo}
            </button>
          );
        })}
      </div>
      <button onClick={() => onChange('Present')}
        style={{
          marginTop: 8, width: '100%', padding: 6, borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12,
          fontWeight: selMonth === -2 ? 700 : 400,
          background: selMonth === -2 ? '#6366f1' : 'rgba(255,255,255,0.08)',
          color: selMonth === -2 ? '#fff' : '#cbd5e1',
        }}>
        Present / Current
      </button>
    </div>
  );
}

// ─── Main FloatingPanel Component ─────────────────────────────────────────────

export function FloatingPanel({ target, data, updateNested, onClose, containerRect, zoom }: FloatingPanelProps) {
  const [value, setValue] = useState(target.value);
  const [showStyle, setShowStyle] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [aiInstruction, setAiInstruction] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);

  const existingStyle: StyleOverride = (data.styleOverrides?.[target.stylePath] || {}) as StyleOverride;
  const [fontSize, setFontSize] = useState<number>(existingStyle.fontSize || 0);
  const [fontWeight, setFontWeight] = useState(existingStyle.fontWeight || '');
  const [fontStyle, setFontStyle] = useState(existingStyle.fontStyle || '');
  const [textDecoration, setTextDecoration] = useState(existingStyle.textDecoration || '');
  const [textAlign, setTextAlign] = useState(existingStyle.textAlign || '');
  const [fontFamily, setFontFamily] = useState(existingStyle.fontFamily || '');
  const [color, setColor] = useState(existingStyle.color || '');
  const [bgColor, setBgColor] = useState(existingStyle.backgroundColor || '');

  const panelWidth = target.fieldType === 'textarea' || target.fieldType === 'date' ? 380 : 320;

  const getPosition = useCallback(() => {
    if (!containerRect) return { top: 100, left: 100 };
    const scaledRect = {
      top: target.rect.top - containerRect.top,
      left: target.rect.left - containerRect.left,
      bottom: target.rect.bottom - containerRect.top,
    };
    let top = scaledRect.bottom + 8;
    let left = scaledRect.left;
    const containerWidth = containerRect.width;
    if (left + panelWidth > containerWidth - 8) {
      left = Math.max(8, containerWidth - panelWidth - 8);
    }
    if (left < 8) left = 8;
    const estimatedPanelHeight = showStyle || showAI ? 500 : 300;
    const containerHeight = containerRect.height;
    if (top + estimatedPanelHeight > containerHeight - 8) {
      top = Math.max(8, scaledRect.top - estimatedPanelHeight - 8);
    }
    return { top, left };
  }, [target.rect, containerRect, panelWidth, showStyle, showAI]);

  const pos = getPosition();

  const handleStyleSave = useCallback((overrides: Partial<StyleOverride>) => {
    saveStyleOverride(data.styleOverrides, target.stylePath, overrides, updateNested);
  }, [data.styleOverrides, target.stylePath, updateNested]);

  const handleResetStyle = useCallback(() => {
    resetStyleOverride(data.styleOverrides, target.stylePath, updateNested);
    setFontSize(0); setFontWeight(''); setFontStyle('');
    setTextDecoration(''); setTextAlign(''); setFontFamily(''); setColor(''); setBgColor('');
  }, [data.styleOverrides, target.stylePath, updateNested]);

  const handleChange = useCallback((newVal: string) => {
    setValue(newVal);

    // Handle composite fields (e.g., language — proficiency)
    const compositeType = target.element?.dataset.editComposite;
    if (compositeType === 'language-line') {
      const normalized = newVal.trim();
      const parts = normalized.split(/\s+[—-]\s+|—|-/).map(part => part.trim()).filter(Boolean);
      const language = parts[0] || '';
      const proficiency = parts.slice(1).join(' - ');
      const basePath = target.path.replace(/\.__composite$/, '');
      updateNested(`${basePath}.language`, language);
      updateNested(`${basePath}.proficiency`, proficiency);
      return;
    }

    // Handle richtext fields
    if (target.element?.dataset.editType === 'richtext') {
      updateNested(target.path, plainTextToHtml(newVal));
    } else {
      updateNested(target.path, newVal);
    }
  }, [target.path, target.element, updateNested]);

  // AI enhancement
  const runAI = useCallback(async () => {
    if (!value.trim() && !aiInstruction.trim()) return;
    setAiLoading(true);
    setAiSuggestion('');
    try {
      const tagInstructions = selectedTags.map(t => {
        const map: Record<string, string> = {
          impactful: 'Make it more impactful with strong action verbs',
          metrics: 'Add quantifiable metrics and numbers',
          shorter: 'Make it shorter and more concise',
          professional: 'Make it more professional',
          action_verbs: 'Start bullet points with strong action verbs',
          ats: 'Optimize for ATS (Applicant Tracking Systems)',
          concise: 'Make it more concise',
          creative: 'Make it more creative and engaging',
          formal: 'Use formal language',
        };
        return map[t] || t;
      }).join('. ');
      const instruction = [tagInstructions, aiInstruction].filter(Boolean).join('. ');
      const res = await fetch('/api/ai/enhance-field', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: value, fieldType: target.fieldType === 'textarea' ? 'description' : 'default', instruction }),
      });
      const result = await res.json();
      if (result.enhanced) {
        setAiSuggestion(result.enhanced);
      }
    } catch {
      setAiSuggestion('');
    } finally {
      setAiLoading(false);
    }
  }, [value, aiInstruction, selectedTags, target.fieldType]);

  const applyAI = useCallback(() => {
    if (!aiSuggestion) return;
    handleChange(aiSuggestion);
    setAiSuggestion('');
    setShowAI(false);
  }, [aiSuggestion, handleChange]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const aiTags = target.fieldType === 'textarea' ? TEXTAREA_AI_TAGS : TEXT_AI_TAGS;

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 8,
    color: '#f1f5f9',
    fontSize: 13,
    padding: '8px 10px',
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  };

  const btnStyle = (active: boolean): React.CSSProperties => ({
    padding: '5px 8px',
    borderRadius: 6,
    border: 'none',
    cursor: 'pointer',
    fontSize: 11,
    fontWeight: 600,
    background: active ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.1)',
    color: active ? '#fff' : '#cbd5e1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  });

  return (
    <div
      ref={panelRef}
      data-inline-panel="true"
      style={{
        position: 'absolute',
        top: pos.top,
        left: pos.left,
        width: panelWidth,
        zIndex: 9999,
        background: PANEL_BG,
        borderRadius: 14,
        boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1)',
        overflow: 'hidden',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
      onMouseDown={e => e.stopPropagation()}
      onClick={e => e.stopPropagation()}
    >
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 12px 8px', borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#a5b4fc' }}>
          {target.label}
        </span>
        <div style={{ display: 'flex', gap: 4 }}>
          {/* Container/Div edit mode indicator */}
          {target.fieldType === 'richtext' && (
            <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, background: 'rgba(99,102,241,0.3)', color: '#a5b4fc', fontWeight: 700 }}>
              HTML
            </span>
          )}
          <button onClick={() => { setShowStyle(s => !s); setShowAI(false); }} title="Style"
            style={{ ...btnStyle(showStyle), padding: '4px 6px' }}>
            <Palette size={13} />
          </button>
          <button onClick={onClose} title="Close" style={{ ...btnStyle(false), padding: '4px 6px' }}>
            <X size={13} />
          </button>
        </div>
      </div>

      {/* Input Area */}
      <div style={{ padding: '10px 12px 0' }}>
        {target.fieldType === 'textarea' || target.fieldType === 'richtext' ? (
          <AutoTextarea value={value} onChange={e => handleChange(e.target.value)}
            placeholder="Enter text..." style={inputStyle} />
        ) : target.fieldType === 'date' ? (
          <MonthPicker value={value} onChange={handleChange} />
        ) : (
          <input
            type={target.fieldType === 'email' ? 'email' : target.fieldType === 'tel' ? 'tel' : target.fieldType === 'url' ? 'url' : 'text'}
            value={value} onChange={e => handleChange(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); onClose(); } if (e.key === 'Escape') { e.preventDefault(); onClose(); } }}
            placeholder={`Enter ${target.label.toLowerCase()}...`}
            autoFocus
            style={{ ...inputStyle, height: 38, lineHeight: '38px' }} />
        )}
      </div>

      {/* Formatting Toolbar */}
      {target.fieldType !== 'date' && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4, padding: '8px 12px',
          borderBottom: showStyle || showAI ? '1px solid rgba(255,255,255,0.08)' : 'none',
        }}>
          <button title="Bold" onClick={() => { const v = fontWeight === 'bold' ? '' : 'bold'; setFontWeight(v); handleStyleSave({ fontWeight: v }); }} style={btnStyle(fontWeight === 'bold')}>
            <Bold size={13} />
          </button>
          <button title="Italic" onClick={() => { const v = fontStyle === 'italic' ? '' : 'italic'; setFontStyle(v); handleStyleSave({ fontStyle: v }); }} style={btnStyle(fontStyle === 'italic')}>
            <Italic size={13} />
          </button>
          <button title="Underline" onClick={() => { const v = textDecoration === 'underline' ? '' : 'underline'; setTextDecoration(v); handleStyleSave({ textDecoration: v }); }} style={btnStyle(textDecoration === 'underline')}>
            <Underline size={13} />
          </button>
          <div style={{ flex: 1 }} />
          <button onClick={() => { setShowAI(s => !s); setShowStyle(false); }}
            style={{ ...btnStyle(showAI), padding: '5px 10px', fontSize: 11, gap: 5 }}>
            <Wand2 size={12} /> AI
          </button>
        </div>
      )}

      {/* Style Panel */}
      {showStyle && (
        <div style={{ padding: '10px 12px 12px', maxHeight: 400, overflowY: 'auto' }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 10 }}>
            Element Style — applies to this element only
          </div>

          {/* Font size */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 11, color: '#94a3b8', width: 70 }}>Font size</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <button onClick={() => { const base = data.design?.fontSize || 10.5; const cur = fontSize || base; const v = Math.max(6, cur - 1); setFontSize(v); handleStyleSave({ fontSize: v }); }} style={{ ...btnStyle(false), padding: '4px 6px' }}>
                <Minus size={11} />
              </button>
              <span style={{ fontSize: 12, color: '#e2e8f0', minWidth: 28, textAlign: 'center' }}>
                {fontSize || Math.round((data.design?.fontSize || 10.5) * 1.333)}
              </span>
              <button onClick={() => { const base = data.design?.fontSize || 10.5; const cur = fontSize || base; const v = Math.min(48, cur + 1); setFontSize(v); handleStyleSave({ fontSize: v }); }} style={{ ...btnStyle(false), padding: '4px 6px' }}>
                <Plus size={11} />
              </button>
            </div>
          </div>

          {/* Style toggles */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 11, color: '#94a3b8', width: 70 }}>Style</span>
            <div style={{ display: 'flex', gap: 4 }}>
              <button onClick={() => { const v = fontWeight === 'bold' ? '' : 'bold'; setFontWeight(v); handleStyleSave({ fontWeight: v }); }} style={btnStyle(fontWeight === 'bold')}><Bold size={12} /></button>
              <button onClick={() => { const v = fontStyle === 'italic' ? '' : 'italic'; setFontStyle(v); handleStyleSave({ fontStyle: v }); }} style={btnStyle(fontStyle === 'italic')}><Italic size={12} /></button>
              <button onClick={() => { const v = textDecoration === 'underline' ? '' : 'underline'; setTextDecoration(v); handleStyleSave({ textDecoration: v }); }} style={btnStyle(textDecoration === 'underline')}><Underline size={12} /></button>
            </div>
          </div>

          {/* Align */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 11, color: '#94a3b8', width: 70 }}>Align</span>
            <div style={{ display: 'flex', gap: 4 }}>
              {(['left', 'center', 'right'] as const).map(align => (
                <button key={align} onClick={() => { setTextAlign(align); handleStyleSave({ textAlign: align }); }} style={btnStyle(textAlign === align)}>
                  {align === 'left' && <AlignLeft size={12} />}
                  {align === 'center' && <AlignCenter size={12} />}
                  {align === 'right' && <AlignRight size={12} />}
                </button>
              ))}
            </div>
          </div>

          {/* Font family */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 11, color: '#94a3b8', width: 70 }}>Font</span>
            <div style={{ position: 'relative', flex: 1 }}>
              <select value={fontFamily} onChange={e => { setFontFamily(e.target.value); handleStyleSave({ fontFamily: e.target.value }); }}
                style={{ width: '100%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 6, color: '#e2e8f0', fontSize: 12, padding: '5px 24px 5px 8px', outline: 'none', appearance: 'none', cursor: 'pointer' }}>
                <option value="" style={{ background: '#1e1b4b' }}>Default</option>
                {FONT_FAMILIES.map(f => <option key={f} value={f} style={{ background: '#1e1b4b' }}>{f}</option>)}
              </select>
              <ChevronDown size={12} style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
            </div>
          </div>

          {/* Text Color */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 11, color: '#94a3b8', width: 70, paddingTop: 4 }}>Color</span>
            <div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 6 }}>
                {COLOR_SWATCHES.map(c => (
                  <button key={c} onClick={() => { setColor(c); handleStyleSave({ color: c }); }} title={c}
                    style={{ width: 20, height: 20, borderRadius: 4, background: c, border: color === c ? '2px solid #6366f1' : '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', padding: 0, boxSizing: 'border-box' }} />
                ))}
                <label title="Custom color" style={{ width: 20, height: 20, borderRadius: 4, border: '1px dashed rgba(255,255,255,0.3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#94a3b8', position: 'relative', overflow: 'hidden' }}>
                  +
                  <input type="color" value={color || '#1f2937'} onChange={e => { setColor(e.target.value); handleStyleSave({ color: e.target.value }); }}
                    style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }} />
                </label>
              </div>
              {color && <div style={{ fontSize: 10, color: '#94a3b8' }}>{color}</div>}
            </div>
          </div>

          {/* Background Color */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 11, color: '#94a3b8', width: 70, paddingTop: 4 }}>Background</span>
            <div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 6 }}>
                <button onClick={() => { setBgColor(''); handleStyleSave({ backgroundColor: 'transparent' }); }} title="Transparent"
                  style={{
                    width: 20, height: 20, borderRadius: 4,
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.14))',
                    border: !bgColor || bgColor === 'transparent' ? '2px solid #6366f1' : '1px solid rgba(255,255,255,0.2)',
                    cursor: 'pointer', padding: 0, boxSizing: 'border-box', color: '#cbd5e1', fontSize: 10
                  }}>
                  ×
                </button>
                {COLOR_SWATCHES.map(bg => (
                  <button key={`bg-${bg}`} onClick={() => { setBgColor(bg); handleStyleSave({ backgroundColor: bg }); }} title={bg}
                    style={{
                      width: 20, height: 20, borderRadius: 4, background: bg,
                      border: bgColor === bg ? '2px solid #6366f1' : '1px solid rgba(255,255,255,0.2)',
                      cursor: 'pointer', padding: 0, boxSizing: 'border-box'
                    }} />
                ))}
              </div>
              {bgColor && bgColor !== 'transparent' && <div style={{ fontSize: 10, color: '#94a3b8' }}>{bgColor}</div>}
            </div>
          </div>

          {/* Reset */}
          <button onClick={handleResetStyle}
            style={{ width: '100%', padding: '7px', borderRadius: 7, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)', color: '#94a3b8', fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
            <RefreshCw size={11} /> Reset to default
          </button>
        </div>
      )}

      {/* AI Panel */}
      {showAI && (
        <div style={{ padding: '10px 12px 12px' }}>
          {/* AI tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 10 }}>
            {aiTags.map(tag => (
              <button key={tag} onClick={() => setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])}
                style={{
                  padding: '4px 10px', borderRadius: 999, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600,
                  background: selectedTags.includes(tag) ? 'rgba(99,102,241,0.6)' : 'rgba(255,255,255,0.1)',
                  color: selectedTags.includes(tag) ? '#fff' : '#cbd5e1',
                }}>
                {tag.replace(/_/g, ' ')}
              </button>
            ))}
          </div>

          {/* Custom instruction */}
          <input type="text" value={aiInstruction} onChange={e => setAiInstruction(e.target.value)}
            placeholder="Custom instruction (optional)..."
            onKeyDown={e => { if (e.key === 'Enter') runAI(); }}
            style={{ width: '100%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, color: '#f1f5f9', fontSize: 12, padding: '7px 10px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: 8 }} />

          <button onClick={runAI} disabled={aiLoading}
            style={{
              width: '100%', padding: '8px', borderRadius: 8, border: 'none', cursor: aiLoading ? 'not-allowed' : 'pointer',
              fontSize: 12, fontWeight: 700, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, opacity: aiLoading ? 0.7 : 1,
              marginBottom: aiSuggestion ? 10 : 0
            }}>
            {aiLoading ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Wand2 size={13} />}
            {aiLoading ? 'Generating...' : 'Generate with AI'}
          </button>

          {aiSuggestion && (
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#a5b4fc', marginBottom: 6, letterSpacing: '0.05em' }}>
                ✨ AI suggestion
              </div>
              <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 8, padding: '8px 10px', fontSize: 12, color: '#e2e8f0', lineHeight: 1.5, marginBottom: 8, maxHeight: 120, overflowY: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {aiSuggestion}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={applyAI} style={{ flex: 1, padding: '6px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700, background: 'rgba(99,102,241,0.6)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                  <Check size={11} /> Apply
                </button>
                <button onClick={runAI} style={{ flex: 1, padding: '6px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700, background: 'rgba(255,255,255,0.1)', color: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                  <RefreshCw size={11} /> Retry
                </button>
                <button onClick={() => setAiSuggestion('')} style={{ flex: 1, padding: '6px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700, background: 'rgba(255,255,255,0.05)', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                  <X size={11} /> Dismiss
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default FloatingPanel;