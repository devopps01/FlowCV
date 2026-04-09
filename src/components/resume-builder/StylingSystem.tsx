'use client';

import React, { useState, useCallback, createContext, useContext } from 'react';
import { 
  Palette, 
  Type, 
  Square, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  Bold,
  Italic,
  Underline,
  Move,
  RotateCw,
  Layers,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  Settings,
  Sliders,
  Sun,
  Moon,
  Monitor,
  Smartphone,
  Upload
} from 'lucide-react';

interface StyleProperty {
  value: any;
  type?: 'color' | 'text' | 'number' | 'select' | 'slider' | 'font';
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  options?: Array<{ label: string; value: any }>;
}

interface StyleSection {
  id: string;
  name: string;
  icon: React.ReactNode;
  properties: Record<string, StyleProperty>;
}

interface StyleTheme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    border: string;
  };
  fonts: {
    heading: string;
    body: string;
    monospace: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    full: string;
  };
}

interface StylingContextType {
  currentTheme: StyleTheme;
  customStyles: Record<string, any>;
  updateStyle: (path: string, value: any) => void;
  getStyle: (path: string) => any;
  applyTheme: (theme: StyleTheme) => void;
  resetStyles: () => void;
  exportStyles: () => Record<string, any>;
  importStyles: (styles: Record<string, any>) => void;
}

const StylingContext = createContext<StylingContextType | null>(null);

export const useStyling = () => {
  const context = useContext(StylingContext);
  if (!context) {
    throw new Error('useStyling must be used within a StylingProvider');
  }
  return context;
};

const defaultTheme: StyleTheme = {
  id: 'default',
  name: 'Professional',
  colors: {
    primary: '#41017d',
    secondary: '#ee14ff',
    accent: '#ff4d7d',
    background: '#ffffff',
    text: '#1f2937',
    border: '#e5e7eb'
  },
  fonts: {
    heading: 'Inter',
    body: 'Inter',
    monospace: 'JetBrains Mono'
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.5rem'
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '1rem',
    full: '9999px'
  }
};

const themes: StyleTheme[] = [
  defaultTheme,
  {
    id: 'modern',
    name: 'Modern',
    colors: {
      primary: '#6366f1',
      secondary: '#8b5cf6',
      accent: '#ec4899',
      background: '#ffffff',
      text: '#111827',
      border: '#d1d5db'
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter',
      monospace: 'Fira Code'
    },
    spacing: {
      xs: '0.125rem',
      sm: '0.25rem',
      md: '0.5rem',
      lg: '0.75rem',
      xl: '1rem'
    },
    borderRadius: {
      sm: '0.125rem',
      md: '0.25rem',
      lg: '0.5rem',
      full: '9999px'
    }
  },
  {
    id: 'minimal',
    name: 'Minimal',
    colors: {
      primary: '#000000',
      secondary: '#666666',
      accent: '#333333',
      background: '#ffffff',
      text: '#000000',
      border: '#e0e0e0'
    },
    fonts: {
      heading: 'Helvetica',
      body: 'Helvetica',
      monospace: 'Courier New'
    },
    spacing: {
      xs: '0.5rem',
      sm: '1rem',
      md: '1.5rem',
      lg: '2rem',
      xl: '3rem'
    },
    borderRadius: {
      sm: '0',
      md: '0',
      lg: '0',
      full: '0'
    }
  }
];

export const StylingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<StyleTheme>(defaultTheme);
  const [customStyles, setCustomStyles] = useState<Record<string, any>>({});

  const updateStyle = useCallback((path: string, value: any) => {
    setCustomStyles(prev => {
      const keys = path.split('.');
      const newStyles = { ...prev };
      let current: any = newStyles;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return newStyles;
    });
  }, []);

  const getStyle = useCallback((path: string) => {
    const keys = path.split('.');
    let current: any = customStyles;

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        // Fallback to theme
        let themeCurrent: any = currentTheme;
        for (const themeKey of keys) {
          if (themeCurrent && typeof themeCurrent === 'object' && themeKey in themeCurrent) {
            themeCurrent = themeCurrent[themeKey];
          } else {
            return undefined;
          }
        }
        return themeCurrent;
      }
    }

    return current;
  }, [customStyles, currentTheme]);

  const applyTheme = useCallback((theme: StyleTheme) => {
    setCurrentTheme(theme);
  }, []);

  const resetStyles = useCallback(() => {
    setCustomStyles({});
  }, []);

  const exportStyles = useCallback(() => {
    return {
      theme: currentTheme.id,
      custom: customStyles
    };
  }, [currentTheme.id, customStyles]);

  const importStyles = useCallback((styles: Record<string, any>) => {
    if (styles.theme) {
      const theme = themes.find(t => t.id === styles.theme);
      if (theme) {
        setCurrentTheme(theme);
      }
    }
    if (styles.custom) {
      setCustomStyles(styles.custom);
    }
  }, []);

  const value: StylingContextType = {
    currentTheme,
    customStyles,
    updateStyle,
    getStyle,
    applyTheme,
    resetStyles,
    exportStyles,
    importStyles
  };

  return (
    <StylingContext.Provider value={value}>
      {children}
    </StylingContext.Provider>
  );
};

interface StyleControlProps {
  label: string;
  value: any;
  onChange: (value: any) => void;
  type: 'color' | 'text' | 'number' | 'select' | 'slider' | 'font';
  options?: Array<{ label: string; value: any }>;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

const StyleControl: React.FC<StyleControlProps> = ({
  label,
  value,
  onChange,
  type,
  options,
  min,
  max,
  step,
  unit
}) => {
  const renderControl = () => {
    switch (type) {
      case 'color':
        return (
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={value || '#000000'}
              onChange={(e) => onChange(e.target.value)}
              className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
              placeholder="#000000"
            />
          </div>
        );

      case 'text':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
          />
        );

      case 'number':
        return (
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={value || 0}
              onChange={(e) => onChange(Number(e.target.value))}
              min={min}
              max={max}
              step={step}
              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
            />
            {unit && <span className="text-xs text-gray-500">{unit}</span>}
          </div>
        );

      case 'slider':
        return (
          <div className="flex items-center gap-2">
            <input
              type="range"
              value={value || 0}
              onChange={(e) => onChange(Number(e.target.value))}
              min={min}
              max={max}
              step={step}
              className="flex-1"
            />
            <span className="text-xs text-gray-500 w-12 text-right">
              {value}{unit}
            </span>
          </div>
        );

      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
          >
            {options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'font':
        return (
          <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
          >
            <option value="Inter">Inter</option>
            <option value="Roboto">Roboto</option>
            <option value="Open Sans">Open Sans</option>
            <option value="Lato">Lato</option>
            <option value="Montserrat">Montserrat</option>
            <option value="Poppins">Poppins</option>
            <option value="Playfair Display">Playfair Display</option>
            <option value="Merriweather">Merriweather</option>
            <option value="Helvetica">Helvetica</option>
            <option value="Arial">Arial</option>
            <option value="Georgia">Georgia</option>
            <option value="Times New Roman">Times New Roman</option>
          </select>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {renderControl()}
    </div>
  );
};

interface StylePanelProps {
  targetId?: string;
  targetType?: 'global' | 'section' | 'element';
}

export const StylePanel: React.FC<StylePanelProps> = ({
  targetId = 'global',
  targetType = 'global'
}) => {
  const { currentTheme, updateStyle, getStyle, applyTheme, resetStyles, exportStyles, importStyles } = useStyling();
  const [activeSection, setActiveSection] = useState('colors');

  const styleSections: StyleSection[] = [
    {
      id: 'colors',
      name: 'Colors',
      icon: <Palette className="w-4 h-4" />,
      properties: {
        primary: { value: getStyle('colors.primary') || currentTheme.colors.primary },
        secondary: { value: getStyle('colors.secondary') || currentTheme.colors.secondary },
        accent: { value: getStyle('colors.accent') || currentTheme.colors.accent },
        background: { value: getStyle('colors.background') || currentTheme.colors.background },
        text: { value: getStyle('colors.text') || currentTheme.colors.text },
        border: { value: getStyle('colors.border') || currentTheme.colors.border }
      }
    },
    {
      id: 'typography',
      name: 'Typography',
      icon: <Type className="w-4 h-4" />,
      properties: {
        fontFamily: { value: getStyle('typography.fontFamily') || currentTheme.fonts.body, type: 'font' },
        fontSize: { value: getStyle('typography.fontSize') || 16, type: 'number', min: 8, max: 72, unit: 'px' },
        fontWeight: { 
          value: getStyle('typography.fontWeight') || 400, 
          type: 'select',
          options: [
            { label: 'Light (300)', value: 300 },
            { label: 'Normal (400)', value: 400 },
            { label: 'Medium (500)', value: 500 },
            { label: 'Semi-bold (600)', value: 600 },
            { label: 'Bold (700)', value: 700 },
            { label: 'Extra-bold (800)', value: 800 }
          ]
        },
        lineHeight: { value: getStyle('typography.lineHeight') || 1.5, type: 'number', min: 1, max: 3, step: 0.1 },
        letterSpacing: { value: getStyle('typography.letterSpacing') || 0, type: 'number', min: -2, max: 10, unit: 'px' },
        textAlign: {
          value: getStyle('typography.textAlign') || 'left',
          type: 'select',
          options: [
            { label: 'Left', value: 'left' },
            { label: 'Center', value: 'center' },
            { label: 'Right', value: 'right' },
            { label: 'Justify', value: 'justify' }
          ]
        }
      }
    },
    {
      id: 'spacing',
      name: 'Spacing',
      icon: <Move className="w-4 h-4" />,
      properties: {
        padding: { value: getStyle('spacing.padding') || 16, type: 'number', min: 0, max: 100, unit: 'px' },
        margin: { value: getStyle('spacing.margin') || 16, type: 'number', min: 0, max: 100, unit: 'px' },
        gap: { value: getStyle('spacing.gap') || 8, type: 'number', min: 0, max: 50, unit: 'px' }
      }
    },
    {
      id: 'borders',
      name: 'Borders',
      icon: <Square className="w-4 h-4" />,
      properties: {
        borderWidth: { value: getStyle('borders.borderWidth') || 1, type: 'number', min: 0, max: 10, unit: 'px' },
        borderStyle: {
          value: getStyle('borders.borderStyle') || 'solid',
          type: 'select',
          options: [
            { label: 'Solid', value: 'solid' },
            { label: 'Dashed', value: 'dashed' },
            { label: 'Dotted', value: 'dotted' },
            { label: 'Double', value: 'double' },
            { label: 'None', value: 'none' }
          ]
        },
        borderColor: { value: getStyle('borders.borderColor') || currentTheme.colors.border },
        borderRadius: { value: getStyle('borders.borderRadius') || 8, type: 'number', min: 0, max: 50, unit: 'px' }
      }
    },
    {
      id: 'effects',
      name: 'Effects',
      icon: <Sliders className="w-4 h-4" />,
      properties: {
        opacity: { value: getStyle('effects.opacity') || 1, type: 'slider', min: 0, max: 1, step: 0.1 },
        rotation: { value: getStyle('effects.rotation') || 0, type: 'number', min: -180, max: 180, unit: 'deg' },
        boxShadow: { value: getStyle('effects.boxShadow') || 'none', type: 'text' },
        filter: { value: getStyle('effects.filter') || 'none', type: 'text' }
      }
    }
  ];

  const activeStyleSection = styleSections.find(section => section.id === activeSection);

  const handleStyleChange = useCallback((property: string, value: any) => {
    const path = targetId === 'global' ? property : `${targetId}.${property}`;
    updateStyle(path, value);
  }, [targetId, updateStyle]);

  const handleExport = useCallback(() => {
    const styles = exportStyles();
    const blob = new Blob([JSON.stringify(styles, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resume-styles.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [exportStyles]);

  const handleImport = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const styles = JSON.parse(e.target?.result as string);
            importStyles(styles);
          } catch (error) {
            console.error('Failed to import styles:', error);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }, [importStyles]);

  return (
    <div className="w-80 bg-white border-l border-gray-200 h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Style Editor</h3>
          <div className="flex items-center gap-1">
            <button
              onClick={handleExport}
              className="p-1.5 hover:bg-gray-100 rounded-lg"
              title="Export styles"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={handleImport}
              className="p-1.5 hover:bg-gray-100 rounded-lg"
              title="Import styles"
            >
              <Upload className="w-4 h-4" />
            </button>
            <button
              onClick={resetStyles}
              className="p-1.5 hover:bg-gray-100 rounded-lg"
              title="Reset styles"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Theme Selector */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Theme:</label>
          <select
            value={currentTheme.id}
            onChange={(e) => {
              const theme = themes.find(t => t.id === e.target.value);
              if (theme) applyTheme(theme);
            }}
            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
          >
            {themes.map(theme => (
              <option key={theme.id} value={theme.id}>
                {theme.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex border-b border-gray-200">
        {styleSections.map(section => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${
              activeSection === section.id
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            {section.icon}
            <span>{section.name}</span>
          </button>
        ))}
      </div>

      {/* Style Controls */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeStyleSection && (
          <div className="space-y-4">
            {Object.entries(activeStyleSection.properties).map(([key, property]) => (
              <StyleControl
                key={key}
                label={key.charAt(0).toUpperCase() + key.slice(1)}
                value={property.value}
                onChange={(value) => handleStyleChange(key, value)}
                type={property.type as any}
                options={property.options}
                min={property.min}
                max={property.max}
                step={property.step}
                unit={property.unit}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          Target: <span className="font-medium">{targetId}</span> ({targetType})
        </div>
      </div>
    </div>
  );
};

interface QuickStyleToolbarProps {
  targetId?: string;
  onStyleChange?: (property: string, value: any) => void;
}

export const QuickStyleToolbar: React.FC<QuickStyleToolbarProps> = ({
  targetId = 'global',
  onStyleChange
}) => {
  const { getStyle, updateStyle } = useStyling();

  const handleQuickStyle = useCallback((property: string, value: any) => {
    const path = targetId === 'global' ? property : `${targetId}.${property}`;
    updateStyle(path, value);
    onStyleChange?.(property, value);
  }, [targetId, updateStyle, onStyleChange]);

  return (
    <div className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded-lg">
      {/* Text Formatting */}
      <div className="flex items-center gap-1 border-r border-gray-200 pr-2">
        <button
          onClick={() => handleQuickStyle('fontWeight', getStyle('fontWeight') === 700 ? 400 : 700)}
          className={`p-1.5 rounded ${getStyle('fontWeight') === 700 ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleQuickStyle('fontStyle', getStyle('fontStyle') === 'italic' ? 'normal' : 'italic')}
          className={`p-1.5 rounded ${getStyle('fontStyle') === 'italic' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleQuickStyle('textDecoration', getStyle('textDecoration') === 'underline' ? 'none' : 'underline')}
          className={`p-1.5 rounded ${getStyle('textDecoration') === 'underline' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
          title="Underline"
        >
          <Underline className="w-4 h-4" />
        </button>
      </div>

      {/* Text Alignment */}
      <div className="flex items-center gap-1 border-r border-gray-200 pr-2">
        <button
          onClick={() => handleQuickStyle('textAlign', 'left')}
          className={`p-1.5 rounded ${getStyle('textAlign') === 'left' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
          title="Align Left"
        >
          <AlignLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleQuickStyle('textAlign', 'center')}
          className={`p-1.5 rounded ${getStyle('textAlign') === 'center' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
          title="Align Center"
        >
          <AlignCenter className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleQuickStyle('textAlign', 'right')}
          className={`p-1.5 rounded ${getStyle('textAlign') === 'right' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
          title="Align Right"
        >
          <AlignRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleQuickStyle('textAlign', 'justify')}
          className={`p-1.5 rounded ${getStyle('textAlign') === 'justify' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
          title="Justify"
        >
          <AlignJustify className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Color */}
      <div className="flex items-center gap-1">
        <input
          type="color"
          value={getStyle('color') || '#000000'}
          onChange={(e) => handleQuickStyle('color', e.target.value)}
          className="w-6 h-6 border border-gray-300 rounded cursor-pointer"
          title="Text Color"
        />
        <input
          type="color"
          value={getStyle('backgroundColor') || '#ffffff'}
          onChange={(e) => handleQuickStyle('backgroundColor', e.target.value)}
          className="w-6 h-6 border border-gray-300 rounded cursor-pointer"
          title="Background Color"
        />
      </div>
    </div>
  );
};

export default StylingProvider;
