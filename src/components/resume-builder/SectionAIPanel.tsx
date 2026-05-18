'use client';

/**
 * SectionAIPanel — AI assistant for a specific resume section.
 * Shows a prompt input + quick suggestions, generates content for that section,
 * previews it, then lets the user apply (merge) or replace.
 */

import React, { useState } from 'react';
import { Sparkles, Loader2, Check, X, RefreshCw, Wand2, ChevronDown, ChevronUp } from 'lucide-react';

interface SectionAIPanelProps {
  section: string;
  sectionLabel: string;
  currentData: any;
  resumeContext?: { fullName?: string; professionalTitle?: string };
  onApply: (data: any, mode: 'merge' | 'replace') => void;
  onClose: () => void;
}

// Quick prompt suggestions per section
const SECTION_PROMPTS: Record<string, { label: string; prompt: string }[]> = {
  personalInfo: [
    { label: 'Software Engineer', prompt: 'Senior Software Engineer with 5 years React/Node.js experience' },
    { label: 'Product Manager', prompt: 'Product Manager with agile and roadmap planning experience' },
    { label: 'Data Scientist', prompt: 'Data Scientist specializing in ML and Python' },
    { label: 'UX Designer', prompt: 'UX/UI Designer with Figma and user research expertise' },
    { label: 'Marketing', prompt: 'Digital Marketing Manager with SEO and campaign experience' },
  ],
  experience: [
    { label: 'Software Dev', prompt: 'Software developer role at a tech startup building web apps' },
    { label: 'Team Lead', prompt: 'Engineering team lead managing 5 developers, delivering features' },
    { label: 'Data Analyst', prompt: 'Data analyst role analyzing business metrics and building dashboards' },
    { label: 'Product Role', prompt: 'Product manager defining roadmap and working with engineering' },
    { label: 'Marketing', prompt: 'Digital marketing specialist running campaigns and SEO' },
  ],
  education: [
    { label: 'CS Degree', prompt: 'Bachelor of Science in Computer Science' },
    { label: 'MBA', prompt: 'Master of Business Administration' },
    { label: 'Engineering', prompt: 'Bachelor of Engineering' },
    { label: 'Design', prompt: 'Bachelor of Fine Arts in Graphic Design' },
  ],
  skills: [
    { label: 'Frontend Dev', prompt: 'Frontend developer: React, TypeScript, CSS, testing' },
    { label: 'Full Stack', prompt: 'Full stack: React, Node.js, PostgreSQL, AWS, Docker' },
    { label: 'Data Science', prompt: 'Data science: Python, ML, TensorFlow, SQL, visualization' },
    { label: 'DevOps', prompt: 'DevOps: Kubernetes, CI/CD, AWS, Terraform, monitoring' },
    { label: 'Design', prompt: 'UX design: Figma, user research, prototyping, accessibility' },
  ],
  projects: [
    { label: 'Web App', prompt: 'E-commerce web application with React and Node.js backend' },
    { label: 'Mobile App', prompt: 'Mobile app for task management built with React Native' },
    { label: 'ML Project', prompt: 'Machine learning model for sentiment analysis using Python' },
    { label: 'API', prompt: 'REST API service with authentication and database integration' },
  ],
  certifications: [
    { label: 'AWS', prompt: 'AWS Solutions Architect certification' },
    { label: 'Google', prompt: 'Google Cloud Professional certification' },
    { label: 'Scrum', prompt: 'Certified Scrum Master from Scrum Alliance' },
    { label: 'PMP', prompt: 'Project Management Professional (PMP) certification' },
  ],
  languages: [
    { label: 'English + Spanish', prompt: 'English native, Spanish fluent' },
    { label: 'Multilingual', prompt: 'English native, French intermediate, German basic' },
    { label: 'Asian Languages', prompt: 'English fluent, Mandarin native, Japanese intermediate' },
  ],
  awards: [
    { label: 'Tech Award', prompt: 'Innovation award for developing a new product feature' },
    { label: 'Academic', prompt: 'Dean\'s list and academic excellence awards' },
    { label: 'Leadership', prompt: 'Employee of the year and leadership recognition' },
  ],
  interests: [
    { label: 'Tech Hobbies', prompt: 'Open source, hackathons, tech blogging, gaming' },
    { label: 'Sports', prompt: 'Running, cycling, team sports, fitness' },
    { label: 'Creative', prompt: 'Photography, music, painting, writing' },
  ],
  declaration: [
    { label: 'Standard', prompt: 'Standard formal declaration statement' },
    { label: 'Short', prompt: 'Short, clean, professional declaration' },
    { label: 'Detailed', prompt: 'Detailed declaration with place and date' },
  ],
  custom: [
    { label: 'Volunteering', prompt: '2 volunteer project entries: chapters led, mentor events organized, and tech training provided' },
    { label: 'Extra-Curricular', prompt: '2 extra-curricular activities: hackathons co-organized, student clubs led' },
    { label: 'Achievements', prompt: '2 key achievements: industry speaker invites, patent applications, or coding contest ranks' },
  ],
};

// Preview renderer for generated data
function DataPreview({ section, data }: { section: string; data: any }) {
  if (!data) return null;

  if (section === 'personalInfo' && typeof data === 'object' && !Array.isArray(data)) {
    return (
      <div className="space-y-1 text-[11px]" style={{ color: 'var(--app-text-secondary)' }}>
        {data.fullName && <p><span className="font-bold" style={{ color: 'var(--app-text)' }}>Name:</span> {data.fullName}</p>}
        {data.professionalTitle && <p><span className="font-bold" style={{ color: 'var(--app-text)' }}>Title:</span> {data.professionalTitle}</p>}
        {data.email && <p><span className="font-bold" style={{ color: 'var(--app-text)' }}>Email:</span> {data.email}</p>}
        {data.summary && <p className="line-clamp-2"><span className="font-bold" style={{ color: 'var(--app-text)' }}>Summary:</span> {data.summary.replace(/<[^>]+>/g, '')}</p>}
      </div>
    );
  }

  if (section === 'declaration' && typeof data === 'object' && !Array.isArray(data)) {
    return (
      <div className="space-y-1 text-[11px]" style={{ color: 'var(--app-text-secondary)' }}>
        {data.text && <p><span className="font-bold" style={{ color: 'var(--app-text)' }}>Text:</span> {data.text}</p>}
        {data.place && <p><span className="font-bold" style={{ color: 'var(--app-text)' }}>Place:</span> {data.place}</p>}
        {data.date && <p><span className="font-bold" style={{ color: 'var(--app-text)' }}>Date:</span> {data.date}</p>}
      </div>
    );
  }

  if (Array.isArray(data)) {
    return (
      <div className="space-y-1.5">
        {data.slice(0, 3).map((item: any, i: number) => (
          <div key={i} className="text-[11px] px-2 py-1.5 rounded-lg" style={{ background: 'var(--app-bg-gray)', border: '1px solid var(--app-border)' }}>
            {section === 'experience' && (
              <p style={{ color: 'var(--app-text)' }}>
                <span className="font-bold">{item.position}</span>
                {item.company && <span style={{ color: 'var(--app-text-muted)' }}> @ {item.company}</span>}
              </p>
            )}
            {section === 'education' && (
              <p style={{ color: 'var(--app-text)' }}>
                <span className="font-bold">{item.degree} {item.field && `in ${item.field}`}</span>
                {item.school && <span style={{ color: 'var(--app-text-muted)' }}> — {item.school}</span>}
              </p>
            )}
            {section === 'skills' && (
              <span className="font-medium" style={{ color: 'var(--app-text)' }}>{typeof item === 'string' ? item : item.name}</span>
            )}
            {section === 'projects' && (
              <p style={{ color: 'var(--app-text)' }}>
                <span className="font-bold">{item.name}</span>
                {item.technologies?.length > 0 && (
                  <span style={{ color: 'var(--app-text-muted)' }}> — {item.technologies.slice(0, 3).join(', ')}</span>
                )}
              </p>
            )}
            {section === 'certifications' && (
              <p style={{ color: 'var(--app-text)' }}>
                <span className="font-bold">{item.name}</span>
                {item.issuer && <span style={{ color: 'var(--app-text-muted)' }}> by {item.issuer}</span>}
              </p>
            )}
            {section === 'languages' && (
              <p style={{ color: 'var(--app-text)' }}>
                <span className="font-bold">{item.language}</span>
                {item.proficiency && <span style={{ color: 'var(--app-text-muted)' }}> — {item.proficiency}</span>}
              </p>
            )}
            {section === 'awards' && (
              <p style={{ color: 'var(--app-text)' }}>
                <span className="font-bold">{item.title}</span>
                {item.issuer && <span style={{ color: 'var(--app-text-muted)' }}> by {item.issuer}</span>}
              </p>
            )}
            {section === 'interests' && (
              <span className="font-medium" style={{ color: 'var(--app-text)' }}>{typeof item === 'string' ? item : item.name}</span>
            )}
            {section === 'custom' && (
              <div className="space-y-0.5" style={{ color: 'var(--app-text)' }}>
                <p className="font-bold">{item.title}</p>
                {item.content && <p className="text-[10px] line-clamp-2" style={{ color: 'var(--app-text-secondary)' }}>{item.content.replace(/<[^>]+>/g, '')}</p>}
              </div>
            )}
            {!['experience', 'education', 'skills', 'projects', 'certifications', 'languages', 'awards', 'interests', 'custom'].includes(section) && (
              <p className="font-medium" style={{ color: 'var(--app-text)' }}>
                {item.name || item.title || item.platform || item.language || (typeof item === 'string' ? item : JSON.stringify(item))}
              </p>
            )}
          </div>
        ))}
        {data.length > 3 && (
          <p className="text-[10px] text-center" style={{ color: 'var(--app-text-muted)' }}>+{data.length - 3} more items</p>
        )}
      </div>
    );
  }

  return null;
}

export function SectionAIPanel({ section, sectionLabel, currentData, resumeContext, onApply, onClose }: SectionAIPanelProps) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState<any>(null);
  const [error, setError] = useState('');
  const [showQuick, setShowQuick] = useState(true);

  const quickPrompts = SECTION_PROMPTS[section] || [];

  const generate = async (customPrompt?: string) => {
    const p = customPrompt || prompt;
    if (!p.trim()) return;

    setLoading(true);
    setError('');
    setGenerated(null);

    try {
      const res = await fetch('/api/ai/generate-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section,
          prompt: p,
          currentData,
          resumeContext,
        }),
      });

      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || 'Generation failed');
      setGenerated(json.data);
    } catch (e: any) {
      setError(e.message || 'Failed to generate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const hasExisting = Array.isArray(currentData)
    ? currentData.length > 0
    : currentData && Object.values(currentData).some(v => v && String(v).trim());

  return (
    <div
      className="rounded-xl overflow-hidden mt-2"
      style={{ border: '1px solid var(--app-primary)', background: 'var(--app-bg-card)' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2"
        style={{ background: 'linear-gradient(135deg, var(--app-primary-light), transparent)', borderBottom: '1px solid var(--app-border)' }}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--app-primary)' }} />
          <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--app-text)' }}>
            AI — {sectionLabel}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg transition-all hover:opacity-70"
          style={{ color: 'var(--app-text-muted)' }}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="p-3 space-y-2.5">
        {/* Prompt input */}
        <div>
          <label className="text-[9px] font-black uppercase tracking-widest block mb-1" style={{ color: 'var(--app-text-muted)' }}>
            Describe what you want
          </label>
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder={`e.g. ${quickPrompts[0]?.prompt || `Describe your ${sectionLabel.toLowerCase()}...`}`}
            rows={2}
            className="w-full text-xs px-2.5 py-2 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#41017d]"
            style={{ background: 'var(--app-bg-gray)', border: '1px solid var(--app-border)', color: 'var(--app-text)', lineHeight: '1.5' }}
            onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) generate(); }}
          />
        </div>

        {/* Quick prompts */}
        {quickPrompts.length > 0 && (
          <div>
            <button
              onClick={() => setShowQuick(s => !s)}
              className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest mb-1.5"
              style={{ color: 'var(--app-text-muted)' }}
            >
              Quick suggestions
              {showQuick ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            {showQuick && (
              <div className="flex flex-wrap gap-1.5">
                {quickPrompts.map(qp => (
                  <button
                    key={qp.label}
                    onClick={() => { setPrompt(qp.prompt); generate(qp.prompt); }}
                    disabled={loading}
                    className="px-2 py-1 rounded-full text-[10px] font-bold transition-all disabled:opacity-50 hover:opacity-80"
                    style={{ background: 'var(--app-bg-gray)', border: '1px solid var(--app-border)', color: 'var(--app-text-secondary)' }}
                  >
                    {qp.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Generate button */}
        <button
          onClick={() => generate()}
          disabled={loading || !prompt.trim()}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-black text-white transition-all disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, var(--app-primary), var(--app-secondary))' }}
        >
          {loading
            ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating...</>
            : <><Wand2 className="w-3.5 h-3.5" /> Generate with AI</>}
        </button>

        {/* Error */}
        {error && (
          <div className="px-2.5 py-2 rounded-lg text-[11px]" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}>
            {error}
          </div>
        )}

        {/* Generated preview */}
        {generated && (
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(16,185,129,0.25)', background: 'rgba(16,185,129,0.04)' }}>
            {/* Preview header */}
            <div className="flex items-center justify-between px-3 py-2" style={{ borderBottom: '1px solid rgba(16,185,129,0.15)' }}>
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-[10px] font-black text-emerald-600">Generated!</span>
              </div>
              <button onClick={() => generate()} className="p-1 rounded text-emerald-400 hover:text-emerald-600 transition-all" title="Regenerate">
                <RefreshCw className="w-3 h-3" />
              </button>
            </div>

            {/* Preview content */}
            <div className="px-3 py-2">
              <DataPreview section={section} data={generated} />
            </div>

            {/* Apply buttons */}
            <div className="px-3 pb-3 flex gap-2">
              {hasExisting ? (
                <>
                  <button
                    onClick={() => { onApply(generated, 'merge'); setGenerated(null); }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-black text-white transition-all"
                    style={{ background: '#10b981' }}
                    title="Add to existing content"
                  >
                    <Check className="w-3 h-3" /> Add to existing
                  </button>
                  <button
                    onClick={() => { onApply(generated, 'replace'); setGenerated(null); }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-black transition-all"
                    style={{ background: 'var(--app-bg-gray)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}
                    title="Replace all existing content"
                  >
                    Replace all
                  </button>
                </>
              ) : (
                <button
                  onClick={() => { onApply(generated, 'replace'); setGenerated(null); }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-black text-white transition-all"
                  style={{ background: '#10b981' }}
                >
                  <Check className="w-3 h-3" /> Apply to Resume
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
