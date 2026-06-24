'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Loader2, Plus, Download, ChevronRight, LayoutDashboard, FileText, Settings, Mail, User, Bold, Italic, List, Link as LinkIcon, Sparkles, Palette, Type, Sliders, RotateCcw, ChevronDown, ChevronRight as ChevronRightIcon, Eye, BookTemplate } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { Input } from '@/components/ui/input';
import CoverLetterBodyEditor from '@/components/cover-letter/CoverLetterBodyEditor';
import AiGenerateModal from '@/components/cover-letter/AiGenerateModal';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const SectionCard = ({ title, icon: Icon, children, defaultOpen = false }: { title: string; icon: React.ElementType; children: React.ReactNode; defaultOpen?: boolean; }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (<div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--app-border)', background: 'var(--app-bg-card)' }}>
    <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between px-4 py-3 transition-colors" style={{ background: 'transparent' }} onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--app-bg-gray)'} onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
      <div className="flex items-center gap-2.5"><Icon className="w-4 h-4" style={{ color: 'var(--app-primary)' }} /><span className="text-[11px] font-black uppercase tracking-widest" style={{ color: 'var(--app-text)' }}>{title}</span></div>
      {open ? <ChevronDown className="w-4 h-4" style={{ color: 'var(--app-text-muted)' }} /> : <ChevronRightIcon className="w-4 h-4" style={{ color: 'var(--app-text-muted)' }} />}
    </button>
    {open && <div className="px-4 pb-4 pt-1 space-y-3" style={{ borderTop: '1px solid var(--app-border-light)' }}>{children}</div>}
  </div>);
};

const Label = ({ children }: { children: React.ReactNode }) => <span className="text-[9px] font-black uppercase tracking-widest block mb-1" style={{ color: 'var(--app-text-muted)' }}>{children}</span>;

const SliderRow = ({ label, value, min, max, step = 1, unit = '', onChange }: { label: string; value: number; min: number; max: number; step?: number; unit?: string; onChange: (v: number) => void; }) => (
  <div><div className="flex items-center justify-between mb-1"><Label>{label}</Label><span className="text-[10px] font-bold" style={{ color: 'var(--app-text-secondary)' }}>{value}{unit}</span></div>
    <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))} className="w-full h-1.5 rounded-full cursor-pointer" style={{ accentColor: 'var(--app-primary)' }} /></div>
);

const ToggleChip = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button onClick={onClick} className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all" style={active ? { background: 'var(--app-primary)', color: '#fff', border: '1px solid var(--app-primary)' } : { background: 'var(--app-bg-gray)', color: 'var(--app-text-secondary)', border: '1px solid var(--app-border)' }}>{children}</button>
);

const BoolToggle = ({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void; }) => (
  <div className="flex items-center justify-between"><span className="text-[10px] font-bold" style={{ color: 'var(--app-text-secondary)' }}>{label}</span>
    <button onClick={() => onChange(!value)} className="relative w-9 h-5 rounded-full transition-colors" style={{ background: value ? 'var(--app-primary)' : 'var(--app-bg-medium)' }}>
      <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-4' : 'translate-x-0'}`} /></button></div>
);

const COLORS = ['#ff4d7d','#7c3aed','#2563eb','#0891b2','#059669','#d97706','#dc2626','#db2777','#4f46e5','#0f172a'];
const FONTS = ['Inter','Roboto','Open Sans','Lato','Montserrat','Poppins','Playfair Display','Merriweather','Lora','PT Serif','Fira Code','Source Code Pro','Raleway','Nunito','Work Sans','Rubik','Quicksand','DM Sans','DM Serif Display','Crimson Text','Cormorant Garamond','Josefin Sans','Nunito Sans','Spectral','IBM Plex Serif','IBM Plex Sans','Libre Baskerville','Libre Franklin','Source Serif Pro','Bitter','Karla','Mukta','Hind','Bebas Neue','Oswald','Anton','Abril Fatface','Vollkorn','Crimson Pro','Sora','Outfit','Space Grotesk','Manrope','Figtree','Plus Jakarta Sans','Urbanist','Lexend','Geist','Cabin','Signika','Cardo','EB Garamond','Vollkorn SC','Arvo','Roboto Slab','Merriweather Sans','Roboto Mono','JetBrains Mono','Space Mono','Inconsolata','PT Mono','Anonymous Pro','Courier Prime'];

/* ─── Google Fonts Dynamic Loader ─── */
const loadedFonts = new Set<string>();
function loadGoogleFont(fontName: string) {
  if (loadedFonts.has(fontName) || ['Arial','Georgia','Verdana','Times New Roman','Courier New'].includes(fontName)) return;
  loadedFonts.add(fontName);
  const id = 'gf-' + fontName.replace(/\s+/g, '-').toLowerCase();
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/\s+/g, '+')}:wght@300;400;500;600;700&display=swap`;
  document.head.appendChild(link);
}

async function loadGoogleFontAsync(fontName: string): Promise<void> {
  if (loadedFonts.has(fontName) || ['Arial','Georgia','Verdana','Times New Roman','Courier New'].includes(fontName)) return;
  loadedFonts.add(fontName);
  const id = 'gf-' + fontName.replace(/\s+/g, '-').toLowerCase();
  if (document.getElementById(id)) return;
  return new Promise((resolve) => {
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/\s+/g, '+')}:wght@300;400;500;600;700&display=swap`;
    link.onload = () => resolve();
    link.onerror = () => resolve();
    document.head.appendChild(link);
  });
}

const DECO = [{id:'none',l:'—',t:'None'},{id:'underline',l:'U',t:'Underline'},{id:'border-bottom',l:'━',t:'Line'},{id:'background',l:'■',t:'Fill BG'},{id:'dot',l:'●',t:'Dot'},{id:'double-line',l:'≡',t:'Double'},{id:'overline',l:'‾',t:'Overline'},{id:'border-left',l:'▌',t:'Left Bar'},{id:'double-side',l:'◈',t:'Both'},{id:'badge',l:'▐',t:'Badge'},{id:'shadow',l:'▣',t:'Shadow'},{id:'gradient',l:'▤',t:'Gradient'},{id:'capsule',l:'()',t:'Capsule'},{id:'strikethrough',l:'S',t:'Strike'},{id:'wave',l:'~',t:'Wave'}];

interface CLData { title: string; template: string; content: { personalInfo: { fullName: string; email: string; phone: string; location: string; professionalTitle: string; photo: string; }; date: string; recipient: { name: string; company: string; address: string; }; body: string; signature: { fullName: string; place: string; date: string; image: string; }; }; design: { fontFamily: string; primaryColor: string; fontSize: number; lineHeight: number; padding: number; titleStyle: string; layout: string; fontWeight: number; titleSize: number; titleColor: string; titleAlign: string; bodyAlign: string; bodyColor: string; letterSpacing: number; paragraphSpacing: number; sectionGap: number; borderStyle: string; borderWidth: number; signatureLine: string; senderAlign: string; recipientAlign: string; textColor: string; backgroundColor: string; pdfFileName: string; borderRadius: number; topBorderAccent: boolean; hideDate: boolean; hideRecipient: boolean; hideSignature: boolean; italicBody: boolean; boldBody: boolean; firstLineIndent: number; }; }

const DD = { fontFamily:'Inter',primaryColor:'#ff4d7d',fontSize:12,lineHeight:1.6,padding:48,titleStyle:'none',layout:'classic',fontWeight:400,titleSize:16,titleColor:'#000',titleAlign:'center',bodyAlign:'left',bodyColor:'#374151',letterSpacing:0,paragraphSpacing:12,sectionGap:20,borderStyle:'none',borderWidth:0,signatureLine:'line',senderAlign:'left',recipientAlign:'left',textColor:'#111827',backgroundColor:'#ffffff',pdfFileName:'',borderRadius:0,topBorderAccent:false,hideDate:false,hideRecipient:false,hideSignature:false,italicBody:false,boldBody:false,firstLineIndent:0 };
const defaultData: CLData = { title:'Letter 1',template:'classic',content:{personalInfo:{fullName:'',email:'',phone:'',location:'',professionalTitle:'',photo:''},date:new Date().toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'}),recipient:{name:'',company:'',address:''},body:'Dear ______,\n\nSincerely,',signature:{fullName:'',place:'',date:'',image:''}},design:{...DD} };

interface ResumeListItem {
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
      location?: string;
      professionalTitle?: string;
      summary?: string;
    };
  };
}

function CoverLetterEditorInner() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id') || '';
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<CLData>(defaultData);
  const [activeTab, setActiveTab] = useState<'write'|'customize'>('write');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [fontTick, setFontTick] = useState(0);
  const [showAiModal, setShowAiModal] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [resumes, setResumes] = useState<ResumeListItem[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(false);
  const [syncedResume, setSyncedResume] = useState<ResumeListItem | null>(null);

  useEffect(()=>{const c=()=>setIsMobile(window.innerWidth<1024);c();window.addEventListener('resize',c);return()=>window.removeEventListener('resize',c);},[]);
  useEffect(()=>{if(status==='unauthenticated')router.push('/login');},[status,router]);
  useEffect(()=>{if(session?.user&&id)fetchData();},[session,id]);
  
  useEffect(()=>{
    const fn=data.design.fontFamily;
    const isSystemFont = ['Arial','Georgia','Verdana','Times New Roman','Courier New'].includes(fn);
    if(!fn||isSystemFont) return;
    const id2='gf-'+fn.replace(/\s+/g,'-').toLowerCase();
    if(document.getElementById(id2)){setFontTick(t=>t+1);return;}
    loadGoogleFontAsync(fn).then(()=>setFontTick(t=>t+1));
  },[data.design.fontFamily]);

  const fetchData=async()=>{try{const r=await fetch(`/api/cover-letters/${id}`);if(!r.ok){router.push('/cover-letters');return;}const j=await r.json();if(j.coverLetter){const merged={...defaultData,...j.coverLetter,content:{...defaultData.content,...(j.coverLetter.content||{}),personalInfo:{...defaultData.content.personalInfo,...(j.coverLetter.content?.personalInfo||{})},recipient:{...defaultData.content.recipient,...(j.coverLetter.content?.recipient||{})},signature:{...defaultData.content.signature,...(j.coverLetter.content?.signature||{})}},design:{...DD,...(j.coverLetter.design||{})}};setData(merged);setSyncedResume(j.coverLetter.syncedResume||null);}setLoading(false);}catch(e){console.error(e);setLoading(false);}};

  const save=useCallback(async(upd:CLData)=>{setSaving(true);try{const el=document.getElementById('letter-preview');let pi='';if(el){const c=await html2canvas(el,{scale:0.8,useCORS:true,logging:false,backgroundColor:'#ffffff'});pi=c.toDataURL('image/jpeg',0.7);}await fetch(`/api/cover-letters/${id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({...upd,previewImage:pi,syncedResume})});}catch(e){console.error(e);}finally{setSaving(false);}},[id, syncedResume]);
  useEffect(()=>{if(!id||loading)return;const t=setTimeout(()=>save(data),1000);return()=>clearTimeout(t);},[data,id,loading,save]);

  const ud=useCallback((k:string,v:any)=>setData(p=>({...p,design:{...p.design,[k]:v}})),[]);
  const un=useCallback((path:string,value:string)=>setData(p=>{const n=JSON.parse(JSON.stringify(p));const ks=path.split('.');let c:any=n;for(let i=0;i<ks.length-1;i++)c=c[ks[i]];c[ks[ks.length-1]]=value;return n;}),[]);

  const exportPDF=async()=>{const el=document.getElementById('letter-preview');if(!el)return;toast.loading('Generating...',{id:'pdf'});try{const c=await html2canvas(el,{scale:2});const img=c.toDataURL('image/png');const pdf=new jsPDF('p','mm','a4');const w=pdf.internal.pageSize.getWidth();pdf.addImage(img,'PNG',0,0,w,(c.height*w)/c.width);pdf.save(`${data.design.pdfFileName?.trim()||data.title||'Cover Letter'}.pdf`);toast.success('Downloaded!',{id:'pdf'});}catch{toast.error('Failed',{id:'pdf'});}};

  const openResumeModal = async () => {
    setShowResumeModal(true);
    setLoadingResumes(true);
    try { const r = await fetch('/api/resumes'); const j = await r.json(); setResumes(j.resumes || []); } catch { toast.error('Failed to load resumes'); } finally { setLoadingResumes(false); }
  };

  const selectResume = (resume: ResumeListItem) => {
    const pi = resume.content?.personalInfo;
    if (pi) { setData(prev => ({ ...prev, content: { ...prev.content, personalInfo: { ...prev.content.personalInfo, fullName: pi.fullName || prev.content.personalInfo.fullName, email: pi.email || prev.content.personalInfo.email, phone: pi.phone || prev.content.personalInfo.phone, location: pi.location || prev.content.personalInfo.location, professionalTitle: pi.professionalTitle || prev.content.personalInfo.professionalTitle } } })); }
    setSyncedResume(resume); setShowResumeModal(false); toast.success(`Synced with "${resume.title}"`);
  };

  const removeSync = () => { setSyncedResume(null); toast.success('Resume sync removed'); };

  const handleAiApply = useCallback((html: string) => { un('content.body', html); setShowAiModal(false); }, [un]);

  if(status==='loading'||loading)return<div className="min-h-screen flex items-center justify-center" style={{background:'var(--app-bg)'}}><Loader2 className="h-8 w-8 animate-spin" style={{color:'var(--app-primary)'}}/></div>;

  const d=data.design;

  const ResumeModal = () => {
    if (!showResumeModal) return null;
    return (<div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50" onClick={()=>setShowResumeModal(false)}><div className="bg-white rounded-2xl shadow-2xl w-[700px] max-h-[85vh] overflow-hidden flex flex-col" onClick={e=>e.stopPropagation()}>
      <div className="flex items-center justify-between px-6 py-4 border-b" style={{borderColor:'var(--app-border)'}}><div className="flex items-center gap-3"><BookTemplate className="w-5 h-5" style={{color:'var(--app-primary)'}}/><h2 className="text-lg font-bold" style={{color:'var(--app-text)'}}>Select Resume to Sync</h2></div><button onClick={()=>setShowResumeModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg></button></div>
      <div className="flex-1 overflow-y-auto p-6">{loadingResumes ? (<div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin" style={{color:'var(--app-primary)'}}/></div>) : resumes.length === 0 ? (<div className="text-center py-20"><FileText className="w-12 h-12 mx-auto mb-3" style={{color:'var(--app-text-muted)'}}/><p className="text-sm font-bold" style={{color:'var(--app-text-secondary)'}}>No resumes found</p></div>) : (<div className="grid grid-cols-2 gap-4">{resumes.map(resume => (<button key={resume._id} onClick={() => selectResume(resume)} className={`relative rounded-xl border-2 overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5 text-left ${syncedResume?._id === resume._id ? 'border-[var(--app-primary)]' : 'border-gray-200'}`}><div className="aspect-[3/4] bg-gray-50 flex items-center justify-center overflow-hidden">{resume.previewImage ? (<img src={resume.previewImage} alt={resume.title} className="w-full h-full object-cover" />) : (<FileText className="w-12 h-12" style={{color:'var(--app-text-muted)'}}/>)}</div>{syncedResume?._id === resume._id && (<div className="absolute top-2 right-2 bg-[var(--app-primary)] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full">Active</div>)}<div className="p-3"><p className="text-xs font-bold truncate" style={{color:'var(--app-text)'}}>{resume.title}</p>{resume.content?.personalInfo?.fullName && (<p className="text-[10px] mt-0.5 truncate" style={{color:'var(--app-text-muted)'}}>{resume.content.personalInfo.fullName}</p>)}</div></button>))}</div>)}</div>
      {syncedResume && (<div className="flex items-center justify-between px-6 py-3 border-t" style={{borderColor:'var(--app-border)',background:'var(--app-bg-gray)'}}><div className="flex items-center gap-2"><BookTemplate className="w-4 h-4" style={{color:'var(--app-primary)'}}/><span className="text-xs font-medium" style={{color:'var(--app-text-secondary)'}}>Synced: <strong style={{color:'var(--app-text)'}}>{syncedResume.title}</strong></span></div><button onClick={removeSync} className="text-xs font-bold px-3 py-1 rounded-lg" style={{color:'var(--app-text-muted)'}}>Remove Sync</button></div>)}
    </div></div>);
  };

  return(<div className="flex flex-col h-screen font-sans" style={{background:'var(--app-bg)'}}>
    <Toaster position="top-center" toastOptions={{duration:3000,style:{background:'var(--app-bg-card)',color:'var(--app-text)',border:'1px solid var(--app-border)',borderRadius:'12px',fontSize:'13px',fontWeight:'600'}}}/>
    <header className="h-14 border-b flex items-center justify-between px-4 lg:px-6 z-50 shrink-0" style={{background:'var(--app-bg-card)',borderColor:'var(--app-border)'}}>
      <div className="flex items-center gap-3 min-w-0"><Link href="/cover-letters" className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-all shrink-0"><ChevronRight className="h-4 w-4 rotate-180" style={{color:'var(--app-text-secondary)'}}/><span className="text-sm font-semibold hidden sm:inline" style={{color:'var(--app-text-secondary)'}}>Cover Letters</span></Link><div className="w-px h-6 hidden sm:block" style={{background:'var(--app-border)'}}/><input value={data.title} onChange={e=>un('title',e.target.value)} className="text-sm font-bold bg-transparent border-none focus:ring-0 focus:outline-none truncate max-w-[200px] lg:max-w-[300px]" style={{color:'var(--app-text)'}} placeholder="Click to edit letter name"/><div className="flex items-center gap-1.5 ml-2 shrink-0"><div className={`w-2 h-2 rounded-full ${saving?'bg-orange-400 animate-pulse':'bg-emerald-400'}`}/><span className="text-[9px] font-black uppercase tracking-widest hidden sm:inline" style={{color:'var(--app-text-muted)'}}>{saving?'Saving...':'Saved'}</span></div></div>
      <div className="flex items-center gap-2 shrink-0">{!isMobile&&<button onClick={()=>setActiveTab(activeTab==='write'?'customize':'write')} className="flex items-center gap-1.5 px-3 py-1.5 border text-xs font-bold rounded-xl transition-all" style={{borderColor:'var(--app-border)',color:'var(--app-text-secondary)'}}>{activeTab==='write'?<Settings className="h-3.5 w-3.5"/>:<FileText className="h-3.5 w-3.5"/>}<span>{activeTab==='write'?'Style':'Write'}</span></button>}<button onClick={exportPDF} className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-xl shadow-sm" style={{background:'var(--app-primary)',color:'#fff'}}><Download className="h-3.5 w-3.5"/><span className="hidden sm:inline">Export PDF</span></button></div>
    </header>
    <div className="flex flex-1 overflow-hidden relative">
      {isMobile?(<div className="flex-1 flex flex-col overflow-hidden">{showMobilePreview?(<div className="flex-1 overflow-auto p-2" style={{background:'#f1f5f9'}}><div style={{maxWidth:595,margin:'0 auto'}}>{renderPreview()}</div></div>):activeTab==='customize'?(<div className="flex-1 overflow-y-auto" style={{background:'var(--app-bg-gray)'}}><div className="p-3 space-y-2 pb-20">{renderPanel()}</div></div>):(<div className="flex-1 overflow-y-auto p-6" style={{background:'var(--app-bg)'}}>{renderEditor()}</div>)}</div>):(<div className="flex flex-1 overflow-hidden"><div className="w-[340px] xl:w-[380px] border-r overflow-y-auto shrink-0" style={{background:'var(--app-bg-gray)',borderColor:'var(--app-border)'}}><div className="flex gap-1.5 px-3 pt-3 pb-1 shrink-0"><button onClick={()=>setActiveTab('write')} className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-center ${activeTab==='write'?'text-white':''}`} style={activeTab==='write'?{background:'var(--app-primary)'}:{color:'var(--app-text-secondary)'}}>Write</button><button onClick={()=>setActiveTab('customize')} className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-center ${activeTab==='customize'?'text-white':''}`} style={activeTab==='customize'?{background:'var(--app-primary)'}:{color:'var(--app-text-secondary)'}}>Design</button></div><div className="p-3 space-y-2 pb-20">{renderPanel()}</div></div><div className="flex-1 overflow-y-auto p-8 lg:p-12" style={{background:'var(--app-bg)'}}>{renderEditor()}</div><div className="w-[45%] xl:w-[42%] flex items-center justify-center p-8 overflow-hidden relative shrink-0" style={{background:'#f1f5f9'}}>{renderPreview()}</div></div>)}
      <ResumeModal />
      <AiGenerateModal isOpen={showAiModal} onClose={() => setShowAiModal(false)} personalInfo={data.content.personalInfo} recipient={data.content.recipient} syncedResume={syncedResume} onApply={handleAiApply} bodyColor={d.bodyColor || '#374151'} />
      {isMobile&&(<div className="fixed inset-x-0 bottom-0 z-[50] flex items-center justify-around border-t px-2 py-2" style={{background:'rgba(15,23,42,0.96)',borderColor:'rgba(148,163,184,0.12)',paddingBottom:'calc(0.5rem + env(safe-area-inset-bottom))'}}><button onClick={()=>{setActiveTab('write');setShowMobilePreview(false);}} className={`flex flex-col items-center gap-1 py-2 px-2 rounded-2xl ${activeTab==='write'&&!showMobilePreview?'text-[var(--app-primary)]':'text-gray-400'}`}><FileText className="w-5 h-5"/><span className="text-[9px] font-black uppercase">Write</span></button><button onClick={()=>{setActiveTab('customize');setShowMobilePreview(false);}} className={`flex flex-col items-center gap-1 py-2 px-2 rounded-2xl ${activeTab==='customize'&&!showMobilePreview?'text-[var(--app-primary)]':'text-gray-400'}`}><Palette className="w-5 h-5"/><span className="text-[9px] font-black uppercase">Design</span></button><button onClick={()=>setShowMobilePreview(true)} className={`flex flex-col items-center gap-1 py-2 px-2 rounded-2xl ${showMobilePreview?'text-[var(--app-primary)]':'text-gray-400'}`}><Eye className="w-5 h-5"/><span className="text-[9px] font-black uppercase">Preview</span></button><button onClick={exportPDF} className="flex flex-col items-center gap-1 py-2 px-2 rounded-2xl text-gray-400"><Download className="w-5 h-5"/><span className="text-[9px] font-black uppercase">Export</span></button></div>)}
    </div>
  </div>);

  function renderPanel(){return(<>
    <SectionCard title="AI Generate" icon={Sparkles} defaultOpen={true}><button onClick={()=>setShowAiModal(true)} className="w-full flex items-center justify-center gap-2 py-2.5 text-white text-xs font-bold rounded-xl transition-all" style={{background:'var(--app-primary)'}}><Sparkles className="h-3 w-3"/> AI Generate Body</button></SectionCard>
    <SectionCard title="Resume Sync" icon={BookTemplate} defaultOpen={true}>
      {syncedResume ? (<div className="space-y-2"><div className="flex items-center gap-3 p-3 rounded-lg" style={{background:'var(--app-bg-gray)',border:'1px solid var(--app-border)'}}><div className="w-12 h-12 rounded-lg overflow-hidden bg-white flex items-center justify-center shrink-0">{syncedResume.previewImage ? (<img src={syncedResume.previewImage} alt={syncedResume.title} className="w-full h-full object-cover" />) : (<FileText className="w-6 h-6" style={{color:'var(--app-text-muted)'}}/>)}</div><div className="flex-1 min-w-0"><p className="text-xs font-bold truncate" style={{color:'var(--app-text)'}}>{syncedResume.title}</p>{syncedResume.content?.personalInfo?.fullName && (<p className="text-[10px] truncate" style={{color:'var(--app-text-muted)'}}>{syncedResume.content.personalInfo.fullName}</p>)}</div><button onClick={removeSync} className="text-[10px] font-bold px-2 py-1 rounded-lg" style={{color:'var(--app-text-muted)'}}>X</button></div><button onClick={openResumeModal} className="w-full py-2 text-[10px] font-bold rounded-lg" style={{background:'var(--app-bg-gray)',color:'var(--app-text-secondary)',border:'1px solid var(--app-border)'}}>Change Resume</button></div>) : (<button onClick={openResumeModal} className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl border-2 border-dashed transition-all" style={{borderColor:'var(--app-border)',color:'var(--app-text-secondary)'}}><BookTemplate className="w-4 h-4"/> Sync with Resume</button>)}
    </SectionCard>
    <SectionCard title="Letter Layout" icon={LayoutDashboard} defaultOpen={true}><div className="grid grid-cols-3 gap-1.5">{[{id:'classic',l:'Classic',i:'+'},{id:'modern',l:'Modern',i:'◉'},{id:'minimal',l:'Minimal',i:'−'}].map(o=>(<button key={o.id} onClick={()=>ud('layout',o.id)} className="py-2 rounded-lg text-[9px] font-bold transition-all" style={{background:d.layout===o.id?'var(--app-primary)':'var(--app-bg-gray)',color:d.layout===o.id?'#fff':'var(--app-text-secondary)'}}><div className="text-sm mb-0.5">{o.i}</div>{o.l}</button>))}</div></SectionCard>
    <SectionCard title="Font Family" icon={Type} defaultOpen={true}><select value={d.fontFamily} onChange={e=>ud('fontFamily',e.target.value)} className="w-full px-2 py-2 rounded-lg text-xs font-medium" style={{fontFamily:d.fontFamily,background:'var(--app-bg-gray)',border:'1px solid var(--app-border)',color:'var(--app-text)'}}>{FONTS.map(f=><option key={f} value={f} style={{fontFamily:f}}>{f}</option>)}</select></SectionCard>
    <SectionCard title="Font Weight" icon={Type}><SliderRow label="Weight" value={d.fontWeight||400} min={300} max={700} step={100} onChange={v=>ud('fontWeight',v)}/></SectionCard>
    <SectionCard title="Title" icon={Type} defaultOpen={true}><SliderRow label="Size" value={d.titleSize||16} min={12} max={28} step={1} unit="px" onChange={v=>ud('titleSize',v)}/><div><Label>Color</Label><div className="flex items-center gap-2"><input type="color" value={d.titleColor||'#000000'} onChange={e=>ud('titleColor',e.target.value)} className="w-8 h-8 rounded-lg border cursor-pointer p-0.5" style={{borderColor:'var(--app-border)'}}/><input type="text" value={d.titleColor||'#000000'} onChange={e=>ud('titleColor',e.target.value)} className="flex-1 p-1.5 rounded-lg text-[10px] font-mono font-bold" style={{background:'var(--app-bg-gray)',border:'1px solid var(--app-border)',color:'var(--app-text)'}}/></div></div><div><Label>Alignment</Label><div className="flex gap-1.5">{(['left','center','right'] as const).map(a=><ToggleChip key={a} active={d.titleAlign===a} onClick={()=>ud('titleAlign',a)}>{a}</ToggleChip>)}</div></div></SectionCard>
    <SectionCard title="Title Decoration" icon={Palette} defaultOpen={true}><div className="grid grid-cols-5 gap-1.5">{DECO.map(o=>(<button key={o.id} onClick={()=>ud('titleStyle',o.id)} title={o.t} className="py-2 rounded-lg text-sm text-center transition-all" style={{background:d.titleStyle===o.id?'var(--app-primary-light)':'var(--app-bg-gray)',border:`1px solid ${d.titleStyle===o.id?'var(--app-primary)':'var(--app-border)'}`,color:d.titleStyle===o.id?'var(--app-primary)':'var(--app-text-secondary)'}}>{o.l}</button>))}</div></SectionCard>
    <SectionCard title="Body Text" icon={FileText} defaultOpen={true}><SliderRow label="Size" value={d.fontSize||12} min={9} max={18} step={0.5} unit="px" onChange={v=>ud('fontSize',v)}/><SliderRow label="Line Height" value={d.lineHeight||1.6} min={1.0} max={2.5} step={0.1} onChange={v=>ud('lineHeight',v)}/><SliderRow label="Letter Spacing" value={d.letterSpacing||0} min={-1} max={3} step={0.5} unit="px" onChange={v=>ud('letterSpacing',v)}/><SliderRow label="Paragraph Gap" value={d.paragraphSpacing||12} min={4} max={32} step={2} unit="px" onChange={v=>ud('paragraphSpacing',v)}/><div><Label>Body Color</Label><div className="flex items-center gap-2"><input type="color" value={d.bodyColor||'#374151'} onChange={e=>ud('bodyColor',e.target.value)} className="w-8 h-8 rounded-lg border cursor-pointer p-0.5" style={{borderColor:'var(--app-border)'}}/><select value={d.bodyColor||'#374151'} onChange={e=>ud('bodyColor',e.target.value)} className="flex-1 px-2 py-1.5 rounded-lg text-[10px] font-bold" style={{background:'var(--app-bg-gray)',border:'1px solid var(--app-border)',color:'var(--app-text)'}}>{['#374151','#1e293b','#334155','#475569','#6b7280','#000000'].map(c=><option key={c} value={c}>{c}</option>)}</select></div></div><BoolToggle label="Italic Body" value={d.italicBody||false} onChange={v=>ud('italicBody',v)}/><BoolToggle label="Bold Body" value={d.boldBody||false} onChange={v=>ud('boldBody',v)}/><SliderRow label="First Line Indent" value={d.firstLineIndent||0} min={0} max={40} step={2} unit="px" onChange={v=>ud('firstLineIndent',v)}/></SectionCard>
    <SectionCard title="Alignment" icon={Sliders}><div className="grid grid-cols-2 gap-2"><div><Label>Title</Label><div className="flex gap-1">{(['left','center','right'] as const).map(a=><button key={a} onClick={()=>ud('titleAlign',a)} className="flex-1 py-1 rounded text-[10px] font-bold" style={{background:d.titleAlign===a?'var(--app-primary)':'var(--app-bg-gray)',color:d.titleAlign===a?'#fff':'var(--app-text-secondary)'}}>{a[0].toUpperCase()}</button>)}</div></div><div><Label>Body</Label><div className="flex gap-1">{(['left','center','right','justify'] as const).map(a=><button key={a} onClick={()=>ud('bodyAlign',a)} className="flex-1 py-1 rounded text-[9px] font-bold" style={{background:d.bodyAlign===a?'var(--app-primary)':'var(--app-bg-gray)',color:d.bodyAlign===a?'#fff':'var(--app-text-secondary)'}}>{a[0].toUpperCase()}</button>)}</div></div></div><div className="grid grid-cols-2 gap-2"><div><Label>Sender</Label><div className="flex gap-1">{(['left','center','right'] as const).map(a=><button key={a} onClick={()=>ud('senderAlign',a)} className="flex-1 py-1 rounded text-[10px] font-bold" style={{background:d.senderAlign===a?'var(--app-primary)':'var(--app-bg-gray)',color:d.senderAlign===a?'#fff':'var(--app-text-secondary)'}}>{a[0].toUpperCase()}</button>)}</div></div><div><Label>Recipient</Label><div className="flex gap-1">{(['left','center','right'] as const).map(a=><button key={a} onClick={()=>ud('recipientAlign',a)} className="flex-1 py-1 rounded text-[10px] font-bold" style={{background:d.recipientAlign===a?'var(--app-primary)':'var(--app-bg-gray)',color:d.recipientAlign===a?'#fff':'var(--app-text-secondary)'}}>{a[0].toUpperCase()}</button>)}</div></div></div></SectionCard>
    <SectionCard title="Page & Spacing" icon={Sliders}><SliderRow label="Padding" value={d.padding||48} min={20} max={80} step={4} unit="px" onChange={v=>ud('padding',v)}/><SliderRow label="Section Gap" value={d.sectionGap||20} min={8} max={48} step={2} unit="px" onChange={v=>ud('sectionGap',v)}/><SliderRow label="Border Radius" value={d.borderRadius||0} min={0} max={24} step={2} unit="px" onChange={v=>ud('borderRadius',v)}/></SectionCard>
    <SectionCard title="Border & Decoration" icon={Sliders}><div className="grid grid-cols-2 gap-2"><div><Label>Border Style</Label><select value={d.borderStyle||'none'} onChange={e=>ud('borderStyle',e.target.value)} className="w-full px-2 py-1.5 rounded-lg text-[10px]" style={{background:'var(--app-bg-gray)',border:'1px solid var(--app-border)',color:'var(--app-text)'}}>{['none','solid','dashed','dotted'].map(s=><option key={s} value={s}>{s}</option>)}</select></div><div><Label>Border Width</Label><select value={d.borderWidth||0} onChange={e=>ud('borderWidth',Number(e.target.value))} className="w-full px-2 py-1.5 rounded-lg text-[10px]" style={{background:'var(--app-bg-gray)',border:'1px solid var(--app-border)',color:'var(--app-text)'}}>{[0,1,2,3,4].map(w=><option key={w} value={w}>{w===0?'None':`${w}px`}</option>)}</select></div></div><BoolToggle label="Top Accent Border" value={d.topBorderAccent||false} onChange={v=>ud('topBorderAccent',v)}/><div><Label>Signature Line</Label><div className="flex gap-1">{['line','dashed','dot','none'].map(s=><button key={s} onClick={()=>ud('signatureLine',s)} className="flex-1 py-1 rounded text-[10px] font-bold" style={{background:d.signatureLine===s?'var(--app-primary)':'var(--app-bg-gray)',color:d.signatureLine===s?'#fff':'var(--app-text-secondary)'}}>{s}</button>)}</div></div></SectionCard>
    <SectionCard title="Accent Color" icon={Palette} defaultOpen={true}><div className="flex flex-wrap gap-1.5">{COLORS.map(c=><button key={c} onClick={()=>ud('primaryColor',c)} className="w-7 h-7 rounded-full border-2 transition-all hover:scale-110" style={{backgroundColor:c,borderColor:d.primaryColor===c?'var(--app-text)':'transparent',transform:d.primaryColor===c?'scale(1.2)':'scale(1)'}}/>)}</div><div className="flex items-center gap-2 mt-2"><Label>Custom</Label><input type="color" value={d.primaryColor||'#ff4d7d'} onChange={e=>ud('primaryColor',e.target.value)} className="w-8 h-8 rounded-lg border cursor-pointer p-0.5" style={{borderColor:'var(--app-border)'}}/></div></SectionCard>
    <SectionCard title="Visibility" icon={Eye}><BoolToggle label="Hide Date" value={d.hideDate||false} onChange={v=>ud('hideDate',v)}/><BoolToggle label="Hide Recipient" value={d.hideRecipient||false} onChange={v=>ud('hideRecipient',v)}/><BoolToggle label="Hide Signature" value={d.hideSignature||false} onChange={v=>ud('hideSignature',v)}/></SectionCard>
    <SectionCard title="PDF Export" icon={Download}><div><Label>PDF Filename</Label><input type="text" value={d.pdfFileName||''} onChange={e=>ud('pdfFileName',e.target.value)} placeholder={data.title||'Cover Letter'} className="w-full px-3 py-2 rounded-lg text-xs" style={{background:'var(--app-bg-gray)',border:'1px solid var(--app-border)',color:'var(--app-text)'}}/><p className="text-[9px] mt-1" style={{color:'var(--app-text-muted)'}}>Leave empty to use letter title.</p></div></SectionCard>
    <SectionCard title="Text Colors" icon={Palette}><div><Label>Text Color</Label><div className="flex items-center gap-2"><input type="color" value={d.textColor||'#111827'} onChange={e=>ud('textColor',e.target.value)} className="w-8 h-8 rounded-lg border cursor-pointer p-0.5" style={{borderColor:'var(--app-border)'}}/><input type="text" value={d.textColor||'#111827'} onChange={e=>ud('textColor',e.target.value)} className="flex-1 p-1.5 rounded-lg text-[10px] font-mono font-bold" style={{background:'var(--app-bg-gray)',border:'1px solid var(--app-border)',color:'var(--app-text)'}}/></div></div><div><Label>Background</Label><div className="flex items-center gap-2"><input type="color" value={d.backgroundColor||'#ffffff'} onChange={e=>ud('backgroundColor',e.target.value)} className="w-8 h-8 rounded-lg border cursor-pointer p-0.5" style={{borderColor:'var(--app-border)'}}/><input type="text" value={d.backgroundColor||'#ffffff'} onChange={e=>ud('backgroundColor',e.target.value)} className="flex-1 p-1.5 rounded-lg text-[10px] font-mono font-bold" style={{background:'var(--app-bg-gray)',border:'1px solid var(--app-border)',color:'var(--app-text)'}}/></div></div></SectionCard>
    <button onClick={()=>setData(p=>({...p,design:{...DD}}))} className="w-full py-2 rounded-xl text-[10px] font-bold flex items-center justify-center gap-2" style={{background:'var(--app-bg-gray)',color:'var(--app-text-secondary)',border:'1px solid var(--app-border)'}}><RotateCcw className="w-3 h-3"/> Reset to Default</button>
  </>);}

  function renderEditor(){return(<div className="max-w-2xl mx-auto space-y-6 pb-32 lg:pb-10">
    <div className="flex items-center justify-between p-4 rounded-xl border shadow-sm cursor-pointer hover:shadow-md transition-all" style={{background:'var(--app-bg-card)',borderColor: syncedResume ? 'var(--app-primary)' : 'var(--app-border)'}} onClick={openResumeModal}><div className="flex items-center gap-3"><BookTemplate className="w-5 h-5" style={{color: syncedResume ? 'var(--app-primary)' : 'var(--app-text-muted)'}}/><div><span className="text-sm font-bold" style={{color:'var(--app-text)'}}>{syncedResume ? `Synced: ${syncedResume.title}` : 'Sync with Resume'}</span>{syncedResume && syncedResume.content?.personalInfo?.fullName && (<p className="text-[10px] mt-0.5" style={{color:'var(--app-text-muted)'}}>{syncedResume.content.personalInfo.fullName}</p>)}</div></div>{syncedResume && syncedResume.previewImage && (<div className="w-10 h-12 rounded overflow-hidden shrink-0 border" style={{borderColor:'var(--app-border)'}}><img src={syncedResume.previewImage} alt="" className="w-full h-full object-cover" /></div>)}</div>
    <section className="rounded-xl p-4 shadow-sm border space-y-4" style={{background:'var(--app-bg-card)',borderColor:'var(--app-border)'}}><h3 className="text-lg font-bold" style={{color:'var(--app-text)'}}>Personal Details</h3><div className="flex gap-4"><div className="flex-1 space-y-3"><div className="space-y-1"><label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Full name</label><Input value={data?.content?.personalInfo?.fullName||''} onChange={e=>un('content.personalInfo.fullName',e.target.value)} placeholder="Enter full name"/></div><div className="space-y-1"><label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Professional title</label><Input value={data?.content?.personalInfo?.professionalTitle||''} onChange={e=>un('content.personalInfo.professionalTitle',e.target.value)} placeholder="Target position"/></div></div><div className="w-24 h-24 rounded-full bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-300 shrink-0"><User className="h-8 w-8"/><span className="text-[9px] font-bold mt-1">Photo</span></div></div><div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div className="space-y-1"><label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email</label><Input value={data?.content?.personalInfo?.email||''} onChange={e=>un('content.personalInfo.email',e.target.value)} placeholder="Email"/></div><div className="space-y-1"><label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Phone</label><Input value={data?.content?.personalInfo?.phone||''} onChange={e=>un('content.personalInfo.phone',e.target.value)} placeholder="Phone"/></div></div><div className="space-y-1"><label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Location</label><Input value={data?.content?.personalInfo?.location||''} onChange={e=>un('content.personalInfo.location',e.target.value)} placeholder="City, Country"/></div></section>
    <section className="rounded-xl p-4 shadow-sm border" style={{background:'var(--app-bg-card)',borderColor:'var(--app-border)'}}><h3 className="text-lg font-bold mb-3" style={{color:'var(--app-text)'}}>Date</h3><Input value={data?.content?.date||''} onChange={e=>un('content.date',e.target.value)}/></section>
    <section className="rounded-xl p-4 shadow-sm border space-y-4" style={{background:'var(--app-bg-card)',borderColor:'var(--app-border)'}}><h3 className="text-lg font-bold" style={{color:'var(--app-text)'}}>Recipient</h3><div className="space-y-1"><label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Name</label><Input value={data?.content?.recipient?.name||''} onChange={e=>un('content.recipient.name',e.target.value)} placeholder="Recipient name"/></div><div className="space-y-1"><label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Company</label><Input value={data?.content?.recipient?.company||''} onChange={e=>un('content.recipient.company',e.target.value)} placeholder="Company"/></div><div className="space-y-1"><label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Address</label><Input value={data?.content?.recipient?.address||''} onChange={e=>un('content.recipient.address',e.target.value)} placeholder="Address"/></div></section>
    <section className="rounded-xl p-4 shadow-sm border space-y-2" style={{background:'var(--app-bg-card)',borderColor:'var(--app-border)'}}>
      <div className="flex items-center justify-between"><h3 className="text-lg font-bold" style={{color:'var(--app-text)'}}>Body</h3><button onClick={()=>setShowAiModal(true)} className="flex items-center gap-2 px-3 py-1.5 text-white text-xs font-bold rounded-lg transition-all" style={{background:'var(--app-primary)'}}><Sparkles className="h-3 w-3"/>AI Generate</button></div>
      <CoverLetterBodyEditor content={data.content?.body || ''} onChange={(html) => un('content.body', html)} fontFamily={d.fontFamily || 'Inter'} fontSize={d.fontSize || 14} fontColor={d.bodyColor || '#374151'} lineHeight={d.lineHeight || 1.8} paragraphSpacing={d.paragraphSpacing || 12} />
    </section>
    <section className="rounded-xl p-4 shadow-sm border space-y-4" style={{background:'var(--app-bg-card)',borderColor:'var(--app-border)'}}><h3 className="text-lg font-bold" style={{color:'var(--app-text)'}}>Signature</h3><div className="space-y-1"><label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Full name</label><Input value={data?.content?.signature?.fullName||''} onChange={e=>un('content.signature.fullName',e.target.value)} placeholder="Full name"/></div><div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div className="space-y-1"><label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Place</label><Input value={data?.content?.signature?.place||''} onChange={e=>un('content.signature.place',e.target.value)} placeholder="Place"/></div><div className="space-y-1"><label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Date</label><Input value={data?.content?.signature?.date||''} onChange={e=>un('content.signature.date',e.target.value)} placeholder="Date"/></div></div></section>
  </div>);}

  function renderPreview(){const pd=d;const isModern=pd.layout==='modern';const isMinimal=pd.layout==='minimal';const tAlign=isModern?'left':(pd.titleAlign||'center');const tSize=isMinimal?Math.max((pd.titleSize||16)-2,14):pd.titleSize||16;const pad=isMinimal?Math.max((pd.padding||48)-8,28):pd.padding||48;const gap=isMinimal?Math.max((pd.sectionGap||20)-6,8):pd.sectionGap||20;return(<div id="letter-preview" style={{width:'100%',maxWidth:595,aspectRatio:'1/1.414',overflow:'auto',background:pd.backgroundColor||'#ffffff',color:pd.textColor||'#111827',boxShadow:'0 4px 20px rgba(0,0,0,0.08)',padding:`${pad}px`,display:'flex',flexDirection:'column',gap,fontFamily:`"${pd.fontFamily||'Inter'}",sans-serif`,fontSize:pd.fontSize||12,lineHeight:pd.lineHeight||1.6,borderRadius:`${pd.borderRadius||0}px`}}>
      <div style={{textAlign:tAlign as any,fontWeight:700,fontSize:tSize,color:pd.titleColor||'#000',marginBottom:8}}>{isModern?(data.content?.personalInfo?.fullName||data.title):data.title}</div>
      {!pd.hideDate&&data.content?.date&&<div style={{textAlign:'right' as any,fontSize:11,color:'#6b7280'}}>{data.content.date}</div>}
      <div style={{marginTop:12,textAlign:'left' as any}}>
        {data.content?.personalInfo?.fullName&&<div style={{fontWeight:700,fontSize:15,color:pd.bodyColor||'#000'}}>{data.content.personalInfo.fullName}</div>}
        {data.content?.personalInfo?.professionalTitle&&<div style={{fontSize:12,color:pd.bodyColor||'#374151'}}>{data.content.personalInfo.professionalTitle}</div>}
        <div style={{fontSize:11,color:'#6b7280'}}>{data.content?.personalInfo?.email}{data.content?.personalInfo?.phone?` | ${data.content.personalInfo.phone}`:''}</div>
        {data.content?.personalInfo?.location&&<div style={{fontSize:11,color:'#6b7280'}}>{data.content.personalInfo.location}</div>}
      </div>
      <div style={{flex:1,color:pd.bodyColor||'#374151',fontSize:pd.fontSize||12,lineHeight:pd.lineHeight||1.8,marginTop:gap,textAlign:'left' as any}}dangerouslySetInnerHTML={{__html: data.content?.body || ''}} />
      {!pd.hideSignature&&<div style={{marginTop:32,borderTop:'1px solid #e5e7eb',paddingTop:16}}>
        {data.content?.signature?.fullName&&<div style={{fontWeight:700,fontSize:14,color:pd.bodyColor||'#000'}}>{data.content.signature.fullName}</div>}
        {data.content?.signature?.place&&<div style={{fontSize:11,color:'#6b7280'}}>{data.content.signature.place}</div>}
      </div>}
    </div>);}
}

export default function CoverLetterPage() {
  return <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
    <CoverLetterEditorInner />
  </Suspense>;
}