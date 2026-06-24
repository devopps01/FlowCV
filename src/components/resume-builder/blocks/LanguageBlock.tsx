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

const LanguageBlock: React.FC<Props> = ({ block, data, onUpdate, isEditing }) => {
  const theme = data.theme;
  const lang = block.content || {};
  const style = block.props?.style || 'grid';

  const getLevelPercentage = (proficiency: string): number => {
    const p = proficiency.toLowerCase();
    if (p.includes('native') || p.includes('fluent')) return 100;
    if (p.includes('advanced') || p.includes('4/5')) return 80;
    if (p.includes('intermediate') || p.includes('3/5')) return 60;
    if (p.includes('beginner') || p.includes('2/5')) return 40;
    if (p.includes('limited') || p.includes('1/5')) return 20;
    return 50;
  };

  const languageName = (
    <EditableText
      value={lang.language || ''}
      onChange={(val) => onUpdate?.({ ...lang, language: val })}
      tag="span"
      style={{ fontSize: `${theme.fontSize || 10.5}px`, color: theme.textColor, fontFamily: theme.fontFamily }}
      isEditing={isEditing}
    />
  );

  const proficiencyText = lang.proficiency ? (
    <span className="opacity-40" style={{ fontSize: `${(theme.fontSize || 10.5) - 1}px` }}>
      {lang.proficiency}
    </span>
  ) : null;

  if (style === 'compact') {
    return (
      <span className="inline-flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.primaryColor }} />
        {languageName}
        {lang.proficiency && <span className="opacity-40 mx-1">—</span>}
        {proficiencyText}
      </span>
    );
  }

  if (style === 'level') {
    const level = getLevelPercentage(lang.proficiency || '');
    return (
      <div className="space-y-1" style={{ fontFamily: theme.fontFamily }}>
        <div className="flex justify-between items-center">
          {languageName}
          {proficiencyText}
        </div>
        <div className="h-1 w-full rounded-full overflow-hidden" style={{ backgroundColor: `${theme.textColor}15` }}>
          <div className="h-full rounded-full" style={{ width: `${level}%`, backgroundColor: theme.primaryColor }} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5" style={{ fontFamily: theme.fontFamily }}>
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: theme.primaryColor }} />
      {languageName}
      {lang.proficiency && <span className="opacity-30 mx-1">—</span>}
      {proficiencyText}
    </div>
  );
};

export default LanguageBlock;