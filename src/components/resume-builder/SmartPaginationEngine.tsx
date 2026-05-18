'use client';

import React, { useEffect, useState, useRef } from 'react';
import { ResumeData } from './types';

interface SectionMeasurement {
  sectionId: string;
  height: number;
  element: HTMLElement;
}

interface PageLayout {
  pageNumber: number;
  sections: string[];
  usedHeight: number;
  remainingHeight: number;
}

interface SmartPaginationEngineProps {
  data: ResumeData;
  renderSection: (sectionId: string) => React.ReactNode;
  onPagesCalculated?: (pages: number) => void;
  isExporting?: boolean;
  isThumbnail?: boolean;
}

/**
 * Smart Pagination Engine
 * 
 * This engine:
 * 1. Renders all sections invisibly to measure their actual heights
 * 2. Calculates which sections fit on each page
 * 3. Distributes sections intelligently across pages
 * 4. Ensures equal padding and proper spacing
 * 5. Moves entire sections (never splits them)
 * 6. Balances content professionally
 */
const SmartPaginationEngine: React.FC<SmartPaginationEngineProps> = ({
  data,
  renderSection,
  onPagesCalculated,
  isExporting = false,
  isThumbnail = false,
}) => {
  const [pageLayouts, setPageLayouts] = useState<PageLayout[]>([]);
  const [isCalculating, setIsCalculating] = useState(true);
  const measureContainerRef = useRef<HTMLDivElement>(null);

  const design = data.design || {};
  
  // A4 dimensions at 96 DPI
  const MM_TO_PX = 3.7795275591;
  const A4_HEIGHT_MM = 297;
  const A4_WIDTH_MM = 210;
  
  // Padding (equal on all sides)
  const PADDING_TOP_MM = Math.min(20, Math.max(8, design.marginTB ?? 15));
  const PADDING_BOTTOM_MM = PADDING_TOP_MM;
  const PADDING_LEFT_MM = Math.min(20, Math.max(8, design.marginLR ?? 15));
  const PADDING_RIGHT_MM = PADDING_LEFT_MM;
  
  // Available content height per page
  const CONTENT_HEIGHT_MM = A4_HEIGHT_MM - PADDING_TOP_MM - PADDING_BOTTOM_MM;
  const CONTENT_HEIGHT_PX = CONTENT_HEIGHT_MM * MM_TO_PX;
  
  // Section spacing
  const SECTION_SPACING_MM = Math.min(8, Math.max(4, design.sectionSpacing ?? 6));
  const SECTION_SPACING_PX = SECTION_SPACING_MM * MM_TO_PX;

  // Calculate page distribution
  useEffect(() => {
    const calculateDistribution = async () => {
      if (!measureContainerRef.current) return;

      setIsCalculating(true);

      // Wait for render
      await new Promise(resolve => setTimeout(resolve, 100));

      const container = measureContainerRef.current;
      const sectionElements = Array.from(container.children) as HTMLElement[];
      
      // Measure each section
      const measurements: SectionMeasurement[] = [];
      const activeSections = data.activeSections || [];
      
      sectionElements.forEach((element, index) => {
        if (index < activeSections.length) {
          const height = element.offsetHeight;
          measurements.push({
            sectionId: activeSections[index],
            height,
            element,
          });
        }
      });

      // Distribute sections across pages
      const pages: PageLayout[] = [];
      let currentPage: PageLayout = {
        pageNumber: 1,
        sections: [],
        usedHeight: 0,
        remainingHeight: CONTENT_HEIGHT_PX,
      };

      measurements.forEach((measurement, index) => {
        const sectionHeight = measurement.height;
        const spacingHeight = index > 0 ? SECTION_SPACING_PX : 0;
        const totalHeight = sectionHeight + spacingHeight;

        // Check if section fits on current page
        if (totalHeight <= currentPage.remainingHeight) {
          // Fits on current page
          currentPage.sections.push(measurement.sectionId);
          currentPage.usedHeight += totalHeight;
          currentPage.remainingHeight -= totalHeight;
        } else {
          // Doesn't fit - save current page and create new one
          if (currentPage.sections.length > 0) {
            pages.push(currentPage);
          }

          // Create new page with this section
          currentPage = {
            pageNumber: pages.length + 1,
            sections: [measurement.sectionId],
            usedHeight: sectionHeight,
            remainingHeight: CONTENT_HEIGHT_PX - sectionHeight,
          };
        }
      });

      // Add last page
      if (currentPage.sections.length > 0) {
        pages.push(currentPage);
      }

      // Ensure at least one page
      if (pages.length === 0) {
        pages.push({
          pageNumber: 1,
          sections: [],
          usedHeight: 0,
          remainingHeight: CONTENT_HEIGHT_PX,
        });
      }

      setPageLayouts(pages);
      setIsCalculating(false);
      
      if (onPagesCalculated) {
        onPagesCalculated(pages.length);
      }
    };

    calculateDistribution();
  }, [data.activeSections, data.content, design, CONTENT_HEIGHT_PX, SECTION_SPACING_PX, onPagesCalculated]);

  const pageStyle: React.CSSProperties = {
    width: `${A4_WIDTH_MM}mm`,
    height: `${A4_HEIGHT_MM}mm`,
    backgroundColor: design.backgroundColor || '#ffffff',
    padding: `${PADDING_TOP_MM}mm ${PADDING_RIGHT_MM}mm ${PADDING_BOTTOM_MM}mm ${PADDING_LEFT_MM}mm`,
    boxSizing: 'border-box',
    position: 'relative',
    overflow: 'hidden',
    pageBreakAfter: 'always',
    pageBreakInside: 'avoid',
    boxShadow: isExporting || isThumbnail ? 'none' : '0 4px 24px rgba(0,0,0,0.10)',
    marginBottom: isExporting || isThumbnail ? '0' : '32px',
  };

  const sectionStyle: React.CSSProperties = {
    marginBottom: `${SECTION_SPACING_MM}mm`,
    breakInside: 'avoid',
    pageBreakInside: 'avoid',
  };

  return (
    <>
      {/* Hidden measurement container */}
      <div
        ref={measureContainerRef}
        style={{
          position: 'absolute',
          left: '-9999px',
          top: '0',
          width: `${A4_WIDTH_MM - PADDING_LEFT_MM - PADDING_RIGHT_MM}mm`,
          visibility: 'hidden',
          pointerEvents: 'none',
        }}
      >
        {(data.activeSections || []).map((sectionId) => (
          <div key={sectionId} style={{ marginBottom: `${SECTION_SPACING_MM}mm` }}>
            {renderSection(sectionId)}
          </div>
        ))}
      </div>

      {/* Actual paginated content */}
      {!isCalculating && (
        <div className="smart-pagination-container">
          <style jsx global>{`
            @media print {
              .smart-pagination-container .resume-page {
                page-break-after: always;
                page-break-inside: avoid;
                margin: 0;
                box-shadow: none !important;
              }
              
              .smart-pagination-container .resume-page:last-child {
                page-break-after: auto;
              }
              
              .page-separator {
                display: none !important;
              }
            }
          `}</style>

          {pageLayouts.map((page, pageIndex) => (
            <React.Fragment key={page.pageNumber}>
              <div
                className="resume-page"
                style={{
                  ...pageStyle,
                  pageBreakAfter: pageIndex === pageLayouts.length - 1 ? 'auto' : 'always',
                }}
              >
                {page.sections.map((sectionId, sectionIndex) => (
                  <div
                    key={sectionId}
                    className="resume-section"
                    style={{
                      ...sectionStyle,
                      marginBottom: sectionIndex === page.sections.length - 1 ? '0' : `${SECTION_SPACING_MM}mm`,
                    }}
                  >
                    {renderSection(sectionId)}
                  </div>
                ))}
              </div>

              {/* Page separator for preview */}
              {!isExporting && !isThumbnail && pageIndex < pageLayouts.length - 1 && (
                <div
                  className="page-separator"
                  style={{
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f1f5f9',
                    borderTop: '1px solid rgba(0,0,0,0.06)',
                    borderBottom: '1px solid rgba(0,0,0,0.06)',
                    marginBottom: '32px',
                  }}
                >
                  <div
                    style={{
                      background: 'rgba(255,255,255,0.95)',
                      border: '1px solid rgba(0,0,0,0.08)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      padding: '4px 12px',
                      borderRadius: '999px',
                      fontSize: '9px',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      color: '#64748b',
                    }}
                  >
                    Page {page.pageNumber} · Page {page.pageNumber + 1}
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}

          {/* Page counter */}
          {!isExporting && !isThumbnail && pageLayouts.length > 0 && (
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
              📄 {pageLayouts.length} {pageLayouts.length === 1 ? 'Page' : 'Pages'}
            </div>
          )}
        </div>
      )}

      {/* Loading state */}
      {isCalculating && (
        <div
          style={{
            width: `${A4_WIDTH_MM}mm`,
            height: `${A4_HEIGHT_MM}mm`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f8fafc',
            borderRadius: '4px',
          }}
        >
          <div style={{ textAlign: 'center', color: '#64748b' }}>
            <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
              Calculating layout...
            </div>
            <div style={{ fontSize: '12px', opacity: 0.7 }}>
              Measuring sections and distributing content
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SmartPaginationEngine;
