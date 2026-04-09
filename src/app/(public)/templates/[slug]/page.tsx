'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { CommonHeader, Footer } from '@/components/layout';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Template {
  id: string;
  name: string;
  slug: string;
  category: string;
  thumbnail: string;
  isPremium: boolean;
  styles: {
    fontFamily: string;
    primaryColor: string;
    layout: string;
  };
}

export default function TemplatePreviewPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const slug = params.slug as string;
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchTemplate();
    }
  }, [slug]);

  const fetchTemplate = async () => {
    try {
      const res = await fetch(`/api/templates/${slug}`);
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Template not found');
        return;
      }
      const data = await res.json();
      setTemplate(data.template);
    } catch (err) {
      setError('Failed to load template');
    } finally {
      setLoading(false);
    }
  };

  const handleUseTemplate = async () => {
    if (!template) return;

    if (status === 'unauthenticated') {
      router.push(`/register?redirect=/templates/${slug}`);
      return;
    }

    try {
      setCreating(true);
      
      const response = await fetch('/api/resumes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateSlug: template.slug,
          title: `My ${template.name} Resume`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create resume');
      }

      const data = await response.json();
      router.push(`/resume/${data.data._id}`);
    } catch (err) {
      console.error('Error creating resume:', err);
      setError('Failed to create resume. Please try again.');
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CommonHeader />
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CommonHeader />
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Template Not Found</h1>
          <p className="text-gray-600 mb-6">The template you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/templates">
            <Button>Browse All Templates</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <CommonHeader />
      
      <main className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link 
            href="/templates" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Templates
          </Link>

          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="aspect-[3/4] relative">
                  {!imgError ? (
                    <img
                      src={template.thumbnail}
                      alt={template.name}
                      className="w-full h-full object-cover"
                      onError={() => setImgError(true)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <div className="text-center p-8">
                        <div className="w-32 h-40 bg-gray-200 rounded mx-auto mb-4" />
                        <p className="text-gray-500">Preview not available</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full capitalize">
                    {template.category}
                  </span>
                  {template.isPremium && (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm font-medium rounded-full">
                      Premium
                    </span>
                  )}
                </div>
                <h1 className="text-3xl font-bold text-gray-900">{template.name}</h1>
              </div>

              <div className="bg-white rounded-xl border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Template Details</h2>
                <dl className="space-y-3">
                  <div className="flex items-center justify-between">
                    <dt className="text-gray-500">Font Family</dt>
                    <dd className="text-gray-900 font-medium">{template.styles.fontFamily}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-gray-500">Layout</dt>
                    <dd className="text-gray-900 font-medium capitalize">{template.styles.layout.replace('-', ' ')}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-gray-500">Accent Color</dt>
                    <dd className="flex items-center gap-2">
                      <span 
                        className="w-6 h-6 rounded-full border" 
                        style={{ backgroundColor: template.styles.primaryColor }}
                      />
                      <span className="text-gray-900 font-medium">{template.styles.primaryColor}</span>
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="bg-white rounded-xl border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Features</h2>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-gray-600">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    ATS-friendly format
                  </li>
                  <li className="flex items-center gap-2 text-gray-600">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    PDF export ready
                  </li>
                  <li className="flex items-center gap-2 text-gray-600">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Fully customizable
                  </li>
                  <li className="flex items-center gap-2 text-gray-600">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Professional design
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={handleUseTemplate} 
                  disabled={creating}
                  className="w-full text-lg py-6"
                >
                  {creating ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Creating Resume...
                    </>
                  ) : (
                    'Use This Template - It&apos;s Free'
                  )}
                </Button>
                <p className="text-center text-sm text-gray-500">
                  Free plan includes unlimited PDF downloads with no watermarks
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
