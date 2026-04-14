'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';

interface DropdownProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

// Full language names — value IS the display name (no code mapping needed)
const LANGUAGES = [
  'Afrikaans', 'Albanian', 'Amharic', 'Arabic', 'Armenian', 'Azerbaijani',
  'Basque', 'Belarusian', 'Bengali', 'Bosnian', 'Bulgarian',
  'Catalan', 'Chinese (Mandarin)', 'Chinese (Cantonese)', 'Croatian', 'Czech',
  'Danish', 'Dutch',
  'English', 'Estonian',
  'Finnish', 'French',
  'Galician', 'Georgian', 'German', 'Greek', 'Gujarati',
  'Hausa', 'Hebrew', 'Hindi', 'Hungarian',
  'Icelandic', 'Indonesian', 'Irish', 'Italian',
  'Japanese', 'Javanese',
  'Kannada', 'Kazakh', 'Khmer', 'Korean', 'Kurdish',
  'Lao', 'Latvian', 'Lithuanian',
  'Macedonian', 'Malay', 'Malayalam', 'Maltese', 'Marathi', 'Mongolian',
  'Nepali', 'Norwegian',
  'Pashto', 'Persian', 'Polish', 'Portuguese', 'Punjabi',
  'Romanian', 'Russian',
  'Serbian', 'Sinhala', 'Slovak', 'Slovenian', 'Somali', 'Spanish', 'Swahili', 'Swedish',
  'Tagalog', 'Tamil', 'Telugu', 'Thai', 'Turkish',
  'Ukrainian', 'Urdu', 'Uzbek',
  'Vietnamese',
  'Welsh',
  'Xhosa',
  'Yoruba',
  'Zulu',
];

const PROFICIENCY_LEVELS = [
  'Native',
  'Fluent',
  'Advanced',
  'Intermediate',
  'Basic',
  'Elementary',
];

const selectStyle: React.CSSProperties = {
  background: 'var(--app-bg-gray)',
  border: '1px solid var(--app-border)',
  color: 'var(--app-text)',
  borderRadius: '10px',
  padding: '8px 36px 8px 12px',
  fontSize: '12px',
  fontWeight: '600',
  width: '100%',
  appearance: 'none',
  WebkitAppearance: 'none',
  cursor: 'pointer',
  outline: 'none',
};

export const LanguageDropdown: React.FC<DropdownProps> = ({ value, onChange, placeholder, className }) => (
  <div className={`relative ${className || ''}`}>
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={selectStyle}
      onFocus={e => (e.currentTarget.style.borderColor = 'var(--app-primary)')}
      onBlur={e => (e.currentTarget.style.borderColor = 'var(--app-border)')}
    >
      <option value="" disabled style={{ color: 'var(--app-text-muted)' }}>
        {placeholder || 'Select language'}
      </option>
      {LANGUAGES.map(lang => (
        <option key={lang} value={lang}>{lang}</option>
      ))}
    </select>
    <ChevronDown
      className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
      style={{ color: 'var(--app-text-muted)' }}
    />
  </div>
);

export const ProficiencyDropdown: React.FC<DropdownProps> = ({ value, onChange, placeholder, className }) => (
  <div className={`relative ${className || ''}`}>
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={selectStyle}
      onFocus={e => (e.currentTarget.style.borderColor = 'var(--app-primary)')}
      onBlur={e => (e.currentTarget.style.borderColor = 'var(--app-border)')}
    >
      <option value="" disabled style={{ color: 'var(--app-text-muted)' }}>
        {placeholder || 'Proficiency'}
      </option>
      {PROFICIENCY_LEVELS.map(level => (
        <option key={level} value={level}>{level}</option>
      ))}
    </select>
    <ChevronDown
      className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
      style={{ color: 'var(--app-text-muted)' }}
    />
  </div>
);
