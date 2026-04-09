'use client';

import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Briefcase, GraduationCap, BadgeCheck, Languages, FolderGit2, Award, Plus, Trash2, GripVertical, Settings2, ArrowUp, ArrowDown, ChevronDown, ChevronUp, Image as ImageIcon, X, UploadCloud } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import RichTextEditor from './RichTextEditor';
import { LanguageDropdown, ProficiencyDropdown } from './LanguageDropdown';
import { ResumeData } from './types';
import AddContentModal, { CONTENT_MODULES } from './AddContentModal';
import { createEmptyItem, generateSocialId } from '@/lib/utils/resume-ids';

interface ContentEditorProps {
  data: ResumeData;
  updateNested: (path: string, value: any) => void;
  setData: React.Dispatch<React.SetStateAction<ResumeData>>;
}

// Helper component for reordering and deleting mapped array items
const ArrayItemControls = ({ array, index, path, updateNested }: { array: any[], index: number, path: string, updateNested: any }) => (
  <div className="absolute -top-1 -right-1 flex items-center gap-1 bg-white shadow-sm border border-gray-200 rounded-lg p-1 opacity-0 group-hover/item:opacity-100 transition-opacity z-10">
    <button onClick={() => {
      const arr = [...array];
      if (index > 0) { [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]]; updateNested(path, arr); }
    }} className="p-1.5 text-gray-400 hover:text-purple-500 transition-colors disabled:opacity-30" disabled={index === 0} title="Move Up"><ArrowUp className="w-3.5 h-3.5" /></button>
    <button onClick={() => {
      const arr = [...array];
      if (index < arr.length - 1) { [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]]; updateNested(path, arr); }
    }} className="p-1.5 text-gray-400 hover:text-purple-500 transition-colors disabled:opacity-30" disabled={index === array.length - 1} title="Move Down"><ArrowDown className="w-3.5 h-3.5" /></button>
    <div className="w-px h-3 bg-gray-200 mx-1" />
    <button onClick={() => updateNested(path, array.filter((_: any, i: number) => i !== index))} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
  </div>
);

const ContentEditor: React.FC<ContentEditorProps> = ({
  data, updateNested, setData
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>('personalInfo');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

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
    <div className="flex-1 overflow-y-auto p-3 custom-scrollbar bg-[#f8fafc] w-full">
      <div className="space-y-3 pb-32 max-w-full w-full">

        {/* Personal Info - Always first and not draggable */}
        <section className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-2 relative w-full overflow-hidden">
          <button
            onClick={() => setExpandedSection(expandedSection === 'personalInfo' ? null : 'personalInfo')}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#ff4d7d]/10 text-[#ff4d7d] rounded-lg flex items-center justify-center shrink-0">
                <User className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 capitalize tracking-tight">Personal Info</h3>
            </div>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${expandedSection === 'personalInfo' ? 'bg-[#ff4d7d]/10 text-[#ff4d7d] rotate-180' : 'bg-gray-50 text-gray-400 group-hover:bg-gray-100 group-hover:text-gray-600'}`}>
              <ChevronDown className="w-4 h-4" strokeWidth={3} />
            </div>
          </button>

          {expandedSection === 'personalInfo' && (
            <div className="flex flex-col gap-2 mt-2 w-full">
              <div className="flex items-center justify-between gap-3 bg-gray-50/60 border border-gray-100 rounded-xl p-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 overflow-hidden flex items-center justify-center">
                    {data.content.personalInfo.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={data.content.personalInfo.image} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-gray-300" />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest">Profile Photo</span>
                    <span className="text-[10px] font-bold text-gray-400">
                      {uploadingPhoto ? 'Uploading…' : data.content.personalInfo.image ? 'Uploaded' : 'PNG/JPG/WebP up to 5MB'}
                    </span>
                    {photoError && <span className="text-[10px] font-bold text-red-500">{photoError}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <label className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all ${
                    uploadingPhoto ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-[#ff4d7d] text-white hover:bg-[#ff3366]'
                  }`}>
                    <UploadCloud className="w-4 h-4" />
                    {data.content.personalInfo.image ? 'Change' : 'Upload'}
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingPhoto}
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadProfilePhoto(file);
                        e.currentTarget.value = '';
                      }}
                    />
                  </label>
                  {data.content.personalInfo.image && (
                    <button
                      type="button"
                      onClick={() => updateNested('content.personalInfo.image', '')}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest bg-white border border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-200 transition-all"
                      title="Remove photo"
                    >
                      <X className="w-4 h-4" />
                      Remove
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full">
                <div className="flex flex-col gap-1 w-full">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Full Name</label>
                  <input
                    type="text"
                    value={data.content.personalInfo.fullName}
                    onChange={e => updateNested('content.personalInfo.fullName', e.target.value)}
                    className="w-full p-2 bg-gray-50 border-none rounded-lg focus:ring-1 focus:ring-[#ff4d7d] font-bold text-xs"
                  />
                </div>
                <div className="flex flex-col gap-1 w-full">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Job Title</label>
                  <input
                    type="text"
                    value={data.content.personalInfo.professionalTitle}
                    onChange={e => updateNested('content.personalInfo.professionalTitle', e.target.value)}
                    className="w-full p-2 bg-gray-50 border-none rounded-lg focus:ring-1 focus:ring-[#ff4d7d] font-bold text-xs"
                  />
                </div>
                <div className="flex flex-col gap-1 w-full">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Email</label>
                  <input
                    type="email"
                    value={data.content.personalInfo.email}
                    onChange={e => updateNested('content.personalInfo.email', e.target.value)}
                    className="w-full p-2 bg-gray-50 border-none rounded-lg focus:ring-1 focus:ring-[#ff4d7d] font-bold text-xs"
                  />
                </div>
                <div className="flex flex-col gap-1 w-full">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Phone</label>
                  <input
                    type="tel"
                    value={data.content.personalInfo.phone}
                    onChange={e => updateNested('content.personalInfo.phone', e.target.value)}
                    className="w-full p-2 bg-gray-50 border-none rounded-lg focus:ring-1 focus:ring-[#ff4d7d] font-bold text-xs"
                  />
                </div>
                <div className="flex flex-col gap-1 w-full col-span-1 md:col-span-2">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Location</label>
                  <input
                    type="text"
                    value={data.content.personalInfo.location || ''}
                    onChange={e => updateNested('content.personalInfo.location', e.target.value)}
                    className="w-full p-2 bg-gray-50 border-none rounded-lg focus:ring-1 focus:ring-[#ff4d7d] font-bold text-xs"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1 w-full max-w-full">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Professional Summary</label>
                <div className="border border-gray-100 rounded-lg overflow-hidden w-full max-w-full text-xs">
                  <RichTextEditor
                    value={data.content.personalInfo.summary}
                    onChange={val => updateNested('content.personalInfo.summary', val)}
                  />
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Draggable Sections */}
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="sections">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="flex flex-col gap-3 w-full">
                {data.activeSections.filter(sid => sid !== 'summary').map((sectionId, index) => {
                  const sInfo = CONTENT_MODULES.find(s => s.id === sectionId);
                  const Icon = sInfo?.icon || FolderGit2;
                  const isExpanded = expandedSection === sectionId;

                  return (
                    <Draggable key={sectionId} draggableId={sectionId} index={index}>
                      {(provided) => (
                        <div ref={provided.innerRef} {...provided.draggableProps} className="group relative w-full flex items-center">
                          {/* Drag Handle outside card */}
                          <div {...provided.dragHandleProps} className="w-6 flex justify-center cursor-grab text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">
                            <GripVertical className="w-4 h-4" />
                          </div>

                          <section className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex-1 flex flex-col gap-2 w-[calc(100%-1.5rem)] overflow-hidden">
                            {/* Section Header */}
                            <div className="flex items-center justify-between">
                              <button onClick={() => setExpandedSection(isExpanded ? null : sectionId)} className="flex items-center gap-3 flex-1 text-left">
                                <div className="w-8 h-8 bg-[#ff4d7d]/10 text-[#ff4d7d] rounded-lg flex items-center justify-center shrink-0">
                                  <Icon className="w-4 h-4" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 capitalize tracking-tight">{sInfo?.title || sectionId}</h3>
                              </button>
                              <div className="flex items-center gap-2 shrink-0">
                                <button onClick={(e) => { e.stopPropagation(); removeSection(sectionId); }} className="p-1.5 text-gray-300 hover:text-red-500 rounded-lg transition-colors">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => setExpandedSection(isExpanded ? null : sectionId)} 
                                  className={`w-7 h-7 flex items-center justify-center rounded-full transition-all ${isExpanded ? 'bg-[#ff4d7d]/10 text-[#ff4d7d] rotate-180' : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`}
                                >
                                  <ChevronDown className="w-4 h-4" strokeWidth={3} />
                                </button>
                              </div>
                            </div>

                            {/* Specific Editor Rendering */}
                            {isExpanded && (
                              <div className="flex flex-col gap-2 border-t border-gray-50 pt-3 w-full">
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
                                    if (config) {
                                      updateNested(config.path, [...config.items, createEmptyItem(sectionId)]);
                                    }
                                  }}
                                  className={`flex items-center gap-1 text-[11px] font-bold text-[#ed1882] hover:text-[#fc6076] transition-colors self-start bg-[#ed1882]/5 px-2 py-1 rounded shadow-sm ${sectionId === 'declaration' ? 'hidden' : ''}`}
                                >
                                  <Plus className="w-3 h-3" /> Add Item
                                </button>

                                {sectionId === 'experience' && (
                                  <div className="flex flex-col gap-2 w-full">
                                    {data.content.experience?.map((exp, expIdx) => (
                                      <div key={expIdx} className="bg-gray-50/50 p-2 rounded-lg border border-gray-100 flex flex-col gap-2 relative group/item w-full">
                                        <ArrayItemControls array={data.content.experience || []} index={expIdx} path="content.experience" updateNested={updateNested} />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full pt-4 pr-4">
                                          <input type="text" placeholder="Company" value={exp.company} onChange={e => updateNested(`content.experience[${expIdx}].company`, e.target.value)} className="w-full p-2 bg-white border border-gray-100 rounded-md focus:ring-1 focus:ring-[#ff4d7d] text-[11px] font-semibold" />
                                          <input type="text" placeholder="Position" value={exp.position} onChange={e => updateNested(`content.experience[${expIdx}].position`, e.target.value)} className="w-full p-2 bg-white border border-gray-100 rounded-md focus:ring-1 focus:ring-[#ff4d7d] text-[11px] font-semibold" />
                                          <input type="month" placeholder="Start Date" value={exp.startDate} onChange={e => updateNested(`content.experience[${expIdx}].startDate`, e.target.value)} className="w-full p-2 bg-white border border-gray-100 rounded-md focus:ring-1 focus:ring-[#ff4d7d] text-[11px] font-semibold uppercase tracking-wider" />
                                          <input type="text" placeholder="End Date (e.g. Present)" value={exp.endDate} onChange={e => updateNested(`content.experience[${expIdx}].endDate`, e.target.value)} className="w-full p-2 bg-white border border-gray-100 rounded-md focus:ring-1 focus:ring-[#ff4d7d] text-[11px] font-semibold uppercase tracking-wider" />
                                        </div>
                                        <div className="border border-gray-200 rounded-md overflow-hidden bg-white w-full text-[11px]">
                                          <RichTextEditor value={exp.description} onChange={val => updateNested(`content.experience[${expIdx}].description`, val)} />
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {sectionId === 'education' && (
                                  <div className="flex flex-col gap-2 w-full">
                                    {data.content.education?.map((edu, eduIdx) => (
                                      <div key={eduIdx} className="bg-gray-50/50 p-2 rounded-lg border border-gray-100 flex flex-col gap-2 relative group/item w-full">
                                        <ArrayItemControls array={data.content.education || []} index={eduIdx} path="content.education" updateNested={updateNested} />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-4 pr-4 w-full">
                                          <input type="text" placeholder="School" value={edu.school} onChange={e => updateNested(`content.education[${eduIdx}].school`, e.target.value)} className="w-full p-2 bg-white border border-gray-100 rounded-md focus:ring-1 focus:ring-[#ff4d7d] text-[11px] font-semibold" />
                                          <input type="text" placeholder="Degree" value={edu.degree} onChange={e => updateNested(`content.education[${eduIdx}].degree`, e.target.value)} className="w-full p-2 bg-white border border-gray-100 rounded-md focus:ring-1 focus:ring-[#ff4d7d] text-[11px] font-semibold" />
                                          <input type="text" placeholder="Field" value={edu.field} onChange={e => updateNested(`content.education[${eduIdx}].field`, e.target.value)} className="w-full p-2 bg-white border border-gray-100 rounded-md focus:ring-1 focus:ring-[#ff4d7d] text-[11px] font-semibold" />
                                          <input type="number" placeholder="Graduation Year" value={edu.graduationYear} onChange={e => updateNested(`content.education[${eduIdx}].graduationYear`, e.target.value)} className="w-full p-2 bg-white border border-gray-100 rounded-md focus:ring-1 focus:ring-[#ff4d7d] text-[11px] font-semibold" min="1950" max="2100" />
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {sectionId === 'skills' && (
                                  <div className="flex flex-wrap gap-2 w-full">
                                    {data.content.skills?.map((skill, skillIdx) => (
                                      <div key={skill.id || skillIdx} className="relative group/skill flex-1 min-w-[100px]">
                                        <input
                                          value={skill.name || ''}
                                          onChange={e => updateNested(`content.skills[${skillIdx}].name`, e.target.value)}
                                          className="w-full p-2 bg-white border border-gray-200 rounded-md focus:ring-1 focus:ring-[#ff4d7d] text-[11px] font-semibold"
                                          placeholder="Skill"
                                        />
                                        <button onClick={() => updateNested('content.skills', data.content.skills?.filter((_, idx) => idx !== skillIdx))} className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-300 hover:text-red-500 transition-all opacity-0 group-hover/skill:opacity-100 bg-white shadow-sm p-0.5 rounded">
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </div>
                                    ))}
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
                                        <ArrayItemControls array={data.content.languages || []} index={langIdx} path="content.languages" updateNested={updateNested} />
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {sectionId === 'socials' && (
                                  <div className="flex flex-col gap-2 w-full">
                                    {data.content.socials?.map((soc, socIdx) => (
                                      <div key={socIdx} className="bg-gray-50/50 p-2 rounded-lg border border-gray-100 flex flex-col gap-2 relative group/item w-full">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-4 pr-4 w-full">
                                          <input placeholder="Platform" value={soc.platform} onChange={e => updateNested(`content.socials[${socIdx}].platform`, e.target.value)} className="w-full p-2 bg-white border border-gray-100 rounded-md focus:ring-1 focus:ring-[#ff4d7d] text-[11px] font-semibold" />
                                          <input placeholder="Label" value={soc.label} onChange={e => updateNested(`content.socials[${socIdx}].label`, e.target.value)} className="w-full p-2 bg-white border border-gray-100 rounded-md focus:ring-1 focus:ring-[#ff4d7d] text-[11px] font-semibold" />
                                          <input placeholder="URL" value={soc.url} onChange={e => updateNested(`content.socials[${socIdx}].url`, e.target.value)} className="w-full p-2 bg-white border border-gray-100 rounded-md focus:ring-1 focus:ring-[#ff4d7d] text-[11px] font-semibold" />
                                        </div>
                                        <ArrayItemControls array={data.content.socials || []} index={socIdx} path="content.socials" updateNested={updateNested} />
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {sectionId === 'certifications' && (
                                  <div className="flex flex-col gap-2 w-full">
                                    {data.content.certifications?.map((cert, certIdx) => (
                                      <div key={certIdx} className="bg-gray-50/50 p-2 rounded-lg border border-gray-100 flex flex-col gap-2 relative group/item w-full">
                                        <ArrayItemControls array={data.content.certifications || []} index={certIdx} path="content.certifications" updateNested={updateNested} />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-4 pr-4 w-full">
                                          <input placeholder="Name" value={cert.name} onChange={e => updateNested(`content.certifications[${certIdx}].name`, e.target.value)} className="w-full p-2 bg-white border border-gray-100 rounded-md focus:ring-1 focus:ring-[#ff4d7d] text-[11px] font-semibold" />
                                          <input placeholder="Issuer" value={cert.issuer} onChange={e => updateNested(`content.certifications[${certIdx}].issuer`, e.target.value)} className="w-full p-2 bg-white border border-gray-100 rounded-md focus:ring-1 focus:ring-[#ff4d7d] text-[11px] font-semibold" />
                                          <input type="month" placeholder="Date Earned" value={cert.date} onChange={e => updateNested(`content.certifications[${certIdx}].date`, e.target.value)} className="w-full p-2 bg-white border border-gray-100 rounded-md focus:ring-1 focus:ring-[#ff4d7d] text-[11px] font-semibold uppercase tracking-wider" />
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {sectionId === 'projects' && (
                                  <div className="flex flex-col gap-2 w-full">
                                    {data.content.projects?.map((proj, projIdx) => (
                                      <div key={projIdx} className="bg-gray-50/50 p-2 rounded-lg border border-gray-100 flex flex-col gap-2 relative group/item w-full">
                                        <ArrayItemControls array={data.content.projects || []} index={projIdx} path="content.projects" updateNested={updateNested} />
                                        <input placeholder="Project Name" value={proj.name} onChange={e => updateNested(`content.projects[${projIdx}].name`, e.target.value)} className="w-full p-2 bg-white border border-gray-100 rounded-md focus:ring-1 focus:ring-[#ff4d7d] text-[11px] font-semibold pt-4 pr-4" />
                                        <div className="border border-gray-200 rounded-md overflow-hidden bg-white w-full text-[11px]">
                                          <RichTextEditor value={proj.description} onChange={val => updateNested(`content.projects[${projIdx}].description`, val)} />
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {sectionId === 'awards' && (
                                  <div className="flex flex-col gap-2 w-full">
                                    {data.content.awards?.map((award, aIdx) => (
                                      <div key={aIdx} className="bg-gray-50/50 p-2 rounded-lg border border-gray-100 flex flex-col gap-2 relative group/item w-full">
                                        <ArrayItemControls array={data.content.awards || []} index={aIdx} path="content.awards" updateNested={updateNested} />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-4 pr-4 w-full">
                                          <input placeholder="Award Title" value={award.title} onChange={e => updateNested(`content.awards[${aIdx}].title`, e.target.value)} className="w-full p-2 bg-white border border-gray-100 rounded-md focus:ring-1 focus:ring-[#ff4d7d] text-[11px] font-semibold" />
                                          <input placeholder="Issuer" value={award.issuer} onChange={e => updateNested(`content.awards[${aIdx}].issuer`, e.target.value)} className="w-full p-2 bg-white border border-gray-100 rounded-md focus:ring-1 focus:ring-[#ff4d7d] text-[11px] font-semibold" />
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
                                  <div className="flex flex-wrap gap-2 w-full">
                                    {data.content.interests?.map((interest, iIdx) => (
                                      <div key={interest.id || iIdx} className="relative group/skill flex-1 min-w-[100px]">
                                        <input
                                          value={interest.name || ''}
                                          onChange={e => updateNested(`content.interests[${iIdx}].name`, e.target.value)}
                                          className="w-full p-2 bg-white border border-gray-200 rounded-md focus:ring-1 focus:ring-[#ff4d7d] text-[11px] font-semibold"
                                          placeholder="Interest (e.g. Hiking)"
                                        />
                                        <button onClick={() => updateNested('content.interests', data.content.interests?.filter((_, idx) => idx !== iIdx))} className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-300 hover:text-red-500 transition-all opacity-0 group-hover/skill:opacity-100 bg-white shadow-sm p-0.5 rounded">
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {sectionId === 'courses' && (
                                  <div className="flex flex-col gap-2 w-full">
                                    {data.content.courses?.map((course, cIdx) => (
                                      <div key={cIdx} className="bg-gray-50/50 p-2 rounded-lg border border-gray-100 flex flex-col gap-2 relative group/item w-full">
                                        <ArrayItemControls array={data.content.courses || []} index={cIdx} path="content.courses" updateNested={updateNested} />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-4 pr-4 w-full">
                                          <input placeholder="Course Title" value={course.title} onChange={e => updateNested(`content.courses[${cIdx}].title`, e.target.value)} className="w-full p-2 bg-white border border-gray-100 rounded-md focus:ring-1 focus:ring-[#ff4d7d] text-[11px] font-semibold" />
                                          <input placeholder="Provider (e.g. Coursera)" value={course.provider} onChange={e => updateNested(`content.courses[${cIdx}].provider`, e.target.value)} className="w-full p-2 bg-white border border-gray-100 rounded-md focus:ring-1 focus:ring-[#ff4d7d] text-[11px] font-semibold" />
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
                                      <div key={oIdx} className="bg-gray-50/50 p-2 rounded-lg border border-gray-100 flex flex-col gap-2 relative group/item w-full">
                                        <ArrayItemControls array={data.content.organisations || []} index={oIdx} path="content.organisations" updateNested={updateNested} />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-4 pr-4 w-full">
                                          <input placeholder="Organisation Name" value={org.name} onChange={e => updateNested(`content.organisations[${oIdx}].name`, e.target.value)} className="w-full p-2 bg-white border border-gray-100 rounded-md focus:ring-1 focus:ring-[#ff4d7d] text-[11px] font-semibold" />
                                          <input placeholder="Role" value={org.role} onChange={e => updateNested(`content.organisations[${oIdx}].role`, e.target.value)} className="w-full p-2 bg-white border border-gray-100 rounded-md focus:ring-1 focus:ring-[#ff4d7d] text-[11px] font-semibold" />
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
                                      <div key={pIdx} className="bg-gray-50/50 p-2 rounded-lg border border-gray-100 flex flex-col gap-2 relative group/item w-full">
                                        <ArrayItemControls array={data.content.publications || []} index={pIdx} path="content.publications" updateNested={updateNested} />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-4 pr-4 w-full">
                                          <input placeholder="Title" value={pub.title} onChange={e => updateNested(`content.publications[${pIdx}].title`, e.target.value)} className="w-full p-2 bg-white border border-gray-100 rounded-md focus:ring-1 focus:ring-[#ff4d7d] text-[11px] font-semibold" />
                                          <input placeholder="Publisher" value={pub.publisher} onChange={e => updateNested(`content.publications[${pIdx}].publisher`, e.target.value)} className="w-full p-2 bg-white border border-gray-100 rounded-md focus:ring-1 focus:ring-[#ff4d7d] text-[11px] font-semibold" />
                                          <input type="month" placeholder="Date" value={pub.date} onChange={e => updateNested(`content.publications[${pIdx}].date`, e.target.value)} className="w-full p-2 bg-white border border-gray-100 rounded-md focus:ring-1 focus:ring-[#ff4d7d] text-[11px] font-semibold uppercase tracking-wider" />
                                          <input type="url" placeholder="URL" value={pub.url} onChange={e => updateNested(`content.publications[${pIdx}].url`, e.target.value)} className="w-full p-2 bg-white border border-gray-100 rounded-md focus:ring-1 focus:ring-[#ff4d7d] text-[11px] font-semibold" />
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
                                      <div key={rIdx} className="bg-gray-50/50 p-2 rounded-lg border border-gray-100 flex flex-col gap-2 relative group/item w-full">
                                        <ArrayItemControls array={data.content.references || []} index={rIdx} path="content.references" updateNested={updateNested} />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-4 pr-4 w-full">
                                          <input placeholder="Name" value={ref.name} onChange={e => updateNested(`content.references[${rIdx}].name`, e.target.value)} className="w-full p-2 bg-white border border-gray-100 rounded-md focus:ring-1 focus:ring-[#ff4d7d] text-[11px] font-semibold" />
                                          <input placeholder="Position" value={ref.position} onChange={e => updateNested(`content.references[${rIdx}].position`, e.target.value)} className="w-full p-2 bg-white border border-gray-100 rounded-md focus:ring-1 focus:ring-[#ff4d7d] text-[11px] font-semibold" />
                                          <input placeholder="Company" value={ref.company} onChange={e => updateNested(`content.references[${rIdx}].company`, e.target.value)} className="w-full p-2 bg-white border border-gray-100 rounded-md focus:ring-1 focus:ring-[#ff4d7d] text-[11px] font-semibold" />
                                          <input type="email" placeholder="Email" value={ref.email} onChange={e => updateNested(`content.references[${rIdx}].email`, e.target.value)} className="w-full p-2 bg-white border border-gray-100 rounded-md focus:ring-1 focus:ring-[#ff4d7d] text-[11px] font-semibold" />
                                          <input type="tel" placeholder="Phone" value={ref.phone} onChange={e => updateNested(`content.references[${rIdx}].phone`, e.target.value)} className="w-full p-2 bg-white border border-gray-100 rounded-md focus:ring-1 focus:ring-[#ff4d7d] text-[11px] font-semibold" />
                                          <input placeholder="Relationship" value={ref.relationship} onChange={e => updateNested(`content.references[${rIdx}].relationship`, e.target.value)} className="w-full p-2 bg-white border border-gray-100 rounded-md focus:ring-1 focus:ring-[#ff4d7d] text-[11px] font-semibold" />
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {sectionId === 'declaration' && (
                                  <div className="flex flex-col gap-2 w-full">
                                    <div className="bg-gray-50/50 p-2 rounded-lg border border-gray-100 flex flex-col gap-2 relative w-full">
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 w-full">
                                        <input placeholder="Place" value={data.content.declaration?.place || ''} onChange={e => updateNested(`content.declaration.place`, e.target.value)} className="w-full p-2 bg-white border border-gray-100 rounded-md focus:ring-1 focus:ring-[#ff4d7d] text-[11px] font-semibold" />
                                        <input type="date" placeholder="Date" value={data.content.declaration?.date || ''} onChange={e => updateNested(`content.declaration.date`, e.target.value)} className="w-full p-2 bg-white border border-gray-100 rounded-md focus:ring-1 focus:ring-[#ff4d7d] text-[11px] font-semibold uppercase tracking-wider" />
                                      </div>
                                      <input placeholder="Declaration Text" value={data.content.declaration?.text || ''} onChange={e => updateNested(`content.declaration.text`, e.target.value)} className="w-full p-2 bg-white border border-gray-100 rounded-md focus:ring-1 focus:ring-[#ff4d7d] text-[11px] font-semibold" />
                                    </div>
                                  </div>
                                )}

                                {sectionId === 'custom' && (
                                  <div className="flex flex-col gap-2 w-full">
                                    {data.content.custom?.map((cus, cIdx) => (
                                      <div key={cIdx} className="bg-gray-50/50 p-2 rounded-lg border border-gray-100 flex flex-col gap-2 relative group/item w-full">
                                        <ArrayItemControls array={data.content.custom || []} index={cIdx} path="content.custom" updateNested={updateNested} />
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

        {/* Floating Add Content Button Area */}
        <div className="pt-6 w-full flex justify-center pb-6">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 py-3 px-8 bg-gradient-to-r from-[#ed1882] to-[#fc6076] text-white rounded-xl shadow-[0_8px_16px_-6px_rgba(237,24,130,0.5)] hover:shadow-[0_12px_20px_-6px_rgba(237,24,130,0.6)] hover:-translate-y-0.5 transition-all font-bold text-sm tracking-wide"
          >
            <Plus className="w-5 h-5" strokeWidth={3} /> Add Content
          </button>
        </div>

      </div>

      <AddContentModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        activeSections={data.activeSections}
        onSelect={addSection}
      />
    </div>
  );
};

export default ContentEditor;
