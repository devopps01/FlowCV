const fs = require('fs');
const path = require('path');

const templatesDir = path.join(__dirname, 'config', 'templates');

if (!fs.existsSync(templatesDir)) {
  fs.mkdirSync(templatesDir, { recursive: true });
}

const colorPalettes = [
  { primary: '#2563eb', secondary: '#eff6ff', accent: '#1e40af' }, // Blue
  { primary: '#7c3aed', secondary: '#f5f3ff', accent: '#5b21b6' }, // Violet
  { primary: '#18181b', secondary: '#f4f4f5', accent: '#000000' }, // Zinc/Black
  { primary: '#0f766e', secondary: '#f0fdfa', accent: '#134e4a' }, // Teal
  { primary: '#dc2626', secondary: '#fef2f2', accent: '#991b1b' }, // Red
  { primary: '#d97706', secondary: '#fffbeb', accent: '#92400e' }, // Amber
  { primary: '#059669', secondary: '#f0fdf4', accent: '#065f46' }, // Emerald
  { primary: '#0891b2', secondary: '#ecfeff', accent: '#155e75' }, // Cyan
  { primary: '#4f46e5', secondary: '#eef2ff', accent: '#3730a3' }, // Indigo
  { primary: '#c026d3', secondary: '#fdf4ff', accent: '#86198f' }, // Fuchsia
  { primary: '#db2777', secondary: '#fdf2f8', accent: '#9d174d' }, // Pink
  { primary: '#1e293b', secondary: '#f1f5f9', accent: '#0f172a' }, // Slate
];

const fonts = [
  { main: 'Inter', serif: false },
  { main: 'Roboto', serif: false },
  { main: 'Outfit', serif: false },
  { main: 'Playfair Display', serif: true },
  { main: 'Montserrat', serif: false },
  { main: 'Nunito', serif: false },
  { main: 'Lato', serif: false },
  { main: 'Open Sans', serif: false },
  { main: 'Lora', serif: true },
  { main: 'Merriweather', serif: true }
];

const layoutTypes = ['single', 'sidebar-left', 'sidebar-right', 'modern-header', 'compact'];

const dummyData = {
  personalInfo: {
    fullName: 'Brian T. Wayne',
    email: 'brian.wayne@example.com',
    phone: '+1 234 567 890',
    location: 'San Francisco, CA',
    professionalTitle: 'Business Development Consultant',
    summary: 'Highly experienced Business Development Consultant with over 10 years in the tech industry. Proven track record of driving revenue growth and establishing strategic partnerships.'
  },
  experience: [
    {
      company: 'Global Tech Industries',
      position: 'Senior Consultant',
      startDate: '2021-03',
      endDate: 'Present',
      description: 'Led market expansion strategies in EMEA region, resulting in 30% YOY growth.'
    },
    {
      company: 'Innovation Labs',
      position: 'Business Analyst',
      startDate: '2018-01',
      endDate: '2021-02',
      description: 'Managed cross-functional teams to deliver data-driven business solutions.'
    }
  ],
  education: [
    {
      school: 'Stanford University',
      degree: 'Master of Business Administration',
      field: 'Strategic Management',
      graduationYear: '2017'
    }
  ],
  skills: ['Strategic Planning', 'Market Analysis', 'Revenue Optimization', 'Team Leadership', 'CRM Strategy']
};

for (let i = 1; i <= 100; i++) {
  const palette = colorPalettes[i % colorPalettes.length];
  const font = fonts[i % fonts.length];
  const layout = layoutTypes[i % layoutTypes.length];
  const isPremium = i > 15;

  const template = {
    mainsection: {
      id: `template-${i}`,
      name: `${layout.replace('-', ' ').toUpperCase()} ${i}`,
      description: `A ${layout} professional design using ${font.main}.`,
      resumeinfo: {
        isPremium: isPremium,
        subscription: isPremium ? 'Premium' : 'Free'
      }
    },
    secondary: {
      style: {
        primaryColor: palette.primary,
        secondaryColor: palette.secondary,
        accentColor: palette.accent,
        fontFamily: font.main,
        isSerif: font.serif,
        layout: layout,
        spacing: 4,
        borderRadius: 'lg',
        fontSize: 11,
        textColor: '#1f2937',
        backgroundColor: '#ffffff'
      },
      data: dummyData
    }
  };

  fs.writeFileSync(path.join(templatesDir, `template-${i}.json`), JSON.stringify(template, null, 2));
}

console.log('100 diverse templates generated successfully!');
