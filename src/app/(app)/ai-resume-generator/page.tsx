'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { 
  Sparkles, 
  Wand2, 
  FileText, 
  Download, 
  ArrowRight, 
  User, 
  Briefcase, 
  GraduationCap, 
  Award, 
  Globe, 
  Languages, 
  Target,
  Zap,
  Eye,
  Settings,
  Plus,
  Trash2,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import { createEmptyItem, processContentWithIds } from '@/lib/utils/resume-ids';

export default function AIResumeGenerator() {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [resumeData, setResumeData] = useState({
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      professionalTitle: '',
      summary: '',
      image: ''
    },
    experience: [] as any[],
    education: [] as any[],
    skills: [] as any[],
    languages: [] as any[],
    projects: [] as any[],
    certifications: [] as any[],
    awards: [] as any[],
    interests: [] as any[]
  });
  
  const [activeTab, setActiveTab] = useState('personal');
  const [selectedTemplate, setSelectedTemplate] = useState('professional');
  const [showPreview, setShowPreview] = useState(false);

  const templates = [
    {
      id: 'professional',
      name: 'Professional',
      description: 'Clean, modern design perfect for corporate roles',
      icon: Briefcase
    },
    {
      id: 'creative',
      name: 'Creative',
      description: 'Eye-catching design for creative industries',
      icon: Sparkles
    },
    {
      id: 'academic',
      name: 'Academic',
      description: 'Traditional format for academic and research positions',
      icon: GraduationCap
    },
    {
      id: 'technical',
      name: 'Technical',
      description: 'Optimized for technical and engineering roles',
      icon: Settings
    }
  ];

  const jobTitles = [
    'Software Engineer',
    'Product Manager',
    'Data Scientist',
    'UX Designer',
    'Marketing Manager',
    'Sales Representative',
    'Customer Success Manager',
    'Project Manager',
    'Business Analyst',
    'Financial Analyst',
    'HR Manager',
    'Operations Manager',
    'Consultant',
    'Graphic Designer',
    'Content Writer',
    'Digital Marketer',
    'Full Stack Developer',
    'Frontend Developer',
    'Backend Developer',
    'DevOps Engineer',
    'Quality Assurance Engineer',
    'Product Designer',
    'Research Scientist',
    'Data Analyst'
  ];

  const industries = [
    'Technology',
    'Healthcare',
    'Finance',
    'Education',
    'Marketing',
    'Consulting',
    'Retail',
    'Manufacturing',
    'Government',
    'Non-profit',
    'Entertainment',
    'Media',
    'Hospitality',
    'Transportation',
    'Energy',
    'Real Estate',
    'Legal',
    'Insurance',
    'Agriculture',
    'Construction'
  ];

  const skills = [
    'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'C++', 'SQL', 'MongoDB', 'PostgreSQL', 'AWS', 'Docker', 'Kubernetes', 'Git', 'REST API', 'GraphQL', 'Machine Learning', 'Data Analysis', 'Project Management', 'Agile', 'Scrum', 'CI/CD', 'Testing', 'UI/UX Design', 'Figma', 'Adobe Creative Suite', 'Microsoft Office', 'Communication', 'Leadership', 'Problem Solving', 'Critical Thinking', 'Time Management', 'Team Collaboration', 'Customer Service', 'Sales', 'Marketing', 'Financial Analysis', 'Strategic Planning'
  ];

  const handleGenerateResume = async () => {
    if (!resumeData.personalInfo.fullName || !resumeData.personalInfo.professionalTitle) {
      toast.error('Please fill in your name and professional title');
      return;
    }

    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/ai/generate-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `Generate a professional ${selectedTemplate} resume for ${resumeData.personalInfo.professionalTitle} with the following details:
          
          Personal Information:
          - Name: ${resumeData.personalInfo.fullName}
          - Email: ${resumeData.personalInfo.email}
          - Phone: ${resumeData.personalInfo.phone}
          - Location: ${resumeData.personalInfo.location}
          - Professional Title: ${resumeData.personalInfo.professionalTitle}
          - Summary: ${resumeData.personalInfo.summary}
          
          Experience: ${resumeData.experience.length} positions
          Education: ${resumeData.education.length} degrees
          Skills: ${resumeData.skills.length} skills
          Languages: ${resumeData.languages.length} languages
          
          Template Style: ${selectedTemplate}
          
          Please create a complete, professional resume that highlights achievements and uses strong action verbs. Include quantifiable results where possible. Format for ATS optimization and modern professional standards.`,
          currentData: resumeData
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate resume');
      }

      const result = await response.json();
      
      if (result.content) {
        setGeneratedContent(JSON.stringify(result.content, null, 2));
        setResumeData(prev => ({
          ...prev,
          ...result.content
        }));
        setShowPreview(true);
        toast.success('Resume generated successfully!');
      }
    } catch (error) {
      console.error('Error generating resume:', error);
      toast.error('Failed to generate resume. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveResume = async () => {
    try {
      const processedContent = processContentWithIds(resumeData);
      const response = await fetch('/api/resumes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: `${resumeData.personalInfo.fullName}'s Resume`,
          template: selectedTemplate,
          content: processedContent
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save resume');
      }

      const result = await response.json();
      
      if (result.success) {
        toast.success('Resume saved successfully!');
        router.push(`/resume/${result.data._id}`);
      }
    } catch (error) {
      console.error('Error saving resume:', error);
      toast.error('Failed to save resume. Please try again.');
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const response = await fetch('/api/export/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: resumeData,
          template: selectedTemplate
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to export PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${resumeData.personalInfo.fullName || 'resume'}_${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download PDF. Please try again.');
    }
  };

  const addExperience = () => {
    setResumeData(prev => ({
      ...prev,
      experience: [...prev.experience, createEmptyItem('experience')]
    }));
  };

  const addEducation = () => {
    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, createEmptyItem('education')]
    }));
  };

  const addSkill = () => {
    setResumeData(prev => ({
      ...prev,
      skills: [...prev.skills, createEmptyItem('skills')]
    }));
  };

  const addLanguage = () => {
    setResumeData(prev => ({
      ...prev,
      languages: [...(prev.languages || []), createEmptyItem('languages')]
    }));
  };

  const addCertification = () => {
    setResumeData(prev => ({
      ...prev,
      certifications: [...(prev.certifications || []), createEmptyItem('certifications')]
    }));
  };

  const addProject = () => {
    setResumeData(prev => ({
      ...prev,
      projects: [...(prev.projects || []), createEmptyItem('projects')]
    }));
  };

  const addAward = () => {
    setResumeData(prev => ({
      ...prev,
      awards: [...(prev.awards || []), createEmptyItem('awards')]
    }));
  };

  const addInterest = () => {
    setResumeData(prev => ({
      ...prev,
      interests: [...(prev.interests || []), createEmptyItem('interests')]
    }));
  };

  const removeItem = (section: string, index: number) => {
    setResumeData(prev => ({
      ...prev,
      [section]: (prev[section as keyof typeof prev] as any[])?.filter((_, i) => i !== index)
    }));
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--app-bg)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-4" style={{ borderColor: 'var(--app-primary)', borderTopColor: 'transparent' }}></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--app-bg)' }}>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--app-text)' }}>Please Sign In</h1>
          <p style={{ color: 'var(--app-text-secondary)' }} className="mb-8">You need to be signed in to access the AI Resume Generator.</p>
          <button
            onClick={() => router.push('/login')}
            className="btn-primary px-6 py-3"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-page-gray">
      {/* Header */}
      <div style={{ background: 'var(--app-bg-card)', borderBottom: '1px solid var(--app-border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--app-primary)' }}>
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--app-text)' }}>AI Resume Generator</h1>
                <p style={{ color: 'var(--app-text-secondary)', fontSize: 14 }}>Create professional resumes with AI</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="btn-ghost px-4 py-2"
              >
                Dashboard
              </button>
              <button
                onClick={() => router.push('/templates')}
                className="btn-ghost px-4 py-2"
              >
                Templates
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Input Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Template Selection */}
            <div className="app-card">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--app-text)' }}>
                <Wand2 className="h-6 w-6" style={{ color: 'var(--app-primary)' }} />
                Choose Template Style
              </h2>
              
              <div className="grid grid-cols-2 gap-4">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template.id)}
                    className="p-4 rounded-xl border-2 transition-all"
                    style={{
                      borderColor: selectedTemplate === template.id ? 'var(--app-primary)' : 'var(--app-border)',
                      background: selectedTemplate === template.id ? 'var(--app-primary-light)' : 'transparent',
                      color: selectedTemplate === template.id ? 'var(--app-primary)' : 'var(--app-text)',
                    }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <template.icon className="h-8 w-8" style={{ color: 'var(--app-primary)' }} />
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontWeight: 600 }}>{template.name}</div>
                        <div style={{ fontSize: 13, color: 'var(--app-text-secondary)' }}>{template.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              </div>

              {/* Tab Navigation */}
              <div style={{ borderBottom: '1px solid var(--app-border)', marginBottom: 24 }}>
                <nav className="flex space-x-1">
                  {['personal', 'experience', 'education', 'skills', 'languages', 'projects'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      style={{
                        padding: '8px 16px',
                        fontWeight: 600,
                        fontSize: 14,
                        color: activeTab === tab ? 'var(--app-primary)' : 'var(--app-text-secondary)',
                        borderBottom: activeTab === tab ? `2px solid var(--app-primary)` : '2px solid transparent',
                        background: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="space-y-6">
                {/* Personal Information Tab */}
                {activeTab === 'personal' && (
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--app-text-secondary)', display: 'block', marginBottom: 6 }}>Full Name</label>
                        <input
                          type="text"
                          value={resumeData.personalInfo.fullName}
                          onChange={(e) => setResumeData(prev => ({
                            ...prev,
                            personalInfo: { ...prev.personalInfo, fullName: e.target.value }
                          }))}
                          className="app-input"
                          placeholder="John Doe"
                        />
                      </div>
                      
                      <div>
                        <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--app-text-secondary)', display: 'block', marginBottom: 6 }}>Email</label>
                        <input
                          type="email"
                          value={resumeData.personalInfo.email}
                          onChange={(e) => setResumeData(prev => ({
                            ...prev,
                            personalInfo: { ...prev.personalInfo, email: e.target.value }
                          }))}
                          className="app-input"
                          placeholder="john.doe@example.com"
                        />
                      </div>
                      
                      <div>
                        <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--app-text-secondary)', display: 'block', marginBottom: 6 }}>Phone</label>
                        <input
                          type="tel"
                          value={resumeData.personalInfo.phone}
                          onChange={(e) => setResumeData(prev => ({
                            ...prev,
                            personalInfo: { ...prev.personalInfo, phone: e.target.value }
                          }))}
                          className="app-input"
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                      
                      <div>
                        <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--app-text-secondary)', display: 'block', marginBottom: 6 }}>Location</label>
                        <input
                          type="text"
                          value={resumeData.personalInfo.location}
                          onChange={(e) => setResumeData(prev => ({
                            ...prev,
                            personalInfo: { ...prev.personalInfo, location: e.target.value }
                          }))}
                          className="app-input"
                          placeholder="San Francisco, CA"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--app-text-secondary)', display: 'block', marginBottom: 6 }}>Professional Title</label>
                      <select
                        value={resumeData.personalInfo.professionalTitle}
                        onChange={(e) => setResumeData(prev => ({
                          ...prev,
                          personalInfo: { ...prev.personalInfo, professionalTitle: e.target.value }
                          }))}
                        className="app-input"
                      >
                        <option value="">Select a title...</option>
                        {jobTitles.map((title) => (
                          <option key={title} value={title}>{title}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--app-text-secondary)', display: 'block', marginBottom: 6 }}>Professional Summary</label>
                      <textarea
                        value={resumeData.personalInfo.summary}
                        onChange={(e) => setResumeData(prev => ({
                          ...prev,
                          personalInfo: { ...prev.personalInfo, summary: e.target.value }
                          }))}
                        rows={4}
                        className="app-input"
                        placeholder="Experienced software engineer with 5+ years of experience developing scalable web applications..."
                      />
                    </div>
                  </div>
                )}

                {/* Experience Tab */}
                {activeTab === 'experience' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--app-text)' }}>Work Experience</h3>
                      <button
                        onClick={addExperience}
                        className="btn-primary px-4 py-2 flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add Experience
                      </button>
                    </div>
                    
                    {resumeData.experience.map((exp, index) => (
                      <div key={index} className="app-card p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 style={{ fontWeight: 600, color: 'var(--app-text)' }}>Experience {index + 1}</h4>
                          <button
                            onClick={() => removeItem('experience', index)}
                            style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer' }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--app-text-secondary)', display: 'block', marginBottom: 6 }}>Company</label>
                            <input
                              type="text"
                              value={exp.company}
                              onChange={(e) => {
                                const newExperience = [...resumeData.experience];
                                newExperience[index] = { ...newExperience[index], company: e.target.value };
                                setResumeData(prev => ({ ...prev, experience: newExperience }));
                              }}
                              className="app-input"
                              placeholder="Google"
                            />
                          </div>
                          
                          <div>
                            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--app-text-secondary)', display: 'block', marginBottom: 6 }}>Position</label>
                            <input
                              type="text"
                              value={exp.position}
                              onChange={(e) => {
                                const newExperience = [...resumeData.experience];
                                newExperience[index] = { ...newExperience[index], position: e.target.value };
                                setResumeData(prev => ({ ...prev, experience: newExperience }));
                              }}
                              className="app-input"
                              placeholder="Software Engineer"
                            />
                          </div>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--app-text-secondary)', display: 'block', marginBottom: 6 }}>Start Date</label>
                            <input
                              type="month"
                              value={exp.startDate}
                              onChange={(e) => {
                                const newExperience = [...resumeData.experience];
                                newExperience[index] = { ...newExperience[index], startDate: e.target.value };
                                setResumeData(prev => ({ ...prev, experience: newExperience }));
                              }}
                              className="app-input"
                            />
                          </div>
                          
                          <div>
                            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--app-text-secondary)', display: 'block', marginBottom: 6 }}>End Date</label>
                            <input
                              type="month"
                              value={exp.endDate}
                              onChange={(e) => {
                                const newExperience = [...resumeData.experience];
                                newExperience[index] = { ...newExperience[index], endDate: e.target.value };
                                setResumeData(prev => ({ ...prev, experience: newExperience }));
                              }}
                              className="app-input"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--app-text-secondary)', display: 'block', marginBottom: 6 }}>Description</label>
                          <textarea
                            value={exp.description}
                            onChange={(e) => {
                              const newExperience = [...resumeData.experience];
                              newExperience[index] = { ...newExperience[index], description: e.target.value };
                              setResumeData(prev => ({ ...prev, experience: newExperience }));
                              }}
                            rows={3}
                            className="app-input"
                            placeholder="Developed and maintained web applications using React and Node.js..."
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Education Tab */}
                {activeTab === 'education' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--app-text)' }}>Education</h3>
                      <button
                        onClick={addEducation}
                        className="btn-primary px-4 py-2 flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add Education
                      </button>
                    </div>
                    
                    {resumeData.education.map((edu, index) => (
                      <div key={index} className="app-card p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 style={{ fontWeight: 600, color: 'var(--app-text)' }}>Education {index + 1}</h4>
                          <button
                            onClick={() => removeItem('education', index)}
                            style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer' }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--app-text-secondary)', display: 'block', marginBottom: 6 }}>School</label>
                            <input
                              type="text"
                              value={edu.school}
                              onChange={(e) => {
                                const newEducation = [...resumeData.education];
                                newEducation[index] = { ...newEducation[index], school: e.target.value };
                                setResumeData(prev => ({ ...prev, education: newEducation }));
                              }}
                              className="app-input"
                              placeholder="Stanford University"
                            />
                          </div>
                          
                          <div>
                            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--app-text-secondary)', display: 'block', marginBottom: 6 }}>Degree</label>
                            <input
                              type="text"
                              value={edu.degree}
                              onChange={(e) => {
                                const newEducation = [...resumeData.education];
                                newEducation[index] = { ...newEducation[index], degree: e.target.value };
                                setResumeData(prev => ({ ...prev, education: newEducation }));
                              }}
                              className="app-input"
                              placeholder="Bachelor of Science in Computer Science"
                            />
                          </div>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--app-text-secondary)', display: 'block', marginBottom: 6 }}>Graduation Year</label>
                            <input
                              type="number"
                              value={edu.graduationYear}
                              onChange={(e) => {
                                const newEducation = [...resumeData.education];
                                newEducation[index] = { ...newEducation[index], graduationYear: e.target.value };
                                setResumeData(prev => ({ ...prev, education: newEducation }));
                              }}
                              className="app-input"
                              placeholder="2020"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--app-text-secondary)', display: 'block', marginBottom: 6 }}>Description</label>
                          <textarea
                            value={edu.description}
                            onChange={(e) => {
                              const newEducation = [...resumeData.education];
                              newEducation[index] = { ...newEducation[index], description: e.target.value };
                              setResumeData(prev => ({ ...prev, education: newEducation }));
                              }}
                            rows={3}
                            className="app-input"
                            placeholder="Graduated with honors, GPA 3.8/4.0..."
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Skills Tab */}
                {activeTab === 'skills' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--app-text)' }}>Skills</h3>
                      <button
                        onClick={addSkill}
                        className="btn-primary px-4 py-2 flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add Skill
                      </button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {resumeData.skills.map((skill, index) => (
                        <div key={index} className="flex items-center gap-2 app-card px-3 py-2">
                          <input
                            type="text"
                            value={skill}
                            onChange={(e) => {
                              const newSkills = [...resumeData.skills];
                              newSkills[index] = e.target.value;
                              setResumeData(prev => ({ ...prev, skills: newSkills }));
                            }}
                            className="app-input flex-1"
                            placeholder="JavaScript"
                          />
                          <button
                            onClick={() => removeItem('skills', index)}
                            style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer' }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-4">
                      <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--app-text-secondary)', display: 'block', marginBottom: 6 }}>Quick Add Common Skills:</label>
                      <div className="flex flex-wrap gap-2">
                        {['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python'].map((skill) => (
                          <button
                            key={skill}
                            onClick={() => {
                              setResumeData(prev => ({ ...prev, skills: [...prev.skills, skill] }));
                            }}
                            className="btn-ghost px-3 py-2 text-sm"
                          >
                            {skill}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Languages Tab */}
                {activeTab === 'languages' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--app-text)' }}>Languages</h3>
                      <button
                        onClick={() => {
                          setResumeData(prev => ({
                            ...prev,
                            languages: [...prev.languages, { language: '', proficiency: 'Fluent' }]
                          }));
                        }}
                        className="btn-primary px-4 py-2 flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add Language
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      {resumeData.languages.map((lang, index) => (
                        <div key={index} className="app-card p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 style={{ fontWeight: 600, color: 'var(--app-text)' }}>Language {index + 1}</h4>
                            <button
                              onClick={() => removeItem('languages', index)}
                              style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer' }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--app-text-secondary)', display: 'block', marginBottom: 6 }}>Language</label>
                              <select
                                value={lang.language}
                                onChange={(e) => {
                                  const newLanguages = [...resumeData.languages];
                                  newLanguages[index] = { ...newLanguages[index], language: e.target.value };
                                  setResumeData(prev => ({ ...prev, languages: newLanguages }));
                                }}
                                className="app-input"
                              >
                                <option value="">Select language...</option>
                                <option value="English">English</option>
                                <option value="Spanish">Spanish</option>
                                <option value="French">French</option>
                                <option value="German">German</option>
                                <option value="Chinese">Chinese</option>
                                <option value="Japanese">Japanese</option>
                                <option value="Korean">Korean</option>
                                <option value="Portuguese">Portuguese</option>
                                <option value="Russian">Russian</option>
                                <option value="Arabic">Arabic</option>
                                <option value="Hindi">Hindi</option>
                              </select>
                            </div>
                            
                            <div>
                              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--app-text-secondary)', display: 'block', marginBottom: 6 }}>Proficiency</label>
                              <select
                                value={lang.proficiency}
                                onChange={(e) => {
                                  const newLanguages = [...resumeData.languages];
                                  newLanguages[index] = { ...newLanguages[index], proficiency: e.target.value };
                                  setResumeData(prev => ({ ...prev, languages: newLanguages }));
                                }}
                                className="app-input"
                              >
                                <option value="Native">Native</option>
                                <option value="Fluent">Fluent</option>
                                <option value="Advanced">Advanced</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Basic">Basic</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Projects Tab */}
                {activeTab === 'projects' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--app-text)' }}>Projects</h3>
                      <button
                        onClick={() => {
                          setResumeData(prev => ({
                            ...prev,
                            projects: [...prev.projects, { name: '', description: '', technologies: [] }]
                          }));
                        }}
                        className="btn-primary px-4 py-2 flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add Project
                      </button>
                    </div>
                    
                    {resumeData.projects.map((project, index) => (
                      <div key={index} className="app-card p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 style={{ fontWeight: 600, color: 'var(--app-text)' }}>Project {index + 1}</h4>
                          <button
                            onClick={() => removeItem('projects', index)}
                            style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer' }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--app-text-secondary)', display: 'block', marginBottom: 6 }}>Project Name</label>
                            <input
                              type="text"
                              value={project.name}
                              onChange={(e) => {
                                const newProjects = [...resumeData.projects];
                                newProjects[index] = { ...newProjects[index], name: e.target.value };
                                setResumeData(prev => ({ ...prev, projects: newProjects }));
                              }}
                              className="app-input"
                              placeholder="E-commerce Platform"
                            />
                          </div>
                          
                          <div>
                            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--app-text-secondary)', display: 'block', marginBottom: 6 }}>Description</label>
                            <textarea
                              value={project.description}
                              onChange={(e) => {
                                const newProjects = [...resumeData.projects];
                                newProjects[index] = { ...newProjects[index], description: e.target.value };
                                setResumeData(prev => ({ ...prev, projects: newProjects }));
                              }}
                              rows={3}
                              className="app-input"
                              placeholder="Built a full-stack e-commerce platform with React and Node.js..."
                            />
                          </div>
                          
                          <div>
                            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--app-text-secondary)', display: 'block', marginBottom: 6 }}>Technologies</label>
                            <input
                              type="text"
                              value={project.technologies.join(', ')}
                              onChange={(e) => {
                                const newProjects = [...resumeData.projects];
                                newProjects[index] = { ...newProjects[index], technologies: e.target.value.split(', ') };
                                setResumeData(prev => ({ ...prev, projects: newProjects }));
                              }}
                              className="app-input"
                              placeholder="React, Node.js, MongoDB, AWS"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={handleGenerateResume}
              disabled={isGenerating}
              className="btn-primary w-full px-6 py-3 flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Generating Resume...
                </>
              ) : (
                <>
                  <Wand2 className="h-5 w-5" />
                  Generate Resume with AI
                </>
              )}
            </button>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={handleSaveResume}
                className="btn-primary px-6 py-3 flex items-center justify-center gap-2"
              >
                <FileText className="h-5 w-5" />
                Save Resume
              </button>
              
              <button
                onClick={handleDownloadPDF}
                className="btn-primary px-6 py-3 flex items-center justify-center gap-2"
              >
                <Download className="h-5 w-5" />
                Download PDF
              </button>
            </div>
            
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="btn-ghost w-full px-6 py-3 flex items-center justify-center gap-2"
            >
              <Eye className="h-5 w-5" />
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </button>
          </div>
        </div>

        {/* Preview Section */}
        {showPreview && (
          <div className="lg:col-span-1">
            <div className="app-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--app-text)' }} className="flex items-center gap-2">
                  <FileText className="h-6 w-6" style={{ color: 'var(--app-primary)' }} />
                  Resume Preview
                </h3>
                <button
                  onClick={() => setShowPreview(false)}
                  style={{ color: 'var(--app-text-secondary)', cursor: 'pointer', border: 'none', background: 'none' }}
                >
                  <RefreshCw className="h-5 w-5" />
                </button>
              </div>
              
              <div style={{ borderTop: '1px solid var(--app-border)', paddingTop: 16 }}>
                <h4 style={{ fontWeight: 600, marginBottom: 8, color: 'var(--app-text)' }}>Generated Content:</h4>
                <pre style={{ background: 'var(--app-bg-gray)', padding: 16, borderRadius: 8, fontSize: 13, overflow: 'auto', maxHeight: 384, color: 'var(--app-text)' }}>
                  {generatedContent || 'No content generated yet. Click "Generate Resume with AI" to create your resume.'}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
