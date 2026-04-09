import React from 'react';
import { X, AlignLeft, GraduationCap, Briefcase, BadgeCheck, Languages, Award, Heart, FolderGit2, BookOpen, Trophy, Building, BookMarked, Users, PenTool, LayoutTemplate } from 'lucide-react';

interface AddContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeSections: string[];
  onSelect: (id: string) => void;
}

export const CONTENT_MODULES = [
  { id: 'summary', title: 'Summary', desc: 'Add a short summary of your key strengths, experience, and career goals.', icon: AlignLeft },
  { id: 'education', title: 'Education', desc: 'Add your degrees and schools. Include your focus, honors, or exchange terms.', icon: GraduationCap },
  { id: 'experience', title: 'Professional Experience', desc: 'Add your professional roles and employer history including internships.', icon: Briefcase },
  { id: 'skills', title: 'Skills', desc: 'Add your hard and soft skills that help you stand out from the crowd today.', icon: BadgeCheck },
  { id: 'languages', title: 'Languages', desc: 'Add your languages and proficiency level to show your communication range.', icon: Languages },
  { id: 'socials', title: 'Social Profiles', desc: 'Add your social profiles and online links to your professional presence.', icon: FolderGit2 },
  { id: 'certifications', title: 'Certificates', desc: 'Add your industry certificates or licences. Include issuer and date earned.', icon: Award },
  { id: 'interests', title: 'Interests', desc: 'Add relevant personal interests that support your career story and cultural fit.', icon: Heart },
  { id: 'projects', title: 'Projects', desc: 'Add key projects you participated in and highlight your challenges, role, and impact.', icon: FolderGit2 },
  { id: 'courses', title: 'Courses', desc: 'Add online or in-person courses and trainings you joined and completed.', icon: BookOpen },
  { id: 'awards', title: 'Awards', desc: 'Add your awards and recognitions from industry, competitions, or academia.', icon: Trophy },
  { id: 'organisations', title: 'Organisations', desc: 'Add your memberships or volunteering with organisations including your role.', icon: Building },
  { id: 'publications', title: 'Publications', desc: 'Add publications, articles, or books you wrote or contributed to.', icon: BookMarked },
  { id: 'references', title: 'References', desc: 'Add your references from managers or coworkers, including their contact details.', icon: Users },
  { id: 'declaration', title: 'Declaration', desc: 'Add your declaration by creating or uploading your personal signature.', icon: PenTool },
  { id: 'custom', title: 'Custom', desc: 'Add a custom section for anything else, or combine sections cleanly.', icon: LayoutTemplate }
];

const AddContentModal: React.FC<AddContentModalProps> = ({ isOpen, onClose, activeSections, onSelect }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-5xl rounded-xl shadow-2xl flex flex-col scale-in-center animate-in zoom-in-95 duration-200 max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Add content</h2>
            <div className="flex items-center gap-2">
               <span className="text-sm font-semibold text-gray-500">Quick start:</span>
               <button className="px-3 py-1.5 bg-[#7c3aed]/10 text-[#7c3aed] text-xs font-bold rounded-lg flex items-center gap-1 hover:bg-[#7c3aed]/20 transition-colors">
                 <PenTool className="w-3 h-3" /> Import Resume
               </button>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-all text-gray-400 hover:text-gray-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Grid Content */}
        <div className="p-4 overflow-y-auto custom-scrollbar flex-1 bg-gray-50/50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {CONTENT_MODULES.map(module => {
              const isActive = activeSections.includes(module.id);
              
              return (
                <button
                  key={module.id}
                  onClick={() => {
                     if (!isActive) {
                        onSelect(module.id);
                        onClose();
                     }
                  }}
                  disabled={isActive}
                  className={`flex flex-col text-left p-4 rounded-xl border-2 transition-all ${
                    isActive 
                    ? 'border-transparent bg-gray-50 opacity-40 cursor-not-allowed' 
                    : 'border-white bg-white shadow-sm hover:border-[#7c3aed]/30 hover:shadow-md hover:-translate-y-0.5'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <module.icon className="w-4 h-4 text-gray-700" />
                    <h3 className="font-bold text-gray-900 text-sm">{module.title}</h3>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed font-medium">
                    {module.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddContentModal;
