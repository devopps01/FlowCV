/**
 * Resume Page Configuration
 * 
 * આ file માં તમે manually page dimensions અને spacing control કરી શકો છો
 */

export interface PageConfig {
  // Page dimensions (in mm)
  pageHeight: number;
  pageWidth: number;
  
  // Padding (in mm) - બધી sides માટે
  paddingTop: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
  
  // Spacing (in mm)
  sectionSpacing: number;  // Sections વચ્ચેનું gap
  entrySpacing: number;    // Entries વચ્ચેનું gap
  
  // Typography
  baseFontSize: number;    // Base font size (in px)
  lineHeight: number;      // Line height multiplier
  
  // Content limits
  maxPages: number;        // Maximum pages allowed
  minContentPerPage: number; // Minimum content height per page (%)
}

// Default A4 configuration
export const DEFAULT_PAGE_CONFIG: PageConfig = {
  pageHeight: 297,      // A4 height
  pageWidth: 210,       // A4 width
  paddingTop: 15,
  paddingBottom: 15,
  paddingLeft: 15,
  paddingRight: 15,
  sectionSpacing: 6,
  entrySpacing: 4,
  baseFontSize: 10.5,
  lineHeight: 1.45,
  maxPages: 20,
  minContentPerPage: 20, // At least 20% content per page
};

// US Letter configuration
export const US_LETTER_CONFIG: PageConfig = {
  pageHeight: 279,      // US Letter height (11 inches)
  pageWidth: 216,       // US Letter width (8.5 inches)
  paddingTop: 15,
  paddingBottom: 15,
  paddingLeft: 15,
  paddingRight: 15,
  sectionSpacing: 6,
  entrySpacing: 4,
  baseFontSize: 10.5,
  lineHeight: 1.45,
  maxPages: 20,
  minContentPerPage: 20,
};

// Compact configuration (more content per page)
export const COMPACT_CONFIG: PageConfig = {
  pageHeight: 297,
  pageWidth: 210,
  paddingTop: 10,       // Less padding
  paddingBottom: 10,
  paddingLeft: 10,
  paddingRight: 10,
  sectionSpacing: 4,    // Less spacing
  entrySpacing: 3,
  baseFontSize: 9.5,    // Smaller font
  lineHeight: 1.35,     // Tighter line height
  maxPages: 20,
  minContentPerPage: 20,
};

// Spacious configuration (less content per page)
export const SPACIOUS_CONFIG: PageConfig = {
  pageHeight: 297,
  pageWidth: 210,
  paddingTop: 20,       // More padding
  paddingBottom: 20,
  paddingLeft: 20,
  paddingRight: 20,
  sectionSpacing: 8,    // More spacing
  entrySpacing: 6,
  baseFontSize: 11,     // Larger font
  lineHeight: 1.55,     // More line height
  maxPages: 20,
  minContentPerPage: 20,
};

/**
 * Calculate available content area
 */
export function getContentArea(config: PageConfig) {
  const contentHeight = config.pageHeight - config.paddingTop - config.paddingBottom;
  const contentWidth = config.pageWidth - config.paddingLeft - config.paddingRight;
  
  return {
    height: contentHeight,
    width: contentWidth,
    heightPx: contentHeight * 3.7795275591, // mm to px at 96 DPI
    widthPx: contentWidth * 3.7795275591,
  };
}

/**
 * Calculate how many sections fit on a page
 */
export function calculateSectionsPerPage(
  sectionHeights: number[],
  config: PageConfig
): number[][] {
  const contentArea = getContentArea(config);
  const pages: number[][] = [];
  let currentPage: number[] = [];
  let currentHeight = 0;
  
  sectionHeights.forEach((height, index) => {
    const spacing = currentPage.length > 0 ? config.sectionSpacing * 3.7795275591 : 0;
    const totalHeight = height + spacing;
    
    if (currentHeight + totalHeight <= contentArea.heightPx) {
      // Fits on current page
      currentPage.push(index);
      currentHeight += totalHeight;
    } else {
      // Move to new page
      if (currentPage.length > 0) {
        pages.push(currentPage);
      }
      currentPage = [index];
      currentHeight = height;
    }
  });
  
  // Add last page
  if (currentPage.length > 0) {
    pages.push(currentPage);
  }
  
  return pages;
}

/**
 * Get configuration from design settings
 */
export function getConfigFromDesign(design: any): PageConfig {
  return {
    pageHeight: design.pageHeight ?? DEFAULT_PAGE_CONFIG.pageHeight,
    pageWidth: design.pageWidth ?? DEFAULT_PAGE_CONFIG.pageWidth,
    paddingTop: design.marginTB ?? DEFAULT_PAGE_CONFIG.paddingTop,
    paddingBottom: design.marginTB ?? DEFAULT_PAGE_CONFIG.paddingBottom,
    paddingLeft: design.marginLR ?? DEFAULT_PAGE_CONFIG.paddingLeft,
    paddingRight: design.marginLR ?? DEFAULT_PAGE_CONFIG.paddingRight,
    sectionSpacing: design.sectionSpacing ?? DEFAULT_PAGE_CONFIG.sectionSpacing,
    entrySpacing: design.entrySpacing ?? DEFAULT_PAGE_CONFIG.entrySpacing,
    baseFontSize: design.fontSize ?? DEFAULT_PAGE_CONFIG.baseFontSize,
    lineHeight: design.lineHeight ?? DEFAULT_PAGE_CONFIG.lineHeight,
    maxPages: DEFAULT_PAGE_CONFIG.maxPages,
    minContentPerPage: DEFAULT_PAGE_CONFIG.minContentPerPage,
  };
}

/**
 * Validate if content fits within page limits
 */
export function validatePageContent(
  contentHeight: number,
  config: PageConfig
): {
  isValid: boolean;
  pagesNeeded: number;
  exceedsMax: boolean;
} {
  const contentArea = getContentArea(config);
  const pagesNeeded = Math.ceil(contentHeight / contentArea.heightPx);
  
  return {
    isValid: pagesNeeded <= config.maxPages,
    pagesNeeded,
    exceedsMax: pagesNeeded > config.maxPages,
  };
}
