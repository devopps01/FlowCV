'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Plus, FileText, Loader2, MoreVertical, Trash2, Copy, 
  ExternalLink, LayoutDashboard, Mail, Target, Settings, 
  CreditCard, GraduationCap, User, LogOut, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import ResumePreview from '@/components/resume-builder/ResumePreview';
import { ResumeData } from '@/components/resume-builder/types';
import { useRef } from 'react';

interface Resume extends ResumeData {
  _id: string;
  updatedAt: string;
  isPublic: boolean;
  shareSlug: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      fetchResumes();
    }
  }, [session]);

  const fetchResumes = async () => {
    try {
      const res = await fetch('/api/resumes');
      const data = await res.json();
      setResumes(data.resumes || []);
    } catch (error) {
      console.error('Failed to fetch resumes:', error);
    } finally {
      setLoading(false);
    }
  };

  const createResume = async () => {
    setCreating(true);
    try {
      const res = await fetch('/api/resumes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'My Resume', template: 'classic' }),
      });
      const data = await res.json();
      if (data.resume?._id) {
        toast.success('Resume created!');
        router.push(`/resume/${data.resume._id}`);
      }
    } catch (error) {
      console.error('Failed to create resume:', error);
      setCreating(false);
    }
  };

  const deleteResume = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resume?')) return;
    try {
      await fetch(`/api/resumes/${id}`, { method: 'DELETE' });
      setResumes(resumes.filter(r => r._id !== id));
      setMenuOpen(null);
      toast.success('Resume deleted');
    } catch (error) {
      console.error('Failed to delete resume:', error);
    }
  };

  const duplicateResume = async (resume: Resume) => {
    try {
      const res = await fetch('/api/resumes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: `${resume.title} (Copy)`, template: resume.template }),
      });
      const data = await res.json();
      if (data.resume?._id) {
        router.push(`/resume/${data.resume._id}`);
      }
    } catch (error) {
      console.error('Failed to duplicate resume:', error);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfcfb]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!session) return null;

  const sidebarLinks = [
    { name: 'Resume', icon: FileText, href: '/dashboard', active: pathname === '/dashboard' },
    { name: 'Cover Letter', icon: Mail, href: '/cover-letters', active: pathname === '/cover-letters' },
    { name: 'Job Tracker', icon: Target, href: '/job-tracker', active: pathname === '/job-tracker' },
    { name: 'More', icon: Plus, href: '#' },
  ];

  const bottomLinks = [
    { name: 'Plans & Pricing', icon: CreditCard, href: '/pricing' },
    { name: 'Student Benefits', icon: GraduationCap, href: '#' },
  ];

  return (
    <div className="flex min-h-screen bg-[#fdfcfb]">
      {/* Sidebar */}
      <aside className="w-64 flex flex-col fixed inset-y-0 border-r border-gray-100 bg-white/50 backdrop-blur-md z-20">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2 mb-10">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ff4d7d]">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">flowcv</span>
          </Link>

          <nav className="space-y-1">
            {sidebarLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                  link.active 
                    ? 'bg-white text-gray-900 shadow-sm border border-gray-100' 
                    : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                <link.icon className={`h-5 w-5 ${link.active ? 'text-[#ff4d7d]' : 'text-gray-400'}`} />
                {link.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 space-y-1 border-t border-gray-50">
          {bottomLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-white/50 rounded-xl transition-all"
            >
              <link.icon className="h-5 w-5 text-gray-400" />
              {link.name}
            </Link>
          ))}
          <button className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-white/50 rounded-xl transition-all">
            <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center">
              <User className="h-4 w-4 text-gray-400" />
            </div>
            My account
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h1 className="text-4xl font-bold text-[#1a1a1a] mb-2 tracking-tight">Start building your resume</h1>
              <p className="text-gray-500 text-lg">Choose a design you like. You can customize or switch it later.</p>
            </div>
            <button
              onClick={createResume}
              className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:shadow-md transition-all group"
            >
              <Plus className="h-4 w-4 text-gray-400 group-hover:text-gray-900" />
              Import existing resume
            </button>
          </div>

          {/* Filter Chips */}
          <div className="flex gap-3 mb-12">
            <Link
              href="/templates"
              className="px-6 py-2 rounded-full text-sm font-medium border bg-white border-gray-200 text-gray-900 shadow-sm transition-all hover:shadow-md"
            >
              Browse All Templates
            </Link>
            {['All Templates', 'Simple', 'Modern', 'Creative'].map((label, i) => (
              <button
                key={label}
                className={`px-6 py-2 rounded-full text-sm font-medium border transition-all ${
                  i === 0 
                    ? 'bg-white border-gray-200 text-gray-900 shadow-sm' 
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Resumes Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {/* New Resume Button */}
            <button
              onClick={createResume}
              className="group aspect-[3/4.2] border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-4 hover:border-[#ff4d7d] hover:bg-white transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-[#fff0f3] transition-all">
                <Plus className="h-6 w-6 text-gray-400 group-hover:text-[#ff4d7d]" />
              </div>
              <span className="text-sm font-semibold text-gray-500 group-hover:text-gray-900">New resume</span>
            </button>

            {resumes.map((resume) => (
              <div key={resume._id} className="group flex flex-col">
                <div className="relative aspect-[3/4.2] bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1">
                  {/* Real Preview or Fallback */}
                  {/* Actual High-Fidelity Preview */}
                  <div className="w-full h-full pointer-events-none select-none scale-[0.34] origin-top-left">
                     <ResumePreview
                        data={resume}
                        numPages={1}
                        previewRef={{ current: null } as any}
                        zoomLevel={100}
                        isThumbnail={true}
                     />
                  </div>

                  {/* Hover Actions */}
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Link
                      href={`/resume/${resume._id}`}
                      className="px-6 py-3 bg-white text-gray-900 rounded-xl font-bold shadow-lg transform scale-90 group-hover:scale-100 transition-transform"
                    >
                      Edit resume
                    </Link>
                  </div>
                </div>
                
                <div className="mt-4 flex items-center justify-between px-2">
                  <div>
                    <h3 className="font-bold text-gray-900 uppercase tracking-widest text-[10px] mb-1">{resume.title}</h3>
                    <p className="text-[10px] text-gray-400 font-medium uppercase mt-1">
                      Edited {new Date(resume.updatedAt).toLocaleDateString()} • {resume.template}
                    </p>
                  </div>
                  <button 
                    onClick={() => setMenuOpen(menuOpen === resume._id ? null : resume._id)}
                    className="p-2 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-100 transition-all"
                  >
                    <MoreVertical className="h-4 w-4 text-gray-400" />
                  </button>
                </div>

                {menuOpen === resume._id && (
                  <div className="mt-2 mx-2 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-in fade-in slide-in-from-top-2">
                    <button
                      onClick={() => duplicateResume(resume)}
                      className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      <Copy className="h-4 w-4" />
                      Duplicate
                    </button>
                    <button
                      onClick={() => deleteResume(resume._id)}
                      className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
