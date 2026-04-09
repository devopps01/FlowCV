'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, Download, Shield, Sparkles, Star, ArrowRight, Check, Users, Zap, Trophy, Clock, Globe, Award, TrendingUp, Heart, Brain, Rocket, BookOpen, Target, Lightbulb, Eye, Cpu, Palette, Share2, Lock, Smartphone, Cloud, FileSearch, BarChart3, Code, Database, GitBranch, Terminal, Settings } from 'lucide-react';
import { CommonHeader, Footer } from '@/components/layout';
import { useTheme } from '@/hooks/useTheme';

// Scroll animations hook
function useScrollAnimations() {
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('opacity-0', 'translate-y-20', 'translate-y-10');
          entry.target.classList.add('opacity-100', 'translate-y-0');
        }
      });
    }, observerOptions);

    const animatedSections = document.querySelectorAll('.opacity-0');
    animatedSections.forEach(section => {
      observer.observe(section);
    });

    return () => {
      animatedSections.forEach(section => {
        observer.unobserve(section);
      });
    };
  }, []);
}

export default function FeaturesPage() {
  const { isDark } = useTheme();

  // Initialize scroll animations
  useScrollAnimations();

  const coreFeatures = [
    {
      icon: FileText,
      title: 'Professional Templates',
      description: 'Choose from 50+ ATS-friendly templates designed by professionals to showcase your skills and experience.',
      features: ['Modern Designs', 'ATS Optimized', 'Industry Specific', 'Easy Customization'],
      gradient: 'linear-gradient(135deg, #41017d, #ee14ff)'
    },
    {
      icon: Sparkles,
      title: 'AI-Powered Suggestions',
      description: 'Get intelligent recommendations for your resume content with our advanced AI writing assistant.',
      features: ['Smart Content', 'Keyword Optimization', 'Skill Suggestions', 'Industry Insights'],
      gradient: 'linear-gradient(135deg, #ee14ff, #41017d)'
    },
    {
      icon: Download,
      title: 'Multiple Export Formats',
      description: 'Download your resume in various formats including PDF, DOCX, and more for maximum compatibility.',
      features: ['PDF Export', 'DOCX Format', 'Print Ready', 'Email Sharing'],
      gradient: 'linear-gradient(135deg, #41017d, #5a1fa8)'
    },
    {
      icon: Shield,
      title: 'Privacy & Security',
      description: 'Your data is protected with enterprise-grade security and privacy controls.',
      features: ['Data Encryption', 'Secure Storage', 'Privacy Controls', 'GDPR Compliant'],
      gradient: 'linear-gradient(135deg, #5a1fa8, #ee14ff)'
    }
  ];

  const advancedFeatures = [
    {
      icon: Brain,
      title: 'Smart Content Analysis',
      description: 'Analyze your resume content with AI-powered insights to improve your chances of getting hired.',
      features: ['Content Scoring', 'Keyword Analysis', 'Readability Check', 'Impact Assessment']
    },
    {
      icon: Palette,
      title: 'Custom Design Tools',
      description: 'Personalize every aspect of your resume with our advanced design and formatting tools.',
      features: ['Color Themes', 'Font Selection', 'Layout Options', 'Custom Sections']
    },
    {
      icon: Share2,
      title: 'Easy Sharing & Collaboration',
      description: 'Share your resume with others and get feedback before applying to your dream job.',
      features: ['Share Links', 'Feedback System', 'Version Control', 'Team Collaboration']
    },
    {
      icon: Cloud,
      title: 'Cloud Storage & Sync',
      description: 'Access your resumes from anywhere with automatic cloud synchronization across all devices.',
      features: ['Auto-Save', 'Cross-Device Sync', 'Version History', 'Offline Mode']
    }
  ];

  const technicalFeatures = [
    {
      icon: Cpu,
      title: 'Performance Optimized',
      description: 'Lightning-fast performance with optimized rendering and instant updates.',
      features: ['Fast Loading', 'Real-time Updates', 'Optimized Code', 'Smooth Animations']
    },
    {
      icon: Code,
      title: 'Developer Friendly',
      description: 'Clean, maintainable code with modern development practices and comprehensive documentation.',
      features: ['Clean Architecture', 'TypeScript', 'Modern Stack', 'Well Documented']
    },
    {
      icon: Database,
      title: 'Robust Infrastructure',
      description: 'Scalable infrastructure built with the latest technologies for reliability and performance.',
      features: ['Scalable Backend', 'Database Optimization', 'API Integration', 'Load Balancing']
    },
    {
      icon: Lock,
      title: 'Enterprise Security',
      description: 'Enterprise-grade security with comprehensive protection for your data and privacy.',
      features: ['End-to-End Encryption', 'Secure Authentication', 'Regular Audits', 'Compliance Standards']
    }
  ];

  const stats = [
    { value: '50+', label: 'Professional Templates', icon: FileText },
    { value: '4.9', label: 'User Rating', icon: Star },
    { value: '2.3M+', label: 'Resumes Created', icon: Users },
    { value: '99.9%', label: 'Uptime', icon: Trophy },
  ];

  return (
    <div className="min-h-screen transition-colors duration-500" style={{ backgroundColor: 'var(--app-bg)' }}>
      <CommonHeader />
      
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

          <div className="relative z-10 max-w-7xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
              <span className="block mb-4" style={{ color: 'var(--app-text)' }}>
                Powerful Features
              </span>
              <span 
                className="block bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent animate-gradient"
              >
                for Your Career
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-12 leading-relaxed max-w-3xl mx-auto"
               style={{ color: 'var(--app-text-secondary)' }}>
              Everything you need to create a professional resume that stands out from the crowd and lands your dream job.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link href="/register" className="btn-primary group relative overflow-hidden">
                <span className="relative z-10 flex items-center">
                  Start Building Free
                  <ArrowRight className="inline-block ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 transition-opacity duration-300"
                     style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)' }} />
              </Link>
              
              <Link href="/templates" className="btn-secondary group relative overflow-hidden">
                <span className="relative z-10 flex items-center">
                  Browse Templates
                  <Eye className="inline-block ml-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 transition-opacity duration-300"
                     style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)' }} />
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center p-6 rounded-2xl glass-card">
                  <div className="text-3xl font-bold mb-2" style={{ color: 'var(--app-primary)' }}>
                    {stat.value}
                  </div>
                  <div className="text-sm font-medium" style={{ color: 'var(--app-text-secondary)' }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Core Features Section */}
        <section className="py-32 px-4 sm:px-6 lg:px-8 opacity-0 transform translate-y-20 transition-all duration-1000"
             style={{ backgroundColor: 'var(--app-bg-gray)' }}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: 'var(--app-text)' }}>
                Core Features
              </h2>
              <p className="text-xl max-w-3xl mx-auto" style={{ color: 'var(--app-text-secondary)' }}>
                Essential tools and capabilities that make resume building simple and effective
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-12">
              {coreFeatures.map((feature, index) => (
                <div key={index} className="group opacity-0 transform translate-y-10 transition-all duration-700"
                     style={{ animationDelay: `${index * 200}ms` }}>
                  <div className="glass-card p-8 h-full hover:scale-105 transition-all duration-500">
                    <div className="flex items-center mb-6">
                      <div 
                        className="w-16 h-16 rounded-xl flex items-center justify-center mr-4 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6"
                        style={{ background: feature.gradient }}
                      >
                        <feature.icon className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold" style={{ color: 'var(--app-text)' }}>
                        {feature.title}
                      </h3>
                    </div>
                    <p className="text-lg mb-6 leading-relaxed" style={{ color: 'var(--app-text-secondary)' }}>
                      {feature.description}
                    </p>
                    <ul className="space-y-3">
                      {feature.features.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-3">
                          <Check className="h-5 w-5 flex-shrink-0" style={{ color: 'var(--app-primary)' }} />
                          <span className="text-sm" style={{ color: 'var(--app-text)' }}>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Advanced Features Section */}
        <section className="py-32 px-4 sm:px-6 lg:px-8 opacity-0 transform translate-y-20 transition-all duration-1000">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: 'var(--app-text)' }}>
                Advanced Capabilities
              </h2>
              <p className="text-xl max-w-3xl mx-auto" style={{ color: 'var(--app-text-secondary)' }}>
                Cutting-edge features that give you a competitive edge in the job market
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {advancedFeatures.map((feature, index) => (
                <div key={index} className="opacity-0 transform translate-y-10 transition-all duration-700"
                     style={{ animationDelay: `${index * 150}ms` }}>
                  <div className="glass-card p-6 text-center hover:scale-105 transition-all duration-500">
                    <div 
                      className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-6 transition-all duration-500 group-hover:scale-110"
                      style={{ background: feature.gradient }}
                    >
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--app-text)' }}>
                      {feature.title}
                    </h3>
                    <p className="text-sm mb-4 leading-relaxed" style={{ color: 'var(--app-text-secondary)' }}>
                      {feature.description}
                    </p>
                    <ul className="space-y-2 text-left">
                      {feature.features.slice(0, 2).map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-xs">
                          <Check className="h-3 w-3" style={{ color: 'var(--app-primary)' }} />
                          <span style={{ color: 'var(--app-text)' }}>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Technical Features Section */}
        <section className="py-32 px-4 sm:px-6 lg:px-8 opacity-0 transform translate-y-20 transition-all duration-1000"
             style={{ backgroundColor: 'var(--app-bg-gray)' }}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: 'var(--app-text)' }}>
                Technical Excellence
              </h2>
              <p className="text-xl max-w-3xl mx-auto" style={{ color: 'var(--app-text-secondary)' }}>
                Built with modern technologies and best practices for optimal performance
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-12">
              {technicalFeatures.map((feature, index) => (
                <div key={index} className="opacity-0 transform translate-y-10 transition-all duration-700"
                     style={{ animationDelay: `${index * 200}ms` }}>
                  <div className="flex items-start gap-6">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-500 hover:scale-110"
                      style={{ background: feature.gradient }}
                    >
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--app-text)' }}>
                        {feature.title}
                      </h3>
                      <p className="text-sm mb-4 leading-relaxed" style={{ color: 'var(--app-text-secondary)' }}>
                        {feature.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {feature.features.map((item, idx) => (
                          <span key={idx} className="text-xs px-2 py-1 rounded-full"
                                style={{ backgroundColor: 'var(--app-bg)', color: 'var(--app-primary)' }}>
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="absolute inset-0">
            <div 
              className="absolute inset-0 opacity-10"
              style={{
                background: `linear-gradient(45deg, var(--app-primary) 0%, var(--app-secondary) 100%)`,
              }}
            />
          </div>
          
          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: 'var(--app-text)' }}>
              Ready to Experience These Features?
            </h2>
            <p className="text-xl mb-12" style={{ color: 'var(--app-text-secondary)' }}>
              Start building your professional resume today and unlock all these powerful features.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register" className="btn-primary group relative overflow-hidden">
                <span className="relative z-10 flex items-center">
                  Start Building Free
                  <ArrowRight className="inline-block ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 transition-opacity duration-300"
                     style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)' }} />
              </Link>
              
              <Link href="/templates" className="btn-secondary group relative overflow-hidden">
                <span className="relative z-10 flex items-center">
                  Browse Templates
                  <Eye className="inline-block ml-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 transition-opacity duration-300"
                     style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)' }} />
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
