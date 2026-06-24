import React, { useCallback } from 'react';
import type { FC } from 'react';
import type { BlockComponentProps } from '@/blocks/blockRegistry';
import type { HeadingContent } from '@/types/resume.types';

const HeadingBlock: FC<BlockComponentProps> = ({ block, isSelected, isEditing, onUpdate, onSelect, style }) => {
  const content = block.content as HeadingContent;
  const level = content.level || 2;
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  const handleClick = useCallback(() => { onSelect?.(block.id); }, [block.id, onSelect]);
  const handleBlur = useCallback((e: React.FocusEvent) => {
    const newText = e.currentTarget.textContent || '';
    if (newText !== content.text && onUpdate) onUpdate(block.id, { content: { ...content, text: newText } } as any);
  }, [block.id, content, onUpdate]);

  return (
    <Tag
      className={`font-bold tracking-tight ${level === 1 ? 'text-3xl' : level === 2 ? 'text-xl' : 'text-lg'}`}
      style={style}
      contentEditable={isEditing}
      suppressContentEditableWarning
      onBlur={handleBlur}
      onClick={handleClick}
      tabIndex={0}
    >
      {content.text}
    </Tag>
  );
};

export default HeadingBlock;
