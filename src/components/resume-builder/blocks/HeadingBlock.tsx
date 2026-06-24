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

const HeadingBlock: React.FC<Props> = ({ block, data, onUpdate, isEditing }) => {
  const theme = data.theme;
  return (
    <EditableText
      value={block.content || ''}
      onChange={(val) => onUpdate?.(val)}
      tag="h2"
      className="font-bold"
      style={{
        color: theme.primaryColor || '#1f2937',
        fontFamily: theme.fontFamily,
        fontSize: (theme.fontSize + 6) + 'px',
      }}
      isEditing={isEditing}
    />
  );
};

export default HeadingBlock;
