import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'FlowCV - Free Online Resume Builder',
  description: 'Build a job-winning resume for free. Your first resume is 100% free forever. Unlimited downloads. No hidden fees.',
  keywords: 'resume builder, free resume, CV maker, resume templates, professional resume',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`scroll-smooth ${inter.variable}`}>
      <head>
        {/* Prevent dark mode flash */}
        <script dangerouslySetInnerHTML={{ __html: `
          try {
            var m = localStorage.getItem('theme-mode');
            var dark = m === 'dark' || (!m && window.matchMedia('(prefers-color-scheme: dark)').matches);
            if (dark) { document.documentElement.classList.add('dark'); document.body && document.body.classList.add('dark'); }
          } catch(e) {}
        `}} />
      </head>
      <body className="antialiased" style={{ backgroundColor: 'var(--app-bg)', color: 'var(--app-text)' }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
