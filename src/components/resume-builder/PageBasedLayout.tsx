'use client';

import React, { useEffect, useState, useRef } from 'react';
import { ResumeData } from './types';

interface PageBasedLayoutProps {
  data: ResumeData;
  renderSection: (sectionId: string) => React.ReactNode;
  isExporting?: boolean;
  isThumbnail?: boolean;
}

interface PageData {
  pageNumber: number;
  sections: string[];
}

/**
 * Page-Based Layout System
 * 
 * દરેક page એક separate div છે
 * Content automatically pages માં distribute થાય છે
 * કોઈ content hide નથી થતું
 */
const PageBasedLayout: React.FC<PageBasedLayoutProps> = ({
  data,
  renderSection,
  isExporting = false,
  isThumbnail = false,
}) => {
  const [pages, setPages] = useState<PageData[]>([{ pageNumber: 1, sections: [] }]);
  const [sectionHeights, setSectionHeights] = useState<Record<string, number>>({});
  const measureRef = useRef<HTMLDivElement>(null);

  const design = data.design || {};
  
  // Page dimensions (mm)
  const PAGE_HEIGHT = 297;
  const PAGE_WIDTH = 210;
  const PADDING_TOP = design.marginTB ?? 15;
  const PADDING_BOTTOM = design.marginTB ?? 15;
  const PADDING_LEFT = design.marginLR ?? 15;
  const PADDING_RIGHT = design.marginLR ?? 15;
  
  // Available content area (mm)
  const CONTENT_HEIGHT = PAGE_HEIGHT - PADDING_TOP - PADDING_BOTTOM;
  const CONTENT_WIDTH = PAGE_WIDTH - PADDING_LEFT - PADDING_RIGHT;
  
  // Convert to pixels (1mm = 3.7795px at 96 DPI)
  const MM_TO_PX = 3.7795275591;
  const CONTENT_HEIGHT_PX = CONTENT_HEIGHT * MM_TO_PX;
  
  const SECTION_SPACING = (design.sectionSpacing ?? 6) * MM_TO_PX;

  // Step 1: Measure all sections
  useEffect(() => {
    if (!measureRef.current) return;

    const timer = setTimeout(() => {
      const container = measureRef.current;
      if (!container) return;

      const newHeights: Record<string, number> = {};
      const children = Array.from(container.children) as HTMLElement[];
      
      children.forEach((child, index) => {
        const sectionId = data.activeSections?.[index];
        if (sectionId) {
          newHeights[sectionId] = child.offsetHeight;
        }
      });

      setSectionHeights(newHeights);
      console.log('📏 Section heights measured:', newHeights);
    }, 300);

    return () => clearTimeout(timer);
  }, [data.activeSections, data.content]);

  // Step 2: Distribute sections across pages
  useEffect(() => {
    if (Object.keys(sectionHeights).length === 0) return;

    const newPages: PageData[] = [];
    let currentPage: PageData = { pageNumber: 1, sections: [] };
    let currentHeight = 0;

    (data.activeSections || []).forEach((sectionId) => {
      const sectionHeight = sectionHeights[sectionId] || 0;
      const spacing = currentPage.sections.length > 0 ? SECTION_SPACING : 0;
      const totalHeight = sectionHeight + spacing;

      // Check if section fits on current page
      if (currentHeight + totalHeight <= CONTENT_HEIGHT_PX) {
        // Fits - add to current page
        currentPage.sections.push(sectionId);
        currentHeight += totalHeight;
      } else {
        // Doesn't fit - save current page and create new one
        if (currentPage.sections.length > 0) {
          newPages.push(currentPage);
        }
        
        // Start new page
        currentPage = {
          pageNumber: newPages.length + 1,
          sections: [sectionId],
        };
        currentHeight = sectionHeight;
      }
    });

    // Add last page
    if (currentPage.sections.length > 0) {
      newPages.push(currentPage);
    }

    // Ensure at least one page
    if (newPages.length === 0) {
      newPages.push({ pageNumber: 1, sections: [] });
    }

    setPages(newPages);
    
    console.log('📄 Pages created:', newPages.length);
    newPages.forEach(page => {
      console.log(`   Page ${page.pageNumber}: ${page.sections.length} sections`);
    });
  }, [sectionHeights, data.activeSections, CONTENT_HEIGHT_PX, SECTION_SPACING]);

  const pageStyle: React.CSSProperties = {
    width: `${PAGE_WIDTH}mm`,
    height: `${PAGE_HEIGHT}mm`,
    minHeight: `${PAGE_HEIGHT}mm`,
    maxHeight: `${PAGE_HEIGHT}mm`,
    padding: `${PADDING_TOP}mm ${PADDING_RIGHT}mm ${PADDING_BOTTOM}mm ${PADDING_LEFT}mm`,
    backgroundColor: design.backgroundColor || '#ffffff',
    boxSizing: 'border-box',
    overflow: 'hidden', // Content બહાર ન જાય
    position: 'relative',
    pageBreakAfter: 'always',
    pageBreakInside: 'avoid',
    boxShadow: isExporting || isThumbnail ? 'none' : '0 4px 24px rgba(0,0,0,0.10)',
    marginBottom: isExporting || isThumbnail ? '0' : '32px',
  };

  const contentAreaStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    overflow: 'visible', // Content visible રહે
    display: 'flex',
    flexDirection: 'column',
    gap: `${design.sectionSpacing ?? 6}mm`,
  };

  return (
    <>
      {/* Hidden measurement container */}
      <div
        ref={measureRef}
        style={{
          position: 'absolute',
          left: '-9999px',
          top: '0',
          width: `${CONTENT_WIDTH}mm`,
          visibility: 'hidden',
          pointerEvents: 'none',
        }}
      >
        {(data.activeSections || []).map((sectionId) => (
          <div key={sectionId} style={{ marginBottom: `${design.sectionSpacing ?? 6}mm` }}>
            {renderSection(sectionId)}
          </div>
        ))}
      </div>

      {/* Actual pages */}
      <div className="page-based-layout">
        {pages.map((page, pageIndex) => (
          <React.Fragment key={page.pageNumber}>
            {/* Page div */}
            <div
              className="resume-page"
              style={{
                ...pageStyle,
                pageBreakAfter: pageIndex === pages.length - 1 ? 'auto' : 'always',
              }}
            >
              {/* Content area */}
              <div style={contentAreaStyle}>
                {page.sections.map((sectionId, sectionIndex) => (
                  <div
                    key={sectionId}
                    className="page-section"
                    style={{
                      breakInside: 'avoid',
                      pageBreakInside: 'avoid',
                    }}
                  >
                    {renderSection(sectionId)}
                  </div>
                ))}
              </div>
            </div>

            {/* Page separator (preview only) */}
            {!isExporting && !isThumbnail && pageIndex < pages.length - 1 && (
              <div
                style={{
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#f1f5f9',
                  marginBottom: '32px',
                }}
              >
                <div
                  style={{
                    background: 'white',
                    padding: '4px 12px',
                    borderRadius: '999px',
                    fontSize: '10px',
                    fontWeight: '700',
                    color: '#64748b',
                  }}
                >
                  Page {page.pageNumber} · Page {page.pageNumber + 1}
                </div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Page counter */}
      {!isExporting && !isThumbnail && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: '700',
            boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
            zIndex: 1000,
          }}
        >
          📄 {pages.length} {pages.length === 1 ? 'Page' : 'Pages'}
        </div>
      )}

      <style jsx global>{`
        @media print {
          .resume-page {
            page-break-after: always;
            page-break-inside: avoid;
            margin: 0;
            box-shadow: none !important;
          }
          
          .resume-page:last-child {
            page-break-after: auto;
          }
        }
      `}</style>
    </>
  );
};

export default PageBasedLayout;
