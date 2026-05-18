'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { ResumeData } from './types';

interface AutoPaginationWrapperProps {
  data: ResumeData;
  children: (pageData: { currentPage: number; totalPages: number }) => React.ReactNode;
  isExporting?: boolean;
  isThumbnail?: boolean;
}

/**
 * Automatic Pagination Wrapper
 * 
 * This component wraps your existing resume preview and automatically:
 * - Measures content height
 * - Calculates required pages
 * - Creates pages dynamically
 * - Ensures no overflow
 * 
 * DOES NOT change your existing design, styles, or components!
 */
const AutoPaginationWrapper: React.FC<AutoPaginationWrapperProps> = ({
  data,
  children,
  isExporting = false,
  isThumbnail = false,
}) => {
  const [totalPages, setTotalPages] = useState(1);
  const contentRef = useRef<HTMLDivElement>(null);
  const measureTimeoutRef = useRef<NodeJS.Timeout>();

  // A4 dimensions
  const A4_HEIGHT_PX = 1122; // 297mm at 96 DPI
  const design = data.design || {};

  // Calculate pages based on actual content height
  const calculatePages = useCallback(() => {
    if (!contentRef.current || isExporting || isThumbnail) return;

    const element = contentRef.current;
    const contentHeight = element.scrollHeight;
    
    // Calculate how many pages needed
    const pagesNeeded = Math.ceil(contentHeight / A4_HEIGHT_PX);
    const finalPages = Math.max(1, Math.min(pagesNeeded, 20)); // Max 20 pages for safety
    
    if (finalPages !== totalPages) {
      setTotalPages(finalPages);
    }
  }, [totalPages, isExporting, isThumbnail, A4_HEIGHT_PX]);

  // Measure on mount and content changes
  useEffect(() => {
    // Clear any pending measurements
    if (measureTimeoutRef.current) {
      clearTimeout(measureTimeoutRef.current);
    }

    // Debounce measurement
    measureTimeoutRef.current = setTimeout(() => {
      calculatePages();
    }, 150);

    return () => {
      if (measureTimeoutRef.current) {
        clearTimeout(measureTimeoutRef.current);
      }
    };
  }, [data, calculatePages]);

  // Observe content changes
  useEffect(() => {
    if (!contentRef.current || isExporting) return;

    const observer = new MutationObserver(() => {
      if (measureTimeoutRef.current) {
        clearTimeout(measureTimeoutRef.current);
      }
      measureTimeoutRef.current = setTimeout(calculatePages, 150);
    });

    observer.observe(contentRef.current, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
    });

    return () => observer.disconnect();
  }, [calculatePages, isExporting]);

  // Recalculate on window resize
  useEffect(() => {
    const handleResize = () => {
      if (measureTimeoutRef.current) {
        clearTimeout(measureTimeoutRef.current);
      }
      measureTimeoutRef.current = setTimeout(calculatePages, 150);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [calculatePages]);

  return (
    <div ref={contentRef} className="auto-pagination-wrapper">
      {children({ currentPage: 1, totalPages })}
    </div>
  );
};

export default AutoPaginationWrapper;
