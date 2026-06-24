'use client';

import React from 'react';

/**
 * EditableElement — Wraps any text element in the resume preview
 * with visible on-hover tag indicators, data attributes for inline editing,
 * and automatic style override application.
 * 
 * Like Google Docs: hover any element → see what it is → click to edit/style
 */

interface EditableElementProps {
  children: React.ReactNode;
  editPath: string;          // Path to content value (e.g. "content.declaration.text")
  editLabel: string;         // Human-readable label (e.g. "Declaration Text")
  stylePath?: string;        // Path for style overrides (defaults to editPath)
  editValue?: string;        // Current value
  className?: string;
  tag?: 'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3';
  style?: React.CSSProperties;
  dataStyleOverrides?: Record<string, any>;
  hideTag?: boolean;
}

export function EditableElement({
  children,
  editPath,
  editLabel,
  stylePath,
  editValue,
  className = '',
  tag: Tag = 'span',
  style = {},
  dataStyleOverrides,
  hideTag = false,
}: EditableElementProps) {
  const sp = stylePath || editPath;
  const overrides = dataStyleOverrides?.[sp];

  // Apply style overrides from data
  const mergedStyle: React.CSSProperties = {
    cursor: 'pointer',
    borderRadius: '2px',
    transition: 'all 0.15s ease',
    position: 'relative',
    ...style,
    ...(overrides?.fontSize ? { fontSize: `${overrides.fontSize}px` } : {}),
    ...(overrides?.fontWeight ? { fontWeight: overrides.fontWeight } : {}),
    ...(overrides?.fontStyle ? { fontStyle: overrides.fontStyle } : {}),
    ...(overrides?.textDecoration ? { textDecoration: overrides.textDecoration } : {}),
    ...(overrides?.color ? { color: overrides.color } : {}),
    ...(overrides?.fontFamily ? { fontFamily: overrides.fontFamily } : {}),
    ...(overrides?.textAlign ? { textAlign: overrides.textAlign } : {}),
    ...(overrides?.backgroundColor ? { backgroundColor: overrides.backgroundColor } : {}),
    ...(overrides?.letterSpacing !== undefined ? { letterSpacing: `${overrides.letterSpacing}px` } : {}),
    ...(overrides?.lineHeight ? { lineHeight: overrides.lineHeight } : {}),
    ...(overrides?.textTransform ? { textTransform: overrides.textTransform } : {}),
    ...(overrides?.opacity !== undefined ? { opacity: overrides.opacity } : {}),
  };

  // Tag color based on content type
  const tagColor = getTagColor(editLabel, editPath);

  // Show tag on the element itself (inline before text)
  const showTag = !hideTag;

  return (
    <Tag
      className={`editable-element group/editable relative ${className}`}
      data-edit-path={editPath}
      data-edit-label={editLabel}
      data-edit-value={editValue || (typeof children === 'string' ? children : '')}
      data-style-path={sp}
      style={mergedStyle}
      title={`${editLabel} — Click to edit/style`}
    >
      {/* Inline tag badge — shows on hover like Google Docs element indicator */}
      {showTag && (
        <span
          className="inline-flex items-center gap-1 px-1 py-0 rounded text-[7px] font-black uppercase tracking-wider leading-none opacity-0 group-hover/editable:opacity-100 transition-opacity duration-150 align-middle mr-0.5"
          style={{
            background: tagColor,
            color: '#fff',
          }}
        >
          {editLabel.substring(0, 3)}
        </span>
      )}
      {children}
    </Tag>
  );
}

/**
 * Auto-generate tag color based on element type/label
 */
function getTagColor(label: string, path: string): string {
  const p = path.toLowerCase();
  const l = label.toLowerCase();
  
  if (p.includes('name') || l.includes('name')) return '#6366f1'; // indigo
  if (p.includes('title') || l.includes('title')) return '#8b5cf6'; // purple
  if (p.includes('email') || l.includes('email')) return '#3b82f6'; // blue
  if (p.includes('phone') || l.includes('phone')) return '#10b981'; // green
  if (p.includes('date') || l.includes('date')) return '#f59e0b'; // amber
  if (p.includes('place') || l.includes('place')) return '#f97316'; // orange
  if (p.includes('declaration') || l.includes('declaration')) return '#ef4444'; // red
  if (p.includes('summary') || l.includes('profile')) return '#ec4899'; // pink
  if (p.includes('company') || l.includes('employer')) return '#14b8a6'; // teal
  if (p.includes('position') || l.includes('job')) return '#06b6d4'; // cyan
  if (p.includes('school') || l.includes('education')) return '#a855f7'; // purple
  if (p.includes('degree') || l.includes('degree')) return '#d946ef'; // fuchsia
  if (p.includes('skill')) return '#0ea5e9'; // sky
  if (p.includes('language')) return '#84cc16'; // lime
  if (p.includes('description')) return '#64748b'; // slate
  if (p.includes('text')) return '#78716c'; // warm gray
  if (p.includes('social') || p.includes('link')) return '#0284c7'; // light blue
  
  return '#6b7280'; // default gray
}

/**
 * Smart tag generator — creates appropriate tag type and styles
 * based on the content path
 */
export function getSmartTagFeatures(path: string): {
  type: 'text' | 'date' | 'textarea' | 'email' | 'tel' | 'url' | 'number' | 'richtext';
  icon: string;
  group: string;
} {
  const p = path.toLowerCase();
  
  if (p.includes('email')) return { type: 'email', icon: '@', group: 'Contact' };
  if (p.includes('phone')) return { type: 'tel', icon: '📞', group: 'Contact' };
  if (p.includes('url') || p.includes('website') || p.includes('linkedin')) return { type: 'url', icon: '🔗', group: 'Contact' };
  if (p.includes('date') || p.includes('year')) return { type: 'date', icon: '📅', group: 'Date' };
  if (p.includes('description') || p.includes('summary') || p.includes('content')) return { type: 'textarea', icon: '📝', group: 'Content' };
  if (p.includes('name') || p.includes('fullname')) return { type: 'text', icon: '👤', group: 'Identity' };
  if (p.includes('title') || p.includes('position') || p.includes('job')) return { type: 'text', icon: '💼', group: 'Work' };
  if (p.includes('company') || p.includes('employer')) return { type: 'text', icon: '🏢', group: 'Work' };
  if (p.includes('school') || p.includes('education')) return { type: 'text', icon: '🎓', group: 'Education' };
  if (p.includes('degree') || p.includes('field')) return { type: 'text', icon: '📜', group: 'Education' };
  if (p.includes('skill')) return { type: 'text', icon: '⭐', group: 'Skills' };
  if (p.includes('language')) return { type: 'text', icon: '🌐', group: 'Languages' };
  if (p.includes('place') || p.includes('location')) return { type: 'text', icon: '📍', group: 'Location' };
  if (p.includes('declaration')) return { type: 'textarea', icon: '📄', group: 'Legal' };
  
  return { type: 'text', icon: '📄', group: 'General' };
}

export default EditableElement;