'use client';

import React from 'react';
import { ResumeData } from './types';
import SmartPaginationEngine from './SmartPaginationEngine';

interface ResumePreviewPaginatedProps {
  data: ResumeData;
  previewRef?: React.RefObject<HTMLDivElement>;
  zoomLevel?: number;
  onReorderSections?: (newOrder: string[]) => void;
  isThumbnail?: boolean;
  isExporting?: boolean;
  selectedSectionId?: string | null;
  onSelectSection?: (sid: string) => void;
}

/**
 * Paginated Resume Preview
 * 
 * This component wraps your existing resume sections with intelligent pagination.
 * It measures each section and distributes them across pages properly.
 * 
 * DOES NOT change your existing section components or styles!
 */
const ResumePreviewPaginated: React.FC<ResumePreviewPaginatedProps> = ({
  data,
  previewRef,
  zoomLevel = 100,
  isExporting = false,
  isThumbnail = false,
  selectedSectionId = null,
  onSelectSection,
}) => {
  const design = data.design || {};

  // Import your existing section rendering logic here
  // For now, this is a placeholder - you'll need to import your actual DynamicSectionRenderer
  const renderSection = (sectionId: string) => {
    // This should call your existing DynamicSectionRenderer
    // Example:
    // return <DynamicSectionRenderer sid={sectionId} data={data} ... />
    
    // Placeholder for demonstration:
    return (
      <div className="resume-section-content">
        <h2 style={{
          fontSize: '12px',
          fontWeight: '700',
          textTransform: 'uppercase',
          marginBottom: '8px',
          color: design.primaryColor || '#ff4d7d',
        }}>
          {sectionId}
        </h2>
        <div style={{ fontSize: '10px', lineHeight: '1.5' }}>
          {/* Your actual section content goes here */}
          Section content for {sectionId}
        </div>
      </div>
    );
  };

  return (
    <div
      ref={previewRef}
      className="resume-preview-paginated"
      style={{
        transform: `scale(${zoomLevel / 100})`,
        transformOrigin: 'top center',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: isThumbnail ? '0' : '32px 0',
        backgroundColor: isThumbnail ? 'transparent' : '#f1f5f9',
        fontFamily: design.fontFamily || 'Inter',
        fontSize: `${design.fontSize || 10.5}px`,
        lineHeight: design.lineHeight || 1.45,
        color: design.textColor || '#1f2937',
      }}
    >
      <SmartPaginationEngine
        data={data}
        renderSection={renderSection}
        isExporting={isExporting}
        isThumbnail={isThumbnail}
      />
    </div>
  );
};

export default ResumePreviewPaginated;
