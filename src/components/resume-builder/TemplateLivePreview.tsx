import React from 'react';

type TemplateInfo = {
  id: string;
  name?: string;
  description?: string;
  style?: {
    primaryColor?: string;
    fontFamily?: string;
    layout?: string;
  };
  preview?: string;
};

const TemplateLivePreview: React.FC<{ template: TemplateInfo }> = ({ template }) => {
  const color = template.style?.primaryColor ?? '#7c3aed';
  const fontFamily = template.style?.fontFamily ?? 'Inter';
  const hasPreview = Boolean(template.preview);
  return (
    <div className="mt-4 w-full max-w-md mx-auto">
      <div className="rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        {hasPreview ? (
          <img src={template.preview} alt="Template Preview" className="w-full h-40 object-cover" />
        ) : (
          <div className="h-40 w-full" style={{ background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <span style={{ fontFamily, fontWeight: 700 }}>{template.name ?? 'Template Preview'}</span>
          </div>
        )}
        <div className="p-2 text-sm text-gray-700">{template.description ?? ''}</div>
      </div>
    </div>
  );
};

export default TemplateLivePreview;
