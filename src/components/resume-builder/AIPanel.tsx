'use client';

/**
 * AIPanel — Gemini-powered AI assistant for the resume editor.
 * Features:
 * 1. Full resume generation from a prompt
 * 2. Per-section AI enhancement
 * 3. Custom instruction input
 */

import React, { useState, useCallback } from 'react';
import {
  Sparkles, Wand2, RefreshCw, ChevronDown, ChevronUp,
  Loader2, Check, X, Lightbulb, FileText, Zap,
} from 'lucide-react';
import { ResumeData } from './types';
import { processContentWithIds } from '@/lib/utils/resume-ids';

interface AIPanelProps {
  data: ResumeData;
  onApply: (content: Partial<ResumeData['content']>) => void;
  updateNested: (path: string, value: any) => void;
}

// ─── Quick prompt suggestions ─────────────────────────────────────────────────
const QUICK_PROMPTS = [
  { label: 'Software Engineer', icon: '💻', prompt: 'Create a resume for a Senior Software Engineer with 5 years of experience in React, Node.js, and cloud technologies.' },
  { label: 'Product Manager', icon: '📊', prompt: 'Create a resume for a Product Manager with experience in agile methodologies, roadmap planning, and cross-functional team leadership.' },
  { label: 'Data Scientist', icon: '🔬', prompt: 'Create a resume for a Data Scientist specializing in machine learning, Python, and statistical analysis.' },
  { label: 'UX Designer', icon: '🎨', prompt: 'Create a resume for a UX/UI Designer with expertise in Figma, user research, and design systems.' },
  { label: 'Marketing Manager', icon: '📣', prompt: 'Create a resume for a Digital Marketing Manager with experience in SEO, content strategy, and campaign management.' },
  { label: 'DevOps Engineer', icon: '⚙️', prompt: 'Create a resume for a DevOps Engineer with expertise in CI/CD, Kubernetes, AWS, and infrastructure automation.' },
];

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

  const enhanceWithAI = async (customInstruction?: string) => {
    if (!currentText && !customInstruction) return;
    setLoading(true);
    setResult('');
    try {
      const res = await fetch('/api/ai/enhance-field', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: currentText,
          fieldType,
          context,
          instruction: customInstruction || instruction,
        }),
      });
      const data = await res.json();
      if (data.enhanced && !data.error) {
        setResult(data.enhanced);
      } else {
        setResult(`⚠️ ${data.error?.includes('unavailable') || data.error?.includes('rate') ? 'AI is busy, please try again in a moment.' : (data.error || 'AI enhancement failed. Please try again.')}`);
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
        <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--app-text-secondary)' }}>
          {label}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowInput(s => !s)}
            className="p-1 rounded-lg transition-all text-[10px] font-bold"
            style={{ color: 'var(--app-text-muted)' }}
            title="Custom instruction"
          >
            <Lightbulb className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => enhanceWithAI()}
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
            onKeyDown={e => { if (e.key === 'Enter') enhanceWithAI(instruction); }}
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
          {!result.startsWith('⚠️') && (
            <div className="flex gap-2">
              <button
                onClick={() => { onApply(result); setResult(''); }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black text-white transition-all"
                style={{ background: '#10b981' }}
              >
                <Check className="w-3 h-3" /> Apply
              </button>
              <button
                onClick={() => enhanceWithAI()}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all"
                style={{ background: 'var(--app-bg-gray)', color: 'var(--app-text-secondary)' }}
              >
                <RefreshCw className="w-3 h-3" /> Retry
              </button>
              <button
                onClick={() => setResult('')}
                className="p-1 rounded-lg transition-all"
                style={{ color: 'var(--app-text-muted)' }}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          {result.startsWith('⚠️') && (
            <div className="flex gap-2">
              <button
                onClick={() => enhanceWithAI()}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all"
                style={{ background: 'var(--app-bg-gray)', color: 'var(--app-text-secondary)', border: '1px solid var(--app-border)' }}
              >
                <RefreshCw className="w-3 h-3" /> Retry
              </button>
              <button
                onClick={() => setResult('')}
                className="p-1 rounded-lg transition-all"
                style={{ color: 'var(--app-text-muted)' }}
              >
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

  const generateResume = useCallback(async (customPrompt?: string) => {
    const p = customPrompt || prompt;
    if (!p.trim()) return;

    setGenerating(true);
    setError('');
    setGeneratedPreview(null);

    try {
      const res = await fetch('/api/ai/generate-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: p,
          currentData: {
            personalInfo: data.content.personalInfo,
            experience: data.content.experience,
            education: data.content.education,
            skills: data.content.skills,
          },
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Generation failed');
      if (json.content) {
        setGeneratedPreview(json.content);
        if (json.warning) {
          setError(json.warning);
        }
      }
    } catch (e: any) {
      setError(e.message || 'Failed to generate resume');
    } finally {
      setGenerating(false);
    }
  }, [prompt, data.content]);

  const applyGenerated = () => {
    if (!generatedPreview) return;
    onApply(generatedPreview);
    setGeneratedPreview(null);
    setPrompt('');
  };

  const content = data.content;

  return (
    <div className="flex flex-col gap-3">

      {/* ── Generate Full Resume ── */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: '1px solid var(--app-border)', background: 'var(--app-bg-card)' }}
      >
        {/* Header */}
        <div
          className="px-4 py-3 flex items-center gap-2"
          style={{ background: 'linear-gradient(135deg, var(--app-primary-light), transparent)', borderBottom: '1px solid var(--app-border)' }}
        >
          <Sparkles className="w-4 h-4" style={{ color: 'var(--app-primary)' }} />
          <span className="text-[11px] font-black uppercase tracking-widest" style={{ color: 'var(--app-text)' }}>
            AI Resume Generator
          </span>
        </div>

        <div className="p-3 space-y-3">
          {/* Prompt input */}
          <div>
            <label className="text-[9px] font-black uppercase tracking-widest block mb-1.5" style={{ color: 'var(--app-text-muted)' }}>
              Describe your experience & role
            </label>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="e.g. Senior React developer with 5 years experience at startups, built e-commerce platforms, led team of 4..."
              rows={3}
              className="w-full text-xs px-3 py-2.5 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#41017d]"
              style={{
                background: 'var(--app-bg-gray)',
                border: '1px solid var(--app-border)',
                color: 'var(--app-text)',
                lineHeight: '1.5',
              }}
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
            {generating ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Generating with AI...</>
            ) : (
              <><Sparkles className="w-4 h-4" /> Generate Resume</>
            )}
          </button>

          {/* Error / Warning */}
          {error && (
            <div
              className="px-3 py-2 rounded-xl text-[11px] font-medium"
              style={{
                background: error.includes('unavailable') || error.includes('GROQ') || error.includes('busy')
                  ? 'rgba(245,158,11,0.08)' : 'rgba(239,68,68,0.08)',
                border: `1px solid ${error.includes('unavailable') || error.includes('GROQ') || error.includes('busy') ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.2)'}`,
                color: error.includes('unavailable') || error.includes('GROQ') || error.includes('busy') ? '#b45309' : '#ef4444',
              }}
            >
              {error.includes('unavailable') || error.includes('GROQ') || error.includes('busy') ? (
                <span>
                  ⚠️ AI unavailable.{' '}
                  <a
                    href="https://console.groq.com/keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-bold"
                  >
                    Get a free Groq API key
                  </a>
                  {' '}and add it as <code className="font-mono text-[10px] px-1 rounded" style={{ background: 'rgba(0,0,0,0.08)' }}>GROQ_API_KEY</code> in .env.local
                </span>
              ) : `⚠️ ${error}`}
            </div>
          )}

          {/* Preview generated content */}
          {generatedPreview && (
            <div
              className="rounded-xl p-3 space-y-2"
              style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)' }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span className="text-[11px] font-black text-emerald-600">Resume generated!</span>
                </div>
                <button onClick={() => setGeneratedPreview(null)} className="p-0.5 text-gray-400 hover:text-gray-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Preview summary */}
              <div className="text-[10px] space-y-0.5" style={{ color: 'var(--app-text-secondary)' }}>
                {generatedPreview.personalInfo?.fullName && (
                  <p><span className="font-bold">Name:</span> {generatedPreview.personalInfo.fullName}</p>
                )}
                {generatedPreview.personalInfo?.professionalTitle && (
                  <p><span className="font-bold">Title:</span> {generatedPreview.personalInfo.professionalTitle}</p>
                )}
                {generatedPreview.experience?.length > 0 && (
                  <p><span className="font-bold">Experience:</span> {generatedPreview.experience.length} positions</p>
                )}
                {generatedPreview.skills?.length > 0 && (
                  <p><span className="font-bold">Skills:</span> {generatedPreview.skills.slice(0, 5).map((s: any) => s.name || s).join(', ')}{generatedPreview.skills.length > 5 ? '...' : ''}</p>
                )}
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={applyGenerated}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-black text-white transition-all"
                  style={{ background: '#10b981' }}
                >
                  <Check className="w-3.5 h-3.5" /> Apply to Resume
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
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: '1px solid var(--app-border)', background: 'var(--app-bg-card)' }}
      >
        <button
          onClick={() => setShowEnhancers(s => !s)}
          className="w-full flex items-center justify-between px-4 py-3 transition-all"
          style={{ background: 'var(--app-bg-gray)' }}
        >
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4" style={{ color: 'var(--app-primary)' }} />
            <span className="text-[11px] font-black uppercase tracking-widest" style={{ color: 'var(--app-text)' }}>
              Enhance Sections
            </span>
          </div>
          {showEnhancers
            ? <ChevronUp className="w-4 h-4" style={{ color: 'var(--app-text-muted)' }} />
            : <ChevronDown className="w-4 h-4" style={{ color: 'var(--app-text-muted)' }} />}
        </button>

        {showEnhancers && (
          <div className="p-3 space-y-2">
            {/* Summary enhancer */}
            <SectionEnhancer
              label="Professional Summary"
              fieldType="summary"
              currentText={content.personalInfo?.summary || ''}
              context={`Name: ${content.personalInfo?.fullName}, Title: ${content.personalInfo?.professionalTitle}`}
              onApply={text => updateNested('content.personalInfo.summary', text)}
            />

            {/* Experience enhancers */}
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

            {content.experience?.length === 0 && (
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
