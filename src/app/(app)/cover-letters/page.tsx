'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Plus, FileText, Loader2, MoreVertical, Trash2, Copy, 
  Mail, Target, CreditCard, GraduationCap, User
} from 'lucide-react';
import toast from 'react-hot-toast';

interface CoverLetter {
  _id: string;
  title: string;
  template: string;
  updatedAt: string;
  previewImage?: string;
  content?: {
    personalInfo?: {
      fullName?: string;
      email?: string;
      phone?: string;
      professionalTitle?: string;
      location?: string;
    };
    date?: string;
    recipient?: {
      name?: string;
      company?: string;
      address?: string;
    };
    body?: string;
    signature?: {
      fullName?: string;
    };
  };
}

export default function CoverLettersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [coverLetters, setCoverLetters] = useState<CoverLetter[]>([]);
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
      fetchCoverLetters();
    }
  }, [session]);

  const fetchCoverLetters = async () => {
    try {
      const res = await fetch('/api/cover-letters');
      const data = await res.json();
      setCoverLetters(data.coverLetters || []);
    } catch (error) {
      console.error('Failed to fetch cover letters:', error);
      toast.error('Failed to load cover letters');
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const updated = new Date(date);
    const diffInMs = now.getTime() - updated.getTime();
    const diffInHrs = Math.floor(diffInMs / (1000 * 60 * 60));
    
    if (diffInHrs < 1) {
      const diffInMins = Math.floor(diffInMs / (1000 * 60));
      return `${diffInMins} mins ago`;
    }
    if (diffInHrs < 24) {
      return `${diffInHrs} hrs ago`;
    }
    return `${Math.floor(diffInHrs / 24)} days ago`;
  };

  const createCoverLetter = async () => {
    setCreating(true);
    try {
      const res = await fetch('/api/cover-letters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Letter 1', template: 'classic' }),
      });
      const data = await res.json();
      if (data.coverLetter?._id) {
        toast.success('Cover letter created!');
        // Redirect to editor - assuming same pattern as resume
        router.push(`/cover-letter/${data.coverLetter._id}`);
      }
    } catch (error) {
      console.error('Failed to create cover letter:', error);
      setCreating(false);
    }
  };

  const deleteCoverLetter = async (id: string) => {
    if (!confirm('Are you sure you want to delete this cover letter?')) return;
    try {
      await fetch(`/api/cover-letters/${id}`, { method: 'DELETE' });
      setCoverLetters(coverLetters.filter(cl => cl._id !== id));
      setMenuOpen(null);
      toast.success('Cover letter deleted');
    } catch (error) {
      console.error('Failed to delete cover letter:', error);
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
    { name: 'Resume', icon: FileText, href: '/dashboard' },
    { name: 'Cover Letter', icon: Mail, href: '/cover-letters', active: true },
    { name: 'Job Tracker', icon: Target, href: '/job-tracker' },
    { name: 'More', icon: Plus, href: '#' },
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
          <Link href="/pricing" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-white/50 rounded-xl transition-all">
            <CreditCard className="h-5 w-5 text-gray-400" />
            Plans & Pricing
          </Link>
          <Link href="#" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-white/50 rounded-xl transition-all">
            <GraduationCap className="h-5 w-5 text-gray-400" />
            Student Benefits
          </Link>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-12">My Cover Letters</h1>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {/* New Letter Button */}
            <button
              onClick={createCoverLetter}
              disabled={creating}
              className="group aspect-[3/4.2] border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-4 hover:border-[#ff4d7d] hover:bg-white transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-[#fff0f3] transition-all">
                {creating ? (
                  <Loader2 className="h-6 w-6 text-[#ff4d7d] animate-spin" />
                ) : (
                  <Plus className="h-6 w-6 text-gray-400 group-hover:text-[#ff4d7d]" />
                )}
              </div>
              <span className="text-sm font-semibold text-gray-500 group-hover:text-gray-900">New letter</span>
            </button>

            {coverLetters.map((letter) => (
              <div key={letter._id} className="group flex flex-col">
                <div className="relative aspect-[3/4.2] bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1">
                  {/* Preview Image */}
                  {letter.previewImage ? (
                     <div className="relative w-full h-full">
                       <img 
                         src={letter.previewImage} 
                         alt={letter.title} 
                         className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                         loading="lazy"
                       />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                     </div>
                   ) : (
                      /* Real Data Fallback Preview (No dummy text) */
                      <div className="p-6 h-full flex flex-col gap-3 bg-white text-[8px] font-serif overflow-hidden select-none">
                        <div className="text-right text-gray-400 mb-2">{letter.content?.date}</div>
                        
                        <div className="space-y-0.5">
                          <div className="font-bold text-gray-900 text-[10px]">{letter.content?.personalInfo?.fullName}</div>
                          <div className="text-gray-600">{letter.content?.personalInfo?.professionalTitle}</div>
                          <div className="text-gray-400">
                            {letter.content?.personalInfo?.email} {letter.content?.personalInfo?.phone && `| ${letter.content.personalInfo.phone}`}
                          </div>
                        </div>

                        <div className="mt-4 space-y-0.5">
                          <div className="font-bold text-gray-900">To:</div>
                          <div className="text-gray-700">{letter.content?.recipient?.name}</div>
                          <div className="text-gray-600">{letter.content?.recipient?.company}</div>
                          <div className="text-gray-500">{letter.content?.recipient?.address}</div>
                        </div>

                        <div className="mt-4 flex-1 text-gray-700 leading-relaxed line-clamp-[12] whitespace-pre-wrap">
                          {letter.content?.body}
                        </div>

                        <div className="mt-auto pt-4 border-t border-gray-50 flex flex-col gap-1">
                          <div className="font-bold text-gray-900">{letter.content?.signature?.fullName}</div>
                        </div>
                      </div>
                    )}
                  
                  {/* Hover Actions */}
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Link
                      href={`/cover-letter/${letter._id}`}
                      className="px-6 py-3 bg-white text-gray-900 rounded-xl font-bold shadow-lg transform scale-90 group-hover:scale-100 transition-transform"
                    >
                      Edit letter
                    </Link>
                  </div>
                </div>
                
                <div className="mt-4 flex items-center justify-between px-2">
                  <div>
                    <h3 className="font-bold text-gray-900 uppercase tracking-widest text-[10px] mb-1">{letter.title}</h3>
                    <p className="text-[10px] text-gray-400 font-medium uppercase">
                      edited {formatTimeAgo(letter.updatedAt)} • A4
                    </p>
                  </div>
                  <button 
                    onClick={() => setMenuOpen(menuOpen === letter._id ? null : letter._id)}
                    className="p-2 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-100 transition-all"
                  >
                    <MoreVertical className="h-4 w-4 text-gray-400" />
                  </button>
                </div>

                {menuOpen === letter._id && (
                  <div className="mt-2 mx-2 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-in fade-in slide-in-from-top-2 z-10">
                    <button
                      onClick={() => deleteCoverLetter(letter._id)}
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
