'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { ResumeData } from './types';

interface PageContent {
  pageNumber: number;
  sections: string[];
  height: number;
  isFull: boolean;
}

interface SmartPageManagerProps {
  data: ResumeData;
  children: (pageData: PageContent[]) => React.ReactNode;
  onPagesChange?: (pages: number) => void;
  onSectionMove?: (sectionId: string, fromPage: number, toPage: number) => void;
}

/**
 * Smart Page Manager
 * 
 * આ component automatically:
 * - Sections ને measure કરે છે
 * - Pages create કરે છે જ્યારે content ભરાય જાય
 * - Drag & drop support આપે છે
 * - Word જેવું behavior આપે છે
 */
const SmartPageManager: React.FC<SmartPageManagerProps> = ({
  data,
  children,
  onPagesChange,
  onSectionMove,
}) => {
  const [pages, setPages] = useState<PageContent[]>([]);
  const [sectionHeights, setSectionHeights] = useState<Map<string, number>>(new Map());
  const measureRef = useRef<HTMLDivElement>(null);

  const design = data.design || {};
  
  // Page configuration (manually adjustable)
  const PAGE_HEIGHT_MM = 297; // A4 height
  const PAGE_WIDTH_MM = 210;  // A4 width
  const PADDING_TOP_MM = design.marginTB ?? 15;
  const PADDING_BOTTOM_MM = design.marginTB ?? 15;
  const PADDING_LEFT_MM = design.marginLR ?? 15;
  const PADDING_RIGHT_MM = design.marginLR ?? 15;
  
  // Available content area
  const CONTENT_HEIGHT_MM = PAGE_HEIGHT_MM - PADDING_TOP_MM - PADDING_BOTTOM_MM;
  const CONTENT_HEIGHT_PX = CONTENT_HEIGHT_MM * 3.7795275591; // mm to px
  
  const SECTION_SPACING_MM = design.sectionSpacing ?? 6;
  const SECTION_SPACING_PX = SECTION_SPACING_MM * 3.7795275591;

  // Measure all sections
  const measureSections = useCallback(() => {
    if (!measureRef.current) return;

    const newHeights = new Map<string, number>();
    const sections = Array.from(measureRef.current.children) as HTMLElement[];
    
    sections.forEach((section, index) => {
      const sectionId = data.activeSections?.[index];
      if (sectionId) {
        const height = section.offsetHeight;
        newHeights.set(sectionId, height);
      }
    });

    setSectionHeights(newHeights);
  }, [data.activeSections]);

  // Distribute sections across pages
  const distributePages = useCallback(() => {
    if (sectionHeights.size === 0) return;

    const newPages: PageContent[] = [];
    let currentPage: PageContent = {
      pageNumber: 1,
      sections: [],
      height: 0,
      isFull: false,
    };

    (data.activeSections || []).forEach((sectionId, index) => {
      const sectionHeight = sectionHeights.get(sectionId) || 0;
      const spacing = currentPage.sections.length > 0 ? SECTION_SPACING_PX : 0;
      const totalHeight = sectionHeight + spacing;

      // Check if section fits on current page
      if (currentPage.height + totalHeight <= CONTENT_HEIGHT_PX) {
        // Fits on current page
        currentPage.sections.push(sectionId);
        currentPage.height += totalHeight;
      } else {
        // Doesn't fit - create new page
        currentPage.isFull = true;
        newPages.push(currentPage);

        currentPage = {
          pageNumber: newPages.length + 1,
          sections: [sectionId],
          height: sectionHeight,
          isFull: false,
        };
      }
    });

    // Add last page
    if (currentPage.sections.length > 0) {
      newPages.push(currentPage);
    }

    setPages(newPages);
    
    if (onPagesChange) {
      onPagesChange(newPages.length);
    }

    console.log('📄 Pages distributed:', newPages.length);
    console.log('📊 Page breakdown:', newPages.map(p => ({
      page: p.pageNumber,
      sections: p.sections.length,
      height: Math.round(p.height),
      capacity: Math.round(CONTENT_HEIGHT_PX),
    })));
  }, [sectionHeights, data.activeSections, CONTENT_HEIGHT_PX, SECTION_SPACING_PX, onPagesChange]);

  // Measure on mount and content changes
  useEffect(() => {
    const timer = setTimeout(() => {
      measureSections();
    }, 300);

    return () => clearTimeout(timer);
  }, [data, measureSections]);

  // Distribute when heights change
  useEffect(() => {
    if (sectionHeights.size > 0) {
      distributePages();
    }
  }, [sectionHeights, distributePages]);

  // Observe content changes
  useEffect(() => {
    if (!measureRef.current) return;

    const observer = new MutationObserver(() => {
      setTimeout(measureSections, 200);
    });

    observer.observe(measureRef.current, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
    });

    return () => observer.disconnect();
  }, [measureSections]);

  return (
    <>
      {/* Hidden measurement container */}
      <div
        ref={measureRef}
        style={{
          position: 'absolute',
          left: '-9999px',
          top: '0',
          width: `${PAGE_WIDTH_MM - PADDING_LEFT_MM - PADDING_RIGHT_MM}mm`,
          visibility: 'hidden',
          pointerEvents: 'none',
        }}
      >
        {children([])}
      </div>

      {/* Actual rendered pages */}
      {pages.length > 0 && children(pages)}
    </>
  );
};

export default SmartPageManager;
