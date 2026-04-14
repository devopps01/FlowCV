'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Wand2, Loader2, Check, X } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  fieldType?: string;
  context?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder, fieldType = 'description', context }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState('');
  const [aiInstruction, setAiInstruction] = useState('');
  const [showAiInput, setShowAiInput] = useState(false);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const execCommand = (command: string, val = '') => {
    document.execCommand(command, false, val);
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const enhanceWithAI = async (instruction?: string) => {
    const text = editorRef.current?.innerText || value || '';
    if (!text.trim()) return;
    setAiLoading(true);
    setAiResult('');
    try {
      const res = await fetch('/api/ai/enhance-field', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, fieldType, context, instruction }),
      });
      const data = await res.json();
      if (data.enhanced && !data.error) {
        setAiResult(data.enhanced);
      } else {
        const msg = data.error || '';
        setAiResult(`⚠️ ${msg.includes('unavailable') || msg.includes('rate') || msg.includes('quota') ? 'AI is busy, please try again.' : 'AI enhancement failed. Please try again.'}`);
      }
    } catch {
      setAiResult('⚠️ Network error. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  const applyAiResult = () => {
    // Never apply error messages to the resume content
    if (aiResult && !aiResult.startsWith('⚠️')) {
      onChange(aiResult);
    }
    setAiResult('');
    setShowAiInput(false);
    setAiInstruction('');
  };

  const btnCls = 'p-1.5 rounded-md transition-all text-[11px] font-bold hover:opacity-80';

  return (
    <div
      className="rounded-xl overflow-hidden transition-all focus-within:ring-2"
      style={{
        border: '1px solid var(--app-border)',
        background: 'var(--app-bg-card)',
        '--tw-ring-color': '#41017d',
      } as React.CSSProperties}
    >
      {/* Toolbar */}
      <div
        className="flex items-center gap-0.5 px-2 py-1.5 overflow-x-auto"
        style={{ borderBottom: '1px solid var(--app-border)', background: 'var(--app-bg-gray)' }}
      >
        <button onMouseDown={e => { e.preventDefault(); execCommand('bold'); }} className={btnCls} style={{ color: 'var(--app-text)', fontWeight: 700 }} title="Bold">B</button>
        <button onMouseDown={e => { e.preventDefault(); execCommand('italic'); }} className={btnCls} style={{ color: 'var(--app-text)', fontStyle: 'italic' }} title="Italic">I</button>
        <button onMouseDown={e => { e.preventDefault(); execCommand('underline'); }} className={btnCls} style={{ color: 'var(--app-text)', textDecoration: 'underline' }} title="Underline">U</button>
        <div className="w-px h-4 mx-1" style={{ background: 'var(--app-border)' }} />
        <button onMouseDown={e => { e.preventDefault(); execCommand('insertUnorderedList'); }} className={btnCls} style={{ color: 'var(--app-text-secondary)' }} title="Bullet List">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
            <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
          </svg>
        </button>
        <div className="w-px h-4 mx-1" style={{ background: 'var(--app-border)' }} />
        <button onMouseDown={e => { e.preventDefault(); execCommand('justifyLeft'); }} className={btnCls} style={{ color: 'var(--app-text-secondary)' }} title="Align Left">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="18" y2="18"/>
          </svg>
        </button>
        <button onMouseDown={e => { e.preventDefault(); execCommand('justifyCenter'); }} className={btnCls} style={{ color: 'var(--app-text-secondary)' }} title="Align Center">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/>
          </svg>
        </button>

        {/* AI Enhance button */}
        <div className="ml-auto flex items-center gap-1">
          <button
            onMouseDown={e => { e.preventDefault(); setShowAiInput(s => !s); }}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black transition-all"
            style={{ background: 'var(--app-primary-light)', color: 'var(--app-primary)' }}
            title="Enhance with AI"
          >
            <Wand2 className="w-3 h-3" />
            AI
          </button>
        </div>
      </div>

      {/* AI instruction input */}
      {showAiInput && (
        <div
          className="flex items-center gap-2 px-2 py-1.5"
          style={{ borderBottom: '1px solid var(--app-border)', background: 'var(--app-bg-gray)' }}
        >
          <input
            type="text"
            placeholder="Instruction (e.g. 'make more impactful') or leave blank"
            value={aiInstruction}
            onChange={e => setAiInstruction(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); enhanceWithAI(aiInstruction); } }}
            className="flex-1 text-[10px] px-2 py-1 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#41017d]"
            style={{ background: 'var(--app-bg-card)', border: '1px solid var(--app-border)', color: 'var(--app-text)' }}
            autoFocus
          />
          <button
            onMouseDown={e => { e.preventDefault(); enhanceWithAI(aiInstruction); }}
            disabled={aiLoading}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black text-white transition-all disabled:opacity-50"
            style={{ background: 'var(--app-primary)' }}
          >
            {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
            {aiLoading ? '' : 'Go'}
          </button>
        </div>
      )}

      {/* AI result preview */}
      {aiResult && (
        <div
          className="px-3 py-2.5 space-y-2"
          style={{
            borderBottom: '1px solid var(--app-border)',
            background: aiResult.startsWith('⚠️') ? 'rgba(239,68,68,0.04)' : 'rgba(16,185,129,0.04)',
          }}
        >
          {aiResult.startsWith('⚠️') ? (
            <p className="text-[10px] font-medium" style={{ color: '#ef4444' }}>{aiResult}</p>
          ) : (
            <>
              <p className="text-[10px] font-bold" style={{ color: '#10b981' }}>✨ AI suggestion:</p>
              <div
                className="text-[11px] leading-relaxed p-2 rounded-lg"
                style={{ background: 'var(--app-bg-card)', border: '1px solid var(--app-border)', color: 'var(--app-text)' }}
                dangerouslySetInnerHTML={{ __html: aiResult }}
              />
            </>
          )}
          <div className="flex gap-2">
            {!aiResult.startsWith('⚠️') && (
              <button
                onMouseDown={e => { e.preventDefault(); applyAiResult(); }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black text-white"
                style={{ background: '#10b981' }}
              >
                <Check className="w-3 h-3" /> Apply
              </button>
            )}
            <button
              onMouseDown={e => { e.preventDefault(); enhanceWithAI(aiInstruction); }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold"
              style={{ background: 'var(--app-bg-gray)', color: 'var(--app-text-secondary)', border: '1px solid var(--app-border)' }}
            >
              Retry
            </button>
            <button
              onMouseDown={e => { e.preventDefault(); setAiResult(''); }}
              className="p-1 rounded-lg"
              style={{ color: 'var(--app-text-muted)' }}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        className="p-3 min-h-[100px] outline-none text-xs font-medium leading-relaxed"
        style={{ color: 'var(--app-text)', background: 'var(--app-bg-card)', caretColor: '#41017d' }}
        onInput={e => onChange(e.currentTarget.innerHTML)}
        data-placeholder={placeholder || 'Write here...'}
      />
    </div>
  );
};

export default RichTextEditor;