'use client';

/**
 * AIPanel — Gemini-powered AI assistant for the resume editor.
 *
 * MERGE STRATEGY (fixes "second AI edit overwrites previous changes"):
 * - personalInfo: AI fills only EMPTY fields — never overwrites user-filled ones
 * - experience/education/projects arrays: kept as-is if user already has data
 * - skills/languages: union merge — new items added, existing kept
 * - User can choose "Smart Merge" (safe) or "Full Replace" before applying
 */

import React, { useState, useCallback } from 'react';
import {
  Sparkles, Wand2, RefreshCw, ChevronDown, ChevronUp,
  Loader2, Check, X, Lightbulb, Zap, GitMerge, AlertTriangle,
} from 'lucide-react';
import { ResumeData } from './types';

interface AIPanelProps {
  data: ResumeData;
  onApply: (content: Partial<ResumeData['content']>) => void;
  updateNested: (path: string, value: any) => void;
}

const QUICK_PROMPTS = [
  { label: 'Software Engineer', icon: '💻', prompt: 'Create a resume for a Senior Software Engineer with 5 years of experience in React, Node.js, and cloud technologies.' },
  { label: 'Product Manager', icon: '📊', prompt: 'Create a resume for a Product Manager with experience in agile methodologies, roadmap planning, and cross-functional team leadership.' },
  { label: 'Data Scientist', icon: '🔬', prompt: 'Create a resume for a Data Scientist specializing in machine learning, Python, and statistical analysis.' },
  { label: 'UX Designer', icon: '🎨', prompt: 'Create a resume for a UX/UI Designer with expertise in Figma, user research, and design systems.' },
  { label: 'Marketing Manager', icon: '📣', prompt: 'Create a resume for a Digital Marketing Manager with experience in SEO, content strategy, and campaign management.' },
  { label: 'DevOps Engineer', icon: '⚙️', prompt: 'Create a resume for a DevOps Engineer with expertise in CI/CD, Kubernetes, AWS, and infrastructure automation.' },
];

// ─── Smart merge: AI fills gaps, never overwrites user data ───────────────────
function mergeContent(existing: any, ai: any, mode: 'smart' | 'replace'): any {
  if (mode === 'replace') return ai;

  const merged: any = JSON.parse(JSON.stringify(existing)); // deep clone existing

  // personalInfo: only fill empty fields
  if (ai.personalInfo) {
    if (!merged.personalInfo) merged.personalInfo = {};
    Object.entries(ai.personalInfo).forEach(([key, val]) => {
      if (key === 'id') return;
      const cur = merged.personalInfo[key];
      const empty = !cur || (typeof cur === 'string' && cur.trim() === '');
      if (empty && val) merged.personalInfo[key] = val;
    });
  }

  // Arrays: use AI result only when existing array is empty
  const arrayFields = [
    'experience', 'education', 'projects', 'certifications',
    'awards', 'courses', 'organisations', 'publications',
    'references', 'socials', 'interests',
  ];
  arrayFields.forEach(field => {
    const existArr = existing[field];
    const aiArr = ai[field];
    if (!aiArr || !Array.isArray(aiArr)) return;
    const hasExisting = Array.isArray(existArr) && existArr.length > 0;
    if (!hasExisting) merged[field] = aiArr; // fill empty section
    // else: keep user's existing data untouched
  });

  // skills: union merge — add new, keep existing
  if (ai.skills && Array.isArray(ai.skills)) {
    const existSkills = existing.skills || [];
    const existNames = new Set(
      existSkills.map((s: any) => (typeof s === 'string' ? s : s.name || '').toLowerCase())
    );
    const newSkills = ai.skills.filter((s: any) => {
      const name = (typeof s === 'string' ? s : s.name || '').toLowerCase();
      return name && !existNames.has(name);
    });
    merged.skills = [...existSkills, ...newSkills];
  }

  // languages: union merge
  if (ai.languages && Array.isArray(ai.languages)) {
    const existLangs = existing.languages || [];
    const existNames = new Set(existLangs.map((l: any) => (l.language || '').toLowerCase()));
    const newLangs = ai.languages.filter((l: any) => l.language && !existNames.has(l.language.toLowerCase()));
    merged.languages = [...existLangs, ...newLangs];
  }

  return merged;
}

// ─── Section enhancer ─────────────────────────────────────────────────────────
interface SectionEnhancerProps {
  label: string;
  fieldType: string;
  currentText: string;
  context?: string;
  onApply: (text: string) => void;
}

function SectionEnhancer({ label, fieldType, currentText, context, onApply }: SectionEnhancerProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [instruction, setInstruction] = useState('');
  const [showInput, setShowInput] = useState(false);

  const enhance = async (customInstruction?: string) => {
    if (!currentText && !customInstruction) return;
    setLoading(true);
    setResult('');
    try {
      const res = await fetch('/api/ai/enhance-field', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: currentText, fieldType, context, instruction: customInstruction || instruction }),
      });
      const d = await res.json();
      if (d.enhanced && !d.error) {
        setResult(d.enhanced);
      } else {
        setResult(`⚠️ ${d.error?.includes('unavailable') || d.error?.includes('rate') ? 'AI is busy, please try again.' : (d.error || 'Enhancement failed.')}`);
      }
    } catch (e: any) {
      setResult(`⚠️ ${e.message || 'Network error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--app-border)' }}>
      <div className="flex items-center justify-between px-3 py-2" style={{ background: 'var(--app-bg-gray)' }}>
        <span className="text-[10px] font-black uppercase tracking-widest truncate flex-1 mr-2" style={{ color: 'var(--app-text-secondary)' }}>
          {label}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={() => setShowInput(s => !s)} className="p-1 rounded-lg" style={{ color: 'var(--app-text-muted)' }} title="Custom instruction">
            <Lightbulb className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => enhance()}
            disabled={loading || !currentText}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black transition-all disabled:opacity-40"
            style={{ background: 'var(--app-primary)', color: '#fff' }}
          >
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
            Enhance
          </button>
        </div>
      </div>

      {showInput && (
        <div className="px-3 py-2" style={{ borderBottom: '1px solid var(--app-border)' }}>
          <input
            type="text"
            placeholder="Custom instruction (e.g. 'make it more technical')"
            value={instruction}
            onChange={e => setInstruction(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') enhance(instruction); }}
            className="w-full text-[11px] px-2.5 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#41017d]"
            style={{ background: 'var(--app-bg-card)', border: '1px solid var(--app-border)', color: 'var(--app-text)' }}
          />
        </div>
      )}

      {result && (
        <div className="px-3 py-2.5" style={{ background: 'var(--app-bg-card)' }}>
          <p
            className="text-[11px] leading-relaxed mb-2"
            style={{ color: result.startsWith('⚠️') ? '#ef4444' : 'var(--app-text)' }}
            dangerouslySetInnerHTML={{ __html: result }}
          />
          {!result.startsWith('⚠️') ? (
            <div className="flex gap-2">
              <button onClick={() => { onApply(result); setResult(''); }} className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black text-white" style={{ background: '#10b981' }}>
                <Check className="w-3 h-3" /> Apply
              </button>
              <button onClick={() => enhance()} className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold" style={{ background: 'var(--app-bg-gray)', color: 'var(--app-text-secondary)' }}>
                <RefreshCw className="w-3 h-3" /> Retry
              </button>
              <button onClick={() => setResult('')} className="p-1 rounded-lg" style={{ color: 'var(--app-text-muted)' }}>
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => enhance()} className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold" style={{ background: 'var(--app-bg-gray)', color: 'var(--app-text-secondary)', border: '1px solid var(--app-border)' }}>
                <RefreshCw className="w-3 h-3" /> Retry
              </button>
              <button onClick={() => setResult('')} className="p-1 rounded-lg" style={{ color: 'var(--app-text-muted)' }}>
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main AIPanel ─────────────────────────────────────────────────────────────
export function AIPanel({ data, onApply, updateNested }: AIPanelProps) {
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedPreview, setGeneratedPreview] = useState<any>(null);
  const [showEnhancers, setShowEnhancers] = useState(false);
  const [error, setError] = useState('');
  const [applyMode, setApplyMode] = useState<'smart' | 'replace'>('smart');

  const hasExistingData = !!(
    data.content?.personalInfo?.fullName ||
    (data.content?.experience?.length ?? 0) > 0 ||
    (data.content?.education?.length ?? 0) > 0
  );

  const generateResume = useCallback(async (customPrompt?: string) => {
    const p = customPrompt || prompt;
    if (!p.trim()) return;

    setGenerating(true);
    setError('');
    setGeneratedPreview(null);

    try {
      // Send FULL current content so AI builds on top of existing data
      const res = await fetch('/api/ai/generate-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: p,
          currentData: data.content, // full content — not just 4 fields
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Generation failed');
      if (json.content) {
        setGeneratedPreview(json.content);
        if (json.warning) setError(json.warning);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to generate resume');
    } finally {
      setGenerating(false);
    }
  }, [prompt, data.content]);

  const applyGenerated = (mode: 'smart' | 'replace') => {
    if (!generatedPreview) return;
    const toApply = mode === 'replace'
      ? generatedPreview
      : mergeContent(data.content, generatedPreview, 'smart');
    onApply(toApply);
    setGeneratedPreview(null);
    setPrompt('');
    setError('');
  };

  const content = data.content;

  return (
    <div className="flex flex-col gap-3">

      {/* ── Generate Full Resume ── */}
      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--app-border)', background: 'var(--app-bg-card)' }}>
        {/* Header */}
        <div
          className="px-4 py-3 flex items-center gap-2"
          style={{ background: 'linear-gradient(135deg, var(--app-primary-light), transparent)', borderBottom: '1px solid var(--app-border)' }}
        >
          <Sparkles className="w-4 h-4" style={{ color: 'var(--app-primary)' }} />
          <span className="text-[11px] font-black uppercase tracking-widest" style={{ color: 'var(--app-text)' }}>
            AI Resume Generator
          </span>
          {hasExistingData && (
            <span
              className="ml-auto text-[9px] px-2 py-0.5 rounded-full font-black"
              style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)' }}
            >
              ✓ Data preserved
            </span>
          )}
        </div>

        <div className="p-3 space-y-3">
          {/* Prompt input */}
          <div>
            <label className="text-[9px] font-black uppercase tracking-widest block mb-1.5" style={{ color: 'var(--app-text-muted)' }}>
              {hasExistingData ? 'Describe changes or additions' : 'Describe your experience & role'}
            </label>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder={hasExistingData
                ? 'e.g. Add a new job at Google, improve my summary, add Python skills...'
                : 'e.g. Senior React developer with 5 years experience, built e-commerce platforms...'}
              rows={3}
              className="w-full text-xs px-3 py-2.5 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#41017d]"
              style={{ background: 'var(--app-bg-gray)', border: '1px solid var(--app-border)', color: 'var(--app-text)', lineHeight: '1.5' }}
            />
          </div>

          {/* Quick prompts */}
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest mb-1.5" style={{ color: 'var(--app-text-muted)' }}>Quick start</p>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_PROMPTS.map(qp => (
                <button
                  key={qp.label}
                  onClick={() => { setPrompt(qp.prompt); generateResume(qp.prompt); }}
                  disabled={generating}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all disabled:opacity-50"
                  style={{ background: 'var(--app-bg-gray)', border: '1px solid var(--app-border)', color: 'var(--app-text-secondary)' }}
                >
                  <span>{qp.icon}</span> {qp.label}
                </button>
              ))}
            </div>
          </div>

          {/* Generate button */}
          <button
            onClick={() => generateResume()}
            disabled={generating || !prompt.trim()}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-black text-white transition-all disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, var(--app-primary), var(--app-secondary))' }}
          >
            {generating
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating with AI...</>
              : <><Sparkles className="w-4 h-4" /> Generate Resume</>}
          </button>

          {/* Error / Warning */}
          {error && (
            <div
              className="px-3 py-2 rounded-xl text-[11px] font-medium"
              style={{
                background: error.includes('unavailable') || error.includes('GROQ') || error.includes('busy') ? 'rgba(245,158,11,0.08)' : 'rgba(239,68,68,0.08)',
                border: `1px solid ${error.includes('unavailable') || error.includes('GROQ') || error.includes('busy') ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.2)'}`,
                color: error.includes('unavailable') || error.includes('GROQ') || error.includes('busy') ? '#b45309' : '#ef4444',
              }}
            >
              {error.includes('unavailable') || error.includes('GROQ') || error.includes('busy') ? (
                <span>
                  ⚠️ AI unavailable.{' '}
                  <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="underline font-bold">
                    Get a free Groq API key
                  </a>
                  {' '}and add it as{' '}
                  <code className="font-mono text-[10px] px-1 rounded" style={{ background: 'rgba(0,0,0,0.08)' }}>GROQ_API_KEY</code>
                  {' '}in .env.local
                </span>
              ) : `⚠️ ${error}`}
            </div>
          )}

          {/* Generated preview + apply options */}
          {generatedPreview && (
            <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.2)' }}>
              {/* Header */}
              <div className="flex items-center justify-between px-3 py-2.5" style={{ borderBottom: '1px solid rgba(16,185,129,0.15)' }}>
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span className="text-[11px] font-black text-emerald-600">Resume generated!</span>
                </div>
                <button onClick={() => setGeneratedPreview(null)} className="p-0.5 text-gray-400 hover:text-gray-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Summary */}
              <div className="px-3 py-2 text-[10px] space-y-0.5" style={{ color: 'var(--app-text-secondary)' }}>
                {generatedPreview.personalInfo?.fullName && <p><span className="font-bold">Name:</span> {generatedPreview.personalInfo.fullName}</p>}
                {generatedPreview.personalInfo?.professionalTitle && <p><span className="font-bold">Title:</span> {generatedPreview.personalInfo.professionalTitle}</p>}
                {generatedPreview.experience?.length > 0 && <p><span className="font-bold">Experience:</span> {generatedPreview.experience.length} positions</p>}
                {generatedPreview.skills?.length > 0 && <p><span className="font-bold">Skills:</span> {generatedPreview.skills.slice(0, 5).map((s: any) => s.name || s).join(', ')}{generatedPreview.skills.length > 5 ? '...' : ''}</p>}
              </div>

              {/* Apply mode selector */}
              <div className="px-3 pb-2">
                <p className="text-[9px] font-black uppercase tracking-widest mb-1.5" style={{ color: 'var(--app-text-muted)' }}>How to apply?</p>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => setApplyMode('smart')}
                    className="flex flex-col items-start px-2.5 py-2 rounded-xl text-left transition-all"
                    style={{
                      background: applyMode === 'smart' ? 'rgba(16,185,129,0.12)' : 'var(--app-bg-gray)',
                      border: applyMode === 'smart' ? '1.5px solid rgba(16,185,129,0.4)' : '1px solid var(--app-border)',
                    }}
                  >
                    <div className="flex items-center gap-1 mb-0.5">
                      <GitMerge className="w-3 h-3" style={{ color: '#10b981' }} />
                      <span className="text-[10px] font-black" style={{ color: applyMode === 'smart' ? '#10b981' : 'var(--app-text)' }}>Smart Merge</span>
                    </div>
                    <span className="text-[9px]" style={{ color: 'var(--app-text-muted)' }}>Keep your edits, fill empty fields</span>
                  </button>
                  <button
                    onClick={() => setApplyMode('replace')}
                    className="flex flex-col items-start px-2.5 py-2 rounded-xl text-left transition-all"
                    style={{
                      background: applyMode === 'replace' ? 'rgba(239,68,68,0.08)' : 'var(--app-bg-gray)',
                      border: applyMode === 'replace' ? '1.5px solid rgba(239,68,68,0.3)' : '1px solid var(--app-border)',
                    }}
                  >
                    <div className="flex items-center gap-1 mb-0.5">
                      <AlertTriangle className="w-3 h-3" style={{ color: '#ef4444' }} />
                      <span className="text-[10px] font-black" style={{ color: applyMode === 'replace' ? '#ef4444' : 'var(--app-text)' }}>Full Replace</span>
                    </div>
                    <span className="text-[9px]" style={{ color: 'var(--app-text-muted)' }}>Overwrite all with AI result</span>
                  </button>
                </div>
              </div>

              {/* Apply buttons */}
              <div className="flex gap-2 px-3 pb-3">
                <button
                  onClick={() => applyGenerated(applyMode)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-black text-white transition-all"
                  style={{ background: applyMode === 'smart' ? '#10b981' : '#ef4444' }}
                >
                  {applyMode === 'smart'
                    ? <><GitMerge className="w-3.5 h-3.5" /> Apply (Merge)</>
                    : <><AlertTriangle className="w-3.5 h-3.5" /> Apply (Replace All)</>}
                </button>
                <button
                  onClick={() => generateResume()}
                  className="px-3 py-2 rounded-xl text-[11px] font-bold transition-all"
                  style={{ background: 'var(--app-bg-gray)', color: 'var(--app-text-secondary)', border: '1px solid var(--app-border)' }}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Section Enhancers ── */}
      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--app-border)', background: 'var(--app-bg-card)' }}>
        <button
          onClick={() => setShowEnhancers(s => !s)}
          className="w-full flex items-center justify-between px-4 py-3 transition-all"
          style={{ background: 'var(--app-bg-gray)' }}
        >
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4" style={{ color: 'var(--app-primary)' }} />
            <span className="text-[11px] font-black uppercase tracking-widest" style={{ color: 'var(--app-text)' }}>Enhance Sections</span>
          </div>
          {showEnhancers
            ? <ChevronUp className="w-4 h-4" style={{ color: 'var(--app-text-muted)' }} />
            : <ChevronDown className="w-4 h-4" style={{ color: 'var(--app-text-muted)' }} />}
        </button>

        {showEnhancers && (
          <div className="p-3 space-y-2">
            <SectionEnhancer
              label="Professional Summary"
              fieldType="summary"
              currentText={content.personalInfo?.summary || ''}
              context={`Name: ${content.personalInfo?.fullName}, Title: ${content.personalInfo?.professionalTitle}`}
              onApply={text => updateNested('content.personalInfo.summary', text)}
            />
            {content.experience?.slice(0, 3).map((exp, i) => (
              <SectionEnhancer
                key={exp.id || i}
                label={`${exp.position || 'Experience'} @ ${exp.company || ''}`}
                fieldType="description"
                currentText={exp.description || ''}
                context={`Position: ${exp.position}, Company: ${exp.company}, Dates: ${exp.startDate}–${exp.endDate}`}
                onApply={text => updateNested(`content.experience[${i}].description`, text)}
              />
            ))}
            {(!content.experience || content.experience.length === 0) && (
              <p className="text-[11px] text-center py-3" style={{ color: 'var(--app-text-muted)' }}>
                Add experience entries to enhance them with AI
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
