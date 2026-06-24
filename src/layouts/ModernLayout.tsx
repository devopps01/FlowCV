'use client';

import React from 'react';
import type { ResumeData } from '@/types/resume-builder.types';
import { DynamicSectionRenderer } from '@/sections/DynamicSectionRenderer';

/**
 * ModernLayout: Header at top with name/contact, then rest in single column.
 * Accepts extra props (sidebarPosition, sidebarWidth, pageHeight) for compatibility.
 */
export const ModernLayout: React.FC<{ resume: ResumeData; pageHeight?: number; [key: string]: any }> = ({ resume, pageHeight, ...rest }) => {
  const sections = resume.sections
    .filter((s) => s.visible)
    .sort((a, b) => a.order - b.order);

  const headerSections = sections.filter((s) => s.type === 'header');
  const bodySections = sections.filter((s) => s.type !== 'header');

  const gs = (resume as any).globalStyle;
  const sectionGap = (gs?.spacing?.sectionGap ?? 0) + 'px';

  return (
    <div
      className="modern-layout"
      style={{
        width: '100%',
        minHeight: 0,
      }}
      {...rest}
    >
      {/* Compact header area — image left, content right */}
      {headerSections.length > 0 && (() => {
        const headerSection = headerSections[0];
        const blocks = headerSection?.blocks || [];
        const imageBlocks = blocks.filter((b: any) => b.type === 'image');
        const textBlocks = blocks.filter((b: any) => b.type !== 'image');
        return (
          <div
            className="modern-header-area"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '12px 16px',
              borderRadius: '6px',
              background: 'var(--modern-header-bg, linear-gradient(135deg, #1e3a5f, #2d5a87))',
              color: '#ffffff',
            }}
          >
            {/* Image on left */}
            {imageBlocks.length > 0 && (
              <div style={{ flexShrink: 0 }}>
                {imageBlocks.map((block: any) => (
                  <DynamicSectionRenderer key={headerSection.id} section={{ ...headerSection, blocks: [block] }} resume={resume} />
                ))}
              </div>
            )}
            {/* Text content on right */}
            <div style={{ flex: 1, textAlign: 'left' }}>
              {textBlocks.map((block: any) => (
                <DynamicSectionRenderer key={headerSection.id + block.id} section={{ ...headerSection, blocks: [block] }} resume={resume} />
              ))}
            </div>
          </div>
        );
      })()}

      {/* Body sections in single column */}
      <div
        className="modern-body"
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

export default ModernLayout;