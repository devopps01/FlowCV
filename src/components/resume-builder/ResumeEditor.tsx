'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useResponsive } from '@/hooks/useResponsive';
import {
  Loader2, FileDown, ZoomIn, ZoomOut, RotateCcw,
  Save, Share2, Printer, Undo2, Redo2, Copy,
  Clipboard, FileText, Palette, ArrowLeft, Settings2,
  Sparkles, Menu, X, Eye, ChevronLeft,
  LayoutDashboard,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';

import { ResumeData } from './types';
import ResumePreview from './ResumePreview';
import ContentEditor from './ContentEditor';
import DesignEditor from './DesignEditor';
import AdvancedStylePanel from './AdvancedStylePanel';
import TemplateModal from './TemplateModal';
import { DESIGN_PRESETS } from './design-presets';
import { EditorTopBar } from './EditorTopBar';
import { InlineEditor } from './InlineEditor';
import { CollapsiblePanel } from '@/components/ui/CollapsiblePanel';

interface ResumeEditorProps {
  id: string;
  initialData: ResumeData;
  templates: any[];
}

const ResumeEditor: React.FC<ResumeEditorProps> = ({ id, initialData, templates }) => {
  const router = useRouter();
  const [data, setData] = useState<ResumeData>(initialData);
  const [activeTab, setActiveTab] = useState<'content' | 'design'>('content');
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [numPages, setNumPages] = useState(1);
  const [saving, setSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [showAdvancedStyle, setShowAdvancedStyle] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [editorWidth, setEditorWidth] = useState(380);
  const [isResizing, setIsResizing] = useState(false);
  const [history, setHistory] = useState<ResumeData[]>([initialData]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [clipboard, setClipboard] = useState<any>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const resizeRef = useRef<HTMLDivElement>(null);
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const isSmallScreen = isMobile || isTablet;

  const A4_WIDTH = 794;
  const A4_HEIGHT = 1123;
  // Calculate mobile zoom so A4 page fits screen width with padding
  const [screenWidth, setScreenWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 375);
  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const maxMobileWidth = screenWidth - 16;
  const mobileZoom = Math.min(Math.floor((maxMobileWidth / A4_WIDTH) * 100), 85);
  const mobileScaledHeight = Math.round(A4_HEIGHT * (mobileZoom / 100));
  const mobileNegativeMargin = A4_HEIGHT - mobileScaledHeight;
  const effectivePreviewZoom = isSmallScreen && previewOpen ? mobileZoom : zoomLevel;

  // Drag resize handler
  useEffect(() => {
    if (isSmallScreen || !isDesktop) return;
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = e.clientX;
      if (newWidth >= 300 && newWidth <= 900) {
        setEditorWidth(newWidth);
      }
    };
    const handleMouseUp = () => setIsResizing(false);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, isSmallScreen, isDesktop]);

  useEffect(() => {
    if (isSmallScreen) setSidebarCollapsed(false);
  }, [isSmallScreen]);

  const builtTemplates = useMemo(() => {
    return DESIGN_PRESETS.map(preset => ({
      mainsection: { id: preset.id, name: preset.name, resumeinfo: { isPremium: false } },
      secondary: { style: { ...initialData.design, ...preset.designPatch }, data: {} },
    }));
  }, [initialData.design]);

  const handleSave = async (showToast: boolean = true) => {
    if (saving) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/resumes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: data.title, template: data.template, content: data.content, design: data.design, activeSections: data.activeSections, styleOverrides: data.styleOverrides }),
      });
      if (response.ok) { if (showToast) toast.success('Changes saved', { icon: '💾', id: 'save-toast' }); }
      else throw new Error('Save failed');
    } catch (e) { if (showToast) toast.error('Save failed', { id: 'save-toast' }); }
    finally { setSaving(false); }
  };

  const captureScreenshot = useCallback(async () => {
    // Try multiple times to find the preview element — it may not be rendered yet
    let el = document.getElementById('resume-preview');
    if (!el) {
      await new Promise(r => setTimeout(r, 1000));
      el = document.getElementById('resume-preview');
    }
    if (!el) {
      await new Promise(r => setTimeout(r, 1000));
      el = document.getElementById('resume-preview');
    }
    if (!el) return false;
    try {
      const html2canvas = (await import('html2canvas')).default;
      await document.fonts.ready;
      await new Promise(r => setTimeout(r, 800));
      const canvas = await html2canvas(el, { scale: 0.5, useCORS: true, allowTaint: true, backgroundColor: '#ffffff', logging: false, width: el.offsetWidth, height: el.offsetHeight });
      const res = await fetch(`/api/resumes/${id}/screenshot`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ imageData: canvas.toDataURL('image/png') }) });
      return res.ok;
    } catch (err) { console.error('Screenshot capture failed:', err); }
    return false;
  }, [id]);

  // Auto-save on data change
  useEffect(() => { const t = setTimeout(() => handleSave(false), 500); return () => clearTimeout(t); }, [data, id]);
  // Auto-capture screenshot after data change (delayed)
  useEffect(() => { const t = setTimeout(() => captureScreenshot(), 4000); return () => clearTimeout(t); }, [data, id]);

  const goToDashboard = useCallback(async () => {
    // Force save first
    if (!saving) {
      await handleSave(false);
    }
    // Then capture screenshot synchronously
    await captureScreenshot();
    // Small delay to let screenshot API complete
    setTimeout(() => router.push('/dashboard'), 500);
  }, [id, saving, handleSave, captureScreenshot, router]);

  const addToHistory = useCallback((newData: ResumeData) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newData);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) { setHistoryIndex(historyIndex - 1); setData(history[historyIndex - 1]); toast.success('Undo successful'); }
  }, [history, historyIndex]);
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) { setHistoryIndex(historyIndex + 1); setData(history[historyIndex + 1]); toast.success('Redo successful'); }
  }, [history, historyIndex]);

  const updateNested = useCallback((path: string, value: any) => {
    setData(prev => {
      const newData = JSON.parse(JSON.stringify(prev));
      const keys = path.split(/[.[\]]+/).filter(Boolean);
      let current = newData;
      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!(key in current)) current[key] = isNaN(Number(keys[i + 1])) ? {} : [];
        current = current[key];
      }
      current[keys[keys.length - 1]] = value;
      addToHistory(newData);
      return newData;
    });
  }, [addToHistory]);

  const copySection = useCallback(() => {
    if (selectedSectionId) { setClipboard({ type: 'section', data: data[selectedSectionId as keyof ResumeData] }); toast.success('Section copied'); }
  }, [selectedSectionId, data]);
  const pasteSection = useCallback(() => {
    if (clipboard && clipboard.type === 'section') { setData(prev => ({ ...prev, [`${clipboard.type}_${Date.now()}`]: clipboard.data })); toast.success('Section pasted'); }
  }, [clipboard]);

  const exportPDF = useCallback(async () => {
    const pageElements = document.querySelectorAll('.resume-print-page');
    if (pageElements.length === 0) return;
    setIsExporting(true);
    toast.loading('Generating PDF...', { id: 'pdf' });
    try {
      await document.fonts.ready;
      await new Promise(r => setTimeout(r, 500));
      const fontFamily = data.design.fontFamily || 'Inter';
      const fontQuery = fontFamily.replace(/\s+/g, '+');
      const fontUrl = `https://fonts.googleapis.com/css2?family=${fontQuery}:wght@400;500;600;700;900&display=swap`;
      const allStyles = Array.from(document.styleSheets).map(sheet => { try { return Array.from(sheet.cssRules).map(r => r.cssText).join('\n'); } catch { return ''; } }).join('\n');
      const pageSizeKey = data.design.pageSize || 'a4';
      const PAGE_SIZES_MM: Record<string, { width: string; height: string }> = { a4: { width: '210mm', height: '297mm' }, letter: { width: '216mm', height: '279mm' }, legal: { width: '216mm', height: '356mm' }, a3: { width: '297mm', height: '420mm' }, b5: { width: '176mm', height: '250mm' }, a5: { width: '148mm', height: '210mm' } };
      const pageMM = PAGE_SIZES_MM[pageSizeKey] || PAGE_SIZES_MM.a4;
      const filteredPages = Array.from(pageElements).filter(el => el.querySelectorAll('[data-resume-section]').length > 0 || el.querySelectorAll('[data-resume-block]').length > 0 || el.querySelectorAll('img').length > 0);
      const pagesHtml = filteredPages.map(el => {
        const clone = el.cloneNode(true) as HTMLElement;
        const isLastPage = el === filteredPages[filteredPages.length - 1];
        clone.style.cssText = `width: ${pageMM.width} !important; height: ${pageMM.height} !important; transform: none !important; box-shadow: none !important; overflow: hidden !important; margin: 0 !important; border-radius: 0 !important; font-family: '${fontFamily}', sans-serif !important; page-break-after: ${isLastPage ? 'auto' : 'always'}; break-after: ${isLastPage ? 'auto' : 'page'};`;
        clone.querySelectorAll('[data-drag-handle]').forEach(e => e.remove());
        clone.querySelectorAll('.group\\/section > button').forEach(e => e.remove());
        return clone.outerHTML;
      }).join('\n');
      const response = await fetch('/api/export/pdf', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ html: `<!DOCTYPE html><html><head><link rel="stylesheet" href="${fontUrl}"><style>${allStyles}*,*::before,*::after{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}@page{size:${pageMM.width} ${pageMM.height};margin:0}</style></head><body>${pagesHtml}</body></html>`, title: data.title || 'Resume', pageSize: pageSizeKey }) });
      if (!response.ok) throw new Error('PDF generation failed');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `${data.title || 'Resume'}.pdf`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('PDF downloaded!', { id: 'pdf' });
    } catch (err: any) { toast.error('Failed to export PDF: ' + (err.message || 'Unknown error'), { id: 'pdf' }); }
    finally { setIsExporting(false); }
  }, [id, data]);

  const printResume = useCallback(() => {
    const pageElements = document.querySelectorAll('.resume-print-page');
    if (pageElements.length === 0) return;
    const pw = window.open('', '_blank');
    if (!pw) return;
    const fontFamily = data.design.fontFamily || 'Inter';
    const fontUrl = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/\s+/g, '+')}:wght@400;500;600;700;900&display=swap`;
    const pageSizeKey = data.design.pageSize || 'a4';
    const PAGE_SIZES_MM: Record<string, { width: string; height: string }> = { a4: { width: '210mm', height: '297mm' }, letter: { width: '216mm', height: '279mm' }, legal: { width: '216mm', height: '356mm' }, a3: { width: '297mm', height: '420mm' }, b5: { width: '176mm', height: '250mm' }, a5: { width: '148mm', height: '210mm' } };
    const pageMM = PAGE_SIZES_MM[pageSizeKey] || PAGE_SIZES_MM.a4;
    const pagesHtml = Array.from(pageElements).map(el => {
      const clone = el.cloneNode(true) as HTMLElement;
      clone.style.cssText = `width: ${pageMM.width} !important; height: ${pageMM.height} !important; min-height: auto !important; transform: none !important; box-shadow: none !important; overflow: hidden !important; margin: 0 !important; border-radius: 0 !important; font-family: '${fontFamily}', sans-serif !important; page-break-after: always; break-after: page;`;
      clone.querySelectorAll('[data-drag-handle]').forEach(e => e.remove());
      clone.querySelectorAll('.group\\/section > button').forEach(e => e.remove());
      return clone.outerHTML;
    }).join('\n');
    pw.document.write(`<!DOCTYPE html><html><head><link rel="stylesheet" href="${fontUrl}"><style>@page{size:${pageMM.width} ${pageMM.height};margin:0}*,*::before,*::after{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}</style></head><body>${pagesHtml}</body></html>`);
    pw.document.close();
    const doPrint = () => { pw.focus(); pw.print(); setTimeout(() => { if (!pw.closed) pw.close(); }, 1000); };
    if (pw.document.fonts) pw.document.fonts.ready.then(() => setTimeout(doPrint, 300)); else setTimeout(doPrint, 800);
  }, [data]);

  const shareResume = useCallback(async () => {
    try {
      if (navigator.share) { await navigator.share({ title: data.title || 'My Resume', text: 'Check out my resume', url: window.location.href }); toast.success('Resume shared successfully'); }
      else { await navigator.clipboard.writeText(window.location.href); toast.success('Resume link copied to clipboard'); }
    } catch { toast.error('Failed to share resume'); }
  }, [data]);

  return (
    <div className="flex flex-col h-screen font-sans" style={{ background: 'var(--app-bg)' }}>
      <Toaster position="top-center" toastOptions={{ duration: 3000, style: { background: 'var(--app-bg-card)', color: 'var(--app-text)', border: '1px solid var(--app-border)', borderRadius: '12px', fontSize: '13px', fontWeight: '600', boxShadow: 'var(--app-shadow-md)' }, success: { iconTheme: { primary: '#10b981', secondary: '#fff' } }, error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } } }} />

      {/* Top Bar */}
      {isDesktop ? (
        <div className="relative shrink-0" style={{ zIndex: 99999 }}>
          <EditorTopBar data={data} updateDesign={(k,v) => updateNested(`design.${k}`, v)} updateNested={updateNested}
            onUndo={undo} onRedo={redo} canUndo={historyIndex > 0} canRedo={historyIndex < history.length - 1}
            onSave={() => handleSave(true)} onExport={exportPDF} onPrint={printResume} onShare={shareResume}
            saving={saving} isExporting={isExporting} onMenuToggle={() => undefined}
            zoomLevel={zoomLevel} onZoomIn={() => setZoomLevel(z => Math.min(z + 10, 150))}
            onZoomOut={() => setZoomLevel(z => Math.max(z - 10, 50))} onZoomReset={() => setZoomLevel(100)} numPages={numPages}
            onDashboard={goToDashboard} />
        </div>
      ) : (
        <div className="flex items-center justify-between px-4 py-3 border-b shrink-0" style={{ background: 'var(--app-bg-card)', borderColor: 'var(--app-border)' }}>
          <div className="flex-1 pr-3">
            <input value={data.title} onChange={e => updateNested('title', e.target.value)} className="w-full text-sm font-black bg-transparent border-none focus:ring-0 truncate" style={{ color: 'var(--app-text)' }} placeholder="Resume title" />
            <div className="flex items-center gap-2 mt-2">
              <div className={`w-2.5 h-2.5 rounded-full ${saving ? 'bg-orange-400 animate-pulse' : 'bg-emerald-400'}`} />
              <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--app-text-muted)' }}>{saving ? 'Saving...' : 'Saved'}</span>
            </div>
          </div>
          <button onClick={() => setSettingsOpen(true)} className="p-2 rounded-xl hover:bg-gray-100" style={{ color: 'var(--app-text-secondary)' }}><Settings2 className="w-5 h-5" /></button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden relative">
        {!previewOpen || !isSmallScreen ? (
          <div className="flex flex-1 overflow-hidden">
              {/* Editor Panel — Collapsible with smooth animation */}
              <CollapsiblePanel
                collapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(v => !v)}
                expandedWidth={isSmallScreen ? 600 : editorWidth}
                collapsedWidth={48}
                duration={300}
                side="left"
                className={`pb-24 lg:pb-0 ${isSmallScreen ? 'flex-1' : ''}`}
                header={
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${saving ? 'bg-orange-400 animate-pulse' : 'bg-emerald-400'}`} />
                    <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'var(--app-text-muted)' }}>{saving ? 'Saving...' : 'Saved'}</span>
                    <span className="mx-2 text-[var(--app-border)]">|</span>
                    <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'var(--app-text-muted)' }}>{activeTab === 'content' ? 'Content' : 'Design'}</span>
                  </div>
                }
              >
                <div className="flex gap-1.5 px-3 pt-2 pb-1 shrink-0">
                  <button onClick={() => setActiveTab('content')} className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-center ${activeTab === 'content' ? 'bg-[var(--app-primary)] text-white' : 'text-[var(--app-text-secondary)] hover:bg-gray-100'}`}>
                    <FileText className="w-3.5 h-3.5 inline-block mr-1" /> Content
                  </button>
                  <button onClick={() => setActiveTab('design')} className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-center ${activeTab === 'design' ? 'bg-[var(--app-primary)] text-white' : 'text-[var(--app-text-secondary)] hover:bg-gray-100'}`}>
                    <Palette className="w-3.5 h-3.5 inline-block mr-1" /> Design
                  </button>
                </div>
                {/* NOTE: No overflow-y here — ContentEditor & DesignEditor handle
                    their own scrolling. overflow-y creates a stacking context that
                    clips native <select> dropdown menus (browser popups get cut off
                    by overflow:auto/hidden on any ancestor). */}
                <div className="flex-1 min-h-0 flex flex-col">
                  {activeTab === 'content' ? (
                    <ContentEditor data={data} updateNested={updateNested} setData={setData} onExport={exportPDF} isExporting={isExporting} />
                  ) : (
                    <DesignEditor data={data} updateDesign={(k,v) => updateNested(`design.${k}`, v)} updateContent={updateNested}
                      selectedSectionId={selectedSectionId || undefined} setSelectedSectionId={id => setSelectedSectionId(id || null)} onOpenTemplates={() => setShowTemplateModal(true)} />
                  )}
                </div>
              </CollapsiblePanel>

            {/* Resize Handle */}
            {isDesktop && (
              <div ref={resizeRef} className="w-2 cursor-col-resize shrink-0 relative group z-10" onMouseDown={() => setIsResizing(true)}>
                <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[4px] group-hover:bg-[var(--app-primary)]/50 transition-colors rounded-full" />
              </div>
            )}

            {/* Preview Panel */}
            {isDesktop && (
              <div className="min-h-0 flex flex-col relative" style={{ flex: 1, background: 'var(--app-bg-medium)' }}>
                <div className="flex-1 overflow-y-auto custom-scrollbar" ref={previewContainerRef}>
                  <InlineEditor data={data} updateNested={updateNested} containerRef={previewContainerRef} zoom={zoomLevel / 100}>
                    <ResumePreview data={data} numPages={numPages} previewRef={previewRef} zoomLevel={zoomLevel} isExporting={isExporting}
                      selectedSectionId={selectedSectionId} updateNested={updateNested}
                      onSelectSection={sid => { setSelectedSectionId(sid); setActiveTab('design'); }}
                      onReorderSections={newOrder => updateNested('activeSections', newOrder)} onPageCountChange={setNumPages} />
                  </InlineEditor>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="absolute inset-0 z-40 flex flex-col bg-[var(--app-bg)]">
            <div className="flex items-center justify-between px-3 py-2 border-b shrink-0" style={{ borderColor: 'var(--app-border)', background: 'var(--app-bg-card)' }}>
              <button onClick={() => setPreviewOpen(false)} className="flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-gray-100" style={{ color: 'var(--app-text)' }}>
                <ChevronLeft className="w-4 h-4" /> <span className="text-[11px] font-black">Editor</span>
              </button>
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${saving ? 'bg-orange-400 animate-pulse' : 'bg-emerald-400'}`} />
                <span className="text-[8px] font-black uppercase tracking-widest" style={{ color: 'var(--app-text-muted)' }}>{saving ? 'Saving' : 'Saved'}</span>
              </div>
            </div>
            <div className="flex-1 overflow-auto" style={{ background: 'var(--app-bg-medium)' }} ref={previewContainerRef}>
              <div style={{ width: `${A4_WIDTH}px`, margin: '16px auto' }}>
                <ResumePreview data={data} numPages={numPages} previewRef={previewRef} zoomLevel={mobileZoom} isExporting={isExporting}
                  selectedSectionId={selectedSectionId} updateNested={updateNested}
                  onSelectSection={sid => { setSelectedSectionId(sid); setActiveTab('design'); setPreviewOpen(false); }}
                  onReorderSections={newOrder => updateNested('activeSections', newOrder)} onPageCountChange={setNumPages} />
              </div>
            </div>
          </div>
        )}

        {settingsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-4 md:px-8 md:py-8">
            <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={() => setSettingsOpen(false)} />
            <div className="relative w-full max-w-[1040px] h-full md:h-auto rounded-3xl overflow-hidden shadow-2xl bg-[var(--app-bg-card)] border border-[var(--app-border)]">
              <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--app-border)' }}>
                <span className="text-sm font-black" style={{ color: 'var(--app-text)' }}>Settings</span>
                <button onClick={() => setSettingsOpen(false)} className="p-2 rounded-xl hover:bg-gray-100" style={{ color: 'var(--app-text-secondary)' }}><X className="w-5 h-5" /></button>
              </div>
              <div className="grid gap-3 md:grid-cols-2 p-4">
                <button onClick={() => handleSave(true)} className="flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black uppercase tracking-widest text-white" style={{ background: 'var(--app-primary)' }}><Save className="w-4 h-4" /> Save resume</button>
                <button onClick={exportPDF} className="flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black uppercase tracking-widest" style={{ background: 'var(--app-bg-medium)', color: 'var(--app-text)' }}><FileDown className="w-4 h-4" /> Download PDF</button>
                <button onClick={printResume} className="flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black uppercase tracking-widest" style={{ background: 'var(--app-bg-medium)', color: 'var(--app-text)' }}><Printer className="w-4 h-4" /> Print resume</button>
                <button onClick={shareResume} className="flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black uppercase tracking-widest" style={{ background: 'var(--app-bg-medium)', color: 'var(--app-text)' }}><Share2 className="w-4 h-4" /> Share resume</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Bottom Nav */}
      <div className={`${settingsOpen ? 'hidden' : 'lg:hidden'} fixed inset-x-0 bottom-0 z-[50] flex items-center justify-around border-t bg-[rgba(15,23,42,0.96)] px-2 py-2 shadow-[0_-10px_20px_rgba(0,0,0,0.12)]`} style={{ borderColor: 'rgba(148,163,184,0.12)', paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom, 0px))' }}>
        <button onClick={() => { setActiveTab('content'); setPreviewOpen(false); }} className={`flex flex-col items-center gap-1 py-2 px-2 rounded-2xl ${activeTab === 'content' && !previewOpen ? 'text-[var(--app-primary)]' : 'text-[var(--app-text-secondary)]'}`}>
          <FileText className="w-5 h-5" /> <span className="text-[9px] font-black uppercase">Content</span>
        </button>
        <button onClick={() => { setActiveTab('design'); setPreviewOpen(false); }} className={`flex flex-col items-center gap-1 py-2 px-2 rounded-2xl ${activeTab === 'design' && !previewOpen ? 'text-[var(--app-primary)]' : 'text-[var(--app-text-secondary)]'}`}>
          <Palette className="w-5 h-5" /> <span className="text-[9px] font-black uppercase">Design</span>
        </button>
        <button onClick={() => setPreviewOpen(true)} className={`flex flex-col items-center gap-1 py-2 px-2 rounded-2xl ${previewOpen ? 'text-[var(--app-primary)]' : 'text-[var(--app-text-secondary)]'}`}>
          <Eye className="w-5 h-5" /> <span className="text-[9px] font-black uppercase">Preview</span>
        </button>
        <button onClick={() => handleSave(true)} className="flex flex-col items-center gap-1 py-2 px-2 rounded-2xl text-[var(--app-text-secondary)]">
          <Save className="w-5 h-5" /> <span className="text-[9px] font-black uppercase">Save</span>
        </button>
        <button onClick={exportPDF} className="flex flex-col items-center gap-1 py-2 px-2 rounded-2xl text-[var(--app-text-secondary)]">
          <FileDown className="w-5 h-5" /> <span className="text-[9px] font-black uppercase">Export</span>
        </button>
      </div>

      <TemplateModal isOpen={showTemplateModal} onClose={() => setShowTemplateModal(false)} templates={builtTemplates} isLoading={false}
        onSelect={t => { setData(prev => ({ ...prev, template: t.mainsection?.id || t.id, design: { ...prev.design, ...(t.secondary?.style || {}) } })); setShowTemplateModal(false); toast.success(`Template applied: ${t.mainsection?.name || t.name}`); }}
        currentTemplateId={data.template} />
    </div>
  );
};

export default ResumeEditor;