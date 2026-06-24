'use client';

import React from 'react';
import type { LayoutId, ResumeData } from '@/types/resume-builder.types';
import { SingleColumnLayout } from '@/layouts/SingleColumnLayout';
import { DoubleColumnLayout } from '@/layouts/DoubleColumnLayout';
import { SidebarLayout } from '@/layouts/SidebarLayout';
import { ModernLayout } from '@/layouts/ModernLayout';
import { CreativeLayout } from '@/layouts/CreativeLayout';
import { ATSLayout } from '@/layouts/ATSLayout';
import { CompactLayout } from '@/layouts/CompactLayout';

/**
 * Layout component type — all layouts receive resume data plus optional
 * sidebar positioning props (used by DynamicResumePreview).
 */
export type LayoutComponent = React.FC<{
  resume: ResumeData;
  sidebarPosition?: 'left' | 'right';
  sidebarWidth?: string;
  pageHeight?: number;
  [key: string]: any;
}>;

/**
 * withPageHeight — Higher-order component that wraps any layout
 * and applies consistent pageHeight handling:
 * - Sets min-height to pageHeight so the page is always A4-sized
 * - Prevents content overflow with overflow: hidden
 * - Ensures consistent A4 dimensions across all layouts
 */
function withPageHeight(LayoutComponent: React.FC<any>): LayoutComponent {
  const WrappedLayout: React.FC<any> = (props) => {
    const { pageHeight, ...rest } = props;

    return (
      <div
        className="layout-page-wrapper"
        style={{
          width: '100%',
          minHeight: pageHeight ? `${pageHeight}px` : undefined,
          height: pageHeight ? `${pageHeight}px` : undefined,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <LayoutComponent {...rest} pageHeight={pageHeight} />
      </div>
    );
  };

  WrappedLayout.displayName = `withPageHeight(${LayoutComponent.displayName || LayoutComponent.name || 'Layout'})`;
  return WrappedLayout as LayoutComponent;
}

/**
 * Layout map — all layouts wrapped with withPageHeight HOC
 * to ensure consistent pageHeight handling across all layout types.
 * When content exceeds pageHeight, the pagination system in ResumePreview.tsx
 * splits content at block level, moving only overflowing lines to the next page.
 */
export const layoutMap: Record<LayoutId, LayoutComponent> = {
  single: withPageHeight(SingleColumnLayout),
  double: withPageHeight(DoubleColumnLayout),
  sidebar: withPageHeight(SidebarLayout),
  modern: withPageHeight(ModernLayout),
  creative: withPageHeight(CreativeLayout),
  ats: withPageHeight(ATSLayout),
  compact: withPageHeight(CompactLayout),
};