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

const AwardBlock: React.FC<Props> = ({ block, data, onUpdate, isEditing }) => {
  const award = block.content || {};
  const theme = data.theme;

  return (
    <div className="award-entry space-y-1" style={{ fontFamily: theme.fontFamily }}>
      <div className="flex justify-between">
        <div className="flex-1">
          <EditableText value={award.title || ''} onChange={(val) => onUpdate?.({ ...award, title: val })}
            tag="h3" className="font-bold"
            style={{ fontSize: `${(theme.fontSize || 10.5) + 1}px`, color: theme.textColor }}
            isEditing={isEditing} />
          <EditableText value={award.issuer || ''} onChange={(val) => onUpdate?.({ ...award, issuer: val })}
            tag="p" style={{ fontSize: `${theme.fontSize || 10.5}px`, color: theme.textColor, opacity: 0.7 }}
            isEditing={isEditing} />
        </div>
        {award.date && (
          <EditableText value={award.date || ''} onChange={(val) => onUpdate?.({ ...award, date: val })}
            tag="span" className="text-xs whitespace-nowrap"
            style={{ color: theme.textColor, opacity: 0.5 }}
            isEditing={isEditing} />
        )}
      </div>
    </div>
  );
};

export default AwardBlock;