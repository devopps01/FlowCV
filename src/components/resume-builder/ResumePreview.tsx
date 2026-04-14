'use client';

import React, { useEffect } from 'react';
import { User, Mail, Phone, MapPin, Globe, Linkedin, Award, BookOpen, Briefcase, GraduationCap, Languages, BadgeCheck, Heart, FolderGit2, FileText, Check, Plus, Users, Building, PenTool, Layers, GripVertical } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { ResumeData } from './types';
import { HEADING_STYLES } from './design-options';

interface ResumePreviewProps {
  data: ResumeData;
  numPages: number;
  previewRef: React.RefObject<HTMLDivElement>;
  zoomLevel: number;
  onReorderSections?: (newOrder: string[]) => void;
  isThumbnail?: boolean;
  isExporting?: boolean;
  selectedSectionId?: string | null;
  onSelectSection?: (sid: string) => void;
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
    document.fonts.load(`700 12px '${fontFamily}'`).catch(() => {});
    document.fonts.load(`400 12px '${fontFamily}'`).catch(() => {});
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

const ResumePreview: React.FC<ResumePreviewProps> = ({ data, numPages, previewRef, zoomLevel, onReorderSections, isThumbnail = false, isExporting = false, selectedSectionId = null, onSelectSection }) => {
  const A4_HEIGHT_PX = 1122;

  // Fallback design if missing
  const design = data.design || {
    fontFamily: 'Inter',
    fontSize: 10.5,
    lineHeight: 1.45,
    marginLR: 20,
    marginTB: 20,
    textColor: '#1f2937',
    primaryColor: '#ff4d7d',
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
  const harmonizedContent = (data.content || {}) as any;
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

  const onDragEnd = (result: any) => {
    if (!result.destination || !onReorderSections) return;
    const items = Array.from(data.activeSections || []);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    onReorderSections(items);
  };

  return (
    <div
      className={`w-full flex items-start justify-center ${isThumbnail ? 'p-0 overflow-hidden bg-transparent' : 'pt-8 pb-16 px-6'}`}
      style={isThumbnail ? {} : { backgroundColor: 'var(--app-bg-medium)' }}
    >
      <GoogleFontsLoader fontFamily={design.fontFamily || 'Inter'} />

      {/* Zoom wrapper */}
      <div
        className="relative"
        style={{
          transform: `scale(${zoomLevel / 100})`,
          transformOrigin: 'top center',
          // Compensate for scale so the scrollable area matches actual rendered size
          // Only add compensation when zoomed out (negative scale factor)
          marginBottom: isThumbnail ? '0' : zoomLevel < 100 ? `${(zoomLevel / 100 - 1) * (numPages * A4_HEIGHT_PX)}px` : '0',
        }}
      >
        {/* ── The single resume content container ── */}
        {/* We render the full content once, then use page-sheet overlays to show A4 boundaries */}
        <div
          ref={previewRef}
          id="resume-preview"
          className={`resume-paper bg-white ${isExporting ? 'shadow-none' : ''}`}
          style={{
            fontFamily: design.fontFamily ?? 'Inter',
            fontSize: `${Math.min(14, Math.max(10, Math.round((design.fontSize ?? 10.5) * 1.333)))}px`,
            lineHeight: Math.min(1.8, Math.max(1.2, design.lineHeight ?? 1.45)),
            width: '210mm',
            minHeight: '297mm',
            color: design.textColor ?? '#1f2937',
            paddingLeft: `${Math.min(25, Math.max(6, design.marginLR ?? 12))}mm`,
            paddingRight: `${Math.min(25, Math.max(6, design.marginLR ?? 12))}mm`,
            paddingTop: `${Math.min(25, Math.max(6, design.marginTB ?? 14))}mm`,
            paddingBottom: `${Math.min(25, Math.max(6, design.marginTB ?? 14))}mm`,
            backgroundColor: design.backgroundColor ?? '#ffffff',
            overflow: 'visible',
            colorScheme: 'light',
            // No shadow on the content itself — shadows go on page sheets
            boxShadow: 'none',
          }}
        >
          <div className={`flex flex-col ${isThumbnail ? 'min-h-0' : ''}`} style={{ breakInside: 'auto' }}>
            <DragDropContext onDragEnd={onDragEnd}>
              {design.layout?.includes('sidebar') ? (
                 <SidebarLayout data={harmonizedData} getSectionStyle={getSectionStyle} isThumbnail={isThumbnail} isExporting={isExporting} selectedSectionId={selectedSectionId} onSelectSection={onSelectSection} getAccentColor={getAccentColor} getHeadingMeta={getHeadingMeta} />
              ) : design.layout === 'modern-header' ? (
                 <ModernHeaderLayout data={harmonizedData} getSectionStyle={getSectionStyle} isThumbnail={isThumbnail} isExporting={isExporting} selectedSectionId={selectedSectionId} onSelectSection={onSelectSection} getAccentColor={getAccentColor} getHeadingMeta={getHeadingMeta} />
              ) : design.layout === 'double-header' ? (
                 <DoubleHeaderLayout data={harmonizedData} getSectionStyle={getSectionStyle} isThumbnail={isThumbnail} isExporting={isExporting} selectedSectionId={selectedSectionId} onSelectSection={onSelectSection} getAccentColor={getAccentColor} getHeadingMeta={getHeadingMeta} />
              ) : (
                 <SingleColumnLayout data={harmonizedData} getSectionStyle={getSectionStyle} isThumbnail={isThumbnail} isExporting={isExporting} selectedSectionId={selectedSectionId} onSelectSection={onSelectSection} getAccentColor={getAccentColor} getHeadingMeta={getHeadingMeta} />
              )}
            </DragDropContext>
          </div>
        </div>

        {/* ── Page boundary overlays ── */}
        {/* These sit on top of the content and visually separate pages */}
        {!isThumbnail && !isExporting && numPages > 1 && Array.from({ length: numPages - 1 }).map((_, i) => (
          <div
            key={i}
            className="absolute left-0 right-0 z-20 pointer-events-none flex flex-col items-center"
            style={{ top: `${(i + 1) * A4_HEIGHT_PX}px` }}
          >
            {/* Gap strip — covers the seam between pages */}
            <div
              className="w-full"
              style={{
                height: '32px',
                backgroundColor: 'var(--app-bg-medium)',
                borderTop: '1px solid rgba(0,0,0,0.06)',
                borderBottom: '1px solid rgba(0,0,0,0.06)',
              }}
            />
            {/* Page label */}
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest"
              style={{
                background: 'rgba(255,255,255,0.95)',
                border: '1px solid rgba(0,0,0,0.08)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                color: '#64748b',
                top: '4px',
              }}
            >
              <span>Page {i + 1}</span>
              <span style={{ color: '#cbd5e1' }}>·</span>
              <span style={{ color: 'var(--app-primary)' }}>Page {i + 2}</span>
            </div>
          </div>
        ))}

        {/* ── Page shadow frames ── */}
        {/* Each page gets its own shadow box so it looks like separate sheets */}
        {!isThumbnail && !isExporting && Array.from({ length: numPages }).map((_, i) => (
          <div
            key={i}
            className="absolute left-0 right-0 pointer-events-none z-[-1]"
            style={{
              top: `${i * A4_HEIGHT_PX}px`,
              height: `${A4_HEIGHT_PX}px`,
              boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
              borderRadius: '1px',
              background: 'white',
            }}
          />
        ))}
      </div>
    </div>
  );
};

/* --- Shared Components --- */

const RichContent = ({ html, className = '', style }: { html: string; className?: string; style?: React.CSSProperties }) => {
  if (!html || html === '<p></p>') return null;
  return <div className={`rich-content ${className}`} style={style} dangerouslySetInnerHTML={{ __html: html }} />;
};

// Smart SectionHeader: handles complex styles that need wrapper elements
const SectionHeader = ({ title, style, headingStyle, lineColor, lineThick, lineWidth }: { 
  title: string, 
  style: React.CSSProperties,
  headingStyle?: string,
  lineColor?: string,
  lineThick?: string,
  lineWidth?: string,
}) => {
  const lc = lineColor || '#1f2937';
  const lt = lineThick || '2px';

  // Dot prefix style
  if ((headingStyle || '').startsWith('dot')) {
    const sizeMatch = ((headingStyle || '').match(/_s(\d+)/) || [])[1];
    const dotSize = sizeMatch ? `${Number(sizeMatch)}px` : '7px';
    return (
      <div className="section-header-container mb-3 flex items-center gap-2">
        <div style={{ width: dotSize, height: dotSize, borderRadius: '50%', backgroundColor: lc, flexShrink: 0 }} />
        <h2 style={style}>{title}</h2>
      </div>
    );
  }

  // Center flanked by lines, e.g. "── EXPERIENCE ──"
  if ((headingStyle || '').startsWith('double-side')) {
    return (
      <div className="section-header-container mb-3 flex items-center gap-3">
        <div style={{ flex: 1, height: lt, backgroundColor: lc, opacity: 0.4 }} />
        <h2 style={{ ...style, display: 'inline-block', width: 'auto' }}>{title}</h2>
        <div style={{ flex: 1, height: lt, backgroundColor: lc, opacity: 0.4 }} />
      </div>
    );
  }

  // Centered text through a horizontal rule (strikethrough effect)
  if ((headingStyle || '').startsWith('strikethrough')) {
    const tMatch = ((headingStyle || '').match(/_t(\d+)/) || [])[1];
    const strikeH = tMatch ? `${Number(tMatch)}px` : '1px';
    return (
      <div className="section-header-container mb-3 relative flex items-center">
        <div style={{ position: 'absolute', left: 0, right: 0, height: strikeH, backgroundColor: lc, opacity: 0.25 }} />
        <h2 style={{ ...style, display: 'inline-block', width: 'auto', backgroundColor: 'white', paddingLeft: '4px', paddingRight: '8px', position: 'relative' }}>{title}</h2>
      </div>
    );
  }

  // Default: the style object handles everything
  return (
    <div className="section-header-container mb-3">
       <h2 style={style}>{title}</h2>
    </div>
  );
};

const SortableSection = ({ id, index, children, isSelected, onSelect }: { id: string, index: number, children: React.ReactNode, isSelected?: boolean, onSelect?: () => void }) => (
  <Draggable draggableId={id} index={index}>
    {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`relative group/section ${snapshot.isDragging ? 'bg-blue-50/30 ring-2 ring-blue-200 ring-offset-4 rounded-xl scale-[1.01] z-50' : ''} ${isSelected ? 'ring-2 ring-[#ff4d7d] ring-offset-4 rounded-xl' : ''}`}
          style={{
            ...provided.draggableProps.style,
            // These must be on the element itself, not a child, for break-inside to work
            breakInside: 'avoid',
            pageBreakInside: 'avoid',
          }}
        >
        <div
          {...provided.dragHandleProps}
          className="absolute -left-10 top-0 p-2 opacity-0 group-hover/section:opacity-100 transition-opacity cursor-grab text-slate-300 hover:text-[#ff4d7d]"
          title="Drag to reorder section"
        >
          <GripVertical className="w-5 h-5" />
        </div>
        {!snapshot.isDragging && onSelect && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onSelect(); }}
            className="absolute -left-10 top-10 p-2 opacity-0 group-hover/section:opacity-100 transition-opacity text-slate-300 hover:text-[#ff4d7d]"
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

const DynamicSectionRenderer = ({ sid, data, layout, getStyle, getAccentColor, getHeadingMeta, isExporting }: { sid: string, data: ResumeData, layout: 'sidebar' | 'modern' | 'single' | 'double', getStyle: any, getAccentColor: any, getHeadingMeta: (isSidebar: boolean) => { headingStyleId: string; lineColor: string; lineThick: string; lineWidth: string }, isExporting?: boolean }) => {
   const design = data.design || {} as any;
   const content = data.content || {} as any;
   const personalInfo = content.personalInfo || {} as any;
   const headingMeta = getHeadingMeta(layout === 'sidebar');
   
   if (sid === 'summary' && personalInfo.summary) {
       return (
          <div style={{
            marginBottom: `${design.sectionSpacing ?? 8}mm`,
            breakInside: 'avoid',
            pageBreakInside: 'avoid',
          }}>
             {design.showSummaryHeading && (
               <SectionHeader
                 title={layout === 'single' ? 'Professional Profile' : 'Profile'}
                 style={layout === 'single' ? { ...getStyle(false), textAlign: 'center', width: '100%', display: 'block' } : getStyle(layout === 'sidebar')}
                 headingStyle={headingMeta.headingStyleId}
                 lineColor={headingMeta.lineColor}
                 lineThick={headingMeta.lineThick}
                 lineWidth={headingMeta.lineWidth}
               />
             )}
             <RichContent html={personalInfo.summary} className={`leading-relaxed opacity-80 ${layout === 'single' ? 'font-medium italic text-slate-600' : ''}`} style={{ fontSize: '11px' } as any} />
          </div>
       );
   }

   if (sid === 'declaration' && content.declaration?.text) {
       return (
          <div style={{ marginBottom: `${design.sectionSpacing ?? 8}mm`, breakInside: 'avoid', pageBreakInside: 'avoid' }}>
            <SectionHeader
              title="Declaration"
              style={getStyle(layout === 'sidebar')}
              headingStyle={headingMeta.headingStyleId}
              lineColor={headingMeta.lineColor}
              lineThick={headingMeta.lineThick}
              lineWidth={headingMeta.lineWidth}
            />
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

       if (!items?.length) return null;

       const getLevel = (item: any) => {
         if (isLanguages) return getLevelPercentage(item.proficiency || '');
         if (typeof item === 'string') return getLevelPercentage(item);
         return 50;
       };

        const getItemLabel = (item: any) => {
          if (isLanguages) {
            // Show full name — handle both old code-based and new name-based storage
            const langName = item.language || '';
            return langName;
          }
          if (isCertifications) return `${item.name} (${item.issuer})`;
          if (sid === 'socials') return item.platform || item.label || item.url;
          if (isSkills || isInterests) return item.name || '';
          return item.label || String(item);
        };

        // For languages in grid style, show "Language — Proficiency"
        const getLanguageLabel = (item: any) => {
          const name = item.language || '';
          const prof = item.proficiency || '';
          return prof ? `${name} — ${prof}` : name;
        };

       return (
          <div style={{
            marginBottom: `${design.sectionSpacing ?? 8}mm`,
            breakInside: 'avoid',
            pageBreakInside: 'avoid',
          }}>
            <SectionHeader
              title={isSkills ? 'Skills' : isInterests ? 'Interests' : isLanguages ? 'Languages' : isCertifications ? 'Certifications' : 'Socials'}
              style={getStyle(layout === 'sidebar')}
              headingStyle={headingMeta.headingStyleId}
              lineColor={headingMeta.lineColor}
              lineThick={headingMeta.lineThick}
              lineWidth={headingMeta.lineWidth}
            />

            {styleType === 'compact' ? (
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 opacity-80 font-medium" style={{ fontSize: '11px' }}>
                {items.map((item, i) => (
                  <React.Fragment key={i}>
                    <span>{isLanguages ? getLanguageLabel(item) : getItemLabel(item)}</span>
                    {i < items.length - 1 && <span className="opacity-30">•</span>}
                  </React.Fragment>
                ))}
              </div>
            ) : styleType === 'bubble' ? (
              <div className="flex flex-wrap gap-1.5">
                {items.map((item, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-0.5 rounded-full font-semibold opacity-80"
                    style={{ fontSize: '10px', color: getAccentColor('dots'), backgroundColor: `${design.primaryColor || '#ff4d7d'}12`, border: `1px solid ${design.primaryColor || '#ff4d7d'}25` }}
                  >
                    {isLanguages ? getLanguageLabel(item) : getItemLabel(item)}
                  </span>
                ))}
              </div>
            ) : styleType === 'level' ? (
              <div className={`grid gap-x-4 gap-y-2`} style={{ gridTemplateColumns: layout === 'sidebar' ? '1fr' : `repeat(${columns}, minmax(0, 1fr))` }}>
                {items.map((item, i) => {
                  const level = getLevel(item);
                  return (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between items-center font-semibold opacity-80" style={{ fontSize: '11px' }}>
                        <span>{getItemLabel(item)}</span>
                        {isLanguages && typeof item === 'object' && item !== null && 'language' in item && 'proficiency' in item && <span className="opacity-40" style={{ fontSize: '10px' }}>{(item as any).proficiency}</span>}
                      </div>
                      <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${isExporting ? '' : 'transition-all'}`} style={{ width: `${level}%`, backgroundColor: design.primaryColor || '#ff4d7d' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Default: GRID */
              <div className={`grid gap-x-3 gap-y-1`} style={{ gridTemplateColumns: layout === 'sidebar' ? '1fr' : `repeat(${columns}, minmax(0, 1fr))` }}>
                {items.map((item, i) => (
                  <div key={i} className="flex items-center gap-1.5 font-medium opacity-80" style={{ fontSize: '11px' }}>
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: design.primaryColor || '#ff4d7d' }} />
                    <span>{isLanguages ? getLanguageLabel(item) : getItemLabel(item)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
       );
   }

   let listProps = { title: '', items: [] as any[] };
   if (sid === 'experience') listProps = { title: 'Experience', items: content.experience?.map((x: any, i: number) => ({ t: x.position, s: x.company, d: `${x.startDate} ${x.endDate ? '— '+x.endDate : ''}`, desc: x.description, tPath: `content.experience[${i}].position`, sPath: `content.experience[${i}].company`, descPath: `content.experience[${i}].description` })) || [] };
   else if (sid === 'education') listProps = { title: 'Education', items: content.education?.map((x: any, i: number) => ({ t: design.educationOrder === 'school-degree' ? x.school : x.degree, s: design.educationOrder === 'school-degree' ? `${x.degree} in ${x.field}` : x.school, d: x.graduationYear, desc: '', tPath: `content.education[${i}].${design.educationOrder === 'school-degree' ? 'school' : 'degree'}`, sPath: `content.education[${i}].${design.educationOrder === 'school-degree' ? 'degree' : 'school'}`, descPath: '' })) || [] };
   else if (sid === 'projects') listProps = { title: 'Projects', items: content.projects?.map((x: any, i: number) => ({ t: x.name, s: x.technologies?.join(', '), d: '', desc: x.description, tPath: `content.projects[${i}].name`, sPath: '', descPath: `content.projects[${i}].description` })) || [] };
   else if (sid === 'awards') listProps = { title: 'Awards', items: content.awards?.map((x: any, i: number) => ({ t: x.title, s: x.issuer, d: x.date, desc: x.description, tPath: `content.awards[${i}].title`, sPath: `content.awards[${i}].issuer`, descPath: `content.awards[${i}].description` })) || [] };
   else if (sid === 'courses') listProps = { title: 'Courses', items: content.courses?.map((x: any, i: number) => ({ t: x.title, s: x.provider, d: x.date, desc: x.description, tPath: `content.courses[${i}].title`, sPath: `content.courses[${i}].provider`, descPath: `content.courses[${i}].description` })) || [] };
   else if (sid === 'organisations') listProps = { title: 'Organisations', items: content.organisations?.map((x: any, i: number) => ({ t: x.name, s: x.role, d: `${x.startDate} ${x.endDate ? '— '+x.endDate : ''}`, desc: x.description, tPath: `content.organisations[${i}].name`, sPath: `content.organisations[${i}].role`, descPath: `content.organisations[${i}].description` })) || [] };
   else if (sid === 'publications') listProps = { title: 'Publications', items: content.publications?.map((x: any, i: number) => ({ t: x.title, s: x.publisher, d: x.date, desc: x.description, tPath: `content.publications[${i}].title`, sPath: `content.publications[${i}].publisher`, descPath: `content.publications[${i}].description` })) || [] };
   else if (sid === 'references') listProps = { title: 'References', items: content.references?.map((x: any, i: number) => ({ t: x.name, s: `${x.position} at ${x.company}`, d: '', desc: `${x.email} ${x.phone}`, tPath: `content.references[${i}].name`, sPath: '', descPath: '' })) || [] };
   else if (sid === 'custom') listProps = { title: 'Custom Section', items: content.custom?.map((x: any, i: number) => ({ t: x.title, s: '', d: '', desc: x.content, tPath: `content.custom[${i}].title`, sPath: '', descPath: `content.custom[${i}].content` })) || [] };

   if (!listProps.items || listProps.items.length === 0) return null;

   const titleSize = design.entryTitleSize === 's' ? '11px' : design.entryTitleSize === 'm' ? '12px' : '13px';
   const subtitleStyle = design.entrySubtitleStyle || 'medium';
   const subtitlePlacement = design.entrySubtitlePlacement || 'next-line';

   return (
      <div style={{
        marginBottom: `${design.sectionSpacing ?? 8}mm`,
        breakInside: 'avoid',
        pageBreakInside: 'avoid',
      }}>
         <SectionHeader
           title={listProps.title}
           style={layout === 'single' ? { ...getStyle(false), textAlign: design.personalAlign ?? 'left', width: '100%', display: 'block' } : getStyle(layout === 'sidebar')}
           headingStyle={headingMeta.headingStyleId}
           lineColor={headingMeta.lineColor}
           lineThick={headingMeta.lineThick}
           lineWidth={headingMeta.lineWidth}
         />
         <div style={{ display: 'block' }}>
            {listProps.items.map((item, i) => {
              const entryMargin = `${Math.min(8, Math.max(1, design.entrySpacing ?? 4))}mm`;
              const EntryContainer = ({ children }: { children: React.ReactNode }) => (
                <div
                  key={i}
                  style={{
                    display: 'block',
                    breakInside: 'avoid',
                    pageBreakInside: 'avoid',
                    marginBottom: entryMargin,
                  }}
                >
                   {children}
                </div>
              );

              if (design.entryLayout === 'side-date') {
                return (
                  <EntryContainer key={i}>
                    <div className="grid grid-cols-12 gap-4">
                       <div className="col-span-3 text-right">
                          <span className="font-semibold opacity-40 uppercase tabular-nums" style={{ fontSize: '10px', color: getAccentColor('dates') }}>{item.d}</span>
                       </div>
                       <div className="col-span-9">
                          <h3 style={{ fontSize: titleSize, color: getAccentColor('name'), fontWeight: '700' }}>{item.t}</h3>
                          {item.s && (
                            <p className={`${subtitleStyle === 'bold' ? 'font-bold text-slate-800' : subtitleStyle === 'italic' ? 'italic' : 'font-medium text-slate-600'} opacity-80`} style={{ fontSize: '11px', color: getAccentColor('entrySubtitle') }}>
                              {item.s}
                            </p>
                          )}
                          <RichContent html={item.desc} className={`leading-relaxed opacity-75 mt-1 ${design.descriptionIndent ? 'pl-3 border-l-2 border-slate-100' : ''}`} style={{ fontSize: '11px' } as any} />
                       </div>
                    </div>
                  </EntryContainer>
                );
              }

              if (design.entryLayout === 'split') {
                 return (
                  <EntryContainer key={i}>
                    <div className="flex justify-between gap-3">
                       <div className="flex-1">
                          <h3 style={{ fontSize: titleSize, color: getAccentColor('name'), fontWeight: '700' }}>{item.t}</h3>
                          {item.s && (
                            <p className={`${subtitleStyle === 'bold' ? 'font-bold text-slate-800' : subtitleStyle === 'italic' ? 'italic' : 'font-medium text-slate-600'} opacity-80`} style={{ fontSize: '11px', color: getAccentColor('entrySubtitle') }}>
                              {item.s}
                            </p>
                          )}
                       </div>
                       <div className="text-right shrink-0">
                          <span className="font-semibold opacity-40 uppercase tabular-nums" style={{ fontSize: '10px', color: getAccentColor('dates') }}>{item.d}</span>
                       </div>
                    </div>
                    <RichContent html={item.desc} className={`leading-relaxed opacity-75 mt-1 ${design.descriptionIndent ? 'pl-3 border-l-2 border-slate-100' : ''}`} style={{ fontSize: '11px' } as any} />
                  </EntryContainer>
                 );
              }

              return (
                <EntryContainer key={i}>
                   <div className={`flex ${subtitlePlacement === 'same-line' ? 'items-baseline gap-2' : 'flex-col'} justify-between`}>
                      <div className="flex justify-between items-baseline flex-1">
                        <h3
                          style={{ fontSize: titleSize, color: getAccentColor('name'), fontWeight: '700' }}
                          data-edit-path={item.tPath || ''}
                          data-edit-label="Title"
                          data-edit-value={item.t || ''}
                        >{item.t}</h3>
                        {subtitlePlacement === 'same-line' && item.s && <span className="mx-1.5 opacity-20 text-slate-300">•</span>}
                        {subtitlePlacement === 'same-line' && item.s && (
                          <span
                            className={`${subtitleStyle === 'bold' ? 'font-bold text-slate-800' : subtitleStyle === 'italic' ? 'italic' : 'font-medium text-slate-600'} opacity-80 flex-1`}
                            style={{ fontSize: '11px', color: getAccentColor('entrySubtitle') }}
                            data-edit-path={item.sPath || ''}
                            data-edit-label="Subtitle"
                            data-edit-value={item.s || ''}
                          >{item.s}</span>
                        )}
                        <span className="font-semibold opacity-40 uppercase tabular-nums shrink-0" style={{ fontSize: '10px', color: getAccentColor('dates') }}>{item.d}</span>
                      </div>
                      {subtitlePlacement === 'next-line' && item.s && (
                         <p
                           className={`${subtitleStyle === 'bold' ? 'font-bold text-slate-800' : subtitleStyle === 'italic' ? 'italic' : 'font-medium text-slate-600'} opacity-80 mt-0.5`}
                           style={{ fontSize: '11px', color: getAccentColor('entrySubtitle') }}
                           data-edit-path={item.sPath || ''}
                           data-edit-label="Subtitle"
                           data-edit-value={item.s || ''}
                         >{item.s}</p>
                      )}
                   </div>
                   <RichContent html={item.desc} className={`leading-relaxed opacity-75 mt-1 ${design.descriptionIndent ? 'pl-3 border-l-2 border-slate-100' : ''}`} style={{ fontSize: '11px' } as any} />
                </EntryContainer>
              );
            })}
         </div>
      </div>
   );
};

/* --- Sub-layouts --- */

const SidebarLayout = ({ data, getSectionStyle, isThumbnail, isExporting, selectedSectionId, onSelectSection, getAccentColor, getHeadingMeta }: { data: ResumeData, getSectionStyle: (s?: boolean) => React.CSSProperties, isThumbnail?: boolean, isExporting?: boolean, selectedSectionId?: string | null, onSelectSection?: (sid: string) => void, getAccentColor: any, getHeadingMeta: any }) => {
  const design = data.design || {} as any;
  const content = data.content || {} as any;
  const personalInfo = content.personalInfo || {} as any;
  const isRight = design.layout === 'sidebar-right';
  
  return (
    <div
      style={{
        minHeight: isThumbnail ? 'auto' : '297mm',
        display: 'block',
        position: 'relative',
      }}
    >
      {/* Sidebar column — floated */}
      <div
        style={{
          float: isRight ? 'right' : 'left',
          width: '32%',
          minHeight: isThumbnail ? 'auto' : '297mm',
          backgroundColor: design.secondaryColor || '#f8fafc',
          borderRight: isRight ? 'none' : '1px solid rgba(0,0,0,0.05)',
          borderLeft: isRight ? '1px solid rgba(0,0,0,0.05)' : 'none',
          padding: isThumbnail ? '16px' : '24px',
          boxSizing: 'border-box',
        }}
      >
        <div className={`flex flex-col ${design.personalAlign === 'center' ? 'items-center text-center' : design.personalAlign === 'right' ? 'items-end text-right' : 'items-start text-left'} ${isThumbnail ? 'gap-3' : 'gap-4'}`}>
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
        </div>

        <div className="space-y-6">
           <div className="space-y-3">
             <h2 className="font-bold uppercase tracking-[0.15em] opacity-50 border-b pb-1" style={{ fontSize: '10px', borderColor: `${design.primaryColor || '#ff4d7d'}20`, color: getAccentColor('headings') }}>Contact</h2>
             <div className="space-y-2 font-semibold opacity-80" style={{ fontSize: '10px' }}>
                {personalInfo.email && <div className="flex items-center gap-2" style={{ color: getAccentColor('contactIcon') }}><Mail size={10} strokeWidth={2.5} /> <span className="text-slate-600 truncate" data-edit-path="content.personalInfo.email" data-edit-label="Email" data-edit-value={personalInfo.email}>{personalInfo.email}</span></div>}
                {personalInfo.phone && <div className="flex items-center gap-2" style={{ color: getAccentColor('contactIcon') }}><Phone size={10} strokeWidth={2.5} /> <span className="text-slate-600 truncate" data-edit-path="content.personalInfo.phone" data-edit-label="Phone" data-edit-value={personalInfo.phone}>{personalInfo.phone}</span></div>}
                {personalInfo.location && <div className="flex items-center gap-2" style={{ color: getAccentColor('contactIcon') }}><MapPin size={10} strokeWidth={2.5} /> <span className="text-slate-600 truncate" data-edit-path="content.personalInfo.location" data-edit-label="Location" data-edit-value={personalInfo.location}>{personalInfo.location}</span></div>}
             </div>
           </div>

           <Droppable droppableId="sidebar">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} style={{ display: 'block' }}>
                  {data?.activeSections?.filter((sid: string) => ['skills', 'languages', 'interests', 'awards', 'certifications', 'socials'].includes(sid)).map((sid: string, idx: number) => (
                    <SortableSection
                      key={sid}
                      id={sid}
                      index={idx}
                      isSelected={!isThumbnail && !isExporting && selectedSectionId === sid}
                      onSelect={!isThumbnail && !isExporting ? () => onSelectSection?.(sid) : undefined}
                    >
                       <DynamicSectionRenderer sid={sid} data={{ ...data, design, content }} layout="sidebar" getStyle={getSectionStyle} getAccentColor={getAccentColor} getHeadingMeta={getHeadingMeta} isExporting={isExporting} />
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
          marginLeft: isRight ? '0' : '32%',
          marginRight: isRight ? '32%' : '0',
          padding: isThumbnail ? '16px' : '24px',
          boxSizing: 'border-box',
          minHeight: isThumbnail ? 'auto' : '297mm',
        }}
      >
         <Droppable droppableId="main">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} style={{ display: 'block' }}>
                {data?.activeSections?.filter((sid: string) => !['skills', 'languages', 'interests', 'awards', 'certifications', 'socials', 'personalInfo'].includes(sid)).map((sid: string, idx: number) => (
                  <SortableSection
                    key={sid}
                    id={sid}
                    index={idx}
                    isSelected={!isThumbnail && !isExporting && selectedSectionId === sid}
                    onSelect={!isThumbnail && !isExporting ? () => onSelectSection?.(sid) : undefined}
                  >
                     <DynamicSectionRenderer sid={sid} data={{ ...data, design, content }} layout="single" getStyle={getSectionStyle} getAccentColor={getAccentColor} getHeadingMeta={getHeadingMeta} isExporting={isExporting} />
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

const ModernHeaderLayout = ({ data, getSectionStyle, isThumbnail, isExporting, selectedSectionId, onSelectSection, getAccentColor, getHeadingMeta }: { data: ResumeData, getSectionStyle: (s?: boolean) => React.CSSProperties, isThumbnail?: boolean, isExporting?: boolean, selectedSectionId?: string | null, onSelectSection?: (sid: string) => void, getAccentColor: any, getHeadingMeta: any }) => {
  const design = data.design || {} as any;
  const content = data.content || {} as any;
  const personalInfo = content.personalInfo || {} as any;
  
  return (
    <div className="flex flex-col w-full" style={{ minHeight: isThumbnail ? 'auto' : '297mm' }}>
      <div className={`flex flex-col py-10 px-8 border-b border-slate-100/50 ${design.personalAlign === 'center' ? 'items-center text-center' : design.personalAlign === 'right' ? 'items-end text-right' : 'items-start text-left'}`} style={{ backgroundColor: design.secondaryColor || '#f8fafc', marginBottom: `${design.sectionSpacing || 8}mm` }}>
        {design.photoShow && personalInfo.image && (
          <div 
            className="w-24 h-24 overflow-hidden border-2 mb-4 shadow-lg" 
            style={{ 
              borderColor: design.primaryColor || '#ff4d7d',
              borderRadius: design.photoShape === 'circle' ? '50%' : design.photoShape === 'rounded' ? '8px' : '0'
            }}
          >
            <img src={personalInfo.image} className={`w-full h-full object-cover ${design.photoGrayscale ? 'grayscale' : ''}`} />
          </div>
        )}
        <h1 className={`${design.nameBold ? 'font-black' : 'font-medium'} mb-1 capitalize tracking-tight leading-none`} style={{ color: getAccentColor('name'), fontSize: design.nameSize === 'xl' ? '28px' : design.nameSize === 'l' ? '24px' : design.nameSize === 's' ? '18px' : design.nameSize === 'xs' ? '15px' : '22px' }}>{personalInfo.fullName || 'Name'}</h1>
        <p className="font-bold opacity-40 uppercase tracking-[0.15em] mb-3" style={{ fontSize: '10px', color: getAccentColor('jobTitle') }}>{personalInfo.professionalTitle || ''}</p>
        
        <div className={`flex flex-wrap gap-x-6 gap-y-1.5 font-semibold opacity-70 ${design.personalAlign === 'center' ? 'justify-center' : design.personalAlign === 'right' ? 'justify-end' : 'justify-start'}`} style={{ fontSize: '10px' }}>
          {personalInfo.email && <div className="flex items-center gap-1.5" style={{ color: getAccentColor('contactIcon') }}><Mail size={10} strokeWidth={2.5} /> <span className="text-slate-900">{personalInfo.email}</span></div>}
          {personalInfo.phone && <div className="flex items-center gap-1.5" style={{ color: getAccentColor('contactIcon') }}><Phone size={10} strokeWidth={2.5} /> <span className="text-slate-900">{personalInfo.phone}</span></div>}
          {personalInfo.location && <div className="flex items-center gap-1.5" style={{ color: getAccentColor('contactIcon') }}><MapPin size={10} strokeWidth={2.5} /> <span className="text-slate-900">{personalInfo.location}</span></div>}
        </div>
      </div>
      
      <div className="flex-1 w-full pt-0">
         <Droppable droppableId="modern-main">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} style={{ display: 'block' }}>
               {data?.activeSections?.map((sid, idx) => (
                     <SortableSection
                       key={sid}
                       id={sid}
                       index={idx}
                       isSelected={!isThumbnail && !isExporting && selectedSectionId === sid}
                       onSelect={!isThumbnail && !isExporting ? () => onSelectSection?.(sid) : undefined}
                     >
                        <DynamicSectionRenderer sid={sid} data={{ ...data, design, content }} layout="modern" getStyle={getSectionStyle} getAccentColor={getAccentColor} getHeadingMeta={getHeadingMeta} isExporting={isExporting} />
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

const SingleColumnLayout = ({ data, getSectionStyle, isThumbnail, isExporting, selectedSectionId, onSelectSection, getAccentColor, getHeadingMeta }: { data: ResumeData, getSectionStyle: (s?: boolean) => React.CSSProperties, isThumbnail?: boolean, isExporting?: boolean, selectedSectionId?: string | null, onSelectSection?: (sid: string) => void, getAccentColor: any, getHeadingMeta: any }) => {
  const design = data.design || {} as any;
  const content = data.content || {} as any;
  const personalInfo = content.personalInfo || {} as any;

  return (
    <div className="flex flex-col w-full" style={{ minHeight: isThumbnail ? 'auto' : '297mm' }}>
      <div className={`flex flex-col space-y-3 relative pb-6 w-full ${design.personalAlign === 'center' ? 'items-center text-center' : design.personalAlign === 'right' ? 'items-end text-right' : 'items-start text-left'}`} style={{ marginBottom: `${Math.min(16, Math.max(4, design.sectionSpacing || 8))}mm` }}>
        <div className={`absolute bottom-0 w-32 h-1 ${design.personalAlign === 'center' ? 'left-1/2 -translate-x-1/2' : design.personalAlign === 'right' ? 'right-0' : 'left-0'}`} style={{ backgroundColor: design.primaryColor || '#ff4d7d' }} />
        
        {design.photoShow && personalInfo.image && (
            <div 
              className={`${isThumbnail ? 'w-24 h-24' : 'w-28 h-28'} bg-white border-2 shadow-lg flex items-center justify-center overflow-hidden transition-all mb-2`} 
              style={{ 
                borderColor: design.primaryColor || '#ff4d7d',
                borderRadius: design.photoShape === 'circle' ? '50%' : design.photoShape === 'rounded' ? '8px' : '0'
              }}
            >
              <img src={personalInfo.image} className={`w-full h-full object-cover ${design.photoGrayscale ? 'grayscale' : ''}`} />
            </div>
        )}

        <h1 className={`${design.nameBold ? 'font-black' : 'font-medium'} tracking-tight uppercase leading-none`} style={{ color: getAccentColor('name'), fontSize: design.nameSize === 'xl' ? '30px' : design.nameSize === 'l' ? '26px' : design.nameSize === 's' ? '20px' : design.nameSize === 'xs' ? '16px' : '24px' }}>{personalInfo.fullName || 'Name'}</h1>
        <p className="font-bold opacity-40 tracking-[0.2em] uppercase" style={{ fontSize: '11px', color: getAccentColor('jobTitle') }}>{personalInfo.professionalTitle || ''}</p>
        
        <div className={`flex flex-wrap gap-x-6 gap-y-1.5 font-semibold tracking-wide opacity-60 uppercase tabular-nums ${design.personalAlign === 'center' ? 'justify-center' : design.personalAlign === 'right' ? 'justify-end' : 'justify-start'}`} style={{ fontSize: '10px' }}>
           {personalInfo.email && <div className="flex items-center gap-1.5" style={{ color: getAccentColor('contactIcon') }}><Mail size={10} strokeWidth={2.5} /> {personalInfo.email}</div>}
           {personalInfo.phone && <div className="flex items-center gap-1.5" style={{ color: getAccentColor('contactIcon') }}><Phone size={10} strokeWidth={2.5} /> {personalInfo.phone}</div>}
           {personalInfo.location && <div className="flex items-center gap-1.5" style={{ color: getAccentColor('contactIcon') }}><MapPin size={10} strokeWidth={2.5} /> {personalInfo.location}</div>}
        </div>
      </div>

      <Droppable droppableId="single-main">
         {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} style={{ display: 'block' }}>
               {data?.activeSections?.map((sid, idx) => (
                  <SortableSection
                    key={sid}
                    id={sid}
                    index={idx}
                    isSelected={!isThumbnail && !isExporting && selectedSectionId === sid}
                    onSelect={!isThumbnail && !isExporting ? () => onSelectSection?.(sid) : undefined}
                  >
                     <DynamicSectionRenderer sid={sid} data={{ ...data, design, content }} layout="single" getStyle={getSectionStyle} getAccentColor={getAccentColor} getHeadingMeta={getHeadingMeta} isExporting={isExporting} />
                  </SortableSection>
               ))}
               {provided.placeholder}
            </div>
         )}
      </Droppable>
    </div>
  );
};

const DoubleHeaderLayout = ({ data, getSectionStyle, isThumbnail, isExporting, selectedSectionId, onSelectSection, getAccentColor, getHeadingMeta }: { data: ResumeData, getSectionStyle: (s?: boolean) => React.CSSProperties, isThumbnail?: boolean, isExporting?: boolean, selectedSectionId?: string | null, onSelectSection?: (sid: string) => void, getAccentColor: any, getHeadingMeta: any }) => {
  const design = data.design || {} as any;
  const content = data.content || {} as any;
  const personalInfo = content.personalInfo || {} as any;

  return (
    <div className="flex flex-col w-full bg-white" style={{ minHeight: isThumbnail ? 'auto' : '297mm' }}>
      <div className={`${isThumbnail ? 'h-24' : 'h-32'} flex items-center justify-between ${isThumbnail ? 'px-8' : 'px-12'} text-white overflow-hidden relative`} style={{ backgroundColor: design.primaryColor || '#ff4d7d' }}>
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
              <h1 className={`${design.nameBold ? 'font-black' : 'font-bold'} uppercase tracking-tight leading-none mb-1`} style={{ fontSize: design.nameSize === 'xl' ? '24px' : design.nameSize === 'l' ? '20px' : design.nameSize === 's' ? '16px' : '18px' }}>{personalInfo.fullName || 'Name'}</h1>
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
      <div className={`bg-slate-50 border-b border-slate-100 flex flex-wrap justify-center gap-6 items-center ${isThumbnail ? 'py-1.5' : 'py-3'} font-bold tracking-[0.15em] uppercase text-slate-400`} style={{ marginBottom: `${design.sectionSpacing || 8}mm`, fontSize: '10px' }}>
         {personalInfo.location && <div className="flex items-center gap-1.5" style={{ color: getAccentColor('contactIcon') }}><MapPin size={9} strokeWidth={3} /> {personalInfo.location}</div>}
         {(personalInfo as any).linkedin && <div className="flex items-center gap-1.5" style={{ color: getAccentColor('contactIcon') }}><Linkedin size={9} strokeWidth={3} /> Profile</div>}
      </div>
      <div className="flex-1 w-full pt-0">
         <Droppable droppableId="double-main">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="flex flex-col gap-3">
                 {data?.activeSections?.map((sid, idx) => (
                     <SortableSection
                       key={sid}
                       id={sid}
                       index={idx}
                       isSelected={!isThumbnail && !isExporting && selectedSectionId === sid}
                       onSelect={!isThumbnail && !isExporting ? () => onSelectSection?.(sid) : undefined}
                     >
                        <DynamicSectionRenderer sid={sid} data={{ ...data, design, content }} layout="double" getStyle={getSectionStyle} getAccentColor={getAccentColor} getHeadingMeta={getHeadingMeta} isExporting={isExporting} />
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
