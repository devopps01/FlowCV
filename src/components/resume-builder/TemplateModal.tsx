'use client';

import React from 'react';
import { X, Loader2, Check } from 'lucide-react';
import { ResumeData } from './types';
import ResumePreview from './ResumePreview';
import { DUMMY_PROFILES, DUMMY_CONTENT_BASE } from './constants';

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: any[];
  isLoading: boolean;
  onSelect: (template: any) => void;
  currentTemplateId: string;
}

const TemplateModal: React.FC<TemplateModalProps> = ({ isOpen, onClose, templates, isLoading, onSelect, currentTemplateId }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div
        className="relative w-full max-w-7xl h-full max-h-[92vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        style={{ background: 'var(--app-bg-card)', border: '1px solid var(--app-border)' }}
      >
        {/* Header */}
        <div
          className="px-10 py-5 flex items-center justify-between sticky top-0 z-10 shrink-0"
          style={{ borderBottom: '1px solid var(--app-border)', background: 'var(--app-bg-card)' }}
        >
          <div>
            <h2 className="text-2xl font-black flex items-center gap-3" style={{ color: 'var(--app-text)' }}>
              Choose Template
              <span className="px-2.5 py-0.5 text-white text-[10px] uppercase tracking-widest rounded-full font-black" style={{ background: 'var(--app-primary)' }}>
                {templates.length}+
              </span>
            </h2>
            <p className="mt-1 font-semibold uppercase text-[10px] tracking-[0.2em]" style={{ color: 'var(--app-text-muted)' }}>
              Select from our professional designs to transform your career story.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-full font-bold transition-all text-[10px] uppercase tracking-widest"
              style={{ border: '1px solid var(--app-border)', color: 'var(--app-text-secondary)', background: 'var(--app-bg-gray)' }}
            >
              Cancel
            </button>
            <button
              onClick={onClose}
              className="p-2.5 rounded-full transition-all group"
              style={{ background: 'var(--app-bg-gray)', color: 'var(--app-text-muted)' }}
            >
              <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar" style={{ background: 'var(--app-bg-gray)' }}>
          {isLoading ? (
            <div className="h-[400px] flex flex-col items-center justify-center gap-4">
               <Loader2 className="w-12 h-12 text-[#ff4d7d] animate-spin" />
               <p className="text-gray-400 font-bold animate-pulse uppercase tracking-[0.2em] text-[10px]">Loading templates...</p>
            </div>
          ) : (
            <div className="max-w-[1700px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-y-16 gap-x-12 pb-32 pt-4">
              {templates.map((template, index) => {
                const profile = DUMMY_PROFILES[index % DUMMY_PROFILES.length];
                const mockupData: ResumeData = {
                   title: template.mainsection.name,
                   template: template.mainsection.id,
                   content: { 
                     ...DUMMY_CONTENT_BASE, 
                     ...template.secondary.data,
                     personalInfo: {
                        ...profile,
                        phone: '+1 (555) 000-0000',
                        summary: 'A highly motivated and detail-oriented professional with extensive experience in leading complex projects and delivering exceptional results. Passionate about innovation and continuous improvement.'
                     }
                   },
                   design: template.secondary.style,
                   activeSections: ['summary', 'experience', 'education', 'skills', 'projects', 'awards', 'languages']
                };

                return (
                  <div 
                    key={template.mainsection.id}
                    className="group flex flex-col gap-4 cursor-pointer"
                    onClick={() => onSelect(template)}
                  >
                    {/* Thumbnail Card */}
                    <div className={`relative aspect-[1/1.414] rounded-xl overflow-hidden transition-all duration-300 ${
                      currentTemplateId === template.mainsection.id
                        ? 'shadow-2xl scale-[1.02]'
                        : 'hover:shadow-2xl hover:-translate-y-1'
                    }`}
                      style={{
                        background: '#ffffff',
                        border: currentTemplateId === template.mainsection.id
                          ? '2px solid var(--app-primary)'
                          : '1px solid var(--app-border)',
                        boxShadow: currentTemplateId === template.mainsection.id
                          ? '0 0 0 3px var(--app-primary-light)'
                          : 'var(--app-shadow)',
                      }}
                    >
                       <div className="absolute inset-0 bg-white pointer-events-none flex items-start justify-center pt-[10px]">
                          <div className="origin-top scale-[0.55] w-[210mm]">
                             <ResumePreview 
                               data={mockupData} 
                               numPages={1} 
                               previewRef={{ current: null }} 
                               zoomLevel={100} 
                               isThumbnail={true}
                             />
                          </div>
                       </div>

                       {/* Status Badges */}
                       {template.mainsection.resumeinfo?.isPremium && (
                         <div className="absolute top-4 right-4 z-20">
                            <span className="bg-orange-500 text-white text-[8px] px-2 py-0.5 rounded italic font-bold uppercase tracking-widest shadow-lg">Premium</span>
                         </div>
                       )}

                       {currentTemplateId === template.mainsection.id && (
                         <div className="absolute inset-0 flex items-center justify-center z-10" style={{ background: 'var(--app-primary-light)' }}>
                            <div className="p-3 rounded-full text-white shadow-2xl" style={{ background: 'var(--app-primary)' }}>
                               <Check className="w-6 h-6 stroke-[3]" />
                            </div>
                         </div>
                       )}

                       {/* Hover Overlay */}
                       <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                    </div>

                    {/* Title */}
                    <div className="text-center mt-2 px-4">
                       <p className="text-[11px] font-bold uppercase tracking-[0.1em] transition-colors truncate"
                         style={{ color: currentTemplateId === template.mainsection.id ? 'var(--app-primary)' : 'var(--app-text-secondary)' }}>
                         {template.mainsection.name}
                       </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplateModal;
