'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

import ResumeEditor from '@/components/resume-builder/ResumeEditor';
import { ResumeData } from '@/components/resume-builder/types';
import { processContentWithIds, getDefaultResumeContent } from '@/lib/utils/resume-ids';

const defaultDesign = {
  fontSize: 10.5,
  lineHeight: 1.45,
  marginLR: 12,
  marginTB: 14,
  entrySpacing: 4,
  sectionSpacing: 8,
  primaryColor: '#ff4d7d',
  secondaryColor: '#c026d3',
  accentColor: '#c026d3',
  textColor: '#1f2937',
  backgroundColor: '#ffffff',
  accentType: 'basic' as const,
  applyAccentTo: ['headings', 'headingLine'],
  fontFamily: 'Outfit',
  fontCategory: 'sans' as const,
  headingStyle: 'underline',
  headingCapitalization: 'uppercase' as const,
  headingSize: 'm' as const,
  headingIconType: 'none' as const,
  entryLayout: 'default' as const,
  entryColumnWidth: 'auto' as const,
  entryTitleSize: 'm' as const,
  entrySubtitleStyle: 'normal' as const,
  entrySubtitlePlacement: 'next-line' as const,
  descriptionIndent: false,
  listStyle: 'bullet' as const,
  showPageNumbers: true,
  showEmailInFooter: false,
  showNameInFooter: false,
  linkUnderline: true,
  linkBlueColor: false,
  linkIcon: true,
  personalAlign: 'left' as const,
  personalArrangement: 'default' as const,
  personalIconShow: true,
  personalBulletShow: false,
  personalBarShow: false,
  personalIconStyle: 'default' as const,
  nameSize: 'm' as const,
  nameBold: true,
  nameFontType: 'body' as const,
  titleSize: 'm' as const,
  titlePosition: 'below' as const,
  titleStyle: 'normal' as const,
  photoShow: true,
  photoGrayscale: false,
  photoSize: 'm' as const,
  photoShape: 'circle' as const,
  skillsStyle: 'grid' as const,
  skillsColumns: 2,
  languagesStyle: 'grid' as const,
  languagesColumns: 2,
  interestsStyle: 'grid' as const,
  interestsColumns: 2,
  certificationsStyle: 'grid' as const,
  certificationsColumns: 2,
  showSummaryHeading: true,
  educationOrder: 'degree-school' as const,
  workOrder: 'title-employer' as const,
  workGroupPromotions: false,
  layout: 'sidebar-left' as const,
};

export default function ResumePage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const [loading, setLoading] = useState(true);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [templates, setTemplates] = useState<any[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user && id) {
      loadResumeData();
    }
  }, [session, id]);

  const loadResumeData = async () => {
    try {
      setLoading(true);
      console.log('=== LOADING RESUME ===');
      console.log('Resume ID:', id);

      const res = await fetch(`/api/resumes/${id}`);
      console.log('Resume API status:', res.status);
      
      if (!res.ok) {
        throw new Error('Failed to fetch resume');
      }
      
      const json = await res.json();
      console.log('Resume data from API:', json);
      
      const tRes = await fetch('/api/templates');
      const tJson = await tRes.json();
      const loadedTemplates =
        tJson?.data?.templates ||
        tJson?.templates ||
        tJson?.data ||
        [];
      setTemplates(Array.isArray(loadedTemplates) ? loadedTemplates : []);
      
      if (json.data) {
        const apiData = json.data;
        
        const finalData: ResumeData = {
          title: apiData.title || 'My Professional Resume',
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
          design: {
            ...defaultDesign,
            ...(apiData.design || {}),
          },
          activeSections: apiData.activeSections || ['summary', 'experience', 'education', 'skills'],
        };
        
        console.log('Final resume data:', finalData);
        
        setResumeData(finalData);
      } else {
        setResumeData({
          title: 'My Professional Resume',
          template: 'template-1',
          content: getDefaultResumeContent(),
          design: defaultDesign,
          activeSections: ['summary', 'experience', 'education', 'skills'],
        });
      }
    } catch (error) {
      console.error('Load error:', error);
      toast.error('Failed to load resume');
      setResumeData({
        title: 'My Professional Resume',
        template: 'template-1',
        content: getDefaultResumeContent(),
        design: defaultDesign,
        activeSections: ['summary', 'experience', 'education', 'skills'],
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading || status === 'loading') {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center gap-6 bg-white">
        <div className="relative">
          <Loader2 className="w-16 h-16 text-[#ff4d7d] animate-spin" />
          <div className="absolute inset-0 bg-gradient-to-t from-white/50 to-transparent animate-pulse" />
        </div>
        <p className="text-gray-400 font-black uppercase tracking-[0.3em] text-[10px] animate-bounce">Initializing Premium Editor...</p>
      </div>
    );
  }

  if (!resumeData) return null;

  return (
    <ResumeEditor 
      id={id} 
      initialData={resumeData} 
      templates={templates} 
    />
  );
}
