import { NextRequest, NextResponse } from 'next/server';

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

const templates: Record<string, Template> = {
  'atlantic-blue-multi-column-sidebar-left': {
    id: '1',
    name: 'Atlantic Blue',
    slug: 'atlantic-blue-multi-column-sidebar-left',
    category: 'modern',
    thumbnail: 'https://prod.flowcvassets.com/resume-templates/z_b_8pggvd0955_woiozq/960.jpeg',
    isPremium: false,
    styles: {
      fontFamily: 'Inter',
      primaryColor: '#2563eb',
      layout: 'two-column',
    },
  },
  'classic-multi-column-serif-black-white': {
    id: '2',
    name: 'Classic',
    slug: 'classic-multi-column-serif-black-white',
    category: 'simple',
    thumbnail: 'https://prod.flowcvassets.com/resume-templates/tlz6h4qf2ti7uttcfrcf0/960.jpeg',
    isPremium: false,
    styles: {
      fontFamily: 'Merriweather',
      primaryColor: '#1f2937',
      layout: 'two-column',
    },
  },
  'classic-one-column-design-professionals': {
    id: '3',
    name: 'Mercury',
    slug: 'classic-one-column-design-professionals',
    category: 'simple',
    thumbnail: 'https://prod.flowcvassets.com/resume-templates/qgc-s0mrwjnn2psgyg3cl/960.jpeg',
    isPremium: false,
    styles: {
      fontFamily: 'Inter',
      primaryColor: '#374151',
      layout: 'single',
    },
  },
  'executive-serif-black-white': {
    id: '4',
    name: 'Executive',
    slug: 'executive-serif-black-white',
    category: 'simple',
    thumbnail: 'https://prod.flowcvassets.com/resume-templates/gs_qryrzly3kldmqhxqsb/960.jpeg',
    isPremium: false,
    styles: {
      fontFamily: 'Merriweather',
      primaryColor: '#111827',
      layout: 'single',
    },
  },
  'dark-leaves-multi-column-border-left': {
    id: '5',
    name: 'Leaves',
    slug: 'dark-leaves-multi-column-border-left',
    category: 'creative',
    thumbnail: 'https://prod.flowcvassets.com/resume-templates/q5esjk7z-oy0vs4wjjlh4/960.jpeg',
    isPremium: false,
    styles: {
      fontFamily: 'Inter',
      primaryColor: '#059669',
      layout: 'two-column',
    },
  },
  'harvard-classic-sans-serif-style': {
    id: '6',
    name: 'Harvard',
    slug: 'harvard-classic-sans-serif-style',
    category: 'simple',
    thumbnail: 'https://prod.flowcvassets.com/resume-templates/aolmyzzk7frcnkmzjiicp/960.jpeg',
    isPremium: false,
    styles: {
      fontFamily: 'Inter',
      primaryColor: '#991b1b',
      layout: 'single',
    },
  },
  'corporate-resume-template': {
    id: '7',
    name: 'Corporate',
    slug: 'corporate-resume-template',
    category: 'simple',
    thumbnail: 'https://prod.flowcvassets.com/resume-templates/078jtnkyso7ouiaxeacr/960.jpeg',
    isPremium: false,
    styles: {
      fontFamily: 'Inter',
      primaryColor: '#1e40af',
      layout: 'single',
    },
  },
  'finance-resume-template': {
    id: '8',
    name: 'Finance',
    slug: 'finance-resume-template',
    category: 'simple',
    thumbnail: 'https://prod.flowcvassets.com/resume-templates/zlelg5be-n1q1oi_zarwl/960.jpeg',
    isPremium: false,
    styles: {
      fontFamily: 'Merriweather',
      primaryColor: '#047857',
      layout: 'single',
    },
  },
  'steady-form': {
    id: '9',
    name: 'Steady Form',
    slug: 'steady-form',
    category: 'simple',
    thumbnail: 'https://prod.flowcvassets.com/resume-templates/_fz0yv8ijzr9t0txeukdk/960.jpeg',
    isPremium: false,
    styles: {
      fontFamily: 'Inter',
      primaryColor: '#4338ca',
      layout: 'single',
    },
  },
  'precision-line': {
    id: '10',
    name: 'Precision Line',
    slug: 'precision-line',
    category: 'modern',
    thumbnail: 'https://prod.flowcvassets.com/resume-templates/2xixvybckqt8wipw3v9sp/960.jpeg',
    isPremium: false,
    styles: {
      fontFamily: 'Inter',
      primaryColor: '#0891b2',
      layout: 'single',
    },
  },
  'refined': {
    id: '11',
    name: 'Refined',
    slug: 'refined',
    category: 'simple',
    thumbnail: 'https://prod.flowcvassets.com/resume-templates/sgwimdfqwrs0rmpzl3fqy/960.jpeg',
    isPremium: false,
    styles: {
      fontFamily: 'Inter',
      primaryColor: '#1f2937',
      layout: 'single',
    },
  },
  'saffron-line': {
    id: '12',
    name: 'Saffron Line',
    slug: 'saffron-line',
    category: 'modern',
    thumbnail: 'https://prod.flowcvassets.com/resume-templates/_u1p3uc-nsuba6fy87yan/960.jpeg',
    isPremium: false,
    styles: {
      fontFamily: 'Inter',
      primaryColor: '#d97706',
      layout: 'single',
    },
  },
  'true-blue': {
    id: '13',
    name: 'True Blue',
    slug: 'true-blue',
    category: 'simple',
    thumbnail: 'https://prod.flowcvassets.com/resume-templates/um2ccnj8x3bimdnzzrml8/960.jpeg',
    isPremium: false,
    styles: {
      fontFamily: 'Inter',
      primaryColor: '#2563eb',
      layout: 'single',
    },
  },
  'quicksilver-resume-template': {
    id: '14',
    name: 'Quicksilver',
    slug: 'quicksilver-resume-template',
    category: 'modern',
    thumbnail: 'https://prod.flowcvassets.com/resume-templates/tibv0mbpqwedouakf70pr/960.jpeg',
    isPremium: false,
    styles: {
      fontFamily: 'Inter',
      primaryColor: '#64748b',
      layout: 'two-column',
    },
  },
  'elegant-minimalistic-classic-professionals': {
    id: '15',
    name: 'Silver',
    slug: 'elegant-minimalistic-classic-professionals',
    category: 'modern',
    thumbnail: 'https://prod.flowcvassets.com/resume-templates/pnfiqfgc3xxes7chsb9xr/960.jpeg',
    isPremium: false,
    styles: {
      fontFamily: 'Inter',
      primaryColor: '#475569',
      layout: 'two-column',
    },
  },
  'obsidian-edge': {
    id: '16',
    name: 'Obsidian Edge',
    slug: 'obsidian-edge',
    category: 'modern',
    thumbnail: 'https://prod.flowcvassets.com/resume-templates/hllwmnql8b3hndx1ulhrx/960.jpeg',
    isPremium: false,
    styles: {
      fontFamily: 'Inter',
      primaryColor: '#18181b',
      layout: 'two-column',
    },
  },
  'professional-multi-column-business-experts': {
    id: '17',
    name: 'Hunter Green',
    slug: 'professional-multi-column-business-experts',
    category: 'modern',
    thumbnail: 'https://prod.flowcvassets.com/resume-templates/um2ccnj8x3bimdnzzrml8/960.jpeg',
    isPremium: false,
    styles: {
      fontFamily: 'Inter',
      primaryColor: '#166534',
      layout: 'two-column',
    },
  },
  'cobalt-edge': {
    id: '18',
    name: 'Cobalt Edge',
    slug: 'cobalt-edge',
    category: 'modern',
    thumbnail: 'https://prod.flowcvassets.com/resume-templates/y6twjqgcmplcnnoqzfkn0/960.jpeg',
    isPremium: false,
    styles: {
      fontFamily: 'Inter',
      primaryColor: '#1d4ed8',
      layout: 'two-column',
    },
  },
  'blue-neon-multi-column-border-accents': {
    id: '19',
    name: 'Blue Neon',
    slug: 'blue-neon-multi-column-border-accents',
    category: 'creative',
    thumbnail: 'https://prod.flowcvassets.com/resume-templates/2favldkhk6fj2ldtr6gu/960.jpeg',
    isPremium: false,
    styles: {
      fontFamily: 'Inter',
      primaryColor: '#0ea5e9',
      layout: 'two-column',
    },
  },
  'multi-column-design-marketing-assistants': {
    id: '20',
    name: 'Black Pattern',
    slug: 'multi-column-design-marketing-assistants',
    category: 'creative',
    thumbnail: 'https://prod.flowcvassets.com/resume-templates/th-_fq-yjykomqznpladu/960.jpeg',
    isPremium: false,
    styles: {
      fontFamily: 'Inter',
      primaryColor: '#000000',
      layout: 'two-column',
    },
  },
};

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const template = templates[params.slug];

  if (!template) {
    return NextResponse.json({ error: 'Template not found' }, { status: 404 });
  }

  return NextResponse.json({ template });
}
