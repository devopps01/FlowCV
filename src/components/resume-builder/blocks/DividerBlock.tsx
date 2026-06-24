'use client';

import React from 'react';
import { ResumeBlock, ResumeData } from '../types/resume.types';

interface Props {
  block: ResumeBlock;
  sectionId: string;
  data: ResumeData;
  onUpdate?: (content: any) => void;
  isEditing?: boolean;
}

const DividerBlock: React.FC<Props> = ({ block, data }) => {
  const theme = data.theme;
  return (
    <hr
      className="my-2"
      style={{
        border: 'none',
        borderTop: '2px solid ' + (theme.primaryColor || '#d1d5db'),
        margin: '8px 0',
      }}
    />
  );
};

export default DividerBlock;
