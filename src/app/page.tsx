'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  FileText, Sparkles, ArrowRight, Star, Users, Trophy,
  Download, Shield, Zap, Globe, Eye, Check, Brain, Award,
  ChevronRight, Play, Briefcase, GraduationCap, Palette,
} from 'lucide-react';
import { HomeHeader } from '@/components/layout/HomeHeader';

// ─── Intersection Observer hook for scroll animations ────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

// ─── Animated section wrapper ────────────────────────────────────────────────
function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ─── Data ────────────────────────────────────────────────────────────────────
const STATS = [
  { value: '4.3M+', label: 'Happy Users', icon: Users },
  { value: '200+', label: 'Templates', icon: FileText },
  { value: '99.9%', label: 'Uptime', icon: Trophy },
  { value: '4.9★', label: 'Avg Rating', icon: Star },
];

const FEATURES = [
  { icon: Sparkles, title: 'AI-Powered Writing', desc: 'Gemini AI suggests bullet points, summaries, and improvements tailored to your role.' },
  { icon: Palette, title: '200+ Templates', desc: 'Industry-tested designs that pass ATS systems and impress hiring managers.' },
  { icon: Download, title: 'Unlimited PDF Export', desc: 'High-quality PDF downloads with no watermarks, no limits, no hidden fees.' },
  { icon: Shield, title: 'Privacy First', desc: 'Your data is yours. We never sell or share your personal information.' },
  { icon: Zap, title: 'Real-Time Preview', desc: 'See every change instantly on a pixel-perfect A4 preview as you type.' },
  { icon: Globe, title: 'Multi-Language', desc: 'Create resumes in any language to apply for jobs anywhere in the world.' },
];

const STEPS = [
  { icon: FileText, step: '01', title: 'Add Your Info', desc: 'Fill in your details with smart form guidance. Import from LinkedIn or upload an existing resume.' },
  { icon: Palette, step: '02', title: 'Pick a Design', desc: 'Choose from 200+ templates. Customize colors, fonts, layout, and spacing to match your style.' },
  { icon: Download, step: '03', title: 'Download & Apply', desc: 'Export a pixel-perfect PDF and share your resume link directly with recruiters.' },
];

const TESTIMONIALS = [
  { name: 'Sarah Johnson', role: 'Software Engineer at Google', img: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop&crop=face', quote: 'FlowCV helped me create a resume that stood out. I landed my dream job at Google within 2 weeks!' },
  { name: 'Michael Chen', role: 'Marketing Manager at Microsoft', img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face', quote: 'The AI suggestions helped me highlight my achievements perfectly. I got multiple offers!' },
  { name: 'Emily Davis', role: 'Product Designer at Apple', img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face', quote: 'Beautiful templates and easy customization. My resume looks incredibly professional now.' },
];

const TIPS = [
  { icon: Brain, title: 'Tailor Each Application', tip: 'Use keywords from the job description to pass ATS filters.' },
  { icon: Award, title: 'Quantify Achievements', tip: '"Increased sales by 30%" beats "Improved sales" every time.' },
  { icon: Shield, title: 'Keep It Concise', tip: 'Recruiters spend ~7 seconds per resume. One page is ideal.' },
  { icon: Zap, title: 'Use Action Verbs', tip: 'Start bullets with Led, Built, Launched, Optimized, Delivered.' },
];

// ─── Page ────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const [docHeight, setDocHeight] = useState(1);
  useEffect(() => {
    const update = () => setDocHeight(document.documentElement.scrollHeight - window.innerHeight || 1);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  const scrollProgress = Math.min(100, (scrollY / docHeight) * 100);

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">
      {/* Scroll progress bar */}
      <div className="fixed top-0 left-0 z-[60] h-0.5 bg-gradient-to-r from-[#41017d] to-[#ee14ff] transition-all duration-100" style={{ width: `${scrollProgress}%` }} />

      <HomeHeader />

      <main>
        {/* ── Hero ── */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#f8f0ff] via-white to-[#fdf0ff]">
          {/* Decorative blobs */}
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-[#41017d]/10 blur-3xl animate-float pointer-events-none" />
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-[#ee14ff]/10 blur-3xl animate-float pointer-events-none" style={{ animationDelay: '2s' }} />

          <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-24">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#41017d]/10 border border-[#41017d]/20 text-[#41017d] text-sm font-semibold mb-8">
              <Sparkles className="w-4 h-4" />
              AI-Powered Resume Builder — Free Forever
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black leading-tight mb-6 tracking-tight">
              Build Your{' '}
              <span className="gradient-text animate-gradient">Dream Resume</span>
              <br />in Minutes
            </h1>

            <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
              Join 4.3 million professionals who landed their dream jobs with our AI-powered resume builder. No credit card. No watermarks. Free forever.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link href="/register" className="btn-primary text-white px-8 py-4 text-base rounded-xl">
                Start Building Free
                <ArrowRight className="inline-block ml-2 w-5 h-5" />
              </Link>
              <Link href="/templates" className="btn-ghost px-8 py-4 text-base rounded-xl">
                <Eye className="inline-block mr-2 w-5 h-5" />
                Browse Templates
              </Link>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
              {STATS.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={i} className="glass-card p-4 text-center hover-lift">
                    <Icon className="w-5 h-5 mx-auto mb-1 text-[#41017d]" />
                    <div className="text-2xl font-black gradient-text">{s.value}</div>
                    <div className="text-xs text-gray-500 font-medium">{s.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── How It Works ── */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[#f8fafc]">
          <div className="max-w-6xl mx-auto">
            <FadeIn className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">How It Works</h2>
              <p className="text-lg text-gray-500 max-w-xl mx-auto">Create a professional resume in three simple steps</p>
            </FadeIn>

            <div className="grid md:grid-cols-3 gap-8 relative">
              {/* Connector line */}
              <div className="hidden md:block absolute top-12 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-[#41017d]/30 to-[#ee14ff]/30" />

              {STEPS.map((step, i) => {
                const Icon = step.icon;
                return (
                  <FadeIn key={i} delay={i * 150} className="relative">
                    <div className="glass-card p-8 text-center hover-lift h-full">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#41017d] to-[#ee14ff] flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="text-xs font-black text-[#41017d] uppercase tracking-widest mb-2">{step.step}</div>
                      <h3 className="text-xl font-black text-gray-900 mb-3">{step.title}</h3>
                      <p className="text-gray-500 leading-relaxed text-sm">{step.desc}</p>
                    </div>
                  </FadeIn>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-6xl mx-auto">
            <FadeIn className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">Everything You Need</h2>
              <p className="text-lg text-gray-500 max-w-xl mx-auto">Powerful tools to create a resume that gets you hired</p>
            </FadeIn>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {FEATURES.map((f, i) => {
                const Icon = f.icon;
                return (
                  <FadeIn key={i} delay={i * 80}>
                    <div className="group p-6 rounded-2xl border border-gray-100 hover:border-[#41017d]/30 hover:shadow-xl transition-all duration-300 bg-white hover:-translate-y-1 h-full">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#41017d]/10 to-[#ee14ff]/10 flex items-center justify-center mb-4 group-hover:from-[#41017d] group-hover:to-[#ee14ff] transition-all duration-300">
                        <Icon className="w-6 h-6 text-[#41017d] group-hover:text-white transition-colors duration-300" />
                      </div>
                      <h3 className="text-lg font-black text-gray-900 mb-2">{f.title}</h3>
                      <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                    </div>
                  </FadeIn>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Testimonials ── */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#f8f0ff] to-white">
          <div className="max-w-6xl mx-auto">
            <FadeIn className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">Success Stories</h2>
              <p className="text-lg text-gray-500 max-w-xl mx-auto">Thousands of professionals landed their dream jobs with FlowCV</p>
            </FadeIn>

            <div className="grid md:grid-cols-3 gap-6">
              {TESTIMONIALS.map((t, i) => (
                <FadeIn key={i} delay={i * 120}>
                  <div className="glass-card p-6 hover-lift h-full flex flex-col">
                    <div className="flex items-center gap-3 mb-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={t.img} alt={t.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-[#41017d]/20" />
                      <div>
                        <div className="font-black text-gray-900 text-sm">{t.name}</div>
                        <div className="text-xs text-gray-500">{t.role}</div>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed italic flex-1">&ldquo;{t.quote}&rdquo;</p>
                    <div className="flex gap-0.5 mt-4">
                      {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ── Resume Tips ── */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-6xl mx-auto">
            <FadeIn className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">Expert Resume Tips</h2>
              <p className="text-lg text-gray-500 max-w-xl mx-auto">Professional advice to make your resume stand out</p>
            </FadeIn>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {TIPS.map((tip, i) => {
                const Icon = tip.icon;
                return (
                  <FadeIn key={i} delay={i * 100}>
                    <div className="text-center p-6 rounded-2xl border border-gray-100 hover:border-[#41017d]/30 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white h-full">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#41017d] to-[#ee14ff] flex items-center justify-center mx-auto mb-4 shadow-md">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-black text-gray-900 mb-2">{tip.title}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed">{tip.tip}</p>
                    </div>
                  </FadeIn>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[#41017d] to-[#ee14ff]">
          <FadeIn className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Ready to Land Your Dream Job?</h2>
            <p className="text-lg text-white/80 mb-10">Join millions of professionals who built their careers with FlowCV. It&apos;s free, always.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#41017d] rounded-xl font-black text-base hover:bg-gray-50 transition-all hover:scale-105 shadow-xl">
                Start Free Today
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/login" className="inline-flex items-center gap-2 px-8 py-4 border-2 border-white/40 text-white rounded-xl font-bold text-base hover:bg-white/10 transition-all">
                Sign In
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </FadeIn>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="bg-gray-950 text-gray-400 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#41017d] to-[#ee14ff] flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-black text-white">FlowCV</span>
              </div>
              <p className="text-sm leading-relaxed">The world&apos;s most advanced free resume builder.</p>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-white font-black text-sm uppercase tracking-widest mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                {[['Resume Builder', '/dashboard'], ['Templates', '/templates'], ['Cover Letters', '/cover-letters'], ['AI Generator', '/ai-resume-generator']].map(([label, href]) => (
                  <li key={label}><Link href={href} className="hover:text-white transition-colors">{label}</Link></li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-white font-black text-sm uppercase tracking-widest mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                {[['About', '/about'], ['Pricing', '/pricing'], ['Blog', '#'], ['Careers', '#']].map(([label, href]) => (
                  <li key={label}><Link href={href} className="hover:text-white transition-colors">{label}</Link></li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-white font-black text-sm uppercase tracking-widest mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                {[['Privacy Policy', '/privacy-policy'], ['Terms of Service', '/terms-of-service'], ['Help Center', '#'], ['Contact', '#']].map(([label, href]) => (
                  <li key={label}><Link href={href} className="hover:text-white transition-colors">{label}</Link></li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm">© {new Date().getFullYear()} FlowCV. All rights reserved.</p>
            <div className="flex items-center gap-2 text-sm">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              All systems operational
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
