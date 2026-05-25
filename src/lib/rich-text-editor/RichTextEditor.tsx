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

// ── Pure utility functions (not hooks) ──────────────────────────────

/** Escape text for safe HTML insertion */
function escapeHtml(text: string): string {
  // Use char code 38 (&) to avoid formatter corrupting '&' into '&'
  const a = String.fromCharCode(38);
  return text
    .replace(new RegExp(a, 'g'), a + 'amp;')
    .replace(/</g, a + 'lt;')
    .replace(/>/g, a + 'gt;');
}

/** Convert RichTextContent → HTML spans */
function renderContentToHTML(c: RichTextContent): string {
  return c.segments.map(seg => {
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
    const text = escapeHtml(seg.text).replace(/\n/g, '<br>');
    return `<span${styleAttr}>${text}</span>`;
  }).join('');
}

/** Parse HTML back into RichTextContent */
function parseHTMLToContent(html: string, defaultStyle: TextStyle): RichTextContent {
  const segments: StyledTextSegment[] = [];
  const temp = document.createElement('div');
  temp.innerHTML = html;

  const getStyleFromElement = (element: HTMLElement | null): TextStyle => {
    if (!element) return { ...defaultStyle };

    const computed = window.getComputedStyle(element);
    const segStyle: TextStyle = { ...defaultStyle };

    const fontWeight = computed.fontWeight;
    if (fontWeight === 'bold' || parseInt(fontWeight) >= 700) {
      segStyle.fontWeight = 'bold';
    }

    if (computed.fontStyle === 'italic') {
      segStyle.fontStyle = 'italic';
    }

    const textDecoration = computed.textDecoration;
    if (textDecoration.includes('underline')) {
      segStyle.textDecoration = 'underline';
    } else if (textDecoration.includes('line-through')) {
      segStyle.textDecoration = 'line-through';
    }

    const color = computed.color;
    if (color && color !== 'rgb(0, 0, 0)') {
      segStyle.color = color;
    }

    const bgColor = computed.backgroundColor;
    if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
      segStyle.backgroundColor = bgColor;
    }

    const fontSize = parseFloat(computed.fontSize);
    if (fontSize && fontSize !== 14) {
      segStyle.fontSize = fontSize;
    }

    const fontFamily = computed.fontFamily.split(',')[0].trim().replace(/['"]/g, '');
    if (fontFamily && fontFamily !== 'Inter') {
      segStyle.fontFamily = fontFamily;
    }

    const textAlign = computed.textAlign as TextStyle['textAlign'];
    if (textAlign && ['left', 'center', 'right', 'justify'].includes(textAlign)) {
      segStyle.textAlign = textAlign;
    }

    return segStyle;
  };

  const processNode = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const txt = node.textContent || '';
      if (txt) {
        segments.push(createStyledSegment(txt, getStyleFromElement(node.parentElement)));
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
}

/** Get a style value from the first segment overlapping the selection */
function getStyleValueForSelection(
  content: RichTextContent,
  selection: Selection | null,
  key: keyof TextStyle
): string | number | undefined {
  if (!selection) return undefined;

  let currentIndex = 0;
  for (const seg of content.segments) {
    const segStart = currentIndex;
    const segEnd = currentIndex + seg.text.length;

    if (selection.end <= segStart || selection.start >= segEnd) {
      currentIndex = segEnd;
      continue;
    }

    const val = seg.style[key];
    if (val !== undefined) return val;

    currentIndex = segEnd;
  }

  return undefined;
}

/** Check if a format is active across the entire selection */
function checkFormatActiveInSelection(
  c: RichTextContent,
  sel: Selection,
  key: keyof TextStyle,
  activeValue: any
): boolean {
  let currentIndex = 0;
  for (const seg of c.segments) {
    const segStart = currentIndex;
    const segEnd = currentIndex + seg.text.length;

    if (sel.end <= segStart || sel.start >= segEnd) {
      currentIndex = segEnd;
      continue;
    }

    const startInSeg = Math.max(0, sel.start - segStart);
    const endInSeg = Math.min(seg.text.length, sel.end - segStart);

    if (startInSeg < endInSeg) {
      const val = seg.style[key];
      if (val !== activeValue) {
        return false;
      }
    }

    currentIndex = segEnd;
  }
  return true;
}

// ── React Component ────────────────────────────────────────────────

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
  const [selection, setSelection] = useState<Selection | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  const defaultStyle = useMemo(() => mergeStyles(DEFAULT_TEXT_STYLE, style), [style]);

  useEffect(() => {
    if (autoFocus && editorRef.current) {
      editorRef.current.focus();
    }
  }, [autoFocus]);

  // ── Selection offset calculation ──

  const getOffset = useCallback((node: Node, offset: number, root: HTMLElement): number | null => {
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
  }, []);

  // ── Selection change handler ──

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

    const start = getOffset(range.startContainer, range.startOffset, editorRef.current);
    const end = getOffset(range.endContainer, range.endOffset, editorRef.current);

    if (start !== null && end !== null) {
      setSelection({ start, end });
    }
  }, [readOnly, getOffset]);

  // Listen for selection changes
  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [handleSelectionChange]);

  // ── Apply format to selection (USES applyFormatToSelection from types.ts) ──

  const applyFormatToSelectionWrapper = useCallback((format: Partial<TextStyle>) => {
    if (readOnly) return;
    if (!selection || selection.start === selection.end) return;

    const newContent = applyFormatToSelection(content, selection, format);
    onChange(newContent);

    // Re-render the DOM
    if (editorRef.current) {
      const html = renderContentToHTML(newContent);
      editorRef.current.innerHTML = html;
      requestAnimationFrame(() => handleSelectionChange());
    }
  }, [content, selection, onChange, readOnly, handleSelectionChange]);

  // ── Toggle format on/off ──

  const toggleFormat = useCallback((formatKey: keyof TextStyle, activeValue: any, normalValue: any) => {
    if (!selection || selection.start === selection.end) return;
    const isActive = checkFormatActiveInSelection(content, selection, formatKey, activeValue);
    applyFormatToSelectionWrapper({ [formatKey]: isActive ? normalValue : activeValue } as any);
  }, [content, selection, applyFormatToSelectionWrapper]);

  // ── Check if format is active on current selection ──

  const isFormatActive = useCallback((formatKey: keyof TextStyle, activeValue: any): boolean => {
    if (!selection || selection.start === selection.end) return false;
    return checkFormatActiveInSelection(content, selection, formatKey, activeValue);
  }, [content, selection]);

  // ── Keyboard shortcuts ──

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (readOnly) return;

    const isMod = e.metaKey || e.ctrlKey;

    if (isMod && e.key === 'b') {
      e.preventDefault();
      toggleFormat('fontWeight', 'bold', 'normal');
    } else if (isMod && e.key === 'i') {
      e.preventDefault();
      toggleFormat('fontStyle', 'italic', 'normal');
    } else if (isMod && e.key === 'u') {
      e.preventDefault();
      toggleFormat('textDecoration', 'underline', 'none');
    } else if (isMod && e.shiftKey && e.key === 'X') {
      e.preventDefault();
      toggleFormat('textDecoration', 'line-through', 'none');
    } else if (isMod && e.key === 'z') {
      e.preventDefault();
      document.execCommand('undo');
    } else if (isMod && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
      e.preventDefault();
      document.execCommand('redo');
    }
  }, [readOnly, toggleFormat]);

  // ── Input / Paste ──

  const handleInput = useCallback(() => {
    if (!editorRef.current || readOnly) return;

    const html = editorRef.current.innerHTML;
    const newContent = parseHTMLToContent(html, defaultStyle);
    onChange(newContent);
  }, [readOnly, onChange, defaultStyle]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  }, []);

  // ── Initial HTML ──
  const initialHTML = useMemo(() => renderContentToHTML(content), [content]);

  // ── Toolbar button component ──

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

  return (
    <div className={`border border-gray-300 rounded-lg overflow-hidden ${className}`}>
      {!readOnly && (
        <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 bg-gray-50">
          {/* ── Font Family ── */}
          <select
            value={
              (selection && selection.start !== selection.end
                ? String(getStyleValueForSelection(content, selection, 'fontFamily') || '')
                : '') || String(defaultStyle.fontFamily)
            }
            onChange={(e) => {
              if (selection && selection.start !== selection.end) {
                applyFormatToSelectionWrapper({ fontFamily: e.target.value } as any);
              }
            }}
            className="px-2 py-1 border border-gray-200 rounded text-sm"
            title="Font"
          >
            {FONTS.map((font) => (
              <option key={font.name} value={font.name}>
                {font.name}
              </option>
            ))}
          </select>

          {/* ── Font Size ── */}
          <select
            value={
              selection && selection.start !== selection.end
                ? String(getStyleValueForSelection(content, selection, 'fontSize') || defaultStyle.fontSize)
                : String(defaultStyle.fontSize)
            }
            onChange={(e) => {
              if (selection && selection.start !== selection.end) {
                applyFormatToSelectionWrapper({ fontSize: parseInt(e.target.value) } as any);
              }
            }}
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

          {/* ── Bold ── */}
          <ToolbarButton
            onClick={() => toggleFormat('fontWeight', 'bold', 'normal')}
            active={isFormatActive('fontWeight', 'bold')}
            title="Bold (Ctrl+B)"
          >
            <span className="font-bold">B</span>
          </ToolbarButton>

          {/* ── Italic ── */}
          <ToolbarButton
            onClick={() => toggleFormat('fontStyle', 'italic', 'normal')}
            active={isFormatActive('fontStyle', 'italic')}
            title="Italic (Ctrl+I)"
          >
            <span className="italic">I</span>
          </ToolbarButton>

          {/* ── Underline ── */}
          <ToolbarButton
            onClick={() => toggleFormat('textDecoration', 'underline', 'none')}
            active={isFormatActive('textDecoration', 'underline')}
            title="Underline (Ctrl+U)"
          >
            <span className="underline">U</span>
          </ToolbarButton>

          {/* ── Strikethrough ── */}
          <ToolbarButton
            onClick={() => toggleFormat('textDecoration', 'line-through', 'none')}
            active={isFormatActive('textDecoration', 'line-through')}
            title="Strikethrough"
          >
            <span className="line-through">S</span>
          </ToolbarButton>

          <div className="w-px h-6 bg-gray-300" />

          {/* ── Align Left ── */}
          <ToolbarButton
            onClick={() => {
              if (selection && selection.start !== selection.end) {
                applyFormatToSelectionWrapper({ textAlign: 'left' } as any);
              }
            }}
            title="Align Left"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h14" />
            </svg>
          </ToolbarButton>

          {/* ── Align Center ── */}
          <ToolbarButton
            onClick={() => {
              if (selection && selection.start !== selection.end) {
                applyFormatToSelectionWrapper({ textAlign: 'center' } as any);
              }
            }}
            title="Align Center"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M7 12h10M5 18h14" />
            </svg>
          </ToolbarButton>

          {/* ── Align Right ── */}
          <ToolbarButton
            onClick={() => {
              if (selection && selection.start !== selection.end) {
                applyFormatToSelectionWrapper({ textAlign: 'right' } as any);
              }
            }}
            title="Align Right"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M10 12h10M6 18h14" />
            </svg>
          </ToolbarButton>

          <div className="w-px h-6 bg-gray-300" />

          {/* ── Text Color ── */}
          <input
            type="color"
            value={
              selection && selection.start !== selection.end
                ? (getStyleValueForSelection(content, selection, 'color') as string) || '#000000'
                : '#000000'
            }
            onChange={(e) => {
              if (selection && selection.start !== selection.end) {
                applyFormatToSelectionWrapper({ color: e.target.value } as any);
              }
            }}
            className="w-8 h-8 rounded cursor-pointer"
            title="Text Color"
          />

          <div className="w-px h-6 bg-gray-300" />

          {/* ── Bullet List ── */}
          <ToolbarButton onClick={() => document.execCommand('insertUnorderedList')} title="Bullet List">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </ToolbarButton>

          {/* ── Numbered List ── */}
          <ToolbarButton onClick={() => document.execCommand('insertOrderedList')} title="Numbered List">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 6h13M7 12h13M7 18h13M3 6h.01M3 12h.01M3 18h.01" />
            </svg>
          </ToolbarButton>

          <div className="w-px h-6 bg-gray-300" />

          {/* ── Clear Formatting ── */}
          <ToolbarButton onClick={() => document.execCommand('removeFormat')} title="Clear Formatting">
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
        onBlur={() => setTimeout(() => setIsFocused(false), 200)}
        className="p-4 outline-none"
        style={{
          fontSize: defaultStyle.fontSize,
          fontFamily: defaultStyle.fontFamily,
          color: defaultStyle.color,
          lineHeight: defaultStyle.lineHeight,
          textAlign: defaultStyle.textAlign,
          minHeight: minHeight,
        }}
        dangerouslySetInnerHTML={{ __html: initialHTML }}
        data-placeholder={placeholder}
      />

      {isFocused && !getPlainText(content) && (
        <style>{`
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