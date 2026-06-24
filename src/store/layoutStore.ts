import { create } from 'zustand';
import type { LayoutId } from '@/types/resume-builder.types';

interface LayoutStoreState {
  activeLayoutId: LayoutId;
  setLayout: (layoutId: LayoutId) => void;
}

export const useLayoutStore = create<LayoutStoreState>((set) => ({
  activeLayoutId: 'single',
  setLayout: (layoutId) => set({ activeLayoutId: layoutId }),
}));
