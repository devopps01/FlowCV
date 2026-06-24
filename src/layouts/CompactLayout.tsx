'use client';

import React from 'react';
import type { ResumeData } from '@/types/resume-builder.types';
import { DynamicSectionRenderer } from '@/sections/DynamicSectionRenderer';

/**
 * CompactLayout: Dense, space-efficient single-column layout.
 * Good for fitting more content per page.
 */
export const CompactLayout: React.FC<{ resume: ResumeData; pageHeight?: number; [key: string]: any }> = ({ resume, pageHeight, ...rest }) => {
  const sections = resume.sections
    .filter((s) => s.visible)
    .sort((a, b) => a.order - b.order);

  const gs = (resume as any).globalStyle;
  const sectionGap = (gs?.spacing?.sectionGap ?? 0) + 'px';

  return (
    <div
      className="compact-layout"
      style={{
        fontSize: '10px',
        lineHeight: 1.3,
        width: '100%',
        minHeight: 0,
      }}
      {...rest}
    >
      {sections.map((section) => (
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

export default CompactLayout;