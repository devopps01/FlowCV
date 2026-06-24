'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Plus, Loader2, MoreVertical, Trash2, GripVertical } from 'lucide-react';
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay, PointerSensor, useSensor, useSensors, rectIntersection, useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';

interface Job { id: string; company: string; position: string; date: string; status: string; }
interface Column { id: string; title: string; jobs: Job[]; }
const STATUS: Record<string, string> = { wishlist: 'saved', applied: 'applied', interview: 'interviewing', offer: 'offer', rejected: 'rejected' };
const COLS: Column[] = [{ id: 'wishlist', title: 'Wishlist', jobs: [] }, { id: 'applied', title: 'Applied', jobs: [] }, { id: 'interview', title: 'Interview', jobs: [] }, { id: 'offer', title: 'Offer', jobs: [] }, { id: 'rejected', title: 'Rejected', jobs: [] }];
const uid = () => Math.random().toString(36).substring(2, 11);

function Card({ job, colId, onEdit, onDelete }: { job: Job; colId: string; onEdit: (c: string, j: Job) => void; onDelete: (c: string, id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: job.id });
  const t = transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined;
  return (
    <div ref={setNodeRef} {...attributes} {...listeners} style={{ transform: t, opacity: isDragging ? 0.4 : 1, marginBottom: 8, background: 'var(--app-bg-card)', border: '1.5px solid var(--app-border)', boxShadow: 'var(--app-shadow-md)', padding: '14px 16px', borderRadius: 12, minHeight: 80, cursor: 'grab', position: 'relative', zIndex: isDragging ? 999 : 1 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => onEdit(colId, job)}>
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--app-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.company || 'Untitled'}</div>
          <div style={{ fontSize: 12, marginTop: 2, color: 'var(--app-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.position || 'No position'}</div>
        </div>
        <GripVertical size={14} style={{ color: 'var(--app-text-muted)', flexShrink: 0, opacity: 0.5 }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, paddingTop: 8, borderTop: '1px solid var(--app-border)' }}>
        <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--app-text-muted)' }}>{job.date}</span>
        <button onClick={(e) => { e.stopPropagation(); onDelete(colId, job.id); }} style={{ padding: 4, color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', display: 'flex' }}><Trash2 size={12} /></button>
      </div>
    </div>
  );
}

function DropCol({ column, onEditJob, onDeleteJob, onAddJob }: { column: Column; onEditJob: (c: string, j: Job) => void; onDeleteJob: (c: string, id: string) => void; onAddJob: (c: string) => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  return (
    <div ref={setNodeRef} style={{ flex: 1, minHeight: column.jobs.length === 0 ? 100 : 'auto', padding: 6, borderRadius: 12, background: isOver ? 'rgba(168,85,247,0.08)' : 'transparent', border: isOver ? '2px dashed var(--app-primary)' : '1px dashed var(--app-border)', transition: 'all 0.15s ease' }}>
      <button onClick={() => onAddJob(column.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 10, marginBottom: 8, border: '2px dashed var(--app-border)', borderRadius: 10, color: 'var(--app-text-muted)', background: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}><Plus size={14} /> Add</button>
      {column.jobs.map(job => <Card key={job.id} job={job} colId={column.id} onEdit={onEditJob} onDelete={onDeleteJob} />)}
    </div>
  );
}

export default function JobTrackerPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [columns, setColumns] = useState<Column[]>(COLS.map(c => ({ ...c, jobs: [] })));
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [menuCol, setMenuCol] = useState<string | null>(null);
  const [modal, setModal] = useState<{ open: boolean; mode: string; colId?: string; jobId?: string; company?: string; position?: string; title?: string }>({ open: false, mode: '' });
  const [delConfirm, setDelConfirm] = useState<{ open: boolean; colId: string; jobId: string; company: string }>({ open: false, colId: '', jobId: '', company: '' });
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  useEffect(() => { if (status === 'unauthenticated') router.push('/login'); else if (status === 'authenticated') loadData(); }, [status]);

  async function loadData() {
    try {
      const r = await fetch('/api/job-tracker'); const j = await r.json();
      if (j.jobs) {
        const cols = COLS.map(c => ({ ...c, jobs: [] as Job[] }));
        for (const job of j.jobs) { const k = Object.entries(STATUS).find(([, v]) => v === job.status)?.[0] || 'wishlist'; cols.find(c => c.id === k)?.jobs.push({ id: job._id || job.id, company: job.company || '', position: job.title || '', date: job.appliedDate || job.createdAt?.split('T')[0] || '', status: job.status }); }
        setColumns(cols);
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }

  async function createJob(job: { company: string; position: string; status: string; colId: string }) {
    try {
      const r = await fetch('/api/job-tracker', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ company: job.company, title: job.position, status: job.status }) });
      const data = await r.json();
      if (data.job) {
        // Add the real MongoDB card to state (not a temp uid)
        const newJob: Job = { id: data.job._id, company: data.job.company, position: data.job.title, date: data.job.createdAt?.split('T')[0] || new Date().toLocaleDateString(), status: data.job.status };
        setColumns(prev => prev.map(c => c.id === job.colId ? { ...c, jobs: [...c.jobs, newJob] } : c));
      }
    } catch { toast.error('Failed to create'); }
  }

  async function deleteJob(jobId: string) {
    try { await fetch('/api/job-tracker', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jobId }) }); } catch { toast.error('Delete failed'); }
  }

  async function patchStatus(jobId: string, st: string) {
    try { await fetch('/api/job-tracker', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jobId, status: st }) }); } catch { toast.error('Sync failed'); }
  }

  function handleDragStart(e: DragStartEvent) { setActiveId(String(e.active.id)); }

  function handleDragEnd(e: DragEndEvent) {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;
    const aId = String(active.id); const oId = String(over.id);
    const src = columns.find(c => c.jobs.some(j => j.id === aId));
    if (!src) return;
    let tgt = columns.find(c => c.id === oId) || columns.find(c => c.jobs.some(j => j.id === oId));
    if (!tgt || src.id === tgt.id) return;
    setColumns(prev => {
      const cols = prev.map(c => ({ ...c, jobs: [...c.jobs] }));
      const s = cols.find(c => c.id === src.id)!; const d = cols.find(c => c.id === tgt!.id)!;
      const idx = s.jobs.findIndex(j => j.id === aId); if (idx === -1) return prev;
      const [moved] = s.jobs.splice(idx, 1); moved.status = STATUS[tgt!.id] || 'saved'; d.jobs.push(moved);
      patchStatus(moved.id, moved.status);
      return cols;
    });
  }

  function openModal(mode: string, opts?: any) { setModal({ open: true, mode, colId: opts?.colId, jobId: opts?.jobId, company: opts?.company || '', position: opts?.position || '', title: opts?.title || '' }); }

  function handleModal(e: React.FormEvent) {
    e.preventDefault();

    // Handle add-job separately — NOT inside setColumns updater!
    // React StrictMode double-invokes updaters, which would cause duplicate API calls.
    if (modal.mode === 'add-job') {
      if (!modal.company) return;
      createJob({
        company: modal.company,
        position: modal.position || 'Job Position',
        status: STATUS[modal.colId || 'wishlist'] || 'saved',
        colId: modal.colId || 'wishlist',
      });
      setModal({ open: false, mode: '' });
      return;
    }

    setColumns(prev => {
      const cols = prev.map(c => ({ ...c, jobs: [...c.jobs] }));
      if (modal.mode === 'add-col') { if (!modal.title) return prev; cols.push({ id: modal.title.toLowerCase().replace(/\s+/g, '-'), title: modal.title, jobs: [] }); }
      else if (modal.mode === 'edit-col') { const c = cols.find(x => x.id === modal.colId); if (c) c.title = modal.title || c.title; }
      else if (modal.mode === 'edit-job') { const c = cols.find(x => x.id === modal.colId); const j = c?.jobs.find(x => x.id === modal.jobId); if (j) { j.company = modal.company || j.company; j.position = modal.position || j.position; } }
      else if (modal.mode === 'del-col') { const i = cols.findIndex(x => x.id === modal.colId); if (i >= 0) cols.splice(i, 1); }
      return cols;
    });
    setModal({ open: false, mode: '' });
  }

  function deleteCard(colId: string, jobId: string) {
    const cols = columns.find(c => c.id === colId);
    const job = cols?.jobs.find(j => j.id === jobId);
    setDelConfirm({ open: true, colId, jobId, company: job?.company || 'this card' });
  }

  function confirmDelete() {
    setColumns(prev => prev.map(c => c.id === delConfirm.colId ? { ...c, jobs: c.jobs.filter(j => j.id !== delConfirm.jobId) } : c));
    deleteJob(delConfirm.jobId);
    setDelConfirm({ open: false, colId: '', jobId: '', company: '' });
  }

  if (status === 'loading' || loading) return <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--app-bg)' }}><Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--app-primary)' }} /></div>;

  const activeJob = activeId ? columns.flatMap(c => c.jobs).find(j => j.id === activeId) : null;

  return (
    <div style={{ background: 'var(--app-bg-gray)', minHeight: '100vh' }}>
      <main className="p-6 lg:p-10">
        <div className="max-w-full">
          <div className="mb-8">
            <h1 className="text-3xl font-black" style={{ color: 'var(--app-text)' }}>Job Tracker</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--app-text-secondary)' }}>Track and manage your job applications.</p>
          </div>
          <DndContext sensors={sensors} collisionDetection={rectIntersection} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="flex gap-6 overflow-x-auto pb-6">
              {columns.map(col => (
                <div key={col.id} style={{ minWidth: 280, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, padding: '0 4px', position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--app-text)' }}>{col.title}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--app-text-muted)', background: 'var(--app-bg-medium)', padding: '2px 8px', borderRadius: 9999 }}>{col.jobs.length}</span>
                    </div>
                    <button onClick={() => setMenuCol(menuCol === col.id ? null : col.id)} style={{ padding: 4, borderRadius: 6, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--app-text-muted)' }}><MoreVertical size={15} /></button>
                    {menuCol === col.id && (
                      <div style={{ position: 'absolute', right: 0, top: 28, width: 128, background: 'var(--app-bg-card)', borderRadius: 10, boxShadow: 'var(--app-shadow-lg)', border: '1px solid var(--app-border)', padding: '4px 0', zIndex: 20 }}>
                        <button onClick={() => { openModal('edit-col', { colId: col.id, title: col.title }); setMenuCol(null); }} style={{ width: '100%', padding: '8px 16px', fontSize: 11, fontWeight: 700, color: 'var(--app-text-secondary)', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }}>Edit Title</button>
                        <button onClick={() => { openModal('del-col', { colId: col.id }); setMenuCol(null); }} style={{ width: '100%', padding: '8px 16px', fontSize: 11, fontWeight: 700, color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }}>Delete</button>
                      </div>
                    )}
                  </div>
                  <DropCol column={col} onEditJob={(c, j) => openModal('edit-job', { colId: c, jobId: j.id, company: j.company, position: j.position })} onDeleteJob={deleteCard} onAddJob={(c) => openModal('add-job', { colId: c })} />
                </div>
              ))}
              <button onClick={() => openModal('add-col')} style={{ minWidth: 280, height: 56, border: '2px dashed var(--app-border)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'var(--app-text-muted)', background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, flexShrink: 0 }}><Plus size={16} /> Add Column</button>
            </div>
            <DragOverlay dropAnimation={null}>
              {activeJob ? <div style={{ background: 'var(--app-bg-card)', border: '1.5px solid var(--app-primary)', boxShadow: '0 16px 32px rgba(0,0,0,0.15)', padding: '14px 16px', borderRadius: 12, minHeight: 80, transform: 'rotate(3deg)', opacity: 0.95, width: 260 }}><div style={{ fontWeight: 700, fontSize: 14, color: 'var(--app-text)' }}>{activeJob.company || 'Untitled'}</div><div style={{ fontSize: 12, marginTop: 2, color: 'var(--app-text-secondary)' }}>{activeJob.position || 'No position'}</div></div> : null}
            </DragOverlay>
          </DndContext>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {delConfirm.open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#1a1a1a]/40 backdrop-blur-sm" onClick={() => setDelConfirm({ open: false, colId: '', jobId: '', company: '' })} />
          <div style={{ position: 'relative', width: '100%', maxWidth: 400, background: 'var(--app-bg-card)', borderRadius: 16, boxShadow: 'var(--app-shadow-lg)', padding: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 900, color: 'var(--app-text)', marginBottom: 16 }}>Delete Card</h2>
            <p style={{ color: 'var(--app-text-secondary)', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>Are you sure you want to delete <strong style={{ color: 'var(--app-text)' }}>{delConfirm.company}</strong>? This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setDelConfirm({ open: false, colId: '', jobId: '', company: '' })} style={{ flex: 1, padding: '12px 0', background: 'var(--app-bg-gray)', color: 'var(--app-text-secondary)', fontWeight: 700, fontSize: 13, borderRadius: 10, border: 'none', cursor: 'pointer' }}>Cancel</button>
              <button onClick={confirmDelete} style={{ flex: 1, padding: '12px 0', background: '#ef4444', color: '#fff', fontWeight: 700, fontSize: 13, borderRadius: 10, border: 'none', cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* CRUD Modal */}
      {modal.open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#1a1a1a]/40 backdrop-blur-sm" onClick={() => setModal({ open: false, mode: '' })} />
          <div style={{ position: 'relative', width: '100%', maxWidth: 440, background: 'var(--app-bg-card)', borderRadius: 16, boxShadow: 'var(--app-shadow-lg)', padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 900, color: 'var(--app-text)' }}>{modal.mode === 'add-col' ? 'Add Column' : modal.mode === 'edit-col' ? 'Edit Column' : modal.mode === 'add-job' ? 'Add Job' : modal.mode === 'edit-job' ? 'Edit Job' : 'Delete Column'}</h2>
              <button onClick={() => setModal({ open: false, mode: '' })} style={{ padding: 6, borderRadius: 8, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--app-text-muted)' }}><Plus size={18} style={{ transform: 'rotate(45deg)' }} /></button>
            </div>
            {modal.mode === 'del-col' ? (
              <div><p style={{ color: 'var(--app-text-secondary)', fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>Delete this column and all its cards?</p><div style={{ display: 'flex', gap: 10 }}><button onClick={() => setModal({ open: false, mode: '' })} style={{ flex: 1, padding: '12px 0', background: 'var(--app-bg-gray)', color: 'var(--app-text-secondary)', fontWeight: 700, fontSize: 13, borderRadius: 10, border: 'none', cursor: 'pointer' }}>Cancel</button><button onClick={handleModal} style={{ flex: 1, padding: '12px 0', background: '#ef4444', color: '#fff', fontWeight: 700, fontSize: 13, borderRadius: 10, border: 'none', cursor: 'pointer' }}>Delete</button></div></div>
            ) : (
              <form onSubmit={handleModal}>
                <div style={{ marginBottom: 16 }}><label style={{ fontSize: 10, fontWeight: 700, color: 'var(--app-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 4 }}>{modal.mode.includes('job') ? 'Company Name' : 'Title'}</label><Input autoFocus value={modal.mode.includes('job') ? modal.company || '' : modal.title || ''} onChange={e => setModal({ ...modal, [modal.mode.includes('job') ? 'company' : 'title']: e.target.value })} placeholder={modal.mode.includes('job') ? 'e.g. Google' : 'e.g. Interview'} className="h-12 bg-gray-50 border-none rounded-xl px-5 text-sm font-medium" /></div>
                {modal.mode.includes('job') && <div style={{ marginBottom: 16 }}><label style={{ fontSize: 10, fontWeight: 700, color: 'var(--app-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 4 }}>Position</label><Input value={modal.position || ''} onChange={e => setModal({ ...modal, position: e.target.value })} placeholder="e.g. Frontend Developer" className="h-12 bg-gray-50 border-none rounded-xl px-5 text-sm font-medium" /></div>}
                <div style={{ display: 'flex', gap: 10 }}><button type="button" onClick={() => setModal({ open: false, mode: '' })} style={{ flex: 1, padding: '12px 0', background: 'var(--app-bg-gray)', color: 'var(--app-text-secondary)', fontWeight: 700, fontSize: 13, borderRadius: 10, border: 'none', cursor: 'pointer' }}>Cancel</button><button type="submit" style={{ flex: 1, padding: '12px 0', background: 'var(--app-primary)', color: '#fff', fontWeight: 700, fontSize: 13, borderRadius: 10, border: 'none', cursor: 'pointer' }}>{modal.mode.startsWith('add') ? 'Create' : 'Save'}</button></div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}