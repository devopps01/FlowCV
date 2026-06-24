'use client';

import React from 'react';
import { ResumeBlock, ResumeData } from '../types/resume.types';
import EditableText from '../EditableText';

interface Props {
  block: ResumeBlock;
  sectionId: string;
  data: ResumeData;
  onUpdate?: (content: any) => void;
  isEditing?: boolean;
}

const OrganisationBlock: React.FC<Props> = ({ block, data, onUpdate, isEditing }) => {
  const org = block.content || {};
  const theme = data.theme;

  return (
    <div className="space-y-1" style={{ fontFamily: theme.fontFamily }}>
      <div className="flex justify-between">
        <div className="flex-1">
          <EditableText value={org.name || ''} onChange={(val) => onUpdate?.({ ...org, name: val })}
            tag="h3" className="font-bold"
            style={{ fontSize: `${(theme.fontSize || 10.5) + 1}px`, color: theme.textColor }}
            isEditing={isEditing} />
          <EditableText value={org.role || ''} onChange={(val) => onUpdate?.({ ...org, role: val })}
            tag="p" style={{ fontSize: `${theme.fontSize || 10.5}px`, color: theme.textColor, opacity: 0.7 }}
            isEditing={isEditing} />
        </div>
        <EditableText value={`${org.startDate || ''}${org.endDate ? ` — ${org.endDate}` : ''}`}
          onChange={(val) => {
            const parts = val.split(' — ').map((s: string) => s.trim());
            onUpdate?.({ ...org, startDate: parts[0] || '', endDate: parts[1] || '' });
          }}
          tag="span" className="text-xs whitespace-nowrap"
          style={{ color: theme.textColor, opacity: 0.5 }}
          isEditing={isEditing} />
      </div>
    </div>
  );
};

export default OrganisationBlock;