'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Loader2, Sparkles, Download, ArrowLeft, LayoutDashboard,
  Settings, User, Palette, FileText, Check, Plus,
  Trash2, Eye, FileDown, ZoomIn, ZoomOut, RotateCcw,
  Save, Wand2, Share2, Printer, Undo2, Redo2, Copy,
  Clipboard, Bold, Italic, Underline, AlignLeft, AlignCenter,
  AlignRight, List, ListOrdered, Link2, Image, Type
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

interface ResumeEditorProps {
  id: string;
  initialData: ResumeData;
  templates: any[];
}

const ResumeEditor: React.FC<ResumeEditorProps> = ({ id, initialData, templates }) => {
  const router = useRouter();
  const [data, setData] = useState<ResumeData>(initialData);
  
  // Log initial data for debugging
  console.log('=== RESUME EDITOR INITIAL DATA ===');
  console.log('ID:', id);
  console.log('Initial Data:', JSON.stringify(initialData, null, 2));
  console.log('Initial Design:', initialData.design);
  console.log('Initial Layout:', initialData.design?.layout);
  
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

  // Immediate auto-save (removed 2-hour delay)
  const handleSave = async (showToast: boolean = true) => {
    if (saving) return;
    setSaving(true);
    try {
      console.log('=== SAVING RESUME ===');
      console.log('Resume ID:', id);
      console.log('Data being saved:', JSON.stringify({
        title: data.title,
        template: data.template,
        design: data.design,
      }, null, 2));

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

      console.log('Save response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Save response:', result);
        if (showToast) toast.success('Changes saved', { icon: '💾' });
      } else {
        const error = await response.text();
        console.error('Save failed:', error);
        throw new Error('Save failed');
      }
    } catch (e) {
      console.error('Save error:', e);
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

  // A4 Pagination Logic
  useEffect(() => {
    if (!previewRef.current) return;
    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        const contentHeight = entry.target.scrollHeight;
        const pages = Math.max(1, Math.ceil((contentHeight - 10) / 1122));
        setNumPages(pages);
      }
    });
    resizeObserver.observe(previewRef.current);
    return () => resizeObserver.disconnect();
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
    toast.loading('Generating high-quality PDF...', { id: 'pdf' });

    setTimeout(async () => {
      try {
        const canvas = await html2canvas(el, {
          scale: 3, // Higher quality
          useCORS: true,
          allowTaint: true,
          backgroundColor: data.design.backgroundColor || '#ffffff',
          scrollY: -window.scrollY,
          windowWidth: el.scrollWidth,
          windowHeight: el.scrollHeight,
          onclone: (clonedDoc) => {
            const clonedEl = clonedDoc.getElementById('resume-preview');
            if (clonedEl) {
              clonedEl.style.height = 'auto';
              clonedEl.style.overflow = 'visible';
              clonedEl.style.transform = 'none';
            }
          }
        });

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
        toast.success('PDF exported successfully!', { id: 'pdf' });
      } catch (err) {
        console.error(err);
        toast.error('Failed to export PDF', { id: 'pdf' });
      } finally {
        setIsExporting(false);
        if (zoomLevel !== 100) setZoomLevel(originalZoom);
      }
    }, 500);
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
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden font-sans">
      <Toaster />

      {/* Tool Sidebar */}
      <div className="w-[450px] flex flex-col border-r border-gray-100 bg-white z-20 shadow-2xl">
        {/* Header Actions */}
        <div className="px-4 py-5 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2.5 hover:bg-gray-100 rounded-xl transition-all text-gray-500 hover:text-gray-900 group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <input
                value={data.title}
                onChange={e => updateNested('title', e.target.value)}
                className="text-sm font-black text-gray-900 bg-transparent border-none focus:ring-0 w-32 truncate"
              />
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className={`w-1.5 h-1.5 rounded-full ${saving ? 'bg-orange-400 animate-pulse' : 'bg-green-400'}`} />
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{saving ? 'Saving...' : 'Saved'}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSave(true)}
              disabled={saving}
              className="p-2.5 hover:bg-gray-100 rounded-xl transition-all text-gray-500 hover:text-gray-900 disabled:opacity-50"
              title="Save resume"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            </button>
            <button
              onClick={shareResume}
              className="p-2.5 hover:bg-gray-100 rounded-xl transition-all text-gray-500 hover:text-gray-900"
              title="Share resume"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={printResume}
              className="p-2.5 hover:bg-gray-100 rounded-xl transition-all text-gray-500 hover:text-gray-900"
              title="Print resume"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={exportPDF}
              disabled={isExporting}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#ff4d7d] text-white rounded-xl text-xs font-black shadow-lg shadow-pink-100 hover:bg-[#ff3366] hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
              {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
              Export PDF
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
          <button
            onClick={undo}
            disabled={historyIndex === 0}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={redo}
            disabled={historyIndex === history.length - 1}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
          <div className="w-px h-6 bg-gray-200 mx-2" />
          <button
            onClick={copySection}
            disabled={!selectedSectionId}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            title="Copy (Ctrl+C)"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={pasteSection}
            disabled={!clipboard}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            title="Paste (Ctrl+V)"
          >
            <Clipboard className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-100 mx-4 my-2 bg-gray-50/50 rounded-xl p-1">
          <button
            onClick={() => setActiveTab('content')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'content' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <FileText className="w-4 h-4" /> Content
          </button>
          <button
            onClick={() => setActiveTab('design')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'design' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <Palette className="w-4 h-4" /> Design
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
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
            />
          )}
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Floating Controls */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-white/90 backdrop-blur-xl px-4 py-0.5 rounded-xl shadow-2xl border border-white/20">
          <button onClick={() => setZoomLevel(z => Math.max(z - 10, 50))} className="p-2 hover:bg-gray-100 rounded-xl transition-all text-gray-600"><ZoomOut className="w-4 h-4" /></button>
          <span className="text-[10px] font-black text-gray-400 w-12 text-center">{zoomLevel}%</span>
          <button onClick={() => setZoomLevel(z => Math.min(z + 10, 150))} className="p-2 hover:bg-gray-100 rounded-xl transition-all text-gray-600"><ZoomIn className="w-4 h-4" /></button>
          <div className="w-px h-6 bg-gray-100 mx-2" />
          <button onClick={() => setZoomLevel(100)} className="p-2 hover:bg-gray-100 rounded-xl transition-all text-gray-400"><RotateCcw className="w-4 h-4" /></button>
          <div className="w-px h-6 bg-gray-100 mx-2" />
          <div className="flex items-center gap-2 px-3 py-1 bg-[#ff4d7d]/10 rounded-full">
            <span className="text-[9px] font-black text-[#ff4d7d] uppercase tracking-widest">{numPages} Page{numPages > 1 ? 's' : ''}</span>
          </div>
        </div>

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
      </div>

      <TemplateModal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        templates={templates}
        isLoading={false}
        onSelect={(t) => {
          console.log('=== TEMPLATE SELECTED ===');
          console.log('Template:', t);
          console.log('Template style:', t.secondary?.style);

          setData(prev => {
            // Merge design properties from template using latest state
            const newDesign = {
              ...prev.design,
              ...(t.secondary?.style || {}),
              // Ensure critical properties are overridden
              ...(t.secondary?.style?.primaryColor && { primaryColor: t.secondary.style.primaryColor }),
              ...(t.secondary?.style?.accentColor && { accentColor: t.secondary.style.accentColor }),
              ...(t.secondary?.style?.secondaryColor && { secondaryColor: t.secondary.style.secondaryColor }),
              ...(t.secondary?.style?.fontFamily && { fontFamily: t.secondary.style.fontFamily }),
              ...(t.secondary?.style?.layout && { layout: t.secondary.style.layout }),
            };

            return {
              ...prev,
              template: t.mainsection?.id || t.id || t.mainsection?.name,
              design: newDesign,
            };
          });
          setShowTemplateModal(false);
          toast.success(`Template applied: ${t.mainsection?.name || t.name}`);
        }}
        currentTemplateId={data.template}
      />
    </div>
  );
};

export default ResumeEditor;
