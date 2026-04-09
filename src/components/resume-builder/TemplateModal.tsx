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
      <div className="relative w-full max-w-7xl h-full max-h-[92vh] bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden scale-in-center animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="px-12 py-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10 shadow-sm">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              Choose Template
              <span className="px-3 py-1 bg-[#ff4d7d] text-white text-[10px] uppercase tracking-widest rounded-full font-bold">Premium</span>
            </h2>
            <p className="text-gray-400 mt-2 font-semibold uppercase text-[10px] tracking-[0.2em]">Select from our 100+ professional designs to transform your career story.</p>
          </div>
          <div className="flex items-center gap-6">
             <button 
               onClick={onClose}
               className="px-8 py-3 rounded-full font-bold text-gray-500 hover:bg-gray-50 transition-all border border-gray-200 uppercase text-[10px] tracking-widest"
             >
               Cancel
             </button>
             <button 
               onClick={onClose}
               className="p-3 hover:bg-gray-100 rounded-full transition-all text-gray-400 hover:text-gray-900 group"
             >
               <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
             </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-12 bg-[#f4f7f9]/80 custom-scrollbar">
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
                    <div className={`relative aspect-[1/1.414] bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden transition-all duration-500 ${
                      currentTemplateId === template.mainsection.id 
                      ? 'ring-4 ring-[#ff4d7d] ring-offset-4 ring-offset-[#f4f7f9] shadow-2xl scale-[1.02]' 
                      : 'hover:shadow-2xl hover:-translate-y-2'
                    }`}>
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
                         <div className="absolute inset-0 bg-[#ff4d7d]/5 flex items-center justify-center z-10">
                            <div className="bg-[#ff4d7d] text-white p-3 rounded-full shadow-2xl animate-in zoom-in-0 duration-300">
                               <Check className="w-6 h-6 stroke-[3]" />
                            </div>
                         </div>
                       )}

                       {/* Hover Overlay */}
                       <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                    </div>

                    {/* Clean Title Label */}
                    <div className="text-center mt-2 px-6">
                       <p className={`text-[12px] font-bold uppercase tracking-[0.1em] transition-colors ${
                         currentTemplateId === template.mainsection.id ? 'text-[#ff4d7d]' : 'text-gray-500 group-hover:text-gray-900'
                       }`}>
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
