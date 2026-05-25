'use client';

import React, { useEffect, useState } from 'react';
import { User, Mail, Phone, MapPin, Globe, Linkedin, Award, BookOpen, Briefcase, GraduationCap, Languages, BadgeCheck, Heart, FolderGit2, FileText, Check, Plus, Users, Building, PenTool, Layers, GripVertical, ChevronUp, ChevronDown, Trash, X } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { ResumeData } from './types';
import { HEADING_STYLES } from './design-options';

interface ResumePreviewProps {
  data: ResumeData;
  numPages: number;
  previewRef?: React.RefObject<HTMLDivElement>;
  zoomLevel: number;
  onReorderSections?: (newOrder: string[]) => void;
  isThumbnail?: boolean;
  isExporting?: boolean;
  selectedSectionId?: string | null;
  onSelectSection?: (sid: string) => void;
  onPageCountChange?: (count: number) => void;
  updateNested?: (path: string, value: any) => void;
}

interface PageBlock {
  sid: string;
  itemIndices?: number[];
}

interface PageData {
  main: PageBlock[];
  sidebar?: PageBlock[];
}

/* --- Dynamic Font Loader --- */
const GoogleFontsLoader = ({ fontFamily }: { fontFamily: string }) => {
  useEffect(() => {
    if (!fontFamily || ['serif', 'sans-serif', 'monospace', 'system-ui'].includes(fontFamily)) return;

    const linkId = `font-${fontFamily.replace(/\s+/g, '-').toLowerCase()}`;
    if (!document.getElementById(linkId)) {
      const link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      const fontQuery = fontFamily.replace(/\s+/g, '+');
      link.href = `https://fonts.googleapis.com/css2?family=${fontQuery}:wght@400;500;600;700;900&display=swap`;
      document.head.appendChild(link);
    }

    // Force the browser to load the font into memory so it's ready for canvas
    document.fonts.load(`700 12px '${fontFamily}'`).catch(() => { });
    document.fonts.load(`400 12px '${fontFamily}'`).catch(() => { });
  }, [fontFamily]);

  return null;
};

const getLevelPercentage = (proficiency: string): number => {
  const p = proficiency.toLowerCase();
  if (p.includes('native') || p.includes('expert') || p.includes('fluent') || p.includes('5/5')) return 100;
  if (p.includes('advanced') || p.includes('4/5')) return 80;
  if (p.includes('intermediate') || p.includes('3/5')) return 60;
  if (p.includes('beginner') || p.includes('elementary') || p.includes('2/5')) return 40;
  if (p.includes('limited') || p.includes('1/5')) return 20;
  return 50; // default
};

const COLOR_SWATCHES = ['#1f2937', '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#ffffff'];

const ResumePreview: React.FC<ResumePreviewProps> = ({ data, numPages, previewRef, zoomLevel, onReorderSections, isThumbnail = false, isExporting = false, selectedSectionId = null, onSelectSection, onPageCountChange, updateNested }) => {
  const A4_HEIGHT_PX = 1122;

  // Fallback design if missing
  const design = data.design || {
    fontFamily: 'Inter',
    fontSize: 10.5,
    lineHeight: 1.45,
    marginLR: 20,
    marginTB: 20,
    textColor: '#000000',
    primaryColor: '#000000',
    backgroundColor: '#ffffff',
    layout: 'single',
    applyAccentTo: [],
    entrySpacing: 8,
    sectionSpacing: 10,
  };

  // Helper to get accent color ONLY if enabled for a specific target, otherwise use textColor
  const getAccentColor = (target: string, fallback: string = design.textColor || '#1f2937'): string => {
    const overridden = design.accentOverrides?.[target];
    if (overridden) return overridden;
    if (design.applyAccentTo?.includes(target)) return design.primaryColor || '#ff4d7d';
    return fallback;
  };

  const parseHeadingStyleId = (idRaw: string | undefined) => {
    const id = (idRaw || 'none').trim() || 'none';
    const base = id.split('_')[0];
    const params: Record<string, number> = {};
    const matches = id.match(/_(w|t|r|s|a|o|p)(\d+)/g) || [];
    for (const match of matches) {
      const parts = match.match(/_(w|t|r|s|a|o|p)(\d+)/);
      if (parts) {
        params[parts[1]] = Number(parts[2]);
      }
    }
    return { id, base, params };
  };

  const getHeadingMeta = (isSidebar: boolean) => {
    const parsed = parseHeadingStyleId(design.headingStyle);
    const lineColor = isSidebar
      ? (design.textColor || '#1f2937')
      : getAccentColor('headingsLine', design.primaryColor || '#ff4d7d');

    const thicknessPx = parsed.params.t ?? (design.headingLineThickness ?? 2);
    const widthPct = parsed.params.w ?? (design.headingLineWidth ?? 100);

    return {
      headingStyleId: parsed.id,
      headingStyleBase: parsed.base,
      params: parsed.params,
      lineColor,
      lineThick: `${thicknessPx}px`,
      lineWidth: `${widthPct}%`,
    };
  };

  const getSectionStyle = (isSidebar = false): React.CSSProperties => {
    const headingColor = isSidebar
      ? (design.textColor || '#1f2937')
      : getAccentColor('headings', design.primaryColor || '#ff4d7d');

    const base: React.CSSProperties = {
      color: headingColor,
      textAlign: 'left' as const,
      textTransform: design.headingCapitalization === 'none' ? 'none' : (design.headingCapitalization || 'uppercase') as any,
      marginBottom: `${Math.min(8, Math.max(2, (design.entrySpacing ?? 8) / 3))}mm`,
      fontWeight: '700',
      // Heading sizes: s=11px, m=12px, l=13px, xl=14px — never exceeds 14px
      fontSize: design.headingSize === 's' ? '11px' : design.headingSize === 'm' ? '12px' : design.headingSize === 'l' ? '13px' : design.headingSize === 'xl' ? '14px' : '12px',
      letterSpacing: '0.05em',
      display: 'inline-block',
      width: 'auto',
      lineHeight: '1.2',
    };

    if (isSidebar) return base;

    const meta = getHeadingMeta(false);
    const knownBase = HEADING_STYLES.some(s => s.id === meta.headingStyleBase) ? meta.headingStyleBase : meta.headingStyleBase;
    const radiusPx = meta.params.r;
    const align = meta.params.a; // 0 left, 1 center, 2 right
    const opacityStep = meta.params.o; // 1..10
    const padStep = meta.params.p; // 0..8
    const lineThick = meta.lineThick;
    const lineWidth = meta.lineWidth;
    const lineColor = meta.lineColor;

    const alignStyle: React.CSSProperties =
      align === 1
        ? { marginLeft: 'auto', marginRight: 'auto', textAlign: 'center' as const }
        : align === 2
          ? { marginLeft: 'auto', marginRight: 0, textAlign: 'right' as const }
          : { marginLeft: 0, marginRight: 'auto', textAlign: 'left' as const };

    switch (knownBase) {
      // ── Linear styles ──────────────────────────────────────────────────────
      case 'underline':
        return { ...base, ...alignStyle, display: 'block', borderBottom: `${lineThick} solid ${lineColor}`, paddingBottom: '3px', width: lineWidth };
      case 'border-bottom':
        return { ...base, borderBottom: `${lineThick} solid ${lineColor}`, paddingBottom: '4px', width: '100%', display: 'block' };
      case 'overline':
        return { ...base, ...alignStyle, display: 'block', borderTop: `${lineThick} solid ${lineColor}`, paddingTop: '4px', width: lineWidth };
      case 'border-left':
        return { ...base, borderLeft: `${lineThick} solid ${lineColor}`, paddingLeft: '10px' };
      case 'border-right':
        return { ...base, borderRight: `${lineThick} solid ${lineColor}`, paddingRight: '10px' };
      case 'double-line':
        return { ...base, borderTop: `${lineThick} solid ${lineColor}`, borderBottom: `${lineThick} solid ${lineColor}`, paddingTop: '3px', paddingBottom: '3px', width: '100%', display: 'block' };
      case 'dot':
        return { ...base }; // handled in SectionHeader with prefix element
      // ── Fill styles ────────────────────────────────────────────────────────
      case 'background':
        return {
          ...base,
          backgroundColor: `${lineColor}${Math.max(8, Math.min(40, (opacityStep ?? 2) * 8)).toString(16).padStart(2, '0')}`,
          padding: `${3 + (padStep ?? 1)}px ${8 + (padStep ?? 1) * 2}px`,
          borderRadius: radiusPx != null ? `${radiusPx}px` : '6px',
          width: '100%',
          display: 'block',
        };
      case 'badge':
        return { ...base, backgroundColor: lineColor, color: '#ffffff', padding: '3px 10px', borderRadius: radiusPx != null ? (radiusPx >= 999 ? '999px' : `${radiusPx}px`) : '6px', display: 'inline-block' };
      case 'capsule':
        return { ...base, border: `${lineThick} solid ${lineColor}`, padding: '2px 12px', borderRadius: '999px', display: 'inline-block' };
      case 'shadow':
        return { ...base, backgroundColor: `${lineColor}12`, padding: '4px 10px', borderRadius: radiusPx != null ? `${radiusPx}px` : '6px', boxShadow: `3px 3px 0 ${lineColor}22`, width: '100%', display: 'block' };
      case 'gradient':
        return { ...base, background: `linear-gradient(90deg, ${lineColor}22, transparent)`, padding: '4px 10px', borderRadius: radiusPx != null ? `${radiusPx}px` : '6px', width: '100%', display: 'block' };
      // ── Special styles (handled in SectionHeader component) ─────────────────
      case 'double-side':
      case 'strikethrough':
        return { ...base };
      default:
        return base;
    }
  };

  // Harmonize data to handle schema variations
  const harmonizedContent: any = (data.content || {}) as any;
  const pInfo = (harmonizedContent.personalInfo || {}) as any;
  const fullName = pInfo.fullName || `${pInfo.firstName || ''} ${pInfo.lastName || ''}`.trim() || 'Name';
  const displayImage = pInfo.image || pInfo.photo || '';

  const harmonizedData = {
    ...data,
    content: {
      ...harmonizedContent,
      personalInfo: {
        ...pInfo,
        fullName,
        image: displayImage
      }
    }
  };

  const measureSidebarWidth = design.layout?.includes('wide') ? '40%' : design.layout?.includes('narrow') ? '25%' : '32%';

  // State to hold page distributions calculated dynamically
  const [pageDistributions, setPageDistributions] = useState<PageData[]>([
    { main: (data.activeSections || []).map(sid => ({ sid })) }
  ]);

  const [stylePopup, setStylePopup] = useState<{ sid: string; index: number } | null>(null);

  const onMoveItem = (sid: string, index: number, direction: 'up' | 'down') => {
    if (!updateNested) return;
    const contentMap = data.content as Record<string, any>;
    const list: any = [...(contentMap?.[sid] || [])];
    if (direction === 'up') {
      if (index === 0) return;
      const temp = list[index];
      list[index] = list[index - 1];
      list[index - 1] = temp;
    } else {
      if (index === list.length - 1) return;
      const temp = list[index];
      list[index] = list[index + 1];
      list[index + 1] = temp;
    }
    updateNested(`content.${sid}`, list);
  };

  const onDeleteItem = (sid: string, index: number) => {
    if (!updateNested) return;
    const contentMap = data.content as Record<string, any>;
    const list: any = contentMap?.[sid] || [];
    const updated = list.filter((_: any, idx: any) => idx !== index);
    updateNested(`content.${sid}`, updated);
  };

  const onOpenStylePopup = (sid: string, index: number) => {
    setStylePopup({ sid, index });
  };

  // Pagination and Height Measurement Engine
  const measureAndPaginate = () => {
    const container = document.getElementById('resume-measuring-container');
    if (!container) return;

    const marginTB = design.marginTB ?? 14;
    const marginTB_px = marginTB * 3.77952755906;

    const A4_HEIGHT = 1122; // A4 height in pixels at 96 DPI
    const maxContentHeight = A4_HEIGHT - (marginTB_px * 2) - 15; // 15px safety buffer to prevent bottom cutoff

    // Measure the header height
    const headerEl = container.querySelector('#measure-personal-header');
    const headerHeight = headerEl ? headerEl.getBoundingClientRect().height : 0;

    const sectionSpacing_mm = design.sectionSpacing ?? 10;
    const sectionSpacing_px = sectionSpacing_mm * 3.77952755906;

    const entrySpacing_mm = design.entrySpacing ?? 8;
    const entrySpacing_px = entrySpacing_mm * 3.77952755906;

    const getItemHeight = (el: Element) => {
      const actualHeight = el.getBoundingClientRect().height;

      const text = el.textContent?.trim() || '';
      if (text.length === 0) return actualHeight > 0 ? actualHeight : 0;

      const listItems = el.querySelectorAll('li').length;
      const paragraphs = el.querySelectorAll('p').length;
      const lineBreaks = (el.innerHTML.match(/<br\s*\/?>/gi) || []).length;
      const structuralLines = Math.max(1, listItems + paragraphs + lineBreaks);

      const charLines = Math.ceil(text.length / 65);
      const estimatedLines = Math.max(structuralLines, charLines);

      const lineH = Math.min(1.8, Math.max(1.2, design.lineHeight ?? 1.45)) * (design.fontSize ?? 10.5) * 1.333;
      const estimatedHeight = estimatedLines * lineH + 28; // 28px padding buffer

      if (actualHeight > 0) {
        return actualHeight;
      }

      return estimatedHeight;
    };

    const pages: PageData[] = [];
    const isSidebar = design.layout?.includes('sidebar');

    if (isSidebar) {
      const sidebarSections = (data.activeSections || []).filter(sid => ['skills', 'languages', 'interests', 'awards', 'certifications', 'socials'].includes(sid));
      const mainSections = (data.activeSections || []).filter(sid => !['skills', 'languages', 'interests', 'awards', 'certifications', 'socials', 'personalInfo'].includes(sid));

      // Main column pagination
      const mainPages: PageBlock[][] = [];
      let currentMainPage: PageBlock[] = [];
      let currentMainHeight = 0;

      for (const sid of mainSections) {
        const sectionEl = container.querySelector(`.measure-section[data-sid="${sid}"]`);
        if (!sectionEl) continue;

        const items = sectionEl.querySelectorAll(`.measure-item[data-sid="${sid}"]`);
        const headerEl = sectionEl.querySelector(`.measure-header[data-sid="${sid}"]`);
        const headerH = headerEl ? headerEl.getBoundingClientRect().height : 30;

        const isSkills = sid === 'skills';
        const isLanguages = sid === 'languages';
        const isInterests = sid === 'interests';
        const isCertifications = sid === 'certifications';
        const isGridSection = ['skills', 'languages', 'interests', 'certifications', 'socials'].includes(sid);
        const styleType = isSkills ? design.skillsStyle : isInterests ? design.interestsStyle : isLanguages ? design.languagesStyle : design.certificationsStyle || 'grid';
        const isActualGrid = isGridSection && styleType !== 'compact' && styleType !== 'bubble';

        // Group items by rows to correctly paginate columns and grids side-by-side
        const cols = (isActualGrid && !isSidebar)
          ? ((isSkills ? design.skillsColumns : isInterests ? design.interestsColumns : isLanguages ? design.languagesColumns : design.certificationsColumns) || 2)
          : 1;

        const rows: number[][] = [];
        for (let i = 0; i < items.length; i += cols) {
          const rowIndices: number[] = [];
          for (let j = 0; j < cols && i + j < items.length; j++) {
            rowIndices.push(i + j);
          }
          rows.push(rowIndices);
        }

        let totalItemsHeight = 0;
        for (let r = 0; r < rows.length; r++) {
          const rowIndices = rows[r];
          const rowHeight = rowIndices.reduce((max, idx) => Math.max(max, getItemHeight(items[idx])), 0);
          totalItemsHeight += rowHeight + (r < rows.length - 1 ? entrySpacing_px : 0);
        }

        const totalSectionHeight = Math.max(sectionEl.getBoundingClientRect().height, totalItemsHeight + headerH);

        if (totalSectionHeight <= maxContentHeight - currentMainHeight) {
          currentMainPage.push({ sid });
          currentMainHeight += totalSectionHeight + sectionSpacing_px;
        } else if (rows.length > 1) {
          let tempItems: number[] = [];
          let currentItemHeight = headerH;

          for (let r = 0; r < rows.length; r++) {
            const rowIndices = rows[r];
            const rowHeight = rowIndices.reduce((max, idx) => Math.max(max, getItemHeight(items[idx])), 0);

            if (currentItemHeight + rowHeight <= maxContentHeight - currentMainHeight) {
              tempItems.push(...rowIndices);
              currentItemHeight += rowHeight + entrySpacing_px;
            } else {
              if (tempItems.length > 0) {
                currentMainPage.push({ sid, itemIndices: tempItems });
              }
              if (currentMainPage.length > 0) {
                mainPages.push(currentMainPage);
              }

              currentMainPage = [];
              currentMainHeight = 0;
              tempItems = [...rowIndices];
              currentItemHeight = headerH + rowHeight + entrySpacing_px;
            }
          }
          if (tempItems.length > 0) {
            currentMainPage.push({ sid, itemIndices: tempItems });
            currentMainHeight = currentItemHeight + sectionSpacing_px;
          }
        } else {
          if (currentMainPage.length > 0) {
            mainPages.push(currentMainPage);
          }
          currentMainPage = [{ sid }];
          currentMainHeight = totalSectionHeight + sectionSpacing_px;
        }
      }
      if (currentMainPage.length > 0) {
        mainPages.push(currentMainPage);
      }

      // Sidebar column pagination
      const sidebarPages: PageBlock[][] = [];
      let currentSidebarPage: PageBlock[] = [];
      let currentSidebarHeight = headerHeight; // Page 1 has personal details header in sidebar

      for (const sid of sidebarSections) {
        const sectionEl = container.querySelector(`.measure-section[data-sid="${sid}"]`);
        if (!sectionEl) continue;

        const items = sectionEl.querySelectorAll(`.measure-item[data-sid="${sid}"]`);
        const headerEl = sectionEl.querySelector(`.measure-header[data-sid="${sid}"]`);
        const headerH = headerEl ? headerEl.getBoundingClientRect().height : 25;

        const isSkills = sid === 'skills';
        const isLanguages = sid === 'languages';
        const isInterests = sid === 'interests';
        const isCertifications = sid === 'certifications';
        const isGridSection = ['skills', 'languages', 'interests', 'certifications', 'socials'].includes(sid);
        const styleType = isSkills ? design.skillsStyle : isInterests ? design.interestsStyle : isLanguages ? design.languagesStyle : design.certificationsStyle || 'grid';
        const isActualGrid = isGridSection && styleType !== 'compact' && styleType !== 'bubble';

        // Group items by rows to correctly paginate columns and grids side-by-side (cols=1 in sidebar usually)
        const cols = (isActualGrid && false) // Sidebar layout sidebar is always 1 column
          ? ((isSkills ? design.skillsColumns : isInterests ? design.interestsColumns : isLanguages ? design.languagesColumns : design.certificationsColumns) || 2)
          : 1;

        const rows: number[][] = [];
        for (let i = 0; i < items.length; i += cols) {
          const rowIndices: number[] = [];
          for (let j = 0; j < cols && i + j < items.length; j++) {
            rowIndices.push(i + j);
          }
          rows.push(rowIndices);
        }

        let totalItemsHeight = 0;
        for (let r = 0; r < rows.length; r++) {
          const rowIndices = rows[r];
          const rowHeight = rowIndices.reduce((max, idx) => Math.max(max, getItemHeight(items[idx])), 0);
          totalItemsHeight += rowHeight + (r < rows.length - 1 ? entrySpacing_px : 0);
        }

        const totalSectionHeight = Math.max(sectionEl.getBoundingClientRect().height, totalItemsHeight + headerH);

        if (totalSectionHeight <= maxContentHeight - currentSidebarHeight) {
          currentSidebarPage.push({ sid });
          currentSidebarHeight += totalSectionHeight + sectionSpacing_px;
        } else if (rows.length > 1) {
          let tempItems: number[] = [];
          let currentItemHeight = headerH;

          for (let r = 0; r < rows.length; r++) {
            const rowIndices = rows[r];
            const rowHeight = rowIndices.reduce((max, idx) => Math.max(max, getItemHeight(items[idx])), 0);

            if (currentItemHeight + rowHeight <= maxContentHeight - currentSidebarHeight) {
              tempItems.push(...rowIndices);
              currentItemHeight += rowHeight + entrySpacing_px;
            } else {
              if (tempItems.length > 0) {
                currentSidebarPage.push({ sid, itemIndices: tempItems });
              }
              if (currentSidebarPage.length > 0) {
                sidebarPages.push(currentSidebarPage);
              }

              currentSidebarPage = [];
              currentSidebarHeight = 0; // Page 2+ sidebar doesn't have details header
              tempItems = [...rowIndices];
              currentItemHeight = headerH + rowHeight + entrySpacing_px;
            }
          }
          if (tempItems.length > 0) {
            currentSidebarPage.push({ sid, itemIndices: tempItems });
            currentSidebarHeight = currentItemHeight + sectionSpacing_px;
          }
        } else {
          if (currentSidebarPage.length > 0) {
            sidebarPages.push(currentSidebarPage);
          }
          currentSidebarPage = [{ sid }];
          currentSidebarHeight = totalSectionHeight + sectionSpacing_px;
        }
      }
      if (currentSidebarPage.length > 0) {
        sidebarPages.push(currentSidebarPage);
      }

      const totalPageCount = Math.max(mainPages.length, sidebarPages.length, 1);
      for (let i = 0; i < totalPageCount; i++) {
        pages.push({
          main: mainPages[i] || [],
          sidebar: sidebarPages[i] || [],
        });
      }
    } else {
      // Single continuous vertical stream layout
      let currentPage: PageBlock[] = [];
      let currentHeight = headerHeight; // Page 1 starts with personal header

      for (const sid of (data.activeSections || [])) {
        const sectionEl = container.querySelector(`.measure-section[data-sid="${sid}"]`);
        if (!sectionEl) continue;

        const items = sectionEl.querySelectorAll(`.measure-item[data-sid="${sid}"]`);
        const headerEl = sectionEl.querySelector(`.measure-header[data-sid="${sid}"]`);
        const headerH = headerEl ? headerEl.getBoundingClientRect().height : 30;

        const isSkills = sid === 'skills';
        const isLanguages = sid === 'languages';
        const isInterests = sid === 'interests';
        const isCertifications = sid === 'certifications';
        const isGridSection = ['skills', 'languages', 'interests', 'certifications', 'socials'].includes(sid);
        const styleType = isSkills ? design.skillsStyle : isInterests ? design.interestsStyle : isLanguages ? design.languagesStyle : design.certificationsStyle || 'grid';
        const isActualGrid = isGridSection && styleType !== 'compact' && styleType !== 'bubble';

        // Group items by rows to correctly paginate columns and grids side-by-side
        const cols = (isActualGrid && !isSidebar)
          ? ((isSkills ? design.skillsColumns : isInterests ? design.interestsColumns : isLanguages ? design.languagesColumns : design.certificationsColumns) || 2)
          : 1;

        const rows: number[][] = [];
        for (let i = 0; i < items.length; i += cols) {
          const rowIndices: number[] = [];
          for (let j = 0; j < cols && i + j < items.length; j++) {
            rowIndices.push(i + j);
          }
          rows.push(rowIndices);
        }

        let totalItemsHeight = 0;
        for (let r = 0; r < rows.length; r++) {
          const rowIndices = rows[r];
          const rowHeight = rowIndices.reduce((max, idx) => Math.max(max, getItemHeight(items[idx])), 0);
          totalItemsHeight += rowHeight + (r < rows.length - 1 ? entrySpacing_px : 0);
        }

        const totalSectionHeight = Math.max(sectionEl.getBoundingClientRect().height, totalItemsHeight + headerH);

        if (totalSectionHeight <= maxContentHeight - currentHeight) {
          currentPage.push({ sid });
          currentHeight += totalSectionHeight + sectionSpacing_px;
        } else if (rows.length > 1) {
          let tempItems: number[] = [];
          let currentItemHeight = headerH;

          for (let r = 0; r < rows.length; r++) {
            const rowIndices = rows[r];
            const rowHeight = rowIndices.reduce((max, idx) => Math.max(max, getItemHeight(items[idx])), 0);

            if (currentItemHeight + rowHeight <= maxContentHeight - currentHeight) {
              tempItems.push(...rowIndices);
              currentItemHeight += rowHeight + entrySpacing_px;
            } else {
              if (tempItems.length > 0) {
                currentPage.push({ sid, itemIndices: tempItems });
              }
              if (currentPage.length > 0) {
                pages.push({ main: currentPage });
              }

              currentPage = [];
              currentHeight = 0;
              tempItems = [...rowIndices];
              currentItemHeight = headerH + rowHeight + entrySpacing_px;
            }
          }
          if (tempItems.length > 0) {
            currentPage.push({ sid, itemIndices: tempItems });
            currentHeight = currentItemHeight + sectionSpacing_px;
          }
        } else {
          if (currentPage.length > 0) {
            pages.push({ main: currentPage });
          }
          currentPage = [{ sid }];
          currentHeight = totalSectionHeight + sectionSpacing_px;
        }
      }
      if (currentPage.length > 0) {
        pages.push({ main: currentPage });
      }
    }

    if (pages.length > 0) {
      setPageDistributions(pages);
      onPageCountChange?.(pages.length);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      measureAndPaginate();
    }, 150);
    return () => clearTimeout(timer);
  }, [data, design]);

  const onDragEnd = (result: any) => {
    if (!result.destination || !onReorderSections) return;

    const sourceDroppableId = result.source.droppableId;
    const destDroppableId = result.destination.droppableId;

    const sourcePageMatch = sourceDroppableId.match(/page-main-(\d+)/) || sourceDroppableId.match(/page-sidebar-(\d+)/);
    const destPageMatch = destDroppableId.match(/page-main-(\d+)/) || destDroppableId.match(/page-sidebar-(\d+)/);

    if (sourcePageMatch && destPageMatch) {
      const sourcePageNum = parseInt(sourcePageMatch[1]);
      const destPageNum = parseInt(destPageMatch[1]);

      const isSourceSidebar = sourceDroppableId.includes('sidebar');
      const isDestSidebar = destDroppableId.includes('sidebar');

      const sourceBlocks = isSourceSidebar
        ? (pageDistributions[sourcePageNum - 1]?.sidebar || [])
        : (pageDistributions[sourcePageNum - 1]?.main || []);

      const destBlocks = isDestSidebar
        ? (pageDistributions[destPageNum - 1]?.sidebar || [])
        : (pageDistributions[destPageNum - 1]?.main || []);

      const draggedSid = sourceBlocks[result.source.index]?.sid;
      if (!draggedSid) return;

      const items = Array.from(data.activeSections || []);
      const sourceIdx = items.indexOf(draggedSid);
      items.splice(sourceIdx, 1);

      const targetSid = destBlocks[result.destination.index]?.sid;
      if (targetSid) {
        const destIdx = items.indexOf(targetSid);
        items.splice(destIdx, 0, draggedSid);
      } else {
        items.push(draggedSid);
      }

      onReorderSections(items);
    } else {
      const items = Array.from(data.activeSections || []);
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, reorderedItem);
      onReorderSections(items);
    }
  };

  return (
    <div
      className={`w-full flex flex-col items-center ${isThumbnail ? 'p-0 overflow-hidden bg-transparent' : 'pt-0 pb-0 px-0'}`}
      style={isThumbnail ? {} : { backgroundColor: 'var(--app-bg-medium)' }}
    >
      <GoogleFontsLoader fontFamily={design.fontFamily || 'Inter'} />

      {/* Zoom wrapper */}
      <div
        className="relative flex flex-col items-center"
        style={{
          transform: `scale(${zoomLevel / 100})`,
          transformOrigin: 'top center',
          marginBottom: isThumbnail ? '0' : zoomLevel < 100 ? `${(zoomLevel / 100 - 1) * (pageDistributions.length * A4_HEIGHT_PX)}px` : '0',
        }}
      >
        <DragDropContext onDragEnd={onDragEnd}>
          {pageDistributions.map((pageBlocks, pageIdx) => {
            const pageNum = pageIdx + 1;

            return (
              <div
                key={pageIdx}
                ref={pageIdx === 0 ? previewRef : undefined}
                id={pageIdx === 0 ? "resume-preview" : `resume-preview-page-${pageNum}`}
                className={`resume-page resume-paper bg-white relative ${isExporting ? 'shadow-none' : 'shadow-2xl mb-8'}`}
                style={{
                  fontFamily: design.fontFamily ?? 'Inter',
                  fontSize: `${Math.min(14, Math.max(10, Math.round((design.fontSize ?? 10.5) * 1.333)))}px`,
                  lineHeight: Math.min(1.8, Math.max(1.2, design.lineHeight ?? 1.45)),
                  width: '210mm',
                  height: '297mm',
                  color: design.textColor || '#1f2937',
                  paddingLeft: `${Math.min(25, Math.max(6, design.marginLR ?? 12))}mm`,
                  paddingRight: `${Math.min(25, Math.max(6, design.marginLR ?? 12))}mm`,
                  paddingTop: `${Math.min(25, Math.max(6, design.marginTB ?? 14))}mm`,
                  paddingBottom: `${Math.min(25, Math.max(6, design.marginTB ?? 14))}mm`,
                  backgroundColor: design.backgroundColor || '#ffffff',
                  boxSizing: 'border-box',
                  overflow: 'hidden',
                  colorScheme: 'light',
                  pageBreakAfter: 'always',
                  breakAfter: 'always',
                }}
              >
                {design.layout?.includes('sidebar') ? (
                  <SidebarLayout
                    data={harmonizedData}
                    getSectionStyle={getSectionStyle}
                    isThumbnail={isThumbnail}
                    isExporting={isExporting}
                    selectedSectionId={selectedSectionId}
                    onSelectSection={onSelectSection}
                    getAccentColor={getAccentColor}
                    getHeadingMeta={getHeadingMeta}
                    pageNum={pageNum}
                    pageBlocks={pageBlocks}
                    onMoveItem={onMoveItem}
                    onDeleteItem={onDeleteItem}
                    onOpenStylePopup={onOpenStylePopup}
                  />
                ) : design.layout === 'modern-header' ? (
                  <ModernHeaderLayout
                    data={harmonizedData}
                    getSectionStyle={getSectionStyle}
                    isThumbnail={isThumbnail}
                    isExporting={isExporting}
                    selectedSectionId={selectedSectionId}
                    onSelectSection={onSelectSection}
                    getAccentColor={getAccentColor}
                    getHeadingMeta={getHeadingMeta}
                    pageNum={pageNum}
                    pageBlocks={pageBlocks}
                    onMoveItem={onMoveItem}
                    onDeleteItem={onDeleteItem}
                    onOpenStylePopup={onOpenStylePopup}
                  />
                ) : design.layout === 'double-header' ? (
                  <DoubleHeaderLayout
                    data={harmonizedData}
                    getSectionStyle={getSectionStyle}
                    isThumbnail={isThumbnail}
                    isExporting={isExporting}
                    selectedSectionId={selectedSectionId}
                    onSelectSection={onSelectSection}
                    getAccentColor={getAccentColor}
                    getHeadingMeta={getHeadingMeta}
                    pageNum={pageNum}
                    pageBlocks={pageBlocks}
                    onMoveItem={onMoveItem}
                    onDeleteItem={onDeleteItem}
                    onOpenStylePopup={onOpenStylePopup}
                  />
                ) : (
                  <SingleColumnLayout
                    data={harmonizedData}
                    getSectionStyle={getSectionStyle}
                    isThumbnail={isThumbnail}
                    isExporting={isExporting}
                    selectedSectionId={selectedSectionId}
                    onSelectSection={onSelectSection}
                    getAccentColor={getAccentColor}
                    getHeadingMeta={getHeadingMeta}
                    pageNum={pageNum}
                    pageBlocks={pageBlocks}
                    onMoveItem={onMoveItem}
                    onDeleteItem={onDeleteItem}
                    onOpenStylePopup={onOpenStylePopup}
                  />
                )}

                {/* Page number badge inside preview */}
                {!isThumbnail && !isExporting && (
                  <div
                    className="absolute bottom-2 right-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest pointer-events-none select-none"
                    style={{
                      background: 'rgba(0,0,0,0.03)',
                      border: '1px solid rgba(0,0,0,0.05)',
                      color: 'var(--app-text-muted)',
                    }}
                  >
                    Page {pageNum} of {pageDistributions.length}
                  </div>
                )}
              </div>
            );
          })}
        </DragDropContext>
      </div>

      {/* Hidden measuring container for high-fidelity A4 page calculations */}
      <div
        id="resume-measuring-container"
        style={{
          position: 'absolute',
          visibility: 'hidden',
          pointerEvents: 'none',
          top: '-9999px',
          left: '-9999px',
          width: '210mm',
          fontFamily: design.fontFamily ?? 'Inter',
          fontSize: `${Math.min(14, Math.max(10, Math.round((design.fontSize ?? 10.5) * 1.333)))}px`,
          lineHeight: Math.min(1.8, Math.max(1.2, design.lineHeight ?? 1.45)),
          paddingLeft: `${Math.min(25, Math.max(6, design.marginLR ?? 12))}mm`,
          paddingRight: `${Math.min(25, Math.max(6, design.marginLR ?? 12))}mm`,
          paddingTop: `${Math.min(25, Math.max(6, design.marginTB ?? 14))}mm`,
          paddingBottom: `${Math.min(25, Math.max(6, design.marginTB ?? 14))}mm`,
          boxSizing: 'border-box',
          backgroundColor: design.backgroundColor || '#ffffff',
          color: design.textColor || '#1f2937',
        }}
      >
        {/* Personal Details Header for height calculations */}
        <div id="measure-personal-header" style={{ display: 'block', width: '100%' }}>
          {design.layout?.includes('sidebar') ? (
            <div
              className={`flex flex-col ${design.personalAlign === 'center' ? 'items-center text-center' : design.personalAlign === 'right' ? 'items-end text-right' : 'items-start text-left'} gap-4 mb-6`}
              style={{ width: '32%', padding: '24px', boxSizing: 'border-box' }}
            >
              {design.photoShow && harmonizedData.content.personalInfo.image && (
                <div
                  className="w-28 h-28 bg-white border-2 shadow-lg flex items-center justify-center overflow-hidden transition-all"
                  style={{
                    borderColor: design.primaryColor || '#ff4d7d',
                    borderRadius: design.photoShape === 'circle' ? '50%' : design.photoShape === 'rounded' ? '8px' : '0'
                  }}
                >
                  <img src={harmonizedData.content.personalInfo.image} className={`w-full h-full object-cover ${design.photoGrayscale ? 'grayscale' : ''}`} />
                </div>
              )}
              <div>
                <h1 className={`${design.nameBold ? 'font-black' : 'font-bold'} uppercase tracking-tight leading-none mb-1`} style={{ color: getAccentColor('name'), fontSize: design.nameSize === 'xl' ? '22px' : design.nameSize === 'l' ? '20px' : design.nameSize === 's' ? '15px' : '18px' }}>{harmonizedData.content.personalInfo.fullName || 'Name'}</h1>
                <p className="font-bold opacity-40 tracking-[0.2em] uppercase" style={{ fontSize: '10px', color: getAccentColor('jobTitle') }}>{harmonizedData.content.personalInfo.professionalTitle || ''}</p>
              </div>

              <div className="flex flex-col gap-2 font-bold uppercase tracking-wide text-slate-400" style={{ fontSize: '10px' }}>
                {harmonizedData.content.personalInfo.email && <div className="flex items-center gap-1.5" style={{ color: getAccentColor('contactIcon') }}><Mail size={9} strokeWidth={3} /> {harmonizedData.content.personalInfo.email}</div>}
                {harmonizedData.content.personalInfo.phone && <div className="flex items-center gap-1.5" style={{ color: getAccentColor('contactIcon') }}><Phone size={9} strokeWidth={3} /> {harmonizedData.content.personalInfo.phone}</div>}
                {harmonizedData.content.personalInfo.location && <div className="flex items-center gap-1.5" style={{ color: getAccentColor('contactIcon') }}><MapPin size={9} strokeWidth={3} /> {harmonizedData.content.personalInfo.location}</div>}
              </div>
            </div>
          ) : design.layout === 'modern-header' ? (
            <div
              className={`flex flex-col py-10 px-8 border-b border-slate-100/50 ${design.personalAlign === 'center' ? 'items-center text-center' : design.personalAlign === 'right' ? 'items-end text-right' : 'items-start text-left'}`}
              style={{ backgroundColor: design.secondaryColor || '#f8fafc', marginBottom: `${design.sectionSpacing || 8}mm` }}
            >
              {design.photoShow && harmonizedData.content.personalInfo.image && (
                <div
                  className="w-24 h-24 overflow-hidden border-2 mb-4 shadow-lg"
                  style={{
                    borderColor: design.primaryColor || '#ff4d7d',
                    borderRadius: design.photoShape === 'circle' ? '50%' : design.photoShape === 'rounded' ? '8px' : '0'
                  }}
                >
                  <img src={harmonizedData.content.personalInfo.image} className={`w-full h-full object-cover ${design.photoGrayscale ? 'grayscale' : ''}`} />
                </div>
              )}
              <h1 className={`${design.nameBold ? 'font-black' : 'font-medium'} mb-1 capitalize tracking-tight leading-none`} style={{ color: getAccentColor('name'), fontSize: design.nameSize === 'xl' ? '28px' : design.nameSize === 'l' ? '24px' : design.nameSize === 's' ? '18px' : design.nameSize === 'xs' ? '15px' : '22px' }}>{harmonizedData.content.personalInfo.fullName || 'Name'}</h1>
              <p className="font-bold opacity-40 uppercase tracking-[0.15em] mb-3" style={{ fontSize: '10px', color: getAccentColor('jobTitle') }}>{harmonizedData.content.personalInfo.professionalTitle || ''}</p>

              <div className={`flex flex-wrap gap-x-6 gap-y-1.5 font-semibold opacity-70 ${design.personalAlign === 'center' ? 'justify-center' : design.personalAlign === 'right' ? 'justify-end' : 'justify-start'}`} style={{ fontSize: '10px' }}>
                {harmonizedData.content.personalInfo.email && <div className="flex items-center gap-1.5" style={{ color: getAccentColor('contactIcon') }}><Mail size={10} strokeWidth={2.5} /> <span className="text-slate-900">{harmonizedData.content.personalInfo.email}</span></div>}
                {harmonizedData.content.personalInfo.phone && <div className="flex items-center gap-1.5" style={{ color: getAccentColor('contactIcon') }}><Phone size={10} strokeWidth={2.5} /> <span className="text-slate-900">{harmonizedData.content.personalInfo.phone}</span></div>}
                {harmonizedData.content.personalInfo.location && <div className="flex items-center gap-1.5" style={{ color: getAccentColor('contactIcon') }}><MapPin size={10} strokeWidth={2.5} /> <span className="text-slate-900">{harmonizedData.content.personalInfo.location}</span></div>}
              </div>
            </div>
          ) : design.layout === 'double-header' ? (
            <div style={{ marginBottom: `${design.sectionSpacing || 8}mm` }}>
              <div className="h-32 flex items-center justify-between px-12 text-white overflow-hidden relative" style={{ backgroundColor: design.primaryColor || 'black' }}>
                <div className="flex items-center gap-6 z-10">
                  {design.photoShow && harmonizedData.content.personalInfo.image && (
                    <div
                      className="w-16 h-16 rounded-full border-2 border-white/40 overflow-hidden shadow-2xl"
                      style={{ borderRadius: design.photoShape === 'circle' ? '50%' : '8px' }}
                    >
                      <img src={harmonizedData.content.personalInfo.image} className={`w-full h-full object-cover ${design.photoGrayscale ? 'grayscale' : ''}`} />
                    </div>
                  )}
                  <div>
                    <h1 className={`${design.nameBold ? 'font-black' : 'font-bold'} uppercase tracking-tight leading-none mb-1`} style={{ fontSize: design.nameSize === 'xl' ? '24px' : design.nameSize === 'l' ? '20px' : design.nameSize === 's' ? '16px' : '18px' }}>{harmonizedData.content.personalInfo.fullName || 'Name'}</h1>
                    <p className="font-black opacity-80 uppercase tracking-[0.15em]" style={{ fontSize: '10px' }}>{harmonizedData.content.personalInfo.professionalTitle || ''}</p>
                  </div>
                </div>
                <div className="z-10 bg-white/10 px-4 py-2 rounded-xl border border-white/20 backdrop-blur-md">
                  <div className="flex flex-col gap-1 font-bold uppercase tracking-wide text-white/90" style={{ fontSize: '10px' }}>
                    {harmonizedData.content.personalInfo.email && <div className="flex items-center gap-1.5"><Mail size={9} strokeWidth={3} /> {harmonizedData.content.personalInfo.email}</div>}
                    {harmonizedData.content.personalInfo.phone && <div className="flex items-center gap-1.5"><Phone size={9} strokeWidth={3} /> {harmonizedData.content.personalInfo.phone}</div>}
                  </div>
                </div>
              </div>
              <div className="bg-slate-50 border-b border-slate-100 flex flex-wrap justify-center gap-6 items-center py-3 font-bold tracking-[0.15em] uppercase text-slate-400" style={{ fontSize: '10px' }}>
                {harmonizedData.content.personalInfo.location && <div className="flex items-center gap-1.5" style={{ color: getAccentColor('contactIcon') }}><MapPin size={9} strokeWidth={3} /> {harmonizedData.content.personalInfo.location}</div>}
                {harmonizedData.content.personalInfo.linkedin && <div className="flex items-center gap-1.5" style={{ color: getAccentColor('contactIcon') }}><Linkedin size={9} strokeWidth={3} /> Profile</div>}
              </div>
            </div>
          ) : (
            <div
              className={`flex flex-col space-y-3 relative pb-6 w-full ${design.personalAlign === 'center' ? 'items-center text-center' : design.personalAlign === 'right' ? 'items-end text-right' : 'items-start text-left'}`}
              style={{ marginBottom: `${Math.min(16, Math.max(4, design.sectionSpacing || 8))}mm` }}
            >
              <div className={`absolute bottom-0 w-32 h-1 ${design.personalAlign === 'center' ? 'left-1/2 -translate-x-1/2' : design.personalAlign === 'right' ? 'right-0' : 'left-0'}`} style={{ backgroundColor: design.primaryColor || 'black' }} />

              {design.photoShow && harmonizedData.content.personalInfo.image && (
                <div
                  className="w-28 h-28 bg-white border-2 shadow-lg flex items-center justify-center overflow-hidden transition-all mb-2"
                  style={{
                    borderColor: design.primaryColor || 'black',
                    borderRadius: design.photoShape === 'circle' ? '50%' : design.photoShape === 'rounded' ? '8px' : '0'
                  }}
                >
                  <img src={harmonizedData.content.personalInfo.image} className={`w-full h-full object-cover ${design.photoGrayscale ? 'grayscale' : ''}`} />
                </div>
              )}

              <h1 className={`${design.nameBold ? 'font-black' : 'font-medium'} tracking-tight uppercase leading-none`} style={{ color: getAccentColor('name'), fontSize: design.nameSize === 'xl' ? '30px' : design.nameSize === 'l' ? '26px' : design.nameSize === 's' ? '20px' : design.nameSize === 'xs' ? '16px' : '24px' }}>{harmonizedData.content.personalInfo.fullName || 'Name'}</h1>
              <p className="font-bold opacity-40 tracking-[0.2em] uppercase" style={{ fontSize: '11px', color: getAccentColor('jobTitle') }}>{harmonizedData.content.personalInfo.professionalTitle || ''}</p>

              <div className={`flex flex-wrap gap-x-6 gap-y-1.5 font-semibold tracking-wide opacity-60 uppercase tabular-nums ${design.personalAlign === 'center' ? 'justify-center' : design.personalAlign === 'right' ? 'justify-end' : 'justify-start'}`} style={{ fontSize: '10px' }}>
                {harmonizedData.content.personalInfo.email && <div className="flex items-center gap-1.5" style={{ color: getAccentColor('contactIcon') }}><Mail size={10} strokeWidth={2.5} /> {harmonizedData.content.personalInfo.email}</div>}
                {harmonizedData.content.personalInfo.phone && <div className="flex items-center gap-1.5" style={{ color: getAccentColor('contactIcon') }}><Phone size={10} strokeWidth={2.5} /> {harmonizedData.content.personalInfo.phone}</div>}
                {harmonizedData.content.personalInfo.location && <div className="flex items-center gap-1.5" style={{ color: getAccentColor('contactIcon') }}><MapPin size={10} strokeWidth={2.5} /> {harmonizedData.content.personalInfo.location}</div>}
              </div>
            </div>
          )}
        </div>

        {/* Section List for continuous layout height calculations */}
        {design.layout?.includes('sidebar') ? (
          <div style={{ display: 'block', width: '100%' }}>
            {/* Float left column for sidebar */}
            <div style={{ float: 'left', width: measureSidebarWidth, padding: '24px', boxSizing: 'border-box' }}>
              {(harmonizedData.activeSections || [])
                .filter(sid => ['skills', 'languages', 'interests', 'awards', 'certifications', 'socials'].includes(sid))
                .map(sid => (
                  <div
                    key={sid}
                    className="measure-section"
                    data-sid={sid}
                    style={{ marginBottom: `${design.sectionSpacing ?? 10}mm` }}
                  >
                    <DynamicSectionRenderer
                      sid={sid}
                      data={harmonizedData}
                      layout="sidebar"
                      getStyle={getSectionStyle}
                      getAccentColor={getAccentColor}
                      getHeadingMeta={getHeadingMeta}
                      isExporting={true}
                      isMeasuring={true}
                    />
                  </div>
                ))}
            </div>
            {/* Margin left column for main sections */}
            <div style={{ marginLeft: measureSidebarWidth, padding: '24px', boxSizing: 'border-box' }}>
              {(harmonizedData.activeSections || [])
                .filter(sid => !['skills', 'languages', 'interests', 'awards', 'certifications', 'socials', 'personalInfo'].includes(sid))
                .map(sid => (
                  <div
                    key={sid}
                    className="measure-section"
                    data-sid={sid}
                    style={{ marginBottom: `${design.sectionSpacing ?? 10}mm` }}
                  >
                    <DynamicSectionRenderer
                      sid={sid}
                      data={harmonizedData}
                      layout="single"
                      getStyle={getSectionStyle}
                      getAccentColor={getAccentColor}
                      getHeadingMeta={getHeadingMeta}
                      isExporting={true}
                      isMeasuring={true}
                    />
                  </div>
                ))}
            </div>
            <div style={{ clear: 'both' }} />
          </div>
        ) : (
          /* Non-sidebar continuous layouts */
          (harmonizedData.activeSections || []).map(sid => (
            <div
              key={sid}
              className="measure-section"
              data-sid={sid}
              style={{ marginBottom: `${design.sectionSpacing ?? 10}mm` }}
            >
              <DynamicSectionRenderer
                sid={sid}
                data={harmonizedData}
                layout="single"
                getStyle={getSectionStyle}
                getAccentColor={getAccentColor}
                getHeadingMeta={getHeadingMeta}
                isExporting={true}
                isMeasuring={true}
              />
            </div>
          ))
        )}
      </div>

      {stylePopup && (() => {
        const currentOverrides = data.styleOverrides?.[`content.${stylePopup.sid}[${stylePopup.index}]`] || {};
        return (
          <div
            className="fixed bottom-8 right-8 w-80 bg-slate-900 border border-slate-700/60 text-white rounded-2xl shadow-2xl p-5 z-[99999] backdrop-blur-md transition-all duration-300 flex flex-col gap-4 font-sans pointer-events-auto select-none"
            onMouseDown={e => e.stopPropagation()}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex flex-col">
                <span className="text-[10px] font-black tracking-widest text-indigo-400 uppercase">Item Style Customizer</span>
                <span className="text-xs font-bold text-slate-200 capitalize">{stylePopup.sid} item #{stylePopup.index + 1}</span>
              </div>
              <button
                onClick={() => setStylePopup(null)}
                className="p-1 hover:bg-white/10 rounded transition-colors text-slate-300 hover:text-white"
              >
                <X size={14} />
              </button>
            </div>

            {/* Controls Container */}
            <div className="flex flex-col gap-4 max-h-[350px] overflow-y-auto pr-1">

              {/* Font Size */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-[11px] font-semibold text-slate-300">
                  <span>Text Size</span>
                  <span className="bg-indigo-500/30 text-indigo-300 px-1.5 py-0.5 rounded text-[10px]">
                    {currentOverrides.fontSize !== undefined ? `${currentOverrides.fontSize}px` : 'Default'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="8"
                    max="24"
                    value={currentOverrides.fontSize !== undefined ? currentOverrides.fontSize : 11}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      const current = data.styleOverrides || {};
                      updateNested?.('styleOverrides', {
                        ...current,
                        [`content.${stylePopup.sid}[${stylePopup.index}]`]: {
                          ...currentOverrides,
                          fontSize: val
                        }
                      });
                    }}
                    className="w-full accent-indigo-500 h-1 bg-white/20 rounded-lg cursor-pointer"
                  />
                  {currentOverrides.fontSize !== undefined && (
                    <button
                      onClick={() => {
                        const current = { ...(data.styleOverrides || {}) };
                        const nextOverrides = { ...currentOverrides };
                        delete nextOverrides.fontSize;
                        current[`content.${stylePopup.sid}[${stylePopup.index}]`] = nextOverrides;
                        updateNested?.('styleOverrides', current);
                      }}
                      className="text-[9px] font-bold text-red-400 hover:underline shrink-0"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>

              {/* Spacing / Margin Bottom */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-[11px] font-semibold text-slate-300">
                  <span>Item Spacing (Margin Bottom)</span>
                  <span className="bg-indigo-500/30 text-indigo-300 px-1.5 py-0.5 rounded text-[10px]">
                    {currentOverrides.marginBottom !== undefined ? `${currentOverrides.marginBottom}px` : 'Default'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="60"
                    value={currentOverrides.marginBottom !== undefined ? currentOverrides.marginBottom : 8}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      const current = data.styleOverrides || {};
                      updateNested?.('styleOverrides', {
                        ...current,
                        [`content.${stylePopup.sid}[${stylePopup.index}]`]: {
                          ...currentOverrides,
                          marginBottom: val
                        }
                      });
                    }}
                    className="w-full accent-indigo-500 h-1 bg-white/20 rounded-lg cursor-pointer"
                  />
                  {currentOverrides.marginBottom !== undefined && (
                    <button
                      onClick={() => {
                        const current = { ...(data.styleOverrides || {}) };
                        const nextOverrides = { ...currentOverrides };
                        delete nextOverrides.marginBottom;
                        current[`content.${stylePopup.sid}[${stylePopup.index}]`] = nextOverrides;
                        updateNested?.('styleOverrides', current);
                      }}
                      className="text-[9px] font-bold text-red-400 hover:underline shrink-0"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>

              {/* Padding */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-[11px] font-semibold text-slate-300">
                  <span>Item Padding</span>
                  <span className="bg-indigo-500/30 text-indigo-300 px-1.5 py-0.5 rounded text-[10px]">
                    {currentOverrides.padding !== undefined ? `${currentOverrides.padding}px` : '0px'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="40"
                    value={currentOverrides.padding !== undefined ? currentOverrides.padding : 0}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      const current = data.styleOverrides || {};
                      updateNested?.('styleOverrides', {
                        ...current,
                        [`content.${stylePopup.sid}[${stylePopup.index}]`]: {
                          ...currentOverrides,
                          padding: val
                        }
                      });
                    }}
                    className="w-full accent-indigo-500 h-1 bg-white/20 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* Border Style */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-semibold text-slate-300">Border Style</span>
                <div className="flex flex-wrap gap-1">
                  {['none', 'solid', 'dashed', 'dotted', 'double'].map(st => (
                    <button
                      key={st}
                      onClick={() => {
                        const current = data.styleOverrides || {};
                        updateNested?.('styleOverrides', {
                          ...current,
                          [`content.${stylePopup.sid}[${stylePopup.index}]`]: {
                            ...currentOverrides,
                            borderStyle: st
                          }
                        });
                      }}
                      className={`text-[10px] px-2.5 py-1 rounded-md font-bold uppercase transition-all duration-150 ${currentOverrides.borderStyle === st ? 'bg-indigo-500 text-white' : 'bg-white/10 text-slate-300 hover:bg-white/15'}`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Border Thickness */}
              {currentOverrides.borderStyle && currentOverrides.borderStyle !== 'none' && (
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-[11px] font-semibold text-slate-300">
                    <span>Border Thickness</span>
                    <span className="bg-indigo-500/30 text-indigo-300 px-1.5 py-0.5 rounded text-[10px]">
                      {currentOverrides.borderWidth !== undefined ? `${currentOverrides.borderWidth}px` : '1px'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="8"
                    value={currentOverrides.borderWidth !== undefined ? currentOverrides.borderWidth : 1}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      const current = data.styleOverrides || {};
                      updateNested?.('styleOverrides', {
                        ...current,
                        [`content.${stylePopup.sid}[${stylePopup.index}]`]: {
                          ...currentOverrides,
                          borderWidth: val
                        }
                      });
                    }}
                    className="w-full accent-indigo-500 h-1 bg-white/20 rounded-lg cursor-pointer"
                  />
                </div>
              )}

              {/* Border Color */}
              {currentOverrides.borderStyle && currentOverrides.borderStyle !== 'none' && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-semibold text-slate-300">Border Color</span>
                  <div className="flex flex-wrap gap-1.5">
                    {COLOR_SWATCHES.map(col => (
                      <button
                        key={col}
                        onClick={() => {
                          const current = data.styleOverrides || {};
                          updateNested?.('styleOverrides', {
                            ...current,
                            [`content.${stylePopup.sid}[${stylePopup.index}]`]: {
                              ...currentOverrides,
                              borderColor: col
                            }
                          });
                        }}
                        className={`w-6 h-6 rounded-md cursor-pointer transition-all duration-150 ${currentOverrides.borderColor === col ? 'scale-110 ring-2 ring-indigo-400' : 'opacity-85 hover:opacity-100'}`}
                        style={{ backgroundColor: col }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Background Color */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-semibold text-slate-300">Background Color</span>
                <div className="flex flex-wrap gap-1.5">
                  {['transparent', '#ffffff', '#f8fafc', '#f1f5f9', '#fef3c7', '#ecfdf5', '#eff6ff'].map(bg => (
                    <button
                      key={bg}
                      onClick={() => {
                        const current = data.styleOverrides || {};
                        updateNested?.('styleOverrides', {
                          ...current,
                          [`content.${stylePopup.sid}[${stylePopup.index}]`]: {
                            ...currentOverrides,
                            backgroundColor: bg
                          }
                        });
                      }}
                      className={`w-6 h-6 rounded-md cursor-pointer transition-all duration-150 border border-white/20 flex items-center justify-center ${currentOverrides.backgroundColor === bg ? 'scale-110 ring-2 ring-indigo-400' : 'opacity-85 hover:opacity-100'}`}
                      style={{ backgroundColor: bg === 'transparent' ? 'rgba(255,255,255,0.05)' : bg }}
                    >
                      {bg === 'transparent' && <span className="text-[9px] text-slate-400">×</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Border Radius */}
              {currentOverrides.backgroundColor && currentOverrides.backgroundColor !== 'transparent' && (
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-[11px] font-semibold text-slate-300">
                    <span>Border Radius (Rounded Corners)</span>
                    <span className="bg-indigo-500/30 text-indigo-300 px-1.5 py-0.5 rounded text-[10px]">
                      {currentOverrides.borderRadius !== undefined ? `${currentOverrides.borderRadius}px` : '0px'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="24"
                    value={currentOverrides.borderRadius !== undefined ? currentOverrides.borderRadius : 0}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      const current = data.styleOverrides || {};
                      updateNested?.('styleOverrides', {
                        ...current,
                        [`content.${stylePopup.sid}[${stylePopup.index}]`]: {
                          ...currentOverrides,
                          borderRadius: val
                        }
                      });
                    }}
                    className="w-full accent-indigo-500 h-1 bg-white/20 rounded-lg cursor-pointer"
                  />
                </div>
              )}

            </div>

            {/* Reset All & Apply */}
            <div className="flex gap-2 pt-2 border-t border-white/10">
              <button
                onClick={() => {
                  const current = { ...(data.styleOverrides || {}) };
                  delete current[`content.${stylePopup.sid}[${stylePopup.index}]`];
                  updateNested?.('styleOverrides', current);
                }}
                className="flex-1 py-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-xs font-bold text-red-400 transition-colors"
              >
                Reset All
              </button>
              <button
                onClick={() => setStylePopup(null)}
                className="flex-1 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-xl text-xs font-bold text-white transition-colors shadow-lg shadow-indigo-500/20"
              >
                Done
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

/* --- Shared Components --- */

const RichContent = ({ html, path, overrides, className = '', style }: { html: string; path?: string; overrides?: Record<string, React.CSSProperties>; className?: string; style?: React.CSSProperties }) => {
  if (!html || html === '<p></p>') return null;
  const errorPatterns = [
    /error:\s*gemini[_\s]api[_\s]key[^.]*\./gi,
    /error:\s*GEMINI_API_KEY[^.]*\./gi,
    /add it to \.env\.local[^.]*\./gi,
    /AI service temporarily unavailable[^.]*\./gi,
    /Rate limit reached[^.]*\./gi,
  ];
  let cleaned = html;
  for (const pattern of errorPatterns) {
    cleaned = cleaned.replace(pattern, '');
  }
  cleaned = cleaned.trim();
  if (!cleaned || cleaned === '<p></p>' || cleaned === '<p> </p>') return null;

  if (path) {
    let pIndex = 0;
    let liIndex = 0;
    cleaned = cleaned.replace(/<(p|li)(>|\s[^>]*>)/gi, (match, rawTag, rest) => {
      const tag = rawTag.toLowerCase();
      const idx = tag === 'p' ? pIndex++ : liIndex++;
      const stylePath = `${path}.${tag}[${idx}]`;
      let inlineStyle = '';
      if (overrides && overrides[stylePath]) {
        const styleObj = overrides[stylePath];
        const styleStr = Object.entries(styleObj).map(([k, v]) => {
          const dashKey = k.replace(/([A-Z])/g, "-$1").toLowerCase();
          const value = typeof v === 'number' && k !== 'fontWeight' ? `${v}px` : v;
          return `${dashKey}:${value}`;
        }).join(';');
        if (styleStr) inlineStyle = ` style="${styleStr}"`;
      }
      return `<${rawTag} data-style-path="${stylePath}"${inlineStyle}${rest}`;
    });
  }

  const wrapperStyle = path && overrides && overrides[path] ? { ...style, ...overrides[path] } : style;
  return <div className={`rich-content ${className}`} style={wrapperStyle} dangerouslySetInnerHTML={{ __html: cleaned }} {...(path ? { 'data-edit-path': path, 'data-edit-type': 'richtext' } : {})} />;
};

const SectionHeader = ({
  title,
  style,
  headingStyle,
  lineColor,
  lineThick,
  lineWidth,
  editPath,
  editValue,
  editLabel,
  textStylePath,
  wrapperStylePath,
  overrides,
}: {
  title: string;
  style: React.CSSProperties;
  headingStyle?: string;
  lineColor?: string;
  lineThick?: string;
  lineWidth?: string;
  editPath?: string;
  editValue?: string;
  editLabel?: string;
  textStylePath?: string;
  wrapperStylePath?: string;
  overrides?: Record<string, React.CSSProperties>;
}) => {
  const lc = lineColor || '#1f2937';
  const lt = lineThick || '2px';
  const titleStyle = textStylePath && overrides?.[textStylePath] ? { ...style, ...overrides[textStylePath] } : style;
  const blockStyle = wrapperStylePath && overrides?.[wrapperStylePath] ? overrides[wrapperStylePath] : {};
  const wrapperEditableProps = editPath ? {
    'data-edit-path': editPath,
    'data-edit-value': editValue || title,
    'data-edit-label': editLabel || 'Section Heading',
  } : {};
  const wrapperStyleProps = wrapperStylePath ? { 'data-style-path': wrapperStylePath } : {};
  const titleEditableProps = editPath ? {
    'data-edit-path': editPath,
    'data-edit-value': editValue || title,
    'data-edit-label': editLabel || 'Section Heading',
  } : {};
  const titleStyleProps = textStylePath ? { 'data-style-path': textStylePath } : {};

  // default line width
  const lw = lineWidth || '100%';

  // convert number to %
  const parsedWidth = lw.includes('%') ? lw : `${lw}%`;

  // =========================
  // DOT STYLE
  // =========================
  if ((headingStyle || '').startsWith('dot')) {
    const sizeMatch = ((headingStyle || '').match(/_s(\d+)/) || [])[1];
    const dotSize = sizeMatch ? `${Number(sizeMatch)}px` : '7px';

    return (
      <div
        className="section-header-container mb-3 flex items-center gap-2"
        style={{
          width: parsedWidth,
          ...blockStyle,
        }}
        {...wrapperEditableProps}
        {...wrapperStyleProps}
      >
        <div
          style={{
            width: dotSize,
            height: dotSize,
            borderRadius: '50%',
            backgroundColor: lc,
            flexShrink: 0,
          }}
        />

        <h2 style={titleStyle} {...titleEditableProps} {...titleStyleProps}>{title}</h2>

        {/* right line */}
        <div
          style={{
            flex: 1,
            height: lt,
            backgroundColor: lc,
            opacity: 0.3,
          }}
        />
      </div>
    );
  }

  // =========================
  // DOUBLE SIDE STYLE
  // =========================
  if ((headingStyle || '').startsWith('double-side')) {
    return (
      <div
        className="section-header-container mb-3 flex items-center gap-3"
        style={{
          width: parsedWidth,
          ...blockStyle,
        }}
        {...wrapperEditableProps}
        {...wrapperStyleProps}
      >
        <div
          style={{
            flex: 1,
            height: lt,
            backgroundColor: lc,
            opacity: 0.4,
          }}
        />

        <h2
          style={{
            ...titleStyle,
            display: 'inline-block',
            whiteSpace: 'nowrap',
          }}
          {...titleEditableProps}
          {...titleStyleProps}
        >
          {title}
        </h2>

        <div
          style={{
            flex: 1,
            height: lt,
            backgroundColor: lc,
            opacity: 0.4,
          }}
        />
      </div>
    );
  }

  // =========================
  // STRIKETHROUGH STYLE
  // =========================
  if ((headingStyle || '').startsWith('strikethrough')) {
    const tMatch = ((headingStyle || '').match(/_t(\d+)/) || [])[1];

    const strikeH = tMatch
      ? `${Number(tMatch)}px`
      : lt;

    return (
      <div
        className="section-header-container mb-3 relative flex items-center"
        style={{
          width: parsedWidth,
          ...blockStyle,
        }}
        {...wrapperEditableProps}
        {...wrapperStyleProps}
      >
        {/* line */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            width: '100%',
            height: strikeH,
            backgroundColor: lc,
            opacity: 0.25,
          }}
        />

        {/* title */}
        <h2
          style={{
            ...titleStyle,
            display: 'inline-block',
            backgroundColor: 'white',
            paddingLeft: '6px',
            paddingRight: '10px',
            position: 'relative',
            zIndex: 2,
          }}
          {...titleEditableProps}
          {...titleStyleProps}
        >
          {title}
        </h2>
      </div>
    );
  }

  // =========================
  // UNDERLINE STYLE
  // =========================
  if ((headingStyle || '').startsWith('underline')) {
    return (
      <div
        className="section-header-container mb-3"
        style={{
          width: parsedWidth,
          ...blockStyle,
        }}
        {...wrapperEditableProps}
        {...wrapperStyleProps}
      >
        <h2 style={titleStyle} {...titleEditableProps} {...titleStyleProps}>{title}</h2>

        <div
          style={{
            marginTop: '6px',
            width: '100%',
            height: lt,
            backgroundColor: lc,
            borderRadius: '999px',
          }}
        />
      </div>
    );
  }

  // =========================
  // LEFT BORDER STYLE
  // =========================
  if ((headingStyle || '').startsWith('left-border')) {
    return (
      <div
        className="section-header-container mb-3 flex items-center"
        style={{
          width: parsedWidth,
          borderLeft: `${lt} solid ${lc}`,
          paddingLeft: '10px',
          ...blockStyle,
        }}
        {...wrapperEditableProps}
        {...wrapperStyleProps}
      >
        <h2 style={titleStyle} {...titleEditableProps} {...titleStyleProps}>{title}</h2>
      </div>
    );
  }

  // =========================
  // DEFAULT STYLE
  // =========================
  return (
    <div
      className="section-header-container mb-3"
      style={{
        width: parsedWidth,
        ...blockStyle,
      }}
      {...wrapperEditableProps}
      {...wrapperStyleProps}
    >
      <h2 style={titleStyle} {...titleEditableProps} {...titleStyleProps}>{title}</h2>
    </div>
  );
};

const SortableSection = ({ id, pageNum, index, children, isSelected, onSelect }: { id: string, pageNum: number, index: number, children: React.ReactNode, isSelected?: boolean, onSelect?: () => void }) => (
  <Draggable draggableId={`${id}-${pageNum}`} index={index}>
    {(provided, snapshot) => (
      <div
        ref={provided.innerRef}
        {...provided.draggableProps}
        className={`relative group/section ${snapshot.isDragging ? 'bg-blue-50/30 ring-2 ring-blue-200 ring-offset-4 rounded-xl scale-[1.01] z-50' : ''} ${isSelected ? 'ring-2 ring-slate-900 ring-offset-4 rounded-xl' : ''}`}
        style={{
          ...provided.draggableProps.style,
          breakInside: 'avoid',
          pageBreakInside: 'avoid',
        }}
      >
        <div
          {...provided.dragHandleProps}
          className="absolute -left-10 top-0 p-2 opacity-0 group-hover/section:opacity-100 transition-opacity cursor-grab text-slate-300 hover:text-slate-900"
          title="Drag to reorder section"
        >
          <GripVertical className="w-5 h-5" />
        </div>
        {!snapshot.isDragging && onSelect && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onSelect(); }}
            className="absolute -left-10 top-10 p-2 opacity-0 group-hover/section:opacity-100 transition-opacity text-slate-300 hover:text-slate-900"
            title="Select section to edit"
          >
            <Check className="w-5 h-5" />
          </button>
        )}
        {children}
      </div>
    )}
  </Draggable>
);

/* --- Dynamic Global Section Renderer --- */

const DynamicSectionRenderer = ({ sid, data, layout, getStyle, getAccentColor, getHeadingMeta, isExporting, itemIndices, isMeasuring, onMoveItem, onDeleteItem, onOpenStylePopup, isThumbnail }: { sid: string, data: ResumeData, layout: 'sidebar' | 'modern' | 'single' | 'double', getStyle: any, getAccentColor: any, getHeadingMeta: (isSidebar: boolean) => { headingStyleId: string; lineColor: string; lineThick: string; lineWidth: string }, isExporting?: boolean, itemIndices?: number[], isMeasuring?: boolean, onMoveItem?: (sid: string, index: number, direction: 'up' | 'down') => void, onDeleteItem?: (sid: string, index: number) => void, onOpenStylePopup?: (sid: string, index: number) => void, isThumbnail?: boolean }) => {
  const design = data.design || {} as any;
  const content = data.content || {} as any;
  const personalInfo = content.personalInfo || {} as any;
  const headingMeta = getHeadingMeta(layout === 'sidebar');

  const getElementStyle = (path: string, baseStyle: React.CSSProperties = {}): React.CSSProperties => {
    const overrides = data.styleOverrides?.[path];
    if (!overrides) return baseStyle;
    return { ...baseStyle, ...overrides };
  };
  const getSectionTitle = (sectionId: string, fallback: string) => {
    return design.sectionTitles?.[sectionId] || fallback;
  };

  if (sid === 'summary' && personalInfo.summary) {
    return (
      <div style={{
        marginBottom: `${design.sectionSpacing ?? 8}mm`,
        breakInside: 'avoid',
        pageBreakInside: 'avoid',
      }}>
        {design.showSummaryHeading && (
          <div className="measure-header" data-sid={sid}>
            <SectionHeader
              title={getSectionTitle(sid, layout === 'single' ? 'Professional Profile' : 'Profile')}
              style={layout === 'single' ? { ...getStyle(false), textAlign: 'center', width: '100%', display: 'block' } : getStyle(layout === 'sidebar')}
              headingStyle={headingMeta.headingStyleId}
              lineColor={headingMeta.lineColor}
              lineThick={headingMeta.lineThick}
              lineWidth={headingMeta.lineWidth}
              editPath={`design.sectionTitles.${sid}`}
              editValue={getSectionTitle(sid, layout === 'single' ? 'Professional Profile' : 'Profile')}
              editLabel="Section Heading"
              textStylePath={`sectionTitle.${sid}.text`}
              wrapperStylePath={`sectionTitle.${sid}.block`}
              overrides={data.styleOverrides}
            />
          </div>
        )}
        <RichContent html={personalInfo.summary} className={`leading-relaxed opacity-80 ${layout === 'single' ? 'font-medium italic text-slate-600' : ''}`} style={{ fontSize: '11px' } as any} path="content.personalInfo.summary" overrides={data.styleOverrides} />
      </div>
    );
  }

  if (sid === 'declaration' && content.declaration?.text) {
    return (
      <div style={{ marginBottom: `${design.sectionSpacing ?? 8}mm`, breakInside: 'avoid', pageBreakInside: 'avoid' }}>
        <div className="measure-header" data-sid={sid}>
          <SectionHeader
            title={getSectionTitle(sid, 'Declaration')}
            style={getStyle(layout === 'sidebar')}
            headingStyle={headingMeta.headingStyleId}
            lineColor={headingMeta.lineColor}
            lineThick={headingMeta.lineThick}
            lineWidth={headingMeta.lineWidth}
            editPath={`design.sectionTitles.${sid}`}
            editValue={getSectionTitle(sid, 'Declaration')}
            editLabel="Section Heading"
            textStylePath={`sectionTitle.${sid}.text`}
            wrapperStylePath={`sectionTitle.${sid}.block`}
            overrides={data.styleOverrides}
          />
        </div>
        <div className="space-y-3 opacity-80 text-[1em]">
          <p>{content.declaration.text}</p>
          <div className="flex gap-10 font-semibold opacity-60 text-[0.85em]">
            {content.declaration.date && <span>Date: {content.declaration.date}</span>}
            {content.declaration.place && <span>Place: {content.declaration.place}</span>}
          </div>
        </div>
      </div>
    );
  }

  if (['skills', 'interests', 'languages', 'certifications', 'socials'].includes(sid)) {
    const isLanguages = sid === 'languages';
    const isSkills = sid === 'skills';
    const isInterests = sid === 'interests';
    const isCertifications = sid === 'certifications';

    const styleType = isSkills ? design.skillsStyle : isInterests ? design.interestsStyle : isLanguages ? design.languagesStyle : design.certificationsStyle || 'grid';
    const columns = (isSkills ? design.skillsColumns : isInterests ? design.interestsColumns : isLanguages ? design.languagesColumns : design.certificationsColumns) || 2;

    const items = isLanguages
      ? (content.languages || [])
      : isCertifications
        ? (content.certifications || [])
        : isSkills
          ? (content.skills || [])
          : isInterests
            ? (content.interests || [])
            : (content.socials || []);

    const safeItems = Array.isArray(items) ? items : [];
    const hasText = (value: unknown) => typeof value === 'string' && value.trim().length > 0;
    const normalizedItems = safeItems
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => {
        const record = item as any;
        if (!item) return false;
        if (typeof item === 'object' && record.hidden === true) return false;
        if (typeof item === 'string') return hasText(item);
        if (isLanguages) return hasText(record.language);
        if (isCertifications) return hasText(record.name);
        if (sid === 'socials') return Boolean(record.platform || record.label || record.url);
        if (isSkills || isInterests) return hasText(record.name) || hasText(record.label);
        return true;
      });

    const filteredItems = itemIndices
      ? normalizedItems.filter(({ index }) => itemIndices.includes(index))
      : normalizedItems;

    if (!filteredItems.length) return null;

    const getLevel = (item: any) => {
      if (typeof item === 'string') return getLevelPercentage(item);
      if (isLanguages) return getLevelPercentage(item.proficiency || '');
      return 50;
    };

    const getItemLabel = (item: any) => {
      if (typeof item === 'string') return item;
      if (isLanguages) {
        const langName = item.language || '';
        return langName;
      }
      if (isCertifications) return `${item.name || ''}${item.issuer ? ` (${item.issuer})` : ''}`;
      if (sid === 'socials') return item.platform || item.label || item.url || '';
      if (isSkills || isInterests) return item.name || item.label || '';
      return item.label || item.name || '';
    };

    const getLanguageLabel = (item: any) => {
      if (typeof item === 'string') return item;
      const name = item.language || '';
      const prof = item.proficiency || '';
      return prof ? `${name} — ${prof}` : name;
    };

    const getItemEditMeta = (item: any, originalIndex: number) => {
      if (isLanguages) {
        return {
          path: `content.languages[${originalIndex}].__composite`,
          label: 'Language',
          value: getLanguageLabel(item),
          composite: 'language-line',
        };
      }
      if (isSkills) {
        return {
          path: `content.skills[${originalIndex}].name`,
          label: 'Skill',
          value: getItemLabel(item),
        };
      }
      if (isInterests) {
        return {
          path: `content.interests[${originalIndex}].name`,
          label: 'Interest',
          value: getItemLabel(item),
        };
      }
      if (isCertifications) {
        return {
          path: `content.certifications[${originalIndex}].name`,
          label: 'Certification',
          value: typeof item === 'object' ? item.name || '' : String(item || ''),
        };
      }
      if (sid === 'socials') {
        return {
          path: `content.socials[${originalIndex}].label`,
          label: 'Social Link',
          value: typeof item === 'object' ? (item.label || item.platform || item.url || '') : String(item || ''),
        };
      }
      return {
        path: `content.${sid}[${originalIndex}].name`,
        label: 'Text',
        value: getItemLabel(item),
      };
    };

    const isFirstChunk = !itemIndices || itemIndices.includes(0);
    const defaultSectionTitle = isSkills ? 'Skills' : isInterests ? 'Interests' : isLanguages ? 'Languages' : isCertifications ? 'Certifications' : 'Socials';
    const baseSectionTitle = getSectionTitle(sid, defaultSectionTitle);
    const displayTitle = `${baseSectionTitle}${isFirstChunk ? '' : ' (Continued)'}`;

    const GridEntryContainer = ({ originalIndex, children, className = "" }: { originalIndex: number, children: React.ReactNode, className?: string }) => {
      const overrides = data.styleOverrides?.[`content.${sid}[${originalIndex}]`] || {};
      return (
        <div
          className={`group/item relative transition-all duration-200 ${className}`}
          style={{
            display: 'inline-block',
            verticalAlign: 'middle',
            breakInside: 'avoid',
            pageBreakInside: 'avoid',
            marginBottom: overrides.marginBottom !== undefined ? `${overrides.marginBottom}px` : '4px',
            borderStyle: overrides.borderStyle || 'none',
            borderColor: overrides.borderColor || 'transparent',
            borderWidth: overrides.borderWidth !== undefined ? `${overrides.borderWidth}px` : '0px',
            padding: overrides.padding !== undefined ? `${overrides.padding}px` : '0px',
            backgroundColor: overrides.backgroundColor || 'transparent',
            borderRadius: overrides.borderRadius !== undefined ? `${overrides.borderRadius}px` : '0px',
            boxShadow: overrides.boxShadow || 'none',
            transition: 'all 0.2s ease',
          }}
        >
          {/* Hover controls overlay */}
          {/* {!isExporting && !isThumbnail && !isMeasuring && (
            <div className="absolute -top-3.5 -right-1 hidden group-hover/item:flex items-center gap-1.5 bg-indigo-950/95 border border-indigo-500/40 text-white rounded-lg shadow-xl px-2 py-1 z-[9999] transition-all duration-200 backdrop-blur-sm pointer-events-auto select-none scale-75 origin-top-right">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onMoveItem?.(sid, originalIndex, 'up');
                }}
                disabled={originalIndex === 0}
                className="p-1 hover:bg-white/10 rounded transition-colors text-slate-200 hover:text-white disabled:opacity-30 disabled:pointer-events-none"
                title="Move Up"
              >
                <ChevronUp size={11} strokeWidth={2.5} />
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onMoveItem?.(sid, originalIndex, 'down');
                }}
                disabled={originalIndex === safeItems.length - 1}
                className="p-1 hover:bg-white/10 rounded transition-colors text-slate-200 hover:text-white disabled:opacity-30 disabled:pointer-events-none"
                title="Move Down"
              >
                <ChevronDown size={11} strokeWidth={2.5} />
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onOpenStylePopup?.(sid, originalIndex);
                }}
                className="p-1 hover:bg-white/10 rounded transition-colors text-slate-200 hover:text-white"
                title="Customize Style"
              >
                <PenTool size={11} strokeWidth={2.5} />
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDeleteItem?.(sid, originalIndex);
                }}
                className="p-1 hover:bg-red-950/80 hover:border-red-500/30 rounded transition-colors text-red-400 hover:text-red-300 border border-transparent"
                title="Delete Item"
              >
                <Trash size={11} strokeWidth={2.5} />
              </button>
            </div>
          )} */}
          {/* Content scaled styles wrapper */}
          <div style={{
            fontSize: overrides.fontSize !== undefined ? `${overrides.fontSize}px` : 'inherit',
            fontWeight: overrides.fontWeight || 'inherit',
            fontStyle: overrides.fontStyle || 'inherit',
            textDecoration: overrides.textDecoration || 'inherit',
            color: overrides.color || 'inherit',
            fontFamily: overrides.fontFamily || 'inherit',
            textAlign: (overrides.textAlign as any) || 'inherit',
          }}>
            {children}
          </div>
        </div>
      );
    };

    return (
      <div style={{
        marginBottom: `${design.sectionSpacing ?? 8}mm`,
        breakInside: 'avoid',
        pageBreakInside: 'avoid',
      }}>
        <div className="measure-header" data-sid={sid}>
          <SectionHeader
            title={displayTitle}
            style={getStyle(layout === 'sidebar')}
            headingStyle={headingMeta.headingStyleId}
            lineColor={headingMeta.lineColor}
            lineThick={headingMeta.lineThick}
            lineWidth={headingMeta.lineWidth}
            editPath={isFirstChunk ? `design.sectionTitles.${sid}` : undefined}
            editValue={baseSectionTitle}
            editLabel="Section Heading"
            textStylePath={`sectionTitle.${sid}.text`}
            wrapperStylePath={`sectionTitle.${sid}.block`}
            overrides={data.styleOverrides}
          />
        </div>

        {styleType === 'compact' ? (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 opacity-80 font-medium" style={{ fontSize: '11px' }}>
            {filteredItems.map(({ item, index: originalIndex }, i) => {
              const editMeta = getItemEditMeta(item, originalIndex);
              return (
                <React.Fragment key={i}>
                  <GridEntryContainer originalIndex={originalIndex} className="w-auto">
                    <span
                      className="measure-item animate-none"
                      data-sid={sid}
                      data-index={originalIndex}
                      data-edit-path={editMeta.path}
                      data-edit-label={editMeta.label}
                      data-edit-value={editMeta.value}
                      data-edit-composite={editMeta.composite || ''}
                      data-style-path={`content.${sid}[${originalIndex}]`}
                    >
                      {isLanguages ? getLanguageLabel(item) : getItemLabel(item)}
                    </span>
                  </GridEntryContainer>
                  {i < filteredItems.length - 1 && <span className="opacity-30 mx-1">•</span>}
                </React.Fragment>
              );
            })}
          </div>
        ) : styleType === 'bubble' ? (
          <div className="flex flex-wrap gap-1.5">
            {filteredItems.map(({ item, index: originalIndex }, i) => {
              const editMeta = getItemEditMeta(item, originalIndex);
              return (
                <GridEntryContainer key={i} originalIndex={originalIndex} className="w-auto">
                  <span
                    className="px-2.5 py-0.5 rounded-full font-semibold opacity-80 measure-item block text-center"
                    data-sid={sid}
                    data-index={originalIndex}
                    data-edit-path={editMeta.path}
                    data-edit-label={editMeta.label}
                    data-edit-value={editMeta.value}
                    data-edit-composite={editMeta.composite || ''}
                    data-style-path={`content.${sid}[${originalIndex}]`}
                    style={{ fontSize: '10px', color: getAccentColor('dots'), backgroundColor: `${design.primaryColor || '#ff4d7d'}12`, border: `1px solid ${design.primaryColor || '#ff4d7d'}25` }}
                  >
                    {isLanguages ? getLanguageLabel(item) : getItemLabel(item)}
                  </span>
                </GridEntryContainer>
              );
            })}
          </div>
        ) : styleType === 'level' ? (
          <div className={`grid gap-x-4 gap-y-2`} style={{ gridTemplateColumns: layout === 'sidebar' ? '1fr' : `repeat(${columns}, minmax(0, 1fr))` }}>
            {filteredItems.map(({ item, index: originalIndex }, i) => {
              const level = getLevel(item);
              const editMeta = getItemEditMeta(item, originalIndex);
              return (
                <GridEntryContainer key={i} originalIndex={originalIndex}>
                  <div
                    className="space-y-1 measure-item"
                    data-sid={sid}
                    data-index={originalIndex}
                    data-edit-path={editMeta.path}
                    data-edit-label={editMeta.label}
                    data-edit-value={editMeta.value}
                    data-edit-composite={editMeta.composite || ''}
                    data-style-path={`content.${sid}[${originalIndex}]`}
                  >
                    <div className="flex justify-between items-center font-semibold opacity-80" style={{ fontSize: '11px' }}>
                      <span>{getItemLabel(item)}</span>
                      {isLanguages && typeof item === 'object' && item !== null && 'language' in item && 'proficiency' in item && <span className="opacity-40" style={{ fontSize: '10px' }}>{(item as any).proficiency}</span>}
                    </div>
                    <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${isExporting ? '' : 'transition-all'}`} style={{ width: `${level}%`, backgroundColor: design.primaryColor || '#ff4d7d' }} />
                    </div>
                  </div>
                </GridEntryContainer>
              );
            })}
          </div>
        ) : (
          /* Default: GRID */
          <div className={`grid gap-x-3 gap-y-1`} style={{ gridTemplateColumns: layout === 'sidebar' ? '1fr' : `repeat(${columns}, minmax(0, 1fr))` }}>
            {filteredItems.map(({ item, index: originalIndex }, i) => {
              const editMeta = getItemEditMeta(item, originalIndex);
              return (
                <GridEntryContainer key={i} originalIndex={originalIndex}>
                  <div
                    className="flex items-center gap-1.5 font-medium opacity-80 measure-item"
                    data-sid={sid}
                    data-index={originalIndex}
                    data-edit-path={editMeta.path}
                    data-edit-label={editMeta.label}
                    data-edit-value={editMeta.value}
                    data-edit-composite={editMeta.composite || ''}
                    data-style-path={`content.${sid}[${originalIndex}]`}
                    style={{ fontSize: '11px' }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: design.primaryColor || '#ff4d7d' }} />
                    <span>{isLanguages ? getLanguageLabel(item) : getItemLabel(item)}</span>
                  </div>
                </GridEntryContainer>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  type ResumeItem = {
    t: string;
    s?: string;
    d?: string;
    desc?: string;

    tPath?: string;
    sPath?: string;
    dPath?: string;
    descPath?: string;
  };

  type ListProps = {
    title: string;
    section: string;
    items: ResumeItem[];
  };

  const safeArr = (v: any): any[] =>
    Array.isArray(v) ? v : [];

  /* ======================================================
     ALL SECTION CONFIG
  ====================================================== */

  const SECTION_CONFIG: Record<string, any> = {
    experience: {
      title: 'Experience',

      map: (x: any, i: number): ResumeItem => ({
        t: x.position || '',
        s: x.company || '',
        d: `${x.startDate || ''}${x.endDate ? ` — ${x.endDate}` : ''}`,
        desc: x.description || '',

        tPath: `content.experience[${i}].position`,
        sPath: `content.experience[${i}].company`,
        dPath: `content.experience[${i}].startDate`,
        descPath: `content.experience[${i}].description`,
      }),
    },

    education: {
      title: 'Education',

      map: (x: any, i: number): ResumeItem => ({
        t:
          design.educationOrder === 'school-degree'
            ? x.school
            : x.degree,

        s:
          design.educationOrder === 'school-degree'
            ? `${x.degree || ''} ${x.field ? `in ${x.field}` : ''}`
            : x.school,

        d: x.graduationYear || '',
        desc: x.description || '',

        tPath: `content.education[${i}].${design.educationOrder === 'school-degree'
          ? 'school'
          : 'degree'
          }`,

        sPath: `content.education[${i}].${design.educationOrder === 'school-degree'
          ? 'degree'
          : 'school'
          }`,

        dPath: `content.education[${i}].graduationYear`,
        descPath: `content.education[${i}].description`,
      }),
    },

    projects: {
      title: 'Projects',

      map: (x: any, i: number): ResumeItem => ({
        t: x.name || '',

        s: Array.isArray(x.technologies)
          ? x.technologies.join(', ')
          : x.technologies || '',

        d: '',
        desc: x.description || '',

        tPath: `content.projects[${i}].name`,
        sPath: `content.projects[${i}].technologies`,
        descPath: `content.projects[${i}].description`,
      }),
    },

    awards: {
      title: 'Awards',

      map: (x: any, i: number): ResumeItem => ({
        t: x.title || '',
        s: x.issuer || '',
        d: x.date || '',
        desc: x.description || '',

        tPath: `content.awards[${i}].title`,
        sPath: `content.awards[${i}].issuer`,
        dPath: `content.awards[${i}].date`,
        descPath: `content.awards[${i}].description`,
      }),
    },

    courses: {
      title: 'Courses',

      map: (x: any, i: number): ResumeItem => ({
        t: x.title || '',
        s: x.provider || '',
        d: x.date || '',
        desc: x.description || '',

        tPath: `content.courses[${i}].title`,
        sPath: `content.courses[${i}].provider`,
        dPath: `content.courses[${i}].date`,
        descPath: `content.courses[${i}].description`,
      }),
    },

    organisations: {
      title: 'Organisations',

      map: (x: any, i: number): ResumeItem => ({
        t: x.name || '',
        s: x.role || '',
        d: `${x.startDate || ''}${x.endDate ? ` — ${x.endDate}` : ''}`,
        desc: x.description || '',

        tPath: `content.organisations[${i}].name`,
        sPath: `content.organisations[${i}].role`,
        dPath: `content.organisations[${i}].startDate`,
        descPath: `content.organisations[${i}].description`,
      }),
    },

    publications: {
      title: 'Publications',

      map: (x: any, i: number): ResumeItem => ({
        t: x.title || '',
        s: x.publisher || '',
        d: x.date || '',
        desc: x.description || '',

        tPath: `content.publications[${i}].title`,
        sPath: `content.publications[${i}].publisher`,
        dPath: `content.publications[${i}].date`,
        descPath: `content.publications[${i}].description`,
      }),
    },

    references: {
      title: 'References',

      map: (x: any, i: number): ResumeItem => ({
        t: x.name || '',

        s: `${x.position || ''} ${x.company ? `at ${x.company}` : ''
          }`,

        d: '',

        desc: `${x.email || ''} ${x.phone || ''}`,

        tPath: `content.references[${i}].name`,
        sPath: `content.references[${i}].position`,
        descPath: `content.references[${i}].email`,
      }),
    },

    custom: {
      title: 'Custom Section',

      map: (x: any, i: number): ResumeItem => ({
        t: x.title || '',
        s: '',
        d: '',
        desc: x.content || '',

        tPath: `content.custom[${i}].title`,
        descPath: `content.custom[${i}].content`,
      }),
    },
  };

  /* ======================================================
     MAIN FUNCTION
  ====================================================== */

  const getSectionListProps = (
    sid: string,
    content: any
  ): ListProps => {
    const config = SECTION_CONFIG[sid];

    if (!config) {
      return {
        title: '',
        section: sid,
        items: [],
      };
    }

    return {
      title: config.title,
      section: sid,
      items: safeArr(content?.[sid]).map(config.map),
    };
  };

  /* ======================================================
     FINAL USE
  ====================================================== */

  const listProps = getSectionListProps(
    sid,
    content
  );
  if (!listProps.items || listProps.items.length === 0) return null;

  const filteredListItems = itemIndices
    ? listProps.items.filter((_, idx) => itemIndices.includes(idx))
    : listProps.items;

  if (!filteredListItems.length) return null;

  const titleSize = design.entryTitleSize === 's' ? '11px' : design.entryTitleSize === 'm' ? '12px' : '13px';
  const subtitleStyle = design.entrySubtitleStyle || 'medium';
  const subtitlePlacement = design.entrySubtitlePlacement || 'next-line';

  const isFirstChunk = !itemIndices || itemIndices.includes(0);
  const baseSectionTitle = getSectionTitle(sid, listProps.title);
  const displayTitle = `${baseSectionTitle}${isFirstChunk ? '' : ' (Continued)'}`;

  return (
    <div style={{
      marginBottom: `${design.sectionSpacing ?? 8}mm`,
      breakInside: 'avoid',
      pageBreakInside: 'avoid',
    }}>
      <div className="measure-header" data-sid={sid}>
        <SectionHeader
          title={displayTitle}
          style={layout === 'single' ? { ...getStyle(false), textAlign: design.personalAlign ?? 'left', width: '100%', display: 'block' } : getStyle(layout === 'sidebar')}
          headingStyle={headingMeta.headingStyleId}
          lineColor={headingMeta.lineColor}
          lineThick={headingMeta.lineThick}
          lineWidth={headingMeta.lineWidth}
          editPath={isFirstChunk ? `design.sectionTitles.${sid}` : undefined}
          editValue={baseSectionTitle}
          editLabel="Section Heading"
          textStylePath={`sectionTitle.${sid}.text`}
          wrapperStylePath={`sectionTitle.${sid}.block`}
          overrides={data.styleOverrides}
        />
      </div>
      <div style={{ display: 'block' }}>
        {filteredListItems.map((item: any, i: number) => {
          const originalIndex = itemIndices ? itemIndices[i] : i;
          const entryMargin = `${Math.min(8, Math.max(1, design.entrySpacing ?? 4))}mm`;
          const overrides: any = data.styleOverrides?.[`content.${sid}[${originalIndex}]`] || {};
          const EntryContainer = ({ children }: { children: React.ReactNode }) => {

            return (
              <div
                key={originalIndex}
                className="measure-item group/item relative transition-all duration-200"
                data-sid={sid}
                data-index={originalIndex}
                style={{
                  display: 'block',
                  breakInside: 'avoid',
                  pageBreakInside: 'avoid',
                  marginBottom: overrides.marginBottom !== undefined ? `${overrides.marginBottom}px` : entryMargin,
                  borderStyle: overrides.borderStyle || 'none',
                  borderColor: overrides.borderColor || 'transparent',
                  borderWidth: overrides.borderWidth !== undefined ? `${overrides.borderWidth}px` : '0px',
                  padding: overrides.padding !== undefined ? `${overrides.padding}px` : '0px',
                  backgroundColor: overrides.backgroundColor || 'transparent',
                  borderRadius: overrides.borderRadius !== undefined ? `${overrides.borderRadius}px` : '0px',
                  boxShadow: overrides.boxShadow || 'none',
                  color: overrides.textColor || 'inherit',
                  transition: 'all 0.2s ease',
                }}
              >
                {/* Hover controls overlay */}
                {/* {!isExporting && !isThumbnail && !isMeasuring && (
                  <div className="absolute -top-3.5 -right-1 hidden group-hover/item:flex items-center gap-1.5 bg-indigo-950/95 border border-indigo-500/40 text-white rounded-lg shadow-xl px-2 py-1 z-[9999] transition-all duration-200 backdrop-blur-sm pointer-events-auto select-none">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onMoveItem?.(sid, originalIndex, 'up');
                      }}
                      disabled={originalIndex === 0}
                      className="p-1 hover:bg-white/10 rounded transition-colors text-slate-200 hover:text-white disabled:opacity-30 disabled:pointer-events-none"
                      title="Move Up"
                    >
                      <ChevronUp size={11} strokeWidth={2.5} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onMoveItem?.(sid, originalIndex, 'down');
                      }}
                      disabled={originalIndex === listProps.items.length - 1}
                      className="p-1 hover:bg-white/10 rounded transition-colors text-slate-200 hover:text-white disabled:opacity-30 disabled:pointer-events-none"
                      title="Move Down"
                    >
                      <ChevronDown size={11} strokeWidth={2.5} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onOpenStylePopup?.(sid, originalIndex);
                      }}
                      className="p-1 hover:bg-white/10 rounded transition-colors text-slate-200 hover:text-white"
                      title="Customize Style"
                    >
                      <PenTool size={11} strokeWidth={2.5} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onDeleteItem?.(sid, originalIndex);
                      }}
                      className="p-1 hover:bg-red-950/80 hover:border-red-500/30 rounded transition-colors text-red-400 hover:text-red-300 border border-transparent"
                      title="Delete Item"
                    >
                      <Trash size={11} strokeWidth={2.5} />
                    </button>
                  </div>
                )} */}
                {/* Content scaled styles wrapper */}
                <div style={{ fontSize: overrides.fontSize !== undefined ? `${overrides.fontSize}px` : 'inherit' }}>
                  {children}
                </div>
              </div>
            );
          };

          if (design.entryLayout === 'side-date') {
            return (
              <EntryContainer key={originalIndex}>
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-3 text-right">
                    <span
                      className="font-semibold opacity-40 uppercase tabular-nums"
                      style={{
                        fontSize: '10px',
                        color: getAccentColor('dates')
                      }}
                      data-edit-path={item.dPath || ''}
                      data-style-path={`content.${sid}[${originalIndex}]`}
                      data-edit-label="Date"
                      data-edit-value={item.d || ''}
                    >
                      {item.d}
                    </span>                  </div>
                  <div className="col-span-9">
                    <h3
                      style={getElementStyle(item.tPath || '', {
                        fontSize: titleSize,
                        color: overrides.textColor || getAccentColor('name'),
                        fontWeight: overrides.titleWeight || '700'
                      })}
                      data-edit-path={item.tPath || ''}
                      data-style-path={`content.${sid}[${originalIndex}]`}
                      data-edit-label="Title"
                      data-edit-value={item.t || ''}
                    >
                      {item.t}
                    </h3>
                    {item.s && (
                      <p
                        className={`${subtitleStyle === 'bold'
                          ? 'font-bold text-slate-800'
                          : subtitleStyle === 'italic'
                            ? 'italic'
                            : 'font-medium text-slate-600'
                          } opacity-80`}
                        style={getElementStyle(item.sPath || '', {
                          fontSize: '11px',
                          color: getAccentColor('entrySubtitle')
                        })}
                        data-edit-path={item.sPath || ''}
                        data-style-path={`content.${sid}[${originalIndex}]`}
                        data-edit-label="Subtitle"
                        data-edit-value={item.s || ''}
                      >
                        {item.s}
                      </p>
                    )}
                    <RichContent html={item.desc} className={`leading-relaxed opacity-75 mt-1 ${design.descriptionIndent ? 'pl-3 border-l-2 border-slate-100' : ''}`} style={{ fontSize: '11px' } as any} path={item.descPath} overrides={data.styleOverrides} />
                  </div>
                </div>
              </EntryContainer>
            );
          }

          if (design.entryLayout === 'split') {
            return (
              <EntryContainer key={originalIndex}>
                <div className="flex justify-between gap-3">
                  <div className="flex-1">
                    <h3
                      style={getElementStyle(item.tPath || '', {
                        fontSize: titleSize,
                        color: overrides.textColor || getAccentColor('name'),
                        fontWeight: overrides.titleWeight || '700'
                      })}
                      data-edit-path={item.tPath || ''}
                      data-style-path={`content.${sid}[${originalIndex}]`}
                      data-edit-label="Title"
                      data-edit-value={item.t || ''}
                    >
                      {item.t}
                    </h3>
                    {item.s && (
                      <p
                        className={`${subtitleStyle === 'bold'
                          ? 'font-bold text-slate-800'
                          : subtitleStyle === 'italic'
                            ? 'italic'
                            : 'font-medium text-slate-600'
                          } opacity-80`}
                        style={getElementStyle(item.sPath || '', {
                          fontSize: '11px',
                          color: getAccentColor('entrySubtitle')
                        })}
                        data-edit-path={item.sPath || ''}
                        data-style-path={`content.${sid}[${originalIndex}]`}
                        data-edit-label="Subtitle"
                        data-edit-value={item.s || ''}
                      >
                        {item.s}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className="font-semibold opacity-40 uppercase tabular-nums"
                      style={{
                        fontSize: '10px',
                        color: getAccentColor('dates')
                      }}
                      data-edit-path={item.dPath || ''}
                      data-style-path={`content.${sid}[${originalIndex}]`}
                      data-edit-label="Date"
                      data-edit-value={item.d || ''}
                    >
                      {item.d}
                    </span>                  </div>
                </div>
                <RichContent html={item.desc} className={`leading-relaxed opacity-75 mt-1 ${design.descriptionIndent ? 'pl-3 border-l-2 border-slate-100' : ''}`} style={{ fontSize: '11px' } as any} path={item.descPath} overrides={data.styleOverrides} />
              </EntryContainer>
            );
          }

          return (
            <EntryContainer key={originalIndex}>
              <div className={`flex ${subtitlePlacement === 'same-line' ? 'items-baseline gap-2' : 'flex-col'} justify-between`}>
                <div className="flex justify-between items-baseline flex-1">
                  <h3
                    style={getElementStyle(item.tPath || '', {
                      fontSize: titleSize,
                      color: overrides.textColor || getAccentColor('name'),
                      fontWeight: overrides.titleWeight || '700'
                    })}
                    data-edit-path={item.tPath || ''}
                    data-style-path={`content.${sid}[${originalIndex}]`}
                    data-edit-label="Title"
                    data-edit-value={item.t || ''}
                  >
                    {item.t}
                  </h3>
                  {subtitlePlacement === 'same-line' && item.s && <span className="mx-1.5 opacity-20 text-slate-300">•</span>}
                  {subtitlePlacement === 'same-line' && item.s && (
                    <span
                      className={`${subtitleStyle === 'bold' ? 'font-bold text-slate-800' : subtitleStyle === 'italic' ? 'italic' : 'font-medium text-slate-600'} opacity-80 flex-1`}
                      style={getElementStyle(item.sPath || '', { fontSize: '11px', color: getAccentColor('entrySubtitle') })}
                      data-edit-path={item.sPath || ''}
                      data-edit-label="Subtitle"
                      data-edit-value={item.s || ''}
                    >{item.s}</span>
                  )}
                  <span
                    className="font-semibold opacity-40 uppercase tabular-nums"
                    style={{
                      fontSize: '10px',
                      color: getAccentColor('dates')
                    }}
                    data-edit-path={item.dPath || ''}
                    data-style-path={`content.${sid}[${originalIndex}]`}
                    data-edit-label="Date"
                    data-edit-value={item.d || ''}
                  >
                    {item.d}
                  </span>                </div>
                {subtitlePlacement === 'next-line' && item.s && (
                  <p
                    className={`${subtitleStyle === 'bold' ? 'font-bold text-slate-800' : subtitleStyle === 'italic' ? 'italic' : 'font-medium text-slate-600'} opacity-80 mt-0.5`}
                    style={getElementStyle(item.sPath || '', { fontSize: '11px', color: getAccentColor('entrySubtitle') })}
                    data-edit-path={item.sPath || ''}
                    data-edit-label="Subtitle"
                    data-edit-value={item.s || ''}
                  >{item.s}</p>
                )}
              </div>
              <RichContent html={item.desc} className={`leading-relaxed opacity-75 mt-1 ${design.descriptionIndent ? 'pl-3 border-l-2 border-slate-100' : ''}`} style={{ fontSize: '11px' } as any} path={item.descPath} overrides={data.styleOverrides} />
            </EntryContainer>
          );
        })}
      </div>
    </div>
  );
};

/* --- Sub-layouts --- */

interface SubLayoutProps {
  data: ResumeData;
  getSectionStyle: (s?: boolean) => React.CSSProperties;
  isThumbnail?: boolean;
  isExporting?: boolean;
  selectedSectionId?: string | null;
  onSelectSection?: (sid: string) => void;
  getAccentColor: any;
  getHeadingMeta: any;
  pageNum: number;
  pageBlocks: PageData;
  onMoveItem?: (sid: string, index: number, direction: 'up' | 'down') => void;
  onDeleteItem?: (sid: string, index: number) => void;
  onOpenStylePopup?: (sid: string, index: number) => void;
}

const SidebarLayout = ({ data, getSectionStyle, isThumbnail, isExporting, selectedSectionId, onSelectSection, getAccentColor, getHeadingMeta, pageNum, pageBlocks, onMoveItem, onDeleteItem, onOpenStylePopup }: SubLayoutProps) => {
  const design = data.design || {} as any;
  const content = data.content || {} as any;
  const personalInfo = content.personalInfo || {} as any;
  const isRight = design.layout?.includes('sidebar-right');
  const isFirstPage = pageNum === 1;

  const sidebarWidth = design.layout?.includes('wide') ? '40%' : design.layout?.includes('narrow') ? '25%' : '32%';

  const sidebarBlocks = pageBlocks?.sidebar || [];
  const mainBlocks = pageBlocks?.main || [];

  return (
    <div
      style={{
        height: '100%',
        display: 'block',
        position: 'relative',
      }}
    >
      {/* Sidebar column — floated */}
      <div
        style={{
          float: isRight ? 'right' : 'left',
          width: sidebarWidth,
          height: '100%',
          backgroundColor: design.secondaryColor || '#f8fafc',
          borderRight: isRight ? 'none' : '1px solid rgba(0,0,0,0.05)',
          borderLeft: isRight ? '1px solid rgba(0,0,0,0.05)' : 'none',
          padding: isThumbnail ? '16px' : '24px',
          boxSizing: 'border-box',
        }}
      >
        {isFirstPage && (
          <div className={`flex flex-col ${design.personalAlign === 'center' ? 'items-center text-center' : design.personalAlign === 'right' ? 'items-end text-right' : 'items-start text-left'} ${isThumbnail ? 'gap-3' : 'gap-4'} mb-6`}>
            {design.photoShow && personalInfo.image && (
              <div
                className={`${isThumbnail ? 'w-24 h-24' : 'w-28 h-28'} bg-white border-2 shadow-lg flex items-center justify-center overflow-hidden transition-all`}
                style={{
                  borderColor: design.primaryColor || '#ff4d7d',
                  borderRadius: design.photoShape === 'circle' ? '50%' : design.photoShape === 'rounded' ? '8px' : design.photoShape === 'hexagon' ? '8px' : '0'
                }}
              >
                <img src={personalInfo.image} className={`w-full h-full object-cover ${design.photoGrayscale ? 'grayscale' : ''}`} />
              </div>
            )}
            <div className="space-y-1">
              <h1
                className={`${design.nameBold ? 'font-black' : 'font-medium'} leading-tight tracking-tight`}
                style={{ color: getAccentColor('name'), fontSize: design.nameSize === 'xl' ? '22px' : design.nameSize === 'l' ? '20px' : design.nameSize === 's' ? '15px' : design.nameSize === 'xs' ? '13px' : '18px' }}
                data-edit-path="content.personalInfo.fullName"
                data-edit-label="Name"
                data-edit-value={personalInfo.fullName || ''}
              >
                {personalInfo.fullName || 'Name'}
              </h1>
              <p
                className="font-bold opacity-60 uppercase tracking-[0.1em]"
                style={{ fontSize: '10px', color: getAccentColor('jobTitle') }}
                data-edit-path="content.personalInfo.professionalTitle"
                data-edit-label="Job Title"
                data-edit-value={personalInfo.professionalTitle || ''}
              >
                {personalInfo.professionalTitle || ''}
              </p>
            </div>

            <div className="space-y-3 w-full">
              <h2 className="font-bold uppercase tracking-[0.15em] opacity-50 border-b pb-1 w-full" style={{ fontSize: '10px', borderColor: `${design.primaryColor || '#ff4d7d'}20`, color: getAccentColor('headings') }}>Contact</h2>
              <div className="space-y-2 font-semibold opacity-80" style={{ fontSize: '10px' }}>
                {personalInfo.email && <div className="flex items-center gap-2" style={{ color: getAccentColor('contactIcon') }}><Mail size={10} strokeWidth={2.5} /> <span className="text-slate-600 truncate" data-edit-path="content.personalInfo.email" data-edit-label="Email" data-edit-value={personalInfo.email}>{personalInfo.email}</span></div>}
                {personalInfo.phone && <div className="flex items-center gap-2" style={{ color: getAccentColor('contactIcon') }}><Phone size={10} strokeWidth={2.5} /> <span className="text-slate-600 truncate" data-edit-path="content.personalInfo.phone" data-edit-label="Phone" data-edit-value={personalInfo.phone}>{personalInfo.phone}</span></div>}
                {personalInfo.location && <div className="flex items-center gap-2" style={{ color: getAccentColor('contactIcon') }}><MapPin size={10} strokeWidth={2.5} /> <span className="text-slate-600 truncate" data-edit-path="content.personalInfo.location" data-edit-label="Location" data-edit-value={personalInfo.location}>{personalInfo.location}</span></div>}
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          <Droppable droppableId={`page-sidebar-${pageNum}`}>
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} style={{ display: 'block', minHeight: '50px' }}>
                {sidebarBlocks.map((block, idx) => (
                  <SortableSection
                    key={`${block.sid}-${pageNum}-${idx}`}
                    id={block.sid}
                    pageNum={pageNum}
                    index={idx}
                    isSelected={!isThumbnail && !isExporting && selectedSectionId === block.sid}
                    onSelect={!isThumbnail && !isExporting ? () => onSelectSection?.(block.sid) : undefined}
                  >
                    <DynamicSectionRenderer sid={block.sid} data={{ ...data, design, content }} layout="sidebar" getStyle={getSectionStyle} getAccentColor={getAccentColor} getHeadingMeta={getHeadingMeta} isExporting={isExporting} itemIndices={block.itemIndices} onMoveItem={onMoveItem} onDeleteItem={onDeleteItem} onOpenStylePopup={onOpenStylePopup} isThumbnail={isThumbnail} />
                  </SortableSection>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      </div>

      {/* Main column */}
      <div
        style={{
          marginLeft: isRight ? '0' : sidebarWidth,
          marginRight: isRight ? sidebarWidth : '0',
          padding: isThumbnail ? '16px' : '24px',
          boxSizing: 'border-box',
          height: '100%',
        }}
      >
        <Droppable droppableId={`page-main-${pageNum}`}>
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} style={{ display: 'block', minHeight: '50px' }}>
              {mainBlocks.map((block, idx) => (
                <SortableSection
                  key={`${block.sid}-${pageNum}-${idx}`}
                  id={block.sid}
                  pageNum={pageNum}
                  index={idx}
                  isSelected={!isThumbnail && !isExporting && selectedSectionId === block.sid}
                  onSelect={!isThumbnail && !isExporting ? () => onSelectSection?.(block.sid) : undefined}
                >
                  <DynamicSectionRenderer sid={block.sid} data={{ ...data, design, content }} layout="single" getStyle={getSectionStyle} getAccentColor={getAccentColor} getHeadingMeta={getHeadingMeta} isExporting={isExporting} itemIndices={block.itemIndices} onMoveItem={onMoveItem} onDeleteItem={onDeleteItem} onOpenStylePopup={onOpenStylePopup} isThumbnail={isThumbnail} />
                </SortableSection>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
      {/* Clearfix for float layout */}
      <div style={{ clear: 'both' }} />
    </div>
  );
};

const ModernHeaderLayout = ({ data, getSectionStyle, isThumbnail, isExporting, selectedSectionId, onSelectSection, getAccentColor, getHeadingMeta, pageNum, pageBlocks, onMoveItem, onDeleteItem, onOpenStylePopup }: SubLayoutProps) => {
  const design = data.design || {} as any;
  const content = data.content || {} as any;
  const personalInfo = content.personalInfo || {} as any;
  const isFirstPage = pageNum === 1;
  const blocks = pageBlocks?.main || [];

  const isDarkHeader = design.layout === 'modern-header-dark';
  const isSplitHeader = design.layout === 'modern-header-split';

  return (
    <div className="flex flex-col w-full h-full">
      {isFirstPage && (
        <div
          className={`flex ${isSplitHeader ? 'flex-row justify-between items-center' : 'flex-col'} py-10 px-8 border-b border-slate-100/50 ${!isSplitHeader && design.personalAlign === 'center' ? 'items-center text-center' : !isSplitHeader && design.personalAlign === 'right' ? 'items-end text-right' : 'items-start text-left'}`}
          style={{
            backgroundColor: isDarkHeader ? (design.primaryColor || '#ff4d7d') : (design.secondaryColor || '#f8fafc'),
            color: isDarkHeader ? '#ffffff' : 'inherit',
            marginBottom: `${design.sectionSpacing || 8}mm`
          }}
        >
          <div className={`flex ${isSplitHeader ? 'flex-row items-center gap-6' : 'flex-col items-inherit'}`}>
            {design.photoShow && personalInfo.image && (
              <div
                className="w-24 h-24 overflow-hidden border-2 shadow-lg shrink-0"
                style={{
                  borderColor: isDarkHeader ? '#ffffff' : (design.primaryColor || '#ff4d7d'),
                  borderRadius: design.photoShape === 'circle' ? '50%' : design.photoShape === 'rounded' ? '8px' : '0',
                  marginBottom: isSplitHeader ? '0' : '16px'
                }}
              >
                <img src={personalInfo.image} className={`w-full h-full object-cover ${design.photoGrayscale ? 'grayscale' : ''}`} />
              </div>
            )}
            <div>
              <h1 className={`${design.nameBold ? 'font-black' : 'font-medium'} mb-1 capitalize tracking-tight leading-none`} style={{ color: isDarkHeader ? '#ffffff' : getAccentColor('name'), fontSize: design.nameSize === 'xl' ? '28px' : design.nameSize === 'l' ? '24px' : design.nameSize === 's' ? '18px' : design.nameSize === 'xs' ? '15px' : '22px' }}>{personalInfo.fullName || 'Name'}</h1>
              <p className="font-bold opacity-75 uppercase tracking-[0.15em]" style={{ fontSize: '10px', color: isDarkHeader ? '#e2e8f0' : getAccentColor('jobTitle') }}>{personalInfo.professionalTitle || ''}</p>
            </div>
          </div>

          <div className={`flex ${isSplitHeader ? 'flex-col items-end gap-1.5' : 'flex-wrap gap-x-6 gap-y-1.5 mt-4'} font-semibold opacity-85`} style={{ fontSize: '10px' }}>
            {personalInfo.email && <div className="flex items-center gap-1.5" style={{ color: isDarkHeader ? '#ffffff' : getAccentColor('contactIcon') }}><Mail size={10} strokeWidth={2.5} /> <span className={isDarkHeader ? 'text-white' : 'text-slate-900'}>{personalInfo.email}</span></div>}
            {personalInfo.phone && <div className="flex items-center gap-1.5" style={{ color: isDarkHeader ? '#ffffff' : getAccentColor('contactIcon') }}><Phone size={10} strokeWidth={2.5} /> <span className={isDarkHeader ? 'text-white' : 'text-slate-900'}>{personalInfo.phone}</span></div>}
            {personalInfo.location && <div className="flex items-center gap-1.5" style={{ color: isDarkHeader ? '#ffffff' : getAccentColor('contactIcon') }}><MapPin size={10} strokeWidth={2.5} /> <span className={isDarkHeader ? 'text-white' : 'text-slate-900'}>{personalInfo.location}</span></div>}
          </div>
        </div>
      )}

      <div className="flex-1 w-full pt-0">
        <Droppable droppableId={`page-main-${pageNum}`}>
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} style={{ display: 'block', minHeight: '50px' }} className="flex-1">
              {blocks.map((block, idx) => (
                <SortableSection
                  key={`${block.sid}-${pageNum}-${idx}`}
                  id={block.sid}
                  pageNum={pageNum}
                  index={idx}
                  isSelected={!isThumbnail && !isExporting && selectedSectionId === block.sid}
                  onSelect={!isThumbnail && !isExporting ? () => onSelectSection?.(block.sid) : undefined}
                >
                  <DynamicSectionRenderer sid={block.sid} data={{ ...data, design, content }} layout="modern" getStyle={getSectionStyle} getAccentColor={getAccentColor} getHeadingMeta={getHeadingMeta} isExporting={isExporting} itemIndices={block.itemIndices} onMoveItem={onMoveItem} onDeleteItem={onDeleteItem} onOpenStylePopup={onOpenStylePopup} isThumbnail={isThumbnail} />
                </SortableSection>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    </div>
  );
};

const SingleColumnLayout = ({ data, getSectionStyle, isThumbnail, isExporting, selectedSectionId, onSelectSection, getAccentColor, getHeadingMeta, pageNum, pageBlocks, onMoveItem, onDeleteItem, onOpenStylePopup }: SubLayoutProps) => {
  const design = data.design || {} as any;
  const content = data.content || {} as any;
  const personalInfo = content.personalInfo || {} as any;
  const isFirstPage = pageNum === 1;
  const blocks = pageBlocks?.main || [];

  const layout = design.layout || 'single';
  const isCentered = layout === 'single-centered';
  const isCompact = layout === 'single-compact';
  const isMinimal = layout === 'single-minimal';
  const isTwoColumn = layout === 'two-column' || layout === 'two-column-reverse';
  const isTimeline = layout === 'timeline' || layout === 'timeline-left';
  const isCard = layout === 'card-header';

  const alignClass = isCentered ? 'items-center text-center' : design.personalAlign === 'center' ? 'items-center text-center' : design.personalAlign === 'right' ? 'items-end text-right' : 'items-start text-left';
  const justifyClass = isCentered ? 'justify-center' : design.personalAlign === 'center' ? 'justify-center' : design.personalAlign === 'right' ? 'justify-end' : 'justify-start';

  const renderedBlocks = layout === 'two-column-reverse' ? [...blocks].reverse() : blocks;

  return (
    <div className="flex flex-col w-full h-full">
      {isFirstPage && (
        <div className={`flex flex-col space-y-3 relative pb-6 w-full ${alignClass}`} style={{ marginBottom: `${isCompact ? 4 : Math.min(16, Math.max(4, design.sectionSpacing || 8))}mm` }}>
          {!isMinimal && (
            <div className={`absolute bottom-0 w-32 h-1 ${isCentered ? 'left-1/2 -translate-x-1/2' : design.personalAlign === 'center' ? 'left-1/2 -translate-x-1/2' : design.personalAlign === 'right' ? 'right-0' : 'left-0'}`} style={{ backgroundColor: design.primaryColor || 'black' }} />
          )}
          {isMinimal && (
            <div className="absolute bottom-0 w-full h-[1px] bg-slate-100/60" />
          )}

          {design.photoShow && personalInfo.image && (
            <div
              className={`${isThumbnail ? 'w-24 h-24' : 'w-28 h-28'} bg-white border-2 shadow-lg flex items-center justify-center overflow-hidden transition-all mb-2`}
              style={{
                borderColor: design.primaryColor || 'black',
                borderRadius: design.photoShape === 'circle' ? '50%' : design.photoShape === 'rounded' ? '8px' : '0'
              }}
            >
              <img src={personalInfo.image} className={`w-full h-full object-cover ${design.photoGrayscale ? 'grayscale' : ''}`} />
            </div>
          )}

          <h1 className={`${isMinimal ? 'font-light' : design.nameBold ? 'font-black' : 'font-medium'} tracking-tight uppercase leading-none`} style={{ color: getAccentColor('name'), fontSize: design.nameSize === 'xl' ? '30px' : design.nameSize === 'l' ? '26px' : design.nameSize === 's' ? '20px' : design.nameSize === 'xs' ? '16px' : '24px' }}>{personalInfo.fullName || 'Name'}</h1>
          <p className="font-bold opacity-45 tracking-[0.2em] uppercase" style={{ fontSize: '11px', color: getAccentColor('jobTitle') }}>{personalInfo.professionalTitle || ''}</p>

          <div className={`flex flex-wrap gap-x-6 gap-y-1.5 font-semibold tracking-wide opacity-60 uppercase tabular-nums ${justifyClass}`} style={{ fontSize: '10px' }}>
            {personalInfo.email && <div className="flex items-center gap-1.5" style={{ color: getAccentColor('contactIcon') }}><Mail size={10} strokeWidth={2.5} /> {personalInfo.email}</div>}
            {personalInfo.phone && <div className="flex items-center gap-1.5" style={{ color: getAccentColor('contactIcon') }}><Phone size={10} strokeWidth={2.5} /> {personalInfo.phone}</div>}
            {personalInfo.location && <div className="flex items-center gap-1.5" style={{ color: getAccentColor('contactIcon') }}><MapPin size={10} strokeWidth={2.5} /> {personalInfo.location}</div>}
          </div>
        </div>
      )}

      <Droppable droppableId={`page-main-${pageNum}`}>
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            style={{ display: 'block', minHeight: '50px' }}
            className={`flex-1 relative ${isTimeline ? 'pl-8 border-l-2 border-slate-100 ml-4 py-2' : isTwoColumn ? 'grid grid-cols-2 gap-6 items-start' : 'space-y-4'}`}
          >
            {renderedBlocks.map((block, idx) => (
              <div key={`${block.sid}-${pageNum}-${idx}`} className="relative">
                {isTimeline && (
                  <div
                    className="absolute -left-[41px] top-1.5 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center shadow-sm z-10 transition-all hover:scale-110"
                    style={{ borderColor: design.primaryColor || '#ff4d7d' }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: design.primaryColor || '#ff4d7d' }} />
                  </div>
                )}
                <SortableSection
                  id={block.sid}
                  pageNum={pageNum}
                  index={idx}
                  isSelected={!isThumbnail && !isExporting && selectedSectionId === block.sid}
                  onSelect={!isThumbnail && !isExporting ? () => onSelectSection?.(block.sid) : undefined}
                >
                  <div className={isCard ? 'p-5 rounded-xl border border-slate-100/80 bg-slate-50/20 shadow-sm mb-4' : ''}>
                    <DynamicSectionRenderer sid={block.sid} data={{ ...data, design, content }} layout="single" getStyle={getSectionStyle} getAccentColor={getAccentColor} getHeadingMeta={getHeadingMeta} isExporting={isExporting} itemIndices={block.itemIndices} onMoveItem={onMoveItem} onDeleteItem={onDeleteItem} onOpenStylePopup={onOpenStylePopup} isThumbnail={isThumbnail} />
                  </div>
                </SortableSection>
              </div>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

const DoubleHeaderLayout = ({ data, getSectionStyle, isThumbnail, isExporting, selectedSectionId, onSelectSection, getAccentColor, getHeadingMeta, pageNum, pageBlocks, onMoveItem, onDeleteItem, onOpenStylePopup }: SubLayoutProps) => {
  const design = data.design || {} as any;
  const content = data.content || {} as any;
  const personalInfo = content.personalInfo || {} as any;
  const isFirstPage = pageNum === 1;
  const blocks = pageBlocks?.main || [];

  const isBold = design.layout === 'double-header-bold';

  return (
    <div className="flex flex-col w-full h-full bg-white">
      {isFirstPage && (
        <>
          <div className={`${isThumbnail ? 'h-24' : 'h-32'} flex items-center justify-between ${isThumbnail ? 'px-8' : 'px-12'} text-white overflow-hidden relative`} style={{ backgroundColor: design.primaryColor || 'black' }}>
            <div className="flex items-center gap-6 z-10">
              {design.photoShow && personalInfo.image && (
                <div
                  className="w-16 h-16 rounded-full border-2 border-white/40 overflow-hidden shadow-2xl"
                  style={{ borderRadius: design.photoShape === 'circle' ? '50%' : '8px' }}
                >
                  <img src={personalInfo.image} className={`w-full h-full object-cover ${design.photoGrayscale ? 'grayscale' : ''}`} />
                </div>
              )}
              <div>
                <h1 className={`${design.nameBold || isBold ? 'font-black' : 'font-bold'} uppercase tracking-tight leading-none mb-1`} style={{ fontSize: design.nameSize === 'xl' ? '24px' : design.nameSize === 'l' ? '20px' : design.nameSize === 's' ? '16px' : '18px' }}>{personalInfo.fullName || 'Name'}</h1>
                <p className="font-black opacity-80 uppercase tracking-[0.15em]" style={{ fontSize: '10px' }}>{personalInfo.professionalTitle || ''}</p>
              </div>
            </div>
            <div className="z-10 bg-white/10 px-4 py-2 rounded-xl border border-white/20 backdrop-blur-md">
              <div className="flex flex-col gap-1 font-bold uppercase tracking-wide text-white/90" style={{ fontSize: '10px' }}>
                {personalInfo.email && <div className="flex items-center gap-1.5"><Mail size={9} strokeWidth={3} /> {personalInfo.email}</div>}
                {personalInfo.phone && <div className="flex items-center gap-1.5"><Phone size={9} strokeWidth={3} /> {personalInfo.phone}</div>}
              </div>
            </div>
          </div>
          <div
            className={`bg-slate-50 flex flex-wrap justify-center gap-6 items-center ${isThumbnail ? 'py-1.5' : 'py-3'} font-bold tracking-[0.15em] uppercase text-slate-400`}
            style={{
              marginBottom: `${design.sectionSpacing || 8}mm`,
              fontSize: '10px',
              borderBottom: isBold ? `3px solid ${design.primaryColor || '#ff4d7d'}` : '1px solid #e2e8f0'
            }}
          >
            {personalInfo.location && <div className="flex items-center gap-1.5" style={{ color: getAccentColor('contactIcon') }}><MapPin size={9} strokeWidth={3} /> {personalInfo.location}</div>}
            {(personalInfo as any).linkedin && <div className="flex items-center gap-1.5" style={{ color: getAccentColor('contactIcon') }}><Linkedin size={9} strokeWidth={3} /> Profile</div>}
          </div>
        </>
      )}
      <div className="flex-1 w-full pt-0">
        <Droppable droppableId={`page-main-${pageNum}`}>
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="flex flex-col gap-3 flex-1" style={{ minHeight: '50px' }}>
              {blocks.map((block, idx) => (
                <SortableSection
                  key={`${block.sid}-${pageNum}-${idx}`}
                  id={block.sid}
                  pageNum={pageNum}
                  index={idx}
                  isSelected={!isThumbnail && !isExporting && selectedSectionId === block.sid}
                  onSelect={!isThumbnail && !isExporting ? () => onSelectSection?.(block.sid) : undefined}
                >
                  <DynamicSectionRenderer sid={block.sid} data={{ ...data, design, content }} layout="double" getStyle={getSectionStyle} getAccentColor={getAccentColor} getHeadingMeta={getHeadingMeta} isExporting={isExporting} itemIndices={block.itemIndices} onMoveItem={onMoveItem} onDeleteItem={onDeleteItem} onOpenStylePopup={onOpenStylePopup} isThumbnail={isThumbnail} />
                </SortableSection>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    </div>
  );
};

export default ResumePreview;
