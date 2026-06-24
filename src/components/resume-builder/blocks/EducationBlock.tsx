'use client';

import React from 'react';
import { ResumeBlock, ResumeData } from '../types/resume.types';
import EditableText from '../EditableText';

interface Props {
  block: ResumeBlock;
  sectionId: string;
  data: ResumeData;
  onUpdate?: (content: any) => void;
  isEditing?: boolean;
}

const EducationBlock: React.FC<Props> = ({ block, data, onUpdate, isEditing }) => {
  const edu = block.content || {};
  const theme = data.theme;

  return (
    <div className="education-entry space-y-1" style={{ fontFamily: theme.fontFamily }}>
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1">
          <EditableText
            value={edu.degree || ''}
            onChange={(val) => onUpdate?.({ ...edu, degree: val })}
            tag="h3"
            className="font-bold"
            style={{ fontSize: `${(theme.fontSize || 10.5) + 2}px`, color: theme.textColor }}
            isEditing={isEditing}
          />
          <EditableText
            value={edu.school || ''}
            onChange={(val) => onUpdate?.({ ...edu, school: val })}
            tag="p"
            className="font-medium"
            style={{ fontSize: `${theme.fontSize || 10.5}px`, color: theme.textColor, opacity: 0.7 }}
            isEditing={isEditing}
          />
        </div>
        <EditableText
          value={edu.graduationYear || ''}
          onChange={(val) => onUpdate?.({ ...edu, graduationYear: val })}
          tag="span"
          className="text-xs whitespace-nowrap"
          style={{ color: theme.textColor, opacity: 0.5 }}
          isEditing={isEditing}
        />
      </div>
      {edu.field && (
        <p style={{ fontSize: `${theme.fontSize || 10.5}px`, color: theme.textColor, opacity: 0.5 }}>
          {edu.field}
        </p>
      )}
      {edu.description && (
        <EditableText
          value={edu.description || ''}
          onChange={(val) => onUpdate?.({ ...edu, description: val })}
          tag="div"
          multiline
          className="leading-relaxed"
          style={{ fontSize: `${theme.fontSize || 10.5}px`, color: theme.textColor, opacity: 0.8, marginTop: '4px' }}
          isEditing={isEditing}
        />
      )}
    </div>
  );
};

export default EducationBlock;