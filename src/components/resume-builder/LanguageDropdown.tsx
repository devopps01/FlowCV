'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
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

const triggerStyle: React.CSSProperties = {
  background: 'var(--app-bg-gray)',
  border: '1px solid var(--app-border)',
  color: 'var(--app-text)',
  borderRadius: '10px',
  padding: '8px 36px 8px 12px',
  fontSize: '12px',
  fontWeight: '600',
  width: '100%',
  cursor: 'pointer',
  outline: 'none',
  textAlign: 'left',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
};

// ─── Custom Dropdown Component ─────────────────────────────────────────
// IMPORTANT: This is a CUSTOM dropdown (not native <select>) because native
// <select> option popups get clipped by ANY ancestor with overflow:auto/scroll.
// ContentEditor has overflow-y:auto for scrolling, which would clip native
// select dropdowns. This custom dropdown renders its options panel via fixed
// positioning, so it's never clipped by any parent's overflow.
interface CustomDropdownOption {
  value: string;
  label: string;
}

function CustomDropdown({
  value,
  onChange,
  options,
  placeholder,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  options: CustomDropdownOption[];
  placeholder?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({});

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setPanelStyle({
      position: 'fixed',
      left: `${rect.left}px`,
      top: `${rect.bottom + 4}px`,
      width: `${rect.width}px`,
      zIndex: 99999,
      background: 'var(--app-bg-card)',
      border: '1px solid var(--app-border)',
      borderRadius: '10px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
      maxHeight: '200px',
      overflowY: 'auto',
    });
  }, []);

  useEffect(() => {
    if (open) {
      updatePosition();
      // Re-position on scroll/resize while open
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [open, updatePosition]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (triggerRef.current && !triggerRef.current.contains(e.target as Node)) {
        // Don't close if clicking the options panel
        const panel = document.getElementById('custom-dropdown-panel');
        if (panel && panel.contains(e.target as Node)) return;
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  const selectedOption = options.find(o => o.value === value);

  return (
    <div className={`relative ${className || ''}`}>
      <div
        ref={triggerRef}
        style={triggerStyle}
        onClick={e => {
          e.stopPropagation();
          updatePosition();
          setOpen(v => !v);
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.borderColor = 'var(--app-primary)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.borderColor = 'var(--app-border)';
        }}
      >
        <span style={{ flex: 1, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {selectedOption?.label || placeholder || 'Select...'}
        </span>
        <ChevronDown className="w-4 h-4 shrink-0" style={{ color: 'var(--app-text-muted)' }} />
      </div>

      {/* Options panel — rendered at fixed position, never clipped by parent overflow */}
      {open && (
        <div
          id="custom-dropdown-panel"
          style={panelStyle}
        >
          {options.map(opt => (
            <div
              key={opt.value}
              onClick={e => {
                e.stopPropagation();
                onChange(opt.value);
                setOpen(false);
              }}
              style={{
                padding: '8px 12px',
                fontSize: '12px',
                fontWeight: opt.value === value ? '700' : '500',
                cursor: 'pointer',
                color: opt.value === value ? 'var(--app-primary)' : 'var(--app-text)',
                background: opt.value === value ? 'var(--app-primary-light)' : 'transparent',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = 'var(--app-bg-gray)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background =
                  opt.value === value ? 'var(--app-primary-light)' : 'transparent';
              }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const LANG_OPTIONS = LANGUAGES.map(l => ({ value: l, label: l }));
const PROF_OPTIONS = PROFICIENCY_LEVELS.map(l => ({ value: l, label: l }));

export const LanguageDropdown: React.FC<DropdownProps> = ({ value, onChange, placeholder, className }) => (
  <CustomDropdown
    value={value}
    onChange={onChange}
    options={LANG_OPTIONS}
    placeholder={placeholder || 'Select language'}
    className={className}
  />
);

export const ProficiencyDropdown: React.FC<DropdownProps> = ({ value, onChange, placeholder, className }) => (
  <CustomDropdown
    value={value}
    onChange={onChange}
    options={PROF_OPTIONS}
    placeholder={placeholder || 'Proficiency'}
    className={className}
  />
);