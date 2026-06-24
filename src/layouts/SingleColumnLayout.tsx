'use client';

import React from 'react';
import type { ResumeData } from '@/types/resume-builder.types';
import { DynamicSectionRenderer } from '@/sections/DynamicSectionRenderer';

export const SingleColumnLayout: React.FC<{ resume: ResumeData; pageHeight?: number; [key: string]: any }> = ({ resume, pageHeight, ...rest }) => {
  const visibleSections = resume.sections
    .filter((s) => s.visible)
    .sort((a, b) => a.order - b.order);

  const gs = (resume as any).globalStyle;
  const sectionGap = (gs?.spacing?.sectionGap ?? 0) + 'px';

  return (
    <div
      className="single-column-layout"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: sectionGap,
        width: '100%',
        minHeight: 0,
      }}
      {...rest}
    >
      {visibleSections.map((section) => (
        <div
          key={section.id}
          className="resume-section-wrapper"
        >
          <DynamicSectionRenderer section={section} resume={resume} />
        </div>
      ))}
    </div>
  );
};