'use client';

import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Briefcase, GraduationCap, BadgeCheck, Languages, FolderGit2, Award, Plus, Trash2, GripVertical, Settings2, ArrowUp, ArrowDown, ChevronDown, ChevronUp, Image as ImageIcon, X, UploadCloud, FileText, Sparkles, Eye, EyeOff, FileDown, Loader2 } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import RichTextEditor from './RichTextEditor';
import { LanguageDropdown, ProficiencyDropdown } from './LanguageDropdown';
import { ResumeData } from './types';
import AddContentModal, { CONTENT_MODULES } from './AddContentModal';
import { createEmptyItem, generateSocialId } from '@/lib/utils/resume-ids';
import { AIPanel } from './AIPanel';
import { SectionAIPanel } from './SectionAIPanel';
import { useConfirm } from '@/components/ui/ConfirmModal';

interface ContentEditorProps {
  data: ResumeData;
  updateNested: (path: string, value: any) => void;
  setData: React.Dispatch<React.SetStateAction<ResumeData>>;
  onExport?: () => void;
  isExporting?: boolean;
}

// Helper component for reordering and deleting mapped array items
const ArrayItemControls = ({ array, index, path, updateNested, askConfirm }: { array: any[], index: number, path: string, updateNested: any, askConfirm: any }) => {
  const item = array[index];
  const isHidden = item?.hidden === true;
  
  const toggleItemVisibility = (e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedArray = [...array];
    updatedArray[index] = { ...updatedArray[index], hidden: !isHidden };
    updateNested(path, updatedArray);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmed = await askConfirm({
      title: 'Delete Item',
      message: 'Are you sure you want to delete this item? This action cannot be undone.',
      confirmLabel: 'Delete',
      variant: 'danger'
    });
    if (confirmed) {
      updateNested(path, array.filter((_: any, i: number) => i !== index));
    }
  };

  return (
    <div className="absolute top-2 right-2 flex items-center gap-1 rounded-xl p-1 z-10 transition-all shadow-lg opacity-0 group-hover/item:opacity-100 duration-200 pointer-events-auto scale-95 hover:scale-100" style={{ background: "var(--app-bg-card)", border: "1px solid var(--app-border)" }}>
      {/* Eye Icon - Show/Hide in Resume */}
      <button 
        onClick={toggleItemVisibility}
        className="p-1.5 transition-all rounded-lg"
        style={isHidden 
          ? { color: 'var(--app-text-muted)', background: 'var(--app-bg-gray)' }
          : { color: 'var(--app-primary)', background: 'var(--app-primary-light)' }}
        title={isHidden ? 'Show in resume' : 'Hide from resume'}
      >
        {isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
      </button>
      <div className="w-px h-3 bg-gray-200 mx-0.5" />
      <button 
        onClick={(e) => {
          e.stopPropagation();
          const arr = [...array];
          if (index > 0) { [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]]; updateNested(path, arr); }
        }} 
        className="p-1.5 text-gray-400 hover:text-purple-500 transition-colors disabled:opacity-30 rounded-lg" 
        disabled={index === 0} 
        title="Move Up"
      >
        <ArrowUp className="w-3.5 h-3.5" />
      </button>
      <button 
        onClick={(e) => {
          e.stopPropagation();
          const arr = [...array];
          if (index < arr.length - 1) { [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]]; updateNested(path, arr); }
        }} 
        className="p-1.5 text-gray-400 hover:text-purple-500 transition-colors disabled:opacity-30 rounded-lg" 
        disabled={index === array.length - 1} 
        title="Move Down"
      >
        <ArrowDown className="w-3.5 h-3.5" />
      </button>
      <div className="w-px h-3 bg-gray-200 mx-0.5" />
      <button 
        onClick={handleDelete} 
        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors rounded-lg" 
        title="Delete"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

const ContentEditor: React.FC<ContentEditorProps> = ({
  data, updateNested, setData, onExport, isExporting
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>('personalInfo');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'content' | 'ai'>('content');
  const [aiOpenSection, setAiOpenSection] = useState<string | null>(null);
  const { confirmModal, askConfirm } = useConfirm();

  // Apply AI-generated data to a specific section
  const applyAISection = (section: string, generatedData: any, mode: 'merge' | 'replace') => {
    const sectionPath: Record<string, string> = {
      personalInfo: 'content.personalInfo',
      experience: 'content.experience',
      education: 'content.education',
      skills: 'content.skills',
      languages: 'content.languages',
      projects: 'content.projects',
      certifications: 'content.certifications',
      awards: 'content.awards',
      interests: 'content.interests',
      courses: 'content.courses',
      organisations: 'content.organisations',
      publications: 'content.publications',
      references: 'content.references',
      socials: 'content.socials',
      declaration: 'content.declaration',
      custom: 'content.custom',
    };

    const path = sectionPath[section];
    if (!path) return;

    if (section === 'personalInfo') {
      if (mode === 'replace') {
        const existing = data.content.personalInfo || {};
        const replacement = {
          ...generatedData,
          image: existing.image || '',
          photo: existing.photo || '',
        };
        updateNested(path, replacement);
      } else {
        // Merge: only fill empty fields
        const existing = data.content.personalInfo || {};
        const merged = { ...existing };
        Object.entries(generatedData).forEach(([key, val]) => {
          if (key === 'id' || key === 'image' || key === 'photo') return;
          const cur = (existing as any)[key];
          if (!cur || (typeof cur === 'string' && cur.trim() === '')) {
            (merged as any)[key] = val;
          }
        });
        updateNested(path, merged);
      }
    } else if (section === 'declaration') {
      if (mode === 'replace') {
        updateNested(path, generatedData);
      } else {
        const existing = data.content.declaration || {};
        const merged = { ...existing };
        Object.entries(generatedData).forEach(([key, val]) => {
          const cur = (existing as any)[key];
          if (!cur || (typeof cur === 'string' && cur.trim() === '')) {
            (merged as any)[key] = val;
          }
        });
        updateNested(path, merged);
      }
    } else if (Array.isArray(generatedData)) {
      if (mode === 'replace') {
        updateNested(path, generatedData);
      } else {
        // Merge: append to existing
        const existing = (data.content as any)[section] || [];
        updateNested(path, [...existing, ...generatedData]);
      }
    }

    setAiOpenSection(null);
  };

  const uploadProfilePhoto = async (file: File) => {
    setPhotoError(null);
    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const json = await res.json();
      if (!res.ok || !json?.success || !json?.url) {
        throw new Error(json?.error || 'Upload failed');
      }
      updateNested('content.personalInfo.image', json.url);
    } catch (e: any) {
      setPhotoError(e?.message || 'Upload failed');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    const items = Array.from(data.activeSections);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setData(prev => ({ ...prev, activeSections: items }));
  };

  const removeSection = (id: string) => {
    setData(prev => ({ ...prev, activeSections: prev.activeSections.filter(sid => sid !== id) }));
  };

  const removeSectionConfirmed = async (id: string, label: string) => {
    const confirmed = await askConfirm({
      title: `Remove ${label}`,
      message: `Remove the "${label}" section from your resume? Your data will be preserved if you add it back.`,
      confirmLabel: 'Remove',
      cancelLabel: 'Keep it',
      variant: 'warning',
    });
    if (confirmed) removeSection(id);
  };

  // Toggle section visibility (show/hide in resume without removing data)
  const toggleSectionVisibility = (id: string) => {
    setData(prev => {
      const isVisible = prev.activeSections.includes(id);
      if (isVisible) {
        // Hide: remove from activeSections
        return { ...prev, activeSections: prev.activeSections.filter(sid => sid !== id) };
      } else {
        // Show: add to activeSections
        return { ...prev, activeSections: [...prev.activeSections, id] };
      }
    });
  };

  // Check if section is visible in resume
  const isSectionVisible = (id: string) => {
    return data.activeSections.includes(id);
  };

  // Get all sections that have data (to show in editor even if hidden from resume)
  const getAllSectionsWithData = () => {
    const sectionsWithData: string[] = [];
    
    // Check each possible section for data
    const sectionChecks: Record<string, () => boolean> = {
      experience: () => !!data.content.experience?.length,
      education: () => !!data.content.education?.length,
      skills: () => !!data.content.skills?.length,
      languages: () => !!data.content.languages?.length,
      projects: () => !!data.content.projects?.length,
      certifications: () => !!data.content.certifications?.length,
      awards: () => !!data.content.awards?.length,
      interests: () => !!data.content.interests?.length,
      courses: () => !!data.content.courses?.length,
      organisations: () => !!data.content.organisations?.length,
      publications: () => !!data.content.publications?.length,
      references: () => !!data.content.references?.length,
      socials: () => !!data.content.socials?.length,
      custom: () => !!data.content.custom?.length,
      declaration: () => !!data.content.declaration?.text,
    };

    // Add sections that have data OR are in activeSections
    Object.entries(sectionChecks).forEach(([sectionId, hasData]) => {
      if (hasData() || data.activeSections.includes(sectionId)) {
        sectionsWithData.push(sectionId);
      }
    });

    // Maintain order from activeSections, then add any new ones
    const orderedSections: string[] = [];
    data.activeSections.forEach(sid => {
      if (sectionsWithData.includes(sid) && sid !== 'summary') {
        orderedSections.push(sid);
      }
    });
    
    // Add sections with data that aren't in activeSections yet
    sectionsWithData.forEach(sid => {
      if (!orderedSections.includes(sid) && sid !== 'summary') {
        orderedSections.push(sid);
      }
    });

    return orderedSections;
  };

  const addSection = (id: string) => {
    setData(prev => ({ ...prev, activeSections: [...prev.activeSections, id] }));
    setExpandedSection(id);

    const sectionContentMap: Record<string, { path: string; check: () => boolean }> = {
      experience: { path: 'content.experience', check: () => !data.content.experience?.length },
      education: { path: 'content.education', check: () => !data.content.education?.length },
      skills: { path: 'content.skills', check: () => !data.content.skills?.length },
      languages: { path: 'content.languages', check: () => !data.content.languages?.length },
      socials: { path: 'content.socials', check: () => !data.content.socials?.length },
      projects: { path: 'content.projects', check: () => !data.content.projects?.length },
      certifications: { path: 'content.certifications', check: () => !data.content.certifications?.length },
      awards: { path: 'content.awards', check: () => !data.content.awards?.length },
      interests: { path: 'content.interests', check: () => !data.content.interests?.length },
      courses: { path: 'content.courses', check: () => !data.content.courses?.length },
      organisations: { path: 'content.organisations', check: () => !data.content.organisations?.length },
      publications: { path: 'content.publications', check: () => !data.content.publications?.length },
      references: { path: 'content.references', check: () => !data.content.references?.length },
      custom: { path: 'content.custom', check: () => !data.content.custom?.length },
    };

    const sectionConfig = sectionContentMap[id];
    if (sectionConfig && sectionConfig.check()) {
      updateNested(sectionConfig.path, [createEmptyItem(id)]);
    }
    if (id === 'declaration' && !data.content.declaration) {
      updateNested('content.declaration', { text: '', signature: '', date: '', place: '' });
    }
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col" style={{ background: 'var(--app-bg-gray)' }}>
      {/* Content / AI tab switcher */}
      <div
        className="flex mx-3 mt-2 mb-1 rounded-xl p-1 shrink-0"
        style={{ background: 'var(--app-bg-medium)' }}
      >
        <button
          onClick={() => setActiveTab('content')}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
          style={activeTab === 'content'
            ? { background: 'var(--app-bg-card)', color: 'var(--app-text)', boxShadow: 'var(--app-shadow)' }
            : { color: 'var(--app-text-muted)' }}
        >
          <FileText className="w-3.5 h-3.5" /> Edit
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
          style={activeTab === 'ai'
            ? { background: 'var(--app-bg-card)', color: 'var(--app-text)', boxShadow: 'var(--app-shadow)' }
            : { color: 'var(--app-text-muted)' }}
        >
          <Sparkles className="w-3.5 h-3.5" style={{ color: activeTab === 'ai' ? 'var(--app-primary)' : undefined }} />
          AI
        </button>
      </div>

      {/* AI Panel */}
      {activeTab === 'ai' && (
        <div className="flex-1 min-h-0 overflow-y-auto p-3 custom-scrollbar" style={{ background: 'var(--app-bg-gray)' }}>
          <AIPanel
            data={data}
            updateNested={updateNested}
            onApply={(content) => {
              // Apply all fields from the (already-merged) content object
              // AIPanel handles smart merge / replace before calling onApply
              Object.entries(content).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                  updateNested(`content.${key}`, value);
                }
              });
            }}
          />
        </div>
      )}

      {/* Content Panel */}
      {activeTab === 'content' && (
        <div className="flex-1 min-h-0 overflow-y-auto p-3 custom-scrollbar w-full" style={{ background: 'var(--app-bg-gray)' }}>
          <div className="space-y-2 pb-24 max-w-full w-full">

        {/* Personal Info - Always first and not draggable */}
        <section
          className="p-3 rounded-xl flex flex-col gap-2 relative w-full overflow-hidden"
          style={{
            background: 'var(--app-bg-card)',
            border: '1px solid var(--app-border)',
            boxShadow: 'var(--app-shadow)',
          }}
        >
          <div className="flex items-center justify-between w-full">
            <button
              onClick={() => setExpandedSection(expandedSection === 'personalInfo' ? null : 'personalInfo')}
              className="flex items-center gap-3 flex-1 text-left"
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--app-primary-light)', color: 'var(--app-primary)' }}>
                <User className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold capitalize tracking-tight" style={{ color: 'var(--app-text)' }}>Personal Info</h3>
            </button>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={e => { e.stopPropagation(); setAiOpenSection(aiOpenSection === 'personalInfo' ? null : 'personalInfo'); if (expandedSection !== 'personalInfo') setExpandedSection('personalInfo'); }}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black transition-all"
                style={aiOpenSection === 'personalInfo'
                  ? { background: 'var(--app-primary)', color: '#fff' }
                  : { background: 'var(--app-primary-light)', color: 'var(--app-primary)' }}
                title="Generate with AI"
              >
                <Sparkles className="w-3 h-3" /> AI
              </button>
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer ${expandedSection === 'personalInfo' ? 'rotate-180' : ''}`}
                style={{
                  background: expandedSection === 'personalInfo' ? 'var(--app-primary-light)' : 'var(--app-bg-gray)',
                  color: expandedSection === 'personalInfo' ? 'var(--app-primary)' : 'var(--app-text-muted)',
                }}
                onClick={() => setExpandedSection(expandedSection === 'personalInfo' ? null : 'personalInfo')}
              >
                <ChevronDown className="w-4 h-4" strokeWidth={3} />
              </div>
            </div>
          </div>

          {/* Personal Info AI Panel */}
          {aiOpenSection === 'personalInfo' && (
            <SectionAIPanel
              section="personalInfo"
              sectionLabel="Personal Info"
              currentData={data.content.personalInfo}
              resumeContext={{ fullName: data.content.personalInfo?.fullName, professionalTitle: data.content.personalInfo?.professionalTitle }}
              onApply={(generated, mode) => applyAISection('personalInfo', generated, mode)}
              onClose={() => setAiOpenSection(null)}
            />
          )}

          {expandedSection === 'personalInfo' && (
            <div className="flex flex-col gap-2 mt-2 w-full">
              {/* Photo upload row */}
              <div
                className="flex items-center justify-between gap-3 rounded-xl p-4"
                style={{ 
                  background: 'var(--app-bg-card)', 
                  border: '1px solid var(--app-border)',
                  boxShadow: 'var(--app-shadow-sm)'
                }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-14 h-14 rounded-2xl overflow-hidden flex items-center justify-center relative shrink-0"
                    style={{ 
                      background: 'var(--app-bg-gray)', 
                      border: '2px solid var(--app-border)',
                      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
                    }}
                  >
                    {data.content.personalInfo.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img 
                        src={data.content.personalInfo.image} 
                        alt="Profile" 
                        className="w-full h-full object-cover absolute inset-0" 
                      />
                    ) : (
                      <ImageIcon className="w-6 h-6" style={{ color: 'var(--app-text-muted)' }} />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-black uppercase tracking-widest" style={{ color: 'var(--app-text)' }}>Profile Photo</span>
                    <span className="text-[10px] font-bold" style={{ color: 'var(--app-text-muted)' }}>
                      {uploadingPhoto ? 'Uploading…' : data.content.personalInfo.image ? 'Uploaded' : 'PNG/JPG up to 5MB'}
                    </span>
                    {photoError && <span className="text-[10px] font-bold text-red-500">{photoError}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <label className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] ${uploadingPhoto ? 'opacity-50 cursor-not-allowed' : ''}`} style={{ background: 'var(--app-primary)', color: '#fff', boxShadow: '0 4px 12px var(--app-primary-light)' }}>
                    <UploadCloud className="w-3.5 h-3.5" />
                    {data.content.personalInfo.image ? 'Change' : 'Upload'}
                    <input type="file" accept="image/*" disabled={uploadingPhoto} className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) uploadProfilePhoto(f); e.currentTarget.value = ''; }} />
                  </label>
                  {data.content.personalInfo.image && (
                    <button
                      type="button"
                      onClick={() => updateNested('content.personalInfo.image', '')}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-red-50 hover:text-red-500"
                      style={{ background: 'var(--app-bg-gray)', border: '1px solid var(--app-border)', color: 'var(--app-text-secondary)' }}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* PDF Action Row - ENHANCED UI */}
              <div 
                className="flex items-center justify-between gap-3 rounded-xl p-4 mb-2"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(65,1,125,0.08), rgba(238,20,255,0.08))', 
                  border: '2px solid var(--app-primary-light)',
                  boxShadow: 'var(--app-shadow-md)'
                }}
              >
                <div className="flex items-center gap-4">
                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                    style={{ background: '#fff', border: '1px solid var(--app-border)', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
                  >
                    <div className="p-2 rounded-lg" style={{ background: 'var(--app-primary-light)' }}>
                      <FileDown className="w-5 h-5" style={{ color: 'var(--app-primary)' }} />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-black uppercase tracking-widest" style={{ color: 'var(--app-text)' }}>Resume PDF</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${isExporting ? 'bg-orange-400 animate-pulse' : 'bg-green-400'}`} />
                      <span className="text-[10px] font-bold" style={{ color: 'var(--app-text-muted)' }}>
                        {isExporting ? 'Generating...' : 'Ready to export'}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={onExport}
                  disabled={isExporting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, var(--app-primary), var(--app-secondary))', color: '#fff' }}
                >
                  {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                  Download PDF
                </button>
              </div>

              {/* Fields grid */}
              <div className="grid grid-cols-2 gap-2 w-full">
                {[
                  { label: 'Full Name', key: 'fullName', type: 'text' },
                  { label: 'Job Title', key: 'professionalTitle', type: 'text' },
                  { label: 'Email', key: 'email', type: 'email' },
                  { label: 'Phone', key: 'phone', type: 'tel' },
                ].map(f => (
                  <div key={f.key} className="flex flex-col gap-1">
                    <label className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'var(--app-text-muted)' }}>{f.label}</label>
                    <input
                      type={f.type}
                      value={(data.content.personalInfo as any)[f.key] || ''}
                      onChange={e => updateNested(`content.personalInfo.${f.key}`, e.target.value)}
                      className="w-full p-2 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#ff4d7d] transition-all"
                      style={{ background: 'var(--app-bg-gray)', border: '1px solid var(--app-border)', color: 'var(--app-text)' }}
                    />
                  </div>
                ))}
                <div className="flex flex-col gap-1 col-span-2">
                  <label className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'var(--app-text-muted)' }}>Location</label>
                  <input
                    type="text"
                    value={data.content.personalInfo.location || ''}
                    onChange={e => updateNested('content.personalInfo.location', e.target.value)}
                    className="w-full p-2 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#ff4d7d] transition-all"
                    style={{ background: 'var(--app-bg-gray)', border: '1px solid var(--app-border)', color: 'var(--app-text)' }}
                  />
                </div>
              </div>

              {/* Summary */}
              <div className="flex flex-col gap-1 w-full">
                <label className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'var(--app-text-muted)' }}>Professional Summary</label>
                <RichTextEditor
                  value={data.content.personalInfo.summary}
                  onChange={val => updateNested('content.personalInfo.summary', val)}
                />
              </div>
            </div>
          )}
        </section>

        {/* Draggable Sections */}
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="sections">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="flex flex-col gap-3 w-full">
                {getAllSectionsWithData().map((sectionId, index) => {
                  const sInfo = CONTENT_MODULES.find(s => s.id === sectionId);
                  const Icon = sInfo?.icon || FolderGit2;
                  const isExpanded = expandedSection === sectionId;
                  const isVisible = isSectionVisible(sectionId);

                  return (
                    <Draggable key={sectionId} draggableId={sectionId} index={index}>
                      {(provided) => (
                        <div ref={provided.innerRef} {...provided.draggableProps} className="group relative w-full flex items-center">
                          {/* Drag Handle */}
                          <div {...provided.dragHandleProps} className="w-6 flex justify-center cursor-grab opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--app-text-muted)' }}>
                            <GripVertical className="w-4 h-4" />
                          </div>

                          <section
                            className="p-3 rounded-xl flex-1 flex flex-col gap-2 w-[calc(100%-1.5rem)] overflow-hidden"
                            style={{
                              background: 'var(--app-bg-card)',
                              border: isVisible ? '1px solid var(--app-border)' : '1px dashed var(--app-border)',
                              boxShadow: isVisible ? 'var(--app-shadow)' : 'none',
                              opacity: isVisible ? 1 : 0.6,
                            }}
                          >
                            {/* Section Header */}
                            <div className="flex items-center justify-between">
                              <button onClick={() => setExpandedSection(isExpanded ? null : sectionId)} className="flex items-center gap-3 flex-1 text-left">
                                <div
                                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                  style={{ background: 'var(--app-primary-light)', color: 'var(--app-primary)' }}
                                >
                                  <Icon className="w-4 h-4" />
                                </div>
                                <div className="flex items-center gap-2">
                                  <h3 className="text-sm font-bold capitalize tracking-tight" style={{ color: 'var(--app-text)' }}>{sInfo?.title || sectionId}</h3>
                                  {!isVisible && (
                                    <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider" style={{ background: 'var(--app-bg-gray)', color: 'var(--app-text-muted)' }}>
                                      Hidden
                                    </span>
                                  )}
                                </div>
                              </button>
                              <div className="flex items-center gap-1.5 shrink-0">
                                {/* Eye Icon - Show/Hide in Resume */}
                                <button
                                  onClick={e => { e.stopPropagation(); toggleSectionVisibility(sectionId); }}
                                  className="p-1.5 rounded-lg transition-all"
                                  style={isSectionVisible(sectionId)
                                    ? { background: 'var(--app-primary-light)', color: 'var(--app-primary)' }
                                    : { background: 'var(--app-bg-gray)', color: 'var(--app-text-muted)' }}
                                  title={isSectionVisible(sectionId) ? 'Hide from resume' : 'Show in resume'}
                                >
                                  {isSectionVisible(sectionId) ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                </button>
                                <button
                                  onClick={e => {
                                    e.stopPropagation();
                                    setAiOpenSection(aiOpenSection === sectionId ? null : sectionId);
                                    if (!isExpanded) setExpandedSection(sectionId);
                                  }}
                                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black transition-all"
                                  style={aiOpenSection === sectionId
                                    ? { background: 'var(--app-primary)', color: '#fff' }
                                    : { background: 'var(--app-primary-light)', color: 'var(--app-primary)' }}
                                  title="Generate with AI"
                                >
                                  <Sparkles className="w-3 h-3" /> AI
                                </button>
                                <button
                                  onClick={e => { e.stopPropagation(); removeSectionConfirmed(sectionId, sInfo?.title || sectionId); }}
                                  className="p-1.5 rounded-lg transition-colors"
                                  style={{ color: 'var(--app-text-muted)' }}
                                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#ef4444'}
                                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--app-text-muted)'}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setExpandedSection(isExpanded ? null : sectionId)}
                                  className={`w-7 h-7 flex items-center justify-center rounded-full transition-all ${isExpanded ? 'rotate-180' : ''}`}
                                  style={{
                                    background: isExpanded ? 'var(--app-primary-light)' : 'var(--app-bg-gray)',
                                    color: isExpanded ? 'var(--app-primary)' : 'var(--app-text-muted)',
                                  }}
                                >
                                  <ChevronDown className="w-4 h-4" strokeWidth={3} />
                                </button>
                              </div>
                            </div>

                            {/* Expanded content */}
                            {isExpanded && (
                              <div className="flex flex-col gap-2 pt-3 w-full" style={{ borderTop: '1px solid var(--app-border-light)' }}>
                                {/* Section AI Panel */}
                                {aiOpenSection === sectionId && (
                                  <SectionAIPanel
                                    section={sectionId}
                                    sectionLabel={sInfo?.title || sectionId}
                                    currentData={(data.content as any)[sectionId]}
                                    resumeContext={{ fullName: data.content.personalInfo?.fullName, professionalTitle: data.content.personalInfo?.professionalTitle }}
                                    onApply={(generated, mode) => applyAISection(sectionId, generated, mode)}
                                    onClose={() => setAiOpenSection(null)}
                                  />
                                )}

                                <button
                                  onClick={() => {
                                    const sectionMap: Record<string, { path: string; items: any[] }> = {
                                      experience: { path: 'content.experience', items: data.content.experience || [] },
                                      education: { path: 'content.education', items: data.content.education || [] },
                                      skills: { path: 'content.skills', items: data.content.skills || [] },
                                      languages: { path: 'content.languages', items: data.content.languages || [] },
                                      projects: { path: 'content.projects', items: data.content.projects || [] },
                                      certifications: { path: 'content.certifications', items: data.content.certifications || [] },
                                      awards: { path: 'content.awards', items: data.content.awards || [] },
                                      interests: { path: 'content.interests', items: data.content.interests || [] },
                                      courses: { path: 'content.courses', items: data.content.courses || [] },
                                      organisations: { path: 'content.organisations', items: data.content.organisations || [] },
                                      publications: { path: 'content.publications', items: data.content.publications || [] },
                                      references: { path: 'content.references', items: data.content.references || [] },
                                      custom: { path: 'content.custom', items: data.content.custom || [] },
                                      socials: { path: 'content.socials', items: data.content.socials || [] },
                                    };
                                    const config = sectionMap[sectionId];
                                    if (config) updateNested(config.path, [...config.items, createEmptyItem(sectionId)]);
                                  }}
                                  className={`flex items-center gap-1 text-[11px] font-bold transition-colors self-start px-2.5 py-1.5 rounded-lg ${['declaration', 'interests', 'skills'].includes(sectionId) ? 'hidden' : ''}`}
                                  style={{ color: 'var(--app-primary)', background: 'var(--app-primary-light)' }}
                                >
                                  <Plus className="w-3 h-3" /> Add Item
                                </button>

                                {sectionId === 'experience' && (
                                  <div className="flex flex-col gap-2 w-full">
                                    {data.content.experience?.map((exp, expIdx) => {
                                      const isHidden = exp.hidden === true;
                                      return (
                                        <div 
                                          key={expIdx} 
                                          className="p-2 rounded-lg flex flex-col gap-2 relative group/item w-full" 
                                          style={{ 
                                            background: "var(--app-bg-gray)", 
                                            border: isHidden ? "1px dashed var(--app-border)" : "1px solid var(--app-border)",
                                            opacity: isHidden ? 0.5 : 1
                                          }}
                                        >
                                          <ArrayItemControls array={data.content.experience || []} index={expIdx} path="content.experience" updateNested={updateNested} askConfirm={askConfirm} />
                                          {isHidden && (
                                            <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider z-10" style={{ background: 'var(--app-bg-card)', color: 'var(--app-text-muted)', border: '1px solid var(--app-border)' }}>
                                              Hidden
                                            </div>
                                          )}
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full pt-4 pr-4">
                                            <input type="text" placeholder="Company" value={exp.company} onChange={e => updateNested(`content.experience[${expIdx}].company`, e.target.value)} className="w-full p-2 rounded-md text-[11px] font-semibold focus:outline-none focus:ring-1 focus:ring-[#ff4d7d] transition-all" style={{ background: "var(--app-bg-card)", border: "1px solid var(--app-border)", color: "var(--app-text)" }} />
                                            <input type="text" placeholder="Position" value={exp.position} onChange={e => updateNested(`content.experience[${expIdx}].position`, e.target.value)} className="w-full p-2 rounded-md text-[11px] font-semibold focus:outline-none focus:ring-1 focus:ring-[#ff4d7d] transition-all" style={{ background: "var(--app-bg-card)", border: "1px solid var(--app-border)", color: "var(--app-text)" }} />
                                            <input type="month" placeholder="Start Date" value={exp.startDate} onChange={e => updateNested(`content.experience[${expIdx}].startDate`, e.target.value)} className="w-full p-2 bg-white border border-gray-100 rounded-md focus:ring-1 focus:ring-[#ff4d7d] text-[11px] font-semibold uppercase tracking-wider" />
                                            <input type="text" placeholder="End Date (e.g. Present)" value={exp.endDate} onChange={e => updateNested(`content.experience[${expIdx}].endDate`, e.target.value)} className="w-full p-2 bg-white border border-gray-100 rounded-md focus:ring-1 focus:ring-[#ff4d7d] text-[11px] font-semibold uppercase tracking-wider" />
                                          </div>
                                          <div className="border border-gray-200 rounded-md overflow-hidden bg-white w-full text-[11px]">
                                            <RichTextEditor value={exp.description} onChange={val => updateNested(`content.experience[${expIdx}].description`, val)} />
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}

                                {sectionId === 'education' && (
                                  <div className="flex flex-col gap-2 w-full">
                                    {data.content.education?.map((edu, eduIdx) => (
                                      <div key={eduIdx} className="p-2 rounded-lg flex flex-col gap-2 relative group/item w-full" style={{ background: "var(--app-bg-gray)", border: "1px solid var(--app-border)" }}>
                                        <ArrayItemControls array={data.content.education || []} index={eduIdx} path="content.education" updateNested={updateNested} askConfirm={askConfirm} />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-4 pr-4 w-full">
                                          <input type="text" placeholder="School" value={edu.school} onChange={e => updateNested(`content.education[${eduIdx}].school`, e.target.value)} className="w-full p-2 rounded-md text-[11px] font-semibold focus:outline-none focus:ring-1 focus:ring-[#ff4d7d] transition-all" style={{ background: "var(--app-bg-card)", border: "1px solid var(--app-border)", color: "var(--app-text)" }} />
                                          <input type="text" placeholder="Degree" value={edu.degree} onChange={e => updateNested(`content.education[${eduIdx}].degree`, e.target.value)} className="w-full p-2 rounded-md text-[11px] font-semibold focus:outline-none focus:ring-1 focus:ring-[#ff4d7d] transition-all" style={{ background: "var(--app-bg-card)", border: "1px solid var(--app-border)", color: "var(--app-text)" }} />
                                          <input type="text" placeholder="Field" value={edu.field} onChange={e => updateNested(`content.education[${eduIdx}].field`, e.target.value)} className="w-full p-2 rounded-md text-[11px] font-semibold focus:outline-none focus:ring-1 focus:ring-[#ff4d7d] transition-all" style={{ background: "var(--app-bg-card)", border: "1px solid var(--app-border)", color: "var(--app-text)" }} />
                                          <input type="number" placeholder="Graduation Year" value={edu.graduationYear} onChange={e => updateNested(`content.education[${eduIdx}].graduationYear`, e.target.value)} className="w-full p-2 rounded-md text-[11px] font-semibold focus:outline-none focus:ring-1 focus:ring-[#ff4d7d] transition-all" style={{ background: "var(--app-bg-card)", border: "1px solid var(--app-border)", color: "var(--app-text)" }} min="1950" max="2100" />
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {sectionId === 'skills' && (
                                  <div className="flex flex-wrap gap-2.5 w-full">
                                    {data.content.skills?.map((skill, skillIdx) => {
                                      const isHidden = skill.hidden === true;
                                      return (
                                        <div 
                                          key={skill.id || skillIdx} 
                                          className={`relative group/skill flex-1 min-w-[160px] transition-all hover:scale-[1.01] ${isHidden ? 'opacity-60' : 'opacity-100'}`}
                                        >
                                          <div
                                            className="flex items-center gap-1 p-1 rounded-xl transition-all"
                                            style={{ 
                                              background: "var(--app-bg-card)", 
                                              border: isHidden ? "1px dashed var(--app-border)" : "1px solid var(--app-border)", 
                                              boxShadow: isHidden ? 'none' : 'var(--app-shadow-sm)' 
                                            }}
                                          >
                                            <button 
                                              onClick={() => {
                                                const updated = [...(data.content.skills || [])];
                                                updated[skillIdx] = { ...updated[skillIdx], hidden: !isHidden };
                                                updateNested('content.skills', updated);
                                              }}
                                              className="p-1.5 rounded-lg transition-all shrink-0 ml-1"
                                              style={isHidden ? { color: 'var(--app-text-muted)' } : { color: 'var(--app-primary)', background: 'var(--app-primary-light)' }}
                                              title={isHidden ? 'Show in resume' : 'Hide from resume'}
                                            >
                                              {isHidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                            </button>
                                            <input
                                              value={skill.name || ''}
                                              onChange={e => updateNested(`content.skills[${skillIdx}].name`, e.target.value)}
                                              className="flex-1 bg-transparent border-none focus:ring-0 text-[11px] font-bold py-1.5 px-1.5"
                                              style={{ color: isHidden ? "var(--app-text-muted)" : "var(--app-text)" }}
                                              placeholder="Skill"
                                            />
                                            <button 
                                              onClick={() => updateNested('content.skills', data.content.skills?.filter((_, idx) => idx !== skillIdx))} 
                                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50/50 transition-all shrink-0 mr-1"
                                              title="Delete Skill"
                                            >
                                              <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                          </div>
                                        </div>
                                      );
                                    })}
                                    <button
                                      onClick={() => updateNested('content.skills', [...(data.content.skills || []), { id: `skill_${Date.now()}`, name: '', hidden: false }])}
                                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:opacity-80 group/add"
                                      style={{ background: 'var(--app-bg-gray)', border: '1px dashed var(--app-border)', color: 'var(--app-text-muted)' }}
                                    >
                                      <Plus className="w-4 h-4 group-hover/add:rotate-90 transition-transform" /> Add Skill
                                    </button>
                                  </div>
                                )}

                                {sectionId === 'languages' && (
                                  <div className="flex flex-col gap-2 w-full">
                                    {data.content.languages?.map((lang, langIdx) => (
                                      <div key={langIdx} className="bg-gray-50/50 p-2 rounded-lg border border-gray-100 flex flex-row gap-2 relative group/item w-full items-center">
                                        <LanguageDropdown
                                          value={lang.language}
                                          onChange={(value) => updateNested(`content.languages[${langIdx}].language`, value)}
                                          placeholder="Language"
                                          className="flex-1"
                                        />
                                        <ProficiencyDropdown
                                          value={lang.proficiency}
                                          onChange={(value) => updateNested(`content.languages[${langIdx}].proficiency`, value)}
                                          placeholder="Proficiency"
                                          className="flex-1"
                                        />
                                        <ArrayItemControls array={data.content.languages || []} index={langIdx} path="content.languages" updateNested={updateNested} askConfirm={askConfirm} />
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {sectionId === 'socials' && (
                                  <div className="flex flex-col gap-2 w-full">
                                    {data.content.socials?.map((soc, socIdx) => (
                                      <div key={socIdx} className="p-2 rounded-lg flex flex-col gap-2 relative group/item w-full" style={{ background: "var(--app-bg-gray)", border: "1px solid var(--app-border)" }}>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-4 pr-4 w-full">
                                          <input placeholder="Platform" value={soc.platform} onChange={e => updateNested(`content.socials[${socIdx}].platform`, e.target.value)} className="w-full p-2 rounded-md text-[11px] font-semibold focus:outline-none focus:ring-1 focus:ring-[#ff4d7d] transition-all" style={{ background: "var(--app-bg-card)", border: "1px solid var(--app-border)", color: "var(--app-text)" }} />
                                          <input placeholder="Label" value={soc.label} onChange={e => updateNested(`content.socials[${socIdx}].label`, e.target.value)} className="w-full p-2 rounded-md text-[11px] font-semibold focus:outline-none focus:ring-1 focus:ring-[#ff4d7d] transition-all" style={{ background: "var(--app-bg-card)", border: "1px solid var(--app-border)", color: "var(--app-text)" }} />
                                          <input placeholder="URL" value={soc.url} onChange={e => updateNested(`content.socials[${socIdx}].url`, e.target.value)} className="w-full p-2 rounded-md text-[11px] font-semibold focus:outline-none focus:ring-1 focus:ring-[#ff4d7d] transition-all" style={{ background: "var(--app-bg-card)", border: "1px solid var(--app-border)", color: "var(--app-text)" }} />
                                        </div>
                                        <ArrayItemControls array={data.content.socials || []} index={socIdx} path="content.socials" updateNested={updateNested} askConfirm={askConfirm} />
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {sectionId === 'certifications' && (
                                  <div className="flex flex-col gap-2 w-full">
                                    {data.content.certifications?.map((cert, certIdx) => (
                                      <div key={certIdx} className="p-2 rounded-lg flex flex-col gap-2 relative group/item w-full" style={{ background: "var(--app-bg-gray)", border: "1px solid var(--app-border)" }}>
                                        <ArrayItemControls array={data.content.certifications || []} index={certIdx} path="content.certifications" updateNested={updateNested} askConfirm={askConfirm} />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-4 pr-4 w-full">
                                          <input placeholder="Name" value={cert.name} onChange={e => updateNested(`content.certifications[${certIdx}].name`, e.target.value)} className="w-full p-2 rounded-md text-[11px] font-semibold focus:outline-none focus:ring-1 focus:ring-[#ff4d7d] transition-all" style={{ background: "var(--app-bg-card)", border: "1px solid var(--app-border)", color: "var(--app-text)" }} />
                                          <input placeholder="Issuer" value={cert.issuer} onChange={e => updateNested(`content.certifications[${certIdx}].issuer`, e.target.value)} className="w-full p-2 rounded-md text-[11px] font-semibold focus:outline-none focus:ring-1 focus:ring-[#ff4d7d] transition-all" style={{ background: "var(--app-bg-card)", border: "1px solid var(--app-border)", color: "var(--app-text)" }} />
                                          <input type="month" placeholder="Date Earned" value={cert.date} onChange={e => updateNested(`content.certifications[${certIdx}].date`, e.target.value)} className="w-full p-2 bg-white border border-gray-100 rounded-md focus:ring-1 focus:ring-[#ff4d7d] text-[11px] font-semibold uppercase tracking-wider" />
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {sectionId === 'projects' && (
                                  <div className="flex flex-col gap-2 w-full">
                                    {data.content.projects?.map((proj, projIdx) => (
                                      <div key={projIdx} className="p-3 rounded-lg flex flex-col gap-2 relative group/item w-full" style={{ background: "var(--app-bg-gray)", border: "1px solid var(--app-border)" }}>
                                        <ArrayItemControls array={data.content.projects || []} index={projIdx} path="content.projects" updateNested={updateNested} askConfirm={askConfirm} />
                                        <div className="grid grid-cols-1 gap-2 pt-4 pr-4 w-full">
                                          <input
                                            placeholder="Project Name"
                                            value={proj.name || ''}
                                            onChange={e => updateNested(`content.projects[${projIdx}].name`, e.target.value)}
                                            className="w-full p-2 rounded-md text-[11px] font-semibold focus:outline-none focus:ring-1 focus:ring-[#ff4d7d] transition-all"
                                            style={{ background: "var(--app-bg-card)", border: "1px solid var(--app-border)", color: "var(--app-text)" }}
                                          />
                                          {/* Technologies tag input */}
                                          <div className="flex flex-col gap-1">
                                            <label className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'var(--app-text-muted)' }}>Technologies</label>
                                            <div
                                              className="flex flex-wrap gap-1.5 p-2 rounded-md min-h-[36px]"
                                              style={{ background: "var(--app-bg-card)", border: "1px solid var(--app-border)" }}
                                            >
                                              {(Array.isArray(proj.technologies) ? proj.technologies : []).map((tech: string, tIdx: number) => (
                                                <span
                                                  key={tIdx}
                                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                                                  style={{ background: 'var(--app-primary-light)', color: 'var(--app-primary)' }}
                                                >
                                                  {tech}
                                                  <button
                                                    type="button"
                                                    onClick={() => {
                                                      const techs = [...(proj.technologies || [])];
                                                      techs.splice(tIdx, 1);
                                                      updateNested(`content.projects[${projIdx}].technologies`, techs);
                                                    }}
                                                    className="hover:opacity-70 transition-opacity"
                                                  >
                                                    <X className="w-2.5 h-2.5" />
                                                  </button>
                                                </span>
                                              ))}
                                              <input
                                                type="text"
                                                placeholder={proj.technologies?.length ? 'Add more...' : 'e.g. React, Node.js, AWS'}
                                                className="flex-1 min-w-[120px] text-[11px] font-semibold focus:outline-none bg-transparent"
                                                style={{ color: 'var(--app-text)' }}
                                                onKeyDown={e => {
                                                  if ((e.key === 'Enter' || e.key === ',') && (e.target as HTMLInputElement).value.trim()) {
                                                    e.preventDefault();
                                                    const val = (e.target as HTMLInputElement).value.trim().replace(/,$/, '');
                                                    if (val) {
                                                      const techs = [...(proj.technologies || []), val];
                                                      updateNested(`content.projects[${projIdx}].technologies`, techs);
                                                      (e.target as HTMLInputElement).value = '';
                                                    }
                                                  }
                                                  if (e.key === 'Backspace' && !(e.target as HTMLInputElement).value && proj.technologies?.length) {
                                                    const techs = [...(proj.technologies || [])];
                                                    techs.pop();
                                                    updateNested(`content.projects[${projIdx}].technologies`, techs);
                                                  }
                                                }}
                                                onBlur={e => {
                                                  const val = e.target.value.trim().replace(/,$/, '');
                                                  if (val) {
                                                    const techs = [...(proj.technologies || []), val];
                                                    updateNested(`content.projects[${projIdx}].technologies`, techs);
                                                    e.target.value = '';
                                                  }
                                                }}
                                              />
                                            </div>
                                            <p className="text-[9px]" style={{ color: 'var(--app-text-muted)' }}>Press Enter or comma to add a technology</p>
                                          </div>
                                        </div>
                                        <div className="border border-gray-200 rounded-md overflow-hidden bg-white w-full text-[11px]">
                                          <RichTextEditor value={proj.description || ''} onChange={val => updateNested(`content.projects[${projIdx}].description`, val)} />
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {sectionId === 'awards' && (
                                  <div className="flex flex-col gap-2 w-full">
                                    {data.content.awards?.map((award, aIdx) => (
                                      <div key={aIdx} className="p-2 rounded-lg flex flex-col gap-2 relative group/item w-full" style={{ background: "var(--app-bg-gray)", border: "1px solid var(--app-border)" }}>
                                        <ArrayItemControls array={data.content.awards || []} index={aIdx} path="content.awards" updateNested={updateNested} askConfirm={askConfirm} />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-4 pr-4 w-full">
                                          <input placeholder="Award Title" value={award.title} onChange={e => updateNested(`content.awards[${aIdx}].title`, e.target.value)} className="w-full p-2 rounded-md text-[11px] font-semibold focus:outline-none focus:ring-1 focus:ring-[#ff4d7d] transition-all" style={{ background: "var(--app-bg-card)", border: "1px solid var(--app-border)", color: "var(--app-text)" }} />
                                          <input placeholder="Issuer" value={award.issuer} onChange={e => updateNested(`content.awards[${aIdx}].issuer`, e.target.value)} className="w-full p-2 rounded-md text-[11px] font-semibold focus:outline-none focus:ring-1 focus:ring-[#ff4d7d] transition-all" style={{ background: "var(--app-bg-card)", border: "1px solid var(--app-border)", color: "var(--app-text)" }} />
                                          <input type="month" placeholder="Date" value={award.date} onChange={e => updateNested(`content.awards[${aIdx}].date`, e.target.value)} className="w-full p-2 bg-white border border-gray-100 rounded-md focus:ring-1 focus:ring-[#ff4d7d] text-[11px] font-semibold uppercase tracking-wider" />
                                        </div>
                                        <div className="border border-gray-200 rounded-md overflow-hidden bg-white w-full text-[11px]">
                                          <RichTextEditor value={award.description || ''} onChange={val => updateNested(`content.awards[${aIdx}].description`, val)} />
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {sectionId === 'interests' && (
                                  <div className="flex flex-wrap gap-2.5 w-full">
                                    {data.content.interests?.map((interest, iIdx) => {
                                      const isHidden = interest.hidden === true;
                                      return (
                                        <div 
                                          key={interest.id || iIdx} 
                                          className={`relative group/skill flex-1 min-w-[160px] transition-all hover:scale-[1.01] ${isHidden ? 'opacity-60' : 'opacity-100'}`}
                                        >
                                          <div
                                            className="flex items-center gap-1 p-1 pr-10 rounded-xl transition-all"
                                            style={{ 
                                              background: "var(--app-bg-card)", 
                                              border: isHidden ? "1px dashed var(--app-border)" : "1px solid var(--app-border)", 
                                              boxShadow: isHidden ? 'none' : 'var(--app-shadow-sm)' 
                                            }}
                                          >
                                            <button 
                                              onClick={() => {
                                                const updated = [...(data.content.interests || [])];
                                                updated[iIdx] = { ...updated[iIdx], hidden: !isHidden };
                                                updateNested('content.interests', updated);
                                              }}
                                              className="p-1.5 rounded-lg transition-all shrink-0 ml-1"
                                              style={isHidden ? { color: 'var(--app-text-muted)' } : { color: 'var(--app-primary)', background: 'var(--app-primary-light)' }}
                                              title={isHidden ? 'Show in resume' : 'Hide from resume'}
                                            >
                                              {isHidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                            </button>
                                            <input
                                              value={interest.name || ''}
                                              onChange={e => updateNested(`content.interests[${iIdx}].name`, e.target.value)}
                                              className="flex-1 bg-transparent border-none focus:ring-0 text-[11px] font-bold py-1.5 px-1.5"
                                              style={{ color: isHidden ? "var(--app-text-muted)" : "var(--app-text)" }}
                                              placeholder="e.g. Hiking"
                                            />
                                          </div>
                                          <button
                                            type="button"
                                            onClick={async () => {
                                              const confirmed = await askConfirm({
                                                title: 'Delete Interest',
                                                message: 'Are you sure you want to delete this interest?',
                                                confirmLabel: 'Delete',
                                                variant: 'danger'
                                              });
                                              if (confirmed) {
                                                updateNested('content.interests', data.content.interests?.filter((_, idx) => idx !== iIdx));
                                              }
                                            }}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg opacity-0 group-hover/skill:opacity-100 text-gray-400 hover:text-red-500 hover:bg-red-50/70 transition-all"
                                            title="Delete Interest"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      );
                                    })}
                                    <button
                                      onClick={() => updateNested('content.interests', [...(data.content.interests || []), { id: `interest_${Date.now()}`, name: '', hidden: false }])}
                                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:opacity-80 group/add"
                                      style={{ background: 'var(--app-bg-gray)', border: '1px dashed var(--app-border)', color: 'var(--app-text-muted)' }}
                                    >
                                      <Plus className="w-4 h-4 group-hover/add:rotate-90 transition-transform" /> Add Interest
                                    </button>
                                  </div>
                                )}

                                {sectionId === 'courses' && (
                                  <div className="flex flex-col gap-2 w-full">
                                    {data.content.courses?.map((course, cIdx) => (
                                      <div key={cIdx} className="p-2 rounded-lg flex flex-col gap-2 relative group/item w-full" style={{ background: "var(--app-bg-gray)", border: "1px solid var(--app-border)" }}>
                                        <ArrayItemControls array={data.content.courses || []} index={cIdx} path="content.courses" updateNested={updateNested} askConfirm={askConfirm} />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-4 pr-4 w-full">
                                          <input placeholder="Course Title" value={course.title} onChange={e => updateNested(`content.courses[${cIdx}].title`, e.target.value)} className="w-full p-2 rounded-md text-[11px] font-semibold focus:outline-none focus:ring-1 focus:ring-[#ff4d7d] transition-all" style={{ background: "var(--app-bg-card)", border: "1px solid var(--app-border)", color: "var(--app-text)" }} />
                                          <input placeholder="Provider (e.g. Coursera)" value={course.provider} onChange={e => updateNested(`content.courses[${cIdx}].provider`, e.target.value)} className="w-full p-2 rounded-md text-[11px] font-semibold focus:outline-none focus:ring-1 focus:ring-[#ff4d7d] transition-all" style={{ background: "var(--app-bg-card)", border: "1px solid var(--app-border)", color: "var(--app-text)" }} />
                                          <input type="month" placeholder="Date" value={course.date} onChange={e => updateNested(`content.courses[${cIdx}].date`, e.target.value)} className="w-full p-2 bg-white border border-gray-100 rounded-md focus:ring-1 focus:ring-[#ff4d7d] text-[11px] font-semibold uppercase tracking-wider" />
                                        </div>
                                        <div className="border border-gray-200 rounded-md overflow-hidden bg-white w-full text-[11px]">
                                          <RichTextEditor value={course.description || ''} onChange={val => updateNested(`content.courses[${cIdx}].description`, val)} />
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {sectionId === 'organisations' && (
                                  <div className="flex flex-col gap-2 w-full">
                                    {data.content.organisations?.map((org, oIdx) => (
                                      <div key={oIdx} className="p-2 rounded-lg flex flex-col gap-2 relative group/item w-full" style={{ background: "var(--app-bg-gray)", border: "1px solid var(--app-border)" }}>
                                        <ArrayItemControls array={data.content.organisations || []} index={oIdx} path="content.organisations" updateNested={updateNested} askConfirm={askConfirm} />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-4 pr-4 w-full">
                                          <input placeholder="Organisation Name" value={org.name} onChange={e => updateNested(`content.organisations[${oIdx}].name`, e.target.value)} className="w-full p-2 rounded-md text-[11px] font-semibold focus:outline-none focus:ring-1 focus:ring-[#ff4d7d] transition-all" style={{ background: "var(--app-bg-card)", border: "1px solid var(--app-border)", color: "var(--app-text)" }} />
                                          <input placeholder="Role" value={org.role} onChange={e => updateNested(`content.organisations[${oIdx}].role`, e.target.value)} className="w-full p-2 rounded-md text-[11px] font-semibold focus:outline-none focus:ring-1 focus:ring-[#ff4d7d] transition-all" style={{ background: "var(--app-bg-card)", border: "1px solid var(--app-border)", color: "var(--app-text)" }} />
                                          <input type="month" placeholder="Start Date" value={org.startDate} onChange={e => updateNested(`content.organisations[${oIdx}].startDate`, e.target.value)} className="w-full p-2 bg-white border border-gray-100 rounded-md focus:ring-1 focus:ring-[#ff4d7d] text-[11px] font-semibold uppercase tracking-wider" />
                                          <input type="text" placeholder="End Date (e.g. Present)" value={org.endDate} onChange={e => updateNested(`content.organisations[${oIdx}].endDate`, e.target.value)} className="w-full p-2 bg-white border border-gray-100 rounded-md focus:ring-1 focus:ring-[#ff4d7d] text-[11px] font-semibold uppercase tracking-wider" />
                                        </div>
                                        <div className="border border-gray-200 rounded-md overflow-hidden bg-white w-full text-[11px]">
                                          <RichTextEditor value={org.description || ''} onChange={val => updateNested(`content.organisations[${oIdx}].description`, val)} />
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {sectionId === 'publications' && (
                                  <div className="flex flex-col gap-2 w-full">
                                    {data.content.publications?.map((pub, pIdx) => (
                                      <div key={pIdx} className="p-2 rounded-lg flex flex-col gap-2 relative group/item w-full" style={{ background: "var(--app-bg-gray)", border: "1px solid var(--app-border)" }}>
                                        <ArrayItemControls array={data.content.publications || []} index={pIdx} path="content.publications" updateNested={updateNested} askConfirm={askConfirm} />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-4 pr-4 w-full">
                                          <input placeholder="Title" value={pub.title} onChange={e => updateNested(`content.publications[${pIdx}].title`, e.target.value)} className="w-full p-2 rounded-md text-[11px] font-semibold focus:outline-none focus:ring-1 focus:ring-[#ff4d7d] transition-all" style={{ background: "var(--app-bg-card)", border: "1px solid var(--app-border)", color: "var(--app-text)" }} />
                                          <input placeholder="Publisher" value={pub.publisher} onChange={e => updateNested(`content.publications[${pIdx}].publisher`, e.target.value)} className="w-full p-2 rounded-md text-[11px] font-semibold focus:outline-none focus:ring-1 focus:ring-[#ff4d7d] transition-all" style={{ background: "var(--app-bg-card)", border: "1px solid var(--app-border)", color: "var(--app-text)" }} />
                                          <input type="month" placeholder="Date" value={pub.date} onChange={e => updateNested(`content.publications[${pIdx}].date`, e.target.value)} className="w-full p-2 bg-white border border-gray-100 rounded-md focus:ring-1 focus:ring-[#ff4d7d] text-[11px] font-semibold uppercase tracking-wider" />
                                          <input type="url" placeholder="URL" value={pub.url} onChange={e => updateNested(`content.publications[${pIdx}].url`, e.target.value)} className="w-full p-2 rounded-md text-[11px] font-semibold focus:outline-none focus:ring-1 focus:ring-[#ff4d7d] transition-all" style={{ background: "var(--app-bg-card)", border: "1px solid var(--app-border)", color: "var(--app-text)" }} />
                                        </div>
                                        <div className="border border-gray-200 rounded-md overflow-hidden bg-white w-full text-[11px]">
                                          <RichTextEditor value={pub.description || ''} onChange={val => updateNested(`content.publications[${pIdx}].description`, val)} />
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {sectionId === 'references' && (
                                  <div className="flex flex-col gap-2 w-full">
                                    {data.content.references?.map((ref, rIdx) => (
                                      <div key={rIdx} className="p-2 rounded-lg flex flex-col gap-2 relative group/item w-full" style={{ background: "var(--app-bg-gray)", border: "1px solid var(--app-border)" }}>
                                        <ArrayItemControls array={data.content.references || []} index={rIdx} path="content.references" updateNested={updateNested} askConfirm={askConfirm} />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-4 pr-4 w-full">
                                          <input placeholder="Name" value={ref.name} onChange={e => updateNested(`content.references[${rIdx}].name`, e.target.value)} className="w-full p-2 rounded-md text-[11px] font-semibold focus:outline-none focus:ring-1 focus:ring-[#ff4d7d] transition-all" style={{ background: "var(--app-bg-card)", border: "1px solid var(--app-border)", color: "var(--app-text)" }} />
                                          <input placeholder="Position" value={ref.position} onChange={e => updateNested(`content.references[${rIdx}].position`, e.target.value)} className="w-full p-2 rounded-md text-[11px] font-semibold focus:outline-none focus:ring-1 focus:ring-[#ff4d7d] transition-all" style={{ background: "var(--app-bg-card)", border: "1px solid var(--app-border)", color: "var(--app-text)" }} />
                                          <input placeholder="Company" value={ref.company} onChange={e => updateNested(`content.references[${rIdx}].company`, e.target.value)} className="w-full p-2 rounded-md text-[11px] font-semibold focus:outline-none focus:ring-1 focus:ring-[#ff4d7d] transition-all" style={{ background: "var(--app-bg-card)", border: "1px solid var(--app-border)", color: "var(--app-text)" }} />
                                          <input type="email" placeholder="Email" value={ref.email} onChange={e => updateNested(`content.references[${rIdx}].email`, e.target.value)} className="w-full p-2 rounded-md text-[11px] font-semibold focus:outline-none focus:ring-1 focus:ring-[#ff4d7d] transition-all" style={{ background: "var(--app-bg-card)", border: "1px solid var(--app-border)", color: "var(--app-text)" }} />
                                          <input type="tel" placeholder="Phone" value={ref.phone} onChange={e => updateNested(`content.references[${rIdx}].phone`, e.target.value)} className="w-full p-2 rounded-md text-[11px] font-semibold focus:outline-none focus:ring-1 focus:ring-[#ff4d7d] transition-all" style={{ background: "var(--app-bg-card)", border: "1px solid var(--app-border)", color: "var(--app-text)" }} />
                                          <input placeholder="Relationship" value={ref.relationship} onChange={e => updateNested(`content.references[${rIdx}].relationship`, e.target.value)} className="w-full p-2 rounded-md text-[11px] font-semibold focus:outline-none focus:ring-1 focus:ring-[#ff4d7d] transition-all" style={{ background: "var(--app-bg-card)", border: "1px solid var(--app-border)", color: "var(--app-text)" }} />
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {sectionId === 'declaration' && (
                                  <div className="flex flex-col gap-2 w-full">
                                    <div className="bg-gray-50/50 p-2 rounded-lg border border-gray-100 flex flex-col gap-2 relative w-full">
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 w-full">
                                        <input placeholder="Place" value={data.content.declaration?.place || ''} onChange={e => updateNested(`content.declaration.place`, e.target.value)} className="w-full p-2 rounded-md text-[11px] font-semibold focus:outline-none focus:ring-1 focus:ring-[#ff4d7d] transition-all" style={{ background: "var(--app-bg-card)", border: "1px solid var(--app-border)", color: "var(--app-text)" }} />
                                        <input type="date" placeholder="Date" value={data.content.declaration?.date || ''} onChange={e => updateNested(`content.declaration.date`, e.target.value)} className="w-full p-2 bg-white border border-gray-100 rounded-md focus:ring-1 focus:ring-[#ff4d7d] text-[11px] font-semibold uppercase tracking-wider" />
                                      </div>
                                      <input placeholder="Declaration Text" value={data.content.declaration?.text || ''} onChange={e => updateNested(`content.declaration.text`, e.target.value)} className="w-full p-2 rounded-md text-[11px] font-semibold focus:outline-none focus:ring-1 focus:ring-[#ff4d7d] transition-all" style={{ background: "var(--app-bg-card)", border: "1px solid var(--app-border)", color: "var(--app-text)" }} />
                                    </div>
                                  </div>
                                )}

                                {sectionId === 'custom' && (
                                  <div className="flex flex-col gap-2 w-full">
                                    {data.content.custom?.map((cus, cIdx) => (
                                      <div key={cIdx} className="p-2 rounded-lg flex flex-col gap-2 relative group/item w-full" style={{ background: "var(--app-bg-gray)", border: "1px solid var(--app-border)" }}>
                                        <ArrayItemControls array={data.content.custom || []} index={cIdx} path="content.custom" updateNested={updateNested} askConfirm={askConfirm} />
                                        <input placeholder="Custom Section Item Title" value={cus.title} onChange={e => updateNested(`content.custom[${cIdx}].title`, e.target.value)} className="w-full p-2 bg-white border border-gray-100 rounded-md focus:ring-1 focus:ring-[#ff4d7d] text-[11px] font-semibold pt-4 pr-4" />
                                        <div className="border border-gray-200 rounded-md overflow-hidden bg-white w-full text-[11px]">
                                          <RichTextEditor value={cus.content || ''} onChange={val => updateNested(`content.custom[${cIdx}].content`, val)} />
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </section>
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {/* Add Content Button */}
        <div className="pt-4 w-full flex justify-center pb-6">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 py-2.5 px-6 rounded-xl font-bold text-sm transition-all hover:opacity-90 hover:-translate-y-0.5 text-white"
            style={{
              background: 'linear-gradient(135deg, var(--app-primary), var(--app-secondary))',
              boxShadow: '0 4px 14px rgba(65,1,125,0.25)',
            }}
          >
            <Plus className="w-4 h-4" strokeWidth={3} /> Add Content
          </button>
        </div>

      </div>

      <AddContentModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        activeSections={data.activeSections}
        onSelect={addSection}
      />
      {confirmModal}
        </div>
      )}
    </div>
  );
};

export default ContentEditor;
