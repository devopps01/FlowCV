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
      <body className="antialiased bg-white text-gray-900">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
