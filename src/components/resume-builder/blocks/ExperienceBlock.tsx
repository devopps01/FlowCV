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

const ExperienceBlock: React.FC<Props> = ({ block, data, onUpdate, isEditing }) => {
  const experience = block.content || {};
  const theme = data.theme;

  return (
    <div className="experience-entry space-y-1" style={{ fontFamily: theme.fontFamily }}>
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1">
          <EditableText
            value={experience.position || ''}
            onChange={(val) => onUpdate?.({ ...experience, position: val })}
            tag="h3"
            className="font-bold"
            style={{ fontSize: `${(theme.fontSize || 10.5) + 2}px`, color: theme.textColor }}
            isEditing={isEditing}
          />
          <EditableText
            value={experience.company || ''}
            onChange={(val) => onUpdate?.({ ...experience, company: val })}
            tag="p"
            className="font-medium"
            style={{ fontSize: `${theme.fontSize || 10.5}px`, color: theme.textColor, opacity: 0.7 }}
            isEditing={isEditing}
          />
        </div>
        <EditableText
          value={`${experience.startDate || ''}${experience.endDate ? ` — ${experience.endDate}` : ''}`}
          onChange={(val) => {
            const parts = val.split(' — ').map((s: string) => s.trim());
            onUpdate?.({ ...experience, startDate: parts[0] || '', endDate: parts[1] || '' });
          }}
          tag="span"
          className="text-xs whitespace-nowrap"
          style={{ color: theme.textColor, opacity: 0.5 }}
          isEditing={isEditing}
        />
      </div>
      {experience.location && (
        <p style={{ fontSize: `${theme.fontSize || 10.5}px`, color: theme.textColor, opacity: 0.5 }}>
          {experience.location}
        </p>
      )}
      {experience.description && (
        <EditableText
          value={experience.description || ''}
          onChange={(val) => onUpdate?.({ ...experience, description: val })}
          tag="div"
          multiline
          className="rich-text leading-relaxed"
          style={{ fontSize: `${theme.fontSize || 10.5}px`, color: theme.textColor, opacity: 0.8, marginTop: '4px' }}
          isEditing={isEditing}
        />
      )}
    </div>
  );
};

export default ExperienceBlock;