'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RichTextEditor } from './RichTextEditor';
import {
  RichTextContent,
  TextStyle,
  createStyledSegment,
  createRichTextContent,
  getPlainText,
  DEFAULT_TEXT_STYLE,
} from './types';

export interface ExtendedTextStyle extends TextStyle {
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  padding?: number;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
}

interface SimpleTextElement {
  id: string;
  content: RichTextContent;
  x: number;
  y: number;
  width: number;
  height: number;
  style: ExtendedTextStyle;
}

interface RichTextEditorModalProps {
  isOpen: boolean;
  element: SimpleTextElement | null;
  onClose: () => void;
  onSave: (content: RichTextContent, style: ExtendedTextStyle) => void;
}

export const RichTextEditorModal: React.FC<RichTextEditorModalProps> = ({
  isOpen,
  element,
  onClose,
  onSave,
}) => {
  const [content, setContent] = useState<RichTextContent>(
    element?.content || createRichTextContent([createStyledSegment('')])
  );
  const [style, setStyle] = useState<ExtendedTextStyle>(element?.style || DEFAULT_TEXT_STYLE);

  useEffect(() => {
    if (element) {
      setContent(element.content);
      setStyle(element.style);
    }
  }, [element]);

  const handleSave = useCallback(() => {
    onSave(content, style);
    onClose();
  }, [content, style, onSave, onClose]);

  if (!isOpen || !element) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-[700px] max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Edit Text</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <RichTextEditor
            content={content}
            onChange={setContent}
            style={style}
            autoFocus
            minHeight={200}
          />
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-[#ff4d7d] text-white hover:bg-[#e63e6a] rounded-lg transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

interface CanvasRichTextOverlayProps {
  element: SimpleTextElement;
  isEditing: boolean;
  onClose: () => void;
  onSave: (content: RichTextContent, style: ExtendedTextStyle) => void;
  scale: number;
  offset: { x: number; y: number };
}

export const CanvasRichTextOverlay: React.FC<CanvasRichTextOverlayProps> = ({
  element,
  isEditing,
  onClose,
  onSave,
  scale,
  offset,
}) => {
  const [content, setContent] = useState<RichTextContent>(element.content);
  const [style, setStyle] = useState<ExtendedTextStyle>(element.style);

  useEffect(() => {
    setContent(element.content);
    setStyle(element.style);
  }, [element]);

  const handleSave = useCallback(() => {
    onSave(content, style);
    onClose();
  }, [content, style, onSave, onClose]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSave();
    }
  }, [onClose, handleSave]);

  useEffect(() => {
    if (isEditing) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isEditing, handleKeyDown]);

  if (!isEditing) return null;

  const left = element.x * scale + offset.x;
  const top = element.y * scale + offset.y;
  const width = Math.max(element.width * scale, 300);
  const height = Math.max(element.height * scale, 200);

  return (
    <div
      className="fixed z-50 bg-white shadow-2xl rounded-lg overflow-hidden"
      style={{
        left: Math.max(left, 300),
        top: Math.max(top, 100),
        width,
        minHeight: height,
      }}
    >
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-gray-50">
        <span className="text-sm text-gray-600">Editing: {element.id}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-200 rounded transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-3 py-1 text-sm bg-[#ff4d7d] text-white hover:bg-[#e63e6a] rounded transition-colors"
          >
            Done
          </button>
        </div>
      </div>
      <div className="p-4">
        <RichTextEditor
          content={content}
          onChange={setContent}
          style={style}
          autoFocus
          minHeight={150}
        />
      </div>
    </div>
  );
};

export default RichTextEditorModal;
