'use client';

import React from 'react';
import type { ResumeData } from '@/types/resume-builder.types';
import { DynamicSectionRenderer } from '@/sections/DynamicSectionRenderer';

const isSidebarSection = (s: { type: string; title: string }): boolean => {
  if (['skills', 'social', 'languages', 'certifications', 'header'].includes(s.type)) return true;
  if (s.type === 'custom') {
    const sidebarCustomTitles = ['certifications', 'interests', 'courses', 'awards'];
    return sidebarCustomTitles.includes(s.title.toLowerCase());
  }
  return false;
};

interface SidebarLayoutProps {
  resume: ResumeData;
  sidebarPosition?: 'left' | 'right';
  sidebarWidth?: string;
  mainWidth?: string;
  sidebarBg?: string;
  sidebarColor?: string;
  pageHeight?: number;
  [key: string]: any;
}

export const SidebarLayout: React.FC<SidebarLayoutProps> = ({
  resume,
  sidebarPosition = 'left',
  sidebarWidth = '1fr',
  mainWidth = '2fr',
  sidebarBg,
  sidebarColor,
  pageHeight,
  ...rest
}) => {
  const sections = resume.sections
    .filter((s) => s.visible)
    .sort((a, b) => a.order - b.order);

  const sideSections = sections.filter((s) => isSidebarSection(s));
  const mainSections = sections.filter((s) => !isSidebarSection(s));

  // Use global colors from resume if available
  const gs = (resume as any).globalStyle;
  const colors = gs?.colors || {};
  const design = (resume as any).__design || {};
  const bg = sidebarBg || colors.surface || '#f8fafc';
  const textColor = sidebarColor || colors.textMuted || '#4b5563';

  // Personal details settings
  const personalAlign = design?.personalAlign || 'left';
  const personalBarShow = design?.personalBarShow || false;
  const personalBulletShow = design?.personalBulletShow || false;
  const accentColor = design?.primaryColor || colors.primary || '#2563eb';

  // Separator bar style for sidebar header
  const separatorBarStyle: React.CSSProperties | null = personalBarShow ? {
    width: '40px',
    height: '3px',
    backgroundColor: accentColor,
    borderRadius: '2px',
    margin: personalAlign === 'center' ? '0 auto' : personalAlign === 'right' ? '0 0 0 auto' : undefined,
  } : null;

  const columnGap = (gs?.spacing?.sectionGap ?? 0) + 'px';

  const Sidebar = () => (
    <aside
      className="sidebar-column"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: columnGap,
        padding: '14px',
        color: textColor,
        background: bg,
        borderRadius: '4px',
        alignSelf: 'stretch',
        height: 'auto',
        minHeight: '100%',
      }}
    >
      {sideSections.length === 0 ? (
        <div style={{
          padding: '20px 12px',
          textAlign: 'center',
          fontSize: '11px',
          opacity: 0.6,
          border: '1px dashed rgba(0,0,0,0.1)',
          borderRadius: '6px',
          background: bg,
        }}>
          No sidebar sections added yet.<br />
          Add skills, languages, or certifications.
        </div>
      ) : (
        <>
          {/* Render header section with personal bar if enabled */}
          {sideSections.filter(s => s.type === 'header').map((section) => (
            <div
              key={section.id}
              className="resume-section-wrapper"
              style={{
                background: bg,
              }}
            >
              <DynamicSectionRenderer section={section} resume={resume} />
              {separatorBarStyle && <div style={separatorBarStyle} />}
            </div>
          ))}
          {/* Render other sidebar sections */}
          {sideSections.filter(s => s.type !== 'header').map((section) => (
            <div
              key={section.id}
              className="resume-section-wrapper"
              style={{
                background: bg,
              }}
            >
              <DynamicSectionRenderer section={section} resume={resume} />
            </div>
          ))}
        </>
      )}
    </aside>
  );

  const Main = () => (
    <main
      className="main-column"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: columnGap,
      }}
    >
      {mainSections.map((section) => (
        <div
          key={section.id}
          className="resume-section-wrapper"
        >
          <DynamicSectionRenderer section={section} resume={resume} />
        </div>
      ))}
    </main>
  );

  if (sideSections.length === 0) {
    return (
      <div
        className="sidebar-layout-root"
        style={{
          display: 'block',
          width: '100%',
        }}
        {...rest}
      >
        <Main />
      </div>
    );
  }

  return (
    <div
      className="sidebar-layout-root"
      style={{
        display: 'grid',
        gridTemplateColumns: sidebarPosition === 'left'
          ? `${sidebarWidth} ${mainWidth}`
          : `${mainWidth} ${sidebarWidth}`,
        gap: '16px',
        alignItems: 'stretch',
        width: '100%',
      }}
      {...rest}
    >
      {sidebarPosition === 'left' ? (
        <>
          <Sidebar />
          <Main />
        </>
      ) : (
        <>
          <Main />
          <Sidebar />
        </>
      )}
    </div>
  );
};

export default SidebarLayout;