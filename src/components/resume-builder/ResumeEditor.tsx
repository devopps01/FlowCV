'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Loader2, FileDown, ZoomIn, ZoomOut, RotateCcw,
  Save, Share2, Printer, Undo2, Redo2, Copy,
  Clipboard, FileText, Palette, ArrowLeft,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

import { ResumeData } from './types';
import ResumePreview from './ResumePreview';
import ContentEditor from './ContentEditor';
import DesignEditor from './DesignEditor';
import TemplateModal from './TemplateModal';
import { DESIGN_PRESETS } from './design-presets';
import { EditorTopBar } from './EditorTopBar';
import { InlineEditor } from './InlineEditor';

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
  const [history, setHistory] = useState<ResumeData[]>([initialData]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [clipboard, setClipboard] = useState<any>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  // Build template list from design presets (first 200 for performance)
  const builtTemplates = useMemo(() => {
    return DESIGN_PRESETS.slice(0, 200).map(preset => ({
      mainsection: {
        id: preset.id,
        name: preset.name,
        resumeinfo: { isPremium: false },
      },
      secondary: {
        style: { ...initialData.design, ...preset.designPatch },
        data: {},
      },
    }));
  }, [initialData.design]);

  const handleSave = async (showToast: boolean = true) => {
    if (saving) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/resumes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: data.title,
          template: data.template,
          content: data.content,
          design: data.design,
          activeSections: data.activeSections,
        }),
      });

      if (response.ok) {
        if (showToast) toast.success('Changes saved', { icon: '💾' });
      } else {
        throw new Error('Save failed');
      }
    } catch (e) {
      if (showToast) toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    // Auto-save with 500ms delay
    const timeoutId = setTimeout(() => handleSave(false), 500);
    return () => clearTimeout(timeoutId);
  }, [data, id]);

  // A4 Pagination Logic — measure actual rendered content height
  useEffect(() => {
    const el = previewRef.current;
    if (!el) return;

    const A4_PX = 1122; // 297mm at 96dpi
    // Only create a new page if content overflows by more than 80px (about 21mm)
    // This prevents near-empty second pages from appearing
    const PAGE_THRESHOLD = 80;

    const measure = () => {
      // Walk all child elements to find the true bottom of content
      let maxBottom = 0;
      const elRect = el.getBoundingClientRect();

      el.querySelectorAll('*').forEach(child => {
        const rect = (child as HTMLElement).getBoundingClientRect();
        const bottom = rect.bottom - elRect.top;
        if (bottom > maxBottom) maxBottom = bottom;
      });

      // Also check the element itself
      const elHeight = elRect.height;
      const contentHeight = Math.max(elHeight, maxBottom);

      // Only add a page if content meaningfully overflows
      const pages = contentHeight > A4_PX + PAGE_THRESHOLD
        ? Math.ceil(contentHeight / A4_PX)
        : 1;

      setNumPages(Math.max(1, pages));
    };

    // Delay first measure to let fonts/images/layout settle
    const t = setTimeout(measure, 200);

    const ro = new ResizeObserver(() => {
      clearTimeout(t);
      setTimeout(measure, 50);
    });
    ro.observe(el);

    return () => { clearTimeout(t); ro.disconnect(); };
  }, [data]);

  // History management
  const addToHistory = useCallback((newData: ResumeData) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newData);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setData(history[newIndex]);
      toast.success('Undo successful');
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setData(history[newIndex]);
      toast.success('Redo successful');
    }
  }, [history, historyIndex]);

  // Update nested data
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

  // Copy/Paste functionality
  const copySection = useCallback(() => {
    if (selectedSectionId) {
      const sectionData = data[selectedSectionId as keyof ResumeData];
      setClipboard({ type: 'section', data: sectionData });
      toast.success('Section copied');
    }
  }, [selectedSectionId, data]);

  const pasteSection = useCallback(() => {
    if (clipboard && clipboard.type === 'section') {
      const newSectionId = `${clipboard.type}_${Date.now()}`;
      setData(prev => ({
        ...prev,
        [newSectionId]: clipboard.data
      }));
      toast.success('Section pasted');
    }
  }, [clipboard]);

  // Export PDF with improved quality
  const exportPDF = useCallback(async () => {
    const el = document.getElementById('resume-preview');
    if (!el) return;

    const originalZoom = zoomLevel;
    if (zoomLevel !== 100) setZoomLevel(100);

    setIsExporting(true);
    toast.loading('Generating PDF...', { id: 'pdf' });

    try {
      // 1. Ensure the selected font is loaded in the current document
      const fontFamily = data.design.fontFamily || 'Inter';
      const fontQuery = fontFamily.replace(/\s+/g, '+');
      const fontUrl = `https://fonts.googleapis.com/css2?family=${fontQuery}:wght@400;500;600;700;900&display=swap`;

      // Inject font if not already present
      const existingLink = document.querySelector(`link[href*="${fontQuery}"]`);
      if (!existingLink) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = fontUrl;
        document.head.appendChild(link);
      }

      // 2. Wait for all fonts to be ready (including the newly injected one)
      await document.fonts.ready;

      // 3. Extra wait to ensure font renders in DOM
      await new Promise(r => setTimeout(r, 300));

      // 4. Capture canvas — inject font into cloned doc
      const canvas = await html2canvas(el, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: data.design.backgroundColor || '#ffffff',
        scrollY: -window.scrollY,
        windowWidth: el.scrollWidth,
        windowHeight: el.scrollHeight,
        onclone: async (clonedDoc) => {
          // Inject the font stylesheet into the cloned document
          const clonedLink = clonedDoc.createElement('link');
          clonedLink.rel = 'stylesheet';
          clonedLink.href = fontUrl;
          clonedDoc.head.appendChild(clonedLink);

          // Copy all existing font stylesheets
          document.querySelectorAll('link[rel="stylesheet"]').forEach(l => {
            const href = (l as HTMLLinkElement).href;
            if (href.includes('fonts.googleapis') || href.includes('fonts.gstatic')) {
              const copy = clonedDoc.createElement('link');
              copy.rel = 'stylesheet';
              copy.href = href;
              clonedDoc.head.appendChild(copy);
            }
          });

          // Apply font-family explicitly to the resume element
          const clonedEl = clonedDoc.getElementById('resume-preview');
          if (clonedEl) {
            clonedEl.style.fontFamily = `'${fontFamily}', sans-serif`;
            clonedEl.style.height = 'auto';
            clonedEl.style.overflow = 'visible';
            clonedEl.style.transform = 'none';
            clonedEl.style.boxShadow = 'none';
          }

          // Wait for fonts in cloned doc
          await clonedDoc.fonts.ready;
        },
      });

      // 5. Split into A4 pages and build PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const pageHeightPx = Math.floor(canvas.width * (pdfHeight / pdfWidth));
      const totalPages = Math.max(1, Math.ceil(canvas.height / pageHeightPx));

      for (let page = 0; page < totalPages; page++) {
        const sy = page * pageHeightPx;
        const sHeight = Math.min(pageHeightPx, canvas.height - sy);

        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvas.width;
        pageCanvas.height = sHeight;
        const ctx = pageCanvas.getContext('2d');
        if (!ctx) throw new Error('Canvas context unavailable');

        ctx.drawImage(canvas, 0, sy, canvas.width, sHeight, 0, 0, canvas.width, sHeight);
        const imgData = pageCanvas.toDataURL('image/png', 1.0);

        if (page > 0) pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, (sHeight / canvas.width) * pdfWidth, undefined, 'FAST');
      }

      pdf.save(`${data.title || 'Resume'}.pdf`);
      toast.success('PDF exported!', { id: 'pdf' });
    } catch (err) {
      console.error(err);
      toast.error('Failed to export PDF', { id: 'pdf' });
    } finally {
      setIsExporting(false);
      if (originalZoom !== zoomLevel) setZoomLevel(originalZoom);
    }
  }, [data, zoomLevel]);

  // Print functionality
  const printResume = useCallback(() => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = document.getElementById('resume-preview')?.innerHTML;
    if (!printContent) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>${data.title || 'Resume'}</title>
          <style>
            body { margin: 0; font-family: ${data.design.fontFamily || 'Arial'}; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>${printContent}</body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  }, [data]);

  // Share functionality
  const shareResume = useCallback(async () => {
    try {
      const shareData = {
        title: data.title || 'My Resume',
        text: 'Check out my resume',
        url: window.location.href
      };

      if (navigator.share) {
        await navigator.share(shareData);
        toast.success('Resume shared successfully');
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Resume link copied to clipboard');
      }
    } catch (err) {
      console.error('Share failed', err);
      toast.error('Failed to share resume');
    }
  }, [data]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              redo();
            } else {
              undo();
            }
            break;
          case 'y':
            e.preventDefault();
            redo();
            break;
          case 's':
            e.preventDefault();
            exportPDF();
            break;
          case 'c':
            if (selectedSectionId) {
              e.preventDefault();
              copySection();
            }
            break;
          case 'v':
            if (clipboard) {
              e.preventDefault();
              pasteSection();
            }
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, exportPDF, copySection, pasteSection, selectedSectionId, clipboard]);

  return (
    <div className="flex flex-col h-screen overflow-hidden font-sans" style={{ background: 'var(--app-bg)' }}>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'var(--app-bg-card)',
            color: 'var(--app-text)',
            border: '1px solid var(--app-border)',
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: '600',
            boxShadow: 'var(--app-shadow-md)',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />

      {/* ── Top Bar ── */}
      <EditorTopBar
        data={data}
        updateDesign={(key, value) => updateNested(`design.${key}`, value)}
        updateNested={updateNested}
        onUndo={undo}
        onRedo={redo}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onSave={() => handleSave(true)}
        onExport={exportPDF}
        onPrint={printResume}
        onShare={shareResume}
        saving={saving}
        isExporting={isExporting}
        zoomLevel={zoomLevel}
        onZoomIn={() => setZoomLevel(z => Math.min(z + 10, 150))}
        onZoomOut={() => setZoomLevel(z => Math.max(z - 10, 50))}
        onZoomReset={() => setZoomLevel(100)}
        numPages={numPages}
      />

      {/* ── Main area ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Left Sidebar ── */}
        <div
          className="w-[420px] flex flex-col border-r z-20 shrink-0 overflow-hidden"
          style={{ background: 'var(--app-bg-card)', borderColor: 'var(--app-border)' }}
        >
          {/* Back + Title */}
          <div
            className="px-4 py-3 flex items-center justify-between border-b shrink-0"
            style={{ borderColor: 'var(--app-border)' }}
          >
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 rounded-xl transition-all hover:bg-gray-100 group"
                style={{ color: 'var(--app-text-secondary)' }}
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              </button>
              <div>
                <input
                  value={data.title}
                  onChange={e => updateNested('title', e.target.value)}
                  className="text-sm font-black bg-transparent border-none focus:ring-0 w-36 truncate"
                  style={{ color: 'var(--app-text)' }}
                />
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${saving ? 'bg-orange-400 animate-pulse' : 'bg-green-400'}`} />
                  <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'var(--app-text-muted)' }}>
                    {saving ? 'Saving...' : 'Saved'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div
            className="flex mx-3 my-2 rounded-xl p-1"
            style={{ background: 'var(--app-bg-gray)' }}
          >
            <button
              onClick={() => setActiveTab('content')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === 'content'
                  ? 'shadow-sm'
                  : 'opacity-50 hover:opacity-75'
              }`}
              style={activeTab === 'content'
                ? { background: 'var(--app-bg-card)', color: 'var(--app-text)' }
                : { color: 'var(--app-text-secondary)' }}
            >
              <FileText className="w-3.5 h-3.5" /> Content
            </button>
            <button
              onClick={() => setActiveTab('design')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === 'design'
                  ? 'shadow-sm'
                  : 'opacity-50 hover:opacity-75'
              }`}
              style={activeTab === 'design'
                ? { background: 'var(--app-bg-card)', color: 'var(--app-text)' }
                : { color: 'var(--app-text-secondary)' }}
            >
              <Palette className="w-3.5 h-3.5" /> Design
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
            {activeTab === 'content' ? (
              <ContentEditor
                data={data}
                updateNested={updateNested}
                setData={setData}
              />
            ) : (
              <DesignEditor
                data={data}
                updateDesign={(key, value) => updateNested(`design.${key}`, value)}
                updateContent={updateNested}
                selectedSectionId={selectedSectionId || undefined}
                setSelectedSectionId={(id) => setSelectedSectionId(id || null)}
                onOpenTemplates={() => setShowTemplateModal(true)}
              />
            )}
          </div>
        </div>

        {/* ── Preview Area ── */}
        <div
          className="flex-1 min-h-0 flex flex-col relative"
          style={{ background: 'var(--app-bg-medium)', overflow: 'hidden' }}
          ref={previewContainerRef}
        >
          <InlineEditor
            data={data}
            updateNested={updateNested}
            containerRef={previewContainerRef}
            zoom={zoomLevel / 100}
          >
            <ResumePreview
              data={data}
              numPages={numPages}
              previewRef={previewRef}
              zoomLevel={zoomLevel}
              isExporting={isExporting}
              selectedSectionId={selectedSectionId}
              onSelectSection={(sid) => {
                setSelectedSectionId(sid);
                setActiveTab('design');
              }}
              onReorderSections={(newOrder) => updateNested('activeSections', newOrder)}
            />
          </InlineEditor>
        </div>
      </div>

      <TemplateModal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        templates={builtTemplates}
        isLoading={false}
        onSelect={(t) => {
          setData(prev => ({
            ...prev,
            template: t.mainsection?.id || t.id,
            design: { ...prev.design, ...(t.secondary?.style || {}) },
          }));
          setShowTemplateModal(false);
          toast.success(`Template applied: ${t.mainsection?.name || t.name}`);
        }}
        currentTemplateId={data.template}
      />
    </div>
  );
};

export default ResumeEditor;
