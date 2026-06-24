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

const TextBlock: React.FC<Props> = ({ block, data, onUpdate, isEditing }) => {
  const theme = data.theme;
  return (
    <EditableText
      value={block.content || ''}
      onChange={(val) => onUpdate?.(val)}
      tag="p"
      multiline
      className="text-sm leading-relaxed"
      style={{
        color: theme.textColor,
        fontFamily: theme.fontFamily,
        fontSize: theme.fontSize + 'px',
      }}
      isEditing={isEditing}
    />
  );
};

export default TextBlock;
