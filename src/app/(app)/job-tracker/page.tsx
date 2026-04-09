'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Plus, FileText, Loader2, MoreVertical, Trash2, 
  Mail, Target, User, CreditCard, GraduationCap,
  GripVertical, FileUp, Download, Eye, Layout
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';

interface Job {
  id: string;
  company: string;
  position: string;
  pdfUrl?: string;
  thumbnail?: string;
  date: string;
}

interface Column {
  id: string;
  title: string;
  jobs: Job[];
}

const initialColumns: Column[] = [
  { id: 'wishlist', title: 'Wishlist', jobs: [] },
  { id: 'applied', title: 'Applied', jobs: [] },
  { id: 'interview', title: 'Interview', jobs: [] },
  { id: 'offer', title: 'Offer', jobs: [] },
  { id: 'rejected', title: 'Rejected', jobs: [] },
];

export default function JobTrackerPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [colMenuOpen, setColMenuOpen] = useState<string | null>(null);
  const [modal, setModal] = useState<{
    isOpen: boolean;
    type: 'add-column' | 'edit-column' | 'add-job' | 'edit-job' | 'delete-column' | null;
    data?: any;
  }>({ isOpen: false, type: null });
  const [inputValue, setInputValue] = useState('');
  const [subInputValue, setSubInputValue] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchData();
    }
  }, [status, router]);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/job-tracker');
      const data = await res.json();
      if (data.columns) {
        setColumns(data.columns);
      }
    } catch (error) {
      console.error('Failed to fetch job tracker data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveToDB = async (newColumns: Column[]) => {
    setSaving(true);
    try {
      await fetch('/api/job-tracker', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ columns: newColumns }),
      });
    } catch (error) {
      console.error('Failed to save job tracker data:', error);
      toast.error('Failed to sync data');
    } finally {
      setSaving(false);
    }
  };

  // Auto-save logic
  useEffect(() => {
    if (loading) return;
    const timer = setTimeout(() => {
      saveToDB(columns);
    }, 1000);
    return () => clearTimeout(timer);
  }, [columns, loading]);

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const sourceColIndex = columns.findIndex(col => col.id === source.droppableId);
    const destColIndex = columns.findIndex(col => col.id === destination.droppableId);
    
    const sourceCol = columns[sourceColIndex];
    const destCol = columns[destColIndex];

    const sourceJobs = [...sourceCol.jobs];
    const destJobs = source.droppableId === destination.droppableId ? sourceJobs : [...destCol.jobs];
    
    const [movedJob] = sourceJobs.splice(source.index, 1);
    destJobs.splice(destination.index, 0, movedJob);

    const newColumns = [...columns];
    newColumns[sourceColIndex] = { ...sourceCol, jobs: sourceJobs };
    newColumns[destColIndex] = { ...destCol, jobs: destJobs };

    setColumns(newColumns);
  };

  const addCard = (colId: string) => {
    setModal({ isOpen: true, type: 'add-job', data: { colId } });
    setInputValue('');
    setSubInputValue('Job Position');
  };

  const editCard = (colId: string, job: Job) => {
    setModal({ isOpen: true, type: 'edit-job', data: { colId, jobId: job.id } });
    setInputValue(job.company);
    setSubInputValue(job.position);
  };

  const addColumn = () => {
    setModal({ isOpen: true, type: 'add-column' });
    setInputValue('');
  };

  const editColumnTitle = (colId: string) => {
    const col = columns.find(c => c.id === colId);
    if (!col) return;
    setModal({ isOpen: true, type: 'edit-column', data: { colId } });
    setInputValue(col.title);
    setColMenuOpen(null);
  };

  const deleteColumn = (colId: string) => {
    setModal({ isOpen: true, type: 'delete-column', data: { colId } });
    setColMenuOpen(null);
  };

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modal.type) return;

    if (modal.type === 'add-column') {
      if (!inputValue) return;
      const newCol: Column = {
        id: inputValue.toLowerCase().replace(/\s+/g, '-'),
        title: inputValue,
        jobs: [],
      };
      setColumns(prev => [...prev, newCol]);
    } else if (modal.type === 'edit-column') {
      if (!inputValue) return;
      setColumns(prev => prev.map(c => 
        c.id === modal.data.colId ? { ...c, title: inputValue } : c
      ));
    } else if (modal.type === 'add-job') {
      if (!inputValue) return;
      const newJob: Job = {
        id: Math.random().toString(36).substr(2, 9),
        company: inputValue,
        position: subInputValue || 'Job Position',
        date: new Date().toLocaleDateString(),
      };
      setColumns(prev => prev.map(col => 
        col.id === modal.data.colId ? { ...col, jobs: [...col.jobs, newJob] } : col
      ));
    } else if (modal.type === 'edit-job') {
      if (!inputValue) return;
      setColumns(prev => prev.map(col => 
        col.id === modal.data.colId 
          ? { 
              ...col, 
              jobs: col.jobs.map(job => 
                job.id === modal.data.jobId 
                  ? { ...job, company: inputValue, position: subInputValue } 
                  : job
              ) 
            } 
          : col
      ));
    } else if (modal.type === 'delete-column') {
      setColumns(prev => prev.filter(c => c.id !== modal.data.colId));
    }

    setModal({ isOpen: false, type: null });
    setInputValue('');
  };

  const handleFileUpload = (jobId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setColumns(prev => prev.map(col => ({
        ...col,
        jobs: col.jobs.map(job => 
          job.id === jobId ? { ...job, pdfUrl: base64 } : job
        )
      })));
    };
    reader.readAsDataURL(file);
  };

  const downloadFile = (job: Job) => {
    if (!job.pdfUrl) return;
    const link = document.createElement('a');
    link.href = job.pdfUrl;
    link.download = `${job.company}-attachment.pdf`;
    link.click();
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfcfb]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  const sidebarLinks = [
    { name: 'Resume', icon: FileText, href: '/dashboard' },
    { name: 'Cover Letter', icon: Mail, href: '/cover-letters' },
    { name: 'Job Tracker', icon: Target, href: '/job-tracker', active: true },
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
        <div className="max-w-full">
          <div className="mb-10 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Job Tracker</h1>
              <p className="text-gray-500 mt-2">Track and manage all your job applications in one place.</p>
            </div>
            {saving && (
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100 animate-in fade-in zoom-in duration-300">
                <Loader2 className="h-3 w-3 animate-spin text-[#ff4d7d]" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Saving...</span>
              </div>
            )}
          </div>

          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-6 overflow-x-auto pb-6">
              {columns.map((column) => (
                <div key={column.id} className="min-w-[300px] flex flex-col">
                  <div className="flex items-center justify-between mb-4 px-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900">{column.title}</h3>
                      <span className="bg-gray-100 text-gray-500 text-xs font-bold px-2 py-0.5 rounded-full">{column.jobs.length}</span>
                    </div>
                    <div className="relative">
                      <button 
                        onClick={() => setColMenuOpen(colMenuOpen === column.id ? null : column.id)}
                        className="p-1 hover:bg-gray-100 rounded-md"
                      >
                        <MoreVertical className="h-4 w-4 text-gray-400" />
                      </button>
                      
                      {colMenuOpen === column.id && (
                        <div className="absolute right-0 mt-1 w-32 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-20 animate-in fade-in slide-in-from-top-1">
                          <button
                            onClick={() => editColumnTitle(column.id)}
                            className="flex w-full items-center gap-2 px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                          >
                            Edit Title
                          </button>
                          <button
                            onClick={() => deleteColumn(column.id)}
                            className="flex w-full items-center gap-2 px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <Droppable droppableId={column.id}>
                    {(provided, snapshot) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={`flex-1 min-h-[500px] p-2 rounded-xl transition-colors ${
                          snapshot.isDraggingOver ? 'bg-gray-100/50' : 'bg-transparent'
                        }`}
                      >
                        <button
                          onClick={() => addCard(column.id)}
                          className="w-full flex items-center justify-center gap-2 p-3 mb-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-[#ff4d7d] hover:text-[#ff4d7d] hover:bg-white transition-all"
                        >
                          <Plus className="h-4 w-4" />
                          <span className="text-sm font-bold">Add card</span>
                        </button>

                        {column.jobs.map((job, index) => (
                          <Draggable key={job.id} draggableId={job.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`bg-white p-5 rounded-xl border border-gray-100 shadow-sm mb-3 group hover:shadow-md transition-all ${
                                  snapshot.isDragging ? 'rotate-2 shadow-xl border-[#ff4d7d]' : ''
                                }`}
                              >
                                <div className="flex items-start justify-between mb-4">
                                  <div className="cursor-pointer flex-1" onClick={() => editCard(column.id, job)}>
                                    <h4 className="font-bold text-gray-900 group-hover:text-[#ff4d7d] transition-colors">{job.company}</h4>
                                    <p className="text-sm text-gray-500 mt-1">{job.position}</p>
                                  </div>
                                  <GripVertical className="h-4 w-4 text-gray-300 cursor-grab active:cursor-grabbing" />
                                </div>
                                
                                {job.thumbnail && (
                                  <div className="mb-4 rounded-xl overflow-hidden border border-gray-100 aspect-[1/1.4] bg-gray-50">
                                    <img src={job.thumbnail} alt="PDF Preview" className="w-full h-full object-cover" />
                                  </div>
                                )}
                                
                                <div className="flex items-center justify-between mt-6">
                                  <div className="flex items-center gap-2">
                                    <div className="relative">
                                      <input
                                        type="file"
                                        id={`file-${job.id}`}
                                        className="hidden"
                                        accept=".pdf,.doc,.docx"
                                        onChange={(e) => handleFileUpload(job.id, e)}
                                      />
                                      {job.pdfUrl ? (
                                        <button 
                                          onClick={() => downloadFile(job)}
                                          className="p-2 bg-[#fff0f3] text-[#ff4d7d] rounded-lg hover:bg-[#ffdee5] transition-all"
                                          title="Download attachment"
                                        >
                                          <Download className="h-4 w-4" />
                                        </button>
                                      ) : (
                                        <label 
                                          htmlFor={`file-${job.id}`}
                                          className="p-2 bg-gray-50 text-gray-400 rounded-lg hover:text-[#ff4d7d] hover:bg-[#fff0f3] transition-all cursor-pointer block"
                                          title="Upload attachment"
                                        >
                                          <FileUp className="h-4 w-4" />
                                        </label>
                                      )}
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{job.date}</span>
                                  </div>
                                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-2 text-gray-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
              
              <button 
                onClick={addColumn}
                className="min-w-[300px] h-[58px] border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center gap-2 text-gray-400 hover:border-[#ff4d7d] hover:text-[#ff4d7d] hover:bg-white transition-all"
              >
                <Plus className="h-4 w-4" />
                <span className="text-sm font-bold">Add Column</span>
              </button>
            </div>
          </DragDropContext>
        </div>
      </main>

      {/* Custom Modal */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-[#1a1a1a]/40 backdrop-blur-sm" 
            onClick={() => setModal({ isOpen: false, type: null })} 
          />
          <div className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-10">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                  {modal.type === 'add-column' && 'Add Column'}
                  {modal.type === 'edit-column' && 'Edit Column Title'}
                  {modal.type === 'add-job' && 'Add Job Application'}
                  {modal.type === 'delete-column' && 'Delete Column'}
                </h2>
                <button 
                  onClick={() => setModal({ isOpen: false, type: null })}
                  className="p-2 hover:bg-gray-50 rounded-xl transition-all"
                >
                  <Plus className="h-5 w-5 text-gray-400 rotate-45" />
                </button>
              </div>

              {modal.type === 'delete-column' ? (
                <div className="space-y-8">
                  <p className="text-gray-500 font-medium leading-relaxed">
                    Are you sure you want to delete this column? All tasks inside will be permanently removed.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setModal({ isOpen: false, type: null })}
                      className="flex-1 px-6 py-3 bg-gray-50 text-gray-600 font-bold rounded-xl hover:bg-gray-100 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleModalSubmit}
                      className="flex-1 px-6 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleModalSubmit} className="space-y-8">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">
                        {modal.type?.includes('job') ? 'Company Name' : 'Title'}
                      </label>
                      <Input
                        autoFocus
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder={modal.type?.includes('job') ? 'e.g. Google' : 'e.g. Interview'}
                        className="h-14 bg-gray-50 border-none rounded-xl focus-visible:ring-2 focus-visible:ring-[#ff4d7d]/20 px-6 text-base font-medium"
                      />
                    </div>

                    {modal.type?.includes('job') && (
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">
                          Job Position
                        </label>
                        <Input
                          value={subInputValue}
                          onChange={(e) => setSubInputValue(e.target.value)}
                          placeholder="e.g. Frontend Developer"
                          className="h-14 bg-gray-50 border-none rounded-xl focus-visible:ring-2 focus-visible:ring-[#ff4d7d]/20 px-6 text-base font-medium"
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setModal({ isOpen: false, type: null })}
                      className="flex-1 px-6 py-3 bg-gray-50 text-gray-600 font-bold rounded-xl hover:bg-gray-100 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-6 py-3 bg-[#ff4d7d] text-white font-bold rounded-xl hover:bg-[#ff3366] transition-all shadow-lg shadow-[#ff4d7d]/20 active:scale-[0.98]"
                    >
                      {modal.type?.startsWith('add') ? 'Create' : 'Save'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
