import { create } from 'zustand';
import type { ResumeData } from '@/types/resume-builder.types';

interface HistoryStoreState {
  past: ResumeData[];
  future: ResumeData[];
  push: (snapshot: ResumeData) => void;
  undo: (current: ResumeData) => ResumeData | null;
  redo: (current: ResumeData) => ResumeData | null;
  clear: () => void;
}

export const useHistoryStore = create<HistoryStoreState>((set, get) => ({
  past: [],
  future: [],
  push: (snapshot) => set((state) => ({ past: [...state.past, structuredClone(snapshot)], future: [] })),
  undo: (current) => {
    const state = get();
    if (state.past.length === 0) return null;
    const previous = state.past[state.past.length - 1];
    set({
      past: state.past.slice(0, -1),
      future: [structuredClone(current), ...state.future],
    });
    return structuredClone(previous);
  },
  redo: (current) => {
    const state = get();
    if (state.future.length === 0) return null;
    const next = state.future[0];
    set({
      past: [...state.past, structuredClone(current)],
      future: state.future.slice(1),
    });
    return structuredClone(next);
  },
  clear: () => set({ past: [], future: [] }),
}));
