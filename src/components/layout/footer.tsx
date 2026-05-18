import Link from 'next/link';
import { FileText, Github, Twitter, Linkedin, Instagram, Mail, Globe } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer 
      className="border-t transition-colors duration-300 py-20 px-4 sm:px-6 lg:px-8" 
      style={{ backgroundColor: 'var(--app-bg)', borderColor: 'var(--app-border)' }}
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand & Mission */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div 
                className="flex h-10 w-10 items-center justify-center rounded-xl shadow-lg shadow-[var(--app-primary-light)]" 
                style={{ backgroundColor: 'var(--app-primary)' }}
              >
                <FileText className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tight" style={{ color: 'var(--app-text)' }}>
                FlowCV
              </span>
            </div>
            <p className="text-base leading-relaxed font-medium" style={{ color: 'var(--app-text-secondary)' }}>
              Empowering 4.3M+ professionals to land their dream jobs with high-fidelity, AI-powered design tools. Your career journey, elevated.
            </p>
            <div className="flex items-center gap-4">
               {[
                 { icon: Twitter, href: '#' },
                 { icon: Linkedin, href: '#' },
                 { icon: Instagram, href: '#' },
                 { icon: Github, href: '#' }
               ].map((social, i) => (
                 <a 
                   key={i}
                   href={social.href}
                   className="p-2 rounded-lg transition-all duration-300 hover:scale-110 hover:bg-[var(--app-primary-light)]"
                   style={{ color: 'var(--app-text-muted)' }}
                 >
                   <social.icon className="w-5 h-5" />
                 </a>
               ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest mb-8" style={{ color: 'var(--app-text)' }}>
              Product
            </h3>
            <ul className="space-y-4">
              {[
                ['Resume Builder', '/dashboard'],
                ['Templates', '/templates'],
                ['Cover Letters', '/cover-letter-builder'],
                ['Pricing', '/pricing'],
                ['AI Assistant', '#']
              ].map(([name, href]) => (
                <li key={name}>
                  <Link 
                    href={href} 
                    className="text-base font-bold transition-colors duration-200 hover:opacity-80"
                    style={{ color: 'var(--app-text-secondary)' }}
                  >
                    {name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest mb-8" style={{ color: 'var(--app-text)' }}>
              Company
            </h3>
            <ul className="space-y-4">
              {[
                ['About Us', '/about'],
                ['Careers', '#'],
                ['Partners', '/partners'],
                ['Success Stories', '#'],
                ['Contact', '#']
              ].map(([name, href]) => (
                <li key={name}>
                  <Link 
                    href={href} 
                    className="text-base font-bold transition-colors duration-200 hover:opacity-80"
                    style={{ color: 'var(--app-text-secondary)' }}
                  >
                    {name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter / Status */}
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest mb-8" style={{ color: 'var(--app-text)' }}>
              Stay Connected
            </h3>
            <p className="text-sm font-medium mb-6" style={{ color: 'var(--app-text-secondary)' }}>
              Join our newsletter for weekly career tips and template updates.
            </p>
            <div className="relative group">
               <input 
                 type="email" 
                 placeholder="Enter your email"
                 className="w-full px-5 py-3 rounded-xl text-sm font-bold transition-all focus:outline-none border"
                 style={{ 
                   backgroundColor: 'var(--app-bg-gray)',
                   borderColor: 'var(--app-border)',
                   color: 'var(--app-text)'
                 }}
               />
               <button 
                 className="absolute right-2 top-2 p-1.5 rounded-lg text-white transition-all hover:scale-105"
                 style={{ backgroundColor: 'var(--app-primary)' }}
               >
                 <ArrowRight className="w-4 h-4" />
               </button>
            </div>
            
            <div className="mt-8 flex items-center gap-3 text-xs font-black uppercase tracking-widest p-3 rounded-xl border border-dashed" style={{ borderColor: 'var(--app-border)', color: 'var(--app-text-muted)' }}>
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
               System Status: Operational
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div 
          className="pt-10 border-t flex flex-col md:flex-row justify-between items-center gap-6"
          style={{ borderColor: 'var(--app-border)' }}
        >
          <div className="flex flex-wrap justify-center gap-6 text-sm font-bold" style={{ color: 'var(--app-text-muted)' }}>
            <span>© {currentYear} FlowCV. All rights reserved.</span>
            <Link href="/terms-of-service" className="hover:text-[var(--app-text)] transition-colors">Terms</Link>
            <Link href="/privacy-policy" className="hover:text-[var(--app-text)] transition-colors">Privacy</Link>
            <Link href="/cookies" className="hover:text-[var(--app-text)] transition-colors">Cookies</Link>
          </div>
          
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2 text-sm font-black" style={{ color: 'var(--app-text-secondary)' }}>
                <Globe className="w-4 h-4" />
                <span>English (US)</span>
             </div>
             <div className="flex items-center gap-2 text-sm font-black" style={{ color: 'var(--app-text-secondary)' }}>
                <div className="w-8 h-5 rounded bg-blue-600 flex items-center justify-center text-[10px] text-white">PRO</div>
                <span>Secured</span>
             </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

import { ArrowRight } from 'lucide-react';

