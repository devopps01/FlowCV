'use client';

import React from 'react';
import { ResumeData } from '../types/resume.types';
import DynamicSectionRenderer from '../DynamicSectionRenderer';
import { ResumeSection } from '../types/resume.types';

interface Props {
  data: ResumeData;
  onUpdate?: (sectionId: string, blockId: string, content: any) => void;
  onUpdateSection?: (sectionId: string, updates: Partial<any>) => void;
  isEditing?: boolean;
}

const ModernLayout: React.FC<Props> = ({ data, onUpdate, isEditing }) => {
  const theme = data.theme;
  const sections = data.sections.filter(s => s.visible).sort((a, b) => a.order - b.order);
  const personalSection = sections.find(s => s.type === 'personal');
  const otherSections = sections.filter(s => s.type !== 'personal');

  return (
    <div className="flex flex-col w-full" style={{
      fontFamily: theme.fontFamily,
      fontSize: `${theme.fontSize || 10.5}px`,
      lineHeight: theme.lineHeight || 1.45,
      color: theme.textColor,
    }}>
      {/* Modern Header Area */}
      {personalSection && (
        <div className="py-8 px-6 mb-4" style={{
          backgroundColor: theme.primaryColor || '#1f2937',
          color: '#ffffff',
          borderRadius: theme.borderRadius === 'lg' ? '16px' : theme.borderRadius === 'xl' ? '24px' : '8px',
        }}>
          <DynamicSectionRenderer
            section={personalSection}
            data={data}
            onUpdateBlock={(sectionId, blockId, content) => onUpdate?.(sectionId, blockId, content)}
            isEditing={isEditing}
            layout="modern"
          />
        </div>
      )}

      {/* Main Sections */}
      <div className="px-6">
        {otherSections.map(section => (
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
  );
};

export default ModernLayout;