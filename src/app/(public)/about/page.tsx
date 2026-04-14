import { CommonHeader, Footer } from '@/components/layout';
import Link from 'next/link';
import { FileText, Heart, Users, Star } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <CommonHeader />
      
      <main>
        <section className="bg-gray-50 py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold text-gray-900 text-center mb-8">
              About FlowCV
            </h1>
            <div className="prose prose-lg mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
                Why We Created FlowCV
              </h2>
              <p className="text-gray-600">
                Writing a resume shouldn&apos;t be frustrating. Yet most people still use Word or Google Docs, 
                losing hours to formatting issues and design struggles. Meanwhile, free apps and AI have made 
                many everyday tasks easier — so why is resume creation still stuck in the past?
              </p>
              <p className="text-gray-600 mt-4">
                That&apos;s why we built <strong>FlowCV — a free, easy-to-use online resume builder</strong>.
                Our goal: to create a fast, intuitive tool that&apos;s actually enjoyable to use. 
                You focus on the content — we handle structure, layout, and design.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">
                Built by a Small, Independent Team
              </h2>
              <p className="text-gray-600">
                We&apos;re not backed by investors or driven by maximizing returns. We&apos;re a small, 
                quality-oriented team with a user-first approach, committed to building the 
                <strong> best truly free resume builder</strong>, for everyone, everywhere.
              </p>
              <ul className="list-disc list-inside text-gray-600 mt-4 space-y-2">
                <li>No paywalls, no watermarks, no surprises when downloading your resume</li>
                <li>Your first resume is free forever, with full access to all design features</li>
                <li>You only pay if you want to manage multiple versions or unlock advanced AI features</li>
              </ul>
              <p className="text-gray-600 mt-4">
                We built FlowCV to support your career success — not to maximize profit.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">
                Why FlowCV Is Different
              </h2>
              <p className="text-gray-600">
                Unlike multi-purpose design tools like Canva, Word, or Adobe, FlowCV is built 
                <strong> specifically for resume creation</strong> — not for presentations, posters, 
                or marketing assets. That means:
              </p>
              <ul className="list-disc list-inside text-gray-600 mt-4 space-y-2">
                <li>Structured guidance so you know what to write</li>
                <li>Templates that follow recruiter best practices</li>
                <li>Full design control without sacrificing readability</li>
                <li>No design or tech skills required</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20" style={{ backgroundColor: 'var(--app-primary)' }}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
              <div>
                <div className="text-4xl font-bold">4.3M+</div>
                <div className="text-blue-100 mt-2">Users Worldwide</div>
              </div>
              <div>
                <div className="text-4xl font-bold">50+</div>
                <div className="text-blue-100 mt-2">Templates</div>
              </div>
              <div>
                <div className="text-4xl font-bold">4.9/5</div>
                <div className="text-blue-100 mt-2">User Rating</div>
              </div>
              <div>
                <div className="text-4xl font-bold">100%</div>
                <div className="text-blue-100 mt-2">Free First Resume</div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              Our Values
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-4">
                  <Heart className="h-8 w-8 text-red-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">User-First</h3>
                <p className="mt-2 text-gray-600">Everything we build starts with your needs.</p>
              </div>
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
                  <Users className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Community</h3>
                <p className="mt-2 text-gray-600">Built with feedback from job seekers worldwide.</p>
              </div>
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 mb-4">
                  <Star className="h-8 w-8 text-yellow-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Quality</h3>
                <p className="mt-2 text-gray-600">Small team, high standards, constant improvement.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gray-50 py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900">Let&apos;s Get Started</h2>
            <p className="mt-4 text-lg text-gray-600">
              We&apos;re here to help you land your next job with less stress and more confidence.
            </p>
            <Link href="/register" className="mt-8 btn-primary inline-flex">
              Start Building Your Resume
            </Link>
            <p className="mt-4 text-sm text-gray-500">
              It&apos;s free, fast, and yours to keep.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
