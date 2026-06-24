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

const SingleColumnLayout: React.FC<Props> = ({ data, onUpdate, isEditing }) => {
  const theme = data.theme;

  return (
    <div className="flex flex-col w-full" style={{
      fontFamily: theme.fontFamily,
      fontSize: `${theme.fontSize || 10.5}px`,
      lineHeight: theme.lineHeight || 1.45,
      color: theme.textColor,
    }}>
      {data.sections
        .filter(s => s.visible)
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
  );
};

export default SingleColumnLayout;