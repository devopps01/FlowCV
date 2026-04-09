'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { FileText, Download, Star, Users, Clock, ArrowRight, Eye, Filter, Search, Grid, List, Sparkles, Award, Briefcase, BookOpen, Target, Check, Upload, Plus, X, Trash2, Edit } from 'lucide-react';
import TemplateLivePreview from '@/components/resume-builder/TemplateLivePreview';
import { TemplatesHeader } from '@/components/layout/TemplatesHeader';
import { useTheme } from '@/hooks/useTheme';
import ResumePreview from '@/components/resume-builder/ResumePreview';
import ResumeThumbnail from '@/components/resume-builder/ResumeThumbnail';
import A4ResumePreview from '@/components/resume-builder/A4ResumePreview';
import ImageTemplatePreview from '@/components/resume-builder/ImageTemplatePreview';
import { ResumeData } from '@/components/resume-builder/types';
import { 
  generateId, 
  generateExperienceId, 
  generateEducationId, 
  generateSkillId, 
  generateLanguageId,
  generateCertificationId,
  generateProjectId,
  generateAwardId,
  generateInterestId,
} from '@/lib/utils/resume-ids';

// Template data from config
interface TemplateData {
  mainsection: {
    id: string;
    name: string;
    description: string;
    resumeinfo: {
      isPremium: boolean;
      subscription: string;
    };
  };
  secondary: {
    style: {
      primaryColor: string;
      secondaryColor: string;
      accentColor: string;
      fontFamily: string;
      isSerif: boolean;
      layout: string;
      spacing: number;
      borderRadius: string;
      fontSize: number;
      textColor: string;
      backgroundColor: string;
    };
    data: any;
  };
}

// User uploaded template interface
interface UserTemplate {
  _id: string;
  userId: string;
  title: string;
  description: string;
  templateId: string;
  fileName: string;
  isPublic: boolean;
  isPremium: boolean;
  category: string;
  tags: string[];
  downloads: number;
  rating: number;
  ratingCount: number;
  thumbnail: string | null;
  templateData: TemplateData | null;
  createdAt: Date;
  updatedAt: Date;
}

// Unified template interface for display
interface DisplayTemplate {
  id: string;
  name: string;
  description: string;
  isPremium: boolean;
  subscription: string;
  primaryColor: string;
  accentColor: string;
  layout: string;
  fontFamily: string;
  category: string;
  isUserUploaded?: boolean;
  templateId?: string;
  _id?: string;
  downloads?: number;
  rating?: number;
  ratingCount?: number;
  thumbnail?: string | null;
  createdAt?: Date;
}

// Convert TemplateData to DisplayTemplate
const convertToDisplayTemplate = (template: any): DisplayTemplate => {
  try {
    // Handle different template structures
    const mainSection = template.mainsection || template.mainSection || template;
    const secondary = template.secondary || template.secondary || {};

    // Better category detection
    const categorizeTemplate = (t: any): string => {
      const name = (mainSection.name || '').toLowerCase();
      const description = (mainSection.description || '').toLowerCase();
      const combined = name + ' ' + description;

      // Check for category keywords
      if (combined.includes('executive') || combined.includes('ceo') || combined.includes('director') || combined.includes('manager') || combined.includes('senior')) {
        return 'executive';
      }
      if (combined.includes('creative') || combined.includes('portfolio') || combined.includes('designer') || combined.includes('artist') || combined.includes('graphic')) {
        return 'creative';
      }
      if (combined.includes('academic') || combined.includes('research') || combined.includes('professor') || combined.includes('scholar') || combined.includes('thesis') || combined.includes('cv')) {
        return 'academic';
      }
      if (combined.includes('entry') || combined.includes('junior') || combined.includes('student') || combined.includes('intern') || combined.includes('graduate') || combined.includes('fresher')) {
        return 'entry-level';
      }
      return 'professional';
    };

    return {
      id: mainSection.id || `template-${Math.random().toString(36).substr(2, 9)}`,
      name: mainSection.name || 'Template Name',
      description: mainSection.description || 'Professional template design',
      isPremium: mainSection.resumeinfo?.isPremium || false,
      subscription: mainSection.resumeinfo?.subscription || 'Free',
      primaryColor: secondary.style?.primaryColor || '#7c3aed',
      accentColor: secondary.style?.accentColor || '#5b21b6',
      layout: secondary.style?.layout || 'sidebar-left',
      fontFamily: secondary.style?.fontFamily || 'Outfit',
      category: categorizeTemplate(template),
      isUserUploaded: false
    };
  } catch (error) {
    console.error('Error converting template:', error);
    return {
      id: `fallback-${Math.random().toString(36).substr(2, 9)}`,
      name: 'Template',
      description: 'Template description',
      isPremium: false,
      subscription: 'Free',
      primaryColor: '#7c3aed',
      accentColor: '#5b21b6',
      layout: 'sidebar-left',
      fontFamily: 'Outfit',
      category: 'professional',
      isUserUploaded: false
    };
  }
};

// Convert UserTemplate to DisplayTemplate
const convertUserTemplate = (template: UserTemplate): DisplayTemplate => ({
  id: template.templateId,
  name: template.title,
  description: template.description,
  isPremium: template.isPremium,
  subscription: template.isPremium ? 'Premium' : 'Free',
  primaryColor: template.templateData?.secondary?.style?.primaryColor || '#7c3aed',
  accentColor: template.templateData?.secondary?.style?.accentColor || '#5b21b6',
  layout: template.category || 'professional',
  fontFamily: template.templateData?.secondary?.style?.fontFamily || 'Outfit',
  category: template.category,
  isUserUploaded: true,
  templateId: template.templateId,
  _id: template._id,
  downloads: template.downloads,
  rating: template.rating,
  ratingCount: template.ratingCount,
  thumbnail: template.thumbnail,
  createdAt: template.createdAt
});

// Scroll animations hook
function useScrollAnimations() {
  useEffect(() => {
    // Immediately show all elements
    const allGroups = document.querySelectorAll('.group');
    allGroups.forEach(el => {
      (el as HTMLElement).style.opacity = '1';
      (el as HTMLElement).style.transform = 'translateY(0)';
    });

    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-slideInUp');
        }
      });
    }, observerOptions);

    const elements = document.querySelectorAll('.group');
    elements.forEach(el => observer.observe(el));

    return () => {
      elements.forEach(el => observer.unobserve(el));
    };
  }, []);
}

export default function TemplatesPage() {
  const { isDark } = useTheme();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [templates, setTemplates] = useState<TemplateData[]>([]);
  const [userTemplates, setUserTemplates] = useState<UserTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<DisplayTemplate | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Initialize scroll animations
  useScrollAnimations();

  // Load templates from API
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        console.log('Loading templates...');
        setLoading(true);

        // Load system templates
        const templatesResponse = await fetch('/api/templates');
        console.log('Templates API status:', templatesResponse.status);

        if (templatesResponse.ok) {
          const result = await templatesResponse.json();
          console.log('Templates API result:', result);

          if (result.success && result.data && Array.isArray(result.data.templates)) {
            console.log('Setting templates:', result.data.templates.length);
            setTemplates(result.data.templates);
          } else {
            console.error('Invalid templates response:', result);
            setTemplates([]);
          }
        } else {
          console.error('Templates API failed:', templatesResponse.statusText);
          setTemplates([]);
        }

        // Load user templates
        try {
          const userTemplatesResponse = await fetch('/api/templates/user');
          if (userTemplatesResponse.ok) {
            const userResult = await userTemplatesResponse.json();
            if (userResult.success && userResult.data && Array.isArray(userResult.data.templates)) {
              setUserTemplates(userResult.data.templates);
            }
          }
        } catch (userError) {
          console.log('User templates not loaded (optional):', userError);
        }

      } catch (error) {
        console.error('Error loading templates:', error);
        setTemplates([]);
      } finally {
        setLoading(false);
      }
    };

    loadTemplates();
  }, []);

  const categories = [
    { id: 'all', name: 'All Templates', icon: Grid },
    { id: 'professional', name: 'Professional', icon: Briefcase },
    { id: 'creative', name: 'Creative', icon: Sparkles },
    { id: 'executive', name: 'Executive', icon: Award },
    { id: 'academic', name: 'Academic', icon: BookOpen },
    { id: 'entry-level', name: 'Entry Level', icon: Target },
    { id: 'user-uploaded', name: 'My Uploads', icon: Upload },
  ];

  // Convert templates to display format with useMemo
  const displayTemplates: DisplayTemplate[] = useMemo(() => {
    const systemTemplates = templates.map(convertToDisplayTemplate);
    const userConvertedTemplates = userTemplates.map(convertUserTemplate);

    return [...systemTemplates, ...userConvertedTemplates];
  }, [templates, userTemplates]);

  // Use fallback templates if no templates loaded
  const finalDisplayTemplates = displayTemplates.length > 0
    ? displayTemplates
    : !loading
      ? Array.from({ length: 12 }, (_, index) => ({
        id: `fallback-${index + 1}`,
        name: `Professional Template ${index + 1}`,
        description: `Modern professional resume template with clean design and perfect layout`,
        isPremium: index % 3 === 0,
        subscription: index % 3 === 0 ? 'Premium' : 'Free',
        primaryColor: '#7c3aed',
        accentColor: '#5b21b6',
        layout: index % 2 === 0 ? 'sidebar-left' : 'top-header',
        fontFamily: 'Outfit',
        category: ['professional', 'creative', 'executive', 'academic', 'entry-level'][index % 5],
        isUserUploaded: false
      }))
      : [];

  console.log('Display templates after conversion:', displayTemplates.length);
  console.log('Number of display templates:', displayTemplates.length);

  const filteredTemplates = selectedCategory === 'user-uploaded'
    ? userTemplates.map(convertUserTemplate).filter(template => {
      const matchesSearch = template.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    })
    : finalDisplayTemplates.filter(template => {
      if (selectedCategory !== 'all' && template.category !== selectedCategory) {
        return false;
      }
      const matchesSearch = template.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });

  console.log('Filtered templates count:', filteredTemplates.length);
  console.log('Using finalDisplayTemplates:', finalDisplayTemplates.length);

  const applyTemplate = async (templateId: string) => {
    // Persist locally and optionally update a resume if editing one
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('flowcv_selected_template', templateId);
      const m = window.location.pathname.match(/\/resume\/([^/?]+)/);
      const resumeId = m?.[1];
      if (resumeId) {
        try {
          await fetch(`/api/resumes/${resumeId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ template: templateId }),
          });
          location.reload();
        } catch {
          // ignore
        }
      }
    }
  };
  const handleUseTemplate = async (templateId: string) => {
    try {
      // Find the template from displayTemplates
      const template = finalDisplayTemplates.find(t => t.id === templateId);

      if (!template) {
        console.error('Template not found:', templateId);
        return;
      }

      console.log('Selected template:', template);

      // Create design object from template with complete structure
      const design = {
        // Colors
        primaryColor: template.primaryColor || '#7c3aed',
        secondaryColor: template.accentColor || '#5b21b6',
        accentColor: template.accentColor || '#5b21b6',
        textColor: '#1e293b',
        backgroundColor: '#ffffff',

        // Font
        fontFamily: template.fontFamily || 'Outfit',
        fontCategory: 'sans',

        // Spacing
        fontSize: 10.5,
        lineHeight: 1.45,
        marginLR: 12,
        marginTB: 16,
        entrySpacing: 8,
        sectionSpacing: 16,

        // Layout
        layout: template.layout || 'sidebar-left',

        // Accent
        accentType: 'basic',
        applyAccentTo: ['headings', 'headingLine'],

        // Headings
        headingStyle: 'underline',
        headingCapitalization: 'uppercase',
        headingSize: 'm',
        headingIconType: 'none',

        // Entry layout
        entryLayout: 'default',
        entryColumnWidth: 'auto',
        entryTitleSize: 'm',
        entrySubtitleStyle: 'normal',
        entrySubtitlePlacement: 'next-line',
        descriptionIndent: false,
        listStyle: 'bullet',

        // Footer
        showPageNumbers: true,
        showEmailInFooter: false,
        showNameInFooter: false,

        // Link styling
        linkUnderline: true,
        linkBlueColor: false,
        linkIcon: true,

        // Personal details
        personalAlign: 'left',
        personalArrangement: 'default',
        personalIconShow: true,
        personalBulletShow: false,
        personalBarShow: false,
        personalIconStyle: 'default',

        // Name
        nameSize: 'm',
        nameBold: true,
        nameFontType: 'body',

        // Professional title
        titleSize: 'm',
        titlePosition: 'below',
        titleStyle: 'normal',

        // Photo
        photoShow: false,
        photoGrayscale: false,
        photoSize: 'm',
        photoShape: 'circle',

        // Component specific
        skillsStyle: 'grid',
        skillsColumns: 2,
        languagesStyle: 'grid',
        languagesColumns: 2,
        interestsStyle: 'grid',
        interestsColumns: 2,
        certificationsStyle: 'grid',
        certificationsColumns: 2,

        // Summary
        showSummaryHeading: true,

        // Education / Work order
        educationOrder: 'degree-school',
        workOrder: 'title-employer',
        workGroupPromotions: false,
      };

      console.log('Design object:', design);
      console.log('=== SENDING TO CREATE API ===');
      console.log('Template ID:', templateId);
      console.log('Template primaryColor:', template.primaryColor);
      console.log('Template accentColor:', template.accentColor);
      console.log('Template layout:', template.layout);
      console.log('Template fontFamily:', template.fontFamily);
      console.log('Final design primaryColor:', design.primaryColor);
      console.log('Final design secondaryColor:', design.secondaryColor);
      console.log('Final design accentColor:', design.accentColor);
      console.log('Final design layout:', design.layout);
      console.log('Final design fontFamily:', design.fontFamily);

      const requestBody = {
        title: `${template.name} Resume`,
        template: templateId,
        design: design,
        activeSections: ['summary', 'experience', 'education', 'skills', 'projects', 'awards', 'languages', 'certifications', 'interests'],
        content: {
          personalInfo: {
            id: 'personal',
            firstName: 'Alexandra',
            lastName: 'Martinez',
            fullName: 'Alexandra Martinez',
            email: 'alex.martinez@email.com',
            phone: '(555) 123-4567',
            location: 'San Francisco, CA',
            professionalTitle: 'Senior Product Manager',
            summary: 'Results-driven Product Manager with 8+ years of experience leading cross-functional teams to deliver innovative SaaS solutions. Proven track record of increasing revenue by 150% through strategic product roadmap development and user-centric design. Expert in Agile methodologies, data analytics, and stakeholder management with strong technical background.',
            linkedIn: 'linkedin.com/in/alexmartinez',
            website: '',
            photo: '',
          },
          experience: [
            { id: generateExperienceId(), position: 'Senior Product Manager', company: 'TechCorp Inc.', location: 'San Francisco, CA', startDate: 'Jan 2021', endDate: 'Present', current: true, description: 'Led development of AI-powered analytics platform generating $12M ARR. Managed 15-person cross-functional team. Increased user retention by 45%.' },
            { id: generateExperienceId(), position: 'Product Manager', company: 'StartupXYZ', location: 'San Francisco, CA', startDate: 'Jun 2018', endDate: 'Dec 2020', current: false, description: 'Launched MVP in 6 months, acquired 50,000 users. Implemented OKR framework improving team velocity by 30%.' },
            { id: generateExperienceId(), position: 'Associate PM', company: 'Digital Solutions', location: 'Palo Alto, CA', startDate: 'Aug 2015', endDate: 'May 2018', current: false, description: 'Supported senior PMs on 3 concurrent projects serving 100K+ users. Created wireframes and PRDs.' },
            { id: generateExperienceId(), position: 'Marketing Analyst', company: 'BrandCo', location: 'San Jose, CA', startDate: 'Jun 2013', endDate: 'Jul 2015', current: false, description: 'Conducted market research. Improved campaign ROI by 45% through data-driven strategies.' },
            { id: generateExperienceId(), position: 'Business Analyst', company: 'Enterprise Corp', location: 'Oakland, CA', startDate: 'Jan 2013', endDate: 'May 2013', current: false, description: 'Assisted in strategic planning and market analysis projects.' },
          ],
          education: [
            { id: generateEducationId(), school: 'Stanford University', degree: 'MBA, Product Management', field: 'Business Administration', location: 'Stanford, CA', graduationYear: '2017', description: '' },
            { id: generateEducationId(), school: 'UC Berkeley', degree: 'BS Computer Science', field: 'Computer Science', location: 'Berkeley, CA', graduationYear: '2015', description: '' },
          ],
          skills: [
            { id: generateSkillId(), name: 'Product Strategy' },
            { id: generateSkillId(), name: 'Agile/Scrum' },
            { id: generateSkillId(), name: 'Data Analytics' },
            { id: generateSkillId(), name: 'SQL' },
            { id: generateSkillId(), name: 'Python' },
            { id: generateSkillId(), name: 'Figma' },
            { id: generateSkillId(), name: 'JIRA' },
            { id: generateSkillId(), name: 'A/B Testing' },
            { id: generateSkillId(), name: 'User Research' },
            { id: generateSkillId(), name: 'Roadmapping' },
            { id: generateSkillId(), name: 'Competitive Analysis' },
            { id: generateSkillId(), name: 'Team Leadership' },
            { id: generateSkillId(), name: 'Project Management' },
            { id: generateSkillId(), name: 'Data Visualization' },
            { id: generateSkillId(), name: 'Machine Learning' },
            { id: generateSkillId(), name: 'Cloud Computing' },
            { id: generateSkillId(), name: 'API Design' },
            { id: generateSkillId(), name: 'Customer Acquisition' },
            { id: generateSkillId(), name: 'Growth Hacking' },
          ],
          languages: [
            { id: generateLanguageId(), language: 'English', proficiency: 'Native' },
            { id: generateLanguageId(), language: 'Spanish', proficiency: 'Fluent' },
            { id: generateLanguageId(), language: 'French', proficiency: 'Intermediate' },
          ],
          certifications: [
            { id: generateCertificationId(), name: 'PMP Certified', issuer: 'PMI', date: '2020', description: 'Project Management Professional' },
            { id: generateCertificationId(), name: 'AWS Solutions Architect', issuer: 'Amazon', date: '2021', description: 'Cloud Architecture' },
            { id: generateCertificationId(), name: 'Google Analytics', issuer: 'Google', date: '2019', description: 'Digital Analytics' },
            { id: generateCertificationId(), name: 'Scrum Master', issuer: 'Scrum Alliance', date: '2018', description: 'Agile Methodology' },
          ],
          projects: [
            { id: generateProjectId(), name: 'AI Analytics Dashboard', description: 'Built real-time analytics platform with ML predictions', technologies: ['React', 'Python', 'TensorFlow'] },
            { id: generateProjectId(), name: 'Mobile App Launch', description: 'Led 0-to-1 mobile app reaching 100K downloads', technologies: ['React Native', 'Firebase'] },
          ],
          awards: [
            { id: generateAwardId(), title: 'PM of the Year 2022', issuer: 'TechCorp', date: '2022', description: 'Outstanding product leadership' },
            { id: generateAwardId(), title: 'Best Product Launch', issuer: 'StartupXYZ', date: '2021', description: 'Successful MVP delivery' },
          ],
          interests: [
            { id: generateInterestId(), name: 'Technology' },
            { id: generateInterestId(), name: 'Travel' },
            { id: generateInterestId(), name: 'Photography' },
            { id: generateInterestId(), name: 'Reading' },
            { id: generateInterestId(), name: 'Hiking' },
            { id: generateInterestId(), name: 'Cooking' },
          ],
        },
      };

      console.log('Request body:', requestBody);

      const response = await fetch('/api/resumes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Create response:', result);
        if (result.success) {
          window.location.href = `/resume/${result.data._id}`;
        } else {
          console.error('Create failed:', result);
        }
      } else {
        console.error('Response not ok:', response.status);
        const errorText = await response.text();
        console.error('Error text:', errorText);
      }
    } catch (error) {
      console.error('Error creating resume:', error);
    }
  };

  const handleUploadTemplate = async () => {
    if (!uploadFile) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('templateName', `Custom Template ${Date.now()}`);
      formData.append('templateDescription', 'User uploaded custom template');
      formData.append('isPremium', 'false');

      const response = await fetch('/api/templates/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        const userTemplatesResponse = await fetch('/api/templates/user');
        if (userTemplatesResponse.ok) {
          const userResult = await userTemplatesResponse.json();
          if (userResult.success && userResult.data) {
            setUserTemplates(userResult.data.templates || []);
          }
        }
        setUploadFile(null);
        setShowUploadModal(false);
        alert('Template uploaded successfully!');
      } else {
        alert(result.error || 'Failed to upload template');
      }
    } catch (error) {
      console.error('Error uploading template:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--app-bg)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent mx-auto mb-4"></div>
          <p style={{ color: 'var(--app-text)' }}>Loading templates...</p>
        </div>
      </div>
    );
  }

  // Debug: Show template count
  console.log('Total templates loaded:', templates.length);
  console.log('Sample template:', templates[0]);

  // Main component return
  return (
    <div className="min-h-screen transition-colors duration-500" style={{ backgroundColor: 'var(--app-bg)' }}>
      <TemplatesHeader />

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-card w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold" style={{ color: 'var(--app-text)' }}>
                Upload Template
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                style={{ color: 'var(--app-text)' }}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--app-text)' }}>
                  Template File (JSON)
                </label>
                <input
                  type="file"
                  accept="image/*,.json"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="w-full p-3 border rounded-lg"
                  style={{
                    borderColor: 'var(--app-border)',
                    backgroundColor: 'var(--app-bg)',
                    color: 'var(--app-text)'
                  }}
                />
                <p className="text-xs text-gray-500 mt-1">Supports PNG, JPG, or JSON files</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleUploadTemplate}
                  disabled={!uploadFile || uploading}
                  className="flex-1 btn-primary py-3 disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Upload Template'}
                </button>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="px-6 py-3 rounded-lg border transition-colors hover:bg-gray-100"
                  style={{
                    borderColor: 'var(--app-border)',
                    color: 'var(--app-text)'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <main>
        {/* Hero Section */}
        <section className="relative py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0">
            <div
              className="absolute inset-0 opacity-10"
              style={{
                background: `linear-gradient(135deg, var(--app-primary) 0%, var(--app-secondary) 100%)`,
              }}
            />
            <div className="absolute top-20 left-10 w-32 h-32 rounded-full opacity-20 animate-float"
              style={{ backgroundColor: 'var(--app-primary)' }} />
            <div className="absolute top-40 right-20 w-24 h-24 rounded-full opacity-20 animate-float"
              style={{ backgroundColor: 'var(--app-secondary)', animationDelay: '1s' }} />
            <div className="absolute bottom-20 left-1/4 w-16 h-16 rounded-full opacity-20 animate-float"
              style={{ backgroundColor: 'var(--app-primary)', animationDelay: '0.5s' }} />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 gradient-text">
              Professional Resume Templates
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90"
              style={{ color: 'var(--app-text-secondary)' }}>
              Choose from {finalDisplayTemplates.length} expertly designed templates or upload your own custom designs
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center gap-2 px-8 py-4 rounded-2xl btn-primary text-lg font-semibold"
              >
                <Upload className="h-5 w-5" />
                Upload Template
              </button>
              <Link href="#templates"
                className="flex items-center gap-2 px-8 py-4 rounded-2xl border-2 text-lg font-semibold transition-all hover:scale-105"
                style={{
                  borderColor: 'var(--app-primary)',
                  color: 'var(--app-primary)'
                }}>
                Browse Templates
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Templates Section */}
        <section id="templates" className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Search and Filter Bar */}
            <div className="mb-12 flex flex-col lg:flex-row gap-6 items-center justify-between">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5"
                    style={{ color: 'var(--app-text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Search templates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border transition-all focus:outline-none focus:ring-2 focus:ring-purple-500"
                    style={{
                      borderColor: 'var(--app-border)',
                      backgroundColor: 'var(--app-bg)',
                      color: 'var(--app-text)'
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Category Filter */}
                <div className="hidden md:flex items-center gap-2 p-1 rounded-xl border"
                  style={{ borderColor: 'var(--app-border)' }}>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium ${selectedCategory === category.id ? 'shadow-md' : 'hover:bg-gray-50'
                        }`}
                      style={{
                        backgroundColor: selectedCategory === category.id ? 'var(--app-primary)' : 'transparent',
                        color: selectedCategory === category.id ? 'white' : 'var(--app-text)'
                      }}
                    >
                      <category.icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{category.name}</span>
                    </button>
                  ))}
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center gap-1 p-1 rounded-lg border"
                  style={{ borderColor: 'var(--app-border)' }}>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'shadow-sm' : 'hover:bg-gray-50'
                      }`}
                    style={{
                      backgroundColor: viewMode === 'grid' ? 'var(--app-primary)' : 'transparent',
                      color: viewMode === 'grid' ? 'white' : 'var(--app-text)'
                    }}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'shadow-sm' : 'hover:bg-gray-50'
                      }`}
                    style={{
                      backgroundColor: viewMode === 'list' ? 'var(--app-primary)' : 'transparent',
                      color: viewMode === 'list' ? 'white' : 'var(--app-text)'
                    }}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Templates Grid/List */}
            <div>
              {filteredTemplates.length > 0 ? (
                viewMode === 'grid' ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredTemplates.map((template, index) => (
                      <div key={template.id || index}
                        className="group transition-all duration-700"
                        style={{
                          animationDelay: `${index * 100}ms`,
                          opacity: 1,
                          transform: 'translateY(0)'
                        }}>
                        <div className="glass-card overflow-hidden hover:scale-105 transition-all duration-500 hover:shadow-2xl">
                          {/* Template Preview */}
                          <div className="aspect-[3/4] relative overflow-hidden bg-gray-100">
                            <div className="absolute inset-0 flex items-center justify-center p-0 m-0">
                              {template.isUserUploaded && (template as any).thumbnail ? (
                                <ImageTemplatePreview 
                                  imageUrl={(template as any).thumbnail}
                                  className="w-full h-full"
                                />
                              ) : (
                                <ResumeThumbnail 
                                  data={{
                                    title: template.name || 'Resume',
                                    template: template.id || 'template-1',
                                    content: {
                                      personalInfo: {
                                        fullName: 'Alexandra Martinez',
                                        email: 'alex.martinez@email.com',
                                        phone: '(555) 123-4567',
                                        location: 'San Francisco, CA',
                                        professionalTitle: 'Senior Product Manager',
                                        summary: 'Results-driven Product Manager with 8+ years of experience leading cross-functional teams to deliver innovative SaaS solutions.',
                                      },
                                      experience: [
                                        {
                                          position: 'Senior Product Manager',
                                          company: 'TechCorp Inc.',
                                          startDate: 'Jan 2021',
                                          endDate: 'Present',
                                          description: 'Led development of AI-powered analytics platform generating $12M ARR.'
                                        }
                                      ],
                                      education: [
                                        {
                                          school: 'Stanford University',
                                          degree: 'MBA',
                                          field: 'Business Administration',
                                          graduationYear: '2017'
                                        }
                                      ],
                                      skills: ['Product Strategy', 'Agile/Scrum', 'Data Analytics', 'SQL', 'Figma'],
                                    },
                                    design: {
                                      primaryColor: template.primaryColor || '#7c3aed',
                                      secondaryColor: template.accentColor || template.secondaryColor || '#f5f3ff',
                                      accentColor: template.accentColor || '#5b21b6',
                                      fontFamily: template.fontFamily || 'Inter',
                                      layout: template.layout || 'sidebar-left',
                                      fontSize: 10.5,
                                      lineHeight: 1.45,
                                      marginLR: 0,
                                      marginTB: 0,
                                      textColor: '#1f2937',
                                      backgroundColor: '#ffffff',
                                      entrySpacing: 8,
                                      sectionSpacing: 16,
                                      headingStyle: 'underline',
                                      headingCapitalization: 'uppercase',
                                      headingSize: 'm',
                                      showSummaryHeading: true,
                                      accentType: 'basic',
                                      applyAccentTo: ['headings', 'headingLine'],
                                    },
                                    activeSections: ['summary', 'experience', 'education', 'skills']
                                  }}
                                />
                              )}
                            </div>
                          </div>

                          {/* Decorative Bottom Border */}
                          <div className="absolute bottom-0 left-0 right-0 h-1.5"
                            style={{ background: `linear-gradient(90deg, ${template.primaryColor || '#41017d'}, ${template.accentColor || '#ee14ff'})` }}>
                          </div>

                          {/* Overlay Badges */}
                          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1 shadow-md">
                            <span className="text-[9px] font-semibold" style={{ color: template.primaryColor }}>{template.category}</span>
                          </div>
                          {template.isPremium && (
                            <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 rounded-full px-3 py-1 shadow-md">
                              <span className="text-[9px] font-bold">PRO</span>
                            </div>
                          )}
                        </div>

                        {/* Template Info */}
                        <div className="p-6">
                          <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--app-text)' }}>
                            {template.name || 'Template Name'}
                          </h3>
                            <p className="text-sm mb-4 line-clamp-2" style={{ color: 'var(--app-text-secondary)' }}>
                              {template.description || 'Template description'}
                            </p>

                            <div className="flex flex-wrap gap-2 mb-4">
                              <span className="text-xs px-2 py-1 rounded-full"
                                style={{ backgroundColor: 'var(--app-bg-gray)', color: 'var(--app-primary)' }}>
                                {template.layout || 'sidebar-left'}
                              </span>
                              <span className="text-xs px-2 py-1 rounded-full"
                                style={{ backgroundColor: 'var(--app-bg-gray)', color: 'var(--app-primary)' }}>
                                {template.fontFamily || 'Outfit'}
                              </span>
                              <span className="text-xs px-2 py-1 rounded-full"
                                style={{ backgroundColor: 'var(--app-bg-gray)', color: 'var(--app-primary)' }}>
                                {template.subscription || 'Free'}
                              </span>
                            </div>

                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-1">
                                  <Users className="h-4 w-4" style={{ color: 'var(--app-primary)' }} />
                                  <span style={{ color: 'var(--app-text-secondary)' }}>12K+</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                  <span style={{ color: 'var(--app-text)' }}>4.8</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-3">
            <button
              onClick={() => handleUseTemplate(template.id)}
              className="flex-1 btn-primary text-center py-3"
            >
              Apply Template
            </button>
                              <button
                                onClick={() => {
                                  setPreviewTemplate(template);
                                  setShowPreviewModal(true);
                                }}
                                className="p-3 rounded-xl border transition-all duration-300 hover:scale-110"
                                style={{ borderColor: 'var(--app-border)', color: 'var(--app-text)' }}>
                                <Eye className="h-5 w-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                    ))}
                  </div>
                  ) : (
                    <div className="space-y-6">
                      {filteredTemplates.map((template, index) => (
                        <div key={template.id || index} className="glass-card p-6 hover:scale-[1.02] transition-all duration-500"
                          style={{ animationDelay: `${index * 100}ms` }}>
                          <div className="flex flex-col lg:flex-row gap-6">
                            {/* Template Preview */}
                            <div className="lg:w-1/4">
                              <div className="aspect-[3/4] rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
                                {template.isUserUploaded && (template as any).thumbnail ? (
                                  <ImageTemplatePreview 
                                    imageUrl={(template as any).thumbnail}
                                    className="w-full h-full"
                                  />
                                ) : (
                                  <ResumeThumbnail 
                                    data={{
                                      title: template.name || 'Resume',
                                      template: template.id || 'template-1',
                                      content: {
                                        personalInfo: {
                                          fullName: 'Alexandra Martinez',
                                          email: 'alex.martinez@email.com',
                                          phone: '(555) 123-4567',
                                          location: 'San Francisco, CA',
                                          professionalTitle: 'Senior Product Manager',
                                          summary: 'Results-driven Product Manager with 8+ years of experience.',
                                        },
                                        experience: [
                                          {
                                            position: 'Senior Product Manager',
                                            company: 'TechCorp Inc.',
                                            startDate: 'Jan 2021',
                                            endDate: 'Present',
                                            description: 'Led development of AI-powered analytics platform.'
                                          }
                                        ],
                                        education: [
                                          {
                                            school: 'Stanford University',
                                            degree: 'MBA',
                                            field: 'Business Administration',
                                            graduationYear: '2017'
                                          }
                                        ],
                                        skills: ['Product Strategy', 'Agile/Scrum', 'Data Analytics', 'SQL', 'Figma'],
                                      },
                                      design: {
                                        primaryColor: template.primaryColor || '#7c3aed',
                                        secondaryColor: template.accentColor || template.secondaryColor || '#f5f3ff',
                                        accentColor: template.accentColor || '#5b21b6',
                                        fontFamily: template.fontFamily || 'Inter',
                                        layout: template.layout || 'sidebar-left',
                                        fontSize: 10.5,
                                        lineHeight: 1.45,
                                        marginLR: 0,
                                        marginTB: 0,
                                        textColor: '#1f2937',
                                        backgroundColor: '#ffffff',
                                        entrySpacing: 8,
                                        sectionSpacing: 16,
                                        headingStyle: 'underline',
                                        headingCapitalization: 'uppercase',
                                        headingSize: 'm',
                                        showSummaryHeading: true,
                                        accentType: 'basic',
                                        applyAccentTo: ['headings', 'headingLine'],
                                      },
                                      activeSections: ['summary', 'experience', 'education', 'skills']
                                    }}
                                  />
                                )}
                              </div>
                            </div>
                            
                            {/* Template Info */}
                            <div className="lg:w-3/4 flex flex-col justify-between">
                              <div>
                                <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--app-text)' }}>
                                  {template.name || 'Template Name'}
                                </h3>
                                <p className="text-base mb-4" style={{ color: 'var(--app-text-secondary)' }}>
                                  {template.description || 'Template description'}
                                </p>

                                <div className="flex flex-wrap gap-2 mb-4">
                                  <span className="text-xs px-3 py-1 rounded-full"
                                    style={{ backgroundColor: 'var(--app-bg-gray)', color: 'var(--app-primary)' }}>
                                    {template.layout || 'sidebar-left'}
                                  </span>
                                  <span className="text-xs px-3 py-1 rounded-full"
                                    style={{ backgroundColor: 'var(--app-bg-gray)', color: 'var(--app-primary)' }}>
                                    {template.fontFamily || 'Outfit'}
                                  </span>
                                  <span className="text-xs px-3 py-1 rounded-full"
                                    style={{ backgroundColor: 'var(--app-bg-gray)', color: 'var(--app-primary)' }}>
                                    {template.subscription || 'Free'}
                                  </span>
                                </div>

                                <div className="flex items-center gap-6 text-sm">
                                  <div className="flex items-center gap-1">
                                    <Users className="h-4 w-4" style={{ color: 'var(--app-primary)' }} />
                                    <span style={{ color: 'var(--app-text-secondary)' }}>12K+ users</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                    <span style={{ color: 'var(--app-text)' }}>4.8 rating</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Download className="h-4 w-4" style={{ color: 'var(--app-primary)' }} />
                                    <span style={{ color: 'var(--app-text-secondary)' }}>8.3K downloads</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                                <button
                                  onClick={() => applyTemplate(template.id)}
                                  className="btn-primary px-6 py-3"
                                >
                                  Apply Template
                                </button>
                                <TemplateLivePreview template={template} />
                                <button
                                  onClick={() => {
                                    setPreviewTemplate(template);
                                    setShowPreviewModal(true);
                                  }}
                                  className="p-3 rounded-xl border transition-all duration-300 hover:scale-110"
                                  style={{ borderColor: 'var(--app-border)', color: 'var(--app-text)' }}>
                                  <Eye className="h-5 w-5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
              ) : (
                <div className="text-center py-16">
                  <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
                    style={{ backgroundColor: 'var(--app-bg-gray)' }}>
                    <Search className="h-10 w-10" style={{ color: 'var(--app-text-muted)' }} />
                  </div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--app-text)' }}>
                    No templates found
                  </h3>
                  <p style={{ color: 'var(--app-text-secondary)' }}>
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Preview Modal */}
      {showPreviewModal && previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowPreviewModal(false);
            }
          }}>
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-auto rounded-2xl shadow-2xl"
            style={{ background: isDark ? '#0f172a' : '#ffffff' }}
            onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b"
              style={{
                background: isDark ? '#0f172a' : '#ffffff',
                borderColor: isDark ? '#334155' : '#e2e8f0'
              }}>
              <div>
                <h2 className="text-xl font-bold" style={{ color: isDark ? '#f1f5f9' : '#1e293b' }}>
                  {previewTemplate.name}
                </h2>
                <p className="text-sm" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                  {previewTemplate.description}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => applyTemplate(previewTemplate.id)}
                  className="btn-primary px-6 py-2 text-nowrap"
                >
                  Apply Template
                </button>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="p-2 rounded-xl border transition-all hover:scale-110"
                  style={{
                    borderColor: isDark ? '#334155' : '#e2e8f0',
                    color: isDark ? '#f1f5f9' : '#1e293b'
                  }}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Full Resume Preview */}
            <div className="p-8">
              <div className="flex justify-center overflow-auto">
                {previewTemplate.isUserUploaded && (previewTemplate as any).thumbnail ? (
                  <div className="relative">
                    <div className="bg-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden"
                      style={{
                        width: '210mm',
                        maxWidth: '100%',
                        aspectRatio: '210/297',
                      }}>
                      <img
                        src={(previewTemplate as any).thumbnail}
                        alt={previewTemplate.name || 'Template Preview'}
                        className="w-full h-full object-contain"
                        style={{ display: 'block' }}
                      />
                    </div>
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg -z-10 opacity-20 blur-sm" />
                  </div>
                ) : (
                  <A4ResumePreview 
                    data={{
                      title: previewTemplate.name || 'Resume',
                      template: previewTemplate.id || 'template-1',
                      content: {
                        personalInfo: {
                          fullName: 'Alexandra Martinez',
                          email: 'alex.martinez@email.com',
                          phone: '(555) 123-4567',
                          location: 'San Francisco, CA',
                          professionalTitle: 'Senior Product Manager',
                          summary: 'Results-driven Product Manager with 8+ years of experience leading cross-functional teams to deliver innovative SaaS solutions. Proven track record of increasing revenue by 150% through strategic product roadmap development and user-centric design.',
                        },
                        experience: [
                          { position: 'Senior Product Manager', company: 'TechCorp Inc.', startDate: 'Jan 2021', endDate: 'Present', description: 'Led development of AI-powered analytics platform generating $12M ARR. Managed 15-person cross-functional team. Increased user retention by 45%.' },
                          { position: 'Product Manager', company: 'StartupXYZ', startDate: 'Jun 2018', endDate: 'Dec 2020', description: 'Launched MVP in 6 months, acquired 50,000 users. Implemented OKR framework improving team velocity by 30%.' },
                          { position: 'Associate PM', company: 'Digital Solutions', startDate: 'Aug 2015', endDate: 'May 2018', description: 'Supported senior PMs on 3 concurrent projects serving 100K+ users.' },
                        ],
                        education: [
                          { school: 'Stanford University', degree: 'MBA, Product Management', field: 'Business', graduationYear: '2017' },
                          { school: 'UC Berkeley', degree: 'BS Computer Science', field: 'Computer Science', graduationYear: '2015' },
                        ],
                        skills: ['Product Strategy', 'Agile/Scrum', 'Data Analytics', 'SQL', 'Python', 'Figma', 'JIRA', 'A/B Testing', 'User Research', 'Roadmapping'],
                        languages: [
                          { language: 'English', proficiency: 'Native' },
                          { language: 'Spanish', proficiency: 'Fluent' },
                        ],
                        certifications: [
                          { name: 'PMP Certified', issuer: 'PMI', date: '2020' },
                          { name: 'AWS Solutions Architect', issuer: 'Amazon', date: '2021' },
                        ],
                      },
                      design: {
                        primaryColor: previewTemplate.primaryColor || '#7c3aed',
                        secondaryColor: previewTemplate.accentColor || '#f5f3ff',
                        accentColor: previewTemplate.accentColor || '#5b21b6',
                        fontFamily: previewTemplate.fontFamily || 'Inter',
                        layout: previewTemplate.layout || 'sidebar-left',
                        fontSize: 10.5,
                        lineHeight: 1.45,
                        marginLR: 0,
                        marginTB: 0,
                        textColor: '#1f2937',
                        backgroundColor: '#ffffff',
                        entrySpacing: 8,
                        sectionSpacing: 16,
                        headingStyle: 'underline',
                        headingCapitalization: 'uppercase',
                        headingSize: 'm',
                        showSummaryHeading: true,
                        accentType: 'basic',
                        applyAccentTo: ['headings', 'headingLine'],
                      },
                      activeSections: ['summary', 'experience', 'education', 'skills']
                    }}
                    showShadow={true}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
