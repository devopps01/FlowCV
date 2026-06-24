import { create } from 'zustand';
import { ResumeData, ResumeSection, ResumeBlock, ThemeConfig, LayoutType, BlockType } from '../types/resume.types';

interface ResumeStore {
  resumeData: ResumeData | null;
  isEditing: boolean;
  editingBlockId: string | null;
  zoom: number;

  // Actions
  setResumeData: (data: ResumeData) => void;
  setEditing: (editing: boolean) => void;
  setEditingBlockId: (id: string | null) => void;
  setZoom: (zoom: number) => void;

  // Section Operations
  addSection: (section: ResumeSection) => void;
  removeSection: (sectionId: string) => void;
  updateSection: (sectionId: string, updates: Partial<ResumeSection>) => void;
  moveSection: (fromIndex: number, toIndex: number) => void;
  duplicateSection: (sectionId: string) => void;
  toggleSectionVisibility: (sectionId: string) => void;

  // Block Operations
  addBlock: (sectionId: string, block: ResumeBlock) => void;
  removeBlock: (sectionId: string, blockId: string) => void;
  updateBlock: (sectionId: string, blockId: string, content: any) => void;
  moveBlock: (sectionId: string, fromIndex: number, toIndex: number) => void;

  // Theme Operations
  updateTheme: (theme: Partial<ThemeConfig>) => void;
  updateLayout: (layout: LayoutType) => void;
  updateTemplate: (templateName: string) => void;

  // History
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Conversion from old format
  convertFromLegacy: (legacyData: any) => ResumeData;
  convertToLegacy: () => any;
}

const useResumeStore = create<ResumeStore>((set, get) => ({
  resumeData: null,
  isEditing: true,
  editingBlockId: null,
  zoom: 100,

  setResumeData: (data) => set({ resumeData: data }),
  setEditing: (editing) => set({ isEditing: editing }),
  setEditingBlockId: (id) => set({ editingBlockId: id }),
  setZoom: (zoom) => set({ zoom }),

  addSection: (section) =>
    set((state) => ({
      resumeData: state.resumeData
        ? {
            ...state.resumeData,
            sections: [...state.resumeData.sections, section],
          }
        : state.resumeData,
    })),

  removeSection: (sectionId) =>
    set((state) => ({
      resumeData: state.resumeData
        ? {
            ...state.resumeData,
            sections: state.resumeData.sections.filter((s) => s.id !== sectionId),
          }
        : state.resumeData,
    })),

  updateSection: (sectionId, updates) =>
    set((state) => ({
      resumeData: state.resumeData
        ? {
            ...state.resumeData,
            sections: state.resumeData.sections.map((s) =>
              s.id === sectionId ? { ...s, ...updates } : s
            ),
          }
        : state.resumeData,
    })),

  moveSection: (fromIndex, toIndex) =>
    set((state) => {
      if (!state.resumeData) return state;
      const sections = [...state.resumeData.sections];
      const [moved] = sections.splice(fromIndex, 1);
      sections.splice(toIndex, 0, moved);
      return {
        resumeData: { ...state.resumeData, sections: sections.map((s, i) => ({ ...s, order: i })) },
      };
    }),

  duplicateSection: (sectionId) =>
    set((state) => {
      if (!state.resumeData) return state;
      const section = state.resumeData.sections.find((s) => s.id === sectionId);
      if (!section) return state;
      const newSection: ResumeSection = {
        ...section,
        id: `${section.id}-copy-${Date.now()}`,
        title: `${section.title} (Copy)`,
        order: section.order + 1,
        blocks: section.blocks.map((b) => ({ ...b, id: `${b.id}-copy-${Date.now()}` })),
      };
      const sections = [...state.resumeData.sections];
      sections.splice(section.order + 1, 0, newSection);
      return {
        resumeData: {
          ...state.resumeData,
          sections: sections.map((s, i) => ({ ...s, order: i })),
        },
      };
    }),

  toggleSectionVisibility: (sectionId) =>
    set((state) => ({
      resumeData: state.resumeData
        ? {
            ...state.resumeData,
            sections: state.resumeData.sections.map((s) =>
              s.id === sectionId ? { ...s, visible: !s.visible } : s
            ),
          }
        : state.resumeData,
    })),

  addBlock: (sectionId, block) =>
    set((state) => ({
      resumeData: state.resumeData
        ? {
            ...state.resumeData,
            sections: state.resumeData.sections.map((s) =>
              s.id === sectionId ? { ...s, blocks: [...s.blocks, block] } : s
            ),
          }
        : state.resumeData,
    })),

  removeBlock: (sectionId, blockId) =>
    set((state) => ({
      resumeData: state.resumeData
        ? {
            ...state.resumeData,
            sections: state.resumeData.sections.map((s) =>
              s.id === sectionId
                ? { ...s, blocks: s.blocks.filter((b) => b.id !== blockId) }
                : s
            ),
          }
        : state.resumeData,
    })),

  updateBlock: (sectionId, blockId, content) =>
    set((state) => ({
      resumeData: state.resumeData
        ? {
            ...state.resumeData,
            sections: state.resumeData.sections.map((s) =>
              s.id === sectionId
                ? {
                    ...s,
                    blocks: s.blocks.map((b) =>
                      b.id === blockId ? { ...b, content } : b
                    ),
                  }
                : s
            ),
          }
        : state.resumeData,
    })),

  moveBlock: (sectionId, fromIndex, toIndex) =>
    set((state) => {
      if (!state.resumeData) return state;
      const sections = state.resumeData.sections.map((s) => {
        if (s.id !== sectionId) return s;
        const blocks = [...s.blocks];
        const [moved] = blocks.splice(fromIndex, 1);
        blocks.splice(toIndex, 0, moved);
        return { ...s, blocks };
      });
      return { resumeData: { ...state.resumeData, sections } };
    }),

  updateTheme: (theme) =>
    set((state) => ({
      resumeData: state.resumeData
        ? { ...state.resumeData, theme: { ...state.resumeData.theme, ...theme } }
        : state.resumeData,
    })),

  updateLayout: (layout) =>
    set((state) => ({
      resumeData: state.resumeData ? { ...state.resumeData, layout } : state.resumeData,
    })),

  updateTemplate: (templateName) =>
    set((state) => ({
      resumeData: state.resumeData ? { ...state.resumeData, template: templateName } : state.resumeData,
    })),

  // Simple history stack
  undo: () => {},
  redo: () => {},
  canUndo: () => false,
  canRedo: () => false,

  convertFromLegacy: (legacyData: any): ResumeData => {
    const content = legacyData.content || {};
    const design = legacyData.design || {};
    const sections: ResumeSection[] = [];

    // Personal Info Section
    const personalBlocks: ResumeBlock[] = [];
    const pInfo = content.personalInfo || {};
    if (pInfo.fullName) {
      personalBlocks.push({
        id: 'block-name',
        type: 'name',
        content: pInfo.fullName,
        props: { size: design.nameSize || 'xl', bold: design.nameBold !== false },
      });
    }
    if (pInfo.professionalTitle) {
      personalBlocks.push({
        id: 'block-title',
        type: 'professionalTitle',
        content: pInfo.professionalTitle,
      });
    }
    const contactItems: string[] = [];
    if (pInfo.email) contactItems.push(pInfo.email);
    if (pInfo.phone) contactItems.push(pInfo.phone);
    if (pInfo.location) contactItems.push(pInfo.location);
    if (contactItems.length > 0) {
      personalBlocks.push({
        id: 'block-contact',
        type: 'contactInfo',
        content: contactItems,
      });
    }
    if (pInfo.image || pInfo.photo) {
      personalBlocks.push({
        id: 'block-photo',
        type: 'photo',
        content: pInfo.image || pInfo.photo,
      });
    }
    if (personalBlocks.length > 0) {
      sections.push({
        id: 'section-personal',
        type: 'personal',
        title: 'Personal Info',
        visible: true,
        order: 0,
        props: { layout: 'stack' },
        blocks: personalBlocks,
      });
    }

    // Summary
    if (pInfo.summary) {
      sections.push({
        id: 'section-summary',
        type: 'summary',
        title: design.showSummaryHeading ? 'Professional Profile' : 'Summary',
        visible: true,
        order: 1,
        blocks: [{ id: 'block-summary', type: 'richText', content: pInfo.summary }],
      });
    }

    // Helper for array-based sections
    const createSection = (
      sid: string,
      title: string,
      items: any[],
      blockType: BlockType,
      order: number
    ): ResumeSection | null => {
      if (!items || items.length === 0) return null;
      const blocks: ResumeBlock[] = items.map((item, i) => ({
        id: `block-${sid}-${i}`,
        type: blockType,
        content: item,
        props: { index: i },
      }));
      return { id: `section-${sid}`, type: sid, title, visible: true, order, blocks };
    };

    let order = 2;
    const sectionConfigs: Array<{ id: string; title: string; blockType: BlockType }> = [
      { id: 'experience', title: 'Experience', blockType: 'experience' },
      { id: 'education', title: 'Education', blockType: 'education' },
      { id: 'projects', title: 'Projects', blockType: 'projects' },
      { id: 'skills', title: 'Skills', blockType: 'skills' },
      { id: 'languages', title: 'Languages', blockType: 'languages' },
      { id: 'certifications', title: 'Certifications', blockType: 'certifications' },
      { id: 'interests', title: 'Interests', blockType: 'interests' },
      { id: 'awards', title: 'Awards', blockType: 'awards' },
      { id: 'courses', title: 'Courses', blockType: 'courses' },
      { id: 'socials', title: 'Socials', blockType: 'socials' },
    ];

    const activeSections = legacyData.activeSections || [];
    for (const config of sectionConfigs) {
      if (activeSections.includes(config.id) && content[config.id]) {
        const section = createSection(config.id, config.title, content[config.id], config.blockType, order++);
        if (section) sections.push(section);
      }
    }

    // Declaration
    if (content.declaration) {
      sections.push({
        id: 'section-declaration',
        type: 'declaration',
        title: 'Declaration',
        visible: true,
        order: order++,
        blocks: [{ id: 'block-declaration', type: 'declaration', content: content.declaration }],
      });
    }

    return {
      id: legacyData._id || 'resume-1',
      title: legacyData.title || 'Untitled Resume',
      template: legacyData.template || 'modern',
      layout: mapLegacyLayout(design.layout),
      theme: {
        primaryColor: design.primaryColor || '#2563eb',
        secondaryColor: design.secondaryColor,
        textColor: design.textColor || '#1f2937',
        backgroundColor: design.backgroundColor || '#ffffff',
        fontFamily: design.fontFamily || 'Inter',
        fontSize: design.fontSize || 10.5,
        lineHeight: design.lineHeight || 1.45,
        marginLR: design.marginLR || 20,
        marginTB: design.marginTB || 20,
        entrySpacing: design.entrySpacing || 8,
        sectionSpacing: design.sectionSpacing || 10,
        headingSize: design.headingSize || 'm',
        headingStyle: design.headingStyle || 'underline',
        headingCapitalization: design.headingCapitalization || 'uppercase',
        personalAlign: design.personalAlign || 'left',
        photoShow: design.photoShow,
        photoShape: design.photoShape || 'circle',
        nameSize: design.nameSize || 'xl',
        nameBold: design.nameBold !== false,
      },
      sections,
    };
  },

  convertToLegacy: () => {
    const rd = get().resumeData;
    if (!rd) return {};
    // Will be implemented when needed
    return rd;
  },
}));

function mapLegacyLayout(layout: string | undefined): LayoutType {
  if (!layout) return 'single';
  if (layout.includes('sidebar')) return 'sidebar-left';
  if (layout.includes('modern')) return 'modern-header';
  if (layout.includes('double')) return 'double-header';
  if (layout.includes('two-column')) return 'two-column';
  if (layout.includes('creative')) return 'creative';
  return 'single';
}

export default useResumeStore;