'use client';

import { useMemo } from 'react';
import { useResumeStore } from '@/store/resumeStore';
import { getThemeById } from '@/themes/themeRegistry';
import { getTemplateById } from '@/templates/templateRegistry';

export const useResumeBuilder = () => {
  const resume = useResumeStore((s) => s.resume);
  const setTheme = useResumeStore((s) => s.setTheme);
  const setLayout = useResumeStore((s) => s.setLayout);
  const setTemplate = useResumeStore((s) => s.setTemplate);
  const undo = useResumeStore((s) => s.undo);
  const redo = useResumeStore((s) => s.redo);
  const reorderSections = useResumeStore((s) => s.reorderSections);

  const theme = useMemo(() => getThemeById(resume.themeId), [resume.themeId]);
  const template = useMemo(() => getTemplateById(resume.templateId), [resume.templateId]);

  return {
    resume,
    theme,
    template,
    setTheme,
    setLayout,
    setTemplate,
    undo,
    redo,
    reorderSections,
  };
};
