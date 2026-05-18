'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
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
import { AppSidebar } from '@/components/layout/AppSidebar';
import { DUMMY_PROFILES, DUMMY_CONTENT_BASE } from '@/components/resume-builder/constants';
import { useConfirm } from '@/components/ui/ConfirmModal';

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface Resume extends ResumeData {
  _id: string;
  updatedAt: string;
  isPublic: boolean;
  shareSlug: string;
  previewImage?: string;
}

interface TemplateData {
  mainsection: { id: string; name: string; description?: string; resumeinfo?: { isPremium?: boolean } };
  secondary: { style: Record<string, any>; data?: any };
}

// â”€â”€â”€ Resume Thumbnail â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// --- Resume Thumbnail -----------------------------------------------------------
// Shows the saved screenshot if available, otherwise falls back to live render
function ResumeThumbnail({ data }: { data: Resume }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.3);
  const [imgError, setImgError] = useState(false);

  // A4 dimensions at 96dpi
  const A4_W = 794;
  const A4_H = 1122;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const containerW = el.offsetWidth || 200;
    setScale(containerW / A4_W);
  }, []);

  const bgColor = (data as any).design?.backgroundColor || '#ffffff';

  // If we have a saved screenshot, show it as an image (fast, accurate)
  const screenshotUrl = (data as any).previewImage;
  if (screenshotUrl && !imgError) {
    return (
      <div className="absolute inset-0 overflow-hidden" style={{ background: bgColor }}>
        <img
          src={screenshotUrl}
          alt={data.title || 'Resume preview'}
          className="w-full h-full object-cover object-top"
          onError={() => setImgError(true)}
          draggable={false}
        />
      </div>
    );
  }

  // Fallback: live render — scale the full A4 page to fit the card
  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none select-none"
      style={{ background: bgColor }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          width: `${A4_W}px`,
          height: `${A4_H}px`,
          position: 'absolute',
          top: 0,
          left: 0,
          overflow: 'hidden',
        }}
      >
        <ResumePreview
          data={data}
          numPages={1}
          previewRef={{ current: null } as any}
          zoomLevel={100}
          isThumbnail={true}
          isExporting={true}
        />
      </div>
    </div>
  );
}// â”€â”€â”€ Template Thumbnail (larger scale for modal) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function TemplateThumbnail({ template, index }: { template: TemplateData; index: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.25);

  const A4_W = 794;
  const A4_H = 1122;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const containerW = el.offsetWidth || 200;
    setScale(containerW / A4_W);
  }, []);

  const profile = DUMMY_PROFILES[index % DUMMY_PROFILES.length];
  const bgColor = template.secondary.style?.backgroundColor || '#ffffff';

  const mockData: ResumeData = {
    title: template.mainsection.name,
    template: template.mainsection.id,
    content: {
      ...DUMMY_CONTENT_BASE,
      ...(template.secondary.data || {}),
      personalInfo: {
        id: 'p1',
        fullName: profile.fullName,
        professionalTitle: profile.professionalTitle,
        email: profile.email,
        phone: '+1 (555) 000-0000',
        location: profile.location,
        image: profile.image,
        summary: 'Results-driven professional with 8+ years of experience leading cross-functional teams and delivering high-impact solutions. Proven track record of driving growth and exceeding targets.',
      },
    } as any,
    design: template.secondary.style as any,
    activeSections: ['summary', 'experience', 'education', 'skills', 'languages', 'awards'],
  };

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none select-none"
      style={{ background: bgColor }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          width: `${A4_W}px`,
          height: `${A4_H}px`,
          position: 'absolute',
          top: 0,
          left: 0,
          overflow: 'hidden',
        }}
      >
        <ResumePreview
          data={mockData}
          numPages={1}
          previewRef={{ current: null } as any}
          zoomLevel={100}
          isThumbnail={true}
          isExporting={true}
        />
      </div>
    </div>
  );
}

// â”€â”€â”€ Template Browser Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const CATEGORIES = ['All', 'Professional', 'Creative', 'Executive', 'Academic', 'Entry Level'];

function categorize(t: TemplateData): string {
  const text = (t.mainsection.name + ' ' + (t.mainsection.description || '')).toLowerCase();
  if (/creative|portfolio|designer|artist/.test(text)) return 'Creative';
  if (/executive|ceo|director|senior/.test(text)) return 'Executive';
  if (/academic|research|professor|scholar/.test(text)) return 'Academic';
  if (/entry|junior|student|intern/.test(text)) return 'Entry Level';
  return 'Professional';
}

interface TemplateBrowserProps {
  onClose: () => void;
  onSelect: (template: TemplateData) => void;
  currentTemplateId?: string;
}

function TemplateBrowser({ onClose, onSelect, currentTemplateId }: TemplateBrowserProps) {
  const [templates, setTemplates] = useState<TemplateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [creating, setCreating] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/templates')
      .then(r => r.json())
      .then(j => { if (j.success) setTemplates(j.data?.templates || []); })
      .finally(() => setLoading(false));
  }, []);

  // Close on Escape
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const filtered = templates.filter(t => {
    const matchSearch = !search || t.mainsection.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === 'All' || categorize(t) === activeCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-6xl flex flex-col rounded-2xl overflow-hidden shadow-2xl"
        style={{ maxHeight: '92vh', background: 'var(--app-bg-card)', border: '1px solid var(--app-border)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-8 py-5 shrink-0"
          style={{ borderBottom: '1px solid var(--app-border)' }}
        >
          <div>
            <h2 className="text-2xl font-black flex items-center gap-3" style={{ color: 'var(--app-text)' }}>
              Choose Template
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black text-white uppercase tracking-widest" style={{ background: 'var(--app-primary)' }}>
                {templates.length}+
              </span>
            </h2>
            <p className="text-xs mt-1" style={{ color: 'var(--app-text-muted)' }}>
              Select a professional design to apply to your resume
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl transition-all hover:opacity-70"
            style={{ background: 'var(--app-bg-gray)', color: 'var(--app-text)' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search + Filter */}
        <div
          className="px-8 py-4 flex items-center gap-4 shrink-0"
          style={{ borderBottom: '1px solid var(--app-border)', background: 'var(--app-bg-gray)' }}
        >
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--app-text-muted)' }} />
            <input
              type="text"
              placeholder="Search templates..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#41017d]"
              style={{ background: 'var(--app-bg-card)', border: '1px solid var(--app-border)', color: 'var(--app-text)' }}
            />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="px-3 py-1.5 rounded-full text-xs font-bold transition-all"
                style={activeCategory === cat
                  ? { background: 'var(--app-primary)', color: '#fff' }
                  : { background: 'var(--app-bg-card)', border: '1px solid var(--app-border)', color: 'var(--app-text-secondary)' }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar" style={{ background: 'var(--app-bg-gray)' }}>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <div
                    className="relative rounded-xl overflow-hidden"
                    style={{ aspectRatio: '210/297', background: 'var(--app-bg-card)', border: '1px solid var(--app-border)' }}
                  >
                    <div className="absolute inset-0 animate-shimmer" />
                    <div className="absolute inset-0 p-4 flex flex-col gap-2">
                      <div className="h-3 rounded-full w-2/3" style={{ background: 'var(--app-bg-gray)' }} />
                      <div className="h-2 rounded-full w-1/2" style={{ background: 'var(--app-bg-gray)' }} />
                      <div className="h-px w-full mt-2" style={{ background: 'var(--app-border)' }} />
                      <div className="h-2 rounded-full w-full" style={{ background: 'var(--app-bg-gray)' }} />
                      <div className="h-2 rounded-full w-5/6" style={{ background: 'var(--app-bg-gray)' }} />
                      <div className="h-2 rounded-full w-4/6" style={{ background: 'var(--app-bg-gray)' }} />
                    </div>
                  </div>
                  <div className="h-2.5 rounded-full w-3/4 mx-auto" style={{ background: 'var(--app-bg-card)' }} />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <Search className="w-10 h-10" style={{ color: 'var(--app-text-muted)' }} />
              <p className="text-sm font-medium" style={{ color: 'var(--app-text-muted)' }}>No templates found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {filtered.map((template, i) => {
                const isSelected = currentTemplateId === template.mainsection.id;
                const isCreating = creating === template.mainsection.id;
                return (
                  <div
                    key={template.mainsection.id}
                    className="group flex flex-col gap-2 cursor-pointer"
                    onClick={() => onSelect(template)}
                  >
                  <div
                      className={`relative rounded-xl overflow-hidden transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-xl ${isSelected ? 'ring-2 ring-offset-2' : ''}`}
                      style={{
                        aspectRatio: '210/297',
                        background: template.secondary.style?.backgroundColor || '#ffffff',
                        border: isSelected ? '2px solid var(--app-primary)' : '1px solid var(--app-border)',
                        boxShadow: isSelected ? '0 0 0 3px var(--app-primary-light)' : 'var(--app-shadow)',
                        '--tw-ring-color': 'var(--app-primary)',
                      } as any}
                    >
                      <TemplateThumbnail template={template} index={i} />

                      {/* Selected badge */}
                      {isSelected && (
                        <div className="absolute inset-0 flex items-center justify-center z-10" style={{ background: 'rgba(99,102,241,0.15)' }}>
                          <div className="p-2.5 rounded-full text-white shadow-lg" style={{ background: 'var(--app-primary)' }}>
                            <Check className="w-5 h-5 stroke-[3]" />
                          </div>
                        </div>
                      )}

                      {/* Premium badge */}
                      {template.mainsection.resumeinfo?.isPremium && (
                        <div className="absolute top-2 right-2 z-20">
                          <span className="bg-amber-500 text-white text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest shadow">PRO</span>
                        </div>
                      )}

                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <span
                          className="px-4 py-2 rounded-xl text-xs font-black text-white shadow-xl scale-90 group-hover:scale-100 transition-transform"
                          style={{ background: 'var(--app-primary)' }}
                        >
                          {isCreating ? 'Applying...' : 'Use Template'}
                        </span>
                      </div>
                    </div>

                    {/* Template name */}
                    <div className="px-1">
                      <p
                        className="text-[11px] font-bold truncate transition-colors"
                        style={{ color: isSelected ? 'var(--app-primary)' : 'var(--app-text)' }}
                      >
                        {template.mainsection.name}
                      </p>
                      {template.secondary.style?.layout && (
                        <p className="text-[10px] capitalize mt-0.5" style={{ color: 'var(--app-text-muted)' }}>
                          {String(template.secondary.style.layout).replace(/-/g, ' ')}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// â”€â”€â”€ Dashboard Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  useEffect(() => {
    if (session?.user) fetchResumes();
  }, [session]);

  const fetchResumes = async () => {
    try {
      const res = await fetch('/api/resumes');
      if (!res.ok) throw new Error('Failed to load resumes');
      const data = await res.json();
      setResumes(data.resumes || []);
    } catch {
      toast.error('Failed to load resumes');
    } finally {
      setLoading(false);
    }
  };

  const createResume = async (templateData?: TemplateData) => {
    setCreating(true);
    try {
      const body = templateData
        ? {
            title: `${templateData.mainsection.name} Resume`,
            template: templateData.mainsection.id,
            design: templateData.secondary.style,
          }
        : { title: 'My Resume', template: 'classic' };

      const res = await fetch('/api/resumes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Failed to create resume');
      const data = await res.json();
      const id = data.resume?._id || data.data?._id;
      if (id) {
        toast.success('Resume created!');
        router.push(`/resume/${id}`);
      }
    } catch {
      toast.error('Failed to create resume');
      setCreating(false);
    }
  };

  const deleteResume = async (id: string) => {
    const confirmed = await askConfirm({
      title: 'Delete Resume',
      message: 'This will permanently delete this resume. This action cannot be undone.',
      confirmLabel: 'Delete',
      cancelLabel: 'Keep it',
      variant: 'danger',
    });
    if (!confirmed) return;
    try {
      const res = await fetch(`/api/resumes/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete resume');
      setResumes(prev => prev.filter(r => r._id !== id));
      setMenuOpen(null);
      toast.success('Deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const duplicateResume = async (resume: Resume) => {
    try {
      const res = await fetch('/api/resumes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: `${resume.title} (Copy)`, template: resume.template }),
      });
      if (!res.ok) throw new Error('Failed to duplicate resume');
      const data = await res.json();
      const id = data.resume?._id || data.data?._id;
      if (id) router.push(`/resume/${id}`);
    } catch {
      toast.error('Failed to duplicate');
    }
  };

  // Categorize a resume based on its design properties
  const categorizeResume = (resume: Resume): string => {
    const layout = resume.design?.layout || 'single';
    const font = (resume.design?.fontFamily || '').toLowerCase();
    const primary = (resume.design?.primaryColor || '').toLowerCase();
    const template = (resume.template || '').toLowerCase();

    // Sidebar layouts → Creative
    if (layout.includes('sidebar')) return 'Creative';
    // Modern/double header → Modern
    if (layout === 'modern-header' || layout === 'double-header') return 'Modern';
    // Serif fonts → Professional
    if (['merriweather', 'lora', 'playfair', 'georgia', 'times'].some(f => font.includes(f))) return 'Professional';
    // Mono fonts → Simple
    if (['fira code', 'mono', 'courier', 'consolas'].some(f => font.includes(f))) return 'Simple';
    // Dark/neutral colors → Professional
    if (['#111827', '#1f2937', '#0f172a', '#374151'].includes(primary)) return 'Professional';
    // Bright/vivid colors → Creative
    if (['#ff4d7d', '#ef4444', '#f59e0b', '#8b5cf6'].includes(primary)) return 'Creative';
    // Blues/greens → Modern
    if (['#2563eb', '#0ea5e9', '#06b6d4', '#10b981'].includes(primary)) return 'Modern';
    // Single column with sans font → Simple
    if (layout === 'single') return 'Simple';
    return 'Professional';
  };

  // Filter resumes by category
  const FILTERS = ['All', 'Simple', 'Modern', 'Creative', 'Professional'];
  const filteredResumes = activeFilter === 'All'
    ? resumes
    : resumes.filter(r => categorizeResume(r) === activeFilter);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--app-bg)' }}>
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--app-primary)' }} />
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--app-bg-gray)' }}>
      <AppSidebar />

      <main className="flex-1 ml-64 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-10 py-10">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-black mb-1" style={{ color: 'var(--app-text)' }}>My Resumes</h1>
              <p className="text-sm" style={{ color: 'var(--app-text-secondary)' }}>
                {loading ? 'Loading...' : `${resumes.length} resume${resumes.length !== 1 ? 's' : ''} · Click to edit`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowTemplateBrowser(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90"
                style={{ background: 'var(--app-bg-card)', border: '1px solid var(--app-border)', color: 'var(--app-text)' }}
              >
                <Grid className="h-4 w-4" style={{ color: 'var(--app-primary)' }} />
                Browse Templates
              </button>
              <button
                onClick={() => createResume()}
                disabled={creating}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-black text-white transition-all hover:opacity-90 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, var(--app-primary), var(--app-secondary))' }}
              >
                {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                New Resume
              </button>
            </div>
          </div>

          {/* Filter chips */}
          <div className="flex items-center gap-2 mb-8 flex-wrap">
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className="px-4 py-1.5 rounded-full text-xs font-bold transition-all"
                style={activeFilter === f
                  ? { background: 'var(--app-primary)', color: '#fff', boxShadow: '0 2px 8px var(--app-primary-light)' }
                  : { background: 'var(--app-bg-card)', border: '1px solid var(--app-border)', color: 'var(--app-text-secondary)' }}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">

            {/* New Resume card */}
            <button
              onClick={() => setShowTemplateBrowser(true)}
              className="group flex flex-col gap-2"
            >
              <div
                className="relative rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-all duration-200 group-hover:-translate-y-1"
                style={{
                  aspectRatio: '210/297',
                  borderColor: 'var(--app-border)',
                  background: 'transparent',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--app-primary)';
                  (e.currentTarget as HTMLElement).style.background = 'var(--app-primary-light)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--app-border)';
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                }}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center transition-all"
                  style={{ background: 'var(--app-bg-card)' }}
                >
                  <Plus className="h-6 w-6" style={{ color: 'var(--app-primary)' }} />
                </div>
                <span className="text-xs font-bold" style={{ color: 'var(--app-text-secondary)' }}>New resume</span>
              </div>
              <p className="text-[11px] font-semibold text-center" style={{ color: 'var(--app-text-muted)' }}>
                From template
              </p>
            </button>

            {/* Skeleton loading cards */}
            {loading && Array.from({ length: 7 }).map((_, i) => (
              <div key={`skeleton-${i}`} className="flex flex-col gap-2">
                <div
                  className="relative rounded-xl overflow-hidden"
                  style={{
                    aspectRatio: '210/297',
                    background: '#f8fafc',
                    border: '1px solid var(--app-border)',
                  }}
                >
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute inset-0 animate-shimmer" />
                  </div>
                  {/* Fake content lines */}
                  <div className="absolute inset-0 p-4 flex flex-col gap-2">
                    <div className="h-3 rounded-full w-3/4" style={{ background: 'var(--app-bg-gray)' }} />
                    <div className="h-2 rounded-full w-1/2" style={{ background: 'var(--app-bg-gray)' }} />
                    <div className="h-px w-full mt-1" style={{ background: 'var(--app-border)' }} />
                    <div className="h-2 rounded-full w-full" style={{ background: 'var(--app-bg-gray)' }} />
                    <div className="h-2 rounded-full w-5/6" style={{ background: 'var(--app-bg-gray)' }} />
                    <div className="h-2 rounded-full w-4/6" style={{ background: 'var(--app-bg-gray)' }} />
                    <div className="h-px w-full mt-1" style={{ background: 'var(--app-border)' }} />
                    <div className="h-2 rounded-full w-full" style={{ background: 'var(--app-bg-gray)' }} />
                    <div className="h-2 rounded-full w-5/6" style={{ background: 'var(--app-bg-gray)' }} />
                    <div className="h-2 rounded-full w-3/4" style={{ background: 'var(--app-bg-gray)' }} />
                  </div>
                </div>
                <div className="flex flex-col gap-1 px-0.5">
                  <div className="h-2.5 rounded-full w-3/4" style={{ background: 'var(--app-bg-card)' }} />
                  <div className="h-2 rounded-full w-1/2" style={{ background: 'var(--app-bg-card)' }} />
                </div>
              </div>
            ))}

            {/* Resume cards */}
            {!loading && filteredResumes.map(resume => {
              const cardBg = resume.design?.backgroundColor || '#ffffff';
              return (
              <div key={resume._id} className="group flex flex-col gap-2">
                <div
                  className="relative rounded-xl overflow-hidden transition-all duration-200 hover:-translate-y-1"
                  style={{
                    aspectRatio: '210/297',
                    background: cardBg,
                    border: '1px solid var(--app-border)',
                    boxShadow: 'var(--app-shadow)',
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = 'var(--app-shadow-lg)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = 'var(--app-shadow)'}
                >
                  {/* Live preview thumbnail */}
                  <ResumeThumbnail data={resume} />

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Link
                      href={`/resume/${resume._id}`}
                      className="px-4 py-2 rounded-xl font-black text-xs shadow-xl transition-transform scale-90 group-hover:scale-100 text-white"
                      style={{ background: 'var(--app-primary)' }}
                      onClick={e => e.stopPropagation()}
                    >
                      Edit Resume
                    </Link>
                  </div>

                  {/* Menu button */}
                  <button
                    onClick={e => { e.stopPropagation(); setMenuOpen(menuOpen === resume._id ? null : resume._id); }}
                    className="absolute top-2 right-2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all z-10"
                    style={{ background: 'rgba(255,255,255,0.9)', color: '#374151' }}
                  >
                    <MoreVertical className="h-3.5 w-3.5" />
                  </button>

                  {/* Dropdown menu */}
                  {menuOpen === resume._id && (
                    <div
                      className="absolute top-10 right-2 rounded-xl py-1 z-20 min-w-[130px] animate-in fade-in slide-in-from-top-2"
                      style={{ background: 'var(--app-bg-card)', border: '1px solid var(--app-border)', boxShadow: 'var(--app-shadow-md)' }}
                      onClick={e => e.stopPropagation()}
                    >
                      <Link
                        href={`/resume/${resume._id}`}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold transition-colors hover:bg-black/5 dark:hover:bg-white/10 rounded-md"
                        style={{ color: 'var(--app-text)' }}
                      >
                        <FileText className="h-3.5 w-3.5" /> Open
                      </Link>
                      <button
                        onClick={() => duplicateResume(resume)}
                        className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-semibold transition-colors hover:bg-black/5 dark:hover:bg-white/10 rounded-md"
                        style={{ color: 'var(--app-text)' }}
                      >
                        <Copy className="h-3.5 w-3.5" /> Duplicate
                      </button>
                      <div style={{ height: '1px', background: 'var(--app-border)', margin: '2px 0' }} />
                      <button
                        onClick={() => deleteResume(resume._id)}
                        className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </div>
                  )}
                </div>

                {/* Title + date */}
                <div className="px-0.5">
                  <p className="text-[11px] font-black uppercase tracking-widest truncate" style={{ color: 'var(--app-text)' }}>
                    {resume.title}
                  </p>
                  <p className="text-[10px] font-medium mt-0.5" style={{ color: 'var(--app-text-muted)' }}>
                    {new Date(resume.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>
            );})}
          </div>

          {/* Empty state */}
          {filteredResumes.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'var(--app-primary-light)' }}>
                <FileText className="w-8 h-8" style={{ color: 'var(--app-primary)' }} />
              </div>
              <p className="text-lg font-black" style={{ color: 'var(--app-text)' }}>No resumes yet</p>
              <p className="text-sm" style={{ color: 'var(--app-text-muted)' }}>Create your first resume from a template</p>
              <button
                onClick={() => setShowTemplateBrowser(true)}
                className="mt-2 px-6 py-3 rounded-xl text-sm font-black text-white transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, var(--app-primary), var(--app-secondary))' }}
              >
                Browse Templates
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Template Browser Modal */}
      {showTemplateBrowser && (
        <TemplateBrowser
          onClose={() => setShowTemplateBrowser(false)}
          onSelect={template => {
            setShowTemplateBrowser(false);
            createResume(template);
          }}
        />
      )}

      {/* Close menu on outside click */}
      {menuOpen && (
        <div className="fixed inset-0 z-[5]" onClick={() => setMenuOpen(null)} />
      )}

      {/* Confirm modal */}
      {confirmModal}
    </div>
  );
}