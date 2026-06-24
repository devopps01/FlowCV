'use client';

import React, { useState, useRef, useEffect } from 'react';

interface EditableTextProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  style?: React.CSSProperties;
  placeholder?: string;
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div';
  isEditing?: boolean;
  multiline?: boolean;
}

export const EditableText: React.FC<EditableTextProps> = ({
  value,
  onChange,
  className = '',
  style = {},
  placeholder = 'Click to edit...',
  tag: Tag = 'span',
  isEditing = true,
  multiline = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleBlur = () => {
    setIsFocused(false);
    if (localValue !== value) {
      onChange(localValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!multiline && e.key === 'Enter') {
      e.preventDefault();
      ref.current?.blur();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      setLocalValue(value);
      ref.current?.blur();
    }
  };

  if (!isEditing) {
    return (
      <Tag className={className} style={style}>
        {value || placeholder}
      </Tag>
    );
  }

  return (
    <Tag
      className={`${className} editable-text ${isFocused ? 'editable-text-focused' : ''}`}
      style={{
        ...style,
        cursor: isEditing ? 'text' : 'default',
        outline: isFocused ? '2px solid #6366f1' : 'none',
        outlineOffset: '2px',
        borderRadius: '2px',
        minWidth: '20px',
        minHeight: Tag === 'div' || Tag === 'p' ? '1em' : undefined,
        whiteSpace: multiline ? 'pre-wrap' : 'pre',
        wordBreak: 'break-word',
      }}
      ref={ref as any}
      contentEditable={isEditing}
      suppressContentEditableWarning
      onInput={(e) => setLocalValue(e.currentTarget.textContent || '')}
      onFocus={() => setIsFocused(true)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      data-placeholder={placeholder}
    >
      {localValue || ''}
    </Tag>
  );
};

export default EditableText;