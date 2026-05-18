'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, AnimatePresence, useInView } from 'framer-motion';
import {
  FileText, Sparkles, ArrowRight, Star, Users, Trophy,
  Download, Shield, Zap, Globe, Eye, Check, Brain, Award,
  ChevronRight, Play, Briefcase, GraduationCap, Palette, Quote,
  Layout, Search, Lock, MousePointer2, Smartphone, Cpu, BarChart3,
  Rocket, MessageSquare, Heart, Bookmark
} from 'lucide-react';
import { HomeHeader } from '@/components/layout/HomeHeader';

// ─── Animation Config ────────────────────────────────────────────────────────
const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.8, 
      ease: 'easeOut' as const,
      staggerChildren: 0.2
    } 
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

// ─── Components ─────────────────────────────────────────────────────────────

function SectionWrapper({ children, className = "", id = "" }: { children: React.ReactNode, className?: string, id?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.3 });

  return (
    <motion.section
      id={id}
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={sectionVariants}
      className={`min-h-screen flex flex-col items-center justify-center relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden ${className}`}
    >
      {children}
    </motion.section>
  );
}

export default function HomePage() {
  const { scrollYProgress } = useScroll();
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  return (
    <div className="bg-[var(--app-bg)] text-[var(--app-text)] font-sans selection:bg-[var(--app-primary-light)] selection:text-[var(--app-primary)]">
      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1.5 z-[100] bg-gradient-to-r from-[var(--app-primary)] via-[var(--app-secondary)] to-[var(--app-primary)] origin-left"
        style={{ scaleX: scrollYProgress }}
      />

      <HomeHeader />

      <main className="relative">
        {/* Floating Decorative Elements */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <motion.div style={{ y: backgroundY }} className="absolute top-[10%] left-[5%] w-96 h-96 bg-[var(--app-primary-light)] rounded-full blur-[120px] opacity-20" />
          <motion.div style={{ y: backgroundY }} className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] bg-[var(--app-secondary)] rounded-full blur-[150px] opacity-10" />
        </div>

        {/* 1. HERO SECTION */}
        <SectionWrapper className="pt-32">
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--app-primary-light)] border border-[var(--app-primary)] text-[var(--app-primary)] text-sm font-black mb-8">
            <Sparkles className="w-4 h-4" />
            <span>AI-POWERED CAREER PLATFORM</span>
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-6xl sm:text-8xl md:text-9xl font-black text-center leading-[0.9] tracking-tighter mb-8 max-w-5xl">
            BUILD <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--app-primary)] to-[var(--app-secondary)]">IMPACT</span><br />
            NOT JUST A RESUME
          </motion.h1>

          <motion.p variants={itemVariants} className="text-xl sm:text-2xl text-center text-[var(--app-text-secondary)] max-w-2xl mb-12 leading-relaxed font-medium">
            Join 4.3M+ professionals using our neural design engine to land jobs at the world&apos;s most innovative companies.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-6 w-full max-w-md">
            <Link href="/register" className="flex-1 text-center py-5 rounded-2xl bg-[var(--app-primary)] text-white font-black text-xl shadow-2xl hover:scale-105 active:scale-95 transition-all">
              Get Started — Free
            </Link>
            <Link href="/templates" className="flex-1 text-center py-5 rounded-2xl bg-[var(--app-bg-card)] border border-[var(--app-border)] font-black text-xl shadow-xl hover:bg-[var(--app-bg-gray)] transition-all">
              Templates
            </Link>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-20 flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-40 grayscale">
            {['Google', 'Netflix', 'Tesla', 'Apple', 'Meta'].map(brand => (
              <span key={brand} className="text-2xl font-black tracking-tighter">{brand}</span>
            ))}
          </motion.div>
        </SectionWrapper>

        {/* 2. HOW IT WORKS SECTION */}
        <SectionWrapper className="bg-[var(--app-bg-gray)]/50">
          <motion.div variants={itemVariants} className="text-center mb-20">
            <h2 className="text-5xl sm:text-7xl font-black mb-6">Simple As <span className="text-[var(--app-primary)]">1-2-3</span></h2>
            <p className="text-xl text-[var(--app-text-secondary)]">Your path to a professional career, streamlined.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl w-full">
            {[
              { icon: MessageSquare, title: "Input Content", desc: "Type your info or import from LinkedIn. Our AI handles the phrasing." },
              { icon: Layout, title: "Pick a Masterpiece", desc: "Select from 200+ industry-tested templates that recruiters love." },
              { icon: Rocket, title: "Apply Instantly", desc: "Export pixel-perfect PDFs or share your live resume link." }
            ].map((step, i) => (
              <motion.div key={i} variants={itemVariants} className="p-10 app-card group">
                <div className="w-20 h-20 rounded-[2rem] bg-[var(--app-primary-light)] flex items-center justify-center mb-8 group-hover:bg-[var(--app-primary)] transition-colors duration-500">
                  <step.icon className="w-10 h-10 text-[var(--app-primary)] group-hover:text-white" />
                </div>
                <div className="text-xs font-black text-[var(--app-primary)] uppercase tracking-widest mb-4">Step 0{i+1}</div>
                <h3 className="text-3xl font-black mb-4">{step.title}</h3>
                <p className="text-[var(--app-text-secondary)] font-medium leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </SectionWrapper>

        {/* 3. AI ENGINE SECTION */}
        <SectionWrapper>
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-7xl w-full">
            <motion.div variants={itemVariants} className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-[var(--app-primary)] to-[var(--app-secondary)] rounded-[4rem] blur-2xl opacity-20" />
              <div className="relative app-card p-8 !rounded-[3rem]">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white">
                    <Cpu className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-black">Neural Content Assistant</h4>
                    <p className="text-xs text-[var(--app-text-muted)]">Powered by Gemini Pro</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-[var(--app-bg-gray)] border-l-4 border-blue-500 italic">
                    &quot;I managed a team of developers...&quot;
                  </div>
                  <motion.div 
                    animate={{ x: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="flex justify-center"
                  >
                    <ArrowRight className="text-[var(--app-primary)]" />
                  </motion.div>
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border-l-4 border-emerald-500 font-bold">
                    &quot;Spearheaded a cross-functional engineering team of 12, increasing sprint velocity by 40%...&quot;
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <h2 className="text-5xl sm:text-7xl font-black mb-8 leading-tight">Write Like a <span className="text-blue-500">Pro</span> with AI</h2>
              <p className="text-xl text-[var(--app-text-secondary)] mb-10 leading-relaxed">
                Struggling with bullet points? Our AI understands your industry and suggests powerful, action-oriented descriptions that pass ATS filters.
              </p>
              <ul className="space-y-6">
                {['Smart Action Verbs', 'Context-Aware Summaries', 'Industry Keyword Injection'].map(item => (
                  <li key={item} className="flex items-center gap-4 text-xl font-bold">
                    <div className="p-2 rounded-full bg-emerald-500 text-white"><Check className="w-5 h-5" /></div>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </SectionWrapper>

        {/* 4. TEMPLATE SHOWCASE */}
        <SectionWrapper className="bg-black text-white">
          <motion.div variants={itemVariants} className="text-center mb-20">
            <h2 className="text-5xl sm:text-7xl font-black mb-6">Built for <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">Winning</span></h2>
            <p className="text-xl text-gray-400">200+ battle-tested templates for every industry.</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-7xl w-full">
            {[1, 2, 3, 4].map(i => (
              <motion.div 
                key={i} 
                variants={itemVariants}
                whileHover={{ scale: 1.05, rotate: 2 }}
                className="aspect-[3/4] rounded-3xl bg-gray-900 border border-gray-800 overflow-hidden shadow-2xl relative group"
              >
                <img 
                  src={`https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=600&fit=crop`} 
                  alt="Template" 
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-6 flex flex-col justify-end">
                  <h4 className="text-xl font-black">Modern Slate</h4>
                  <p className="text-xs text-gray-400 uppercase tracking-widest">Executive Design</p>
                </div>
              </motion.div>
            ))}
          </div>
          <motion.div variants={itemVariants} className="mt-16">
            <Link href="/templates" className="px-10 py-4 rounded-2xl bg-white text-black font-black text-xl hover:scale-105 transition-all inline-block">
              View All Templates
            </Link>
          </motion.div>
        </SectionWrapper>

        {/* 5. DESIGN ENGINE */}
        <SectionWrapper>
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-7xl w-full">
            <motion.div variants={itemVariants} className="order-2 lg:order-1">
              <h2 className="text-5xl sm:text-7xl font-black mb-8 leading-tight">Your Design, <span className="text-[var(--app-primary)]">Infinite</span> Control</h2>
              <p className="text-xl text-[var(--app-text-secondary)] mb-10 leading-relaxed">
                Change fonts, adjust spacing, reorder sections, and pick custom colors. Our pixel-perfect engine ensures your resume looks stunning on any device.
              </p>
              <div className="grid grid-cols-2 gap-6">
                {[
                  { icon: Palette, text: "Custom Colors" },
                  { icon: MousePointer2, text: "Drag & Drop" },
                  { icon: Smartphone, text: "Live Preview" },
                  { icon: Bookmark, text: "Version Control" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 app-card !rounded-2xl">
                    <item.icon className="w-6 h-6 text-[var(--app-primary)]" />
                    <span className="font-bold">{item.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>
            
            <motion.div variants={itemVariants} className="order-1 lg:order-2">
               <div className="relative group">
                 <div className="absolute -inset-10 bg-[var(--app-primary-light)] rounded-full blur-[100px] opacity-20 group-hover:opacity-40 transition-opacity" />
                 <img src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=600&fit=crop" className="relative rounded-[3rem] shadow-2xl border border-[var(--app-border)]" alt="Interface" />
               </div>
            </motion.div>
          </div>
        </SectionWrapper>

        {/* 6. ATS OPTIMIZATION */}
        <SectionWrapper className="bg-[var(--app-primary)] text-white">
          <div className="max-w-4xl text-center">
            <motion.div variants={itemVariants} className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-10">
              <BarChart3 className="w-12 h-12" />
            </motion.div>
            <motion.h2 variants={itemVariants} className="text-5xl sm:text-8xl font-black mb-8">99% ATS SCORE</motion.h2>
            <motion.p variants={itemVariants} className="text-2xl font-medium mb-12 opacity-90">
              Don&apos;t let robots reject your dreams. Our templates are architected to be 100% readable by Applicant Tracking Systems used by 95% of Fortune 500 companies.
            </motion.p>
            <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-4">
              {['Optimized Headers', 'Standard Fonts', 'Clean Hierarchies', 'Smart Metadata'].map(tag => (
                <span key={tag} className="px-6 py-3 rounded-full bg-white/10 border border-white/20 font-black text-sm uppercase tracking-widest">
                  {tag}
                </span>
              ))}
            </motion.div>
          </div>
        </SectionWrapper>

        {/* 7. CLOUD SYNC SECTION */}
        <SectionWrapper>
          <div className="text-center mb-16">
            <motion.div variants={itemVariants} className="flex justify-center gap-6 mb-10">
              <Smartphone className="w-16 h-16 text-[var(--app-primary)]" />
              <Globe className="w-16 h-16 text-[var(--app-secondary)]" />
            </motion.div>
            <motion.h2 variants={itemVariants} className="text-5xl sm:text-7xl font-black mb-8 leading-tight">Access <span className="text-[var(--app-secondary)]">Anywhere</span>, Sync Everything</motion.h2>
            <motion.p variants={itemVariants} className="text-xl text-[var(--app-text-secondary)] max-w-2xl mx-auto mb-16 font-medium leading-relaxed">
              Start on your laptop, tweak on your phone, and download on a tablet. Your career progress is always saved and synchronized in real-time.
            </motion.p>
          </div>
          
          <motion.div variants={itemVariants} className="w-full max-w-5xl aspect-video rounded-[3rem] bg-[var(--app-bg-gray)] border border-[var(--app-border)] overflow-hidden shadow-2xl flex items-center justify-center">
             <div className="text-center">
               <Play className="w-20 h-20 text-[var(--app-primary)] mx-auto mb-4" />
               <p className="font-black uppercase tracking-widest">Watch how it syncs</p>
             </div>
          </motion.div>
        </SectionWrapper>

        {/* 8. PRIVACY & SECURITY */}
        <SectionWrapper className="bg-gray-50 dark:bg-gray-900/50">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-7xl w-full">
            <motion.div variants={itemVariants}>
               <div className="grid grid-cols-2 gap-4">
                 {[1, 2, 3, 4].map(i => (
                   <div key={i} className="aspect-square rounded-3xl bg-[var(--app-bg-card)] border border-[var(--app-border)] flex items-center justify-center">
                     <Lock className="w-12 h-12 text-[var(--app-primary)] opacity-20" />
                   </div>
                 ))}
               </div>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <div className="w-16 h-16 rounded-2xl bg-emerald-500 flex items-center justify-center mb-8 text-white">
                <Shield className="w-10 h-10" />
              </div>
              <h2 className="text-5xl sm:text-7xl font-black mb-8 leading-tight">Your Data is <span className="text-emerald-500">Private</span></h2>
              <p className="text-xl text-[var(--app-text-secondary)] mb-10 leading-relaxed font-medium">
                We don&apos;t sell your data to recruiters or third parties. Your personal information is encrypted and only accessible by you. Your privacy is our core value.
              </p>
              <div className="flex items-center gap-4 text-[var(--app-text)] font-black uppercase tracking-widest">
                <Globe className="w-5 h-5 text-emerald-500" />
                GDPR & CCPA COMPLIANT
              </div>
            </motion.div>
          </div>
        </SectionWrapper>

        {/* 9. TESTIMONIALS */}
        <SectionWrapper className="bg-[var(--app-bg)] relative">
          <motion.div variants={itemVariants} className="text-center mb-20">
            <h2 className="text-5xl sm:text-7xl font-black mb-6">4.3M+ <span className="text-[var(--app-secondary)]">Wins</span></h2>
            <p className="text-xl text-[var(--app-text-secondary)]">Real success stories from our global community.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-7xl w-full">
            {[
              { name: "Alex Rivera", role: "Product Manager at Airbnb", text: "The AI suggestions were a game changer. I doubled my response rate in just one week." },
              { name: "Jordan Smith", role: "UX Designer at Spotify", text: "Finally, a resume builder that actually cares about design. The templates are gorgeous." },
              { name: "Sarah Chen", role: "Software Lead at Stripe", text: "Pixel-perfect PDF export that works every time. No more formatting nightmares." }
            ].map((t, i) => (
              <motion.div key={i} variants={itemVariants} className="p-10 rounded-[3rem] bg-[var(--app-bg-card)] border border-[var(--app-border)] shadow-xl relative group">
                <Quote className="w-10 h-10 text-[var(--app-primary-light)] mb-6 opacity-40 group-hover:scale-125 transition-transform" />
                <p className="text-xl font-medium italic mb-10 leading-relaxed">&quot;{t.text}&quot;</p>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[var(--app-primary)] to-[var(--app-secondary)]" />
                  <div>
                    <h5 className="font-black">{t.name}</h5>
                    <p className="text-xs text-[var(--app-text-muted)] uppercase font-bold tracking-widest">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </SectionWrapper>

        {/* 10. FINAL CTA */}
        <SectionWrapper className="bg-[var(--app-bg)] pb-40">
           <div className="relative w-full max-w-5xl rounded-[4rem] bg-gradient-to-br from-[var(--app-primary)] via-[var(--app-secondary)] to-[var(--app-primary)] p-12 sm:p-24 text-center overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" />
              <motion.div 
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -top-1/2 -left-1/4 w-full h-full bg-white/10 rounded-full blur-[100px]" 
              />
              
              <div className="relative z-10">
                <motion.h2 variants={itemVariants} className="text-5xl sm:text-8xl font-black text-white mb-8 leading-[0.9] tracking-tighter">
                  READY TO LAND<br />YOUR DREAM JOB?
                </motion.h2>
                <motion.p variants={itemVariants} className="text-xl sm:text-2xl text-white/90 mb-16 font-medium max-w-2xl mx-auto">
                  Stop settling for mediocre resumes. Start your professional journey with the world&apos;s most powerful career platform.
                </motion.p>
                <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-6">
                  <Link href="/register" className="px-12 py-6 rounded-[2rem] bg-white text-[var(--app-primary)] font-black text-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all w-full sm:w-auto">
                    Build My Resume
                  </Link>
                  <Link href="/login" className="px-12 py-6 rounded-[2rem] bg-white/10 border border-white/20 text-white font-black text-2xl backdrop-blur-md hover:bg-white/20 transition-all w-full sm:w-auto">
                    Sign In
                  </Link>
                </motion.div>
              </div>
           </div>
        </SectionWrapper>
      </main>

      {/* FOOTER */}
      <footer className="bg-black text-white py-24 px-4 sm:px-6 lg:px-8 border-t border-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-16 mb-20">
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-[var(--app-primary)] to-[var(--app-secondary)] flex items-center justify-center">
                  <FileText className="text-white w-6 h-6" />
                </div>
                <span className="text-3xl font-black tracking-tighter">FlowCV</span>
              </div>
              <p className="text-gray-400 font-medium leading-relaxed">The next generation career platform for the modern workforce.</p>
            </div>
            {['Product', 'Company', 'Support', 'Legal'].map(group => (
              <div key={group}>
                <h5 className="text-xs font-black uppercase tracking-widest mb-8 text-gray-500">{group}</h5>
                <ul className="space-y-4 font-bold text-gray-400">
                  <li><Link href="#" className="hover:text-white transition-colors">Resume Builder</Link></li>
                  <li><Link href="#" className="hover:text-white transition-colors">Templates</Link></li>
                  <li><Link href="#" className="hover:text-white transition-colors">Cover Letters</Link></li>
                  <li><Link href="#" className="hover:text-white transition-colors">AI Writing</Link></li>
                </ul>
              </div>
            ))}
          </div>
          <div className="pt-12 border-t border-gray-900 flex flex-col md:flex-row justify-between items-center gap-8 text-gray-500 font-bold">
            <p>© {new Date().getFullYear()} FlowCV. Built with ❤️ for the future of work.</p>
            <div className="flex gap-8">
              <Link href="#" className="hover:text-white transition-colors">Twitter</Link>
              <Link href="#" className="hover:text-white transition-colors">LinkedIn</Link>
              <Link href="#" className="hover:text-white transition-colors">Instagram</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

