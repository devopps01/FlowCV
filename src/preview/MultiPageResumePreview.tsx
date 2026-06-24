'use client';

import React from 'react';
import type { ResumeData } from '@/types/resume-builder.types';
import { DynamicResumePreview } from '@/preview/DynamicResumePreview';

export const MultiPageResumePreview: React.FC<{ resume: ResumeData; pages?: number }> = ({ resume, pages = 1 }) => {
  return (
    <div className="flex flex-col items-center gap-6">
      {Array.from({ length: Math.max(1, pages) }).map((_, index) => (
        <DynamicResumePreview key={index} resume={resume} className="rounded bg-white shadow" />
      ))}
    </div>
  );
};
