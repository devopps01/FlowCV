import Link from 'next/link';
import { FileText, Github, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: 'var(--app-primary)' }}>
                <FileText className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">FlowCV</span>
            </div>
            <p className="text-sm text-gray-500">
              Empower job seekers worldwide. We are here to make your journey smoother, more enjoyable and ultimately more successful.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/templates" className="text-sm text-gray-500 hover:text-gray-900">
                  Resume Templates
                </Link>
              </li>
              <li>
                <Link href="/cover-letter-builder" className="text-sm text-gray-500 hover:text-gray-900">
                  Cover Letter Builder
                </Link>
              </li>
              <li>
                <Link href="/job-tracker" className="text-sm text-gray-500 hover:text-gray-900">
                  Job Tracker
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-sm text-gray-500 hover:text-gray-900">
                  About
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-sm text-gray-500 hover:text-gray-900">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/partners" className="text-sm text-gray-500 hover:text-gray-900">
                  Partners
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/terms-of-service" className="text-sm text-gray-500 hover:text-gray-900">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="text-sm text-gray-500 hover:text-gray-900">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between border-t pt-8 md:flex-row">
          <p className="text-sm text-gray-500">
            © 2026 FlowCV. Built with care for job seekers everywhere.
          </p>
          <div className="mt-4 flex gap-4 md:mt-0">
            <a
              href="https://twitter.com/flowcv"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-600"
            >
              <Twitter className="h-5 w-5" />
            </a>
            <a
              href="https://github.com/flowcv"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-600"
            >
              <Github className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
