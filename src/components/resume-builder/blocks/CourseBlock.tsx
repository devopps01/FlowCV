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

const CourseBlock: React.FC<Props> = ({ block, data, onUpdate, isEditing }) => {
  const course = block.content || {};
  const theme = data.theme;

  return (
    <div className="flex items-center gap-1.5" style={{ fontFamily: theme.fontFamily }}>
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: theme.primaryColor }} />
      <EditableText value={course.title || ''} onChange={(val) => onUpdate?.({ ...course, title: val })}
        tag="span" style={{ fontSize: `${theme.fontSize || 10.5}px`, color: theme.textColor }}
        isEditing={isEditing} />
      {course.provider && (
        <span className="opacity-40" style={{ fontSize: `${(theme.fontSize || 10.5) - 1}px` }}>
          — {course.provider}
        </span>
      )}
    </div>
  );
};

export default CourseBlock;