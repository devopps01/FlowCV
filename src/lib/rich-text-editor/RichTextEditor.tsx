'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  RichTextContent,
  TextStyle,
  StyledTextSegment,
  Selection,
  DEFAULT_TEXT_STYLE,
  FONTS,
  FONT_SIZES,
  createStyledSegment,
  applyFormatToSelection,
  insertTextAtPosition,
  deleteTextInRange,
  getPlainText,
  mergeStyles,
} from './types';

interface RichTextEditorProps {
  content: RichTextContent;
  onChange: (content: RichTextContent) => void;
  style?: TextStyle;
  placeholder?: string;
  className?: string;
  readOnly?: boolean;
  autoFocus?: boolean;
  minHeight?: number;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  style = DEFAULT_TEXT_STYLE,
  placeholder = 'Type here...',
  className = '',
  readOnly = false,
  autoFocus = false,
  minHeight = 100,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [showToolbar, setShowToolbar] = useState(true);

  const defaultStyle = useMemo(() => mergeStyles(DEFAULT_TEXT_STYLE, style), [style]);

  useEffect(() => {
    if (autoFocus && editorRef.current) {
      editorRef.current.focus();
    }
  }, [autoFocus]);

  const handleSelectionChange = useCallback(() => {
    if (readOnly) return;

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) {
      setSelection(null);
      return;
    }

    const range = sel.getRangeAt(0);
    if (!editorRef.current?.contains(range.commonAncestorContainer)) {
      setSelection(null);
      return;
    }

    const text = getPlainText(content);
    const start = getOffset(range.startContainer, range.startOffset, editorRef.current);
    const end = getOffset(range.endContainer, range.endOffset, editorRef.current);

    if (start !== null && end !== null) {
      setSelection({ start, end });
    }
  }, [content, readOnly]);

  const getOffset = (node: Node, offset: number, root: HTMLElement): number | null => {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let charCount = 0;
    let currentNode: Node | null = null;

    while ((currentNode = walker.nextNode())) {
      if (currentNode === node) {
        return charCount + offset;
      }
      charCount += (currentNode.textContent || '').length;
    }
    return null;
  };

  const restoreSelection = useCallback((sel: Selection) => {
    if (!editorRef.current) return;

    const walker = document.createTreeWalker(editorRef.current, NodeFilter.SHOW_TEXT);
    let charCount = 0;
    let startNode: Node | null = null;
    let startOffset = 0;
    let endNode: Node | null = null;
    let endOffset = 0;
    let currentNode: Node | null = null;

    while ((currentNode = walker.nextNode())) {
      const nodeLength = (currentNode.textContent || '').length;

      if (startNode === null && charCount + nodeLength >= sel.start) {
        startNode = currentNode;
        startOffset = sel.start - charCount;
      }

      if (endNode === null && charCount + nodeLength >= sel.end) {
        endNode = currentNode;
        endOffset = sel.end - charCount;
        break;
      }

      charCount += nodeLength;
    }

    if (startNode && endNode) {
      const range = document.createRange();
      range.setStart(startNode, startOffset);
      range.setEnd(endNode, endOffset);
      const selObj = window.getSelection();
      selObj?.removeAllRanges();
      selObj?.addRange(range);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [handleSelectionChange]);

  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    handleSelectionChange();
  }, [handleSelectionChange]);

  const applyFormat = useCallback((format: Partial<TextStyle>) => {
    if (!selection || selection.start === selection.end) {
      execCommand('insertHTML', '<span></span>');
      return;
    }

    const newContent = applyFormatToSelection(content, selection, format);
    updateContentFromHTML(newContent);
  }, [selection, content, execCommand]);

  const updateContentFromHTML = useCallback((newContent: RichTextContent) => {
    if (editorRef.current) {
      const html = renderContentToHTML(newContent);
      editorRef.current.innerHTML = html;
    }
    onChange(newContent);
  }, [onChange]);

  const renderContentToHTML = (content: RichTextContent): string => {
    return content.segments.map(seg => {
      const styles: string[] = [];
      if (seg.style.fontWeight === 'bold' || parseInt(String(seg.style.fontWeight)) >= 700) {
        styles.push('font-weight: bold');
      }
      if (seg.style.fontStyle === 'italic') {
        styles.push('font-style: italic');
      }
      if (seg.style.textDecoration === 'underline') {
        styles.push('text-decoration: underline');
      }
      if (seg.style.textDecoration === 'line-through') {
        styles.push('text-decoration: line-through');
      }
      if (seg.style.color) {
        styles.push(`color: ${seg.style.color}`);
      }
      if (seg.style.backgroundColor && seg.style.backgroundColor !== 'transparent') {
        styles.push(`background-color: ${seg.style.backgroundColor}`);
      }
      if (seg.style.fontSize) {
        styles.push(`font-size: ${seg.style.fontSize}px`);
      }
      if (seg.style.fontFamily) {
        styles.push(`font-family: ${seg.style.fontFamily}`);
      }
      if (seg.style.textAlign) {
        styles.push(`text-align: ${seg.style.textAlign}`);
      }
      if (seg.style.lineHeight && seg.style.lineHeight !== 1.4) {
        styles.push(`line-height: ${seg.style.lineHeight}`);
      }
      if (seg.style.letterSpacing) {
        styles.push(`letter-spacing: ${seg.style.letterSpacing}px`);
      }
      if (seg.style.textTransform && seg.style.textTransform !== 'none') {
        styles.push(`text-transform: ${seg.style.textTransform}`);
      }
      if (seg.style.opacity && seg.style.opacity !== 1) {
        styles.push(`opacity: ${seg.style.opacity}`);
      }

      const styleAttr = styles.length > 0 ? ` style="${styles.join(';')}"` : '';
      const text = seg.text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, '<br>');
      return `<span${styleAttr}>${text}</span>`;
    }).join('');
  };

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (readOnly) return;

    const isMod = e.metaKey || e.ctrlKey;

    if (isMod && e.key === 'b') {
      e.preventDefault();
      execCommand('bold');
    } else if (isMod && e.key === 'i') {
      e.preventDefault();
      execCommand('italic');
    } else if (isMod && e.key === 'u') {
      e.preventDefault();
      execCommand('underline');
    } else if (isMod && e.shiftKey && e.key === 'X') {
      e.preventDefault();
      execCommand('strikeThrough');
    } else if (isMod && e.key === 'z') {
      e.preventDefault();
      execCommand('undo');
    } else if (isMod && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
      e.preventDefault();
      execCommand('redo');
    }
  }, [readOnly, execCommand]);

  const handleInput = useCallback(() => {
    if (!editorRef.current || readOnly) return;

    const html = editorRef.current.innerHTML;
    const newContent = parseHTMLToContent(html);
    onChange(newContent);
  }, [readOnly, onChange]);

  const parseHTMLToContent = (html: string): RichTextContent => {
    const segments: StyledTextSegment[] = [];
    const temp = document.createElement('div');
    temp.innerHTML = html;

    const processNode = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || '';
        if (text) {
          segments.push(createStyledSegment(text, getStyleFromElement(node.parentElement)));
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        if (element.tagName === 'BR') {
          segments.push(createStyledSegment('\n', getStyleFromElement(element)));
        } else {
          Array.from(element.childNodes).forEach(processNode);
        }
      }
    };

    Array.from(temp.childNodes).forEach(processNode);
    return { segments: segments.length > 0 ? segments : [createStyledSegment('')] };
  };

  const getStyleFromElement = (element: HTMLElement | null): TextStyle => {
    if (!element) return defaultStyle;

    const computed = window.getComputedStyle(element);
    const style: TextStyle = { ...defaultStyle };

    const fontWeight = computed.fontWeight;
    if (fontWeight === 'bold' || parseInt(fontWeight) >= 700) {
      style.fontWeight = 'bold';
    }

    if (computed.fontStyle === 'italic') {
      style.fontStyle = 'italic';
    }

    const textDecoration = computed.textDecoration;
    if (textDecoration.includes('underline')) {
      style.textDecoration = 'underline';
    } else if (textDecoration.includes('line-through')) {
      style.textDecoration = 'line-through';
    }

    const color = computed.color;
    if (color && color !== 'rgb(0, 0, 0)') {
      style.color = color;
    }

    const bgColor = computed.backgroundColor;
    if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
      style.backgroundColor = bgColor;
    }

    const fontSize = parseFloat(computed.fontSize);
    if (fontSize && fontSize !== 14) {
      style.fontSize = fontSize;
    }

    const fontFamily = computed.fontFamily.split(',')[0].trim().replace(/['"]/g, '');
    if (fontFamily && fontFamily !== 'Inter') {
      style.fontFamily = fontFamily;
    }

    const textAlign = computed.textAlign as TextStyle['textAlign'];
    if (textAlign && ['left', 'center', 'right', 'justify'].includes(textAlign)) {
      style.textAlign = textAlign;
    }

    return style;
  };

  const initialHTML = useMemo(() => renderContentToHTML(content), []);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  }, []);

  const ToolbarButton: React.FC<{
    onClick: () => void;
    active?: boolean;
    title: string;
    children: React.ReactNode;
  }> = ({ onClick, active, title, children }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`px-2 py-1 rounded text-sm transition-colors ${
        active
          ? 'bg-[#ff4d7d] text-white'
          : 'hover:bg-gray-100 text-gray-700'
      }`}
    >
      {children}
    </button>
  );

  const activeFormats = useMemo(() => {
    const formats: Partial<TextStyle> = {};
    if (selection) {
      formats.fontWeight = 'bold';
    }
    return formats;
  }, [selection]);

  return (
    <div className={`border border-gray-300 rounded-lg overflow-hidden ${className}`}>
      {showToolbar && !readOnly && (
        <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 bg-gray-50">
          <select
            onChange={(e) => execCommand('fontName', e.target.value)}
            className="px-2 py-1 border border-gray-200 rounded text-sm"
            title="Font"
          >
            {FONTS.map((font) => (
              <option key={font.name} value={font.name}>
                {font.name}
              </option>
            ))}
          </select>

          <select
            onChange={(e) => execCommand('fontSize', e.target.value)}
            className="px-2 py-1 border border-gray-200 rounded text-sm"
            title="Size"
          >
            {FONT_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>

          <div className="w-px h-6 bg-gray-300" />

          <ToolbarButton onClick={() => execCommand('bold')} title="Bold (Ctrl+B)">
            <span className="font-bold">B</span>
          </ToolbarButton>
          <ToolbarButton onClick={() => execCommand('italic')} title="Italic (Ctrl+I)">
            <span className="italic">I</span>
          </ToolbarButton>
          <ToolbarButton onClick={() => execCommand('underline')} title="Underline (Ctrl+U)">
            <span className="underline">U</span>
          </ToolbarButton>
          <ToolbarButton onClick={() => execCommand('strikeThrough')} title="Strikethrough">
            <span className="line-through">S</span>
          </ToolbarButton>

          <div className="w-px h-6 bg-gray-300" />

          <ToolbarButton onClick={() => execCommand('justifyLeft')} title="Align Left">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h14" />
            </svg>
          </ToolbarButton>
          <ToolbarButton onClick={() => execCommand('justifyCenter')} title="Align Center">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M7 12h10M5 18h14" />
            </svg>
          </ToolbarButton>
          <ToolbarButton onClick={() => execCommand('justifyRight')} title="Align Right">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M10 12h10M6 18h14" />
            </svg>
          </ToolbarButton>

          <div className="w-px h-6 bg-gray-300" />

          <input
            type="color"
            onChange={(e) => execCommand('foreColor', e.target.value)}
            className="w-8 h-8 rounded cursor-pointer"
            title="Text Color"
          />

          <div className="w-px h-6 bg-gray-300" />

          <ToolbarButton onClick={() => execCommand('insertUnorderedList')} title="Bullet List">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </ToolbarButton>
          <ToolbarButton onClick={() => execCommand('insertOrderedList')} title="Numbered List">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 6h13M7 12h13M7 18h13M3 6h.01M3 12h.01M3 18h.01" />
            </svg>
          </ToolbarButton>

          <div className="w-px h-6 bg-gray-300" />

          <ToolbarButton onClick={() => execCommand('removeFormat')} title="Clear Formatting">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </ToolbarButton>
        </div>
      )}

      <div
        ref={editorRef}
        contentEditable={!readOnly}
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="p-4 outline-none min-h-[100px]"
        style={{
          fontSize: defaultStyle.fontSize,
          fontFamily: defaultStyle.fontFamily,
          color: defaultStyle.color,
          lineHeight: defaultStyle.lineHeight,
          textAlign: defaultStyle.textAlign,
        }}
        dangerouslySetInnerHTML={{ __html: initialHTML }}
        data-placeholder={placeholder}
      />

      {isFocused && !getPlainText(content) && (
        <style jsx>{`
          [contenteditable]:empty:before {
            content: attr(data-placeholder);
            color: #9ca3af;
            pointer-events: none;
          }
        `}</style>
      )}
    </div>
  );
};

export default RichTextEditor;
