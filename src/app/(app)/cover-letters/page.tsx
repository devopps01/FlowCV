'use client';

import { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Plus, FileText, Loader2, MoreVertical, Trash2, Copy, 
  Mail, Target, CreditCard, GraduationCap, User
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useConfirm } from '@/components/ui/ConfirmModal';

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
      place?: string;
    };
  };
}

// ─── Cover Letter Thumbnail ────────────────────────────────────────
function CoverLetterThumbnail({ letter }: { letter: CoverLetter }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.3);
  const A4_W = 595; // letter width in px
  const A4_H = 842; // letter height in px

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const containerW = el.offsetWidth || 200;
    setScale(containerW / A4_W);
  }, []);

  const c = letter.content;

  // Check if user has actually filled in meaningful data
  const hasName = c?.personalInfo?.fullName && c.personalInfo.fullName.trim().length > 0;
  const hasRecipient = c?.recipient?.name && c.recipient.name.trim().length > 0;
  const hasRecipientCompany = c?.recipient?.company && c.recipient.company.trim().length > 0;
  const hasSig = c?.signature?.fullName && c.signature.fullName.trim().length > 0;
  const hasRealBody = c?.body && c.body.trim() !== 'Dear ______,' && c.body.trim().length > 20;
  const hasRealData = hasName || hasRecipient || hasRecipientCompany || hasSig || hasRealBody;

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none select-none" style={{ background: 'var(--app-bg-card)' }}>
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: hasRealData ? 'flex-start' : 'center' }}>
        {hasRealData ? (
        <div style={{ width: `${A4_W}px`, height: `${A4_H}px`, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
          <div className="w-full h-full p-10 font-serif flex flex-col" style={{ background: 'var(--app-bg-card)', fontFamily: 'Georgia, serif' }}>
            {/* Title header */}
            <div className="text-center font-bold text-sm" style={{ color: 'var(--app-text)', borderBottom: '1px solid var(--app-border)', paddingBottom: 8 }}>
              {letter.title}
            </div>

            {/* Date */}
            <div className="text-right text-xs mt-2" style={{ color: 'var(--app-text-muted)' }}>{c?.date}</div>

            {/* Sender info */}
            <div className="mt-4 space-y-0.5">
              {c?.personalInfo?.fullName && <div className="font-bold text-base" style={{ color: 'var(--app-text)' }}>{c.personalInfo.fullName}</div>}
              {c?.personalInfo?.professionalTitle && <div className="text-xs" style={{ color: 'var(--app-text-secondary)' }}>{c.personalInfo.professionalTitle}</div>}
              {(c?.personalInfo?.email || c?.personalInfo?.phone) && (
                <div className="text-xs" style={{ color: 'var(--app-text-muted)' }}>
                  {c?.personalInfo?.email}{c?.personalInfo?.phone ? ` | ${c.personalInfo.phone}` : ''}
                </div>
              )}
              {c?.personalInfo?.location && <div className="text-xs" style={{ color: 'var(--app-text-muted)' }}>{c.personalInfo.location}</div>}
            </div>

            {/* Recipient */}
            <div className="mt-6 space-y-0.5">
              <div className="font-bold text-sm" style={{ color: 'var(--app-text)' }}>To:</div>
              {c?.recipient?.name && <div className="text-xs" style={{ color: 'var(--app-text-secondary)' }}>{c.recipient.name}</div>}
              {c?.recipient?.company && <div className="text-xs" style={{ color: 'var(--app-text-muted)' }}>{c.recipient.company}</div>}
              {c?.recipient?.address && <div className="text-xs" style={{ color: 'var(--app-text-muted)' }}>{c.recipient.address}</div>}
            </div>

            {/* Body */}
            <div className="mt-6 flex-1 text-xs leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--app-text-secondary)' }}>
              {c?.body}
            </div>

            {/* Signature */}
            <div className="mt-8 border-t pt-3" style={{ borderColor: 'var(--app-border)' }}>
              {c?.signature?.fullName && <div className="font-bold text-sm" style={{ color: 'var(--app-text)' }}>{c.signature.fullName}</div>}
              {c?.signature?.place && <div className="text-xs" style={{ color: 'var(--app-text-muted)' }}>{c.signature.place}</div>}
            </div>
          </div>
        </div>
        ) : (
          /* No real data — show clean placeholder with title */
          <div style={{ textAlign: 'center', padding: 20 }}>
            <FileText className="h-10 w-10 mx-auto mb-3" style={{ color: 'var(--app-text-muted)' }} />
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--app-text)' }}>{letter.title}</div>
            <div style={{ fontSize: 11, marginTop: 4, color: 'var(--app-text-muted)' }}>{letter.template || 'Classic'} template</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CoverLettersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [coverLetters, setCoverLetters] = useState<CoverLetter[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const { confirmModal, askConfirm } = useConfirm();

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
        router.push(`/cover-letter?id=${data.coverLetter._id}`);
      }
    } catch (error) {
      console.error('Failed to create cover letter:', error);
      setCreating(false);
    }
  };

  const deleteCoverLetter = async (id: string) => {
    const confirmed = await askConfirm({
      title: 'Delete Cover Letter',
      message: 'This will permanently delete this cover letter. This action cannot be undone.',
      confirmLabel: 'Delete',
      cancelLabel: 'Keep it',
      variant: 'danger',
    });
    if (!confirmed) return;
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--app-bg)' }}>
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--app-primary)' }} />
      </div>
    );
  }

  if (!session) return null;

  return (
    <div style={{ background: 'var(--app-bg-gray)' }}>

        {/* Main Content */}
        <main className="p-6 lg:p-10">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-black mb-10" style={{ color: 'var(--app-text)' }}>My Cover Letters</h1>

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
                  <div className="relative aspect-[3/4.2] rounded-xl border shadow-sm overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1" style={{ background: 'var(--app-bg-card)', borderColor: 'var(--app-border)' }}>
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
                        /* Live Preview using A4-like scaled rendering */
                        <CoverLetterThumbnail letter={letter} />
                      )}
                    
                    {/* Hover Actions */}
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Link
                        href={`/cover-letter?id=${letter._id}`}
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
      {confirmModal}
    </div>
  );
}
