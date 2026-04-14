'use client';

import React, { useState } from 'react';
import {
  X, AlignLeft, GraduationCap, Briefcase, BadgeCheck,
  Languages, Award, Heart, FolderGit2, BookOpen, Trophy,
  Building, BookMarked, Users, PenTool, LayoutTemplate,
  Globe, Upload, Check,
} from 'lucide-react';

interface AddContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeSections: string[];
  onSelect: (id: string) => void;
}

export const CONTENT_MODULES = [
  {
    id: 'summary',
    title: 'Summary',
    desc: 'Add a short summary of your key strengths, experience, and career goals.',
    icon: AlignLeft,
  },
  {
    id: 'education',
    title: 'Education',
    desc: 'Add your degrees and schools. Include your focus, honors, or exchange terms.',
    icon: GraduationCap,
  },
  {
    id: 'experience',
    title: 'Professional Experience',
    desc: 'Add your professional roles and employer history including internships.',
    icon: Briefcase,
  },
  {
    id: 'skills',
    title: 'Skills',
    desc: 'Add your hard and soft skills that help you stand out from the crowd today.',
    icon: BadgeCheck,
  },
  {
    id: 'languages',
    title: 'Languages',
    desc: 'Add your languages and proficiency level to show your communication range.',
    icon: Languages,
  },
  {
    id: 'socials',
    title: 'Social Profiles',
    desc: 'Add your social profiles and online links to your professional presence.',
    icon: Globe,
  },
  {
    id: 'certifications',
    title: 'Certificates',
    desc: 'Add your industry certificates or licences. Include issuer and date earned.',
    icon: Award,
  },
  {
    id: 'interests',
    title: 'Interests',
    desc: 'Add relevant personal interests that support your career story and cultural fit.',
    icon: Heart,
  },
  {
    id: 'projects',
    title: 'Projects',
    desc: 'Add key projects you participated in and highlight your challenges, role, and impact.',
    icon: FolderGit2,
  },
  {
    id: 'courses',
    title: 'Courses',
    desc: 'Add online or in-person courses and trainings you joined and completed.',
    icon: BookOpen,
  },
  {
    id: 'awards',
    title: 'Awards',
    desc: 'Add your awards and recognitions from industry, competitions, or academia.',
    icon: Trophy,
  },
  {
    id: 'organisations',
    title: 'Organisations',
    desc: 'Add your memberships or volunteering with organisations including your role.',
    icon: Building,
  },
  {
    id: 'publications',
    title: 'Publications',
    desc: 'Add publications, articles, or books you wrote or contributed to.',
    icon: BookMarked,
  },
  {
    id: 'references',
    title: 'References',
    desc: 'Add your references from managers or coworkers, including their contact details.',
    icon: Users,
  },
  {
    id: 'declaration',
    title: 'Declaration',
    desc: 'Add your declaration by creating or uploading your personal signature.',
    icon: PenTool,
  },
  {
    id: 'custom',
    title: 'Custom',
    desc: 'Add a custom section for anything else, or combine sections cleanly.',
    icon: LayoutTemplate,
  },
];

const AddContentModal: React.FC<AddContentModalProps> = ({
  isOpen, onClose, activeSections, onSelect,
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelect = (id: string) => {
    const isActive = activeSections.includes(id);
    if (!isActive) {
      onSelect(id);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-5xl flex flex-col rounded-2xl shadow-2xl overflow-hidden"
        style={{
          background: 'var(--app-bg-card)',
          border: '1px solid var(--app-border)',
          maxHeight: '90vh',
        }}
      >
        {/* ── Header ── */}
        <div
          className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{ borderBottom: '1px solid var(--app-border)' }}
        >
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-black tracking-tight" style={{ color: 'var(--app-text)' }}>
              Add content
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold" style={{ color: 'var(--app-text-muted)' }}>
                Quick start:
              </span>
              <button
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:opacity-80"
                style={{
                  background: 'var(--app-primary-light)',
                  color: 'var(--app-primary)',
                  border: '1px solid var(--app-primary)',
                }}
              >
                <Upload className="w-3 h-3" />
                Import Resume
              </button>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl transition-all"
            style={{ color: 'var(--app-text-muted)' }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = 'var(--app-bg-gray)';
              (e.currentTarget as HTMLElement).style.color = 'var(--app-text)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'transparent';
              (e.currentTarget as HTMLElement).style.color = 'var(--app-text-muted)';
            }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Grid ── */}
        <div
          className="flex-1 overflow-y-auto p-5 custom-scrollbar"
          style={{ background: 'var(--app-bg-gray)' }}
        >
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {CONTENT_MODULES.map(module => {
              const isActive = activeSections.includes(module.id);
              const isHovered = hoveredId === module.id;
              const Icon = module.icon;

              return (
                <button
                  key={module.id}
                  onClick={() => handleSelect(module.id)}
                  disabled={isActive}
                  onMouseEnter={() => !isActive && setHoveredId(module.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className="flex flex-col text-left p-4 rounded-xl transition-all duration-150 relative"
                  style={{
                    background: isActive
                      ? 'var(--app-bg-medium)'
                      : isHovered
                        ? 'var(--app-bg-card)'
                        : 'var(--app-bg-card)',
                    border: isActive
                      ? '1px solid var(--app-border-light)'
                      : isHovered
                        ? `2px solid var(--app-primary)`
                        : '1px solid var(--app-border)',
                    opacity: isActive ? 0.45 : 1,
                    cursor: isActive ? 'not-allowed' : 'pointer',
                    boxShadow: isHovered && !isActive ? 'var(--app-shadow-md)' : 'var(--app-shadow)',
                    transform: isHovered && !isActive ? 'translateY(-2px)' : 'none',
                  }}
                >
                  {/* Active checkmark */}
                  {isActive && (
                    <div
                      className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: 'var(--app-primary)', color: '#fff' }}
                    >
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}

                  {/* Icon */}
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center mb-3 transition-all"
                    style={{
                      background: isHovered && !isActive
                        ? 'var(--app-primary)'
                        : 'var(--app-bg-gray)',
                      color: isHovered && !isActive
                        ? '#fff'
                        : 'var(--app-text-secondary)',
                    }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  {/* Title */}
                  <h3
                    className="font-bold text-sm mb-1.5 leading-tight"
                    style={{ color: 'var(--app-text)' }}
                  >
                    {module.title}
                  </h3>

                  {/* Description */}
                  <p
                    className="text-[11px] leading-relaxed"
                    style={{ color: 'var(--app-text-muted)' }}
                  >
                    {module.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Footer ── */}
        <div
          className="px-6 py-3 flex items-center justify-between shrink-0"
          style={{ borderTop: '1px solid var(--app-border)', background: 'var(--app-bg-card)' }}
        >
          <p className="text-xs" style={{ color: 'var(--app-text-muted)' }}>
            {activeSections.length} section{activeSections.length !== 1 ? 's' : ''} active
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
            style={{
              background: 'var(--app-bg-gray)',
              color: 'var(--app-text-secondary)',
              border: '1px solid var(--app-border)',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--app-bg-medium)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--app-bg-gray)'}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddContentModal;
