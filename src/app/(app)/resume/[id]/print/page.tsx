'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import ResumePreview from '@/components/resume-builder/ResumePreview';
import { ResumeData } from '@/components/resume-builder/types';
import { processContentWithIds, getDefaultResumeContent } from '@/lib/utils/resume-ids';
import { useRef } from 'react';

const defaultDesign = {
  fontSize: 9, lineHeight: 1.45, marginLR: 12, marginTB: 14,
  entrySpacing: 4, sectionSpacing: 8,
  primaryColor: '#ff4d7d', secondaryColor: '#c026d3', accentColor: '#c026d3',
  textColor: '#1f2937', backgroundColor: '#ffffff',
  accentType: 'basic' as const, applyAccentTo: ['headings', 'headingLine'],
  fontFamily: 'Outfit', fontCategory: 'sans' as const,
  headingStyle: 'underline', headingCapitalization: 'uppercase' as const,
  headingSize: 'm' as const, headingIconType: 'none' as const,
  entryLayout: 'default' as const, entryColumnWidth: 'auto' as const,
  entryTitleSize: 'm' as const, entrySubtitleStyle: 'normal' as const,
  entrySubtitlePlacement: 'next-line' as const, descriptionIndent: false,
  listStyle: 'bullet' as const, showPageNumbers: true,
  showEmailInFooter: false, showNameInFooter: false,
  linkUnderline: true, linkBlueColor: false, linkIcon: true,
  personalAlign: 'left' as const, personalArrangement: 'default' as const,
  personalIconShow: true, personalBulletShow: false, personalBarShow: false,
  personalIconStyle: 'default' as const,
  nameSize: 'm' as const, nameBold: true, nameFontType: 'body' as const,
  titleSize: 'm' as const, titlePosition: 'below' as const, titleStyle: 'normal' as const,
  photoShow: true, photoGrayscale: false, photoSize: 'm' as const, photoShape: 'circle' as const,
  skillsStyle: 'grid' as const, skillsColumns: 2,
  languagesStyle: 'grid' as const, languagesColumns: 2,
  interestsStyle: 'grid' as const, interestsColumns: 2,
  certificationsStyle: 'grid' as const, certificationsColumns: 2,
  showSummaryHeading: true, educationOrder: 'degree-school' as const,
  workOrder: 'title-employer' as const, workGroupPromotions: false,
  layout: 'sidebar-left' as const,
};

export default function ResumePrintPage() {
  const params = useParams();
  const id = params?.id as string;
  const previewRef = useRef<HTMLDivElement>(null);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/resumes/${id}`)
      .then(r => r.json())
      .then(json => {
        if (json.data) {
          const apiData = json.data;
          setResumeData({
            title: apiData.title || 'Resume',
            template: apiData.template || 'template-1',
            content: processContentWithIds({
              ...getDefaultResumeContent(),
              ...(apiData.content || {}),
              personalInfo: {
                ...getDefaultResumeContent().personalInfo,
                ...(apiData.content?.personalInfo || {}),
                fullName: apiData.content?.personalInfo?.fullName ||
                  `${apiData.content?.personalInfo?.firstName || ''} ${apiData.content?.personalInfo?.lastName || ''}`.trim(),
                image: apiData.content?.personalInfo?.photo || apiData.content?.personalInfo?.image || '',
              },
            }),
            design: { ...defaultDesign, ...(apiData.design || {}) },
            activeSections: apiData.activeSections || ['summary', 'experience', 'education', 'skills'],
          });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#ff4d7d]" />
      </div>
    );
  }

  if (!resumeData) return <div>Resume not found</div>;

  return (
    <>
      <style>{`
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        html, body { margin: 0; padding: 0; background: white; }
        @page { size: A4 portrait; margin: 0; }
        @media print {
          html, body { margin: 0 !important; padding: 0 !important; }
          .no-print { display: none !important; }
        }
      `}</style>
      <ResumePreview
        data={resumeData}
        numPages={1}
        previewRef={previewRef}
        zoomLevel={100}
        isExporting={true}
        isThumbnail={false}
      />
    </>
  );
}
