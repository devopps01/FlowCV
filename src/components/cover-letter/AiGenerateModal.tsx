'use client';

import React, { useState, useRef, memo, useCallback } from 'react';
import { Sparkles, Loader2, BookTemplate, ChevronDown, ChevronRight, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

interface AiGenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  personalInfo: { fullName: string; email: string; phone: string; location: string; professionalTitle: string; summary?: string; };
  recipient: { name: string; company: string; address: string; };
  syncedResume?: { title: string; content?: any; } | null;
  onApply: (html: string) => void;
  bodyColor?: string;
}

const AiGenerateModalInner = ({
  isOpen, onClose, personalInfo, recipient, syncedResume, onApply, bodyColor = '#374151'
}: AiGenerateModalProps) => {
  const [prompt, setPrompt] = useState('');
  const [tone, setTone] = useState<'professional'|'friendly'|'formal'|'enthusiastic'|'concise'>('professional');
  const [length, setLength] = useState<'short'|'medium'|'detailed'>('medium');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState('');

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    try {
      const body: any = {
        personalInfo,
        recipient,
        prompt,
        tone,
        length,
      };
      if (syncedResume?.content) {
        body.resumeContent = syncedResume.content;
        body.resumeTitle = syncedResume.title;
      }
      const r = await fetch('/api/ai/generate-cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const j = await r.json();
      if (j.content) {
        setResult(j.content);
      } else {
        toast.error('AI generation failed');
      }
    } catch {
      toast.error('AI generation failed');
    } finally {
      setGenerating(false);
    }
  }, [prompt, tone, length, personalInfo, recipient, syncedResume]);

  const handleApply = useCallback(() => {
    if (result) {
      const html = result.split(/\n\n+/).map((p: string) => {
        const formatted = p.trim().replace(/\n/g, '<br>');
        return `<p>${formatted}</p>`;
      }).join('');
      onApply(html || '<p></p>');
    }
    setPrompt('');
    setResult('');
    onClose();
  }, [result, onApply, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50" onClick={()=>!generating&&onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl w-[600px] max-h-[85vh] overflow-hidden flex flex-col" onClick={e=>e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0" style={{borderColor:'var(--app-border)'}}>
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5" style={{color:'var(--app-primary)'}}/>
            <h2 className="text-lg font-bold" style={{color:'var(--app-text)'}}>AI Generate Cover Letter</h2>
          </div>
          <button onClick={()=>{setPrompt('');setResult('');onClose();}} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        {/* Synced Resume Info */}
        {syncedResume && (
          <div className="mx-6 mt-4 px-4 py-2 rounded-lg flex items-center gap-2 shrink-0" style={{background:'var(--app-bg-gray)',border:'1px solid var(--app-border)'}}>
            <BookTemplate className="w-4 h-4 shrink-0" style={{color:'var(--app-primary)'}}/>
            <span className="text-xs" style={{color:'var(--app-text-secondary)'}}>Using resume: <strong style={{color:'var(--app-text)'}}>{syncedResume.title}</strong></span>
          </div>
        )}
        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Prompt Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider" style={{color:'var(--app-text-muted)'}}>What do you want to say?</label>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="e.g. Apply for Senior Developer position, highlighting 5 years of React experience..."
              className="w-full px-4 py-3 rounded-xl text-sm border min-h-[100px] resize-none focus:outline-none focus:ring-2 transition-all"
              style={{borderColor:'var(--app-border)',color:'var(--app-text)',background:'var(--app-bg)'}}
            />
          </div>
          {/* Tone Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider" style={{color:'var(--app-text-muted)'}}>Tone</label>
            <div className="flex flex-wrap gap-2">
              {(['professional','friendly','formal','enthusiastic','concise'] as const).map(t=>(
                <button key={t} onClick={()=>setTone(t)}
                  className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
                  style={tone===t?{background:'var(--app-primary)',color:'#fff'}:{background:'var(--app-bg-gray)',color:'var(--app-text-secondary)',border:'1px solid var(--app-border)'}}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          {/* Length Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider" style={{color:'var(--app-text-muted)'}}>Length</label>
            <div className="flex gap-2">
              {([
                {id:'short',l:'Short',d:'2-3 paragraphs'}, 
                {id:'medium',l:'Medium',d:'3-4 paragraphs'},
                {id:'detailed',l:'Detailed',d:'5-6 paragraphs'}
              ] as const).map(t=>(
                <button key={t.id} onClick={()=>setLength(t.id as any)}
                  className="flex-1 px-4 py-3 rounded-lg text-xs font-bold transition-all text-center"
                  style={length===t.id?{background:'var(--app-primary)',color:'#fff'}:{background:'var(--app-bg-gray)',color:'var(--app-text-secondary)',border:'1px solid var(--app-border)'}}>
                  <div>{t.l}</div>
                  <div className="font-normal opacity-70 mt-0.5">{t.d}</div>
                </button>
              ))}
            </div>
          </div>
          {/* Generate Button */}
          <button onClick={handleGenerate} disabled={generating||!prompt.trim()}
            className="w-full flex items-center justify-center gap-2 py-3 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-50"
            style={{background:'var(--app-primary)'}}>
            {generating?<><Loader2 className="w-4 h-4 animate-spin"/> Generating...</>:<><Sparkles className="w-4 h-4"/> Generate Cover Letter</>}
          </button>
          {/* Result Preview */}
          {result && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider" style={{color:'var(--app-text-muted)'}}>Generated Content</label>
                <button onClick={()=>setResult('')} className="text-xs font-medium" style={{color:'var(--app-text-secondary)'}}>Clear</button>
              </div>
              <div className="p-4 rounded-xl border text-sm leading-relaxed whitespace-pre-wrap max-h-[250px] overflow-y-auto" style={{borderColor:'var(--app-border)',background:'var(--app-bg)',color:bodyColor}}>{result}</div>
            </div>
          )}
        </div>
        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t shrink-0" style={{borderColor:'var(--app-border)',background:'var(--app-bg-gray)'}}>
          <button onClick={()=>{setPrompt('');setResult('');onClose();}} className="px-4 py-2 text-xs font-bold rounded-lg" style={{color:'var(--app-text-secondary)'}}>Cancel</button>
          <button onClick={handleApply} disabled={!result}
            className="px-6 py-2 text-white text-xs font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{background:'var(--app-primary)'}}>
            Apply to Letter
          </button>
        </div>
      </div>
    </div>
  );
};

// Memoize to prevent re-creation on parent re-renders
export default memo(AiGenerateModalInner);