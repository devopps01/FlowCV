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

const SkillBlock: React.FC<Props> = ({ block, data, onUpdate, isEditing }) => {
  const theme = data.theme;
  const skill = typeof block.content === 'string' ? { name: block.content } : block.content || {};
  const style = block.props?.style || 'grid';

  const name = (
    <EditableText
      value={skill.name || ''}
      onChange={(val) => onUpdate?.({ ...skill, name: val })}
      tag="span"
      style={{ fontSize: `${theme.fontSize || 10.5}px`, color: theme.textColor, fontFamily: theme.fontFamily }}
      isEditing={isEditing}
    />
  );

  if (style === 'compact') {
    return (
      <span className="inline-flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.primaryColor }} />
        {name}
      </span>
    );
  }

  if (style === 'bubble') {
    return (
      <span
        className="px-2.5 py-0.5 rounded-full font-semibold inline-block"
        style={{
          fontSize: `${theme.fontSize || 10.5}px`,
          color: theme.primaryColor,
          backgroundColor: `${theme.primaryColor}12`,
          border: `1px solid ${theme.primaryColor}25`,
          fontFamily: theme.fontFamily,
        }}
      >
        {name}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1.5 font-medium" style={{ fontSize: `${theme.fontSize || 10.5}px`, color: theme.textColor, fontFamily: theme.fontFamily }}>
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: theme.primaryColor }} />
      {name}
    </div>
  );
};

export default SkillBlock;