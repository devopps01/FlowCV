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

const CustomBlock: React.FC<Props> = ({ block, data, onUpdate, isEditing }) => {
  const custom = block.content || {};
  const theme = data.theme;

  return (
    <div className="space-y-1" style={{ fontFamily: theme.fontFamily }}>
      <EditableText
        value={custom.title || ''}
        onChange={(val) => onUpdate?.({ ...custom, title: val })}
        tag="h3" className="font-bold"
        style={{ fontSize: `${(theme.fontSize || 10.5) + 1}px`, color: theme.textColor }}
        isEditing={isEditing}
      />
      <EditableText
        value={custom.content || ''}
        onChange={(val) => onUpdate?.({ ...custom, content: val })}
        tag="div" multiline
        className="leading-relaxed"
        style={{ fontSize: `${theme.fontSize || 10.5}px`, color: theme.textColor, opacity: 0.8 }}
        isEditing={isEditing}
      />
    </div>
  );
};

export default CustomBlock;