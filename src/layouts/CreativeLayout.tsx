'use client';

import React from 'react';
import type { ResumeData } from '@/types/resume-builder.types';
import { DynamicSectionRenderer } from '@/sections/DynamicSectionRenderer';

/**
 * CreativeLayout: Visually distinct layout with colorful header and
 * decorative elements. Accepts extra props for DynamicResumePreview compatibility.
 */
export const CreativeLayout: React.FC<{ resume: ResumeData; pageHeight?: number; [key: string]: any }> = ({ resume, pageHeight, ...rest }) => {
  const sections = resume.sections
    .filter((s) => s.visible)
    .sort((a, b) => a.order - b.order);

  const headerSections = sections.filter((s) => s.type === 'header');
  const bodySections = sections.filter((s) => s.type !== 'header');

  const gs = (resume as any).globalStyle;
  const sectionGap = (gs?.spacing?.sectionGap ?? 0) + 'px';

  return (
    <div
      className="creative-layout"
      style={{
        fontFamily: 'inherit',
        width: '100%',
        minHeight: 0,
      }}
      {...rest}
    >
      {/* Creative header with accent background */}
      {headerSections.length > 0 && (
        <div
          className="creative-header"
          style={{
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#ffffff',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Decorative element */}
          <div
            style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)',
            }}
          />
          {headerSections.map((section) => (
            <DynamicSectionRenderer key={section.id} section={section} resume={resume} />
          ))}
        </div>
      )}

      {/* Body sections — single column with creative spacing */}
      <div
        className="creative-body"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: sectionGap,
        }}
      >
        {bodySections.map((section) => (
          <div
            key={section.id}
            className="resume-section-wrapper"
          >
            <DynamicSectionRenderer section={section} resume={resume} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CreativeLayout;