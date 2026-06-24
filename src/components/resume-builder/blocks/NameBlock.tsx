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

const NameBlock: React.FC<Props> = ({ block, data, onUpdate, isEditing }) => {
  const theme = data.theme;
  const sizeMap: Record<string, string> = { xs: '14px', s: '18px', m: '22px', l: '26px', xl: '30px' };
  const fontSize = sizeMap[block.props?.size || theme.nameSize || 'xl'] || '24px';
  const isBold = block.props?.bold !== false && theme.nameBold !== false;

  return (
    <EditableText
      value={block.content || ''}
      onChange={(val) => onUpdate?.(val)}
      tag="h1"
      className="uppercase tracking-tight leading-none"
      style={{
        color: theme.primaryColor || '#1f2937',
        fontSize,
        fontWeight: isBold ? 900 : 600,
        fontFamily: theme.fontFamily,
      }}
      isEditing={isEditing}
    />
  );
};

export default NameBlock;