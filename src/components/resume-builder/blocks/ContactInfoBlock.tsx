'use client';

import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { ResumeBlock, ResumeData } from '../types/resume.types';
import EditableText from '../EditableText';

interface Props {
  block: ResumeBlock;
  sectionId: string;
  data: ResumeData;
  onUpdate?: (content: any) => void;
  isEditing?: boolean;
}

const iconMap: Record<string, React.ReactNode> = {
  email: <Mail size={14} />,
  phone: <Phone size={14} />,
  location: <MapPin size={14} />,
};

const ContactInfoBlock: React.FC<Props> = ({ block, data, onUpdate, isEditing }) => {
  const theme = data.theme;
  const items: string[] = Array.isArray(block.content) ? block.content : [];

  const handleItemChange = (index: number, value: string) => {
    const updated = [...items];
    updated[index] = value;
    onUpdate?.(updated);
  };

  return (
    <div className="flex flex-col gap-1">
      {items.map((item, index) => {
        const iconKey = item.toLowerCase().includes('@')
          ? 'email'
          : item.toLowerCase().match(/^[\d\s\-+()]+$/)
          ? 'phone'
          : 'location';

        return (
          <div key={index} className="flex items-center gap-2">
            <span style={{ color: theme.primaryColor, flexShrink: 0 }}>
              {iconMap[iconKey]}
            </span>
            <EditableText
              value={item}
              onChange={(val) => handleItemChange(index, val)}
              tag="span"
              className="text-sm"
              style={{
                color: theme.textColor,
                fontFamily: theme.fontFamily,
              }}
              isEditing={isEditing}
            />
          </div>
        );
      })}
    </div>
  );
};

export default ContactInfoBlock;
