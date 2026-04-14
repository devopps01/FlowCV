'use client';

/**
 * InlineEditor â€” Click any text element in the resume to edit it.
 *
 * Shows a floating PANEL (not an overlay on the element) so it never
 * overlaps resume content. The panel appears below/beside the clicked element.
 *
 * Input types:
 * - date fields â†’ month picker (input type="month")
 * - description/summary â†’ auto-resize textarea
 * - everything else â†’ text input
 *
 * Also includes style quick-actions: font size, bold, color.
 */

import React, {
  useState, useRef, useEffect, useCallback, useLayoutEffect,
} from 'react';
import {
  Bold, Italic, Underline, Check, X, Wand2, Loader2,
  RefreshCw, Type, Palette, AlignLeft, AlignCenter, AlignRight,
  ChevronDown,
} from 'lucide-react';
import { ResumeData } from './types';

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface EditTarget {
  path: string;
  value: string;
  rect: DOMRect;
  fieldType: 'text' | 'date' | 'textarea' | 'email' | 'tel' | 'url';
  label: string;
  element?: HTMLElement;
}

interface InlineEditorProps {
  data: ResumeData;
  updateNested: (path: string, value: any) => void;
  children: React.ReactNode;
  containerRef: React.RefObject<HTMLDivElement>;
  zoom: number;
}

// â”€â”€â”€ Detect field type from path/label â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function detectFieldType(path: string, label: string, tagName: string, value: string): EditTarget['fieldType'] {
  const p = path.toLowerCase();
  const l = label.toLowerCase();

  if (p.includes('date') || p.includes('startdate') || p.includes('enddate') ||
      p.includes('graduationyear') || l.includes('date') || l.includes('year')) {
    return 'date';
  }
  if (p.includes('description') || p.includes('summary') || p.includes('content') ||
      p.includes('text') || l.includes('description') || l.includes('summary') ||
      tagName === 'P' || tagName === 'LI') {
    return 'textarea';
  }
  // Auto-detect: if text is long (>60 chars) or has multiple words suggesting a sentence, use textarea
  if (value && (value.length > 60 || value.includes('. ') || value.split(' ').length > 8)) {
    return 'textarea';
  }
  if (p.includes('email') || l.includes('email')) return 'email';
  if (p.includes('phone') || l.includes('phone')) return 'tel';
  if (p.includes('url') || p.includes('website') || p.includes('linkedin') || l.includes('url')) return 'url';
  return 'text';
}

// â”€â”€â”€ Editable tags â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const EDITABLE_TAGS = new Set([
  'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
  'P', 'A', 'SPAN', 'LI', 'TD', 'TH',
  'STRONG', 'EM', 'B', 'I', 'LABEL', 'DIV',
]);

const TAG_LABELS: Record<string, string> = {
  H1: 'Heading 1', H2: 'Heading 2', H3: 'Heading 3',
  H4: 'Heading 4', H5: 'Heading 5', H6: 'Heading 6',
  P: 'Paragraph', A: 'Link', SPAN: 'Text', LI: 'List item',
  TD: 'Cell', TH: 'Header', STRONG: 'Bold', EM: 'Italic',
  B: 'Bold', I: 'Italic', LABEL: 'Label', DIV: 'Text',
};

// â”€â”€â”€ Auto-resize textarea â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function AutoTextarea({
  value, onChange, onKeyDown, style, ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const ref = useRef<HTMLTextAreaElement>(null);

  // Resize on every value change
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Reset to auto first so shrinking works
    el.style.height = 'auto';
    el.style.height = `${Math.max(el.scrollHeight, 72)}px`;
  }, [value]);

  // Also resize on mount
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.max(el.scrollHeight, 72)}px`;
    el.focus();
    // Move cursor to end
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
        // Ensure text wraps properly
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        overflowWrap: 'break-word',
      }}
      rows={3}
      {...props}
    />
  );
}

// â”€â”€â”€ Floating Edit Panel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface PanelProps {
  target: EditTarget;
  value: string;
  onChange: (v: string) => void;
  onCommit: () => void;
  onCancel: () => void;
  panelPos: { top: number; left: number };
  data: ResumeData;
  updateNested: (path: string, value: any) => void;
  styleOverrides: Record<string, React.CSSProperties>;
  onStyleChange: (path: string, styles: React.CSSProperties) => void;
}

function FloatingPanel({
  target, value, onChange, onCommit, onCancel, panelPos, data, updateNested,
  styleOverrides, onStyleChange,
}: PanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPreview, setAiPreview] = useState('');
  const [aiError, setAiError] = useState('');
  const [showStylePanel, setShowStylePanel] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customInstruction, setCustomInstruction] = useState('');

  // Current overrides for this element
  const currentOverride = (target.path ? styleOverrides[target.path] : null) || {};
  const el = target.element;

  // Read initial values from override or computed style
  const [elFontSize, setElFontSize] = useState<number>(() => {
    if (currentOverride.fontSize) return parseInt(String(currentOverride.fontSize));
    if (!el) return 12;
    return Math.round(parseFloat(window.getComputedStyle(el).fontSize) || 12);
  });
  const [elColor, setElColor] = useState<string>(() => String(currentOverride.color || ''));
  const [elAlign, setElAlign] = useState<string>(() =>
    String(currentOverride.textAlign || (el ? window.getComputedStyle(el).textAlign : 'left') || 'left')
  );
  const [elBold, setElBold] = useState<boolean>(() => {
    if (currentOverride.fontWeight) return currentOverride.fontWeight === 'bold' || currentOverride.fontWeight === '700';
    if (!el) return false;
    const fw = window.getComputedStyle(el).fontWeight;
    return fw === 'bold' || parseInt(fw) >= 700;
  });
  const [elItalic, setElItalic] = useState<boolean>(() => {
    if (currentOverride.fontStyle) return currentOverride.fontStyle === 'italic';
    if (!el) return false;
    return window.getComputedStyle(el).fontStyle === 'italic';
  });

  // Apply style: live DOM + persisted data
  const applyStyle = useCallback((newStyles: Partial<React.CSSProperties>) => {
    if (el) Object.entries(newStyles).forEach(([k, v]) => { (el.style as any)[k] = v; });
    if (target.path) onStyleChange(target.path, { ...currentOverride, ...newStyles });
  }, [el, target.path, currentOverride, onStyleChange]);

  useLayoutEffect(() => {
    if (target.fieldType !== 'textarea') {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [target.fieldType]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { e.preventDefault(); onCancel(); return; }
    if (e.key === 'Enter' && target.fieldType !== 'textarea') { e.preventDefault(); onCommit(); return; }
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); onCommit(); return; }
  };

  // AI suggestion tags — context-aware based on field type
  const AI_TAGS = target.fieldType === 'textarea' ? [
    { id: 'impactful', label: 'More impactful', icon: '⚡' },
    { id: 'metrics', label: 'Add metrics', icon: '📊' },
    { id: 'shorter', label: 'Make shorter', icon: '✂️' },
    { id: 'professional', label: 'Professional tone', icon: '💼' },
    { id: 'action_verbs', label: 'Strong verbs', icon: '🎯' },
    { id: 'ats', label: 'ATS optimized', icon: '🤖' },
  ] : [
    { id: 'professional', label: 'Professional', icon: '💼' },
    { id: 'concise', label: 'Concise', icon: '✂️' },
    { id: 'creative', label: 'Creative', icon: '✨' },
    { id: 'formal', label: 'Formal', icon: '📋' },
  ];

  // Context tags from resume data
  const contextTags: string[] = [];
  const pi = data.content?.personalInfo;
  if (pi?.professionalTitle) contextTags.push(pi.professionalTitle);
  if (pi?.fullName) contextTags.push(pi.fullName);
  const skills = data.content?.skills?.slice(0, 4).map((s: any) => s.name || s).filter(Boolean) || [];
  contextTags.push(...skills);

  const buildInstruction = () => {
    const tagInstructions: Record<string, string> = {
      impactful: 'Make it more impactful and compelling',
      metrics: 'Add specific metrics and quantifiable achievements',
      shorter: 'Make it more concise and shorter',
      professional: 'Use a professional, formal tone',
      action_verbs: 'Start with strong action verbs',
      ats: 'Optimize for ATS systems with relevant keywords',
      concise: 'Make it concise',
      creative: 'Make it creative and engaging',
      formal: 'Use formal language',
    };
    const parts = selectedTags.map(t => tagInstructions[t]).filter(Boolean);
    if (customInstruction.trim()) parts.push(customInstruction.trim());
    return parts.join('. ') || 'Improve this text';
  };

  const enhanceWithAI = async () => {
    if (!value.trim()) return;
    setAiLoading(true);
    setAiPreview('');
    setAiError('');
    try {
      const instruction = buildInstruction();
      const context = contextTags.slice(0, 3).join(', ');
      const res = await fetch('/api/ai/enhance-field', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: value,
          fieldType: target.fieldType === 'textarea' ? 'description' : 'default',
          context: `${target.label}${context ? ` | Resume context: ${context}` : ''}`,
          instruction,
        }),
      });
      const json = await res.json();
      if (json.enhanced && !json.error) {
        setAiPreview(json.enhanced);
      } else {
        setAiError(json.error || 'AI unavailable');
      }
    } catch {
      setAiError('Network error. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  const d = data.design;

  const inputCls = 'w-full px-3 py-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500';
  const inputStyle: React.CSSProperties = {
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    color: '#1f2937',
    boxSizing: 'border-box',
  };

  return (
    <div
      data-inline-toolbar="true"
      className="absolute z-[300] rounded-2xl shadow-2xl overflow-hidden"
      style={{
        top: panelPos.top,
        left: panelPos.left,
        width: target.fieldType === 'textarea' || target.fieldType === 'date' ? 380 : 300,
        background: 'linear-gradient(135deg, #1e1b4b, #2d2a6e)',
        border: '1px solid rgba(255,255,255,0.12)',
        backdropFilter: 'blur(20px)',
      }}
      onMouseDown={e => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-black text-white/50 uppercase tracking-widest">
            {target.label}
          </span>
          {target.fieldType === 'date' && (
            <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold">DATE</span>
          )}
          {target.fieldType === 'textarea' && (
            <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold">TEXT</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onMouseDown={e => { e.preventDefault(); setShowStylePanel(s => !s); }}
            title="Style options"
            className="p-1 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/10 transition-all"
          >
            <Palette className="w-3.5 h-3.5" />
          </button>
          <button onMouseDown={e => { e.preventDefault(); onCancel(); }} className="p-1 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/10 transition-all">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Input area */}
      <div className="px-3 py-2.5">
        {target.fieldType === 'date' ? (
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-[9px] text-white/40 font-bold uppercase tracking-widest block mb-1">Start</label>
              <input
                type="month"
                value={value.split('â€”')[0]?.trim() || value.split('â€“')[0]?.trim() || value}
                onChange={e => {
                  const end = value.includes('â€”') ? value.split('â€”')[1]?.trim() : value.includes('â€“') ? value.split('â€“')[1]?.trim() : '';
                  onChange(end ? `${e.target.value} â€” ${end}` : e.target.value);
                }}
                className={inputCls}
                style={inputStyle}
                onKeyDown={handleKey}
              />
            </div>
            <div className="flex-1">
              <label className="text-[9px] text-white/40 font-bold uppercase tracking-widest block mb-1">End</label>
              <input
                type="text"
                placeholder="Present or YYYY-MM"
                value={value.includes('â€”') ? value.split('â€”')[1]?.trim() : value.includes('â€“') ? value.split('â€“')[1]?.trim() : ''}
                onChange={e => {
                  const start = value.includes('â€”') ? value.split('â€”')[0]?.trim() : value.includes('â€“') ? value.split('â€“')[0]?.trim() : value;
                  onChange(e.target.value ? `${start} â€” ${e.target.value}` : start);
                }}
                className={inputCls}
                style={inputStyle}
                onKeyDown={handleKey}
              />
            </div>
          </div>
        ) : target.fieldType === 'textarea' ? (
          <AutoTextarea
            value={value}
            onChange={e => onChange(e.target.value)}
            onKeyDown={handleKey}
            className={inputCls}
            style={{
              ...inputStyle,
              minHeight: 72,
              lineHeight: '1.6',
              width: '100%',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
            }}
            placeholder="Enter text..."
          />
        ) : (
          <input
            ref={inputRef}
            type={target.fieldType}
            value={value}
            onChange={e => onChange(e.target.value)}
            onKeyDown={handleKey}
            className={inputCls}
            style={{ ...inputStyle, width: '100%' }}
            placeholder={`Enter ${target.label.toLowerCase()}...`}
          />
        )}
      </div>

      {/* Formatting toolbar */}
      <div className="flex items-center gap-0.5 px-3 pb-2.5">
        {/* Text formatting */}
        <button onMouseDown={e => { e.preventDefault(); document.execCommand('bold'); }} title="Bold" className="p-1.5 rounded text-white/50 hover:bg-white/10 hover:text-white transition-all">
          <Bold className="w-3.5 h-3.5" />
        </button>
        <button onMouseDown={e => { e.preventDefault(); document.execCommand('italic'); }} title="Italic" className="p-1.5 rounded text-white/50 hover:bg-white/10 hover:text-white transition-all">
          <Italic className="w-3.5 h-3.5" />
        </button>
        <button onMouseDown={e => { e.preventDefault(); document.execCommand('underline'); }} title="Underline" className="p-1.5 rounded text-white/50 hover:bg-white/10 hover:text-white transition-all">
          <Underline className="w-3.5 h-3.5" />
        </button>

        <div className="w-px h-4 bg-white/15 mx-1" />

        {/* AI toggle */}
        <button
          onMouseDown={e => { e.preventDefault(); setShowAiPanel(s => !s); setShowStylePanel(false); }}
          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${showAiPanel ? 'bg-purple-500/30 text-purple-200' : 'text-purple-300 hover:bg-white/10'}`}
        >
          <Wand2 className="w-3 h-3" />
          AI
        </button>

        <div className="flex-1" />

        <button
          onMouseDown={e => { e.preventDefault(); onCommit(); }}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-black text-white transition-all"
          style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
        >
          <Check className="w-3.5 h-3.5" /> Save
        </button>
      </div>

      {/* AI Panel */}
      {showAiPanel && (
        <div className="px-3 pb-3 space-y-2.5" style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "10px" }}>
          <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-2">AI Enhance</p>
          <div className="flex flex-wrap gap-1.5">
            {AI_TAGS.map(tag => (
              <button
                key={tag.id}
                onMouseDown={e => {
                  e.preventDefault();
                  setSelectedTags(prev => prev.includes(tag.id) ? prev.filter(t => t !== tag.id) : [...prev, tag.id]);
                }}
                className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold transition-all"
                style={{
                  background: selectedTags.includes(tag.id) ? 'rgba(139,92,246,0.4)' : 'rgba(255,255,255,0.08)',
                  border: selectedTags.includes(tag.id) ? '1px solid rgba(139,92,246,0.6)' : '1px solid rgba(255,255,255,0.1)',
                  color: selectedTags.includes(tag.id) ? '#c4b5fd' : 'rgba(255,255,255,0.6)',
                }}
              >
                <span>{tag.icon}</span> {tag.label}
              </button>
            ))}
          </div>
          {contextTags.length > 0 && (
            <div>
              <p className="text-[8px] text-white/30 uppercase tracking-widest mb-1">Resume context</p>
              <div className="flex flex-wrap gap-1">
                {contextTags.slice(0, 5).map((tag, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-full text-[9px] font-medium" style={{ background: "rgba(99,102,241,0.15)", color: "rgba(165,180,252,0.8)", border: "1px solid rgba(99,102,241,0.2)" }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
          <input
            type="text"
            placeholder="Custom instruction..."
            value={customInstruction}
            onChange={e => setCustomInstruction(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); enhanceWithAI(); } }}
            className="w-full px-2.5 py-1.5 rounded-lg text-[11px] focus:outline-none focus:ring-1 focus:ring-purple-500"
            style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.8)" }}
          />
          <button
            onMouseDown={e => { e.preventDefault(); enhanceWithAI(); }}
            disabled={aiLoading}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-[11px] font-black text-white transition-all disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}
          >
            {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
            {aiLoading ? 'Generating...' : 'Generate with AI'}
          </button>
          {aiError && (
            <div className="flex items-start gap-2 px-2 py-1.5 rounded-lg" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <span className="text-[10px] text-red-400 flex-1">{aiError}</span>
              <button onMouseDown={e => { e.preventDefault(); setAiError(""); }} className="text-red-400/60 hover:text-red-400 shrink-0"><X className="w-3 h-3" /></button>
            </div>
          )}
          {aiPreview && (
            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(139,92,246,0.3)", background: "rgba(139,92,246,0.08)" }}>
              <div className="px-3 py-2">
                <p className="text-[9px] font-black text-purple-400 uppercase tracking-widest mb-1.5">Suggestion</p>
                <p className="text-[11px] leading-relaxed text-white/80">{aiPreview}</p>
              </div>
              <div className="flex gap-1.5 px-3 pb-2.5">
                <button onMouseDown={e => { e.preventDefault(); if (aiPreview && !aiPreview.startsWith('Error:')) { onChange(aiPreview); setAiPreview(''); setShowAiPanel(false); } }} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-black text-white" style={{ background: '#10b981' }}><Check className="w-3 h-3" /> Apply</button>
                <button onMouseDown={e => { e.preventDefault(); enhanceWithAI(); }} className="p-1.5 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/10"><RefreshCw className="w-3 h-3" /></button>
                <button onMouseDown={e => { e.preventDefault(); setAiPreview(""); }} className="p-1.5 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/10"><X className="w-3 h-3" /></button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Style panel â€” applies to THIS element only */}
      {showStylePanel && (
        <div className="px-3 pb-3 space-y-2.5" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '10px' }}>
          <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">
            Element Style <span className="text-purple-400/60 normal-case font-medium">â€” applies to this text only</span>
          </p>

          {/* Font size */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-white/50 w-16 shrink-0">Font size</span>
            <div className="flex items-center gap-1 flex-1">
              <button
                onMouseDown={e => {
                  e.preventDefault();
                  const next = Math.max(8, elFontSize - 1);
                  setElFontSize(next);
                  applyStyle({ fontSize: `${next}px` });
                }}
                className="w-6 h-6 rounded bg-white/10 text-white/70 hover:bg-white/20 text-xs flex items-center justify-center"
              >âˆ’</button>
              <span className="text-[11px] font-bold text-white/80 w-8 text-center">{elFontSize}</span>
              <button
                onMouseDown={e => {
                  e.preventDefault();
                  const next = Math.min(32, elFontSize + 1);
                  setElFontSize(next);
                  applyStyle({ fontSize: `${next}px` });
                }}
                className="w-6 h-6 rounded bg-white/10 text-white/70 hover:bg-white/20 text-xs flex items-center justify-center"
              >+</button>
            </div>
          </div>

          {/* Text style */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-white/50 w-16 shrink-0">Style</span>
            <div className="flex gap-1">
              <button
                onMouseDown={e => {
                  e.preventDefault();
                  const next = !elBold;
                  setElBold(next);
                  applyStyle({ fontWeight: next ? 'bold' : 'normal' });
                }}
                className="px-2.5 py-1 rounded text-[11px] font-black transition-all"
                style={{ background: elBold ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.08)', color: elBold ? '#a5b4fc' : 'rgba(255,255,255,0.5)' }}
              >B</button>
              <button
                onMouseDown={e => {
                  e.preventDefault();
                  const next = !elItalic;
                  setElItalic(next);
                  applyStyle({ fontStyle: next ? 'italic' : 'normal' });
                }}
                className="px-2.5 py-1 rounded text-[11px] italic transition-all"
                style={{ background: elItalic ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.08)', color: elItalic ? '#a5b4fc' : 'rgba(255,255,255,0.5)' }}
              >I</button>
            </div>
          </div>

          {/* Alignment */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-white/50 w-16 shrink-0">Align</span>
            <div className="flex gap-1">
              {(['left', 'center', 'right'] as const).map(a => (
                <button
                  key={a}
                  onMouseDown={e => {
                    e.preventDefault();
                    setElAlign(a);
                    applyStyle({ textAlign: a });
                  }}
                  className="p-1.5 rounded transition-all"
                  style={{ background: elAlign === a ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.08)', color: elAlign === a ? '#a5b4fc' : 'rgba(255,255,255,0.5)' }}
                >
                  {a === 'left' ? <AlignLeft className="w-3.5 h-3.5" /> : a === 'center' ? <AlignCenter className="w-3.5 h-3.5" /> : <AlignRight className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>

          {/* Text color */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-white/50 w-16 shrink-0">Color</span>
            <div className="flex gap-1.5 flex-wrap items-center">
              {['#1f2937', '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#ffffff'].map(c => (
                <button
                  key={c}
                  onMouseDown={e => {
                    e.preventDefault();
                    setElColor(c);
                    applyStyle({ color: c });
                  }}
                  className="w-5 h-5 rounded-full transition-all hover:scale-110"
                  style={{
                    background: c,
                    border: elColor === c ? '2px solid white' : c === '#ffffff' ? '1px solid rgba(255,255,255,0.3)' : '2px solid transparent',
                  }}
                />
              ))}
              {/* Custom color picker */}
              <label className="w-5 h-5 rounded-full cursor-pointer overflow-hidden relative" title="Custom color">
                <div className="w-full h-full rounded-full" style={{ background: 'conic-gradient(red, yellow, lime, cyan, blue, magenta, red)' }} />
                <input
                  type="color"
                  value={elColor || '#1f2937'}
                  onChange={e => {
                    setElColor(e.target.value);
                    applyStyle({ color: e.target.value });
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
              </label>
            </div>
          </div>

          {/* Reset */}
          <button
            onMouseDown={e => {
              e.preventDefault();
              if (!el) return;
              el.style.fontSize = '';
              el.style.color = '';
              el.style.textAlign = '';
              el.style.fontWeight = '';
              el.style.fontStyle = '';
              const cs = window.getComputedStyle(el);
              setElFontSize(Math.round(parseFloat(cs.fontSize) || 12));
              setElColor('');
              setElAlign('left');
              setElBold(false);
              setElItalic(false);
            }}
            className="text-[10px] text-white/30 hover:text-white/60 transition-all underline"
          >
            Reset element styles
          </button>
        </div>
      )}

      {/* AI preview */}
      {(aiPreview || aiError) && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          {aiError ? (
            <div className="px-3 py-2 flex items-start gap-2">
              <span className="text-[10px] text-red-400 leading-relaxed flex-1">{aiError}</span>
              <button onMouseDown={e => { e.preventDefault(); setAiError(''); }} className="text-red-400/60 hover:text-red-400 mt-0.5 shrink-0">
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className="px-3 py-2.5">
              <p className="text-[9px] font-black text-purple-400 uppercase tracking-widest mb-1.5">âœ¨ AI suggestion</p>
              <p className="text-[11px] leading-relaxed text-white/80 mb-2">{aiPreview}</p>
              <div className="flex gap-1.5">
                <button
                  onMouseDown={e => {
                    e.preventDefault();
                    if (aiPreview && !aiPreview.startsWith('âš ï¸') && !aiPreview.startsWith('Error:')) {
                      onChange(aiPreview);
                    }
                    setAiPreview('');
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black text-white"
                  style={{ background: '#10b981' }}
                >
                  <Check className="w-3 h-3" /> Apply
                </button>
                <button
                  onMouseDown={e => { e.preventDefault(); enhanceWithAI(); }}
                  className="p-1.5 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/10"
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
                <button
                  onMouseDown={e => { e.preventDefault(); setAiPreview(''); }}
                  className="p-1.5 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/10"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// â”€â”€â”€ Main InlineEditor â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function InlineEditor({
  data, updateNested, children, containerRef, zoom,
}: InlineEditorProps) {
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null);
  const [editValue, setEditValue] = useState('');
  const [panelPos, setPanelPos] = useState({ top: 0, left: 0 });
  const overlayRef = useRef<HTMLDivElement>(null);

  const getContainerRect = useCallback((): DOMRect | null => {
    return containerRef.current?.getBoundingClientRect() ?? null;
  }, [containerRef]);

  // â”€â”€ Find editable element â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const findEditTarget = useCallback((clicked: HTMLElement): EditTarget | null => {
    let el: HTMLElement | null = clicked;

    while (el && el !== containerRef.current) {
      // 1. Explicit data-edit-path
      const path = el.getAttribute('data-edit-path');
      if (path && path.trim()) {
        const label = el.getAttribute('data-edit-label') || TAG_LABELS[el.tagName] || 'Text';
        const rawValue = el.getAttribute('data-edit-value') || el.textContent?.trim() || '';
        const fieldType = detectFieldType(path, label, el.tagName, rawValue);
        return { path, value: rawValue, rect: el.getBoundingClientRect(), fieldType, label, element: el };
      }

      // 2. Any text-bearing tag
      if (EDITABLE_TAGS.has(el.tagName)) {
        const text = el.textContent?.trim() || '';
        if (el.tagName === 'DIV') {
          const hasDirectText = Array.from(el.childNodes).some(
            n => n.nodeType === Node.TEXT_NODE && n.textContent?.trim()
          );
          if (!hasDirectText || text.length > 300) { el = el.parentElement; continue; }
        }
        if (text.length > 0 && text.length < 500) {
          const label = TAG_LABELS[el.tagName] || 'Text';
          const fieldType = detectFieldType('', label, el.tagName, text);
          return { path: '', value: text, rect: el.getBoundingClientRect(), fieldType, label, element: el };
        }
      }

      el = el.parentElement;
    }
    return null;
  }, [containerRef]);

  // â”€â”€ Calculate panel position â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const calcPanelPos = useCallback((rect: DOMRect, fieldType?: EditTarget['fieldType']): { top: number; left: number } => {
    const containerRect = containerRef.current?.getBoundingClientRect();
    const scrollTop = overlayRef.current?.scrollTop ?? 0;
    if (!containerRect) return { top: 0, left: 0 };

    const elBottom = (rect.bottom - containerRect.top + scrollTop) / zoom;
    const elLeft   = (rect.left   - containerRect.left) / zoom;
    const containerW = containerRect.width / zoom;
    const panelW = fieldType === 'textarea' || fieldType === 'date' ? 380 : 300;

    // Position below the element, clamped to container
    const top  = elBottom + 8;
    const left = Math.min(Math.max(4, elLeft), containerW - panelW - 4);

    return { top, left };
  }, [containerRef, zoom]);

  // â”€â”€ Click handler â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleClick = useCallback((e: React.MouseEvent) => {
    const clicked = e.target as HTMLElement;

    if (
      clicked.closest('[data-inline-toolbar]') ||
      ['INPUT', 'TEXTAREA', 'BUTTON', 'SELECT'].includes(clicked.tagName) ||
      clicked.closest('button') || clicked.closest('input') || clicked.closest('textarea')
    ) return;

    const target = findEditTarget(clicked);
    if (target) {
      e.stopPropagation();
      const pos = calcPanelPos(target.rect, target.fieldType);
      setPanelPos(pos);
      setEditTarget(target);
      setEditValue(target.value);
    } else {
      if (editTarget) commitEdit();
      else setEditTarget(null);
    }
  }, [findEditTarget, calcPanelPos, editTarget]);

  // â”€â”€ Commit â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const commitEdit = useCallback(() => {
    if (!editTarget) return;

    const newValue = editValue.trim();
    if (!newValue || newValue.startsWith('âš ï¸') || newValue.startsWith('Error:')) {
      setEditTarget(null);
      return;
    }

    if (newValue !== editTarget.value) {
      if (editTarget.path) {
        updateNested(editTarget.path, newValue);
      } else if (editTarget.element) {
        editTarget.element.textContent = newValue;
        let parent = editTarget.element.parentElement;
        while (parent && parent !== containerRef.current) {
          const path = parent.getAttribute('data-edit-path');
          if (path) { updateNested(path, newValue); break; }
          parent = parent.parentElement;
        }
      }
    }
    setEditTarget(null);
  }, [editTarget, editValue, updateNested, containerRef]);

  const cancelEdit = useCallback(() => setEditTarget(null), []);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape' && editTarget) cancelEdit(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [editTarget, cancelEdit]);

  return (
    <div
      ref={overlayRef}
      className="relative flex-1 min-h-0 w-full overflow-y-auto overflow-x-hidden custom-scrollbar"
      onClick={handleClick}
      style={{ cursor: 'default' }}
    >
      {children}

      {editTarget && (
        <FloatingPanel
          target={editTarget}
          value={editValue}
          onChange={setEditValue}
          onCommit={commitEdit}
          onCancel={cancelEdit}
          panelPos={panelPos}
          data={data}
          updateNested={updateNested}
          styleOverrides={data.styleOverrides || {}}
          onStyleChange={(path, styles) => {
            const current = data.styleOverrides || {};
            updateNested('styleOverrides', { ...current, [path]: styles });
          }}
        />
      )}
    </div>
  );
}
