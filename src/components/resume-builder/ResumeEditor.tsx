'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Loader2, FileDown, ZoomIn, ZoomOut, RotateCcw,
  Save, Share2, Printer, Undo2, Redo2, Copy,
  Clipboard, FileText, Palette, ArrowLeft,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';

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

  // Capture a screenshot of the resume and save it to the server
  const captureScreenshot = useCallback(async () => {
    const el = document.getElementById('resume-preview');
    if (!el) return;
    try {
      // Dynamically import html2canvas to avoid SSR issues
      const html2canvas = (await import('html2canvas')).default;
      // Wait for fonts/layout to settle
      await document.fonts.ready;
      await new Promise(r => setTimeout(r, 300));

      const canvas = await html2canvas(el, {
        scale: 0.5,           // 50% scale — enough for a thumbnail, small file size
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: el.offsetWidth,
        height: el.offsetHeight,
        windowWidth: el.offsetWidth,
        windowHeight: el.offsetHeight,
      });

      const imageData = canvas.toDataURL('image/png');

      // POST to screenshot API — fire and forget
      fetch(`/api/resumes/${id}/screenshot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageData }),
      }).catch(() => {/* silent fail */});
    } catch {
      // Screenshot capture is non-critical — fail silently
    }
  }, [id]);

  useEffect(() => {
    // Auto-save with 500ms delay
    const timeoutId = setTimeout(() => handleSave(false), 500);
    return () => clearTimeout(timeoutId);
  }, [data, id]);

  // Screenshot capture — debounced at 4s after last change (non-blocking)
  useEffect(() => {
    const timeoutId = setTimeout(() => captureScreenshot(), 4000);
    return () => clearTimeout(timeoutId);
  }, [data, id]);

  // numPages is now synced from ResumePreview via onPageCountChange

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

  // Export PDF — uses server-side Puppeteer for pixel-perfect output matching the preview
  const exportPDF = useCallback(async () => {
    const pageElements = document.querySelectorAll('.resume-page');
    if (pageElements.length === 0) return;

    setIsExporting(true);
    toast.loading('Generating PDF...', { id: 'pdf' });

    try {
      await document.fonts.ready;
      await new Promise(r => setTimeout(r, 600));

      const usedFonts = new Set<string>();
      usedFonts.add(data.design.fontFamily || 'Inter');
      if (data.styleOverrides) {
        Object.values(data.styleOverrides).forEach((style: any) => {
          if (style.fontFamily) usedFonts.add(style.fontFamily);
        });
      }
      
      const fontLinks = Array.from(usedFonts).map(font => {
        const query = font.replace(/\s+/g, '+');
        return `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=${query}:wght@400;500;600;700;900&display=swap">`;
      }).join('\n');

      const allStyles = Array.from(document.styleSheets)
        .map(sheet => {
          try { return Array.from(sheet.cssRules).map(r => r.cssText).join('\n'); }
          catch { return ''; }
        })
        .join('\n');

      const getAbsoluteUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http') || url.startsWith('data:')) return url;
        return `${window.location.origin}${url.startsWith('/') ? '' : '/'}${url}`;
      };

      const container = document.createElement('div');
      pageElements.forEach((el, index) => {
        const clone = el.cloneNode(true) as HTMLElement;
        clone.style.transform = 'none';
        clone.style.boxShadow = 'none';
        clone.style.margin = '0 auto 20px auto';
        clone.style.pageBreakAfter = index === pageElements.length - 1 ? 'auto' : 'always';
        
        clone.querySelectorAll('img').forEach(img => {
          const src = img.getAttribute('src');
          if (src) img.setAttribute('src', getAbsoluteUrl(src));
        });

        clone.querySelectorAll('[data-drag-handle]').forEach(e => e.remove());
        clone.querySelectorAll('.group\\/section > button').forEach(e => e.remove());
        
        container.appendChild(clone);
      });

      const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  ${fontLinks}
  <style>
    ${allStyles}
    body { margin: 0; background: #eee; }
    .resume-page {
      width: 794px;
      margin: 0 auto;
      background: white;
      box-sizing: border-box;
      overflow: hidden;
      page-break-after: always;
    }
  </style>
</head>
<body>${container.innerHTML}</body>
</html>`;

      const response = await fetch('/api/export/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html: fullHtml, title: data.title }),
      });

      if (!response.ok) throw new Error('PDF generation failed');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${data.title || 'Resume'}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('PDF downloaded!', { id: 'pdf' });
    } catch (err: any) {
      toast.error('Failed to export PDF', { id: 'pdf' });
    } finally {
      setIsExporting(false);
    }
  }, [id, data]);

  // Print functionality — proper A4 single-page print
  const printResume = useCallback(() => {
    const el = document.getElementById('resume-preview');
    if (!el) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const fontFamily = data.design.fontFamily || 'Inter';
    const fontQuery = fontFamily.replace(/\s+/g, '+');
    const fontUrl = `https://fonts.googleapis.com/css2?family=${fontQuery}:wght@400;500;600;700;900&display=swap`;

    // Collect all computed CSS rules
    const allStyles = Array.from(document.styleSheets)
      .map(sheet => {
        try { return Array.from(sheet.cssRules).map(r => r.cssText).join('\n'); }
        catch { return ''; }
      })
      .join('\n');

    // Clone and clean the resume element
    const clone = el.cloneNode(true) as HTMLElement;
    clone.style.cssText = `
      width: 210mm !important;
      min-height: auto !important;
      height: auto !important;
      transform: none !important;
      box-shadow: none !important;
      overflow: visible !important;
      margin: 0 !important;
      font-family: '${fontFamily}', sans-serif !important;
    `;
    // Remove interactive UI elements
    clone.querySelectorAll('[data-drag-handle]').forEach(e => e.remove());
    clone.querySelectorAll('.group\\/section > button').forEach(e => e.remove());
    // Ensure all children overflow visible
    clone.querySelectorAll('*').forEach(child => {
      const c = child as HTMLElement;
      if (c.style?.overflow === 'hidden') c.style.overflow = 'visible';
      if (c.style?.maxHeight) c.style.maxHeight = 'none';
    });

    printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${data.title || 'Resume'}</title>
  <link rel="stylesheet" href="${fontUrl}">
  <style>
    ${allStyles}
    *, *::before, *::after {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      box-sizing: border-box;
    }
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      background: white !important;
      width: 210mm;
    }
    @page {
      size: A4 portrait;
      margin: 0;
    }
    @media print {
      html, body { margin: 0 !important; padding: 0 !important; }
      #resume-preview {
        min-height: auto !important;
        height: auto !important;
        page-break-after: avoid;
        break-after: avoid;
      }
    }
  </style>
</head>
<body>${clone.outerHTML}</body>
</html>`);

    printWindow.document.close();

    const doPrint = () => {
      printWindow.focus();
      printWindow.print();
      setTimeout(() => { if (!printWindow.closed) printWindow.close(); }, 1000);
    };

    // Wait for fonts then print
    if (printWindow.document.fonts) {
      printWindow.document.fonts.ready.then(() => setTimeout(doPrint, 300));
    } else {
      setTimeout(doPrint, 800);
    }
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
                onExport={exportPDF}
                isExporting={isExporting}
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
          className="flex-1 min-h-0 flex flex-col relative overflow-auto custom-scrollbar"
          style={{ 
            background: 'var(--app-bg-medium)',
            padding: '40px 0',
            scrollBehavior: 'smooth'
          }}
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
              onPageCountChange={setNumPages}
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
