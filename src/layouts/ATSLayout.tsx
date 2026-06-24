'use client';

import React from 'react';
import type { ResumeData } from '@/types/resume-builder.types';
import { DynamicSectionRenderer } from '@/sections/DynamicSectionRenderer';

/**
 * ATSLayout: Clean, minimal single-column layout optimized for
 * Applicant Tracking Systems. No multi-column, no fancy styling.
 */
export const ATSLayout: React.FC<{ resume: ResumeData; pageHeight?: number; [key: string]: any }> = ({ resume, pageHeight, ...rest }) => {
  const sections = resume.sections
    .filter((s) => s.visible)
    .sort((a, b) => a.order - b.order);

  const gs = (resume as any).globalStyle;
  const sectionGap = (gs?.spacing?.sectionGap ?? 0) + 'px';

  return (
    <div
      className="ats-layout"
      style={{
        fontFamily: "'Arial', 'Helvetica', sans-serif",
        fontSize: '11pt',
        lineHeight: 1.4,
        color: '#000000',
        width: '100%',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: sectionGap,
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

export default ATSLayout;