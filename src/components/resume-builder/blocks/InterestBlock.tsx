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

const InterestBlock: React.FC<Props> = ({ block, data, onUpdate, isEditing }) => {
  const theme = data.theme;
  const interest = typeof block.content === 'string' ? { name: block.content } : block.content || {};

  return (
    <span className="inline-flex items-center gap-1">
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.primaryColor }} />
      <EditableText
        value={interest.name || ''}
        onChange={(val) => onUpdate?.({ ...interest, name: val })}
        tag="span"
        style={{ fontSize: `${theme.fontSize || 10.5}px`, color: theme.textColor, fontFamily: theme.fontFamily }}
        isEditing={isEditing}
      />
    </span>
  );
};

export default InterestBlock;