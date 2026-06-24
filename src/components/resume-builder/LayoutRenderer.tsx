'use client';

import React from 'react';
import { ResumeData, LayoutType } from './types/resume.types';
import SingleColumnLayout from './layouts/SingleColumnLayout';
import SidebarLayout from './layouts/SidebarLayout';
import ModernLayout from './layouts/ModernLayout';
import TwoColumnLayout from './layouts/TwoColumnLayout';

const layoutRegistry: Record<LayoutType, React.FC<{
  data: ResumeData;
  onUpdate?: (sectionId: string, blockId: string, content: any) => void;
  onUpdateSection?: (sectionId: string, updates: Partial<any>) => void;
  isEditing?: boolean;
}>> = {
  single: SingleColumnLayout,
  'sidebar-left': SidebarLayout,
  'sidebar-right': SidebarLayout,
  'two-column': TwoColumnLayout,
  'modern-header': ModernLayout,
  'double-header': ModernLayout,
  creative: ModernLayout,
  minimal: SingleColumnLayout,
};

interface LayoutRendererProps {
  data: ResumeData;
  onUpdate?: (sectionId: string, blockId: string, content: any) => void;
  onUpdateSection?: (sectionId: string, updates: Partial<any>) => void;
  isEditing?: boolean;
}

const LayoutRenderer: React.FC<LayoutRendererProps> = ({
  data,
  onUpdate,
  onUpdateSection,
  isEditing = true,
}) => {
  const Layout = layoutRegistry[data.layout] || SingleColumnLayout;

  if (!data || !data.sections || data.sections.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-sm font-medium">
        <div className="text-center">
          <div className="text-4xl mb-3">📄</div>
          <p>No resume data available</p>
          <p className="text-xs opacity-60 mt-1">Add a section to get started</p>
        </div>
      </div>
    );
  }

  return (
    <Layout
      data={data}
      onUpdate={onUpdate}
      onUpdateSection={onUpdateSection}
      isEditing={isEditing}
    />
  );
};

export default LayoutRenderer;