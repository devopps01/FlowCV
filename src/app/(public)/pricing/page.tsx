'use client';

import { PricingHeader, Footer } from '@/components/layout';
import Link from 'next/link';
import { Check, Star, Zap, Shield, Rocket, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

const plans = [
  {
    name: 'Free',
    price: 0,
    period: 'forever',
    description: 'Perfect for creating your first professional resume',
    features: [
      '1 Resume',
      '1 Cover Letter',
      '50+ Templates',
      'Unlimited PDF Downloads',
      'No Watermarks',
      'Basic Design Customization',
    ],
    cta: 'Get Started',
    popular: false,
    icon: Rocket,
  },
  {
    name: 'Pro',
    price: 9,
    period: '/month',
    description: 'For professionals who need multiple resume versions',
    features: [
      'Unlimited Resumes',
      'Unlimited Cover Letters',
      'All Templates',
      'Unlimited PDF Downloads',
      'No Watermarks',
      'Advanced Design Customization',
      'Multiple Design Versions',
      'AI Writing Assistance',
      'Priority Support',
    ],
    cta: 'Start Pro Trial',
    popular: true,
    icon: Zap,
  },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

export default function PricingPage() {
  return (
    <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: 'var(--app-bg)', color: 'var(--app-text)' }}>
      <PricingHeader />
      
      <main className="relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[var(--app-primary-light)] rounded-full blur-[120px] -z-10 opacity-30" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[var(--app-secondary)] rounded-full blur-[120px] -z-10 opacity-10" />

        <section className="py-24 text-center">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--app-primary-light)] border border-[var(--app-primary)] text-[var(--app-primary)] text-sm font-bold mb-6">
                <Star className="w-4 h-4 fill-current" />
                <span>Flexible Plans for Everyone</span>
              </motion.div>
              
              <motion.h1 variants={fadeInUp} className="text-4xl sm:text-6xl font-black mb-6 tracking-tight">
                Simple, <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--app-primary)] to-[var(--app-secondary)]">Transparent</span> Pricing
              </motion.h1>
              
              <motion.p variants={fadeInUp} className="text-lg sm:text-xl text-[var(--app-text-secondary)] max-w-2xl mx-auto leading-relaxed">
                Start for free and upgrade as you grow. No hidden costs, just professional tools to land your dream job.
              </motion.p>
            </motion.div>
          </div>
        </section>

        <section className="pb-32 px-4">
          <div className="mx-auto max-w-6xl">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid md:grid-cols-2 gap-8 lg:gap-12"
            >
              {plans.map((plan) => {
                const Icon = plan.icon;
                return (
                  <motion.div
                    key={plan.name}
                    variants={fadeInUp}
                    className={`relative flex flex-col p-8 sm:p-10 rounded-[2.5rem] border transition-all duration-500 group ${
                      plan.popular
                        ? 'shadow-2xl scale-105 z-10'
                        : 'shadow-sm hover:shadow-xl'
                    }`}
                    style={{ 
                      backgroundColor: 'var(--app-bg-card)', 
                      borderColor: plan.popular ? 'var(--app-primary)' : 'var(--app-border)',
                      boxShadow: plan.popular ? '0 20px 50px -12px var(--app-primary-light)' : 'var(--app-shadow-md)'
                    }}
                  >
                    {plan.popular && (
                      <div className="absolute -top-5 left-1/2 -translate-x-1/2">
                        <span className="inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-black text-white shadow-lg bg-gradient-to-r from-[var(--app-primary)] to-[var(--app-secondary)]">
                          <Star className="h-4 w-4" />
                          Most Popular
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between items-start mb-8">
                      <div>
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:rotate-6 duration-300 ${plan.popular ? 'bg-gradient-to-br from-[var(--app-primary)] to-[var(--app-secondary)] text-white' : 'bg-[var(--app-bg-gray)] text-[var(--app-primary)]'}`}>
                          <Icon className="w-7 h-7" />
                        </div>
                        <h3 className="text-3xl font-black mb-2">{plan.name}</h3>
                        <p className="text-[var(--app-text-secondary)] font-medium leading-snug">{plan.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-baseline justify-end gap-1">
                          <span className="text-5xl font-black">${plan.price}</span>
                          <span className="text-[var(--app-text-secondary)] font-bold text-sm">{plan.period}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="text-xs font-black uppercase tracking-widest text-[var(--app-text-muted)] mb-6">What&apos;s Included</div>
                      <ul className="space-y-4 mb-10">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-4">
                            <div className="mt-1 rounded-full p-0.5 bg-emerald-500/10 dark:bg-emerald-500/20">
                              <Check className="h-4 w-4 text-emerald-500" />
                            </div>
                            <span className="text-[var(--app-text-secondary)] font-medium">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Link
                      href="/register"
                      className={`block w-full text-center rounded-2xl py-4 text-lg font-black transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] ${
                        plan.popular
                          ? 'text-white shadow-lg hover:shadow-[var(--app-primary-light)]'
                          : 'bg-[var(--app-bg-gray)] hover:bg-[var(--app-border)]'
                      }`}
                      style={plan.popular ? { background: 'linear-gradient(135deg, var(--app-primary), var(--app-secondary))' } : { color: 'var(--app-text)' }}
                    >
                      {plan.cta}
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-32 px-4 border-t" style={{ borderColor: 'var(--app-border)', backgroundColor: 'var(--app-bg-gray)' }}>
          <div className="mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-black mb-4">Frequently Asked Questions</h2>
              <p className="text-[var(--app-text-secondary)]">Everything you need to know about our pricing and plans.</p>
            </motion.div>
            
            <div className="grid sm:grid-cols-2 gap-8 lg:gap-12">
              {[
                {
                  q: 'Is FlowCV really free?',
                  a: 'Yes! Your first resume is 100% free forever. You get unlimited PDF downloads with no watermarks, access to all basic templates, and full design customization.',
                },
                {
                  q: 'What happens if I upgrade?',
                  a: "Upgrading unlocks unlimited resumes, cover letters, premium templates, and our AI writing engine to help you build content faster.",
                },
                {
                  q: 'Can I cancel my subscription?',
                  a: 'Absolutely. You can cancel at any time from your settings. Your resumes will remain accessible, though pro features will be locked.',
                },
                {
                  q: 'Do you offer support?',
                  a: "Yes! All users have access to our help center. Pro users get priority email support with a response time typically under 12 hours.",
                },
              ].map((faq, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="bg-[var(--app-bg-card)] p-8 rounded-3xl border border-[var(--app-border)]"
                >
                  <h3 className="text-xl font-bold mb-3">{faq.q}</h3>
                  <p className="text-[var(--app-text-secondary)] leading-relaxed">{faq.a}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Trusted By Section */}
        <section className="py-24 px-4 text-center overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <p className="text-sm font-black uppercase tracking-widest text-[var(--app-text-muted)] mb-12">Trusted by professionals at</p>
            <div className="flex flex-wrap justify-center items-center gap-10 md:gap-20 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
               <span className="text-2xl font-black">Google</span>
               <span className="text-2xl font-black">Microsoft</span>
               <span className="text-2xl font-black">Amazon</span>
               <span className="text-2xl font-black">Netflix</span>
               <span className="text-2xl font-black">Apple</span>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
