'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';

interface LanguageDropdownProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const LANGUAGES = [
  { code: 'en', name: 'English', proficiency: 'Native' },
  { code: 'es', name: 'Spanish', proficiency: 'Native' },
  { code: 'fr', name: 'French', proficiency: 'Native' },
  { code: 'de', name: 'German', proficiency: 'Native' },
  { code: 'it', name: 'Italian', proficiency: 'Native' },
  { code: 'pt', name: 'Portuguese', proficiency: 'Native' },
  { code: 'ru', name: 'Russian', proficiency: 'Native' },
  { code: 'zh', name: 'Chinese', proficiency: 'Native' },
  { code: 'ja', name: 'Japanese', proficiency: 'Native' },
  { code: 'ko', name: 'Korean', proficiency: 'Native' },
  { code: 'ar', name: 'Arabic', proficiency: 'Native' },
  { code: 'hi', name: 'Hindi', proficiency: 'Native' },
  { code: 'bn', name: 'Bengali', proficiency: 'Native' },
  { code: 'pa', name: 'Punjabi', proficiency: 'Native' },
  { code: 'ta', name: 'Tamil', proficiency: 'Native' },
  { code: 'te', name: 'Telugu', proficiency: 'Native' },
  { code: 'mr', name: 'Marathi', proficiency: 'Native' },
  { code: 'gu', name: 'Gujarati', proficiency: 'Native' },
  { code: 'kn', name: 'Kannada', proficiency: 'Native' },
  { code: 'ml', name: 'Malayalam', proficiency: 'Native' },
  { code: 'si', name: 'Sinhala', proficiency: 'Native' },
  { code: 'th', name: 'Thai', proficiency: 'Native' },
  { code: 'vi', name: 'Vietnamese', proficiency: 'Native' },
  { code: 'tr', name: 'Turkish', proficiency: 'Native' },
  { code: 'pl', name: 'Polish', proficiency: 'Native' },
  { code: 'nl', name: 'Dutch', proficiency: 'Native' },
  { code: 'sv', name: 'Swedish', proficiency: 'Native' },
  { code: 'da', name: 'Danish', proficiency: 'Native' },
  { code: 'no', name: 'Norwegian', proficiency: 'Native' },
  { code: 'fi', name: 'Finnish', proficiency: 'Native' },
  { code: 'el', name: 'Greek', proficiency: 'Native' },
  { code: 'cs', name: 'Czech', proficiency: 'Native' },
  { code: 'hu', name: 'Hungarian', proficiency: 'Native' },
  { code: 'ro', name: 'Romanian', proficiency: 'Native' },
  { code: 'bg', name: 'Bulgarian', proficiency: 'Native' },
  { code: 'hr', name: 'Croatian', proficiency: 'Native' },
  { code: 'sr', name: 'Serbian', proficiency: 'Native' },
  { code: 'uk', name: 'Ukrainian', proficiency: 'Native' },
  { code: 'he', name: 'Hebrew', proficiency: 'Native' },
  { code: 'ar', name: 'Arabic', proficiency: 'Native' },
];

const PROFICIENCY_LEVELS = [
  { value: 'Native', label: 'Native' },
  { value: 'Fluent', label: 'Fluent' },
  { value: 'Advanced', label: 'Advanced' },
  { value: 'Intermediate', label: 'Intermediate' },
  { value: 'Basic', label: 'Basic' },
];

export const LanguageDropdown: React.FC<LanguageDropdownProps> = ({ value, onChange, placeholder, className }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const selectedLanguage = LANGUAGES.find(lang => lang.code === value);

  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
        className={`w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm font-medium transition-all duration-200 appearance-none cursor-pointer ${className || ''}`}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'%3e%3cpath d='M7 10l5 5l5 5' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3e%3c/svg%3e")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 12px center',
          backgroundSize: '20px',
          paddingRight: '40px'
        }}
      >
        <option value="" disabled className="text-gray-400 py-2">
          {placeholder || 'Select language'}
        </option>
        {LANGUAGES.map((language) => (
          <option key={language.code} value={language.code} className="py-2">
            {language.name}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none transition-transform duration-200" />
    </div>
  );
};

export const ProficiencyDropdown: React.FC<LanguageDropdownProps> = ({ value, onChange, placeholder, className }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
        className={`w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm font-medium transition-all duration-200 appearance-none cursor-pointer ${className || ''}`}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'%3e%3cpath d='M7 10l5 5l5 5' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3e%3c/svg%3e")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 12px center',
          backgroundSize: '20px',
          paddingRight: '40px'
        }}
      >
        <option value="" disabled className="text-gray-400 py-2">
          {placeholder || 'Select proficiency'}
        </option>
        {PROFICIENCY_LEVELS.map((level) => (
          <option key={level.value} value={level.value} className="py-2">
            {level.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none transition-transform duration-200" />
    </div>
  );
};
