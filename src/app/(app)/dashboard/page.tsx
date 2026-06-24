'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Plus, FileText, Loader2, MoreVertical, Trash2, Copy,
  X, Check, Search, Grid, Sparkles, ChevronDown,
} from 'lucide-react';
import toast from 'react-hot-toast';
import ResumePreview from '@/components/resume-builder/ResumePreview';
import { ResumeData } from '@/components/resume-builder/types';
import { DUMMY_PROFILES, DUMMY_CONTENT_BASE } from '@/components/resume-builder/constants';
import { useConfirm } from '@/components/ui/ConfirmModal';

// ─── Types ──────────────────────────────────────────────────────────────
interface Resume {
  _id: string;
  updatedAt: string;
  isPublic: boolean;
  shareSlug: string;
  previewImage?: string;
  title: string;
  template: string;
  content?: any;
  design?: any;
  activeSections?: string[];
}

interface TemplateData {
  mainsection: { id: string; name: string; description?: string; resumeinfo?: { isPremium?: boolean } };
  secondary: { style: Record<string, any>; data?: any };
}

// ─── Normalize API data to proper ResumeData for preview ──────────────
function normalizeResumeForPreview(raw: Resume): ResumeData {
  // Merge default content with actual saved data so missing fields don't break rendering
  const content = {
    personalInfo: {
      id: 'personal',
      fullName: raw?.title || 'Untitled',
      email: '',
      phone: '',
      location: '',
      professionalTitle: '',
      summary: '',
      image: '',
      photo: '',
    },
    experience: [],
    education: [],
    skills: [],
    languages: [],
    certifications: [],
    projects: [],
    awards: [],
    interests: [],
    courses: [],
    organisations: [],
    publications: [],
    references: [],
    socials: [],
    declaration: { text: '', signature: '', date: '', place: '' },
    custom: [],
    ...(raw.content || {}),
  };

  // Ensure personalInfo fields exist
  if (!content.personalInfo.fullName && raw.title) {
    content.personalInfo.fullName = raw.title;
  }

  // Pass the FULL design object through so normalizeResume can use all layout,
  // typography, color, and spacing settings to render a live preview.
  const design = raw.design || {};
  const activeSections = raw.activeSections || ['summary', 'experience', 'education', 'skills', 'languages'];
  const styleOverrides = (raw as any).styleOverrides || {};

  // Leave sections/layoutId/themeId/templateId OUT so normalizeResume
  // falls through to its else-branch which calls normalizeSections(data)
  // to build section/block arrays from the raw content data.
  return {
    title: raw.title || 'Untitled Resume',
    template: raw.template || 'classic',
    content,
    design,
    activeSections,
    styleOverrides,
  } as ResumeData;
}

// ─── Resume Thumbnail ──────────────────────────────────────────────────
function ResumeThumbnail({ data }: { data: Resume }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.3);
  const [imgError, setImgError] = useState(false);
  const A4_W = 794;
  const A4_H = 1122;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const containerW = el.offsetWidth || 200;
    setScale(containerW / A4_W);
  }, []);

  // Normalize data for preview rendering — ensures real content + layout
  const previewData = React.useMemo(() => normalizeResumeForPreview(data), [data]);

  const bgColor = data.design?.backgroundColor || '#ffffff';
  const screenshotUrl = data.previewImage;
  if (screenshotUrl && !imgError) {
    return (
      <div className="absolute inset-0 overflow-hidden" style={{ background: bgColor }}>
        <img src={screenshotUrl} alt={data.title || 'Resume preview'} className="w-full h-full object-cover object-top" onError={() => setImgError(true)} draggable={false} />
      </div>
    );
  }

  // Render only the FIRST page at full A4 dimensions, then scale down to fit the container.
  // Using the non-thumbnail path (PaginatedContent) with zoomLevel=100 gives proper pagination.
  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none select-none" style={{ background: bgColor }}>
      <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
        <div style={{ width: '794px', height: '1123px', transform: `scale(${scale})`, transformOrigin: 'top left' }}>
          <ResumePreview data={previewData} numPages={1} previewRef={{ current: null } as any} zoomLevel={100} isExporting={true} contentWidth={770} />
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard Page ────────────────────────────────────────────────────
export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [showTemplateBrowser, setShowTemplateBrowser] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const { confirmModal, askConfirm } = useConfirm();

  useEffect(() => { if (status === 'unauthenticated') router.push('/login'); }, [status, router]);
  useEffect(() => { if (session?.user) fetchResumes(); }, [session]);

  const fetchResumes = async () => {
    try {
      const res = await fetch('/api/resumes');
      if (!res.ok) throw new Error('Failed to load resumes');
      const data = await res.json();
      setResumes(data.resumes || []);
    } catch { toast.error('Failed to load resumes'); }
    finally { setLoading(false); }
  };

  const createResume = async (templateData?: TemplateData) => {
    setCreating(true);
    try {
      const body = templateData ? { title: `${templateData.mainsection.name} Resume`, template: templateData.mainsection.id, design: templateData.secondary.style } : { title: 'My Resume', template: 'classic' };
      const res = await fetch('/api/resumes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error('Failed to create resume');
      const data = await res.json();
      const id = data.resume?._id || data.data?._id;
      if (id) { toast.success('Resume created!'); router.push(`/resume/${id}`); }
    } catch { toast.error('Failed to create resume'); setCreating(false); }
  };

  const deleteResume = async (id: string) => {
    const confirmed = await askConfirm({ title: 'Delete Resume', message: 'This will permanently delete this resume. This action cannot be undone.', confirmLabel: 'Delete', cancelLabel: 'Keep it', variant: 'danger' });
    if (!confirmed) return;
    try {
      const res = await fetch(`/api/resumes/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete resume');
      setResumes(prev => prev.filter(r => r._id !== id)); setMenuOpen(null); toast.success('Deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const duplicateResume = async (resume: Resume) => {
    try {
      const res = await fetch('/api/resumes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: `${resume.title} (Copy)`, template: resume.template }) });
      if (!res.ok) throw new Error('Failed to duplicate resume');
      const data = await res.json();
      const id = data.resume?._id || data.data?._id;
      if (id) router.push(`/resume/${id}`);
    } catch { toast.error('Failed to duplicate'); }
  };

  const [editingTitle, setEditingTitle] = useState<string | null>(null);
  const [editTitleValue, setEditTitleValue] = useState('');

  const FILTERS = ['All'];
  const filteredResumes = activeFilter === 'All' ? resumes : resumes;

  const renameResume = async (id: string, newTitle: string) => {
    if (!newTitle.trim()) return;
    try {
      const res = await fetch(`/api/resumes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle.trim() }),
      });
      if (res.ok) {
        setResumes(prev => prev.map(r => r._id === id ? { ...r, title: newTitle.trim() } : r));
        toast.success('Renamed');
      }
    } catch { toast.error('Failed to rename'); }
    setEditingTitle(null);
  };

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--app-primary)' }} /></div>;
  }
  if (!session) return null;

  return (
    <div className="p-6 lg:p-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black mb-1" style={{ color: 'var(--app-text)' }}>My Resumes</h1>
          <p className="text-sm" style={{ color: 'var(--app-text-secondary)' }}>{loading ? 'Loading...' : `${resumes.length} resume${resumes.length !== 1 ? 's' : ''}`}</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => createResume()} disabled={creating}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-black text-white transition-all hover:opacity-90 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, var(--app-primary), var(--app-secondary))' }}>
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            New Resume
          </button>
        </div>
      </div>

      {/* Resume Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {!loading && filteredResumes.map(resume => (
          <div key={resume._id} className="group flex flex-col gap-2">
            <div className="relative rounded-xl overflow-hidden transition-all duration-200 hover:-translate-y-1" style={{ aspectRatio: '210/297', background: resume.design?.backgroundColor || '#ffffff', border: '1px solid var(--app-border)', boxShadow: 'var(--app-shadow)' }}>
              <ResumeThumbnail data={resume} />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <Link href={`/resume/${resume._id}`} className="px-4 py-2 rounded-xl font-black text-xs shadow-xl transition-transform scale-90 group-hover:scale-100 text-white" style={{ background: 'var(--app-primary)' }}>Edit Resume</Link>
              </div>
              <button onClick={e => { e.stopPropagation(); setMenuOpen(menuOpen === resume._id ? null : resume._id); }} className="absolute top-2 right-2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all z-10" style={{ background: 'rgba(255,255,255,0.9)', color: '#374151' }}>
                <MoreVertical className="h-3.5 w-3.5" />
              </button>
                  {menuOpen === resume._id && (
                    <div className="absolute top-10 right-2 rounded-xl py-1 z-20 min-w-[150px]" style={{ background: 'var(--app-bg-card)', border: '1px solid var(--app-border)', boxShadow: 'var(--app-shadow-md)' }} onClick={e => e.stopPropagation()}>
                      <Link href={`/resume/${resume._id}`} className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold" style={{ color: 'var(--app-text)' }}><FileText className="h-3.5 w-3.5" /> Open</Link>
                      <button onClick={() => { setEditingTitle(resume._id); setEditTitleValue(resume.title); setMenuOpen(null); }} className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-semibold" style={{ color: 'var(--app-text)' }}><Grid className="h-3.5 w-3.5" /> Rename</button>
                      <button onClick={() => duplicateResume(resume)} className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-semibold" style={{ color: 'var(--app-text)' }}><Copy className="h-3.5 w-3.5" /> Duplicate</button>
                      <div style={{ height: '1px', background: 'var(--app-border)', margin: '2px 0' }} />
                      <button onClick={() => deleteResume(resume._id)} className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-500"><Trash2 className="h-3.5 w-3.5" /> Delete</button>
                    </div>
                  )}
            </div>
            <div className="px-0.5">
              {editingTitle === resume._id ? (
                <div className="flex items-center gap-1">
                  <input
                    autoFocus
                    value={editTitleValue}
                    onChange={e => setEditTitleValue(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') renameResume(resume._id, editTitleValue); if (e.key === 'Escape') setEditingTitle(null); }}
                    onBlur={() => renameResume(resume._id, editTitleValue)}
                    className="flex-1 px-2 py-1 rounded-lg text-[11px] font-black border focus:ring-1 focus:ring-[var(--app-primary)]"
                    style={{ background: 'var(--app-bg-card)', borderColor: 'var(--app-border)', color: 'var(--app-text)' }}
                  />
                  <button onClick={() => renameResume(resume._id, editTitleValue)} className="p-1 rounded-lg" style={{ color: 'var(--app-primary)' }}>
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <p
                  className="text-[11px] font-black uppercase tracking-widest truncate cursor-pointer hover:opacity-70"
                  style={{ color: 'var(--app-text)' }}
                  onClick={(e) => { e.stopPropagation(); setEditingTitle(resume._id); setEditTitleValue(resume.title); }}
                >
                  {resume.title}
                </p>
              )}
              <p className="text-[10px] font-medium mt-0.5" style={{ color: 'var(--app-text-muted)' }}>{new Date(resume.updatedAt).toLocaleDateString()}</p>
            </div>
          </div>
        ))}
      </div>

      {!loading && filteredResumes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'var(--app-primary-light)' }}><FileText className="w-8 h-8" style={{ color: 'var(--app-primary)' }} /></div>
          <p className="text-lg font-black" style={{ color: 'var(--app-text)' }}>No resumes yet</p>
          <p className="text-sm" style={{ color: 'var(--app-text-muted)' }}>Create your first resume from a template</p>
        </div>
      )}

      {confirmModal}
    </div>
  );
}