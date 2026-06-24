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

const shapeMap: Record<string, string> = { circle: '50%', rounded: '8px', square: '0' };

const PhotoBlock: React.FC<Props> = ({ block, data }) => {
  const theme = data.theme;
  const shape = shapeMap[theme.photoShape || 'circle'];
  const size = block.props?.size || 120;
  if (!block.content) return null;
  return (
    <div className="flex justify-center py-2">
      <img
        src={block.content}
        alt="Profile"
        style={{
          width: size,
          height: size,
          borderRadius: shape,
          objectFit: 'cover',
          border: theme.primaryColor ? '2px solid ' + theme.primaryColor : undefined,
        }}
      />
    </div>
  );
};

export default PhotoBlock;
