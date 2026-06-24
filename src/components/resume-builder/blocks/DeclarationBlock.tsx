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

const DeclarationBlock: React.FC<Props> = ({ block, data, onUpdate, isEditing }) => {
  const declaration = block.content || {};
  const theme = data.theme;

  return (
    <div className="space-y-3" style={{ fontFamily: theme.fontFamily }}>
      <EditableText
        value={declaration.text || ''}
        onChange={(val) => onUpdate?.({ ...declaration, text: val })}
        tag="p"
        multiline
        className="leading-relaxed"
        style={{ fontSize: `${theme.fontSize || 10.5}px`, color: theme.textColor }}
        isEditing={isEditing}
      />
      <div className="flex gap-10 font-semibold opacity-60" style={{ fontSize: `${(theme.fontSize || 10.5) - 1}px` }}>
        {declaration.date && (
          <EditableText value={declaration.date || ''} onChange={(val) => onUpdate?.({ ...declaration, date: val })}
            tag="span" style={{ color: theme.textColor }} isEditing={isEditing} />
        )}
        {declaration.place && (
          <EditableText value={declaration.place || ''} onChange={(val) => onUpdate?.({ ...declaration, place: val })}
            tag="span" style={{ color: theme.textColor }} isEditing={isEditing} />
        )}
      </div>
    </div>
  );
};

export default DeclarationBlock;