import { create } from 'zustand';
import type { ThemeId } from '@/types/resume-builder.types';

interface ThemeStoreState {
  activeThemeId: ThemeId;
  setTheme: (themeId: ThemeId) => void;
}

export const useThemeStore = create<ThemeStoreState>((set) => ({
  activeThemeId: 'default',
  setTheme: (themeId) => set({ activeThemeId: themeId }),
}));
