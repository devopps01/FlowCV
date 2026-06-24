import { create } from 'zustand';
import type { DeviceMode } from '@/types/resume-builder.types';

interface EditorStoreState {
  zoom: number;
  device: DeviceMode;
  selectedSectionId: string | null;
  selectedBlockId: string | null;
  setZoom: (zoom: number) => void;
  setDevice: (device: DeviceMode) => void;
  selectSection: (id: string | null) => void;
  selectBlock: (id: string | null) => void;
}

export const useEditorStore = create<EditorStoreState>((set) => ({
  zoom: 1,
  device: 'desktop',
  selectedSectionId: null,
  selectedBlockId: null,
  setZoom: (zoom) => set({ zoom }),
  setDevice: (device) => set({ device }),
  selectSection: (id) => set({ selectedSectionId: id }),
  selectBlock: (id) => set({ selectedBlockId: id }),
}));
