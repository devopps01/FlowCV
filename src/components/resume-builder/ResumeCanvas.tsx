'use client';

import React, { useEffect, useRef } from 'react';
import { ResumeData } from './types/resume.types';
import LayoutRenderer from './LayoutRenderer';

interface ResumeCanvasProps {
  data: ResumeData;
  onUpdate?: (sectionId: string, blockId: string, content: any) => void;
  onUpdateSection?: (sectionId: string, updates: Partial<any>) => void;
  isEditing?: boolean;
  zoom?: number;
  containerRef?: React.RefObject<HTMLDivElement>;
}

const A4_WIDTH = 210; // mm
const A4_HEIGHT = 297; // mm

const ResumeCanvas: React.FC<ResumeCanvasProps> = ({
  data,
  onUpdate,
  onUpdateSection,
  isEditing = true,
  zoom = 100,
  containerRef,
}) => {
  const theme = data.theme;
  const scale = zoom / 100;

  return (
    <div
      id="resume-canvas"
      className="resume-paper bg-white shadow-2xl mx-auto overflow-hidden"
      style={{
        width: `${A4_WIDTH}mm`,
        minHeight: `${A4_HEIGHT}mm`,
        fontFamily: theme.fontFamily,
        fontSize: `${Math.min(14, Math.max(10, Math.round((theme.fontSize || 10.5) * 1.333)))}px`,
        lineHeight: theme.lineHeight || 1.45,
        color: theme.textColor,
        backgroundColor: theme.backgroundColor || '#ffffff',
        paddingLeft: `${Math.min(25, Math.max(6, theme.marginLR || 20))}mm`,
        paddingRight: `${Math.min(25, Math.max(6, theme.marginLR || 20))}mm`,
        paddingTop: `${Math.min(25, Math.max(6, theme.marginTB || 20))}mm`,
        paddingBottom: `${Math.min(25, Math.max(6, theme.marginTB || 20))}mm`,
        boxSizing: 'border-box',
        transform: `scale(${scale})`,
        transformOrigin: 'top center',
        borderRadius: theme.borderRadius === 'lg' ? '12px' : theme.borderRadius === 'xl' ? '16px' : '0',
      }}
    >
      <LayoutRenderer
        data={data}
        onUpdate={onUpdate}
        onUpdateSection={onUpdateSection}
        isEditing={isEditing}
      />
    </div>
  );
};

export default ResumeCanvas;