'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, X, Search, ChevronDown, Loader2 } from 'lucide-react';
import ResumePreview from '@/components/resume-builder/ResumePreview';
import { TemplatesHeader } from '@/components/layout/TemplatesHeader';
import { ResumeData } from '@/components/resume-builder/types';

// ─── Types ───────────────────────────────────────────────────────────────────
interface TemplateData {
  mainsection: { id: string; name: string; description?: string };
  secondary: { style: Record<string, any>; data?: any };
}

// ─── Dummy preview content ────────────────────────────────────────────────────
const PREVIEW_CONTENT: ResumeData['content'] = {
  personalInfo: {
    id: 'p1',
    fullName: 'Brian T. Wayne',
    email: 'brian@example.com',
    phone: '+1 555 000 0000',
    location: 'San Francisco, CA',
    professionalTitle: 'Business Development Director',
    summary: 'Results-driven professional with 8+ years leading cross-functional teams to deliver high-impact solutions.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
  },
  experience: [
    { id: 'e1', company: 'Meta Platforms', position: 'Senior Specialist', startDate: '2020-03', endDate: 'Present', current: true, description: 'Led cross-functional teams delivering high-impact features for 2B+ users. Optimized core algorithms resulting in 15% performance increase.' },
    { id: 'e2', company: 'Startup Hub', position: 'Founding Member', startDate: '2016-06', endDate: '2020-02', current: false, description: 'Scaled platform from zero to 100k active users within 18 months. Architected MVP using React and Node.js.' },
    { id: 'e3', company: 'Design Co.', position: 'Junior Architect', startDate: '2014-01', endDate: '2016-05', current: false, description: 'Collaborated on large-scale infrastructure projects focused on sustainable design.' },
  ],
  education: [
    { id: 'ed1', school: 'Stanford University', degree: 'MS', field: 'Computer Science', graduationYear: '2016' },
    { id: 'ed2', school: 'UC Berkeley', degree: 'BS', field: 'Engineering', graduationYear: '2014' },
  ],
  skills: [
    { id: 's1', name: 'Leadership' }, { id: 's2', name: 'Product Management' },
    { id: 's3', name: 'Data Analysis' }, { id: 's4', name: 'React' },
    { id: 's5', name: 'TypeScript' }, { id: 's6', name: 'Agile' },
    { id: 's7', name: 'Cloud Computing' }, { id: 's8', name: 'System Architecture' },
  ],
  languages: [
    { id: 'l1', language: 'English', proficiency: 'Native' },
    { id: 'l2', language: 'Spanish', proficiency: 'Fluent' },
  ],
  certifications: [
    { id: 'c1', name: 'PMP Certified', issuer: 'PMI', date: '2020', description: '' },
    { id: 'c2', name: 'AWS Solutions Architect', issuer: 'Amazon', date: '2021', description: '' },
  ],
  projects: [
    { id: 'pr1', name: 'AI Analytics Dashboard', description: 'Real-time analytics platform with ML predictions', technologies: ['React', 'Python', 'TensorFlow'] },
  ],
  awards: [
    { id: 'aw1', title: 'PM of the Year', issuer: 'TechCorp', date: '2022', description: 'Outstanding product leadership' },
  ],
  interests: [
    { id: 'i1', name: 'Technology' }, { id: 'i2', name: 'Travel' }, { id: 'i3', name: 'Photography' },
  ],
  socials: [], courses: [], organisations: [], publications: [], references: [], custom: [],
};

const CATEGORIES = [
  { id: 'professional', label: 'Professional Resume Templates', desc: 'Clean, ATS-friendly designs trusted by recruiters worldwide. Stand out with a polished, structured layout.' },
  { id: 'creative', label: 'Creative Resume Templates', desc: 'Express your personality with colorful, bold templates that turn your resume into a visual story.' },
  { id: 'executive', label: 'Executive Resume Templates', desc: 'Authoritative, sophisticated designs for senior leadership and C-suite roles.' },
  { id: 'academic', label: 'Academic Resume Templates', desc: 'Scholarly formats for research positions, professorships, and academic applications.' },
  { id: 'entry-level', label: 'Entry Level Resume Templates', desc: 'Perfect for students and recent graduates entering the workforce for the first time.' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function categorize(t: TemplateData): string {
  const text = ((t.mainsection?.name || '') + ' ' + ((t.mainsection as any)?.description || '')).toLowerCase();
  if (/creative|portfolio|designer|artist|graphic|leaves|dark/.test(text)) return 'creative';
  if (/executive|ceo|director|senior|manager|elite/.test(text)) return 'executive';
  if (/academic|research|professor|scholar|cv|harvard/.test(text)) return 'academic';
  if (/entry|junior|student|intern|graduate|fresher/.test(text)) return 'entry-level';
  return 'professional';
}

function buildDesign(t: TemplateData): ResumeData['design'] {
  const s = t.secondary?.style || {};
  return {
    primaryColor: s.primaryColor || '#ff4d7d',
    secondaryColor: s.secondaryColor || '#f8fafc',
    accentColor: s.accentColor || s.primaryColor || '#ff4d7d',
    textColor: s.textColor || '#1f2937',
    backgroundColor: s.backgroundColor || '#ffffff',
    fontFamily: s.fontFamily || 'Inter',
    fontCategory: 'sans' as const,
    fontSize: s.fontSize || 10.5,
    lineHeight: 1.45,
    marginLR: 12, marginTB: 16,
    entrySpacing: 8, sectionSpacing: 16,
    layout: (s.layout || 'sidebar-left') as any,
    headingStyle: 'underline',
    headingCapitalization: 'uppercase' as const,
    headingSize: 'm' as const,
    headingIconType: 'none' as const,
    entryLayout: 'default' as const,
    entryColumnWidth: 'auto' as const,
    entryTitleSize: 'm' as const,
    entrySubtitleStyle: 'normal' as const,
    entrySubtitlePlacement: 'next-line' as const,
    descriptionIndent: false,
    listStyle: 'bullet' as const,
    showPageNumbers: true,
    showEmailInFooter: false,
    showNameInFooter: false,
    linkUnderline: true,
    linkBlueColor: false,
    linkIcon: true,
    personalAlign: 'left' as const,
    personalArrangement: 'default' as const,
    personalIconShow: true,
    personalBulletShow: false,
    personalBarShow: false,
    personalIconStyle: 'default' as const,
    nameSize: 'm' as const,
    nameBold: true,
    nameFontType: 'body' as const,
    titleSize: 'm' as const,
    titlePosition: 'below' as const,
    titleStyle: 'normal' as const,
    photoShow: true,
    photoGrayscale: false,
    photoSize: 'm' as const,
    photoShape: 'circle' as const,
    skillsStyle: 'grid' as const,
    skillsColumns: 2,
    languagesStyle: 'grid' as const,
    languagesColumns: 2,
    interestsStyle: 'grid' as const,
    interestsColumns: 2,
    certificationsStyle: 'grid' as const,
    certificationsColumns: 2,
    showSummaryHeading: true,
    educationOrder: 'degree-school' as const,
    workOrder: 'title-employer' as const,
    workGroupPromotions: false,
    applyAccentTo: ['headings', 'headingLine'],
  };
}

function buildResumeData(t: TemplateData): ResumeData {
  return {
    title: t.mainsection.name,
    template: t.mainsection.id,
    content: PREVIEW_CONTENT,
    design: buildDesign(t),
    activeSections: ['summary', 'experience', 'education', 'skills', 'languages', 'certifications', 'projects', 'awards', 'interests'],
  };
}

// ─── TemplateCard ─────────────────────────────────────────────────────────────
interface TemplateCardProps {
  template: TemplateData;
  selected: boolean;
  creating: boolean;
  onUse: (t: TemplateData) => void;
  onPreview: (t: TemplateData) => void;
}

function TemplateCard({ template, selected, creating, onUse, onPreview }: TemplateCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.22);
  const resumeData = buildResumeData(template);

  useEffect(() => {
    if (!cardRef.current) return;
    const obs = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      if (w > 0) setScale(w / 794);
    });
    obs.observe(cardRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div className="group flex flex-col gap-2">
      {/* Card shell */}
      <div
        ref={cardRef}
        className={`relative rounded-xl overflow-hidden bg-white cursor-pointer transition-all duration-200
          hover:shadow-2xl hover:-translate-y-1
          ${selected ? 'ring-2 ring-[#41017d] shadow-lg' : 'ring-1 ring-gray-200 shadow-sm'}`}
        style={{ aspectRatio: '210/297' }}
      >
        {/* Scaled live preview */}
        <div
          style={{
            width: '794px',
            height: `${794 * (297 / 210)}px`,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            pointerEvents: 'none',
            userSelect: 'none',
            overflow: 'hidden',
          }}
        >
          <ResumePreview
            data={resumeData}
            numPages={1}
            previewRef={previewRef}
            zoomLevel={100}
            isThumbnail={true}
          />
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
          <button
            onClick={(e) => { e.stopPropagation(); onUse(template); }}
            disabled={creating}
            className="px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-lg transition-all disabled:opacity-60 flex items-center gap-1.5"
            style={{ background: 'linear-gradient(135deg, #41017d, #ee14ff)' }}
          >
            {creating ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
            Use Template
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onPreview(template); }}
            className="p-1.5 rounded-lg bg-white/90 hover:bg-white text-gray-700 shadow-lg transition-all"
            title="Preview"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Name */}
      <p className="text-xs font-semibold text-gray-600 text-center truncate px-1 group-hover:text-gray-900 transition-colors">
        {template.mainsection.name}
      </p>
    </div>
  );
}

// ─── PreviewModal ─────────────────────────────────────────────────────────────
interface PreviewModalProps {
  template: TemplateData;
  creating: boolean;
  onUse: (t: TemplateData) => void;
  onClose: () => void;
}

function PreviewModal({ template, creating, onUse, onClose }: PreviewModalProps) {
  const previewRef = useRef<HTMLDivElement>(null);
  const resumeData = buildResumeData(template);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl flex flex-col w-full max-w-5xl overflow-hidden"
        style={{ maxHeight: '95vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{template.mainsection.name}</h2>
            {template.mainsection.description && (
              <p className="text-xs text-gray-500 mt-0.5">{template.mainsection.description}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onUse(template)}
              disabled={creating}
              className="px-5 py-2 rounded-xl text-sm font-bold text-white shadow-md transition-all disabled:opacity-60 flex items-center gap-2 hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #41017d, #ee14ff)' }}
            >
              {creating && <Loader2 className="w-4 h-4 animate-spin" />}
              Use This Template
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body — scrollable, centered A4 preview */}
        <div className="flex-1 overflow-auto bg-[#f1f5f9] flex justify-center py-8 px-4">
          <div
            style={{
              width: '794px',
              transform: 'scale(0.68)',
              transformOrigin: 'top center',
              marginBottom: 'calc((0.68 - 1) * 1122px)',
            }}
          >
            <ResumePreview
              data={resumeData}
              numPages={1}
              previewRef={previewRef}
              zoomLevel={100}
              isThumbnail={false}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 shrink-0 bg-white">
          <p className="text-xs text-gray-400">Click &ldquo;Use This Template&rdquo; to start editing with your own content.</p>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors border border-gray-200"
            >
              Close
            </button>
            <button
              onClick={() => onUse(template)}
              disabled={creating}
              className="px-5 py-2 rounded-xl text-sm font-bold text-white shadow-md transition-all disabled:opacity-60 flex items-center gap-2 hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #41017d, #ee14ff)' }}
            >
              {creating && <Loader2 className="w-4 h-4 animate-spin" />}
              Use This Template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── CategorySection ──────────────────────────────────────────────────────────
interface CategorySectionProps {
  label: string;
  desc: string;
  templates: TemplateData[];
  selectedId: string | null;
  creatingId: string | null;
  onUse: (t: TemplateData) => void;
  onPreview: (t: TemplateData) => void;
}

function CategorySection({ label, desc, templates, selectedId, creatingId, onUse, onPreview }: CategorySectionProps) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? templates : templates.slice(0, 6);

  return (
    <section className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="px-8 pt-8 pb-2">
        <h2 className="text-xl font-bold text-gray-900 mb-1">{label}</h2>
        <p className="text-sm text-gray-500 max-w-2xl">{desc}</p>
      </div>

      <div className="px-8 pb-8 pt-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-6">
          {visible.map((t) => (
            <TemplateCard
              key={t.mainsection.id}
              template={t}
              selected={selectedId === t.mainsection.id}
              creating={creatingId === t.mainsection.id}
              onUse={onUse}
              onPreview={onPreview}
            />
          ))}
        </div>

        {templates.length > 6 && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => setShowAll((v) => !v)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all"
            >
              {showAll ? 'Show Less' : `See More`}
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showAll ? 'rotate-180' : ''}`} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<TemplateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creatingId, setCreatingId] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<TemplateData | null>(null);

  useEffect(() => {
    fetch('/api/templates')
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setTemplates(json.data?.templates || []);
        else setError('Failed to load templates.');
      })
      .catch(() => setError('Failed to load templates.'))
      .finally(() => setLoading(false));
  }, []);

  const handleUseTemplate = useCallback(async (template: TemplateData) => {
    setSelectedId(template.mainsection.id);
    setCreatingId(template.mainsection.id);
    try {
      const res = await fetch('/api/resumes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${template.mainsection.name} Resume`,
          template: template.mainsection.id,
          design: buildDesign(template),
          content: PREVIEW_CONTENT,
          activeSections: ['summary', 'experience', 'education', 'skills', 'languages', 'certifications', 'projects', 'awards', 'interests'],
        }),
      });
      const data = await res.json();
      const id = data.data?._id || data.resume?._id;
      if (id) router.push(`/resume/${id}`);
    } finally {
      setCreatingId(null);
    }
  }, [router]);

  // Group templates by category, filtered by search + active category
  const grouped = (() => {
    const q = search.toLowerCase();
    const filtered = templates.filter((t) => {
      const matchesSearch = !q || t.mainsection.name.toLowerCase().includes(q);
      const cat = categorize(t);
      const matchesCat = !activeCategory || cat === activeCategory;
      return matchesSearch && matchesCat;
    });
    const map: Record<string, TemplateData[]> = {};
    for (const t of filtered) {
      const cat = categorize(t);
      if (!map[cat]) map[cat] = [];
      map[cat].push(t);
    }
    return map;
  })();

  const totalVisible = Object.values(grouped).reduce((s, a) => s + a.length, 0);

  return (
    <div className="min-h-screen bg-[#f4f6f8]">
      <TemplatesHeader />

      {/* Hero / Search */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Resume Templates</h1>
          <p className="text-gray-500 mb-8 max-w-xl mx-auto text-sm">
            {templates.length > 0 ? `${templates.length} professionally designed templates` : 'Professionally designed templates'} — pick one and start editing instantly.
          </p>

          {/* Search */}
          <div className="relative max-w-md mx-auto mb-6">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ '--tw-ring-color': '#41017d' } as any}
            />
          </div>

          {/* Category pills */}
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                activeCategory === null
                  ? 'text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              style={activeCategory === null ? { background: 'linear-gradient(135deg, #41017d, #ee14ff)' } : {}}
            >
              All Templates
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCategory(activeCategory === c.id ? null : c.id)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                  activeCategory === c.id
                    ? 'text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                style={activeCategory === c.id ? { background: 'linear-gradient(135deg, #41017d, #ee14ff)' } : {}}
              >
                {c.label.replace(' Resume Templates', '')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {loading && (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-8 h-8 animate-spin text-[#41017d]" />
          </div>
        )}

        {error && (
          <div className="text-center py-32 text-red-500 font-medium">{error}</div>
        )}

        {!loading && !error && totalVisible === 0 && (
          <div className="text-center py-32 text-gray-400">
            <p className="text-lg font-medium mb-2">No templates found</p>
            <p className="text-sm">Try a different search term or category.</p>
          </div>
        )}

        {!loading && !error && CATEGORIES.map((cat) => {
          const list = grouped[cat.id];
          if (!list || list.length === 0) return null;
          return (
            <CategorySection
              key={cat.id}
              label={cat.label}
              desc={cat.desc}
              templates={list}
              selectedId={selectedId}
              creatingId={creatingId}
              onUse={handleUseTemplate}
              onPreview={setPreviewTemplate}
            />
          );
        })}
      </div>

      {/* Preview Modal */}
      {previewTemplate && (
        <PreviewModal
          template={previewTemplate}
          creating={creatingId === previewTemplate.mainsection.id}
          onUse={handleUseTemplate}
          onClose={() => setPreviewTemplate(null)}
        />
      )}
    </div>
  );
}
