'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, Download, Shield, Sparkles, Star, ArrowRight, Check, Users, Zap, Trophy, Clock, Globe, Award, TrendingUp, Heart, Brain, Rocket, BookOpen, Target, Lightbulb, Eye } from 'lucide-react';
import { HomeHeader } from '@/components/layout/HomeHeader';
import { useTheme } from '@/hooks/useTheme';

// Enhanced scroll animations hook with smart scrolling and step indicators
function useScrollAnimations() {
  useEffect(() => {
    // Observer for scroll animations with enhanced effects
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('opacity-0', 'translate-y-20', 'translate-y-10', 'scale-95');
          entry.target.classList.add('opacity-100', 'translate-y-0', 'scale-100');
          
          // Add entrance animation
          entry.target.style.animation = 'slideInUp 0.6s ease-out';
          
          // Trigger animations for child elements with staggered delays
          const animatedChildren = entry.target.querySelectorAll('[style*="animation-delay"]');
          animatedChildren.forEach((child, index) => {
            setTimeout(() => {
              child.classList.remove('opacity-0', 'translate-y-10', 'scale-95');
              child.classList.add('opacity-100', 'translate-y-0', 'scale-100');
              child.style.animation = 'slideInUp 0.6s ease-out';
            }, index * 100);
          });
        }
      });
    }, observerOptions);

    // Observe sections with animations
    const animatedSections = document.querySelectorAll('.opacity-0');
    animatedSections.forEach(section => {
      observer.observe(section);
    });

    // Enhanced parallax effect for floating elements
    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const floatingElements = document.querySelectorAll('.animate-float');
      
      floatingElements.forEach((element, index) => {
        const speed = 0.5 + (index * 0.1);
        const yPos = -(scrolled * speed);
        const rotation = scrolled * 0.1 * (index + 1);
        element.style.transform = `translateY(${yPos}px) rotate(${rotation}deg)`;
        element.style.opacity = Math.max(0.3, 1 - Math.abs(yPos) / 500);
      });
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      animatedSections.forEach(section => {
        observer.unobserve(section);
      });
    };
  }, []);
}

// Smart scroll progress indicator
function useScrollProgress() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrolled / height) * 100;
      setScrollProgress(Math.min(100, Math.max(0, progress)));

      // Update active section based on scroll position
      const sections = ['hero', 'how-it-works', 'features', 'testimonials', 'tips'];
      sections.forEach(sectionId => {
        const element = document.getElementById(sectionId);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveSection(sectionId);
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return { scrollProgress, activeSection };
}

function TemplatePreviewCard({ name, slug, category }: { name: string; slug: string; category: string }) {
  const [imgError, setImgError] = useState(false);

  return (
    <Link
      href={`/templates/${slug}`}
      className="group relative overflow-hidden rounded-2xl transition-all duration-500 hover:scale-105 hover:shadow-2xl"
      style={{
        backgroundColor: 'var(--app-bg)',
        backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        border: '1px solid transparent',
        backgroundClip: 'padding-box, border-box',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
      }}
    >
      {/* Gradient border effect */}
      <div className="absolute inset-0 rounded-2xl p-[1px]" 
           style={{
             background: 'linear-gradient(135deg, var(--app-primary), var(--app-secondary), var(--app-accent))',
             mask: 'linear-gradient(#fff 0 0 75% 100%) content-box, linear-gradient(#fff 0 0 75% 100%)',
             WebkitMask: 'linear-gradient(#fff 0 0 75% 100%) content-box, linear-gradient(#fff 0 0 75% 100%)',
             WebkitBackgroundClip: 'text, border-box',
             backgroundClip: 'text, border-box'
           }} />
      
      <div className="aspect-[3/4] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 relative overflow-hidden">
        {!imgError ? (
          <img
            src={`https://prod.flowcvassets.com/resume-templates/${slug}/960.jpeg`}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <span className="text-sm" style={{ color: 'var(--app-text-muted)' }}>{name}</span>
          </div>
        )}
        
        {/* Enhanced Glassmorphism overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 backdrop-blur-sm" />
        
        {/* Content overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
          <span className="text-sm font-medium opacity-90" style={{ color: 'var(--app-bg)' }}>
            {category}
          </span>
          <p className="text-lg font-semibold" style={{ color: 'var(--app-bg)' }}>
            {name}
          </p>
        </div>
      </div>
    </Link>
  );
}

function FeatureCard({ icon: Icon, title, description, delay }: { 
  icon: any; 
  title: string; 
  description: string; 
  delay: number;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div 
      className={`group relative p-8 rounded-2xl transition-all duration-700 hover:scale-105 hover:shadow-2xl ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{
        backgroundColor: 'var(--app-bg)',
        backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        border: '1px solid transparent',
        backgroundClip: 'padding-box, border-box',
        backdropFilter: 'blur(10px)',
        boxShadow: isVisible 
          ? '0 10px 30px rgba(0,0,0,0.1), 0 0 60px rgba(65, 88, 208, 0.05)'
          : '0 4px 20px rgba(0,0,0,0.05)'
      }}
    >
      {/* Glassmorphism effect with gradient border */}
      <div className="absolute inset-0 rounded-2xl p-[1px]" 
           style={{
             background: 'linear-gradient(135deg, var(--app-primary), var(--app-secondary), var(--app-accent))',
             mask: 'linear-gradient(#fff 0 0 75% 100%) content-box, linear-gradient(#fff 0 0 75% 100%)',
             WebkitMask: 'linear-gradient(#fff 0 0 75% 100%) content-box, linear-gradient(#fff 0 0 75% 100%)',
             WebkitBackgroundClip: 'text, border-box',
             backgroundClip: 'text, border-box'
           }} />
      
      <div className="relative z-10">
        <div 
          className="w-16 h-16 rounded-xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
          style={{ 
            backgroundColor: 'var(--app-primary)',
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
          }}
        >
          <Icon className="h-8 w-8 text-white" />
        </div>
        
        <h3 className="text-xl font-bold mb-4 transition-colors duration-300"
            style={{ color: 'var(--app-text)' }}>
          {title}
        </h3>
        
        <p className="leading-relaxed transition-colors duration-300"
           style={{ color: 'var(--app-text-secondary)' }}>
          {description}
        </p>
      </div>
    </div>
  );
}

function StatCard({ value, label, icon: Icon, delay }: { 
  value: string; 
  label: string; 
  icon: any; 
  delay: number;
}) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!isVisible) return;
    
    const target = parseInt(value.replace(/[^0-9]/g, ''));
    const increment = target / 50;
    let current = 0;
    
    const counter = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(counter);
      }
      setCount(Math.floor(current));
    }, 30);
    
    return () => clearInterval(counter);
  }, [isVisible, value]);

  return (
    <div 
      className={`text-center p-6 rounded-2xl transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{
        backgroundColor: 'var(--app-bg-gray)',
        backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        border: '1px solid transparent',
        backgroundClip: 'padding-box, border-box',
        backdropFilter: 'blur(10px)',
        boxShadow: isVisible 
          ? '0 10px 30px rgba(0,0,0,0.1), 0 0 60px rgba(65, 88, 208, 0.05)'
          : '0 4px 20px rgba(0,0,0,0.05)'
      }}
    >
      {/* Gradient border effect */}
      <div className="absolute inset-0 rounded-2xl p-[1px]" 
           style={{
             background: 'linear-gradient(135deg, var(--app-primary), var(--app-secondary), var(--app-accent))',
             mask: 'linear-gradient(#fff 0 0 75% 100%) content-box, linear-gradient(#fff 0 0 75% 100%)',
             WebkitMask: 'linear-gradient(#fff 0 0 75% 100%) content-box, linear-gradient(#fff 0 0 75% 100%)',
             WebkitBackgroundClip: 'text, border-box',
             backgroundClip: 'text, border-box'
           }} />
      
      <div className="relative z-10">
        <div className="flex justify-center mb-4">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
            style={{ 
              backgroundColor: 'var(--app-primary)',
              boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
            }}
          >
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
        <div className="text-3xl font-bold mb-2" style={{ color: 'var(--app-primary)' }}>
          {count}{value.includes('M') ? 'M+' : value.includes('K') ? 'K+' : '+'}
        </div>
        <div className="text-sm font-medium" style={{ color: 'var(--app-text-secondary)' }}>
          {label}
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const { isDark } = useTheme();
  const [scrollY, setScrollY] = useState(0);
  const { scrollProgress, activeSection } = useScrollProgress();

  // Initialize scroll animations
  useScrollAnimations();

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideInUp {
        from {
          opacity: 0;
          transform: translateY(20px) scale(0.95);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
      
      @keyframes animate-pulse-slow {
        0%, 100% {
          opacity: 1;
        }
        50% {
          opacity: 0.3;
        }
      }
      
      @keyframes animate-pulse {
        0%, 100% {
          opacity: 1;
        }
        50% {
          opacity: 0.3;
        }
      }
      
      .glass-card {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 16px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      }
      
      .animate-float {
        animation: float 6s ease-in-out infinite;
      }
      
      @keyframes float {
        0%, 100% {
          transform: translateY(0px) rotate(0deg);
        }
        50% {
          transform: translateY(-20px) rotate(180deg);
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    };
  }, []);

  const templates = [
    { name: 'Atlantic Blue', slug: 'atlantic-blue-multi-column-sidebar-left', category: 'Modern' },
    { name: 'Classic Pro', slug: 'classic-multi-column-serif-black-white', category: 'Professional' },
    { name: 'Executive Elite', slug: 'executive-serif-black-white', category: 'Executive' },
    { name: 'Creative Leaves', slug: 'dark-leaves-multi-column-border-left', category: 'Creative' },
    { name: 'Quicksilver', slug: 'quicksilver-resume-template', category: 'Modern' },
    { name: 'Harvard Style', slug: 'harvard-classic-sans-serif-style', category: 'Academic' },
    { name: 'Tech Minimal', slug: 'tech-minimal-clean', category: 'Technology' },
    { name: 'Artist Portfolio', slug: 'artist-portfolio-creative', category: 'Creative' },
    { name: 'Business Pro', slug: 'business-professional-corporate', category: 'Business' },
  ];

  const features = [
    { icon: FileText, title: 'Smart Resume Builder', description: 'AI-powered suggestions and real-time preview to create the perfect resume effortlessly.' },
    { icon: Sparkles, title: '50+ Professional Templates', description: 'Industry-tested templates that pass ATS systems and impress recruiters.' },
    { icon: Download, title: 'Unlimited Downloads', description: 'Export your resume in multiple formats. No limits, no watermarks, no restrictions.' },
    { icon: Shield, title: 'Privacy First', description: 'Your data is yours. We never sell or share your personal information with anyone.' },
    { icon: Zap, title: 'Lightning Fast', description: 'Create a professional resume in minutes, not hours. Our intuitive interface speeds up the process.' },
    { icon: Globe, title: 'Multi-Language Support', description: 'Create resumes in multiple languages to apply for jobs anywhere in the world.' },
  ];

  const stats = [
    { value: '4.3M+', label: 'Happy Users', icon: Users },
    { value: '50+', label: 'Templates', icon: FileText },
    { value: '99.9%', label: 'Uptime', icon: Trophy },
    { value: '4.9', label: 'Average Rating', icon: Star },
  ];

  return (
    <div className="min-h-screen transition-colors duration-500" style={{ backgroundColor: 'var(--app-bg)' }}>
      <HomeHeader />
      
      {/* Scroll Progress Indicator */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-blue-500 z-50 transition-all duration-300"
           style={{ width: `${scrollProgress}%` }}>
        <div className="h-full bg-white/30 backdrop-blur-sm" />
      </div>

      {/* Step Navigation */}
      <div className="fixed right-8 top-1/2 z-40">
        <div className="glass-card p-4 space-y-2">
          <div className="text-xs font-medium mb-2" style={{ color: 'var(--app-text-secondary)' }}>Progress</div>
          {['hero', 'how-it-works', 'features', 'testimonials', 'tips'].map((step, index) => (
            <div key={step} className={`w-3 h-3 rounded-full transition-all duration-300 ${
              activeSection === step ? 'bg-purple-600 scale-110' : 'bg-gray-300 hover:bg-gray-400'
            }`} />
          ))}
        </div>
      </div>
      
      <main>
        {/* Hero Section with Parallax */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0">
            <div 
              className="absolute inset-0 opacity-20"
              style={{
                background: `linear-gradient(135deg, var(--app-primary) 0%, var(--app-secondary) 100%)`,
                transform: `translateY(${scrollY * 0.5}px)`
              }}
            />
            <div className="absolute inset-0">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 rounded-full animate-pulse"
                  style={{
                    backgroundColor: 'var(--app-primary)',
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 5}s`,
                    opacity: 0.3
                  }}
                />
              ))}
            </div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
                <span className="block mb-4" style={{ color: 'var(--app-text)' }}>
                  Build Your
                </span>
                <span 
                  className="block bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 bg-clip-text text-transparent animate-gradient"
                >
                  Dream Resume
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl mb-12 leading-relaxed max-w-3xl mx-auto"
                 style={{ color: 'var(--app-text-secondary)' }}>
                Join millions of professionals who landed their dream jobs with our 
                AI-powered resume builder. Free forever, no hidden costs.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                <Link
                  href="/register"
                  className="btn-primary group relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center">
                    Start Building Free
                    <ArrowRight className="inline-block ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 transition-opacity duration-300" 
                       style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)' }} />
                </Link>
                
                <Link
                  href="/templates"
                  className="btn-secondary group relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center">
                    Browse Templates
                    <Eye className="inline-block ml-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 transition-opacity duration-300"
                       style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)' }} />
                </Link>
              </div>

              {/* Trust Indicators with Enhanced Animations */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
                {stats.map((stat, index) => (
                  <div 
                    key={index} 
                    className="group cursor-pointer transform transition-all duration-500 hover:scale-110 hover:-translate-y-2"
                    style={{ animationDelay: `${index * 200}ms` }}
                  >
                    <div className="glass-card p-6 text-center group-hover:shadow-2xl transition-all duration-300">
                      <div className="text-3xl font-bold mb-2 gradient-text group-hover:scale-110 transition-transform"
                           style={{ animationDelay: `${index * 200 + 100}ms` }}>
                        {stat.value}
                      </div>
                      <div className="text-sm font-medium group-hover:text-purple-600 transition-colors"
                           style={{ color: 'var(--app-text-secondary)' }}>
                        {stat.label}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Enhanced Floating Elements */}
          <div className="absolute top-20 left-10 w-20 h-20 rounded-full opacity-20 animate-float"
               style={{ 
                 backgroundColor: 'var(--app-primary)',
                 animationDelay: '0s'
               }} />
          <div className="absolute top-40 right-20 w-16 h-16 rounded-full opacity-20 animate-float"
               style={{ 
                 backgroundColor: 'var(--app-secondary)',
                 animationDelay: '1s'
               }} />
          <div className="absolute bottom-20 left-1/4 w-12 h-12 rounded-full opacity-20 animate-float"
               style={{ 
                 backgroundColor: 'var(--app-primary)',
                 animationDelay: '0.5s'
               }} />
          <div className="absolute top-1/3 right-1/4 w-8 h-8 rounded-full opacity-15 animate-pulse-slow"
               style={{ 
                 backgroundColor: 'var(--app-secondary)',
                 animationDelay: '2s'
               }} />
        </section>

        {/* How it Works Section with Scroll Animations */}
        <section className="py-32 px-4 sm:px-6 lg:px-8 opacity-0 transform translate-y-20 transition-all duration-1000"
             style={{ backgroundColor: 'var(--app-bg-gray)' }}
             id="how-it-works">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 transform transition-all duration-700 hover:scale-105"
                  style={{ color: 'var(--app-text)' }}>
                How FlowCV Works
              </h2>
              <p className="text-xl max-w-3xl mx-auto transform transition-all duration-700 delay-100"
                 style={{ color: 'var(--app-text-secondary)' }}>
                Create your professional resume in three simple steps
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-12">
              {[
                { 
                  icon: FileText, 
                  title: '1. Add Your Information', 
                  description: 'Fill in your personal details, work experience, education, and skills. Our smart forms guide you through each section.',
                  features: ['Smart form completion', 'Auto-save progress', 'Import from LinkedIn', 'Professional templates']
                },
                { 
                  icon: Sparkles, 
                  title: '2. Customize Your Design', 
                  description: 'Choose from 50+ professional templates and customize colors, fonts, and layouts to match your style.',
                  features: ['50+ templates', 'Color customization', 'Font selection', 'Layout options']
                },
                { 
                  icon: Download, 
                  title: '3. Download & Share', 
                  description: 'Export your resume in multiple formats or share it online with recruiters and hiring managers.',
                  features: ['PDF download', 'Multiple formats', 'Online sharing', 'Track views']
                },
              ].map((step, index) => (
                <div key={index} className="relative group opacity-0 transform translate-y-10 transition-all duration-700"
                     style={{ animationDelay: `${index * 200}ms` }}>
                  <div className="text-center mb-8 transform transition-all duration-500 group-hover:scale-105">
                    <div 
                      className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-2xl"
                      style={{ 
                        backgroundColor: 'var(--app-primary)',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                      }}
                    >
                      <step.icon className="h-10 w-10 text-white animate-pulse-slow" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4 group-hover:text-purple-600 transition-colors"
                        style={{ color: 'var(--app-text)' }}>
                      {step.title}
                    </h3>
                    <p className="text-lg leading-relaxed mb-6"
                       style={{ color: 'var(--app-text-secondary)' }}>
                      {step.description}
                    </p>
                    <ul className="space-y-2 text-left">
                      {step.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 transform transition-all duration-300 hover:translate-x-2 group-hover:scale-105"
                            style={{ 
                              color: 'var(--app-text-secondary)',
                              animationDelay: `${index * 200 + idx * 100}ms`
                            }}>
                          <Check className="h-4 w-4" style={{ color: 'var(--app-primary)' }} />
                          <span className="group-hover:text-purple-600 transition-colors">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Enhanced Step Connector */}
                  {index < 2 && (
                    <div className="hidden md:block absolute top-10 left-full w-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="flex items-center justify-center">
                        <ArrowRight className="h-6 w-6 animate-pulse" style={{ color: 'var(--app-primary)' }} />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Success Stories Section */}
        <section className="py-32 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold mb-6"
                  style={{ color: 'var(--app-text)' }}>
                Success Stories
              </h2>
              <p className="text-xl max-w-3xl mx-auto"
                 style={{ color: 'var(--app-text-secondary)' }}>
                Join thousands of professionals who landed their dream jobs with FlowCV
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  name: "Sarah Johnson",
                  role: "Software Engineer",
                  company: "Google",
                  story: "FlowCV helped me create a professional resume that stood out. I landed my dream job at Google within 2 weeks!",
                  image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
                },
                {
                  name: "Michael Chen",
                  role: "Marketing Manager",
                  company: "Microsoft",
                  story: "The templates and AI suggestions helped me highlight my achievements. I got multiple offers!",
                  image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
                },
                {
                  name: "Emily Davis",
                  role: "Product Designer",
                  company: "Apple",
                  story: "Beautiful templates and easy customization made my resume look professional. I'm now at Apple!",
                  image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
                }
              ].map((testimonial, index) => (
                <div key={index} className="glass-card p-8 hover:scale-105 transition-all duration-300">
                  <div className="flex items-center mb-6">
                    <img src={testimonial.image} alt={testimonial.name} 
                         className="w-16 h-16 rounded-full mr-4 object-cover" />
                    <div>
                      <h4 className="font-bold text-lg"
                          style={{ color: 'var(--app-text)' }}>
                        {testimonial.name}
                      </h4>
                      <p className="text-sm"
                         style={{ color: 'var(--app-text-secondary)' }}>
                        {testimonial.role} at {testimonial.company}
                      </p>
                    </div>
                  </div>
                   <p className="leading-relaxed italic"
                      style={{ color: 'var(--app-text-secondary)' }}>
                    &ldquo;{testimonial.story}&rdquo;
                  </p>
                  <div className="flex mt-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Resume Tips Section */}
        <section className="py-32 px-4 sm:px-6 lg:px-8"
             style={{ backgroundColor: 'var(--app-bg-gray)' }}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold mb-6"
                  style={{ color: 'var(--app-text)' }}>
                Expert Resume Tips
              </h2>
              <p className="text-xl max-w-3xl mx-auto"
                 style={{ color: 'var(--app-text-secondary)' }}>
                Professional advice to make your resume stand out
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: Brain,
                  title: "Tailor Your Resume",
                  description: "Customize your resume for each job application to match the requirements.",
                  tip: "Use keywords from the job description to pass ATS systems."
                },
                {
                  icon: Award,
                  title: "Quantify Achievements",
                  description: "Use numbers and metrics to show your impact and results.",
                  tip: "Increased sales by 30% is better than 'Improved sales'."
                },
                {
                  icon: Shield,
                  title: "Keep it Concise",
                  description: "One page for most professionals, two pages if you have extensive experience.",
                  tip: "Recruiters spend an average of 7 seconds reviewing each resume."
                },
                {
                  icon: Zap,
                  title: "Use Action Verbs",
                  description: "Start bullet points with strong action verbs to show initiative.",
                  tip: "Use words like 'Led', 'Developed', 'Implemented', 'Managed'."
                }
              ].map((tip, index) => (
                <div key={index} className="text-center">
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 transition-all duration-300 hover:scale-110"
                    style={{ backgroundColor: 'var(--app-primary)' }}>
                    <tip.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold mb-4"
                      style={{ color: 'var(--app-text)' }}>
                    {tip.title}
                  </h3>
                  <p className="text-sm leading-relaxed mb-4"
                     style={{ color: 'var(--app-text-secondary)' }}>
                    {tip.description}
                  </p>
                  <p className="text-xs font-medium italic"
                     style={{ color: 'var(--app-primary)' }}>
                    💡 {tip.tip}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-32 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold mb-6"
                  style={{ color: 'var(--app-text)' }}>
                Frequently Asked Questions
              </h2>
              <p className="text-xl"
                 style={{ color: 'var(--app-text-secondary)' }}>
                Everything you need to know about FlowCV
              </p>
            </div>
            
            <div className="space-y-6">
              {[
                {
                  question: "Is FlowCV really free?",
                  answer: "Yes! Your first resume is completely free forever. No hidden fees, no credit card required. You can create, edit, and download your resume without any limits."
                },
                {
                  question: "Can I use FlowCV on mobile?",
                  answer: "Absolutely! FlowCV works perfectly on all devices - desktop, tablet, and mobile. You can start your resume on your computer and finish it on your phone."
                },
                {
                  question: "How many templates are available?",
                  answer: "We offer 50+ professional templates designed by experts. Each template is ATS-friendly and can be fully customized to match your style."
                },
                {
                  question: "Can I import my existing resume?",
                  answer: "Yes! You can upload your existing resume and we'll help you extract and organize the information. You can also import from LinkedIn."
                },
                {
                  question: "What formats can I download?",
                  answer: "You can download your resume in PDF, DOCX, and other popular formats. PDF is recommended for the best formatting and compatibility."
                },
                {
                  question: "Is my data secure?",
                  answer: "Absolutely! We use bank-level encryption to protect your data. Your information is never shared with third parties and you can delete your account at any time."
                }
              ].map((faq, index) => (
                <div key={index} className="glass-card p-6">
                  <h3 className="text-lg font-bold mb-3"
                      style={{ color: 'var(--app-text)' }}>
                    {faq.question}
                  </h3>
                  <p className="leading-relaxed"
                     style={{ color: 'var(--app-text-secondary)' }}>
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Industry Stats Section */}
        <section className="py-32 px-4 sm:px-6 lg:px-8"
             style={{ backgroundColor: 'var(--app-bg-gray)' }}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold mb-6"
                  style={{ color: 'var(--app-text)' }}>
                Why Professionals Choose FlowCV
              </h2>
              <p className="text-xl max-w-3xl mx-auto"
                 style={{ color: 'var(--app-text-secondary)' }}>
                Industry-leading features that help you stand out
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { value: "98%", label: "ATS Success Rate", icon: Trophy },
                { value: "50+", label: "Professional Templates", icon: FileText },
                { value: "24/7", label: "Customer Support", icon: Users },
                { value: "100K+", label: "Monthly Users", icon: TrendingUp }
              ].map((stat, index) => (
                <div key={index} className="text-center p-8 rounded-2xl glass-card">
                  <div className="flex justify-center mb-4">
                    <div 
                      className="w-16 h-16 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: 'var(--app-primary)' }}>
                      <stat.icon className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <div className="text-4xl font-bold mb-2" style={{ color: 'var(--app-primary)' }}>
                    {stat.value}
                  </div>
                  <div className="text-lg font-medium" style={{ color: 'var(--app-text-secondary)' }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Comprehensive Features Section */}
        <section className="py-32 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold mb-6"
                  style={{ color: 'var(--app-text)' }}>
                Powerful Features for Your Career
              </h2>
              <p className="text-xl max-w-3xl mx-auto"
                 style={{ color: 'var(--app-text-secondary)' }}>
                Everything you need to create a standout resume that gets you hired
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {[
                { icon: FileText, title: 'Smart Resume Builder', description: 'AI-powered suggestions and real-time preview to create the perfect resume effortlessly.' },
                { icon: Sparkles, title: '50+ Professional Templates', description: 'Industry-tested templates that pass ATS systems and impress recruiters.' },
                { icon: Download, title: 'Unlimited Downloads', description: 'Export your resume in multiple formats. No limits, no watermarks, no restrictions.' },
                { icon: Shield, title: 'Privacy First', description: 'Your data is yours. We never sell or share your personal information with anyone.' },
                { icon: Zap, title: 'Lightning Fast', description: 'Create a professional resume in minutes, not hours. Our intuitive interface speeds up the process.' },
                { icon: Globe, title: 'Multi-Language Support', description: 'Create resumes in multiple languages to apply for jobs anywhere in the world.' },
              ].map((feature, index) => (
                <FeatureCard key={index} {...feature} delay={index * 150} />
              ))}
            </div>

            {/* Advanced Features Grid */}
            <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-8">
                <h3 className="text-2xl font-bold mb-6" style={{ color: 'var(--app-text)' }}>
                  Advanced Tools
                </h3>
                {[
                  { icon: BookOpen, title: 'Cover Letter Builder', desc: 'Create matching cover letters with our AI-powered builder.' },
                  { icon: Target, title: 'Job Tracking', desc: 'Track your applications and follow up effectively with potential employers.' },
                  { icon: Lightbulb, title: 'Skills Assessment', desc: 'Discover your strengths and get personalized recommendations.' },
                ].map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: 'var(--app-primary)' }}>
                      <item.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-2" style={{ color: 'var(--app-text)' }}>
                        {item.title}
                      </h4>
                      <p style={{ color: 'var(--app-text-secondary)' }}>
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="space-y-8">
                <h3 className="text-2xl font-bold mb-6" style={{ color: 'var(--app-text)' }}>
                  Career Resources
                </h3>
                {[
                  { icon: BookOpen, title: 'Interview Preparation', desc: 'Access our comprehensive interview guide and practice questions.' },
                  { icon: Target, title: 'Salary Calculator', desc: 'Research salary ranges and negotiate better compensation packages.' },
                  { icon: Lightbulb, title: 'Career Blog', desc: 'Get expert advice on job searching, networking, and career growth.' },
                ].map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: 'var(--app-primary)' }}>
                      <item.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-2" style={{ color: 'var(--app-text)' }}>
                        {item.title}
                      </h4>
                      <p style={{ color: 'var(--app-text-secondary)' }}>
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        {/* Professional Templates Showcase */}
        <section className="py-32 px-4 sm:px-6 lg:px-8"
             style={{ backgroundColor: 'var(--app-bg-gray)' }}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold mb-6"
                  style={{ color: 'var(--app-text)' }}>
                Professional Templates
              </h2>
              <p className="text-xl max-w-3xl mx-auto"
                 style={{ color: 'var(--app-text-secondary)' }}>
                Choose from our collection of ATS-friendly templates designed by professionals
              </p>
            </div>
            
            {/* Template Categories */}
            <div className="space-y-24">
              {/* 1. Modern Professional Templates */}
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--app-primary)' }}>
                  Modern Professional
                </h3>
                <p className="text-lg mb-8 max-w-2xl mx-auto" style={{ color: 'var(--app-text-secondary)' }}>
                  Clean, contemporary designs perfect for corporate and tech positions
                </p>
                <div className="grid md:grid-cols-3 gap-6">
                  {[
                    { name: "Executive Pro", users: "45K+", rating: 4.9, style: "Clean header with sidebar layout" },
                    { name: "Corporate Elite", users: "38K+", rating: 4.8, style: "Traditional two-column format" },
                    { name: "Tech Modern", users: "52K+", rating: 4.9, style: "Minimalist with skill bars" }
                  ].map((template, index) => (
                    <div key={index} className="glass-card p-6 hover:scale-105 transition-all duration-300">
                      <div className="aspect-[3/4] bg-gradient-to-br rounded-lg mb-4 flex items-center justify-center"
                           style={{
                             background: `linear-gradient(135deg, var(--app-button-gradient-start), var(--app-button-gradient-end))`
                           }}>
                        <div className="text-white text-center p-4">
                          <div className="w-16 h-16 bg-white/20 rounded-lg mx-auto mb-2 flex items-center justify-center">
                            <FileText className="h-8 w-8" />
                          </div>
                          <p className="text-sm font-medium">Preview</p>
                        </div>
                      </div>
                      <h4 className="font-bold text-lg mb-2" style={{ color: 'var(--app-text)' }}>
                        {template.name}
                      </h4>
                      <p className="text-sm mb-3" style={{ color: 'var(--app-text-secondary)' }}>
                        {template.style}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <span style={{ color: 'var(--app-primary)' }}>{template.users} users</span>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span style={{ color: 'var(--app-text)' }}>{template.rating}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Creative Designer Templates */}
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--app-secondary)' }}>
                  Creative Designer
                </h3>
                <p className="text-lg mb-8 max-w-2xl mx-auto" style={{ color: 'var(--app-text-secondary)' }}>
                  Bold, artistic layouts for creative professionals and designers
                </p>
                <div className="grid md:grid-cols-3 gap-6">
                  {[
                    { name: "Portfolio Plus", users: "28K+", rating: 4.7, style: "Visual portfolio integration" },
                    { name: "Artistic Flow", users: "22K+", rating: 4.8, style: "Creative color blocks" },
                    { name: "Designer Pro", users: "31K+", rating: 4.9, style: "Modern typography focus" }
                  ].map((template, index) => (
                    <div key={index} className="glass-card p-6 hover:scale-105 transition-all duration-300">
                      <div className="aspect-[3/4] rounded-lg mb-4 flex items-center justify-center overflow-hidden"
                           style={{
                             background: `conic-gradient(from 45deg, var(--app-button-gradient-start), var(--app-button-gradient-end), var(--app-primary), var(--app-button-gradient-start))`
                           }}>
                        <div className="text-white text-center p-4 bg-black/20 rounded-lg">
                          <div className="w-16 h-16 bg-white/30 rounded-lg mx-auto mb-2 flex items-center justify-center">
                            <Sparkles className="h-8 w-8" />
                          </div>
                          <p className="text-sm font-medium">Creative</p>
                        </div>
                      </div>
                      <h4 className="font-bold text-lg mb-2" style={{ color: 'var(--app-text)' }}>
                        {template.name}
                      </h4>
                      <p className="text-sm mb-3" style={{ color: 'var(--app-text-secondary)' }}>
                        {template.style}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <span style={{ color: 'var(--app-secondary)' }}>{template.users} users</span>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span style={{ color: 'var(--app-text)' }}>{template.rating}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Executive Leadership Templates */}
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--app-primary)' }}>
                  Executive Leadership
                </h3>
                <p className="text-lg mb-8 max-w-2xl mx-auto" style={{ color: 'var(--app-text-secondary)' }}>
                  Sophisticated layouts for senior management and C-level positions
                </p>
                <div className="grid md:grid-cols-3 gap-6">
                  {[
                    { name: "CEO Elite", users: "18K+", rating: 4.9, style: "Executive summary format" },
                    { name: "Leadership Pro", users: "15K+", rating: 4.8, style: "Achievement-focused layout" },
                    { name: "Director Plus", users: "21K+", rating: 4.9, style: "Professional hierarchy" }
                  ].map((template, index) => (
                    <div key={index} className="glass-card p-6 hover:scale-105 transition-all duration-300">
                      <div className="aspect-[3/4] rounded-lg mb-4 flex items-center justify-center"
                           style={{
                             background: `linear-gradient(180deg, var(--app-button-bg) 0%, var(--app-button-hover) 100%)`
                           }}>
                        <div className="text-white text-center p-4">
                          <div className="w-16 h-16 bg-white/20 rounded-lg mx-auto mb-2 flex items-center justify-center">
                            <Award className="h-8 w-8" />
                          </div>
                          <p className="text-sm font-medium">Executive</p>
                        </div>
                      </div>
                      <h4 className="font-bold text-lg mb-2" style={{ color: 'var(--app-text)' }}>
                        {template.name}
                      </h4>
                      <p className="text-sm mb-3" style={{ color: 'var(--app-text-secondary)' }}>
                        {template.style}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <span style={{ color: 'var(--app-primary)' }}>{template.users} users</span>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span style={{ color: 'var(--app-text)' }}>{template.rating}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Academic & Research Templates */}
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--app-secondary)' }}>
                  Academic & Research
                </h3>
                <p className="text-lg mb-8 max-w-2xl mx-auto" style={{ color: 'var(--app-text-secondary)' }}>
                  Structured formats for academic positions and research opportunities
                </p>
                <div className="grid md:grid-cols-3 gap-6">
                  {[
                    { name: "Scholar Pro", users: "12K+", rating: 4.8, style: "Publications and citations" },
                    { name: "Research Focus", users: "9K+", rating: 4.7, style: "Research projects layout" },
                    { name: "Academic Elite", users: "14K+", rating: 4.9, style: "Conference presentations" }
                  ].map((template, index) => (
                    <div key={index} className="glass-card p-6 hover:scale-105 transition-all duration-300">
                      <div className="aspect-[3/4] rounded-lg mb-4 flex items-center justify-center"
                           style={{
                             background: `radial-gradient(circle, var(--app-button-gradient-end) 0%, var(--app-button-gradient-start) 100%)`
                           }}>
                        <div className="text-white text-center p-4">
                          <div className="w-16 h-16 bg-white/20 rounded-lg mx-auto mb-2 flex items-center justify-center">
                            <BookOpen className="h-8 w-8" />
                          </div>
                          <p className="text-sm font-medium">Academic</p>
                        </div>
                      </div>
                      <h4 className="font-bold text-lg mb-2" style={{ color: 'var(--app-text)' }}>
                        {template.name}
                      </h4>
                      <p className="text-sm mb-3" style={{ color: 'var(--app-text-secondary)' }}>
                        {template.style}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <span style={{ color: 'var(--app-secondary)' }}>{template.users} users</span>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span style={{ color: 'var(--app-text)' }}>{template.rating}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. Entry Level & Intern Templates */}
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--app-primary)' }}>
                  Entry Level & Intern
                </h3>
                <p className="text-lg mb-8 max-w-2xl mx-auto" style={{ color: 'var(--app-text-secondary)' }}>
                  Clean, focused layouts for students and early career professionals
                </p>
                <div className="grid md:grid-cols-3 gap-6">
                  {[
                    { name: "Student Pro", users: "35K+", rating: 4.7, style: "Education-focused layout" },
                    { name: "Intern Ready", users: "28K+", rating: 4.8, style: "Skills and projects highlight" },
                    { name: "First Career", users: "42K+", rating: 4.9, style: "Simple and clean format" }
                  ].map((template, index) => (
                    <div key={index} className="glass-card p-6 hover:scale-105 transition-all duration-300">
                      <div className="aspect-[3/4] rounded-lg mb-4 flex items-center justify-center"
                           style={{
                             background: `linear-gradient(45deg, var(--app-button-gradient-start) 25%, transparent 25%, transparent 75%, var(--app-button-gradient-end) 75%, var(--app-button-gradient-end)), 
                                         linear-gradient(45deg, var(--app-button-gradient-end) 25%, transparent 25%, transparent 75%, var(--app-button-gradient-start) 75%, var(--app-button-gradient-start))`,
                             backgroundSize: '20px 20px',
                             backgroundPosition: '0 0, 10px 10px'
                           }}>
                        <div className="text-white text-center p-4 bg-black/30 rounded-lg">
                          <div className="w-16 h-16 bg-white/20 rounded-lg mx-auto mb-2 flex items-center justify-center">
                            <Target className="h-8 w-8" />
                          </div>
                          <p className="text-sm font-medium">Entry Level</p>
                        </div>
                      </div>
                      <h4 className="font-bold text-lg mb-2" style={{ color: 'var(--app-text)' }}>
                        {template.name}
                      </h4>
                      <p className="text-sm mb-3" style={{ color: 'var(--app-text-secondary)' }}>
                        {template.style}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <span style={{ color: 'var(--app-primary)' }}>{template.users} users</span>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span style={{ color: 'var(--app-text)' }}>{template.rating}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* View All Templates Button */}
            <div className="text-center mt-16">
              <Link
                href="/templates"
                className="btn-primary text-lg px-8 py-4"
              >
                Explore All 50+ Templates
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <p className="mt-4 text-sm" style={{ color: 'var(--app-text-muted)' }}>
                New templates added weekly • All ATS-friendly • Fully customizable
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="absolute inset-0">
            <div 
              className="absolute inset-0 opacity-10"
              style={{
                background: `linear-gradient(45deg, var(--app-primary) 0%, var(--app-secondary) 100%)`
              }}
            />
          </div>
          
          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-8"
                style={{ color: 'var(--app-text)' }}>
              Ready to Land Your Dream Job?
            </h2>
            <p className="text-xl mb-12"
               style={{ color: 'var(--app-text-secondary)' }}>
              Join millions of successful professionals who built their careers with FlowCV
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="btn-primary"
              >
                Start Free Today
                <Rocket className="inline-block ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link
                href="/demo"
                className="btn-secondary"
              >
                View Demo
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Enhanced Footer */}
      <footer className="border-t py-16 px-4 sm:px-6 lg:px-8"
              style={{ borderColor: 'var(--app-border)', backgroundColor: 'var(--app-bg-gray)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl"
                     style={{ backgroundColor: 'var(--app-primary)' }}>
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold" style={{ color: 'var(--app-text)' }}>
                  FlowCV
                </span>
              </div>
              <p style={{ color: 'var(--app-text-secondary)' }}>
                The world&apos;s most advanced resume builder. Create professional resumes in minutes.
              </p>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-6" style={{ color: 'var(--app-text)' }}>
                Product
              </h3>
              <ul className="space-y-3">
                {['Resume Templates', 'Cover Letters', 'CV Builder', 'Pricing'].map((item) => (
                  <li key={item}>
                    <Link href="#" className="transition-colors hover:opacity-80"
                       style={{ color: 'var(--app-text-secondary)' }}>
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-6" style={{ color: 'var(--app-text)' }}>
                Company
              </h3>
              <ul className="space-y-3">
                {['About Us', 'Careers', 'Blog', 'Press'].map((item) => (
                  <li key={item}>
                    <Link href="#" className="transition-colors hover:opacity-80"
                       style={{ color: 'var(--app-text-secondary)' }}>
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-6" style={{ color: 'var(--app-text)' }}>
                Support
              </h3>
              <ul className="space-y-3">
                {['Help Center', 'Contact Us', 'Privacy Policy', 'Terms of Service'].map((item) => (
                  <li key={item}>
                    <Link href="#" className="transition-colors hover:opacity-80"
                       style={{ color: 'var(--app-text-secondary)' }}>
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="border-t pt-8 text-center"
               style={{ borderColor: 'var(--app-border)' }}>
            <p style={{ color: 'var(--app-text-muted)' }}>
              © 2024 FlowCV. All rights reserved. Made with ❤️ worldwide.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
