'use client';

import React from 'react';
import type { ResumeData } from '@/types/resume-builder.types';
import { DynamicSectionRenderer } from '@/sections/DynamicSectionRenderer';

interface DoubleColumnLayoutProps {
  resume: ResumeData;
  /** Column width ratio. Default '1.25fr 1fr' */
  columns?: string;
  /** Whether to alternate sections or split evenly */
  mode?: 'alternate' | 'split';
  pageHeight?: number;
  [key: string]: any;
}

/**
 * DoubleColumnLayout renders resume sections in a two-column grid.
 * - 'alternate' mode: even-indexed sections in left column, odd in right
 * - 'split' mode: first half of sections in left, second half in right
 */
export const DoubleColumnLayout: React.FC<DoubleColumnLayoutProps> = ({
  resume,
  columns = '1.25fr 1fr',
  mode = 'alternate',
  pageHeight,
  ...rest
}) => {
  const sections = resume.sections
    .filter((s) => s.visible)
    .sort((a, b) => a.order - b.order);

  const gs = (resume as any).globalStyle;
  const sectionGap = (gs?.spacing?.sectionGap ?? 0) + 'px';
  const columnGap = (gs?.spacing?.blockGap || 8) + 'px';

  let left: typeof sections;
  let right: typeof sections;

  if (mode === 'split') {
    const mid = Math.ceil(sections.length / 2);
    left = sections.slice(0, mid);
    right = sections.slice(mid);
  } else {
    // Alternate mode (default)
    left = sections.filter((_, index) => index % 2 === 0);
    right = sections.filter((_, index) => index % 2 !== 0);
  }

  return (
    <div
      className="double-column-layout"
      style={{
        display: 'grid',
        gridTemplateColumns: columns,
        gap: columnGap,
        alignItems: 'start',
        width: '100%',
        minHeight: 0,
      }}
      {...rest}
    >
      <div
        className="left-column"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: sectionGap,
        }}
      >
        {left.length === 0 ? (
          <div style={{ padding: '12px', fontSize: '11px', opacity: 0.5, textAlign: 'center' }}>
            No sections
          </div>
        ) : (
          left.map((section) => (
            <div
              key={section.id}
              className="resume-section-wrapper"
            >
              <DynamicSectionRenderer section={section} resume={resume} />
            </div>
          ))
        )}
      </div>

      <div
        className="right-column"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: sectionGap,
        }}
      >
        {right.length === 0 ? (
          <div style={{ padding: '12px', fontSize: '11px', opacity: 0.5, textAlign: 'center' }}>
            No sections
          </div>
        ) : (
          right.map((section) => (
            <div
              key={section.id}
              className="resume-section-wrapper"
            >
              <DynamicSectionRenderer section={section} resume={resume} />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DoubleColumnLayout;