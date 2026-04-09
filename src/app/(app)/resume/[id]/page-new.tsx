'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { 
  Loader2, Sparkles, Download, ArrowLeft, LayoutDashboard,
  Mail, Settings, User, Palette, FileText
} from 'lucide-react';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';
import type { FullResumeOutput } from '@/lib/resume-generator/types';

const FabricCanvas = dynamic(
  () => import('@/components/canvas/FabricCanvas').then(mod => mod.FabricCanvas),
  { ssr: false, loading: () => <div className="flex items-center justify-center h-full">Loading Canvas...</div> }
);

interface ResumeData {
  title: string;
  template: string;
  content: {
    personalInfo: {
      fullName: string;
      email: string;
      phone: string;
      location: string;
      professionalTitle: string;
      summary: string;
    };
    experience: Array<{
      company: string;
      position: string;
      startDate: string;
      endDate: string;
      description: string;
    }>;
    education: Array<{
      school: string;
      degree: string;
      field: string;
      graduationYear: string;
    }>;
    skills: string[];
  };
  design: {
    primaryColor: string;
    fontFamily: string;
  };
}

const defaultData: ResumeData = {
  title: 'Resume 1',
  template: 'modern',
  content: {
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      professionalTitle: '',
      summary: '',
    },
    experience: [],
    education: [],
    skills: [],
  },
  design: {
    primaryColor: '#2563eb',
    fontFamily: 'Inter',
  },
};

export default function ResumeEditorPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<ResumeData>(defaultData);
  const [activeTab, setActiveTab] = useState<'content' | 'design'>('content');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user && id) {
      fetchData();
    } else if (!id) {
      setLoading(false);
    }
  }, [session, id]);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/resumes/${id}`);
      if (!res.ok) {
        router.push('/dashboard');
        return;
      }
      const json = await res.json();
      if (json.resume) {
        setData({
          ...defaultData,
          ...json.resume,
          content: {
            ...defaultData.content,
            ...(json.resume.content || {}),
            personalInfo: {
              ...defaultData.content.personalInfo,
              ...(json.resume.content?.personalInfo || {}),
            },
          },
          design: {
            ...defaultData.design,
            ...(json.resume.design || {}),
          }
        });
      }
    } catch (error) {
      console.error('Failed to fetch resume:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveContent = useCallback(async (updatedData: ResumeData) => {
    setSaving(true);
    try {
      await fetch(`/api/resumes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
      toast.success('Resume saved!');
    } catch (error) {
      console.error('Failed to save:', error);
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  }, [id]);

  useEffect(() => {
    if (!id || loading) return;
    const timer = setTimeout(() => {
      saveContent(data);
    }, 1000);
    return () => clearTimeout(timer);
  }, [data, id, loading, saveContent]);

  const updateNested = (path: string, value: any) => {
    const keys = path.split('.');
    setData(prev => {
      const newData = JSON.parse(JSON.stringify(prev));
      let current = newData;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const generateAIContent = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/ai/generate-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personalInfo: data.content.personalInfo,
          role: data.content.personalInfo.professionalTitle,
        }),
      });
      const json = await res.json();
      if (json.content) {
        setData(prev => ({
          ...prev,
          content: {
            ...prev.content,
            ...json.content,
          }
        }));
        toast.success('AI content generated!');
      }
    } catch (error) {
      console.error('AI generation failed:', error);
      toast.error('Failed to generate AI content');
    } finally {
      setIsGenerating(false);
    }
  };

  const exportPDF = async () => {
    const element = document.getElementById('resume-preview');
    if (!element) return;
    
    const html2canvas = (await import('html2canvas')).default;
    const jsPDF = (await import('jspdf')).default;
    
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${data.title}.pdf`);
    toast.success('PDF downloaded!');
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfcfb]">
        <Loader2 className="h-8 w-8 animate-spin text-[#ff4d7d]" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#fdfcfb] overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-20 lg:w-64 flex flex-col border-r border-gray-100 bg-white z-30">
        <div className="p-6">
          <Link href="/dashboard" className="flex items-center gap-2 mb-10 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#ff4d7d]">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <span className="hidden lg:block text-xl font-bold text-gray-900 tracking-tight">flowcv</span>
          </Link>
          <nav className="space-y-1">
            <button onClick={() => router.push('/dashboard')} className="flex w-full items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all">
              <LayoutDashboard className="h-5 w-5" />
              <span className="hidden lg:block">Dashboard</span>
            </button>
            <button onClick={() => setActiveTab('content')} className={`flex w-full items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all ${activeTab === 'content' ? 'bg-[#fff0f3] text-[#ff4d7d]' : 'text-gray-500'}`}>
              <Mail className="h-5 w-5" />
              <span className="hidden lg:block">Content</span>
            </button>
            <button onClick={() => setActiveTab('design')} className={`flex w-full items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all ${activeTab === 'design' ? 'bg-[#fff0f3] text-[#ff4d7d]' : 'text-gray-500'}`}>
              <Palette className="h-5 w-5" />
              <span className="hidden lg:block">Design</span>
            </button>
          </nav>
        </div>
        <div className="mt-auto p-6 border-t border-gray-50">
          <button className="flex w-full items-center gap-3 px-4 py-2 text-sm font-semibold text-gray-500 hover:text-gray-900">
            <User className="h-5 w-5 text-gray-400" />
            <span className="hidden lg:block">My account</span>
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 z-20">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/dashboard')} className="p-2 hover:bg-gray-100 rounded-xl transition-all">
              <ArrowLeft className="h-5 w-5 text-gray-400" />
            </button>
            <h2 className="font-bold text-gray-900">{data.title}</h2>
            {saving && <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest animate-pulse">Saving...</span>}
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={generateAIContent}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 text-sm font-bold rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
            >
              {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              AI Generate
            </button>
            <button onClick={exportPDF} className="flex items-center gap-2 px-6 py-2 bg-[#1a1a1a] text-white text-sm font-bold rounded-xl hover:bg-black transition-all shadow-lg">
              <Download className="h-4 w-4" />
              Download PDF
            </button>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* Editor */}
          <div className="flex-1 overflow-y-auto bg-[#fdfcfb] p-8 lg:p-12">
            <div className="max-w-2xl mx-auto space-y-10">
              
              {activeTab === 'content' && (
                <>
                  {/* Personal Details */}
                  <section className="bg-white rounded-xl p-10 shadow-sm border border-gray-100 space-y-8">
                    <h3 className="text-2xl font-bold text-gray-900">Personal Information</h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Full Name</label>
                        <input 
                          type="text"
                          value={data.content.personalInfo.fullName || ''}
                          onChange={e => updateNested('content.personalInfo.fullName', e.target.value)}
                          placeholder="Enter your full name"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff4d7d] focus:border-transparent"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Professional Title</label>
                        <input 
                          type="text"
                          value={data.content.personalInfo.professionalTitle || ''}
                          onChange={e => updateNested('content.personalInfo.professionalTitle', e.target.value)}
                          placeholder="e.g., Software Engineer"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff4d7d] focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email</label>
                        <input 
                          type="email"
                          value={data.content.personalInfo.email || ''}
                          onChange={e => updateNested('content.personalInfo.email', e.target.value)}
                          placeholder="your@email.com"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff4d7d] focus:border-transparent"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Phone</label>
                        <input 
                          type="tel"
                          value={data.content.personalInfo.phone || ''}
                          onChange={e => updateNested('content.personalInfo.phone', e.target.value)}
                          placeholder="+1 (555) 123-4567"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff4d7d] focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Location</label>
                      <input 
                        type="text"
                        value={data.content.personalInfo.location || ''}
                        onChange={e => updateNested('content.personalInfo.location', e.target.value)}
                        placeholder="City, Country"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff4d7d] focus:border-transparent"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Professional Summary</label>
                      <textarea 
                        value={data.content.personalInfo.summary || ''}
                        onChange={e => updateNested('content.personalInfo.summary', e.target.value)}
                        placeholder="Write a compelling summary about yourself..."
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff4d7d] focus:border-transparent resize-none"
                      />
                    </div>
                  </section>

                  {/* Experience */}
                  <section className="bg-white rounded-xl p-10 shadow-sm border border-gray-100 space-y-8">
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-bold text-gray-900">Work Experience</h3>
                      <button 
                        onClick={() => updateNested('content.experience', [...data.content.experience, { company: '', position: '', startDate: '', endDate: '', description: '' }])}
                        className="flex items-center gap-2 px-4 py-2 bg-[#ff4d7d] text-white text-xs font-bold rounded-xl hover:bg-[#ff3366] transition-all"
                      >
                        Add Position
                      </button>
                    </div>
                    
                    {data.content.experience.map((exp, index) => (
                      <div key={index} className="space-y-4 p-6 bg-gray-50 rounded-xl">
                        <div className="grid grid-cols-2 gap-4">
                          <input 
                            type="text"
                            value={exp.company || ''}
                            onChange={e => updateNested(`content.experience[${index}].company`, e.target.value)}
                            placeholder="Company"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff4d7d]"
                          />
                          <input 
                            type="text"
                            value={exp.position || ''}
                            onChange={e => updateNested(`content.experience[${index}].position`, e.target.value)}
                            placeholder="Position"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff4d7d]"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <input 
                            type="text"
                            value={exp.startDate || ''}
                            onChange={e => updateNested(`content.experience[${index}].startDate`, e.target.value)}
                            placeholder="Start Date"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff4d7d]"
                          />
                          <input 
                            type="text"
                            value={exp.endDate || ''}
                            onChange={e => updateNested(`content.experience[${index}].endDate`, e.target.value)}
                            placeholder="End Date"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff4d7d]"
                          />
                        </div>
                        <textarea 
                          value={exp.description || ''}
                          onChange={e => updateNested(`content.experience[${index}].description`, e.target.value)}
                          placeholder="Describe your responsibilities and achievements..."
                          rows={3}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff4d7d] resize-none"
                        />
                      </div>
                    ))}
                  </section>

                  {/* Skills */}
                  <section className="bg-white rounded-xl p-10 shadow-sm border border-gray-100 space-y-8">
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-bold text-gray-900">Skills</h3>
                      <button 
                        onClick={() => updateNested('content.skills', [...data.content.skills, 'New Skill'])}
                        className="flex items-center gap-2 px-4 py-2 bg-[#ff4d7d] text-white text-xs font-bold rounded-xl hover:bg-[#ff3366] transition-all"
                      >
                        Add Skill
                      </button>
                    </div>
                    <div className="space-y-3">
                      {data.content.skills.map((skill, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <input 
                            type="text"
                            value={skill || ''}
                            onChange={e => updateNested(`content.skills[${index}]`, e.target.value)}
                            placeholder="Skill name"
                            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff4d7d]"
                          />
                          <button 
                            onClick={() => updateNested('content.skills', data.content.skills.filter((_, i) => i !== index))}
                            className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                          >
                            Delete
                          </button>
                        </div>
                      ))}
                    </div>
                  </section>
                </>
              )}

              {activeTab === 'design' && (
                <section className="bg-white rounded-xl p-10 shadow-sm border border-gray-100 space-y-8">
                  <h3 className="text-2xl font-bold text-gray-900">Design Settings</h3>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Primary Color</label>
                    <div className="flex items-center gap-4">
                      <input 
                        type="color"
                        value={data.design.primaryColor}
                        onChange={e => updateNested('design.primaryColor', e.target.value)}
                        className="w-16 h-12 rounded-xl border border-gray-200 cursor-pointer"
                      />
                      <input 
                        type="text"
                        value={data.design.primaryColor}
                        onChange={e => updateNested('design.primaryColor', e.target.value)}
                        className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff4d7d]"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Font Family</label>
                    <select 
                      value={data.design.fontFamily}
                      onChange={e => updateNested('design.fontFamily', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff4d7d]"
                    >
                      <option value="Inter">Inter</option>
                      <option value="Roboto">Roboto</option>
                      <option value="Lato">Lato</option>
                      <option value="Playfair Display">Playfair Display</option>
                      <option value="Montserrat">Montserrat</option>
                    </select>
                  </div>
                </section>
              )}
            </div>
          </div>

          {/* Preview */}
          <div className="hidden xl:flex w-[45%] bg-gray-200/50 items-center justify-center p-12 overflow-hidden relative">
            <div id="resume-preview" className="w-full aspect-[1/1.414] bg-white shadow-2xl p-12 overflow-hidden" style={{ fontFamily: data.design.fontFamily }}>
              {/* Header */}
              <div className="border-b-2 pb-6 mb-8" style={{ borderColor: data.design.primaryColor }}>
                <h1 className="text-4xl font-bold mb-2" style={{ color: data.design.primaryColor }}>{data.content.personalInfo.fullName || 'Your Name'}</h1>
                <p className="text-lg text-gray-600">{data.content.personalInfo.professionalTitle || 'Professional Title'}</p>
                <div className="flex gap-4 mt-3 text-sm text-gray-500">
                  <span>{data.content.personalInfo.email}</span>
                  <span>|</span>
                  <span>{data.content.personalInfo.phone}</span>
                  <span>|</span>
                  <span>{data.content.personalInfo.location}</span>
                </div>
              </div>

              {/* Summary */}
              {data.content.personalInfo.summary && (
                <div className="mb-8">
                  <h2 className="text-lg font-bold mb-3 uppercase tracking-wide" style={{ color: data.design.primaryColor }}>Summary</h2>
                  <p className="text-gray-700 leading-relaxed">{data.content.personalInfo.summary}</p>
                </div>
              )}

              {/* Experience */}
              {data.content.experience.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-lg font-bold mb-4 uppercase tracking-wide" style={{ color: data.design.primaryColor }}>Experience</h2>
                  <div className="space-y-4">
                    {data.content.experience.map((exp, i) => (
                      <div key={i}>
                        <div className="flex justify-between mb-1">
                          <h3 className="font-bold text-gray-900">{exp.position}</h3>
                          <span className="text-sm text-gray-500">{exp.startDate} - {exp.endDate}</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{exp.company}</p>
                        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills */}
              {data.content.skills.length > 0 && (
                <div>
                  <h2 className="text-lg font-bold mb-4 uppercase tracking-wide" style={{ color: data.design.primaryColor }}>Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {data.content.skills.map((skill, i) => (
                      <span 
                        key={i}
                        className="px-4 py-2 rounded-xl text-sm font-medium"
                        style={{ backgroundColor: `${data.design.primaryColor}20`, color: data.design.primaryColor }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
