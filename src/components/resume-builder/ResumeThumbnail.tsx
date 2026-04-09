'use client';

import React from 'react';
import { ResumeData } from './types';

interface ResumeThumbnailProps {
  data: ResumeData;
  className?: string;
}

const ResumeThumbnail: React.FC<ResumeThumbnailProps> = ({ 
  data, 
  className = '' 
}) => {
  const design = data.design || {};
  const content = data.content || {};
  const personalInfo = content.personalInfo || {};
  
  const primaryColor = design.primaryColor || '#7c3aed';
  const accentColor = design.accentColor || primaryColor;
  const textColor = design.textColor || '#1f2937';
  const fontFamily = design.fontFamily || 'Inter';
  const backgroundColor = design.backgroundColor || '#ffffff';
  
  const isSidebar = design.layout?.includes('sidebar');
  
  const defaultData = {
    personalInfo: {
      id: 'personal',
      fullName: personalInfo.fullName || 'Alexandra Martinez',
      professionalTitle: personalInfo.professionalTitle || 'Senior Product Manager',
      email: personalInfo.email || 'alex.martinez@email.com',
      phone: personalInfo.phone || '(555) 123-4567',
      location: personalInfo.location || 'San Francisco, CA',
      summary: personalInfo.summary || 'Results-driven Product Manager with 8+ years of experience leading cross-functional teams to deliver innovative SaaS solutions. Expert in Agile methodologies, data analytics, and stakeholder management.',
    },
    experience: content.experience?.length > 0 ? content.experience : [
      { id: 'exp_thumb_1', position: 'Senior Product Manager', company: 'TechCorp Inc.', startDate: 'Jan 2021', endDate: 'Present', description: 'Led development of AI-powered analytics platform generating $12M ARR. Managed 15-person cross-functional team.' },
      { id: 'exp_thumb_2', position: 'Product Manager', company: 'StartupXYZ', startDate: 'Jun 2018', endDate: 'Dec 2020', description: 'Launched MVP in 6 months, acquired 50,000 users. Implemented OKR framework improving team velocity by 30%.' },
      { id: 'exp_thumb_3', position: 'Associate PM', company: 'Digital Solutions', startDate: 'Aug 2015', endDate: 'May 2018', description: 'Supported senior PMs on 3 concurrent projects serving 100K+ users. Created wireframes and PRDs.' },
      { id: 'exp_thumb_4', position: 'Marketing Analyst', company: 'BrandCo', startDate: 'Jun 2013', endDate: 'Jul 2015', description: 'Conducted market research and competitive analysis. Improved campaign ROI by 45%.' },
      { id: 'exp_thumb_5', position: 'Business Intern', company: 'Enterprise Corp', startDate: 'Jan 2013', endDate: 'May 2013', description: 'Assisted in strategic planning and market analysis projects.' },
    ],
    education: content.education?.length > 0 ? content.education : [
      { id: 'edu_thumb_1', degree: 'MBA, Product Management', school: 'Stanford University', graduationYear: '2017' },
      { id: 'edu_thumb_2', degree: 'BS Computer Science', school: 'UC Berkeley', graduationYear: '2015' },
    ],
    skills: content.skills?.length > 0 ? content.skills : [
      { id: 'skill_thumb_1', name: 'Product Strategy' },
      { id: 'skill_thumb_2', name: 'Agile/Scrum' },
      { id: 'skill_thumb_3', name: 'Data Analytics' },
      { id: 'skill_thumb_4', name: 'SQL' },
      { id: 'skill_thumb_5', name: 'Python' },
      { id: 'skill_thumb_6', name: 'Figma' },
      { id: 'skill_thumb_7', name: 'JIRA' },
      { id: 'skill_thumb_8', name: 'A/B Testing' },
      { id: 'skill_thumb_9', name: 'User Research' },
      { id: 'skill_thumb_10', name: 'Roadmapping' },
      { id: 'skill_thumb_11', name: 'Competitive Analysis' },
      { id: 'skill_thumb_12', name: 'Team Leadership' },
      { id: 'skill_thumb_13', name: 'Project Management' },
      { id: 'skill_thumb_14', name: 'Data Visualization' },
      { id: 'skill_thumb_15', name: 'Machine Learning' },
      { id: 'skill_thumb_16', name: 'Cloud Computing' },
      { id: 'skill_thumb_17', name: 'API Design' },
      { id: 'skill_thumb_18', name: 'Customer Acquisition' },
      { id: 'skill_thumb_19', name: 'Growth Hacking' },
      { id: 'skill_thumb_20', name: 'Market Research' },
    ],
    languages: content.languages?.length > 0 ? content.languages : [
      { id: 'lang_thumb_1', language: 'English', proficiency: 'Native' },
      { id: 'lang_thumb_2', language: 'Spanish', proficiency: 'Fluent' },
      { id: 'lang_thumb_3', language: 'French', proficiency: 'Intermediate' },
    ],
    certifications: content.certifications?.length > 0 ? content.certifications : [
      { id: 'cert_thumb_1', name: 'PMP Certified', issuer: 'PMI', date: '2020' },
      { id: 'cert_thumb_2', name: 'AWS Solutions Architect', issuer: 'Amazon', date: '2021' },
      { id: 'cert_thumb_3', name: 'Google Analytics', issuer: 'Google', date: '2019' },
      { id: 'cert_thumb_4', name: 'Scrum Master', issuer: 'Scrum Alliance', date: '2018' },
    ],
    projects: content.projects?.length > 0 ? content.projects : [
      { id: 'proj_thumb_1', name: 'AI Analytics Dashboard', description: 'Built real-time analytics platform with ML predictions', technologies: ['React', 'Python', 'TensorFlow'] },
      { id: 'proj_thumb_2', name: 'Mobile App Launch', description: 'Led 0-to-1 mobile app reaching 100K downloads', technologies: ['React Native', 'Firebase'] },
    ],
  };

  const sidebarContent = (
    <div className="flex h-full w-full" style={{ fontFamily, fontSize: '9px', lineHeight: 1.4 }}>
      {/* Left Sidebar */}
      <div 
        className="h-full flex flex-col p-3 gap-2 overflow-hidden"
        style={{ 
          width: '32%',
          backgroundColor: primaryColor,
          color: '#ffffff',
          minWidth: 0,
        }}
      >
        {/* Name & Title */}
        <div className="text-center">
          <h1 
            className="font-black leading-tight tracking-tight truncate"
            style={{ fontSize: '12px', color: '#ffffff' }}
          >
            {defaultData.personalInfo.fullName}
          </h1>
          <p 
            className="font-bold uppercase tracking-wider opacity-60 mt-0.5 truncate"
            style={{ fontSize: '6px' }}
          >
            {defaultData.personalInfo.professionalTitle}
          </p>
        </div>
        
        {/* Contact Section */}
        <div className="space-y-2">
          <div>
            <h3 className="text-[6px] font-bold uppercase tracking-wider opacity-40 border-b pb-0.5 mb-1">
              Contact
            </h3>
            <div className="space-y-0.5 text-[5px] font-medium opacity-80">
              <div className="truncate">{defaultData.personalInfo.email}</div>
              <div>{defaultData.personalInfo.phone}</div>
              <div className="truncate">{defaultData.personalInfo.location}</div>
            </div>
          </div>
          
          {/* Skills */}
          <div>
            <h3 className="text-[6px] font-bold uppercase tracking-wider opacity-40 border-b pb-0.5 mb-1">
              Skills
            </h3>
            <div className="space-y-0.5">
              {defaultData.skills.slice(0, 10).map((skill, i) => (
                <div key={i} className="flex items-center gap-1 text-[5px] opacity-80 truncate">
                  <div className="w-0.5 h-0.5 rounded-full bg-white shrink-0" />
                  <span className="truncate">{typeof skill === 'string' ? skill : skill.name}</span>
                </div>
              ))}
              {defaultData.skills.length > 10 && (
                <div className="text-[4px] opacity-60">+{defaultData.skills.length - 10} more</div>
              )}
            </div>
          </div>
          
          {/* Languages */}
          <div>
            <h3 className="text-[6px] font-bold uppercase tracking-wider opacity-40 border-b pb-0.5 mb-1">
              Languages
            </h3>
            <div className="space-y-0.5 text-[5px]">
              {defaultData.languages.map((lang: any, i: number) => (
                <div key={i} className="opacity-80">
                  <span className="font-medium">{lang.language}</span>
                  <span className="opacity-60"> - {lang.proficiency}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Certifications */}
          <div>
            <h3 className="text-[6px] font-bold uppercase tracking-wider opacity-40 border-b pb-0.5 mb-1">
              Certifications
            </h3>
            <div className="space-y-0.5 text-[5px]">
              {defaultData.certifications.slice(0, 4).map((cert: any, i: number) => (
                <div key={i} className="opacity-80 truncate">{cert.name}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 p-3 flex flex-col gap-2 overflow-hidden" style={{ backgroundColor, color: textColor }}>
        {/* Summary */}
        <div>
          <h2 className="text-[7px] font-bold uppercase tracking-wider text-center border-b pb-0.5 mb-1"
            style={{ color: accentColor, borderColor: accentColor }}>
            Professional Profile
          </h2>
          <p className="text-[5px] leading-relaxed opacity-80 line-clamp-3">
            {defaultData.personalInfo.summary}
          </p>
        </div>
        
        {/* Experience */}
        <div className="flex-1 overflow-hidden">
          <h2 className="text-[7px] font-bold uppercase tracking-wider border-b pb-0.5 mb-1"
            style={{ color: accentColor, borderColor: accentColor }}>
            Experience ({defaultData.experience.length})
          </h2>
          <div className="space-y-1 overflow-y-auto max-h-[120px]">
            {defaultData.experience.map((exp: any, i: number) => (
              <div key={i}>
                <div className="flex justify-between items-baseline">
                  <h3 className="font-bold text-[5px] truncate" style={{ color: textColor }}>
                    {exp.position}
                  </h3>
                  <span className="opacity-50 text-[4px] shrink-0 ml-1">
                    {exp.startDate}
                  </span>
                </div>
                <p className="opacity-70 text-[4px] truncate">{exp.company}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Education */}
        <div>
          <h2 className="text-[7px] font-bold uppercase tracking-wider border-b pb-0.5 mb-1"
            style={{ color: accentColor, borderColor: accentColor }}>
            Education ({defaultData.education.length})
          </h2>
          <div className="space-y-0.5">
            {defaultData.education.map((edu: any, i: number) => (
              <div key={i}>
                <div className="flex justify-between items-baseline">
                  <h3 className="font-bold text-[5px] truncate">{edu.degree}</h3>
                  <span className="opacity-50 text-[4px]">{edu.graduationYear}</span>
                </div>
                <p className="opacity-70 text-[4px] truncate">{edu.school}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Projects */}
        <div>
          <h2 className="text-[7px] font-bold uppercase tracking-wider border-b pb-0.5 mb-1"
            style={{ color: accentColor, borderColor: accentColor }}>
            Projects ({defaultData.projects.length})
          </h2>
          <div className="space-y-0.5">
            {defaultData.projects.map((proj: any, i: number) => (
              <div key={i}>
                <div className="font-bold text-[5px] truncate">{proj.name}</div>
                <p className="opacity-70 text-[4px] truncate">{proj.technologies?.join(', ')}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const singleColumnContent = (
    <div className="h-full w-full p-3 flex flex-col gap-2 overflow-hidden" style={{ fontFamily, fontSize: '9px', lineHeight: 1.4, backgroundColor, color: textColor }}>
      {/* Header */}
      <div className="text-center">
        <h1 
          className="font-black tracking-tight leading-tight truncate"
          style={{ fontSize: '13px', color: primaryColor }}
        >
          {defaultData.personalInfo.fullName}
        </h1>
        <p className="font-bold uppercase tracking-wider opacity-60 mt-0.5" style={{ fontSize: '6px' }}>
          {defaultData.personalInfo.professionalTitle}
        </p>
        <div className="flex justify-center gap-1 mt-0.5 opacity-60" style={{ fontSize: '5px' }}>
          <span className="truncate max-w-[50px]">{defaultData.personalInfo.email}</span>
          <span>•</span>
          <span>{defaultData.personalInfo.phone}</span>
          <span>•</span>
          <span className="truncate max-w-[40px]">{defaultData.personalInfo.location}</span>
        </div>
      </div>
      
      {/* Divider */}
      <div className="h-px w-full" style={{ backgroundColor: primaryColor }} />
      
      {/* Summary */}
      <div>
        <h2 className="text-[6px] font-bold uppercase tracking-wider text-center border-b pb-0.5 mb-0.5"
          style={{ color: accentColor, borderColor: accentColor }}>
          Professional Summary
        </h2>
        <p className="text-[5px] leading-relaxed opacity-75 line-clamp-2">
          {defaultData.personalInfo.summary}
        </p>
      </div>
      
      {/* Three Column Layout */}
      <div className="flex gap-2 flex-1 overflow-hidden">
        {/* Experience Column */}
        <div className="flex-1">
          <h2 className="text-[6px] font-bold uppercase tracking-wider border-b pb-0.5 mb-0.5"
            style={{ color: accentColor, borderColor: accentColor }}>
            Experience ({defaultData.experience.length})
          </h2>
          <div className="space-y-1 overflow-y-auto max-h-[100px]">
            {defaultData.experience.map((exp: any, i: number) => (
              <div key={i}>
                <div className="flex justify-between items-baseline">
                  <h3 className="font-bold text-[5px] truncate">{exp.position}</h3>
                  <span className="opacity-50 text-[4px] shrink-0 ml-1">{exp.startDate.split(' ')[0]}</span>
                </div>
                <p className="opacity-70 text-[4px] truncate">{exp.company}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Middle Column */}
        <div className="flex-1">
          {/* Skills */}
          <div>
            <h2 className="text-[6px] font-bold uppercase tracking-wider border-b pb-0.5 mb-0.5"
              style={{ color: accentColor, borderColor: accentColor }}>
              Skills ({defaultData.skills.length})
            </h2>
            <div className="flex flex-wrap gap-0.5">
              {defaultData.skills.slice(0, 10).map((skill, i) => (
                <span 
                  key={i}
                  className="px-1 py-0.5 rounded text-[4px] font-medium"
                  style={{ 
                    backgroundColor: `${primaryColor}15`,
                    color: primaryColor 
                  }}
                >
                  {typeof skill === 'string' ? skill : skill.name}
                </span>
              ))}
            </div>
          </div>
          
          {/* Projects */}
          <div className="mt-1">
            <h2 className="text-[6px] font-bold uppercase tracking-wider border-b pb-0.5 mb-0.5"
              style={{ color: accentColor, borderColor: accentColor }}>
              Projects ({defaultData.projects.length})
            </h2>
            <div className="text-[4px] space-y-0.5">
              {defaultData.projects.map((proj: any, i: number) => (
                <div key={i} className="truncate">{proj.name}</div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Right Column */}
        <div className="flex-1 flex flex-col gap-1">
          {/* Education */}
          <div>
            <h2 className="text-[6px] font-bold uppercase tracking-wider border-b pb-0.5 mb-0.5"
              style={{ color: accentColor, borderColor: accentColor }}>
              Education ({defaultData.education.length})
            </h2>
            <div className="text-[4px] space-y-0.5">
              {defaultData.education.map((edu: any, i: number) => (
                <div key={i}>
                  <div className="font-bold truncate">{edu.degree}</div>
                  <div className="opacity-70 truncate">{edu.school}</div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Languages */}
          <div>
            <h2 className="text-[6px] font-bold uppercase tracking-wider border-b pb-0.5 mb-0.5"
              style={{ color: accentColor, borderColor: accentColor }}>
              Languages ({defaultData.languages.length})
            </h2>
            <div className="text-[4px] space-y-0.5">
              {defaultData.languages.map((lang: any, i: number) => (
                <div key={i}>
                  <span className="font-medium">{lang.language}</span>
                  <span className="opacity-60"> ({lang.proficiency})</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Certifications */}
          <div>
            <h2 className="text-[6px] font-bold uppercase tracking-wider border-b pb-0.5 mb-0.5"
              style={{ color: accentColor, borderColor: accentColor }}>
              Certifications ({defaultData.certifications.length})
            </h2>
            <div className="text-[4px] space-y-0.5">
              {defaultData.certifications.map((cert: any, i: number) => (
                <div key={i} className="truncate">{cert.name}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div 
      className={`relative w-full h-full ${className}`}
      style={{
        minHeight: '100%',
        minWidth: '100%',
      }}
    >
      {isSidebar ? sidebarContent : singleColumnContent}
    </div>
  );
};

export default ResumeThumbnail;
