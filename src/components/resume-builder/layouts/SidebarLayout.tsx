'use client';

import React from 'react';
import { ResumeData } from '../types/resume.types';
import DynamicSectionRenderer from '../DynamicSectionRenderer';

interface Props {
  data: ResumeData;
  onUpdate?: (sectionId: string, blockId: string, content: any) => void;
  onUpdateSection?: (sectionId: string, updates: Partial<any>) => void;
  isEditing?: boolean;
}

const SIDEBAR_TYPES = ['skills', 'languages', 'interests', 'awards', 'certifications', 'socials'];

const SidebarLayout: React.FC<Props> = ({ data, onUpdate, isEditing }) => {
  const theme = data.theme;
  const sidebarSections = data.sections.filter(s => s.visible && SIDEBAR_TYPES.includes(s.type));
  const mainSections = data.sections.filter(s => s.visible && !SIDEBAR_TYPES.includes(s.type) && s.type !== 'personal');

  return (
    <div className="flex w-full min-h-screen" style={{
      fontFamily: theme.fontFamily,
      fontSize: `${theme.fontSize || 10.5}px`,
      lineHeight: theme.lineHeight || 1.45,
      color: theme.textColor,
    }}>
      {/* Sidebar */}
      <div className="w-[32%] shrink-0 p-6" style={{
        backgroundColor: `${theme.primaryColor}08`,
      }}>
        <div className="flex flex-col gap-6">
          {sidebarSections
            .sort((a, b) => a.order - b.order)
            .map(section => (
              <DynamicSectionRenderer
                key={section.id}
                section={section}
                data={data}
                onUpdateBlock={(sectionId, blockId, content) => onUpdate?.(sectionId, blockId, content)}
                isEditing={isEditing}
                layout="sidebar"
              />
            ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="flex flex-col gap-6">
          {mainSections
            .sort((a, b) => a.order - b.order)
            .map(section => (
              <DynamicSectionRenderer
                key={section.id}
                section={section}
                data={data}
                onUpdateBlock={(sectionId, blockId, content) => onUpdate?.(sectionId, blockId, content)}
                isEditing={isEditing}
                layout="single"
              />
            ))}
        </div>
      </div>
    </div>
  );
};

export default SidebarLayout;