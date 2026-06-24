'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { InlineEditorProps, EditTarget } from './types';
import { FloatingPanel } from './FloatingPanel';
import { FormatToolbar } from './FormatToolbar';
import { detectFieldType, htmlToPlainText, getFieldLabel } from './utils';

// ─── Constants ────────────────────────────────────────────────────────────────

const EDITABLE_TAGS = new Set([
  'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'A', 'SPAN', 'LI', 'TD', 'TH',
  'STRONG', 'EM', 'B', 'I', 'LABEL', 'DIV',
]);

// ─── InlineEditorWrapper ──────────────────────────────────────────────────────

/**
 * InlineEditorWrapper provides click-to-edit functionality for the resume preview.
 * It wraps the preview content and handles detecting clicked elements,
 * determining the edit target, and showing the floating edit panel.
 * Also shows a persistent Google Docs-style FormatToolbar at the top.
 */
export function InlineEditorWrapper({ data, updateNested, children, containerRef, zoom }: InlineEditorProps) {
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null);
  const [containerRect, setContainerRect] = useState<DOMRect | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Update container rect on resize
  useEffect(() => {
    const updateRect = () => {
      if (containerRef.current) {
        setContainerRect(containerRef.current.getBoundingClientRect());
      }
    };
    updateRect();
    const ro = new ResizeObserver(updateRect);
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener('resize', updateRect);
    return () => { ro.disconnect(); window.removeEventListener('resize', updateRect); };
  }, [containerRef]);

  // Handle click on editable elements
  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // Don't intercept clicks on the panel itself
    if ((e.target as HTMLElement).closest('[data-inline-panel]')) return;

    const clickedEl = e.target as HTMLElement;

    // Don't intercept drag handles or section controls
    if (clickedEl.closest('[data-drag-handle]') || clickedEl.closest('[role="button"]')) return;

    // Walk up from clicked element to find data-edit-path and data-style-path
    let el: HTMLElement | null = clickedEl;
    let editableEl: HTMLElement | null = null;
    let stylePath = '';
    let depth = 0;

    while (el && depth < 12) {
      if (!stylePath && el.dataset.stylePath) {
        stylePath = el.dataset.stylePath;
      }
      // Found explicit edit path — use it
      if (el.dataset.editPath && el.dataset.editPath.trim()) {
        editableEl = el;
        break;
      }
      // Skip UI chrome
      if (el.dataset.dragHandle) break;
      if (el.id === 'resume-preview') break;
      el = el.parentElement;
      depth++;
    }

    // If no data-edit-path found, try to find any text element with content
    if (!editableEl) {
      el = clickedEl;
      depth = 0;
      while (el && depth < 8) {
        if (!stylePath && el.dataset.stylePath) {
          stylePath = el.dataset.stylePath;
        }
        if (EDITABLE_TAGS.has(el.tagName) && el.textContent?.trim()) {
          const directText = Array.from(el.childNodes)
            .filter(n => n.nodeType === Node.TEXT_NODE)
            .reduce((acc, n) => acc + (n.textContent?.length || 0), 0);
          if (directText > 0 || el.tagName.match(/^H[1-6]$/)) {
            editableEl = el;
            break;
          }
        }
        if (el.id === 'resume-preview') break;
        el = el.parentElement;
        depth++;
      }
    }

    if (!editableEl) {
      setEditTarget(null);
      return;
    }

    const path = editableEl.dataset.editPath || '';
    const isRichtext = editableEl.dataset.editType === 'richtext';
    const rawValue = editableEl.dataset.editValue || editableEl.textContent || '';
    const value = isRichtext ? htmlToPlainText(rawValue) : rawValue;

    if (!value.trim() && !path) {
      setEditTarget(null);
      return;
    }

    const label = editableEl.dataset.editLabel || getFieldLabel(path, editableEl.tagName);
    const fieldType = editableEl.dataset.editType === 'richtext' ? 'richtext' : detectFieldType(path, label, editableEl.tagName, value);
    const rect = editableEl.getBoundingClientRect();

    e.preventDefault();
    e.stopPropagation();

    setEditTarget({
      path,
      stylePath: stylePath || path,
      value,
      rect,
      fieldType,
      label: label.toUpperCase(),
      element: editableEl,
    });
  }, []);

  // Close panel when clicking outside
  useEffect(() => {
    if (!editTarget) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-inline-panel]')) return;
      setEditTarget(null);
    };
    document.addEventListener('mousedown', handler, true);
    return () => document.removeEventListener('mousedown', handler, true);
  }, [editTarget]);

  return (
    <div
      ref={wrapperRef}
      style={{ position: 'relative', width: '100%', height: '100%', overflow: 'auto', cursor: 'default' }}
      onClick={handleClick}
    >
      {/* Persistent Google Docs-style Format Toolbar */}
      <div
        data-inline-panel="true"
        style={{
          position: 'sticky',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          padding: '4px 8px',
          background: 'var(--app-bg)',
          borderBottom: '1px solid var(--app-border)',
        }}
      >
        <FormatToolbar
          target={editTarget}
          data={data}
          updateNested={updateNested}
          onClose={() => setEditTarget(null)}
        />
      </div>

      {children}

      {/* Edit target highlight overlay */}
      {editTarget && editTarget.element && (
        <div
          style={{
            position: 'absolute',
            top: editTarget.rect.top - (containerRect?.top || 0) - 2,
            left: editTarget.rect.left - (containerRect?.left || 0) - 2,
            width: editTarget.rect.width + 4,
            height: editTarget.rect.height + 4,
            border: '2px solid #6366f1',
            borderRadius: 4,
            pointerEvents: 'none',
            zIndex: 9997,
            opacity: 0.5,
          }}
        />
      )}

      {editTarget && containerRect && (
        <div data-inline-panel="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 9998 }}>
          <div style={{ pointerEvents: 'auto' }}>
            <FloatingPanel
              target={editTarget}
              data={data}
              updateNested={updateNested}
              onClose={() => setEditTarget(null)}
              containerRect={containerRect}
              zoom={zoom}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default InlineEditorWrapper;