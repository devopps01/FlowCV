'use client';

import React, { useEffect, useState } from 'react';
import { ResumeData } from './types';

interface A4ResumePreviewProps {
  data: ResumeData;
  className?: string;
  showShadow?: boolean;
}

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const PX_PER_MM = 3.78;

const A4ResumePreview: React.FC<A4ResumePreviewProps> = ({ 
  data, 
  className = '',
  showShadow = true 
}) => {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) return null;
  
  const design = data.design || {};
  const content = data.content || {};
  const personalInfo = content.personalInfo || {};
  
  const primaryColor = design.primaryColor || '#7c3aed';
  const accentColor = design.accentColor || primaryColor;
  const textColor = design.textColor || '#1f2937';
  const fontFamily = design.fontFamily || 'Inter';
  const backgroundColor = design.backgroundColor || '#ffffff';
  const marginLR = design.marginLR || 12;
  const marginTB = design.marginTB || 16;
  const fontSize = design.fontSize || 9;
  const lineHeight = design.lineHeight || 1.45;
  
  const isSidebar = design.layout?.includes('sidebar');
  
  const mmToPx = (mm: number) => mm * PX_PER_MM;
  
  const containerStyle: React.CSSProperties = {
    width: `${mmToPx(A4_WIDTH_MM)}px`,
    minHeight: `${mmToPx(A4_HEIGHT_MM)}px`,
    fontFamily,
    fontSize: `${fontSize}pt`,
    lineHeight,
    backgroundColor,
    color: textColor,
    boxShadow: showShadow ? '0 20px 50px rgba(0,0,0,0.1)' : 'none',
    overflow: 'visible',
    padding: '0',
    margin: '0',
  };
  
  const sectionStyle = (isMain: boolean = false): React.CSSProperties => ({
    color: isMain ? accentColor : textColor,
    fontWeight: 700,
    fontSize: design.headingSize === 's' ? '0.85em' : design.headingSize === 'l' ? '1.25em' : '1.05em',
    textTransform: design.headingCapitalization === 'none' ? 'none' : 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: `${design.entrySpacing || 8}mm`,
  });
  
  const headingLineStyle: React.CSSProperties = {
    display: 'block',
    width: '100%',
    height: design.headingLineThickness || 2,
    backgroundColor: accentColor,
    marginTop: '3px',
  };
  
  const dotStyle: React.CSSProperties = {
    width: 6,
    height: 6,
    borderRadius: '50%',
    backgroundColor: accentColor,
    flexShrink: 0,
  };
  
  return (
    <div style={containerStyle} className={`relative ${className}`}>
      <div 
        className="flex flex-col h-full min-h-0"
        style={{
          paddingLeft: `${marginLR}mm`,
          paddingRight: `${marginLR}mm`,
          paddingTop: `${marginTB}mm`,
          paddingBottom: `${marginTB}mm`,
        }}
      >
        {isSidebar ? (
          <div className="flex flex-row h-full min-h-0 gap-6">
            <div 
              className="w-[32%] h-full p-6 flex flex-col gap-6"
              style={{ 
                backgroundColor: primaryColor,
                color: '#ffffff',
                borderRight: '1px solid rgba(0, 0, 0, 0.05)',
              }}
            >
              <div className="flex flex-col items-start text-left gap-3">
                <div className="space-y-1">
                  <h1 className="font-black leading-tight tracking-tight text-[1.8em]">
                    {personalInfo.fullName || 'Name'}
                  </h1>
                  <p className="text-[0.9em] font-bold opacity-40 uppercase tracking-[0.2em]">
                    {personalInfo.professionalTitle || 'Title'}
                  </p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-3">
                  <h2 className="text-[0.85em] font-bold uppercase tracking-[0.2em] opacity-40 border-b pb-1">
                    Contact
                  </h2>
                  <div className="space-y-2 text-[0.85em] font-bold opacity-80">
                    {personalInfo.email && (
                      <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect width="20" height="16" x="2" y="4" rx="2"/>
                          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                        </svg>
                        <span className="truncate">{personalInfo.email}</span>
                      </div>
                    )}
                    {personalInfo.phone && (
                      <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72"/>
                        </svg>
                        <span className="truncate">{personalInfo.phone}</span>
                      </div>
                    )}
                    {personalInfo.location && (
                      <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                          <circle cx="12" cy="10" r="3"/>
                        </svg>
                        <span className="truncate">{personalInfo.location}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {(data.content.skills || []).length > 0 && (
                  <div>
                    <h2 className="text-[0.85em] font-bold uppercase tracking-[0.2em] opacity-40 border-b pb-1">
                      Skills
                    </h2>
                    <div className="space-y-2">
                      {(data.content.skills || []).map((skill, i) => (
                        <div key={i} className="flex items-center gap-2 text-[0.85em] font-medium opacity-80">
                          <div className="w-1.5 h-1.5 rounded-full bg-white/80" />
                          <span>{typeof skill === 'string' ? skill : skill.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {(data.content.education || []).length > 0 && (
                  <div>
                    <h2 className="text-[0.85em] font-bold uppercase tracking-[0.2em] opacity-40 border-b pb-1">
                      Education
                    </h2>
                    <div className="space-y-3">
                      {(data.content.education || []).map((edu: any, i: number) => (
                        <div key={i}>
                          <div className="font-bold text-[0.9em] opacity-90">{edu.degree}</div>
                          <div className="text-[0.8em] opacity-60">{edu.school}</div>
                          <div className="text-[0.75em] opacity-40">{edu.graduationYear}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex-1 p-6 flex flex-col gap-4">
              {personalInfo.summary && (
                <div className="text-center">
                  <h2 style={sectionStyle(true)}>
                    Professional Profile
                  </h2>
                  <span style={headingLineStyle} />
                  <p className="leading-[1.6] opacity-80 text-[1.05em] font-medium mt-3">
                    {personalInfo.summary}
                  </p>
                </div>
              )}
              
              {(data.content.experience || []).length > 0 && (
                <div>
                  <h2 style={sectionStyle(true)}>Experience</h2>
                  <span style={headingLineStyle} />
                  <div className="space-y-4 mt-3">
                    {(data.content.experience || []).map((exp: any, i: number) => (
                      <div key={i}>
                        <div className="flex justify-between items-baseline">
                          <h3 className="font-bold text-[1.05em]">{exp.position || exp.title}</h3>
                          <span className="text-[0.85em] font-medium opacity-40 uppercase tabular-nums">
                            {exp.startDate} {exp.endDate ? `— ${exp.endDate}` : '— Present'}
                          </span>
                        </div>
                        <p className="font-medium opacity-70 mt-0.5">{exp.company}</p>
                        {exp.description && (
                          <p className="text-[0.95em] leading-relaxed opacity-75 mt-1">
                            {exp.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {(data.content.education || []).length > 0 && (
                <div>
                  <h2 style={sectionStyle(true)}>Education</h2>
                  <span style={headingLineStyle} />
                  <div className="space-y-4 mt-3">
                    {(data.content.education || []).map((edu: any, i: number) => (
                      <div key={i}>
                        <div className="flex justify-between items-baseline">
                          <h3 className="font-bold text-[1.05em]">{edu.degree}</h3>
                          <span className="text-[0.85em] font-medium opacity-40 uppercase">{edu.graduationYear}</span>
                        </div>
                        <p className="font-medium opacity-70 mt-0.5">{edu.school}</p>
                        {edu.description && (
                          <p className="text-[0.95em] leading-relaxed opacity-75 mt-1">{edu.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="text-center">
              <h1 
                className="font-black leading-tight tracking-tight"
                style={{ 
                  fontSize: '1.8em',
                  color: primaryColor 
                }}
              >
                {personalInfo.fullName || 'Name'}
              </h1>
              <p className="font-bold uppercase tracking-widest opacity-60 mt-1">
                {personalInfo.professionalTitle || 'Title'}
              </p>
              <div className="flex justify-center gap-4 mt-2 opacity-60 text-[0.85em] flex-wrap">
                {personalInfo.email && <span>{personalInfo.email}</span>}
                {personalInfo.phone && <span>{personalInfo.phone}</span>}
                {personalInfo.location && <span>{personalInfo.location}</span>}
              </div>
            </div>
            
            <div 
              className="h-0.5 w-full"
              style={{ backgroundColor: primaryColor }}
            />
            
            {personalInfo.summary && (
              <div>
                <h2 style={sectionStyle(true)} className="text-center">
                  Professional Summary
                </h2>
                <span style={headingLineStyle} />
                <p className="leading-[1.6] opacity-80 text-[1.05em] font-medium italic text-slate-600 mt-3">
                  {personalInfo.summary}
                </p>
              </div>
            )}
            
            <div className="flex gap-6">
              <div className="flex-1">
                {(data.content.experience || []).length > 0 && (
                  <div>
                    <h2 style={sectionStyle(true)}>Experience</h2>
                    <span style={headingLineStyle} />
                    <div className="space-y-4 mt-3">
                      {(data.content.experience || []).map((exp: any, i: number) => (
                        <div key={i}>
                          <div className="flex justify-between items-baseline">
                            <h3 className="font-bold">{exp.position || exp.title}</h3>
                            <span className="text-xs font-medium opacity-40">
                              {exp.startDate} {exp.endDate ? `— ${exp.endDate}` : ''}
                            </span>
                          </div>
                          <p className="font-medium opacity-70 text-sm">{exp.company}</p>
                          {exp.description && (
                            <p className="text-[0.95em] leading-relaxed opacity-75 mt-1">{exp.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {(data.content.education || []).length > 0 && (
                  <div className="mt-4">
                    <h2 style={sectionStyle(true)}>Education</h2>
                    <span style={headingLineStyle} />
                    <div className="space-y-4 mt-3">
                      {(data.content.education || []).map((edu: any, i: number) => (
                        <div key={i}>
                          <div className="flex justify-between items-baseline">
                            <h3 className="font-bold">{edu.degree}</h3>
                            <span className="text-xs font-medium opacity-40">{edu.graduationYear}</span>
                          </div>
                          <p className="font-medium opacity-70 text-sm">{edu.school}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="w-1/3 flex flex-col gap-4">
                {(data.content.skills || []).length > 0 && (
                  <div>
                    <h2 style={sectionStyle(true)}>Skills</h2>
                    <span style={headingLineStyle} />
                    <div className="space-y-2 mt-3">
                      {(data.content.skills || []).slice(0, 10).map((skill, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div style={dotStyle} />
                          <span className="text-[0.95em]">{typeof skill === 'string' ? skill : skill.name}</span>
                        </div>
                      ))}
                      {(data.content.skills || []).length > 10 && (
                        <div className="text-[0.85em] opacity-60">+{data.content.skills.length - 10} more</div>
                      )}
                    </div>
                  </div>
                )}
                
                {(data.content.languages || []).length > 0 && (
                  <div>
                    <h2 style={sectionStyle(true)}>Languages</h2>
                    <span style={headingLineStyle} />
                    <div className="space-y-1 mt-2">
                      {(data.content.languages || []).map((lang: any, i: number) => (
                        <div key={i} className="text-[0.9em]">
                          <span className="font-medium">{lang.language}</span>
                          <span className="opacity-60"> - {lang.proficiency}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {(data.content.certifications || []).length > 0 && (
                  <div>
                    <h2 style={sectionStyle(true)}>Certifications</h2>
                    <span style={headingLineStyle} />
                    <div className="space-y-1 mt-2">
                      {(data.content.certifications || []).slice(0, 4).map((cert: any, i: number) => (
                        <div key={i} className="text-[0.9em]">
                          <span className="font-medium">{cert.name}</span>
                          {cert.issuer && <span className="opacity-60"> ({cert.issuer})</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default A4ResumePreview;
