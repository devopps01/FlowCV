'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { 
  Loader2, Plus, Trash2, Download, MoreVertical, 
  ChevronRight, LayoutDashboard, FileText, Settings, 
  Mail, Target, Globe, User, Bold, Italic, List, Link as LinkIcon,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface CoverLetterData {
  title: string;
  template: string;
  content: {
    personalInfo: {
      fullName: string;
      email: string;
      phone: string;
      location: string;
      professionalTitle: string;
      photo: string;
    };
    date: string;
    recipient: {
      name: string;
      company: string;
      address: string;
    };
    body: string;
    signature: {
      fullName: string;
      place: string;
      date: string;
      image: string;
    };
  };
  design: {
    fontFamily: string;
    primaryColor: string;
  };
}

const defaultData: CoverLetterData = {
  title: 'Letter 1',
  template: 'classic',
  content: {
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      professionalTitle: '',
      photo: '',
    },
    date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
    recipient: {
      name: '',
      company: '',
      address: '',
    },
    body: 'Dear ______,\n\nSincerely,',
    signature: {
      fullName: '',
      place: '',
      date: '',
      image: '',
    },
  },
  design: {
    fontFamily: 'Inter',
    primaryColor: '#ff4d7d',
  },
};

export default function CoverLetterEditorPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<CoverLetterData>(defaultData);
  const [activeTab, setActiveTab] = useState<'write' | 'customize'>('write');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user && id) {
      fetchData();
    }
  }, [session, id]);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/cover-letters/${id}`);
      if (!res.ok) {
        router.push('/cover-letters');
        return;
      }
      const json = await res.json();
      if (json.coverLetter) {
        // Deep merge with default data to ensure all fields exist
        setData({
          ...defaultData,
          ...json.coverLetter,
          content: {
            ...defaultData.content,
            ...(json.coverLetter.content || {}),
            personalInfo: {
              ...defaultData.content.personalInfo,
              ...(json.coverLetter.content?.personalInfo || {}),
            },
            recipient: {
              ...defaultData.content.recipient,
              ...(json.coverLetter.content?.recipient || {}),
            },
            signature: {
              ...defaultData.content.signature,
              ...(json.coverLetter.content?.signature || {}),
            },
          },
          design: {
            ...defaultData.design,
            ...(json.coverLetter.design || {}),
          }
        });
      }
    } catch (error) {
      console.error('Failed to fetch cover letter:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveContent = useCallback(async (updatedData: CoverLetterData) => {
    setSaving(true);
    try {
      // Generate preview image
      const element = document.getElementById('letter-preview');
      let previewImage = '';
      if (element) {
        const canvas = await html2canvas(element, { 
          scale: 0.8, // Better scale for readability
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          windowWidth: 1200, // Fixed width for consistent preview
        });
        previewImage = canvas.toDataURL('image/jpeg', 0.7); // Better quality
      }

      await fetch(`/api/cover-letters/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...updatedData,
          previewImage
        }),
      });
    } catch (error) {
      console.error('Failed to save:', error);
      toast.error('Failed to auto-save');
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

  const updateNested = (path: string, value: string) => {
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
      const res = await fetch('/api/ai/generate-cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personalInfo: data.content.personalInfo,
          recipient: data.content.recipient,
        }),
      });
      const json = await res.json();
      if (json.content) {
        updateNested('content.body', json.content);
        toast.success('AI content generated!');
      }
    } catch (error) {
      console.error('AI generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const exportPDF = async () => {
    const element = document.getElementById('letter-preview');
    if (!element) return;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${data.title}.pdf`);
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
          <Link href="/cover-letters" className="flex items-center gap-2 mb-10 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ff4d7d]">
              <Mail className="h-5 w-5 text-white" />
            </div>
            <span className="hidden lg:block text-xl font-bold text-gray-900 tracking-tight">flowcv</span>
          </Link>
          <nav className="space-y-1">
            <button onClick={() => router.push('/dashboard')} className="flex w-full items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all">
              <LayoutDashboard className="h-5 w-5" />
              <span className="hidden lg:block">Dashboard</span>
            </button>
            <button onClick={() => setActiveTab('write')} className={`flex w-full items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all ${activeTab === 'write' ? 'bg-[#fff0f3] text-[#ff4d7d]' : 'text-gray-500'}`}>
              <FileText className="h-5 w-5" />
              <span className="hidden lg:block">Write</span>
            </button>
            <button onClick={() => setActiveTab('customize')} className={`flex w-full items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all ${activeTab === 'customize' ? 'bg-[#fff0f3] text-[#ff4d7d]' : 'text-gray-500'}`}>
              <Settings className="h-5 w-5" />
              <span className="hidden lg:block">Customize</span>
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
            <h2 className="font-bold text-gray-900">{data.title}</h2>
            {saving && <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest animate-pulse">Saving...</span>}
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => saveContent(data)} 
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 text-sm font-bold rounded-xl hover:bg-gray-50 transition-all"
            >
              <Sparkles className="h-4 w-4" />
              Update Preview
            </button>
            <button onClick={exportPDF} className="flex items-center gap-2 px-6 py-2 bg-[#1a1a1a] text-white text-sm font-bold rounded-xl hover:bg-black transition-all shadow-lg">
              <Download className="h-4 w-4" />
              Download
            </button>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* Editor */}
          <div className="flex-1 overflow-y-auto bg-[#fdfcfb] p-8 lg:p-12">
            <div className="max-w-2xl mx-auto space-y-10">
              <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                <input type="checkbox" className="w-4 h-4 rounded text-[#ff4d7d] focus:ring-[#ff4d7d]" />
                <span className="text-sm font-medium text-gray-600">Sync personal details & design with one of your resumes.</span>
              </div>

              {/* Personal Details */}
              <section className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100 space-y-8">
                <h3 className="text-2xl font-bold text-gray-900">Personal Details</h3>
                <div className="flex gap-10">
                  <div className="flex-1 space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Full name</label>
                      <Input value={data?.content?.personalInfo?.fullName || ''} onChange={e => updateNested('content.personalInfo.fullName', e.target.value)} placeholder="Enter your title, first- and last name" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Professional title</label>
                      <Input value={data?.content?.personalInfo?.professionalTitle || ''} onChange={e => updateNested('content.personalInfo.professionalTitle', e.target.value)} placeholder="Target position or current role" />
                    </div>
                  </div>
                  <div className="w-32 h-32 rounded-full bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-300">
                    <User className="h-10 w-10" />
                    <span className="text-[10px] font-bold mt-1">Photo</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email</label>
                    <Input value={data?.content?.personalInfo?.email || ''} onChange={e => updateNested('content.personalInfo.email', e.target.value)} placeholder="Enter email" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Phone</label>
                    <Input value={data?.content?.personalInfo?.phone || ''} onChange={e => updateNested('content.personalInfo.phone', e.target.value)} placeholder="Enter Phone" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Location</label>
                  <Input value={data?.content?.personalInfo?.location || ''} onChange={e => updateNested('content.personalInfo.location', e.target.value)} placeholder="City, Country" />
                </div>
              </section>

              {/* Date */}
              <section className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Date</h3>
                <Input value={data?.content?.date || ''} onChange={e => updateNested('content.date', e.target.value)} />
              </section>

              {/* Recipient */}
              <section className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100 space-y-8">
                <h3 className="text-2xl font-bold text-gray-900">Recipient Details</h3>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Recipient Name</label>
                  <Input value={data?.content?.recipient?.name || ''} onChange={e => updateNested('content.recipient.name', e.target.value)} placeholder="Enter name of recipient/department" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Company Name</label>
                  <Input value={data?.content?.recipient?.company || ''} onChange={e => updateNested('content.recipient.company', e.target.value)} placeholder="Enter Company Name" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Address</label>
                  <Input value={data?.content?.recipient?.address || ''} onChange={e => updateNested('content.recipient.address', e.target.value)} placeholder="Enter Company Address" />
                </div>
              </section>

              {/* Body */}
              <section className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100 space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-gray-900">Body</h3>
                  <button 
                    onClick={generateAIContent}
                    disabled={isGenerating}
                    className="flex items-center gap-2 px-4 py-2 bg-[#ff4d7d] text-white text-xs font-bold rounded-xl hover:bg-[#ff3366] transition-all disabled:opacity-50"
                  >
                    {isGenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                    AI Generate
                  </button>
                </div>
                <div className="border border-gray-100 rounded-xl overflow-hidden">
                  <div className="flex items-center gap-1 p-2 bg-gray-50 border-b border-gray-100">
                    <button className="p-2 hover:bg-white rounded-lg"><Bold className="h-4 w-4" /></button>
                    <button className="p-2 hover:bg-white rounded-lg"><Italic className="h-4 w-4" /></button>
                    <button className="p-2 hover:bg-white rounded-lg"><List className="h-4 w-4" /></button>
                    <button className="p-2 hover:bg-white rounded-lg"><LinkIcon className="h-4 w-4" /></button>
                  </div>
                  <Textarea 
                    value={data?.content?.body || ''} 
                    onChange={e => updateNested('content.body', e.target.value)} 
                    className="min-h-[300px] border-none focus-visible:ring-0 rounded-none p-6 text-base leading-relaxed"
                  />
                </div>
              </section>

              {/* Signature */}
              <section className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100 space-y-8">
                <h3 className="text-2xl font-bold text-gray-900">Signature</h3>
                <button className="flex items-center gap-2 px-6 py-2 border border-gray-200 rounded-xl text-xs font-bold hover:bg-gray-50">
                  <Plus className="h-4 w-4" /> Create / Upload
                </button>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Full name</label>
                  <Input value={data?.content?.signature?.fullName || ''} onChange={e => updateNested('content.signature.fullName', e.target.value)} placeholder="Enter full name" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Place</label>
                    <Input value={data?.content?.signature?.place || ''} onChange={e => updateNested('content.signature.place', e.target.value)} placeholder="Enter place" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Date</label>
                    <Input value={data?.content?.signature?.date || ''} onChange={e => updateNested('content.signature.date', e.target.value)} placeholder="Enter date" />
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* Preview */}
          <div className="hidden xl:flex w-[45%] bg-gray-200/50 items-center justify-center p-12 overflow-hidden relative">
            <div id="letter-preview" className="w-full aspect-[1/1.414] bg-white shadow-2xl p-16 flex flex-col gap-10 font-serif overflow-hidden">
              <div className="text-right text-sm text-gray-500">{data?.content?.date}</div>
              <div className="space-y-1">
                <div className="font-bold text-xl">{data?.content?.personalInfo?.fullName}</div>
                <div>{data?.content?.personalInfo?.professionalTitle}</div>
                <div className="text-sm">{data?.content?.personalInfo?.email} | {data?.content?.personalInfo?.phone}</div>
                <div className="text-sm">{data?.content?.personalInfo?.location}</div>
              </div>
              <div className="mt-8 space-y-1">
                <div className="font-bold">To:</div>
                <div>{data?.content?.recipient?.name}</div>
                <div>{data?.content?.recipient?.company}</div>
                <div>{data?.content?.recipient?.address}</div>
              </div>
              <div className="flex-1 whitespace-pre-wrap text-base leading-relaxed mt-8">
                {data?.content?.body}
              </div>
              <div className="mt-12 space-y-1">
                <div>{data?.content?.signature?.place}, {data?.content?.signature?.date}</div>
                <div className="font-bold text-lg mt-4">{data?.content?.signature?.fullName}</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
