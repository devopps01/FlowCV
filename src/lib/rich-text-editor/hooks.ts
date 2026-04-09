'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  RichTextContent,
  TextStyle,
  TextElement,
  Selection,
  StyledTextSegment,
  DEFAULT_TEXT_STYLE,
  createStyledSegment,
  createRichTextContent,
  getPlainText,
  applyFormatToSelection,
  insertTextAtPosition,
  deleteTextInRange,
} from './types';

export interface RichTextEditorState {
  isEditing: boolean;
  editingElementId: string | null;
  content: RichTextContent;
  selection: Selection | null;
}

export interface UseRichTextEditorOptions {
  initialContent?: RichTextContent;
  defaultStyle?: TextStyle;
  onSave?: (content: RichTextContent) => void;
  autoSave?: boolean;
  autoSaveDelay?: number;
}

export function useRichTextEditor(options: UseRichTextEditorOptions = {}) {
  const {
    initialContent,
    defaultStyle = DEFAULT_TEXT_STYLE,
    onSave,
    autoSave = false,
    autoSaveDelay = 1000,
  } = options;

  const [state, setState] = useState<RichTextEditorState>({
    isEditing: false,
    editingElementId: null,
    content: initialContent || createRichTextContent([createStyledSegment('')]),
    selection: null,
  });

  const [history, setHistory] = useState<RichTextContent[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (initialContent) {
      setState(prev => ({ ...prev, content: initialContent }));
      addToHistory(initialContent);
    }
  }, []);

  const addToHistory = useCallback((content: RichTextContent) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(JSON.parse(JSON.stringify(content)));
      if (newHistory.length > 50) {
        newHistory.shift();
        return newHistory;
      }
      return newHistory;
    });
    setHistoryIndex(prev => Math.min(prev + 1, 49));
  }, [historyIndex]);

  const startEditing = useCallback((elementId: string, content?: RichTextContent) => {
    setState(prev => ({
      ...prev,
      isEditing: true,
      editingElementId: elementId,
      content: content || prev.content,
      selection: null,
    }));
    if (content) {
      addToHistory(content);
    }
  }, [addToHistory]);

  const stopEditing = useCallback(() => {
    if (autoSave && onSave) {
      onSave(state.content);
    }
    setState(prev => ({
      ...prev,
      isEditing: false,
      editingElementId: null,
    }));
  }, [autoSave, onSave, state.content]);

  const updateContent = useCallback((newContent: RichTextContent) => {
    setState(prev => ({ ...prev, content: newContent }));

    if (autoSave && onSave) {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
      autoSaveTimerRef.current = setTimeout(() => {
        onSave(newContent);
      }, autoSaveDelay);
    }
  }, [autoSave, onSave, autoSaveDelay]);

  const setSelection = useCallback((selection: Selection | null) => {
    setState(prev => ({ ...prev, selection }));
  }, []);

  const formatSelection = useCallback((format: Partial<TextStyle>) => {
    if (!state.selection || state.selection.start === state.selection.end) {
      return;
    }

    const newContent = applyFormatToSelection(state.content, state.selection, format);
    updateContent(newContent);
    addToHistory(newContent);
  }, [state.selection, state.content, updateContent, addToHistory]);

  const insertText = useCallback((text: string, position?: number) => {
    const pos = position ?? (state.selection?.end ?? getPlainText(state.content).length);
    const newContent = insertTextAtPosition(state.content, pos, text, defaultStyle);
    updateContent(newContent);
    addToHistory(newContent);
  }, [state.selection, state.content, defaultStyle, updateContent, addToHistory]);

  const deleteSelection = useCallback(() => {
    if (!state.selection || state.selection.start === state.selection.end) {
      return;
    }

    const newContent = deleteTextInRange(state.content, state.selection.start, state.selection.end);
    updateContent(newContent);
    addToHistory(newContent);
  }, [state.selection, state.content, updateContent, addToHistory]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setState(prev => ({ ...prev, content: history[newIndex] }));
    }
  }, [historyIndex, history]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setState(prev => ({ ...prev, content: history[newIndex] }));
    }
  }, [historyIndex, history]);

  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  return {
    ...state,
    history,
    historyIndex,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
    startEditing,
    stopEditing,
    updateContent,
    setSelection,
    formatSelection,
    insertText,
    deleteSelection,
    undo,
    redo,
  };
}

export function useCanvasRichTextEditor() {
  const [editingElement, setEditingElement] = useState<{
    id: string;
    content: RichTextContent;
  } | null>(null);

  const editorState = useRichTextEditor({
    onSave: (content) => {
      // This will be connected to the canvas element update
    },
  });

  const startCanvasEditing = useCallback((elementId: string, content: RichTextContent) => {
    setEditingElement({ id: elementId, content });
    editorState.startEditing(elementId, content);
  }, [editorState]);

  const stopCanvasEditing = useCallback(() => {
    setEditingElement(null);
    editorState.stopEditing();
  }, [editorState]);

  return {
    editingElement,
    isEditing: editorState.isEditing,
    startCanvasEditing,
    stopCanvasEditing,
    editorState,
  };
}
