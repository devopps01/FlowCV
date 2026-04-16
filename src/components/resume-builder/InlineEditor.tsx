'use client';

import React, {
  useState, useRef, useEffect, useCallback, useLayoutEffect,
} from 'react';
import {
  Bold, Italic, Underline, Check, X, Wand2, Loader2,
  RefreshCw, Palette, AlignLeft, AlignCenter, AlignRight,
  Minus, Plus, ChevronDown,
} from 'lucide-react';
import { ResumeData } from './types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface EditTarget {
  path: string;
  value: string;
  rect: DOMRect;
  fieldType: 'text' | 'date' | 'textarea' | 'email' | 'tel' | 'url';
  label: string;
  element?: HTMLElement;
}

interface StyleOverride {
  fontSize?: number;
  fontWeight?: string;
  fontStyle?: string;
  textDecoration?: string;
  textAlign?: string;
  fontFamily?: string;
  color?: string;
}

interface InlineEditorProps {
  data: ResumeData;
  updateNested: (path: string, value: any) => void;
  children: React.ReactNode;
  containerRef: React.RefObject<HTMLDivElement>;
  zoom: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const EDITABLE_TAGS = new Set([
  'H1','H2','H3','H4','H5','H6','P','A','SPAN','LI','TD','TH',
  'STRONG','EM','B','I','LABEL','DIV',
]);

const TAG_LABELS: Record<string, string> = {
  H1: 'Heading 1', H2: 'Heading 2', H3: 'Heading 3',
  H4: 'Heading 4', H5: 'Heading 5', H6: 'Heading 6',
  P: 'Paragraph', A: 'Link', SPAN: 'Text', LI: 'List item',
  TD: 'Cell', TH: 'Header', STRONG: 'Bold text', EM: 'Italic text',
  B: 'Bold text', I: 'Italic text', LABEL: 'Label', DIV: 'Text block',
};

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function detectFieldType(
  path: string,
  label: string,
  tagName: string,
  value: string,
): EditTarget['fieldType'] {
  const p = path.toLowerCase();
  const l = label.toLowerCase();

  // Check specific types FIRST before auto-detection
  if (p.includes('email') || l.includes('email')) return 'email';
  if (p.includes('phone') || l.includes('phone')) return 'tel';
  if (p.includes('url') || p.includes('website') || p.includes('linkedin') || l.includes('url')) return 'url';

  if (
    p.includes('date') || p.includes('startdate') || p.includes('enddate') ||
    p.includes('graduationyear') || l.includes('date') || l.includes('year')
  ) return 'date';

  if (
    p.includes('description') || p.includes('summary') || p.includes('content') ||
    p.includes('text') || l.includes('description') || l.includes('summary') ||
    tagName === 'P' || tagName === 'LI'
  ) return 'textarea';

  // Auto-detect long text as textarea
  if (value && (value.length > 80 || value.includes('. ') || value.split(' ').length > 10)) return 'textarea';

  return 'text';
}

function htmlToPlainText(html: string): string {
  if (!html) return '';
  const text = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<li[^>]*>/gi, '- ')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .trim();
  return text.replace(/\n{3,}/g, '\n\n');
}

function plainTextToHtml(text: string): string {
  if (!text) return '';
  if (text.trim().startsWith('<')) return text;
  const lines = text.split('\n').filter(l => l.trim());
  if (lines.length === 0) return '';
  if (lines.length === 1) return `<p>${lines[0]}</p>`;
  const allBullets = lines.every(l => /^[-*\u2022]/.test(l.trim()));
  if (allBullets) {
    const items = lines.map(l => `<li>${l.replace(/^[-*\u2022]\s*/, '').trim()}</li>`).join('');
    return `<ul>${items}</ul>`;
  }
  return lines.map(l => `<p>${l}</p>`).join('');
}

function getFieldLabel(path: string, tagName: string): string {
  const p = path.toLowerCase();
  if (p.includes('fullname') || p.includes('firstname') || p.includes('lastname')) return 'Full Name';
  if (p.includes('professionaltitle') || p.includes('jobtitle')) return 'Job Title';
  if (p.includes('summary')) return 'Summary';
  if (p.includes('description')) return 'Description';
  if (p.includes('email')) return 'Email';
  if (p.includes('phone')) return 'Phone';
  if (p.includes('location')) return 'Location';
  if (p.includes('website') || p.includes('url')) return 'Website';
  if (p.includes('linkedin')) return 'LinkedIn';
  if (p.includes('company')) return 'Company';
  if (p.includes('position')) return 'Position';
  if (p.includes('school')) return 'School';
  if (p.includes('degree')) return 'Degree';
  if (p.includes('field')) return 'Field of Study';
  if (p.includes('startdate')) return 'Start Date';
  if (p.includes('enddate')) return 'End Date';
  if (p.includes('date')) return 'Date';
  if (p.includes('name')) return 'Name';
  if (p.includes('title')) return 'Title';
  return TAG_LABELS[tagName] || 'Text';
}

// ─── AutoTextarea ─────────────────────────────────────────────────────────────

function AutoTextarea({
  value, onChange, onKeyDown, style, ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.max(el.scrollHeight, 80)}px`;
  }, [value]);

  useLayoutEffect(() => {
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
        ...style,
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

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

function MonthPicker({
  value, onChange,
}: { value: string; onChange: (v: string) => void }) {
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
      {/* Year nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <button
          onClick={() => setYear(y => y - 1)}
          style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#e2e8f0', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: 14 }}
        >
          &#8249;
        </button>
        <span style={{ fontWeight: 700, fontSize: 14 }}>{year}</span>
        <button
          onClick={() => setYear(y => Math.min(y + 1, currentYear + 5))}
          style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#e2e8f0', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: 14 }}
        >
          &#8250;
        </button>
      </div>
      {/* Month grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
        {MONTHS.map((mo, i) => {
          const isSelected = selMonth === i && selYear === year;
          return (
            <button
              key={mo}
              onClick={() => select(i)}
              style={{
                padding: '6px 4px',
                borderRadius: 6,
                border: 'none',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: isSelected ? 700 : 400,
                background: isSelected ? '#6366f1' : 'rgba(255,255,255,0.08)',
                color: isSelected ? '#fff' : '#cbd5e1',
                transition: 'background 0.15s',
              }}
            >
              {mo}
            </button>
          );
        })}
      </div>
      {/* Present button */}
      <button
        onClick={() => onChange('Present')}
        style={{
          marginTop: 8,
          width: '100%',
          padding: '6px',
          borderRadius: 6,
          border: 'none',
          cursor: 'pointer',
          fontSize: 12,
          fontWeight: selMonth === -2 ? 700 : 400,
          background: selMonth === -2 ? '#6366f1' : 'rgba(255,255,255,0.08)',
          color: selMonth === -2 ? '#fff' : '#cbd5e1',
        }}
      >
        Present / Current
      </button>
    </div>
  );
}

// ─── FloatingPanel ────────────────────────────────────────────────────────────

interface FloatingPanelProps {
  target: EditTarget;
  data: ResumeData;
  updateNested: (path: string, value: any) => void;
  onClose: () => void;
  containerRect: DOMRect | null;
  zoom: number;
}

function FloatingPanel({ target, data, updateNested, onClose, containerRect, zoom }: FloatingPanelProps) {
  const [value, setValue] = useState(target.value);
  const [showStyle, setShowStyle] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [aiInstruction, setAiInstruction] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);

  const existingStyle: StyleOverride = (data.styleOverrides?.[target.path] || {}) as StyleOverride;
  const [fontSize, setFontSize] = useState<number>(existingStyle.fontSize || 0);
  const [fontWeight, setFontWeight] = useState(existingStyle.fontWeight || '');
  const [fontStyle, setFontStyle] = useState(existingStyle.fontStyle || '');
  const [textDecoration, setTextDecoration] = useState(existingStyle.textDecoration || '');
  const [textAlign, setTextAlign] = useState(existingStyle.textAlign || '');
  const [fontFamily, setFontFamily] = useState(existingStyle.fontFamily || '');
  const [color, setColor] = useState(existingStyle.color || '');

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
    const estimatedPanelHeight = 300;
    const containerHeight = containerRect.height;
    if (top + estimatedPanelHeight > containerHeight - 8) {
      top = Math.max(8, scaledRect.top - estimatedPanelHeight - 8);
    }
    return { top, left };
  }, [target.rect, containerRect, panelWidth]);

  const pos = getPosition();

  const saveStyleOverride = useCallback((overrides: StyleOverride) => {
    const current = data.styleOverrides || {};
    const merged: any = { ...current[target.path], ...overrides };
    Object.keys(merged).forEach(k => { if (!merged[k]) delete merged[k]; });
    updateNested('styleOverrides', { ...current, [target.path]: merged });
  }, [data.styleOverrides, target.path, updateNested]);

  const resetStyle = useCallback(() => {
    const current = { ...(data.styleOverrides || {}) };
    delete current[target.path];
    updateNested('styleOverrides', current);
    setFontSize(0); setFontWeight(''); setFontStyle('');
    setTextDecoration(''); setTextAlign(''); setFontFamily(''); setColor('');
  }, [data.styleOverrides, target.path, updateNested]);

  const handleChange = useCallback((newVal: string) => {
    setValue(newVal);
    if (target.element?.dataset.editType === 'richtext') {
      updateNested(target.path, plainTextToHtml(newVal));
    } else {
      updateNested(target.path, newVal);
    }
  }, [target.path, target.element, updateNested]);

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
        body: JSON.stringify({
          text: value,
          fieldType: target.fieldType === 'textarea' ? 'description' : 'default',
          instruction,
        }),
      });
      const json = await res.json();
      if (json.enhanced) setAiSuggestion(json.enhanced);
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
    transition: 'background 0.15s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  });

  return (
    <div
      ref={panelRef}
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
        {target.fieldType === 'textarea' ? (
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
          <button title="Bold" onClick={() => { const v = fontWeight === 'bold' ? '' : 'bold'; setFontWeight(v); saveStyleOverride({ fontWeight: v }); }} style={btnStyle(fontWeight === 'bold')}>
            <Bold size={13} />
          </button>
          <button title="Italic" onClick={() => { const v = fontStyle === 'italic' ? '' : 'italic'; setFontStyle(v); saveStyleOverride({ fontStyle: v }); }} style={btnStyle(fontStyle === 'italic')}>
            <Italic size={13} />
          </button>
          <button title="Underline" onClick={() => { const v = textDecoration === 'underline' ? '' : 'underline'; setTextDecoration(v); saveStyleOverride({ textDecoration: v }); }} style={btnStyle(textDecoration === 'underline')}>
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
        <div style={{ padding: '10px 12px 12px' }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 10 }}>
            Element Style &#8212; applies to this text only
          </div>

          {/* Font size */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 11, color: '#94a3b8', width: 70 }}>Font size</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <button onClick={() => { const base = data.design?.fontSize || 10.5; const cur = fontSize || base; const v = Math.max(6, cur - 1); setFontSize(v); saveStyleOverride({ fontSize: v }); }} style={{ ...btnStyle(false), padding: '4px 6px' }}>
                <Minus size={11} />
              </button>
              <span style={{ fontSize: 12, color: '#e2e8f0', minWidth: 28, textAlign: 'center' }}>
                {fontSize || Math.round((data.design?.fontSize || 10.5) * 1.333)}
              </span>
              <button onClick={() => { const base = data.design?.fontSize || 10.5; const cur = fontSize || base; const v = Math.min(48, cur + 1); setFontSize(v); saveStyleOverride({ fontSize: v }); }} style={{ ...btnStyle(false), padding: '4px 6px' }}>
                <Plus size={11} />
              </button>
            </div>
          </div>

          {/* Style toggles */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 11, color: '#94a3b8', width: 70 }}>Style</span>
            <div style={{ display: 'flex', gap: 4 }}>
              <button onClick={() => { const v = fontWeight === 'bold' ? '' : 'bold'; setFontWeight(v); saveStyleOverride({ fontWeight: v }); }} style={btnStyle(fontWeight === 'bold')}><Bold size={12} /></button>
              <button onClick={() => { const v = fontStyle === 'italic' ? '' : 'italic'; setFontStyle(v); saveStyleOverride({ fontStyle: v }); }} style={btnStyle(fontStyle === 'italic')}><Italic size={12} /></button>
              <button onClick={() => { const v = textDecoration === 'underline' ? '' : 'underline'; setTextDecoration(v); saveStyleOverride({ textDecoration: v }); }} style={btnStyle(textDecoration === 'underline')}><Underline size={12} /></button>
            </div>
          </div>

          {/* Align */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 11, color: '#94a3b8', width: 70 }}>Align</span>
            <div style={{ display: 'flex', gap: 4 }}>
              {(['left', 'center', 'right'] as const).map(align => (
                <button key={align} onClick={() => { setTextAlign(align); saveStyleOverride({ textAlign: align }); }} style={btnStyle(textAlign === align)}>
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
              <select value={fontFamily} onChange={e => { setFontFamily(e.target.value); saveStyleOverride({ fontFamily: e.target.value }); }}
                style={{ width: '100%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 6, color: '#e2e8f0', fontSize: 12, padding: '5px 24px 5px 8px', outline: 'none', appearance: 'none', cursor: 'pointer' }}>
                <option value="" style={{ background: '#1e1b4b' }}>Default</option>
                {FONT_FAMILIES.map(f => <option key={f} value={f} style={{ background: '#1e1b4b' }}>{f}</option>)}
              </select>
              <ChevronDown size={12} style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
            </div>
          </div>

          {/* Color */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 11, color: '#94a3b8', width: 70, paddingTop: 4 }}>Color</span>
            <div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 6 }}>
                {COLOR_SWATCHES.map(c => (
                  <button key={c} onClick={() => { setColor(c); saveStyleOverride({ color: c }); }} title={c}
                    style={{ width: 20, height: 20, borderRadius: 4, background: c, border: color === c ? '2px solid #6366f1' : '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', padding: 0, boxSizing: 'border-box' }} />
                ))}
                <label title="Custom color" style={{ width: 20, height: 20, borderRadius: 4, border: '1px dashed rgba(255,255,255,0.3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#94a3b8', position: 'relative', overflow: 'hidden' }}>
                  +
                  <input type="color" value={color || '#1f2937'} onChange={e => { setColor(e.target.value); saveStyleOverride({ color: e.target.value }); }}
                    style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }} />
                </label>
              </div>
              {color && <div style={{ fontSize: 10, color: '#94a3b8' }}>{color}</div>}
            </div>
          </div>

          {/* Reset */}
          <button onClick={resetStyle} style={{ width: '100%', padding: '7px', borderRadius: 7, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)', color: '#94a3b8', fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
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
                style={{ padding: '4px 10px', borderRadius: 999, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600, background: selectedTags.includes(tag) ? 'rgba(99,102,241,0.6)' : 'rgba(255,255,255,0.1)', color: selectedTags.includes(tag) ? '#fff' : '#cbd5e1', transition: 'background 0.15s' }}>
                {tag.replace(/_/g, ' ')}
              </button>
            ))}
          </div>

          {/* Custom instruction */}
          <input
            type="text"
            value={aiInstruction}
            onChange={e => setAiInstruction(e.target.value)}
            placeholder="Custom instruction (optional)..."
            onKeyDown={e => { if (e.key === 'Enter') runAI(); }}
            style={{ width: '100%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, color: '#f1f5f9', fontSize: 12, padding: '7px 10px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: 8 }}
          />

          {/* Generate button */}
          <button onClick={runAI} disabled={aiLoading}
            style={{ width: '100%', padding: '8px', borderRadius: 8, border: 'none', cursor: aiLoading ? 'not-allowed' : 'pointer', fontSize: 12, fontWeight: 700, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, opacity: aiLoading ? 0.7 : 1, marginBottom: aiSuggestion ? 10 : 0 }}>
            {aiLoading ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Wand2 size={13} />}
            {aiLoading ? 'Generating...' : 'Generate with AI'}
          </button>

          {/* AI suggestion preview */}
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

// ─── InlineEditor (main component) ───────────────────────────────────────────

export function InlineEditor({ data, updateNested, children, containerRef, zoom }: InlineEditorProps) {
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null);
  const [containerRect, setContainerRect] = useState<DOMRect | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Update container rect on resize
  useEffect(() => {
    const updateRect = () => {
      if (containerRef.current) {
        setContainerRect(containerRef.current.getBoundingClientRect());
      }
    };
    updateRect();
    const ro = new ResizeObserver(updateRect);
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener('resize', updateRect);
    return () => { ro.disconnect(); window.removeEventListener('resize', updateRect); };
  }, [containerRef]);

  // Find the nearest editable ancestor
  const findEditableElement = useCallback((target: HTMLElement): HTMLElement | null => {
    let el: HTMLElement | null = target;
    let depth = 0;
    while (el && depth < 8) {
      // Prefer elements with explicit data-edit-path
      if (el.dataset.editPath) return el;
      // Skip drag handles and UI chrome
      if (el.dataset.dragHandle || el.classList.contains('section-header-container')) return null;
      el = el.parentElement;
      depth++;
    }
    // Second pass: look for editable tags
    el = target;
    depth = 0;
    while (el && depth < 8) {
      if (EDITABLE_TAGS.has(el.tagName) && el.textContent?.trim()) {
        // Skip elements that are just wrappers with many children
        const directTextLength = Array.from(el.childNodes)
          .filter(n => n.nodeType === Node.TEXT_NODE)
          .reduce((acc, n) => acc + (n.textContent?.length || 0), 0);
        if (directTextLength > 0 || el.tagName.match(/^H[1-6]$/)) return el;
      }
      el = el.parentElement;
      depth++;
    }
    return null;
  }, []);

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // Don't intercept clicks on the panel itself
    if ((e.target as HTMLElement).closest('[data-inline-panel]')) return;

    const clickedEl = e.target as HTMLElement;

    // Don't intercept drag handles or section controls
    if (clickedEl.closest('[data-drag-handle]') || clickedEl.closest('.group\\/section > button')) return;

    // Walk up from clicked element to find data-edit-path
    let el: HTMLElement | null = clickedEl;
    let editableEl: HTMLElement | null = null;
    let depth = 0;

    while (el && depth < 12) {
      // Found explicit edit path — use it
      if (el.dataset.editPath && el.dataset.editPath.trim()) {
        editableEl = el;
        break;
      }
      // Skip UI chrome
      if (el.dataset.dragHandle) break;
      if (el.id === 'resume-preview') break;
      el = el.parentElement;
      depth++;
    }

    // If no data-edit-path found, try to find any text element with content
    if (!editableEl) {
      el = clickedEl;
      depth = 0;
      while (el && depth < 8) {
        if (EDITABLE_TAGS.has(el.tagName) && el.textContent?.trim()) {
          const directText = Array.from(el.childNodes)
            .filter(n => n.nodeType === Node.TEXT_NODE)
            .reduce((acc, n) => acc + (n.textContent?.length || 0), 0);
          if (directText > 0 || el.tagName.match(/^H[1-6]$/)) {
            editableEl = el;
            break;
          }
        }
        if (el.id === 'resume-preview') break;
        el = el.parentElement;
        depth++;
      }
    }

    if (!editableEl) {
      setEditTarget(null);
      return;
    }

    const path = editableEl.dataset.editPath || '';
    const isRichtext = editableEl.dataset.editType === 'richtext';
    const rawValue = editableEl.dataset.editValue || editableEl.textContent || '';
    const value = isRichtext ? htmlToPlainText(rawValue) : rawValue;

    if (!value.trim() && !path) {
      setEditTarget(null);
      return;
    }

    const label = editableEl.dataset.editLabel || getFieldLabel(path, editableEl.tagName);
    const fieldType = detectFieldType(path, label, editableEl.tagName, value);
    const rect = editableEl.getBoundingClientRect();

    e.preventDefault();
    e.stopPropagation();

    setEditTarget({
      path,
      value,
      rect,
      fieldType,
      label: label.toUpperCase(),
      element: editableEl,
    });
  }, [findEditableElement]);

  // Close panel when clicking outside
  useEffect(() => {
    if (!editTarget) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-inline-panel]')) return;
      setEditTarget(null);
    };
    // Use capture to catch clicks before they bubble
    document.addEventListener('mousedown', handler, true);
    return () => document.removeEventListener('mousedown', handler, true);
  }, [editTarget]);

  return (
    <div
      ref={wrapperRef}
      style={{ position: 'relative', width: '100%', height: '100%', overflow: 'auto' }}
      onClick={handleClick}
    >
      {children}

      {editTarget && containerRect && (
        <div data-inline-panel="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 9998 }}>
          <div style={{ pointerEvents: 'auto' }}>
            <FloatingPanel
              target={editTarget}
              data={data}
              updateNested={updateNested}
              onClose={() => setEditTarget(null)}
              containerRect={containerRect}
              zoom={zoom}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default InlineEditor;
