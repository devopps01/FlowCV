'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, X, Search, ChevronDown, Loader2, Sparkles, Filter, Layout as LayoutIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ResumePreview from '@/components/resume-builder/ResumePreview';
import { TemplatesHeader } from '@/components/layout/TemplatesHeader';
import { Footer } from '@/components/layout/footer';
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
  ],
  education: [
    { id: 'ed1', school: 'Stanford University', degree: 'MS', field: 'Computer Science', graduationYear: '2016' },
  ],
  skills: [
    { id: 's1', name: 'Leadership' }, { id: 's2', name: 'Product Management' },
    { id: 's3', name: 'React' }, { id: 's4', name: 'TypeScript' },
  ],
  languages: [
    { id: 'l1', language: 'English', proficiency: 'Native' },
  ],
  certifications: [
    { id: 'c1', name: 'PMP Certified', issuer: 'PMI', date: '2020', description: '' },
  ],
  projects: [], awards: [], socials: [], courses: [], organisations: [], publications: [], references: [], custom: [], interests: [],
};

const CATEGORIES = [
  { id: 'professional', label: 'Professional', desc: 'Clean, ATS-friendly designs trusted by recruiters worldwide.' },
  { id: 'creative', label: 'Creative', desc: 'Express your personality with colorful, bold templates.' },
  { id: 'executive', label: 'Executive', desc: 'Authoritative designs for senior leadership and C-suite roles.' },
  { id: 'academic', label: 'Academic', desc: 'Scholarly formats for research and academic positions.' },
  { id: 'entry-level', label: 'Entry Level', desc: 'Perfect for students and recent graduates.' },
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
    primaryColor: s.primaryColor || '#41017d',
    secondaryColor: s.secondaryColor || '#f8fafc',
    accentColor: s.accentColor || s.primaryColor || '#41017d',
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
    activeSections: ['summary', 'experience', 'education', 'skills'],
  };
}

// ─── TemplateCard ─────────────────────────────────────────────────────────────
function TemplateCard({ template, selected, creating, onUse, onPreview }: any) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.25);
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
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="group flex flex-col gap-4"
    >
      <div
        ref={cardRef}
        className={`relative rounded-3xl overflow-hidden cursor-pointer transition-all duration-500
          shadow-md hover:shadow-2xl hover:-translate-y-2
          ${selected ? 'ring-4 ring-[var(--app-primary)]' : 'ring-1 ring-[var(--app-border)]'}`}
        style={{ aspectRatio: '210/297', backgroundColor: 'var(--app-bg-card)' }}
      >
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
            zoomLevel={100}
            isThumbnail={true}
          />
        </div>

        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 backdrop-blur-[2px]">
          <button
            onClick={(e) => { e.stopPropagation(); onUse(template); }}
            disabled={creating}
            className="px-6 py-2.5 rounded-2xl text-sm font-black text-white shadow-xl transition-all active:scale-95 disabled:opacity-60 flex items-center gap-2"
            style={{ background: 'linear-gradient(135deg, var(--app-primary), var(--app-secondary))' }}
          >
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <LayoutIcon className="w-4 h-4" />}
            Use Template
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onPreview(template); }}
            className="p-3 rounded-2xl bg-white/90 hover:bg-white text-gray-900 shadow-xl transition-all active:scale-95"
            title="Full Preview"
          >
            <Eye className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="px-2 text-center">
        <h4 className="font-bold text-[var(--app-text)] truncate">{template.mainsection.name}</h4>
        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--app-text-muted)] mt-0.5">{categorize(template)}</p>
      </div>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<TemplateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [creatingId, setCreatingId] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<TemplateData | null>(null);

  useEffect(() => {
    fetch('/api/templates')
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setTemplates(json.data?.templates || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleUseTemplate = async (template: TemplateData) => {
    setCreatingId(template.mainsection.id);
    try {
      const res = await fetch('/api/resumes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `My ${template.mainsection.name} Resume`,
          template: template.mainsection.id,
          design: buildDesign(template),
          content: PREVIEW_CONTENT,
          activeSections: ['summary', 'experience', 'education', 'skills'],
        }),
      });
      const data = await res.json();
      const id = data.data?._id || data.resume?._id;
      if (id) router.push(`/resume/${id}`);
    } finally {
      setCreatingId(null);
    }
  };

  const filteredTemplates = templates.filter((t) => {
    const matchesSearch = !search || t.mainsection.name.toLowerCase().includes(search.toLowerCase());
    const matchesCat = !activeCategory || categorize(t) === activeCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: 'var(--app-bg)', color: 'var(--app-text)' }}>
      <TemplatesHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--app-primary-light)] text-[var(--app-primary)] text-sm font-black mb-6"
          >
            <Sparkles className="w-4 h-4" />
            200+ Premium Templates
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-6xl font-black mb-6 tracking-tight"
          >
            Choose Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--app-primary)] to-[var(--app-secondary)]">Perfect</span> Design
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-[var(--app-text-secondary)] max-w-2xl mx-auto"
          >
            Pick a template that matches your career level and industry. All designs are recruiter-approved and ATS-friendly.
          </motion.p>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-6 mb-12 items-center justify-between sticky top-20 z-30 py-4 px-6 rounded-[2rem] bg-[var(--app-bg-card)] border border-[var(--app-border)] shadow-xl backdrop-blur-xl">
          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-5 py-2 rounded-2xl text-xs font-black transition-all ${!activeCategory ? 'bg-[var(--app-primary)] text-white shadow-lg' : 'hover:bg-[var(--app-bg-gray)] text-[var(--app-text-secondary)]'}`}
            >
              All Designs
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-5 py-2 rounded-2xl text-xs font-black transition-all ${activeCategory === cat.id ? 'bg-[var(--app-primary)] text-white shadow-lg' : 'hover:bg-[var(--app-bg-gray)] text-[var(--app-text-secondary)]'}`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--app-text-muted)]" />
            <input
              type="text"
              placeholder="Search templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[var(--app-bg-gray)] border-none text-sm font-medium focus:ring-2 focus:ring-[var(--app-primary)] transition-all"
            />
          </div>
        </div>

        {/* Templates Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-[var(--app-primary)]" />
            <p className="font-black uppercase tracking-widest text-[10px] text-[var(--app-text-muted)]">Loading Masterpieces...</p>
          </div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 lg:gap-10"
          >
            <AnimatePresence mode="popLayout">
              {filteredTemplates.map((t) => (
                <TemplateCard
                  key={t.mainsection.id}
                  template={t}
                  creating={creatingId === t.mainsection.id}
                  onUse={handleUseTemplate}
                  onPreview={setPreviewTemplate}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && filteredTemplates.length === 0 && (
          <div className="text-center py-32">
            <div className="w-20 h-20 bg-[var(--app-bg-gray)] rounded-full flex items-center justify-center mx-auto mb-6">
              <Filter className="w-10 h-10 text-[var(--app-text-muted)]" />
            </div>
            <h3 className="text-2xl font-black mb-2">No templates found</h3>
            <p className="text-[var(--app-text-secondary)]">Try adjusting your filters or search terms.</p>
          </div>
        )}
      </main>

      {/* Full Screen Preview Modal */}
      <AnimatePresence>
        {previewTemplate && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-8 bg-black/80 backdrop-blur-md"
            onClick={() => setPreviewTemplate(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-5xl h-full bg-[var(--app-bg-card)] rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 sm:px-10 flex items-center justify-between border-b border-[var(--app-border)]">
                <div>
                  <h3 className="text-2xl font-black">{previewTemplate.mainsection.name}</h3>
                  <p className="text-xs font-bold text-[var(--app-text-muted)] uppercase tracking-widest">{categorize(previewTemplate)} Design</p>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleUseTemplate(previewTemplate)}
                    disabled={creatingId === previewTemplate.mainsection.id}
                    className="hidden sm:flex items-center gap-2 px-8 py-3 rounded-2xl font-black text-white shadow-xl hover:scale-105 active:scale-95 transition-all"
                    style={{ background: 'linear-gradient(135deg, var(--app-primary), var(--app-secondary))' }}
                  >
                    {creatingId === previewTemplate.mainsection.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <LayoutIcon className="w-5 h-5" />}
                    Use Template
                  </button>
                  <button 
                    onClick={() => setPreviewTemplate(null)}
                    className="p-3 rounded-2xl bg-[var(--app-bg-gray)] hover:bg-[var(--app-border)] transition-all"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-auto bg-[var(--app-bg-medium)] p-8 flex justify-center">
                 <div className="w-[794px] bg-white shadow-2xl origin-top" style={{ transform: 'scale(0.85)' }}>
                    <ResumePreview
                      data={buildResumeData(previewTemplate)}
                      numPages={1}
                      zoomLevel={100}
                    />
                 </div>
              </div>

              <div className="p-6 sm:hidden border-t border-[var(--app-border)]">
                 <button
                    onClick={() => handleUseTemplate(previewTemplate)}
                    disabled={creatingId === previewTemplate.mainsection.id}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-white shadow-xl"
                    style={{ background: 'linear-gradient(135deg, var(--app-primary), var(--app-secondary))' }}
                  >
                    Use Template
                  </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}

