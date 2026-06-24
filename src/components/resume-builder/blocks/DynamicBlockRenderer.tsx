'use client';

import React from 'react';
import { ResumeBlock, ResumeData } from '../types/resume.types';
import NameBlock from './NameBlock';
import ProfessionalTitleBlock from './ProfessionalTitleBlock';
import ContactInfoBlock from './ContactInfoBlock';
import PhotoBlock from './PhotoBlock';
import RichTextBlock from './RichTextBlock';
import ExperienceBlock from './ExperienceBlock';
import EducationBlock from './EducationBlock';
import SkillBlock from './SkillBlock';
import LanguageBlock from './LanguageBlock';
import CertificationBlock from './CertificationBlock';
import InterestBlock from './InterestBlock';
import SocialBlock from './SocialBlock';
import ProjectBlock from './ProjectBlock';
import AwardBlock from './AwardBlock';
import CourseBlock from './CourseBlock';
import OrganisationBlock from './OrganisationBlock';
import DeclarationBlock from './DeclarationBlock';
import HeadingBlock from './HeadingBlock';
import TextBlock from './TextBlock';
import DividerBlock from './DividerBlock';
import CustomBlock from './CustomBlock';

const blockRegistry: Record<string, React.FC<{
  block: ResumeBlock;
  sectionId: string;
  data: ResumeData;
  onUpdate?: (content: any) => void;
  isEditing?: boolean;
}>> = {
  name: NameBlock,
  professionalTitle: ProfessionalTitleBlock,
  contactInfo: ContactInfoBlock,
  photo: PhotoBlock,
  richText: RichTextBlock,
  experience: ExperienceBlock,
  education: EducationBlock,
  skills: SkillBlock,
  languages: LanguageBlock,
  certifications: CertificationBlock,
  interests: InterestBlock,
  socials: SocialBlock,
  projects: ProjectBlock,
  awards: AwardBlock,
  courses: CourseBlock,
  organisations: OrganisationBlock,
  declaration: DeclarationBlock,
  heading: HeadingBlock,
  text: TextBlock,
  paragraph: TextBlock,
  divider: DividerBlock,
  custom: CustomBlock,
};

interface DynamicBlockRendererProps {
  block: ResumeBlock;
  sectionId: string;
  data: ResumeData;
  onUpdate?: (blockId: string, content: any) => void;
  isEditing?: boolean;
}

export const DynamicBlockRenderer: React.FC<DynamicBlockRendererProps> = ({
  block,
  sectionId,
  data,
  onUpdate,
  isEditing = true,
}) => {
  const Component = blockRegistry[block.type];

  if (!Component) {
    return (
      <div className="text-red-400 text-xs p-2 border border-red-400/20 rounded">
        Unknown block type: {block.type}
      </div>
    );
  }

  const handleUpdate = (content: any) => {
    onUpdate?.(block.id, content);
  };

  return (
    <Component
      block={block}
      sectionId={sectionId}
      data={data}
      onUpdate={handleUpdate}
      isEditing={isEditing}
    />
  );
};

export default DynamicBlockRenderer;