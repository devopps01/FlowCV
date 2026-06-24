// ============================================================
// RESUME STORE - Central Zustand Store for Resume Management
// ============================================================

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type {
  ResumeData,
  ResumeSection,
  ResumeBlock,
  GlobalStyle,
  ResumeMetadata,
  EditorState,
  HistoryState,
  HistoryEntry,
  EditorMode,
  ZoomLevel,
  DeviceMode,
  ThemeId,
  LayoutType,
  TemplateId,
  EntityId,
} from '@/types/resume.types';
import { defaultGlobalStyle } from '@/types/resume.types';

// ─── ID Generator ───
function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// ─── Default Editor State ───
const defaultEditorState: EditorState = {
  mode: 'edit',
  zoom: 1,
  device: 'desktop',
  selectedSectionId: null,
  selectedBlockId: null,
  isDragging: false,
  isResizing: false,
  showGrid: false,
  showRulers: false,
  snapToGrid: false,
  gridSize: 10,
};

// ─── Default History State ───
const defaultHistoryState: HistoryState = {
  past: [],
  future: [],
  currentIndex: -1,
  maxEntries: 50,
  isLocked: false,
};

// ─── Default Resume Data ───
function createDefaultResume(): ResumeData {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    name: 'Untitled Resume',
    templateId: 'default',
    layoutId: 'modern',
    themeId: 'default',
    sections: [
      {
        id: generateId(),
        type: 'header',
        title: 'Header',
        visible: true,
        order: 0,
        blocks: [
          {
            id: generateId(),
            type: 'heading',
            content: { text: 'John Doe', level: 1 },
            order: 0,
          },
          {
            id: generateId(),
            type: 'text',
            content: { text: 'Full Stack Developer with 8+ years of experience building scalable web applications' },
            order: 1,
          },
        ],
      },
      {
        id: generateId(),
        type: 'contact',
        title: 'Contact',
        visible: true,
        order: 1,
        blocks: [
          {
            id: generateId(),
            type: 'contact',
            content: {
              email: 'john@example.com',
              phone: '+1 (555) 123-4567',
              city: 'San Francisco',
              state: 'CA',
            },
            order: 0,
          },
        ],
      },
      {
        id: generateId(),
        type: 'experience',
        title: 'Experience',
        visible: true,
        order: 2,
        blocks: [
          {
            id: generateId(),
            type: 'experience',
            content: {
              company: 'Tech Corp',
              position: 'Senior Full Stack Developer',
              startDate: 'Jan 2020',
              endDate: 'Present',
              current: true,
              description: 'Leading development of microservices architecture serving 2M+ users',
              highlights: ['Architected cloud-native solutions on AWS', 'Reduced deployment time by 60%', 'Mentored team of 5 junior developers'],
              technologies: ['React', 'Node.js', 'TypeScript', 'AWS'],
            },
            order: 0,
          },
          {
            id: generateId(),
            type: 'experience',
            content: {
              company: 'StartupXYZ',
              position: 'Full Stack Developer',
              startDate: 'Jun 2017',
              endDate: 'Dec 2019',
              current: false,
              description: 'Built and maintained customer-facing web applications',
              highlights: ['Developed real-time collaboration features', 'Implemented CI/CD pipelines'],
              technologies: ['Angular', 'Python', 'PostgreSQL'],
            },
            order: 1,
          },
        ],
      },
      {
        id: generateId(),
        type: 'education',
        title: 'Education',
        visible: true,
        order: 3,
        blocks: [
          {
            id: generateId(),
            type: 'education',
            content: {
              institution: 'University of Technology',
              degree: 'B.S.',
              field: 'Computer Science',
              startDate: 'Sep 2013',
              endDate: 'Jun 2017',
              current: false,
              gpa: '3.8',
            },
            order: 0,
          },
        ],
      },
      {
        id: generateId(),
        type: 'skills',
        title: 'Skills',
        visible: true,
        order: 4,
        blocks: [
          {
            id: generateId(),
            type: 'skills',
            content: {
              tags: ['React', 'TypeScript', 'Node.js', 'Python', 'AWS', 'Docker', 'GraphQL', 'PostgreSQL'],
              category: 'Technical',
            },
            order: 0,
          },
        ],
      },
    ],
    globalStyle: { ...defaultGlobalStyle },
    metadata: {
      title: 'Full Stack Developer',
      tags: ['software', 'engineering'],
      isAtsFriendly: true,
    },
    version: 1,
    createdAt: now,
    updatedAt: now,
  };
}

// ─── Interface ───
interface ResumeStoreState {
  resume: ResumeData;
  editor: EditorState;
  history: HistoryState;
  isDirty: boolean;
  isLoading: boolean;
  error: string | null;

  // Resume
  setResume: (resume: ResumeData) => void;
  updateGlobalStyle: (style: Partial<GlobalStyle>) => void;
  updateMetadata: (metadata: Partial<ResumeMetadata>) => void;

  // Sections
  addSection: (section: Omit<ResumeSection, 'id' | 'order'>) => void;
  removeSection: (sectionId: EntityId) => void;
  updateSection: (sectionId: EntityId, updates: Partial<ResumeSection>) => void;
  reorderSections: (sectionIds: EntityId[]) => void;
  duplicateSection: (sectionId: EntityId) => void;
  toggleSectionVisibility: (sectionId: EntityId) => void;

  // Blocks
  addBlock: (sectionId: EntityId, block: Omit<ResumeBlock, 'id' | 'order'>) => void;
  removeBlock: (sectionId: EntityId, blockId: EntityId) => void;
  updateBlock: (sectionId: EntityId, blockId: EntityId, updates: Partial<ResumeBlock>) => void;
  reorderBlocks: (sectionId: EntityId, blockIds: EntityId[]) => void;
  duplicateBlock: (sectionId: EntityId, blockId: EntityId) => void;
  moveBlock: (fromSectionId: EntityId, toSectionId: EntityId, blockId: EntityId, index: number) => void;

  // Theme/Layout/Template
  setTheme: (themeId: ThemeId) => void;
  setLayout: (layoutId: LayoutType) => void;
  setTemplate: (templateId: TemplateId) => void;

  // Editor
  setEditorMode: (mode: EditorMode) => void;
  setZoom: (zoom: ZoomLevel) => void;
  setDevice: (device: DeviceMode) => void;
  selectSection: (sectionId: EntityId | null) => void;
  selectBlock: (blockId: EntityId | null) => void;
  setDragging: (isDragging: boolean) => void;
  setResizing: (isResizing: boolean) => void;

  // History
  undo: () => void;
  redo: () => void;
  saveSnapshot: (description?: string) => void;
  clearHistory: () => void;

  // Utility
  loadResume: (id: EntityId) => Promise<void>;
  saveResume: () => Promise<void>;
  resetResume: () => void;
  setError: (error: string | null) => void;
  setLoading: (isLoading: boolean) => void;
}

// ─── Store Implementation ───
export const useResumeStore = create<ResumeStoreState>()(
  devtools(
    (set, get) => ({
      resume: createDefaultResume(),
      editor: { ...defaultEditorState },
      history: { ...defaultHistoryState },
      isDirty: false,
      isLoading: false,
      error: null,

      // ─── Resume ───
      setResume: (resume) => {
        get().saveSnapshot('Set resume');
        set({ resume, isDirty: true, error: null });
      },

      updateGlobalStyle: (style) => {
        get().saveSnapshot('Update global style');
        set((state) => ({
          resume: {
            ...state.resume,
            globalStyle: { ...state.resume.globalStyle, ...style },
            updatedAt: new Date().toISOString(),
          },
          isDirty: true,
        }));
      },

      updateMetadata: (metadata) => {
        set((state) => ({
          resume: {
            ...state.resume,
            metadata: { ...state.resume.metadata, ...metadata },
            updatedAt: new Date().toISOString(),
          },
          isDirty: true,
        }));
      },

      // ─── Sections ───
      addSection: (section) => {
        get().saveSnapshot('Add section');
        const newSection: ResumeSection = {
          ...section,
          id: generateId(),
          order: get().resume.sections.length,
          blocks: section.blocks || [],
        } as ResumeSection;
        set((state) => ({
          resume: {
            ...state.resume,
            sections: [...state.resume.sections, newSection],
            updatedAt: new Date().toISOString(),
          },
          isDirty: true,
        }));
      },

      removeSection: (sectionId) => {
        get().saveSnapshot('Remove section');
        set((state) => ({
          resume: {
            ...state.resume,
            sections: state.resume.sections
              .filter((s) => s.id !== sectionId)
              .map((s, i) => ({ ...s, order: i })),
            updatedAt: new Date().toISOString(),
          },
          isDirty: true,
          editor: {
            ...state.editor,
            selectedSectionId: state.editor.selectedSectionId === sectionId ? null : state.editor.selectedSectionId,
          },
        }));
      },

      updateSection: (sectionId, updates) => {
        set((state) => ({
          resume: {
            ...state.resume,
            sections: state.resume.sections.map((s) =>
              s.id === sectionId ? { ...s, ...updates } : s
            ),
            updatedAt: new Date().toISOString(),
          },
          isDirty: true,
        }));
      },

      reorderSections: (sectionIds) => {
        get().saveSnapshot('Reorder sections');
        set((state) => {
          const sectionMap = new Map(state.resume.sections.map((s) => [s.id, s]));
          const reordered = sectionIds
            .map((id, index) => {
              const section = sectionMap.get(id);
              return section ? { ...section, order: index } : null;
            })
            .filter((s): s is ResumeSection => s !== null);
          return {
            resume: {
              ...state.resume,
              sections: reordered,
              updatedAt: new Date().toISOString(),
            },
            isDirty: true,
          };
        });
      },

      duplicateSection: (sectionId) => {
        get().saveSnapshot('Duplicate section');
        set((state) => {
          const section = state.resume.sections.find((s) => s.id === sectionId);
          if (!section) return state;
          const newSection: ResumeSection = {
            ...JSON.parse(JSON.stringify(section)),
            id: generateId(),
            title: `${section.title} (Copy)`,
            order: state.resume.sections.length,
            blocks: section.blocks.map((b) => ({
              ...JSON.parse(JSON.stringify(b)),
              id: generateId(),
            })),
          };
          return {
            resume: {
              ...state.resume,
              sections: [...state.resume.sections, newSection],
              updatedAt: new Date().toISOString(),
            },
            isDirty: true,
          };
        });
      },

      toggleSectionVisibility: (sectionId) => {
        set((state) => ({
          resume: {
            ...state.resume,
            sections: state.resume.sections.map((s) =>
              s.id === sectionId ? { ...s, visible: !s.visible } : s
            ),
            updatedAt: new Date().toISOString(),
          },
          isDirty: true,
        }));
      },

      // ─── Blocks ───
      addBlock: (sectionId, block) => {
        get().saveSnapshot('Add block');
        set((state) => {
          const section = state.resume.sections.find((s) => s.id === sectionId);
          if (!section) return state;
          const newBlock: ResumeBlock = {
            ...block,
            id: generateId(),
            order: section.blocks.length,
          } as ResumeBlock;
          return {
            resume: {
              ...state.resume,
              sections: state.resume.sections.map((s) =>
                s.id === sectionId
                  ? { ...s, blocks: [...s.blocks, newBlock] }
                  : s
              ),
              updatedAt: new Date().toISOString(),
            },
            isDirty: true,
          };
        });
      },

      removeBlock: (sectionId, blockId) => {
        get().saveSnapshot('Remove block');
        set((state) => ({
          resume: {
            ...state.resume,
            sections: state.resume.sections.map((s) =>
              s.id === sectionId
                ? {
                    ...s,
                    blocks: s.blocks
                      .filter((b) => b.id !== blockId)
                      .map((b, i) => ({ ...b, order: i })),
                  }
                : s
            ),
            updatedAt: new Date().toISOString(),
          },
          isDirty: true,
          editor: {
            ...state.editor,
            selectedBlockId: state.editor.selectedBlockId === blockId ? null : state.editor.selectedBlockId,
          },
        }));
      },

      updateBlock: (sectionId, blockId, updates) => {
        set((state) => ({
          resume: {
            ...state.resume,
            sections: state.resume.sections.map((s) =>
              s.id === sectionId
                ? {
                    ...s,
                    blocks: s.blocks.map((b) =>
                      b.id === blockId ? { ...b, ...updates } : b
                    ),
                  }
                : s
            ),
            updatedAt: new Date().toISOString(),
          },
          isDirty: true,
        }));
      },

      reorderBlocks: (sectionId, blockIds) => {
        get().saveSnapshot('Reorder blocks');
        set((state) => ({
          resume: {
            ...state.resume,
            sections: state.resume.sections.map((s) => {
              if (s.id !== sectionId) return s;
              const blockMap = new Map(s.blocks.map((b) => [b.id, b]));
              const reordered = blockIds
                .map((id, index) => {
                  const block = blockMap.get(id);
                  return block ? { ...block, order: index } : null;
                })
                .filter((b): b is ResumeBlock => b !== null);
              return { ...s, blocks: reordered };
            }),
            updatedAt: new Date().toISOString(),
          },
          isDirty: true,
        }));
      },

      duplicateBlock: (sectionId, blockId) => {
        get().saveSnapshot('Duplicate block');
        set((state) => ({
          resume: {
            ...state.resume,
            sections: state.resume.sections.map((s) => {
              if (s.id !== sectionId) return s;
              const block = s.blocks.find((b) => b.id === blockId);
              if (!block) return s;
              const newBlock: ResumeBlock = {
                ...JSON.parse(JSON.stringify(block)),
                id: generateId(),
                order: s.blocks.length,
              };
              return { ...s, blocks: [...s.blocks, newBlock] };
            }),
            updatedAt: new Date().toISOString(),
          },
          isDirty: true,
        }));
      },

      moveBlock: (fromSectionId, toSectionId, blockId, index) => {
        get().saveSnapshot('Move block');
        set((state) => {
          let movedBlock: ResumeBlock | null = null;
          const sections = state.resume.sections.map((s) => {
            if (s.id === fromSectionId) {
              const block = s.blocks.find((b) => b.id === blockId);
              if (block) movedBlock = { ...block };
              return {
                ...s,
                blocks: s.blocks
                  .filter((b) => b.id !== blockId)
                  .map((b, i) => ({ ...b, order: i })),
              };
            }
            return s;
          });
          if (!movedBlock) return state;
          return {
            resume: {
              ...state.resume,
              sections: sections.map((s) => {
                if (s.id === toSectionId) {
                  const blocks = [...s.blocks];
                  movedBlock!.order = index;
                  blocks.splice(index, 0, movedBlock!);
                  return {
                    ...s,
                    blocks: blocks.map((b, i) => ({ ...b, order: i })),
                  };
                }
                return s;
              }),
              updatedAt: new Date().toISOString(),
            },
            isDirty: true,
          };
        });
      },

      // ─── Theme/Layout/Template ───
      setTheme: (themeId) => {
        get().saveSnapshot('Change theme');
        set((state) => ({
          resume: {
            ...state.resume,
            themeId,
            updatedAt: new Date().toISOString(),
          },
          isDirty: true,
        }));
      },

      setLayout: (layoutId) => {
        get().saveSnapshot('Change layout');
        set((state) => ({
          resume: {
            ...state.resume,
            layoutId,
            updatedAt: new Date().toISOString(),
          },
          isDirty: true,
        }));
      },

      setTemplate: (templateId) => {
        get().saveSnapshot('Change template');
        set((state) => ({
          resume: {
            ...state.resume,
            templateId,
            updatedAt: new Date().toISOString(),
          },
          isDirty: true,
        }));
      },

      // ─── Editor ───
      setEditorMode: (mode) => set((state) => ({ editor: { ...state.editor, mode } })),
      setZoom: (zoom) => set((state) => ({ editor: { ...state.editor, zoom } })),
      setDevice: (device) => {
        const zoomMap: Record<DeviceMode, ZoomLevel> = {
          desktop: 1,
          tablet: 0.75,
          mobile: 0.5,
        };
        set((state) => ({
          editor: {
            ...state.editor,
            device,
            zoom: state.editor.zoom === 1 ? zoomMap[device] : state.editor.zoom,
          },
        }));
      },
      selectSection: (sectionId) => set((state) => ({ editor: { ...state.editor, selectedSectionId: sectionId, selectedBlockId: null } })),
      selectBlock: (blockId) => set((state) => ({ editor: { ...state.editor, selectedBlockId: blockId } })),
      setDragging: (isDragging) => set((state) => ({ editor: { ...state.editor, isDragging } })),
      setResizing: (isResizing) => set((state) => ({ editor: { ...state.editor, isResizing } })),

      // ─── History ───
      saveSnapshot: (description = 'Auto-save') => {
        set((state) => {
          if (state.history.isLocked) return state;
          const entry: HistoryEntry = {
            id: generateId(),
            timestamp: Date.now(),
            snapshot: JSON.parse(JSON.stringify(state.resume)),
            description,
            type: 'manual',
          };
          const past = [...state.history.past, entry];
          if (past.length > state.history.maxEntries) past.shift();
          return {
            history: {
              ...state.history,
              past,
              future: [],
              currentIndex: past.length - 1,
            },
          };
        });
      },

      undo: () => {
        set((state) => {
          if (state.history.past.length === 0) return state;
          const past = [...state.history.past];
          const entry = past.pop()!;
          const future = [
            {
              id: generateId(),
              timestamp: Date.now(),
              snapshot: JSON.parse(JSON.stringify(state.resume)),
              description: `Undo: ${entry.description}`,
              type: 'undo' as const,
            },
            ...state.history.future,
          ];
          return {
            resume: JSON.parse(JSON.stringify(entry.snapshot)),
            history: {
              ...state.history,
              past,
              future,
              currentIndex: past.length - 1,
              isLocked: true,
            },
            isDirty: true,
          };
        });
        // Unlock after a tick
        setTimeout(() => set((state) => ({ history: { ...state.history, isLocked: false } })), 0);
      },

      redo: () => {
        set((state) => {
          if (state.history.future.length === 0) return state;
          const future = [...state.history.future];
          const entry = future.shift()!;
          const past = [
            ...state.history.past,
            {
              id: generateId(),
              timestamp: Date.now(),
              snapshot: JSON.parse(JSON.stringify(state.resume)),
              description: `Redo: ${entry.description}`,
              type: 'redo' as const,
            },
          ];
          return {
            resume: JSON.parse(JSON.stringify(entry.snapshot)),
            history: {
              ...state.history,
              past,
              future,
              currentIndex: past.length - 1,
              isLocked: true,
            },
            isDirty: true,
          };
        });
        setTimeout(() => set((state) => ({ history: { ...state.history, isLocked: false } })), 0);
      },

      clearHistory: () => set({ history: { ...defaultHistoryState } }),

      // ─── Utility ───
      loadResume: async (_id) => {
        set({ isLoading: true, error: null });
        try {
          // Placeholder for API call
          // const response = await fetch(`/api/resume/${id}`);
          // const data = await response.json();
          // set({ resume: data, isDirty: false });
          await new Promise((r) => setTimeout(r, 100));
          set({ isLoading: false });
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Failed to load resume', isLoading: false });
        }
      },

      saveResume: async () => {
        set({ isLoading: true, error: null });
        try {
          // Placeholder for API call
          // await fetch(`/api/resume/${get().resume.id}`, {
          //   method: 'PUT',
          //   body: JSON.stringify(get().resume),
          // });
          await new Promise((r) => setTimeout(r, 100));
          set({ isLoading: false, isDirty: false });
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Failed to save resume', isLoading: false });
        }
      },

      resetResume: () => {
        get().saveSnapshot('Reset resume');
        set({ resume: createDefaultResume(), isDirty: true });
      },

      setError: (error) => set({ error }),
      setLoading: (isLoading) => set({ isLoading }),
    }),
    { name: 'resume-store' }
  )
);

export const resumeStore = useResumeStore;
export { createDefaultResume, generateId };