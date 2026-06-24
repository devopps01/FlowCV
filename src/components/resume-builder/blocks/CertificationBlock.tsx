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

const CertificationBlock: React.FC<Props> = ({ block, data, onUpdate, isEditing }) => {
  const cert = block.content || {};
  const theme = data.theme;

  return (
    <div className="flex items-center gap-1.5" style={{ fontFamily: theme.fontFamily }}>
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: theme.primaryColor }} />
      <EditableText
        value={cert.name || ''}
        onChange={(val) => onUpdate?.({ ...cert, name: val })}
        tag="span"
        style={{ fontSize: `${theme.fontSize || 10.5}px`, color: theme.textColor }}
        isEditing={isEditing}
      />
      {cert.issuer && (
        <span className="opacity-40" style={{ fontSize: `${(theme.fontSize || 10.5) - 1}px` }}>
          ({cert.issuer})
        </span>
      )}
    </div>
  );
};

export default CertificationBlock;