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

const ProfessionalTitleBlock: React.FC<Props> = ({ block, data, onUpdate, isEditing }) => {
  return (
    <EditableText
      value={block.content || ''}
      onChange={(val) => onUpdate?.(val)}
      tag="p"
      className="font-bold opacity-40 tracking-[0.2em] uppercase"
      style={{ fontSize: '11px', color: data.theme.primaryColor || '#1f2937', fontFamily: data.theme.fontFamily }}
      isEditing={isEditing}
    />
  );
};

export default ProfessionalTitleBlock;