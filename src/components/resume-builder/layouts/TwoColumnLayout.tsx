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

const TwoColumnLayout: React.FC<Props> = ({ data, onUpdate, isEditing }) => {
  const theme = data.theme;
  const visibleSections = data.sections.filter(s => s.visible).sort((a, b) => a.order - b.order);

  // Split sections evenly between left and right columns
  const mid = Math.ceil(visibleSections.length / 2);
  const leftSections = visibleSections.slice(0, mid);
  const rightSections = visibleSections.slice(mid);

  return (
    <div className="flex w-full gap-6" style={{
      fontFamily: theme.fontFamily,
      fontSize: `${theme.fontSize || 10.5}px`,
      lineHeight: theme.lineHeight || 1.45,
      color: theme.textColor,
    }}>
      {/* Left Column */}
      <div className="flex-1 flex flex-col gap-4">
        {leftSections.map(section => (
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

      {/* Right Column */}
      <div className="flex-1 flex flex-col gap-4">
        {rightSections.map(section => (
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

export default TwoColumnLayout;