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

const SocialBlock: React.FC<Props> = ({ block, data, onUpdate, isEditing }) => {
  const social = block.content || {};
  const theme = data.theme;

  return (
    <div className="flex items-center gap-1.5" style={{ fontFamily: theme.fontFamily }}>
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: theme.primaryColor }} />
      <EditableText
        value={social.label || social.platform || ''}
        onChange={(val) => onUpdate?.({ ...social, label: val })}
        tag="span"
        style={{ fontSize: `${theme.fontSize || 10.5}px`, color: theme.textColor }}
        isEditing={isEditing}
      />
      {social.url && (
        <a href={social.url} target="_blank" rel="noopener noreferrer"
          className="opacity-50 hover:opacity-100 transition-opacity"
          style={{ fontSize: `${(theme.fontSize || 10.5) - 1}px` }}>
          ↗
        </a>
      )}
    </div>
  );
};

export default SocialBlock;