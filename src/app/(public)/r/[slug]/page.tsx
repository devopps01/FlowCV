'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface Experience {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

interface Education {
  id: string;
  school: string;
  degree: string;
  field: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  graduationYear?: string;
  gpa?: string;
  description?: string;
}

interface Skill {
  id: string;
  name: string;
  level?: string;
}

interface Language {
  id: string;
  language: string;
  proficiency: string;
}

interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  description?: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  link?: string;
  technologies?: string[];
}

interface Resume {
  _id: string;
  title: string;
  template: string;
  content: {
    personalInfo: {
      id?: string;
      fullName?: string;
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      location: string;
      summary: string;
      linkedIn: string;
      website: string;
      photo: string;
    };
    experience: Experience[];
    education: Education[];
    skills: Skill[];
    languages: Language[];
    certifications: Certification[];
    projects: Project[];
  };
  design: {
    fontFamily: string;
    fontSize: number;
    primaryColor: string;
  };
}

export default function PublicResumePage() {
  const params = useParams();
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (params.slug) {
      fetchResume();
    }
  }, [params.slug]);

  const fetchResume = async () => {
    try {
      const res = await fetch(`/api/resumes/public/${params.slug}`);
      if (!res.ok) {
        setError('Resume not found');
        return;
      }
      const data = await res.json();
      setResume(data.resume);
    } catch {
      setError('Failed to load resume');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error || !resume) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Resume Not Found</h1>
          <p className="mt-2 text-gray-600">
            This resume doesn&apos;t exist or has been made private.
          </p>
        </div>
      </div>
    );
  }

  const getFullName = () => {
    const p = resume.content.personalInfo;
    return p.fullName || `${p.firstName} ${p.lastName}`.trim() || 'No Name';
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-[210mm] mx-auto bg-white shadow-lg" style={{ 
        fontFamily: resume.design.fontFamily,
        fontSize: `${resume.design.fontSize}px`,
      }}>
        <div className="p-12">
          <div className="flex items-center gap-6 mb-8" style={{ borderBottom: `3px solid ${resume.design.primaryColor}`, paddingBottom: '24px' }}>
            {resume.content.personalInfo.photo && (
              <img
                src={resume.content.personalInfo.photo}
                alt="Profile"
                className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
              />
            )}
            <div className="flex-1 text-center">
              <h1 className="text-4xl font-bold mb-2" style={{ color: resume.design.primaryColor }}>
                {getFullName()}
              </h1>
              <div className="mt-4 space-y-1 text-base">
                {resume.content.personalInfo.email && <p>{resume.content.personalInfo.email}</p>}
                {resume.content.personalInfo.phone && <p>{resume.content.personalInfo.phone}</p>}
                {resume.content.personalInfo.location && <p>{resume.content.personalInfo.location}</p>}
                {resume.content.personalInfo.linkedIn && <p>{resume.content.personalInfo.linkedIn}</p>}
                {resume.content.personalInfo.website && <p>{resume.content.personalInfo.website}</p>}
              </div>
            </div>
          </div>

          {resume.content.personalInfo.summary && (
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-3" style={{ color: resume.design.primaryColor }}>
                Professional Summary
              </h2>
              <p className="leading-relaxed">{resume.content.personalInfo.summary}</p>
            </div>
          )}

          {resume.content.experience.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4" style={{ color: resume.design.primaryColor }}>
                Work Experience
              </h2>
              {resume.content.experience.map((exp) => (
                <div key={exp.id || exp.company + exp.position} className="mb-6">
                  <div className="flex justify-between items-baseline">
                    <h3 className="text-lg font-semibold">{exp.position}</h3>
                    <span className="text-sm">
                      {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                    </span>
                  </div>
                  <p className="text-base font-medium">
                    {exp.company}{exp.location ? `, ${exp.location}` : ''}
                  </p>
                  {exp.description && (
                    <p className="mt-2 leading-relaxed whitespace-pre-wrap">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {resume.content.education.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4" style={{ color: resume.design.primaryColor }}>
                Education
              </h2>
              {resume.content.education.map((edu) => (
                <div key={edu.id || edu.school + edu.degree} className="mb-4">
                  <div className="flex justify-between items-baseline">
                    <h3 className="text-lg font-semibold">
                      {edu.degree}{edu.field ? ` in ${edu.field}` : ''}
                    </h3>
                    <span className="text-sm">
                      {edu.graduationYear || (edu.startDate && edu.endDate ? `${edu.startDate} - ${edu.endDate}` : '')}
                    </span>
                  </div>
                  <p className="text-base">{edu.school}</p>
                  {edu.gpa && <p className="text-sm">GPA: {edu.gpa}</p>}
                </div>
              ))}
            </div>
          )}

          {resume.content.skills.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-3" style={{ color: resume.design.primaryColor }}>
                Skills
              </h2>
              <p className="leading-relaxed">
                {resume.content.skills.map(s => s.name).filter(Boolean).join(' • ')}
              </p>
            </div>
          )}

          {resume.content.languages.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-3" style={{ color: resume.design.primaryColor }}>
                Languages
              </h2>
              <p>
                {resume.content.languages.map((lang, index) => (
                  <span key={lang.id || index}>
                    {lang.language} ({lang.proficiency})
                    {index < resume.content.languages.length - 1 ? ' • ' : ''}
                  </span>
                ))}
              </p>
            </div>
          )}

          {resume.content.certifications.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-3" style={{ color: resume.design.primaryColor }}>
                Certifications
              </h2>
              {resume.content.certifications.map((cert) => (
                <div key={cert.id || cert.name} className="mb-2">
                  <span className="font-semibold">{cert.name}</span>
                  {cert.issuer && <span> - {cert.issuer}</span>}
                  {cert.date && <span> ({cert.date})</span>}
                </div>
              ))}
            </div>
          )}

          {resume.content.projects.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-3" style={{ color: resume.design.primaryColor }}>
                Projects
              </h2>
              {resume.content.projects.map((proj) => (
                <div key={proj.id || proj.name} className="mb-3">
                  <h3 className="font-semibold">{proj.name}</h3>
                  {proj.description && <p className="leading-relaxed">{proj.description}</p>}
                  {proj.link && (
                    <a href={proj.link} className="text-sm" style={{ color: resume.design.primaryColor }}>
                      {proj.link}
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
