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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
          <p className="text-gray-600 mb-8">You need to be signed in to access the AI Resume Generator.</p>
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--app-primary)' }}>
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  AI Resume Generator
                </h1>
                <p className="text-gray-600">Create professional resumes with AI</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                Dashboard
              </button>
              <button
                onClick={() => router.push('/templates')}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
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
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Wand2 className="h-6 w-6 text-purple-600" />
                Choose Template Style
              </h2>
              
              <div className="grid grid-cols-2 gap-4">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template.id)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedTemplate === template.id
                        ? 'border-purple-600 bg-purple-50 text-purple-600'
                        : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <template.icon className="h-8 w-8 text-purple-600" />
                      <div>
                        <h3 className="font-semibold">{template.name}</h3>
                        <p className="text-sm text-gray-600">{template.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              </div>

              {/* Tab Navigation */}
              <div className="border-b border-gray-200 mb-6">
                <nav className="flex space-x-1">
                  {['personal', 'experience', 'education', 'skills', 'languages', 'projects'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 font-medium transition-all ${
                        activeTab === tab
                          ? 'text-purple-600 border-b-2 border-purple-600'
                          : 'text-gray-600 hover:text-gray-900 border-b-2 border-transparent hover:border-gray-300'
                      }`}
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                        <input
                          type="text"
                          value={resumeData.personalInfo.fullName}
                          onChange={(e) => setResumeData(prev => ({
                            ...prev,
                            personalInfo: { ...prev.personalInfo, fullName: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          placeholder="John Doe"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input
                          type="email"
                          value={resumeData.personalInfo.email}
                          onChange={(e) => setResumeData(prev => ({
                            ...prev,
                            personalInfo: { ...prev.personalInfo, email: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          placeholder="john.doe@example.com"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                        <input
                          type="tel"
                          value={resumeData.personalInfo.phone}
                          onChange={(e) => setResumeData(prev => ({
                            ...prev,
                            personalInfo: { ...prev.personalInfo, phone: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                        <input
                          type="text"
                          value={resumeData.personalInfo.location}
                          onChange={(e) => setResumeData(prev => ({
                            ...prev,
                            personalInfo: { ...prev.personalInfo, location: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          placeholder="San Francisco, CA"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Professional Title</label>
                      <select
                        value={resumeData.personalInfo.professionalTitle}
                        onChange={(e) => setResumeData(prev => ({
                          ...prev,
                          personalInfo: { ...prev.personalInfo, professionalTitle: e.target.value }
                          }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      >
                        <option value="">Select a title...</option>
                        {jobTitles.map((title) => (
                          <option key={title} value={title}>{title}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Professional Summary</label>
                      <textarea
                        value={resumeData.personalInfo.summary}
                        onChange={(e) => setResumeData(prev => ({
                          ...prev,
                          personalInfo: { ...prev.personalInfo, summary: e.target.value }
                          }))}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="Experienced software engineer with 5+ years of experience in developing scalable web applications..."
                      />
                    </div>
                  </div>
                )}

                {/* Experience Tab */}
                {activeTab === 'experience' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Work Experience</h3>
                      <button
                        onClick={addExperience}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add Experience
                      </button>
                    </div>
                    
                    {resumeData.experience.map((exp, index) => (
                      <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">Experience {index + 1}</h4>
                          <button
                            onClick={() => removeItem('experience', index)}
                            className="text-red-600 hover:text-red-700 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                            <input
                              type="text"
                              value={exp.company}
                              onChange={(e) => {
                                const newExperience = [...resumeData.experience];
                                newExperience[index] = { ...newExperience[index], company: e.target.value };
                                setResumeData(prev => ({ ...prev, experience: newExperience }));
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                              placeholder="Google"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                            <input
                              type="text"
                              value={exp.position}
                              onChange={(e) => {
                                const newExperience = [...resumeData.experience];
                                newExperience[index] = { ...newExperience[index], position: e.target.value };
                                setResumeData(prev => ({ ...prev, experience: newExperience }));
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                              placeholder="Software Engineer"
                            />
                          </div>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                            <input
                              type="month"
                              value={exp.startDate}
                              onChange={(e) => {
                                const newExperience = [...resumeData.experience];
                                newExperience[index] = { ...newExperience[index], startDate: e.target.value };
                                setResumeData(prev => ({ ...prev, experience: newExperience }));
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                            <input
                              type="month"
                              value={exp.endDate}
                              onChange={(e) => {
                                const newExperience = [...resumeData.experience];
                                newExperience[index] = { ...newExperience[index], endDate: e.target.value };
                                setResumeData(prev => ({ ...prev, experience: newExperience }));
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            />
                          </div>
                        </div>
                        
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                          <textarea
                            value={exp.description}
                            onChange={(e) => {
                              const newExperience = [...resumeData.experience];
                              newExperience[index] = { ...newExperience[index], description: e.target.value };
                              setResumeData(prev => ({ ...prev, experience: newExperience }));
                              }}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
                      <h3 className="text-lg font-semibold">Education</h3>
                      <button
                        onClick={addEducation}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add Education
                      </button>
                    </div>
                    
                    {resumeData.education.map((edu, index) => (
                      <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">Education {index + 1}</h4>
                          <button
                            onClick={() => removeItem('education', index)}
                            className="text-red-600 hover:text-red-700 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">School</label>
                            <input
                              type="text"
                              value={edu.school}
                              onChange={(e) => {
                                const newEducation = [...resumeData.education];
                                newEducation[index] = { ...newEducation[index], school: e.target.value };
                                setResumeData(prev => ({ ...prev, education: newEducation }));
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                              placeholder="Stanford University"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Degree</label>
                            <input
                              type="text"
                              value={edu.degree}
                              onChange={(e) => {
                                const newEducation = [...resumeData.education];
                                newEducation[index] = { ...newEducation[index], degree: e.target.value };
                                setResumeData(prev => ({ ...prev, education: newEducation }));
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                              placeholder="Bachelor of Science in Computer Science"
                            />
                          </div>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Graduation Year</label>
                            <input
                              type="number"
                              value={edu.graduationYear}
                              onChange={(e) => {
                                const newEducation = [...resumeData.education];
                                newEducation[index] = { ...newEducation[index], graduationYear: e.target.value };
                                setResumeData(prev => ({ ...prev, education: newEducation }));
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                              placeholder="2020"
                              min="1950"
                              max="2030"
                            />
                          </div>
                        </div>
                        
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                          <textarea
                            value={edu.description}
                            onChange={(e) => {
                              const newEducation = [...resumeData.education];
                              newEducation[index] = { ...newEducation[index], description: e.target.value };
                              setResumeData(prev => ({ ...prev, education: newEducation }));
                              }}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
                      <h3 className="text-lg font-semibold">Skills</h3>
                      <button
                        onClick={addSkill}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add Skill
                      </button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {resumeData.skills.map((skill, index) => (
                        <div key={index} className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-gray-200">
                          <input
                            type="text"
                            value={skill}
                            onChange={(e) => {
                              const newSkills = [...resumeData.skills];
                              newSkills[index] = e.target.value;
                              setResumeData(prev => ({ ...prev, skills: newSkills }));
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            placeholder="JavaScript"
                          />
                          <button
                            onClick={() => removeItem('skills', index)}
                            className="text-red-600 hover:text-red-700 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Quick Add Common Skills:</label>
                      <div className="grid grid-cols-4 gap-2">
                        {['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python'].map((skill) => (
                          <button
                            key={skill}
                            onClick={() => {
                              setResumeData(prev => ({ ...prev, skills: [...prev.skills, skill] }));
                            }}
                            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors"
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
                      <h3 className="text-lg font-semibold">Languages</h3>
                      <button
                        onClick={() => {
                          setResumeData(prev => ({
                            ...prev,
                            languages: [...prev.languages, { language: '', proficiency: 'Fluent' }]
                          }));
                        }}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add Language
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      {resumeData.languages.map((lang, index) => (
                        <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">Language {index + 1}</h4>
                            <button
                              onClick={() => removeItem('languages', index)}
                              className="text-red-600 hover:text-red-700 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                              <select
                                value={lang.language}
                                onChange={(e) => {
                                  const newLanguages = [...resumeData.languages];
                                  newLanguages[index] = { ...newLanguages[index], language: e.target.value };
                                  setResumeData(prev => ({ ...prev, languages: newLanguages }));
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
                              <label className="block text-sm font-medium text-gray-700 mb-2">Proficiency</label>
                              <select
                                value={lang.proficiency}
                                onChange={(e) => {
                                  const newLanguages = [...resumeData.languages];
                                  newLanguages[index] = { ...newLanguages[index], proficiency: e.target.value };
                                  setResumeData(prev => ({ ...prev, languages: newLanguages }));
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
                      <h3 className="text-lg font-semibold">Projects</h3>
                      <button
                        onClick={() => {
                          setResumeData(prev => ({
                            ...prev,
                            projects: [...prev.projects, { name: '', description: '', technologies: [] }]
                          }));
                        }}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add Project
                      </button>
                    </div>
                    
                    {resumeData.projects.map((project, index) => (
                      <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">Project {index + 1}</h4>
                          <button
                            onClick={() => removeItem('projects', index)}
                            className="text-red-600 hover:text-red-700 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Project Name</label>
                            <input
                              type="text"
                              value={project.name}
                              onChange={(e) => {
                                const newProjects = [...resumeData.projects];
                                newProjects[index] = { ...newProjects[index], name: e.target.value };
                                setResumeData(prev => ({ ...prev, projects: newProjects }));
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                              placeholder="E-commerce Platform"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                            <textarea
                              value={project.description}
                              onChange={(e) => {
                                const newProjects = [...resumeData.projects];
                                newProjects[index] = { ...newProjects[index], description: e.target.value };
                                setResumeData(prev => ({ ...prev, projects: newProjects }));
                              }}
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                              placeholder="Built a full-stack e-commerce platform with React and Node.js..."
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Technologies</label>
                            <input
                              type="text"
                              value={project.technologies.join(', ')}
                              onChange={(e) => {
                                const newProjects = [...resumeData.projects];
                                newProjects[index] = { ...newProjects[index], technologies: e.target.value.split(', ') };
                                setResumeData(prev => ({ ...prev, projects: newProjects }));
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <FileText className="h-5 w-5" />
                Save Resume
              </button>
              
              <button
                onClick={handleDownloadPDF}
                className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
              >
                <Download className="h-5 w-5" />
                Download PDF
              </button>
            </div>
            
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="w-full px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <Eye className="h-5 w-5" />
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </button>
          </div>
        </div>

        {/* Preview Section */}
        {showPreview && (
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <FileText className="h-6 w-6 text-purple-600" />
                  Resume Preview
                </h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <RefreshCw className="h-5 w-5" />
                </button>
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-semibold mb-2">Generated Content:</h4>
                <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-auto max-h-96">
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
