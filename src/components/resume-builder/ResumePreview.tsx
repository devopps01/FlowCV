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
    if (!fontFamily || ['Inter', 'serif', 'sans-serif', 'monospace', 'system-ui'].includes(fontFamily)) return;
    
    const linkId = `font-${fontFamily.replace(/\s+/g, '-').toLowerCase()}`;
    if (document.getElementById(linkId)) return;

    const link = document.createElement('link');
    link.id = linkId;
    link.rel = 'stylesheet';
    const fontQuery = fontFamily.replace(/\s+/g, '+');
    link.href = `https://fonts.googleapis.com/css2?family=${fontQuery}:wght@400;500;700;900&display=swap`;
    document.head.appendChild(link);
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

  // Log design properties for debugging
  if (typeof window !== 'undefined') {
    console.log('=== RESUME PREVIEW DESIGN ===');
    console.log('Layout:', data.design?.layout);
    console.log('Primary Color:', data.design?.primaryColor);
    console.log('Secondary Color:', data.design?.secondaryColor);
    console.log('Font Family:', data.design?.fontFamily);
    console.log('Full Design:', data.design);
  }

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
      marginBottom: `${(design.entrySpacing ?? 8) / 3}mm`,
      fontWeight: '700',
      fontSize: design.headingSize === 's' ? '0.85em' : design.headingSize === 'm' ? '1.05em' : design.headingSize === 'l' ? '1.25em' : '1em',
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
    <div className={`flex-1 w-full flex items-start justify-center overflow-x-hidden ${isThumbnail ? 'p-0 overflow-hidden bg-transparent' : 'overflow-y-auto pt-[76px] pb-12 px-6 bg-[#f1f5f9] custom-scrollbar'}`}>
      <GoogleFontsLoader fontFamily={design.fontFamily || 'Inter'} />
      <div 
        className="relative transition-all duration-500 ease-out" 
        style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center', marginBottom: isThumbnail ? '0' : `${(zoomLevel / 100 - 1) * 297 * 3.78}px` }}
      >
        {!isThumbnail && !isExporting && numPages > 1 && Array.from({ length: numPages - 1 }).map((_, i) => (
          <div
            key={i}
            className="absolute left-0 right-0 z-20 pointer-events-none flex items-center justify-center -mx-10"
            style={{ top: `${(i + 1) * A4_HEIGHT_PX}px`, transform: 'translateY(-24px)' }}
          >
            <div className="w-full h-12 bg-[#f1f5f9] border-y border-slate-200/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]" />
            <div className="absolute flex items-center gap-4 bg-white/80 backdrop-blur-xl px-5 py-2 rounded-full shadow-xl border border-white/40 ring-1 ring-slate-100/50">
               <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">PAGE {i + 1}</span>
               <div className="w-1 h-3 bg-slate-200 rounded-full" />
               <span className="text-[9px] font-bold text-[#ff4d7d] uppercase tracking-[0.2em]">PAGE {i + 2}</span>
            </div>
          </div>
        ))}

        <div
          ref={previewRef}
          id="resume-preview"
          className={`bg-white rounded-[1px] ${isExporting ? 'shadow-none mb-0 overflow-visible' : 'shadow-[0_20px_50px_rgba(0,0,0,0.1)] mb-20 overflow-hidden'}`}
          style={{
            fontFamily: design.fontFamily ?? 'Inter',
            fontSize: `${design.fontSize ?? 10.5}pt`,
            lineHeight: design.lineHeight ?? 1.45,
            width: '210mm',
            minHeight: '297mm',
            color: design.textColor ?? '#1f2937',
            paddingLeft: `${design.marginLR ?? 20}mm`,
            paddingRight: `${design.marginLR ?? 20}mm`,
            paddingTop: `${design.marginTB ?? 20}mm`,
            paddingBottom: `${design.marginTB ?? 20}mm`,
            backgroundColor: design.backgroundColor ?? '#ffffff', // Applied to outer container
          }}
        >
          <div className={`flex flex-col h-full ${isThumbnail ? 'min-h-0' : 'min-h-[297mm]'}`}>
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
      </div>
    </div>
  );
};

/* --- Shared Components --- */

const RichContent = ({ html, className = '' }: { html: string, className?: string }) => {
  if (!html || html === '<p></p>') return null;
  return <div className={`rich-content ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
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
          className={`relative group/section transition-all duration-200 ${snapshot.isDragging ? 'bg-blue-50/30 ring-2 ring-blue-200 ring-offset-4 rounded-xl scale-[1.01] z-50' : ''} ${isSelected ? 'ring-2 ring-[#ff4d7d] ring-offset-4 rounded-xl' : ''}`}
          style={{ ...provided.draggableProps.style, breakInside: 'avoid', pageBreakInside: 'avoid' }}
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
          <div className={`${layout === 'single' ? 'text-center max-w-4xl mx-auto' : ''}`} style={{ marginBottom: `${design.sectionSpacing ?? 8}mm`, breakInside: 'avoid', pageBreakInside: 'avoid' }}>
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
             <RichContent html={personalInfo.summary} className={`leading-[1.6] opacity-80 ${layout === 'single' ? 'text-[1.15em] font-medium italic text-slate-600' : 'text-[1.05em]'}`} />
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
          if (isLanguages) return item.language;
          if (isCertifications) return `${item.name} (${item.issuer})`;
          if (sid === 'socials') return item.platform || item.label || item.url;
          if (isSkills || isInterests) return item.name || '';
          return item.label || String(item);
        };

       return (
          <div style={{ marginBottom: `${design.sectionSpacing ?? 8}mm`, breakInside: 'avoid', pageBreakInside: 'avoid' }}>
            <SectionHeader
              title={isSkills ? 'Skills' : isInterests ? 'Interests' : isLanguages ? 'Languages' : isCertifications ? 'Certifications' : 'Socials'}
              style={getStyle(layout === 'sidebar')}
              headingStyle={headingMeta.headingStyleId}
              lineColor={headingMeta.lineColor}
              lineThick={headingMeta.lineThick}
              lineWidth={headingMeta.lineWidth}
            />

            {styleType === 'compact' ? (
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 opacity-80 font-medium text-[0.95em]">
                {items.map((item, i) => (
                  <React.Fragment key={i}>
                    <span>{getItemLabel(item)}</span>
                    {i < items.length - 1 && <span className="opacity-30">•</span>}
                  </React.Fragment>
                ))}
              </div>
            ) : styleType === 'bubble' ? (
              <div className="flex flex-wrap gap-2">
                {items.map((item, i) => (
                  <span 
                    key={i} 
                    className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-full font-bold opacity-80 text-[0.85em]" 
                    style={{ color: getAccentColor('dots'), backgroundColor: `${design.primaryColor || '#ff4d7d'}10`, borderColor: `${design.primaryColor || '#ff4d7d'}20` }}
                  >
                    {getItemLabel(item)}
                  </span>
                ))}
              </div>
            ) : styleType === 'level' ? (
              <div className={`grid gap-x-6 gap-y-3`} style={{ gridTemplateColumns: layout === 'sidebar' ? '1fr' : `repeat(${columns}, minmax(0, 1fr))` }}>
                {items.map((item, i) => {
                  const level = getLevel(item);
                  return (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between items-center text-[0.85em] font-bold opacity-80">
                        <span>{getItemLabel(item)}</span>
                        {isLanguages && typeof item === 'object' && item !== null && 'language' in item && 'proficiency' in item && <span className="opacity-40 text-[0.9em]">{item.proficiency}</span>}
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${isExporting ? '' : 'transition-all'}`} style={{ width: `${level}%`, backgroundColor: design.primaryColor || '#ff4d7d' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Default: GRID */
              <div className={`grid gap-x-4 gap-y-1.5`} style={{ gridTemplateColumns: layout === 'sidebar' ? '1fr' : `repeat(${columns}, minmax(0, 1fr))` }}>
                {items.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-[0.95em] font-medium opacity-80">
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: design.primaryColor || '#ff4d7d' }} />
                    <span>{getItemLabel(item)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
       );
   }

   let listProps = { title: '', items: [] as any[] };
   if (sid === 'experience') listProps = { title: 'Experience', items: content.experience?.map((x: any) => ({ t: x.position, s: x.company, d: `${x.startDate} ${x.endDate ? '— '+x.endDate : ''}`, desc: x.description })) || [] };
   else if (sid === 'education') listProps = { title: 'Education', items: content.education?.map((x: any) => ({ t: design.educationOrder === 'school-degree' ? x.school : x.degree, s: design.educationOrder === 'school-degree' ? `${x.degree} in ${x.field}` : x.school, d: x.graduationYear, desc: '' })) || [] };
   else if (sid === 'projects') listProps = { title: 'Projects', items: content.projects?.map((x: any) => ({ t: x.name, s: x.technologies?.join(', '), d: '', desc: x.description })) || [] };
   else if (sid === 'awards') listProps = { title: 'Awards', items: content.awards?.map((x: any) => ({ t: x.title, s: x.issuer, d: x.date, desc: x.description })) || [] };
   else if (sid === 'courses') listProps = { title: 'Courses', items: content.courses?.map((x: any) => ({ t: x.title, s: x.provider, d: x.date, desc: x.description })) || [] };
   else if (sid === 'organisations') listProps = { title: 'Organisations', items: content.organisations?.map((x: any) => ({ t: x.name, s: x.role, d: `${x.startDate} ${x.endDate ? '— '+x.endDate : ''}`, desc: x.description })) || [] };
   else if (sid === 'publications') listProps = { title: 'Publications', items: content.publications?.map((x: any) => ({ t: x.title, s: x.publisher, d: x.date, desc: x.description })) || [] };
   else if (sid === 'references') listProps = { title: 'References', items: content.references?.map((x: any) => ({ t: x.name, s: `${x.position} at ${x.company}`, d: '', desc: `${x.email} ${x.phone}` })) || [] };
   else if (sid === 'custom') listProps = { title: 'Custom Section', items: content.custom?.map((x: any) => ({ t: x.title, s: '', d: '', desc: x.content })) || [] };

   if (!listProps.items || listProps.items.length === 0) return null;

   const titleSize = design.entryTitleSize === 's' ? '0.95em' : design.entryTitleSize === 'm' ? '1.05em' : '1.15em';
   const subtitleStyle = design.entrySubtitleStyle || 'medium';
   const subtitlePlacement = design.entrySubtitlePlacement || 'next-line';

   return (
      <div style={{ marginBottom: `${design.sectionSpacing ?? 8}mm` }}>
         <SectionHeader
           title={listProps.title}
           style={layout === 'single' ? { ...getStyle(false), textAlign: design.personalAlign ?? 'left', width: '100%', display: 'block' } : getStyle(layout === 'sidebar')}
           headingStyle={headingMeta.headingStyleId}
           lineColor={headingMeta.lineColor}
           lineThick={headingMeta.lineThick}
           lineWidth={headingMeta.lineWidth}
         />
         <div className="space-y-0" style={{ gap: `${design.entrySpacing ?? 8}mm`, display: 'flex', flexDirection: 'column' }}>
            {listProps.items.map((item, i) => {
              const EntryContainer = ({ children }: { children: React.ReactNode }) => (
                <div key={i} className={`relative`} style={{ breakInside: 'avoid', pageBreakInside: 'avoid', marginBottom: `${design.entrySpacing ?? 8}mm` }}>
                   {children}
                </div>
              );

              if (design.entryLayout === 'side-date') {
                return (
                  <EntryContainer key={i}>
                    <div className="grid grid-cols-12 gap-5">
                       <div className="col-span-3 text-right">
                          <span className="text-[0.85em] font-bold opacity-30 uppercase tabular-nums" style={{ color: getAccentColor('dates') }}>{item.d}</span>
                       </div>
                       <div className="col-span-9">
                          <h3 style={{ fontSize: titleSize, color: getAccentColor('name'), fontWeight: '700' }}>{item.t}</h3>
                          {item.s && (
                            <p className={`${subtitleStyle === 'bold' ? 'font-bold text-slate-800' : subtitleStyle === 'italic' ? 'italic' : 'font-medium text-slate-600'} opacity-80`} style={{ fontSize: '0.95em', color: getAccentColor('entrySubtitle') }}>
                              {item.s}
                            </p>
                          )}
                          <RichContent html={item.desc} className={`text-[0.95em] leading-relaxed opacity-75 mt-1.5 ${design.descriptionIndent ? 'pl-4 border-l-2 border-slate-100' : ''}`} />
                       </div>
                    </div>
                  </EntryContainer>
                );
              }

              if (design.entryLayout === 'split') {
                 return (
                  <EntryContainer key={i}>
                    <div className="flex justify-between gap-4">
                       <div className="flex-1">
                          <h3 style={{ fontSize: titleSize, color: getAccentColor('name'), fontWeight: '700' }}>{item.t}</h3>
                          {item.s && (
                            <p className={`${subtitleStyle === 'bold' ? 'font-bold text-slate-800' : subtitleStyle === 'italic' ? 'italic' : 'font-medium text-slate-600'} opacity-80`} style={{ fontSize: '0.95em', color: getAccentColor('entrySubtitle') }}>
                              {item.s}
                            </p>
                          )}
                       </div>
                       <div className="text-right shrink-0">
                          <span className="text-[0.85em] font-bold opacity-30 uppercase tabular-nums" style={{ color: getAccentColor('dates') }}>{item.d}</span>
                       </div>
                    </div>
                    <RichContent html={item.desc} className={`text-[0.95em] leading-relaxed opacity-75 mt-1.5 ${design.descriptionIndent ? 'pl-4 border-l-2 border-slate-100' : ''}`} />
                  </EntryContainer>
                 );
              }

              return (
                <EntryContainer key={i}>
                   <div className={`flex ${subtitlePlacement === 'same-line' ? 'items-baseline gap-2' : 'flex-col'} justify-between`}>
                      <div className="flex justify-between items-baseline flex-1">
                        <h3 style={{ fontSize: titleSize, color: getAccentColor('name'), fontWeight: '700' }}>{item.t}</h3>
                        {subtitlePlacement === 'same-line' && item.s && <span className="mx-2 opacity-20 text-slate-300">•</span>}
                        {subtitlePlacement === 'same-line' && item.s && (
                          <span className={`${subtitleStyle === 'bold' ? 'font-bold text-slate-800' : subtitleStyle === 'italic' ? 'italic' : 'font-medium text-slate-600'} opacity-80 flex-1`} style={{ fontSize: '0.95em', color: getAccentColor('entrySubtitle') }}>{item.s}</span>
                        )}
                        <span className="text-[0.85em] font-bold opacity-30 uppercase tabular-nums shrink-0" style={{ color: getAccentColor('dates') }}>{item.d}</span>
                      </div>
                      {subtitlePlacement === 'next-line' && item.s && (
                         <p className={`${subtitleStyle === 'bold' ? 'font-bold text-slate-800' : subtitleStyle === 'italic' ? 'italic' : 'font-medium text-slate-600'} opacity-80 mt-0.5`} style={{ fontSize: '0.95em', color: getAccentColor('entrySubtitle') }}>{item.s}</p>
                      )}
                   </div>
                   <RichContent html={item.desc} className={`text-[0.95em] leading-relaxed opacity-75 mt-1.5 ${design.descriptionIndent ? 'pl-4 border-l-2 border-slate-100' : ''}`} />
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
    <div className={`flex flex-row h-full ${isThumbnail ? 'min-h-0' : 'min-h-[297mm]'} ${isRight ? 'flex-row-reverse' : ''}`}>
      <div className={`${isThumbnail ? 'w-[32%] h-full p-6 flex flex-col gap-6' : 'w-[32%] h-full p-8 flex flex-col gap-6'}`} style={{ backgroundColor: design.secondaryColor || '#f8fafc', borderRight: isRight ? 'none' : '1px solid rgba(0,0,0,0.05)', borderLeft: isRight ? '1px solid rgba(0,0,0,0.05)' : 'none' }}>
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
            <h1 className={`${design.nameBold ? 'font-black' : 'font-medium'} leading-tight tracking-tight`} style={{ color: getAccentColor('name'), fontSize: design.nameSize === 'xl' ? '2.5em' : design.nameSize === 'l' ? '2.1em' : '1.8em' }}>{personalInfo.fullName || 'Name'}</h1>
            <p className="text-[0.9em] font-bold opacity-40 uppercase tracking-[0.2em]" style={{ color: getAccentColor('jobTitle') }}>{personalInfo.professionalTitle || ''}</p>
          </div>
        </div>

        <div className="space-y-6">
           <div className="space-y-3">
             <h2 className="text-[0.85em] font-bold uppercase tracking-[0.2em] opacity-40 border-b pb-1" style={{ borderColor: `${design.primaryColor || '#ff4d7d'}15`, color: getAccentColor('headings') }}>Contact</h2>
             <div className="space-y-2 text-[0.85em] font-bold opacity-80">
                {personalInfo.email && <div className="flex items-center gap-2" style={{ color: getAccentColor('contactIcon') }}><Mail size={12} strokeWidth={2.5} /> <span className="text-slate-600 truncate">{personalInfo.email}</span></div>}
                {personalInfo.phone && <div className="flex items-center gap-2" style={{ color: getAccentColor('contactIcon') }}><Phone size={12} strokeWidth={2.5} /> <span className="text-slate-600 truncate">{personalInfo.phone}</span></div>}
                {personalInfo.location && <div className="flex items-center gap-2" style={{ color: getAccentColor('contactIcon') }}><MapPin size={12} strokeWidth={2.5} /> <span className="text-slate-600 truncate">{personalInfo.location}</span></div>}
             </div>
           </div>

           <Droppable droppableId="sidebar">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="flex flex-col gap-6">
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

      <div className={`${isThumbnail ? 'p-6' : 'p-8'} flex-1`}>
         <Droppable droppableId="main">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="flex flex-col gap-4">
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
    </div>
  );
};

const ModernHeaderLayout = ({ data, getSectionStyle, isThumbnail, isExporting, selectedSectionId, onSelectSection, getAccentColor, getHeadingMeta }: { data: ResumeData, getSectionStyle: (s?: boolean) => React.CSSProperties, isThumbnail?: boolean, isExporting?: boolean, selectedSectionId?: string | null, onSelectSection?: (sid: string) => void, getAccentColor: any, getHeadingMeta: any }) => {
  const design = data.design || {} as any;
  const content = data.content || {} as any;
  const personalInfo = content.personalInfo || {} as any;
  
  return (
    <div className="flex flex-col h-full overflow-hidden">
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
        <h1 className={`${design.nameBold ? 'font-black' : 'font-medium'} mb-1 capitalize tracking-tight leading-none`} style={{ color: getAccentColor('name'), fontSize: design.nameSize === 'xl' ? '3.5em' : design.nameSize === 'l' ? '3em' : '2.5em' }}>{personalInfo.fullName || 'Name'}</h1>
        <p className="text-[1.1em] font-bold opacity-30 uppercase tracking-[0.2em] mb-4" style={{ color: getAccentColor('jobTitle') }}>{personalInfo.professionalTitle || ''}</p>
        
        <div className={`flex flex-wrap gap-x-8 gap-y-2 text-[0.85em] font-bold opacity-70 ${design.personalAlign === 'center' ? 'justify-center' : design.personalAlign === 'right' ? 'justify-end' : 'justify-start'}`}>
          {personalInfo.email && <div className="flex items-center gap-2" style={{ color: getAccentColor('contactIcon') }}><Mail size={12} strokeWidth={2.5} /> <span className="text-slate-900">{personalInfo.email}</span></div>}
          {personalInfo.phone && <div className="flex items-center gap-2" style={{ color: getAccentColor('contactIcon') }}><Phone size={12} strokeWidth={2.5} /> <span className="text-slate-900">{personalInfo.phone}</span></div>}
          {personalInfo.location && <div className="flex items-center gap-2" style={{ color: getAccentColor('contactIcon') }}><MapPin size={12} strokeWidth={2.5} /> <span className="text-slate-900">{personalInfo.location}</span></div>}
        </div>
      </div>
      
      <div className={`${isThumbnail ? 'p-6' : 'p-8'} pt-0 w-full`}>
         <Droppable droppableId="modern-main">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="flex flex-col gap-4">
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
    <div className={`flex flex-col ${isThumbnail ? 'p-8' : 'p-10'} pt-0 max-w-[100%] mx-auto w-full`}>
      <div className={`flex flex-col space-y-6 relative pb-8 w-full ${design.personalAlign === 'center' ? 'items-center text-center' : design.personalAlign === 'right' ? 'items-end text-right' : 'items-start text-left'}`} style={{ marginBottom: `${design.sectionSpacing || 8}mm`, paddingTop: `${design.sectionSpacing || 8}mm` }}>
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

        <h1 className={`${design.nameBold ? 'font-black' : 'font-medium'} tracking-tighter uppercase leading-none`} style={{ color: getAccentColor('name'), fontSize: design.nameSize === 'xl' ? '4.5em' : design.nameSize === 'l' ? '3.8em' : '3em' }}>{personalInfo.fullName || 'Name'}</h1>
        <p className="text-[1.5em] font-bold opacity-30 tracking-[0.3em] uppercase" style={{ color: getAccentColor('jobTitle') }}>{personalInfo.professionalTitle || ''}</p>
        
        <div className={`flex flex-wrap gap-8 text-[0.85em] font-bold tracking-widest opacity-50 uppercase tabular-nums ${design.personalAlign === 'center' ? 'justify-center' : design.personalAlign === 'right' ? 'justify-end' : 'justify-start'}`}>
           {personalInfo.email && <div className="flex items-center gap-2" style={{ color: getAccentColor('contactIcon') }}><Mail size={12} strokeWidth={2.5} /> {personalInfo.email}</div>}
           {personalInfo.phone && <div className="flex items-center gap-2" style={{ color: getAccentColor('contactIcon') }}><Phone size={12} strokeWidth={2.5} /> {personalInfo.phone}</div>}
           {personalInfo.location && <div className="flex items-center gap-2" style={{ color: getAccentColor('contactIcon') }}><MapPin size={12} strokeWidth={2.5} /> {personalInfo.location}</div>}
        </div>
      </div>

      <Droppable droppableId="single-main">
         {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="flex flex-col gap-0 w-full">
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
    <div className={`flex-1 flex flex-col h-full ${isThumbnail ? 'min-h-0' : 'min-h-[297mm]'} bg-white`}>
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
              <h1 className={`${design.nameBold ? 'font-black' : 'font-bold'} text-[2.5em] uppercase tracking-tight leading-none mb-1`}>{personalInfo.fullName || 'Name'}</h1>
              <p className="text-[0.85em] font-black opacity-80 uppercase tracking-[0.2em]">{personalInfo.professionalTitle || ''}</p>
            </div>
         </div>
         <div className="z-10 bg-white/10 px-6 py-3 rounded-2xl border border-white/20 backdrop-blur-md">
            <div className="flex flex-col gap-1 text-[0.85em] font-black uppercase tracking-widest text-white/90">
               {personalInfo.email && <div className="flex items-center gap-2"><Mail size={10} strokeWidth={3} /> {personalInfo.email}</div>}
               {personalInfo.phone && <div className="flex items-center gap-2"><Phone size={10} strokeWidth={3} /> {personalInfo.phone}</div>}
            </div>
         </div>
      </div>
      <div className={`bg-slate-50 border-b border-slate-100 flex flex-wrap justify-center gap-8 items-center ${isThumbnail ? 'py-2' : 'py-4'} text-[0.85em] font-black tracking-[0.2em] uppercase text-slate-400`} style={{ marginBottom: `${design.sectionSpacing || 8}mm` }}>
         {personalInfo.location && <div className="flex items-center gap-2" style={{ color: getAccentColor('contactIcon') }}><MapPin size={10} strokeWidth={3} /> {personalInfo.location}</div>}
         {(personalInfo as any).linkedin && <div className="flex items-center gap-2" style={{ color: getAccentColor('contactIcon') }}><Linkedin size={10} strokeWidth={3} /> Profile</div>}
      </div>
      <div className={`${isThumbnail ? 'p-6 pt-0' : 'p-8 pt-0'} w-full`}>
         <Droppable droppableId="double-main">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="flex flex-col gap-4">
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
