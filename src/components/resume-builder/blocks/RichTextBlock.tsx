'use client';

import React, { useState } from 'react';
import { ResumeBlock, ResumeData } from '../types/resume.types';

interface Props {
  block: ResumeBlock;
  sectionId: string;
  data: ResumeData;
  onUpdate?: (content: any) => void;
  isEditing?: boolean;
}

const RichTextBlock: React.FC<Props> = ({ block, data, onUpdate, isEditing }) => {
  const [isEditingBlock, setIsEditingBlock] = useState(false);
  const [editValue, setEditValue] = useState('');
  const theme = data.theme;

  const errorPatterns = [
    /error:\s*gemini[_\s]api[_\s]key[^.]*\./gi,
    /error:\s*GEMINI_API_KEY[^.]*\./gi,
    /add it to \.env\.local[^.]*\./gi,
    /AI service temporarily unavailable[^.]*\./gi,
    /Rate limit reached[^.]*\./gi,
  ];

  let cleaned = block.content || '';
  for (const pattern of errorPatterns) {
    cleaned = cleaned.replace(pattern, '');
  }

  if (!cleaned || cleaned === '<p></p>' || cleaned === '<p> </p>') return null;

  const handleStartEdit = () => {
    const text = cleaned
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<\/li>/gi, '\n')
      .replace(/<li[^>]*>/gi, '- ')
      .replace(/<[^>]+>/g, '')
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/&nbsp;/g, ' ')
      .replace(/"/g, '"')
      .trim();
    setEditValue(text);
    setIsEditingBlock(true);
  };

  const handleSave = () => {
    const lines = editValue.split('\n').filter(l => l.trim());
    let html;
    if (lines.length <= 1) {
      html = `<p>${lines[0] || ''}</p>`;
    } else {
      html = lines.map(l => `<p>${l}</p>`).join('');
    }
    onUpdate?.(html);
    setIsEditingBlock(false);
  };

  if (isEditing && isEditingBlock) {
    return (
      <div className="space-y-2" style={{ fontFamily: theme.fontFamily }}>
        <textarea
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="w-full bg-white/5 border border-white/20 rounded-lg p-3 text-sm"
          style={{
            color: theme.textColor,
            fontFamily: theme.fontFamily,
            minHeight: '80px',
            resize: 'vertical',
          }}
        />
        <div className="flex gap-2">
          <button onClick={handleSave} className="px-3 py-1 bg-indigo-500 text-white rounded text-xs font-bold">Save</button>
          <button onClick={() => setIsEditingBlock(false)} className="px-3 py-1 bg-white/10 text-white/70 rounded text-xs">Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={isEditing ? handleStartEdit : undefined}
      className="rich-text-block"
      style={{
        fontFamily: theme.fontFamily,
        fontSize: `${theme.fontSize || 10.5}px`,
        lineHeight: theme.lineHeight || 1.45,
        color: theme.textColor,
        cursor: isEditing ? 'pointer' : 'default',
      }}
      dangerouslySetInnerHTML={{ __html: cleaned }}
    />
  );
};

export default RichTextBlock;