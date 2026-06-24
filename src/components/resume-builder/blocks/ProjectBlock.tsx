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

const ProjectBlock: React.FC<Props> = ({ block, data, onUpdate, isEditing }) => {
  const project = block.content || {};
  const theme = data.theme;
  const techStr = Array.isArray(project.technologies) ? project.technologies.join(', ') : project.technologies || '';

  return (
    <div className="project-entry space-y-1" style={{ fontFamily: theme.fontFamily }}>
      <EditableText
        value={project.name || ''}
        onChange={(val) => onUpdate?.({ ...project, name: val })}
        tag="h3"
        className="font-bold"
        style={{ fontSize: `${(theme.fontSize || 10.5) + 2}px`, color: theme.textColor }}
        isEditing={isEditing}
      />
      {techStr && (
        <p style={{ fontSize: `${theme.fontSize || 10.5}px`, color: theme.textColor, opacity: 0.6 }}>
          {techStr}
        </p>
      )}
      {project.description && (
        <EditableText
          value={project.description || ''}
          onChange={(val) => onUpdate?.({ ...project, description: val })}
          tag="div"
          multiline
          className="leading-relaxed"
          style={{ fontSize: `${theme.fontSize || 10.5}px`, color: theme.textColor, opacity: 0.8 }}
          isEditing={isEditing}
        />
      )}
    </div>
  );
};

export default ProjectBlock;