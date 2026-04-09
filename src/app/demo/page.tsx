'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, Download, Eye, ArrowRight, Star, Users, Clock, Zap, Shield, Sparkles, ChevronRight, Plus, Edit3, Palette, Share2, Save, Menu, X } from 'lucide-react';
import { EnhancedHeader } from '@/components/layout/EnhancedHeader';
import { useTheme } from '@/hooks/useTheme';

export default function DemoPage() {
  const { isDark } = useTheme();
  const [activeSection, setActiveSection] = useState('editor');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const demoSections = [
    { id: 'editor', name: 'Resume Editor', icon: Edit3 },
    { id: 'templates', name: 'Templates', icon: Palette },
    { id: 'preview', name: 'Preview', icon: Eye },
    { id: 'export', name: 'Export', icon: Download },
  ];

  const resumeData = {
    personal: {
      name: "John Doe",
      title: "Senior Software Engineer",
      email: "john.doe@example.com",
      phone: "+1 (555) 123-4567",
      location: "San Francisco, CA",
      website: "johndoe.dev",
      linkedin: "linkedin.com/in/johndoe"
    },
    summary: "Experienced software engineer with 8+ years of expertise in full-stack development, cloud architecture, and team leadership. Passionate about building scalable solutions and mentoring junior developers.",
    experience: [
      {
        title: "Senior Software Engineer",
        company: "Tech Corp",
        period: "2020 - Present",
        description: "Led development of microservices architecture serving 1M+ users. Improved system performance by 40% through optimization."
      },
      {
        title: "Software Engineer",
        company: "StartupXYZ",
        period: "2018 - 2020",
        description: "Developed and maintained web applications using React and Node.js. Collaborated with cross-functional teams."
      }
    ],
    education: [
      {
        degree: "Bachelor of Science in Computer Science",
        school: "University of California",
        period: "2014 - 2018",
        description: "Graduated Magna Cum Laude with GPA 3.8/4.0"
      }
    ],
    skills: ["JavaScript", "React", "Node.js", "Python", "AWS", "Docker", "PostgreSQL", "MongoDB"]
  };

  return (
    <div className="min-h-screen transition-colors duration-500" style={{ backgroundColor: 'var(--app-bg)' }}>
      <EnhancedHeader />
      
      <main>
        {/* Hero Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6"
                style={{ color: 'var(--app-text)' }}>
              Try FlowCV Live Demo
            </h1>
            <p className="text-xl max-w-3xl mx-auto mb-8"
               style={{ color: 'var(--app-text-secondary)' }}>
              Experience the power of our resume builder with this interactive demo
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register" className="btn-primary">
                Start Building Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link href="/templates" className="btn-secondary">
                Browse Templates
              </Link>
            </div>
          </div>
        </section>

        {/* Demo Interface */}
        <section className="py-12 px-4 sm:px-6 lg:px-8"
             style={{ backgroundColor: 'var(--app-bg-gray)' }}>
          <div className="max-w-7xl mx-auto">
            {/* Mobile Menu Toggle */}
            <div className="md:hidden mb-6">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border"
                style={{ borderColor: 'var(--app-border)', backgroundColor: 'var(--app-bg)' }}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                <span style={{ color: 'var(--app-text)' }}>
                  {demoSections.find(s => s.id === activeSection)?.name}
                </span>
              </button>
            </div>

            <div className="grid md:grid-cols-4 gap-6">
              {/* Sidebar Navigation */}
              <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:block`}>
                <div className="glass-card p-4">
                  <h3 className="font-bold text-lg mb-4" style={{ color: 'var(--app-text)' }}>
                    Demo Sections
                  </h3>
                  <nav className="space-y-2">
                    {demoSections.map((section) => (
                      <button
                        key={section.id}
                        onClick={() => {
                          setActiveSection(section.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                          activeSection === section.id
                            ? 'text-white'
                            : 'hover:scale-105'
                        }`}
                        style={{
                          backgroundColor: activeSection === section.id ? 'var(--app-primary)' : 'transparent',
                          color: activeSection === section.id ? 'white' : 'var(--app-text-secondary)'
                        }}
                      >
                        <section.icon className="h-5 w-5" />
                        <span className="font-medium">{section.name}</span>
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Quick Stats */}
                <div className="glass-card p-4 mt-6">
                  <h3 className="font-bold text-lg mb-4" style={{ color: 'var(--app-text)' }}>
                    Demo Stats
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" style={{ color: 'var(--app-primary)' }} />
                      <span className="text-sm" style={{ color: 'var(--app-text-secondary)' }}>
                        Created in 5 minutes
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4" style={{ color: 'var(--app-primary)' }} />
                      <span className="text-sm" style={{ color: 'var(--app-text-secondary)' }}>
                        AI-optimized
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" style={{ color: 'var(--app-primary)' }} />
                      <span className="text-sm" style={{ color: 'var(--app-text-secondary)' }}>
                        ATS-friendly
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="md:col-span-3">
                <div className="glass-card p-6 min-h-[600px]">
                  {activeSection === 'editor' && <EditorSection resumeData={resumeData} />}
                  {activeSection === 'templates' && <TemplatesSection />}
                  {activeSection === 'preview' && <PreviewSection resumeData={resumeData} />}
                  {activeSection === 'export' && <ExportSection />}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Demo */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-6"
                  style={{ color: 'var(--app-text)' }}>
                Powerful Features at Your Fingertips
              </h2>
              <p className="text-xl"
                 style={{ color: 'var(--app-text-secondary)' }}>
                Discover what makes FlowCV the best resume builder
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: Sparkles,
                  title: "AI-Powered Suggestions",
                  description: "Get smart recommendations for your resume content and formatting"
                },
                {
                  icon: Palette,
                  title: "50+ Professional Templates",
                  description: "Choose from industry-tested templates that impress recruiters"
                },
                {
                  icon: Share2,
                  title: "Easy Sharing",
                  description: "Share your resume directly with recruiters or export in multiple formats"
                },
                {
                  icon: Save,
                  title: "Auto-Save",
                  description: "Never lose your work with automatic saving to the cloud"
                },
                {
                  icon: Users,
                  title: "Collaboration",
                  description: "Get feedback from friends and mentors on your resume"
                },
                {
                  icon: Shield,
                  title: "Privacy First",
                  description: "Your data is secure and never shared with third parties"
                }
              ].map((feature, index) => (
                <div key={index} className="text-center p-6 rounded-2xl glass-card hover:scale-105 transition-all duration-300">
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                    style={{ backgroundColor: 'var(--app-primary)' }}
                  >
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--app-text)' }}>
                    {feature.title}
                  </h3>
                  <p style={{ color: 'var(--app-text-secondary)' }}>
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8"
             style={{ backgroundColor: 'var(--app-bg-gray)' }}>
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-8"
                style={{ color: 'var(--app-text)' }}>
              Ready to Build Your Professional Resume?
            </h2>
            <p className="text-xl mb-8"
               style={{ color: 'var(--app-text-secondary)' }}>
              Join thousands of professionals who have landed their dream jobs with FlowCV
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register" className="btn-primary">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link href="/pricing" className="btn-secondary">
                View Pricing
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-12 px-4 sm:px-6 lg:px-8"
              style={{ borderColor: 'var(--app-border)', backgroundColor: 'var(--app-bg)' }}>
        <div className="max-w-7xl mx-auto text-center">
          <p style={{ color: 'var(--app-text-muted)' }}>
            © 2024 FlowCV. This is a demo page showcasing our resume builder features.
          </p>
        </div>
      </footer>
    </div>
  );
}

function EditorSection({ resumeData }: { resumeData: any }) {
  return (
    <div>
      <h3 className="text-2xl font-bold mb-6" style={{ color: 'var(--app-text)' }}>
        Resume Editor
      </h3>
      
      {/* Personal Information */}
      <div className="mb-8">
        <h4 className="text-lg font-semibold mb-4" style={{ color: 'var(--app-text)' }}>
          Personal Information
        </h4>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border" style={{ borderColor: 'var(--app-border)', backgroundColor: 'var(--app-bg)' }}>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--app-text-secondary)' }}>
              Full Name
            </label>
            <input
              type="text"
              value={resumeData.personal.name}
              className="w-full px-3 py-2 rounded border"
              style={{ borderColor: 'var(--app-border)', backgroundColor: 'var(--app-bg)', color: 'var(--app-text)' }}
              readOnly
            />
          </div>
          <div className="p-4 rounded-lg border" style={{ borderColor: 'var(--app-border)', backgroundColor: 'var(--app-bg)' }}>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--app-text-secondary)' }}>
              Professional Title
            </label>
            <input
              type="text"
              value={resumeData.personal.title}
              className="w-full px-3 py-2 rounded border"
              style={{ borderColor: 'var(--app-border)', backgroundColor: 'var(--app-bg)', color: 'var(--app-text)' }}
              readOnly
            />
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="mb-8">
        <h4 className="text-lg font-semibold mb-4" style={{ color: 'var(--app-text)' }}>
          Professional Summary
        </h4>
        <textarea
          value={resumeData.summary}
          className="w-full px-4 py-3 rounded-lg border resize-none"
          rows={4}
          style={{ borderColor: 'var(--app-border)', backgroundColor: 'var(--app-bg)', color: 'var(--app-text)' }}
          readOnly
        />
      </div>

      {/* Experience */}
      <div className="mb-8">
        <h4 className="text-lg font-semibold mb-4" style={{ color: 'var(--app-text)' }}>
          Work Experience
        </h4>
        <div className="space-y-4">
          {resumeData.experience.map((exp: any, index: number) => (
            <div key={index} className="p-4 rounded-lg border" style={{ borderColor: 'var(--app-border)', backgroundColor: 'var(--app-bg)' }}>
              <div className="flex justify-between items-start mb-2">
                <h5 className="font-semibold" style={{ color: 'var(--app-text)' }}>{exp.title}</h5>
                <span className="text-sm" style={{ color: 'var(--app-text-secondary)' }}>{exp.period}</span>
              </div>
              <p className="font-medium mb-2" style={{ color: 'var(--app-primary)' }}>{exp.company}</p>
              <p style={{ color: 'var(--app-text-secondary)' }}>{exp.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-4">
        <button className="btn-primary">
          <Save className="h-4 w-4 mr-2" />
          Save Resume
        </button>
        <button className="btn-secondary">
          <Plus className="h-4 w-4 mr-2" />
          Add Section
        </button>
      </div>
    </div>
  );
}

function TemplatesSection() {
  const templates = [
    { name: "Modern Professional", category: "Professional", users: "50K+" },
    { name: "Creative Designer", category: "Creative", users: "35K+" },
    { name: "Executive Elite", category: "Executive", users: "25K+" },
    { name: "Tech Minimal", category: "Technology", users: "40K+" },
    { name: "Academic Scholar", category: "Academic", users: "20K+" },
    { name: "Sales Pro", category: "Sales", users: "30K+" }
  ];

  return (
    <div>
      <h3 className="text-2xl font-bold mb-6" style={{ color: 'var(--app-text)' }}>
        Choose Your Template
      </h3>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template, index) => (
          <div key={index} className="group cursor-pointer">
            <div className="aspect-[3/4] rounded-lg border-2 mb-4 overflow-hidden transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl"
                 style={{ borderColor: 'var(--app-border)' }}>
              <div className="h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <FileText className="h-16 w-16" style={{ color: 'var(--app-text-muted)' }} />
              </div>
            </div>
            <h4 className="font-semibold mb-1" style={{ color: 'var(--app-text)' }}>{template.name}</h4>
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: 'var(--app-text-secondary)' }}>{template.category}</span>
              <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: 'var(--app-primary)', color: 'white' }}>
                {template.users} users
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PreviewSection({ resumeData }: { resumeData: any }) {
  return (
    <div>
      <h3 className="text-2xl font-bold mb-6" style={{ color: 'var(--app-text)' }}>
        Resume Preview
      </h3>
      
      <div className="max-w-2xl mx-auto p-8 bg-white rounded-lg shadow-lg" style={{ backgroundColor: 'var(--app-bg)' }}>
        {/* Header */}
        <div className="text-center mb-6 pb-6 border-b" style={{ borderColor: 'var(--app-border)' }}>
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--app-text)' }}>
            {resumeData.personal.name}
          </h2>
          <p className="text-lg mb-2" style={{ color: 'var(--app-primary)' }}>
            {resumeData.personal.title}
          </p>
          <div className="text-sm space-y-1" style={{ color: 'var(--app-text-secondary)' }}>
            <p>{resumeData.personal.email} • {resumeData.personal.phone}</p>
            <p>{resumeData.personal.location} • {resumeData.personal.website}</p>
          </div>
        </div>

        {/* Summary */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2" style={{ color: 'var(--app-text)' }}>Professional Summary</h3>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--app-text-secondary)' }}>
            {resumeData.summary}
          </p>
        </div>

        {/* Experience */}
        <div className="mb-6">
          <h3 className="font-semibold mb-3" style={{ color: 'var(--app-text)' }}>Work Experience</h3>
          {resumeData.experience.map((exp: any, index: number) => (
            <div key={index} className="mb-4">
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-medium" style={{ color: 'var(--app-text)' }}>{exp.title}</h4>
                <span className="text-xs" style={{ color: 'var(--app-text-secondary)' }}>{exp.period}</span>
              </div>
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--app-primary)' }}>{exp.company}</p>
              <p className="text-sm" style={{ color: 'var(--app-text-secondary)' }}>{exp.description}</p>
            </div>
          ))}
        </div>

        {/* Skills */}
        <div>
          <h3 className="font-semibold mb-2" style={{ color: 'var(--app-text)' }}>Skills</h3>
          <div className="flex flex-wrap gap-2">
            {resumeData.skills.map((skill: string, index: number) => (
              <span
                key={index}
                className="px-3 py-1 text-xs rounded-full"
                style={{ backgroundColor: 'var(--app-bg-gray)', color: 'var(--app-text)' }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-6 gap-4">
        <button className="btn-primary">
          <Download className="h-4 w-4 mr-2" />
          Download PDF
        </button>
        <button className="btn-secondary">
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </button>
      </div>
    </div>
  );
}

function ExportSection() {
  return (
    <div>
      <h3 className="text-2xl font-bold mb-6" style={{ color: 'var(--app-text)' }}>
        Export Your Resume
      </h3>
      
      <div className="grid md:grid-cols-2 gap-6">
        {[
          { format: 'PDF', description: 'Best for printing and email attachments', icon: FileText },
          { format: 'DOCX', description: 'Editable format for Microsoft Word', icon: FileText },
          { format: 'TXT', description: 'Plain text for online applications', icon: FileText },
          { format: 'HTML', description: 'Web-ready format for online portfolios', icon: FileText }
        ].map((item, index) => (
          <div key={index} className="p-6 rounded-lg border hover:scale-105 transition-all duration-300 cursor-pointer"
               style={{ borderColor: 'var(--app-border)', backgroundColor: 'var(--app-bg)' }}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center"
                   style={{ backgroundColor: 'var(--app-primary)' }}>
                <item.icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-lg" style={{ color: 'var(--app-text)' }}>{item.format}</h4>
                <p className="text-sm" style={{ color: 'var(--app-text-secondary)' }}>{item.description}</p>
              </div>
            </div>
            <button className="w-full btn-secondary">
              Download {item.format}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 p-6 rounded-lg" style={{ backgroundColor: 'var(--app-bg-gray)' }}>
        <h4 className="font-semibold mb-4" style={{ color: 'var(--app-text)' }}>Export Options</h4>
        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input type="checkbox" className="rounded" />
            <span style={{ color: 'var(--app-text)' }}>Include cover letter</span>
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" className="rounded" />
            <span style={{ color: 'var(--app-text)' }}>Add watermark (free version)</span>
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" className="rounded" />
            <span style={{ color: 'var(--app-text)' }}>Optimize for ATS systems</span>
          </label>
        </div>
      </div>
    </div>
  );
}
