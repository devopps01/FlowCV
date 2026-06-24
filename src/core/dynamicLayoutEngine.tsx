'use client';

import type { LayoutId, ResumeData } from '@/types/resume-builder.types';
import type { FC } from 'react';
import { layoutMap } from '@/layouts/layoutMap';

export const resolveLayoutComponent = (layoutId: LayoutId): FC<{ resume: ResumeData }> => {
  return layoutMap[layoutId] || layoutMap.single;
};

export const listAvailableLayouts = (): LayoutId[] => Object.keys(layoutMap) as LayoutId[];
