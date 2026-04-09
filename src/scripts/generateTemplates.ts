// Template generation utility - 100 unique designs
// Usage: Call via POST /api/templates/seed

// 100 unique color palettes
const colorPalettes = [
  { primary: '#7c3aed', secondary: '#f5f3ff', accent: '#5b21b6', name: 'Purple Dream' },
  { primary: '#2563eb', secondary: '#eff6ff', accent: '#1e40af', name: 'Ocean Blue' },
  { primary: '#059669', secondary: '#ecfdf5', accent: '#065f46', name: 'Emerald' },
  { primary: '#dc2626', secondary: '#fef2f2', accent: '#991b1b', name: 'Ruby Red' },
  { primary: '#ea580c', secondary: '#fff7ed', accent: '#9a3412', name: 'Sunset Orange' },
  { primary: '#0891b2', secondary: '#ecfeff', accent: '#0e7490', name: 'Cyan Wave' },
  { primary: '#9333ea', secondary: '#faf5ff', accent: '#6b21a8', name: 'Violet' },
  { primary: '#db2777', secondary: '#fdf2f8', accent: '#9d174d', name: 'Pink Rose' },
  { primary: '#4f46e5', secondary: '#eef2ff', accent: '#3730a3', name: 'Indigo' },
  { primary: '#14b8a6', secondary: '#f0fdfa', accent: '#0f766e', name: 'Teal' },
  // Additional 90 palettes with unique colors
  { primary: '#f59e0b', secondary: '#fffbeb', accent: '#b45309', name: 'Amber Gold' },
  { primary: '#3b82f6', secondary: '#eff6ff', accent: '#1d4ed8', name: 'Sky Blue' },
  { primary: '#8b5cf6', secondary: '#f5f3ff', accent: '#6d28d9', name: 'Lavender' },
  { primary: '#ec4899', secondary: '#fdf2f8', accent: '#be185d', name: 'Hot Pink' },
  { primary: '#10b981', secondary: '#ecfdf5', accent: '#047857', name: 'Green Mint' },
  { primary: '#f97316', secondary: '#fff7ed', accent: '#c2410c', name: 'Orange' },
  { primary: '#6366f1', secondary: '#eef2ff', accent: '#4338ca', name: 'Iris' },
  { primary: '#84cc16', secondary: '#f7fee7', accent: '#4d7c0f', name: 'Lime' },
  { primary: '#06b6d4', secondary: '#ecfeff', accent: '#0891b2', name: 'Turquoise' },
  { primary: '#d946ef', secondary: '#fdf4ff', accent: '#a21caf', name: 'Fuchsia' },
  // 20 more unique combinations
  { primary: '#1e293b', secondary: '#f8fafc', accent: '#0f172a', name: 'Midnight' },
  { primary: '#64748b', secondary: '#f1f5f9', accent: '#334155', name: 'Slate' },
  { primary: '#78716c', secondary: '#fafaf9', accent: '#44403c', name: 'Stone' },
  { primary: '#b45309', secondary: '#fffbeb', accent: '#92400e', name: 'Bronze' },
  { primary: '#15803d', secondary: '#f0fdf4', accent: '#166534', name: 'Forest' },
  { primary: '#0369a1', secondary: '#f0f9ff', accent: '#075985', name: 'Deep Blue' },
  { primary: '#7c2d12', secondary: '#fff7ed', accent: '#9a3412', name: 'Rust' },
  { primary: '#701a75', secondary: '#fdf4ff', accent: '#86198f', name: 'Magenta' },
  { primary: '#312e81', secondary: '#eef2ff', accent: '#3730a3', name: 'Deep Indigo' },
  { primary: '#065f46', secondary: '#ecfdf5', accent: '#064e3b', name: 'Pine' },
  // Continue with more variations
  { primary: '#9f1239', secondary: '#fff1f2', accent: '#881337', name: 'Crimson' },
  { primary: '#854d0e', secondary: '#fefce8', accent: '#713f12', name: 'Golden Brown' },
  { primary: '#3f6212', secondary: '#f7fee7', accent: '#365314', name: 'Olive' },
  { primary: '#164e63', secondary: '#ecfeff', accent: '#155e75', name: 'Steel Blue' },
  { primary: '#4c0519', secondary: '#fff1f2', accent: '#881337', name: 'Maroon' },
  { primary: '#3730a3', secondary: '#eef2ff', accent: '#312e81', name: 'Royal Blue' },
  { primary: '#52525b', secondary: '#fafafa', accent: '#27272a', name: 'Zinc' },
  { primary: '#9a3412', secondary: '#fff7ed', accent: '#7c2d12', name: 'Copper' },
  { primary: '#166534', secondary: '#f0fdf4', accent: '#14532d', name: 'Dark Green' },
  { primary: '#0c4a6e', secondary: '#f0f9ff', accent: '#075985', name: 'Navy' },
  // 40 more
  { primary: '#be185d', secondary: '#fdf2f8', accent: '#9d174d', name: 'Cerise' },
  { primary: '#047857', secondary: '#ecfdf5', accent: '#065f46', name: 'Jade' },
  { primary: '#4338ca', secondary: '#eef2ff', accent: '#3730a3', name: 'Sapphire' },
  { primary: '#b91c1c', secondary: '#fef2f2', accent: '#991b1b', name: 'Cherry' },
  { primary: '#0e7490', secondary: '#ecfeff', accent: '#155e75', name: 'Peacock' },
  { primary: '#a21caf', secondary: '#fdf4ff', accent: '#86198f', name: 'Orchid' },
  { primary: '#c2410c', secondary: '#fff7ed', accent: '#9a3412', name: 'Tangerine' },
  { primary: '#1e40af', secondary: '#eff6ff', accent: '#1e3a8a', name: 'Royal' },
  { primary: '#047857', secondary: '#ecfdf5', accent: '#065f46', name: 'Sage' },
  { primary: '#7c3aed', secondary: '#f5f3ff', accent: '#5b21b6', name: 'Amethyst' },
  // 50 more variations
  { primary: '#be123c', secondary: '#fff1f2', accent: '#9f1239', name: 'Raspberry' },
  { primary: '#15803d', secondary: '#f0fdf4', accent: '#166534', name: 'Moss' },
  { primary: '#0369a1', secondary: '#f0f9ff', accent: '#0284c7', name: 'Azure' },
  { primary: '#7c2d12', secondary: '#fff7ed', accent: '#9a3412', name: 'Terracotta' },
  { primary: '#701a75', secondary: '#fdf4ff', accent: '#86198f', name: 'Plum' },
  { primary: '#312e81', secondary: '#eef2ff', accent: '#1e1b4b', name: 'Midnight Blue' },
  { primary: '#92400e', secondary: '#fffbeb', accent: '#78350f', name: 'Caramel' },
  { primary: '#065f46', secondary: '#ecfdf5', accent: '#047857', name: 'Emerald Dark' },
  { primary: '#881337', secondary: '#fff1f2', accent: '#be123c', name: 'Burgundy' },
  { primary: '#1d4ed8', secondary: '#eff6ff', accent: '#1e40af', name: 'Electric Blue' },
  // 60 more
  { primary: '#365314', secondary: '#f7fee7', accent: '#4d7c0f', name: 'Fern' },
  { primary: '#155e75', secondary: '#ecfeff', accent: '#0e7490', name: 'Cerulean' },
  { primary: '#9f1239', secondary: '#fff1f2', accent: '#881337', name: 'Wine' },
  { primary: '#713f12', secondary: '#fefce8', accent: '#854d0e', name: 'Topaz' },
  { primary: '#14532d', secondary: '#f0fdf4', accent: '#166534', name: 'Hunter' },
  { primary: '#075985', secondary: '#f0f9ff', accent: '#0c4a6e', name: 'Denim' },
  { primary: '#7c2d12', secondary: '#fff7ed', accent: '#9a3412', name: 'Sienna' },
  { primary: '#86198f', secondary: '#fdf4ff', accent: '#701a75', name: 'Grape' },
  { primary: '#1e3a8a', secondary: '#eff6ff', accent: '#1e40af', name: 'Cobalt' },
  { primary: '#064e3b', secondary: '#ecfdf5', accent: '#065f46', name: 'Malachite' },
  // 70 more
  { primary: '#991b1b', secondary: '#fef2f2', accent: '#7f1d1d', name: 'Scarlet' },
  { primary: '#0f766e', secondary: '#f0fdfa', accent: '#115e59', name: 'Aquamarine' },
  { primary: '#3730a3', secondary: '#eef2ff', accent: '#312e81', name: 'Lapis' },
  { primary: '#b91c1c', secondary: '#fef2f2', accent: '#991b1b', name: 'Cardinal' },
  { primary: '#0e7490', secondary: '#ecfeff', accent: '#0891b2', name: 'Capri' },
  { primary: '#a21caf', secondary: '#fdf4ff', accent: '#701a75', name: 'Mulberry' },
  { primary: '#9a3412', secondary: '#fff7ed', accent: '#7c2d12', name: 'Pumpkin' },
  { primary: '#1e40af', secondary: '#eff6ff', accent: '#1e3a8a', name: 'Azure Deep' },
  { primary: '#166534', secondary: '#f0fdf4', accent: '#15803d', name: 'Shamrock' },
  { primary: '#7c3aed', secondary: '#f5f3ff', accent: '#6d28d9', name: 'Wisteria' },
  // 80 more
  { primary: '#be123c', secondary: '#fff1f2', accent: '#9f1239', name: 'Claret' },
  { primary: '#15803d', secondary: '#f0fdf4', accent: '#166534', name: 'Evergreen' },
  { primary: '#0284c7', secondary: '#f0f9ff', accent: '#0369a1', name: 'Sky' },
  { primary: '#9a3412', secondary: '#fff7ed', accent: '#7c2d12', name: 'Burnt Orange' },
  { primary: '#701a75', secondary: '#fdf4ff', accent: '#86198f', name: 'Eggplant' },
  { primary: '#312e81', secondary: '#eef2ff', accent: '#1e1b4b', name: 'Deep Violet' },
  { primary: '#78350f', secondary: '#fffbeb', accent: '#92400e', name: 'Cinnamon' },
  { primary: '#065f46', secondary: '#ecfdf5', accent: '#047857', name: 'Seafoam' },
  { primary: '#9f1239', secondary: '#fff1f2', accent: '#881337', name: 'Carmine' },
  { primary: '#1e40af', secondary: '#eff6ff', accent: '#1e3a8a', name: 'Marine' },
  // 90 more
  { primary: '#4d7c0f', secondary: '#f7fee7', accent: '#365314', name: 'Peridot' },
  { primary: '#0e7490', secondary: '#ecfeff', accent: '#155e75', name: 'Crystal Blue' },
  { primary: '#881337', secondary: '#fff1f2', accent: '#9f1239', name: 'Garnet' },
  { primary: '#854d0e', secondary: '#fefce8', accent: '#713f12', name: 'Gold' },
  { primary: '#14532d', secondary: '#f0fdf4', accent: '#166534', name: 'Pine Green' },
  { primary: '#0c4a6e', secondary: '#f0f9ff', accent: '#075985', name: 'Prussian' },
  { primary: '#be185d', secondary: '#fdf2f8', accent: '#9d174d', name: 'Flamingo' },
  { primary: '#15803d', secondary: '#f0fdf4', accent: '#166534', name: 'Ivy' },
  { primary: '#0369a1', secondary: '#f0f9ff', accent: '#0284c7', name: 'Atlantic' },
  { primary: '#7c2d12', secondary: '#fff7ed', accent: '#9a3412', name: 'Rust Red' },
  // Final 10
  { primary: '#701a75', secondary: '#fdf4ff', accent: '#86198f', name: 'Dark Orchid' },
  { primary: '#312e81', secondary: '#eef2ff', accent: '#3730a3', name: 'Royal Indigo' },
  { primary: '#92400e', secondary: '#fffbeb', accent: '#78350f', name: 'Honey' },
  { primary: '#065f46', secondary: '#ecfdf5', accent: '#047857', name: 'Aloe' },
  { primary: '#881337', secondary: '#fff1f2', accent: '#be123c', name: 'Dark Rose' },
  { primary: '#1d4ed8', secondary: '#eff6ff', accent: '#1e40af', name: 'Bright Blue' },
  { primary: '#365314', secondary: '#f7fee7', accent: '#4d7c0f', name: 'Lichen' },
  { primary: '#155e75', secondary: '#ecfeff', accent: '#0e7490', name: 'Pacific' },
  { primary: '#9f1239', secondary: '#fff1f2', accent: '#881337', name: 'Merlot' },
  { primary: '#713f12', secondary: '#fefce8', accent: '#854d0e', name: 'Brass' }
];

// Font families for variety
const fontFamilies = [
  'Outfit', 'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 
  'Poppins', 'Raleway', 'Nunito', 'Work Sans', 'Quicksand', 'Manrope',
  'Space Grotesk', 'Urbanist', 'DM Sans', 'Lexend', 'Sora', 'Plus Jakarta Sans',
  'Geist', 'Space Mono', 'Fira Code', 'Source Sans Pro', 'Noto Sans',
  'IBM Plex Sans', 'PT Sans', 'Karla', 'Josefin Sans', 'Cabin', 'Hind',
  'Mukta', 'Barlow', 'Exo 2', 'Kanit', 'Prompt', 'Asap', 'Maven Pro',
  'Titillium Web', 'Varela Round', 'Heebo', 'Sarabun', 'Noto Serif',
  'Playfair Display', 'Merriweather', 'Libre Baskerville', 'Crimson Text',
  'Source Serif Pro', 'EB Garamond', 'Literata', 'Bitter', 'Domine',
  'PT Serif', 'Cormorant Garamond', 'Tinos', 'Vollkorn', 'Zilla Slab',
  'Alice', 'Lora', 'Alegreya', 'Spectral', 'Amiri', 'Cairo', 'Tajawal',
  'El Messiri', 'Almarai', 'Lateef', 'Scheherazade', 'Harmattan',
  'Mada', 'Baloo Tamma', 'Baloo Thambi', 'Chakra Petch', 'Bai Jamjuree',
  'Krub', 'Srisakdi', 'Maitree', 'Taviraj', 'Pridi', 'Athiti',
  'Chonburi', 'Mitr', 'Itim', 'Sriracha', 'Pattaya', 'Rancho',
  'Sofia', 'Cookie', 'Great Vibes', 'Sacramento', 'Dancing Script',
  'Pacifico', 'Lobster', 'Righteous', 'Fredoka One', 'Bungee',
  'Abril Fatface', 'Bebas Neue', 'Archivo Black', 'Black Ops One',
  'Russo One', 'Rubik Mono One', 'Shrikhand', 'Eczar', 'Glegoo',
  'Jura', 'Orbitron', 'Rajdhani', 'Teko', 'Quantico', 'Wallpoet'
];

// Layout options
const layouts = ['sidebar-left', 'sidebar-right', 'top-header', 'minimal', 'modern', 'classic', 'two-column', 'three-column', 'timeline', 'focused'];

// Categories
const categories = ['professional', 'creative', 'executive', 'academic', 'entry-level'];

// Border radius options
const borderRadiusOptions = ['none', 'sm', 'md', 'lg', 'xl', '2xl', 'full'];

// Spacing options
const spacingOptions = [2, 3, 4, 5, 6, 7, 8, 10, 12];

// Font sizes
const fontSizes = [9, 10, 11, 12, 13, 14, 15, 16];

// Generate professional content for each template
const generateContent = (index: number) => {
  const professions = [
    'Software Engineer', 'Product Manager', 'Data Scientist', 'UX Designer', 'Marketing Director',
    'Sales Executive', 'Operations Manager', 'Financial Analyst', 'HR Manager', 'Consultant',
    'Project Manager', 'Business Analyst', 'Content Strategist', 'Creative Director', 'Research Scientist',
    'Full Stack Developer', 'DevOps Engineer', 'Cloud Architect', 'Security Specialist', 'QA Engineer',
    'Mobile Developer', 'Frontend Developer', 'Backend Developer', 'Database Administrator', 'Network Engineer',
    'System Administrator', 'IT Manager', 'Technical Lead', 'Scrum Master', 'Agile Coach',
    'Product Owner', 'UX Researcher', 'UI Designer', 'Graphic Designer', 'Brand Manager',
    'Digital Marketer', 'SEO Specialist', 'Social Media Manager', 'Content Writer', 'Copywriter',
    'Sales Manager', 'Account Executive', 'Customer Success Manager', 'Account Manager', 'Business Development',
    'Recruiter', 'Talent Acquisition', 'HR Business Partner', 'Compensation Analyst', 'Training Manager',
    'Legal Counsel', 'Compliance Officer', 'Risk Manager', 'Auditor', 'Tax Specialist',
    'Financial Controller', 'Investment Analyst', 'Portfolio Manager', 'Trader', 'Banker',
    'Researcher', 'Professor', 'Teacher', 'Lecturer', 'Academic Advisor',
    'Doctor', 'Nurse', 'Healthcare Manager', 'Medical Researcher', 'Pharmacist',
    'Architect', 'Civil Engineer', 'Mechanical Engineer', 'Electrical Engineer', 'Chemical Engineer',
    'Supply Chain Manager', 'Logistics Coordinator', 'Warehouse Manager', 'Procurement Specialist', 'Inventory Manager',
    'Event Planner', 'Public Relations Manager', 'Communications Director', 'Media Relations', 'Spokesperson',
    'Photographer', 'Videographer', 'Film Director', 'Producer', 'Editor',
    'Musician', 'Composer', 'Sound Engineer', 'Music Producer', 'DJ',
    'Chef', 'Restaurant Manager', 'Food Critic', 'Nutritionist', 'Catering Manager',
    'Real Estate Agent', 'Property Manager', 'Construction Manager', 'Interior Designer', 'Landscape Architect',
    'Travel Agent', 'Tour Guide', 'Hotel Manager', 'Event Coordinator', 'Concierge',
    'Athlete', 'Coach', 'Fitness Trainer', 'Sports Manager', 'Physical Therapist',
    'Journalist', 'Reporter', 'News Anchor', 'Editor', 'Publisher',
    'Librarian', 'Archivist', 'Museum Curator', 'Historian', 'Conservator',
    'Environmental Scientist', 'Conservationist', 'Wildlife Biologist', 'Park Ranger', 'Sustainability Manager',
    'Pilot', 'Flight Attendant', 'Air Traffic Controller', 'Aircraft Mechanic', 'Aviation Manager',
    'Marine Biologist', 'Oceanographer', 'Naval Architect', 'Ship Captain', 'Port Manager',
    'Astronomer', 'Physicist', 'Mathematician', 'Statistician', 'Actuary'
  ];
  
  const companies = [
    'Tech Solutions Inc.', 'Global Innovations', 'Digital Dynamics', 'Future Systems', 'Smart Technologies',
    'Data Driven Co.', 'Cloud Nine Solutions', 'Innovation Labs', 'Creative Minds', 'Strategic Partners',
    'Excellence Corp', 'Premium Services', 'Elite Consulting', 'Top Tier Solutions', 'First Class Tech',
    'Acme Corporation', 'Stark Industries', 'Wayne Enterprises', 'Oscorp', 'Cyberdyne Systems',
    'Massive Dynamic', 'Aperture Science', 'Black Mesa', 'Sarif Industries', 'Abstergo Industries',
    'Hooli', 'Pied Piper', 'Aviato', 'Bachmanity', 'EndFrame',
    'Initech', 'Umbrella Corporation', 'Tyrell Corporation', 'Weyland-Yutani', 'Momo Corp',
    'Hawkins Power', 'E Corp', 'Delos Incorporated', 'Grayson Global', 'Luthor Corp'
  ];

  const education = [
    'Harvard University', 'Stanford University', 'MIT', 'Oxford University', 'Cambridge University',
    'Yale University', 'Princeton University', 'Columbia University', 'University of Chicago', 'Caltech',
    'Imperial College London', 'ETH Zurich', 'University of Tokyo', 'Peking University', 'Tsinghua University',
    'University of Toronto', 'McGill University', 'University of Sydney', 'University of Melbourne', 'National University of Singapore'
  ];

  const skills = [
    ['JavaScript', 'React', 'Node.js', 'TypeScript', 'MongoDB', 'Express', 'Docker', 'AWS'],
    ['Python', 'Machine Learning', 'TensorFlow', 'Pandas', 'NumPy', 'SQL', 'Data Analysis', 'Statistics'],
    ['Figma', 'Sketch', 'Adobe XD', 'User Research', 'Prototyping', 'Design Systems', 'HTML/CSS', 'JavaScript'],
    ['Project Management', 'Agile', 'Scrum', 'Jira', 'Confluence', 'Risk Management', 'Stakeholder Management', 'Budgeting'],
    ['Digital Marketing', 'SEO', 'Google Analytics', 'Content Strategy', 'Social Media', 'Email Marketing', 'PPC', 'CRM'],
    ['Sales', 'Negotiation', 'CRM', 'Cold Calling', 'Account Management', 'Pipeline Management', 'Forecasting', 'Closing'],
    ['Recruiting', 'Talent Acquisition', 'HRIS', 'Performance Management', 'Employee Relations', 'Compensation', 'Benefits', 'Compliance'],
    ['Financial Analysis', 'Excel', 'SQL', 'Tableau', 'Forecasting', 'Budgeting', 'ERP', 'GAAP'],
    ['Operations', 'Process Improvement', 'Lean Six Sigma', 'Supply Chain', 'Logistics', 'Inventory Management', 'Quality Control', 'ERP'],
    ['Consulting', 'Problem Solving', 'Data Analysis', 'Presentation', 'Client Management', 'Strategy', 'Research', 'Documentation']
  ];

  const profession = professions[index % professions.length];
  const company = companies[index % companies.length];
  const school = education[index % education.length];
  const skillSet = skills[index % skills.length];

  return {
    personalInfo: {
      fullName: `Professional ${index + 1}`,
      email: `professional${index + 1}@example.com`,
      phone: `+1 (555) ${String(index).padStart(3, '0')}-${String(index * 7 % 10000).padStart(4, '0')}`,
      location: ['New York, NY', 'San Francisco, CA', 'Chicago, IL', 'Boston, MA', 'Seattle, WA', 'Austin, TX'][index % 6],
      professionalTitle: profession,
      summary: `Experienced ${profession.toLowerCase()} with over ${5 + (index % 15)} years of expertise in delivering exceptional results. Proven track record of driving innovation, leading cross-functional teams, and achieving strategic business objectives. Skilled in ${skillSet.slice(0, 4).join(', ')}, and committed to continuous improvement and excellence.`
    },
    experience: [
      {
        company: company,
        position: `Senior ${profession}`,
        startDate: `${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][index % 6]} ${2020 - (index % 5)}`,
        endDate: 'Present',
        description: `<ul><li>Led ${['strategic initiatives', 'digital transformation', 'operational excellence', 'team development', 'product innovation'][index % 5]} resulting in ${20 + (index % 80)}% improvement in key metrics.</li><li>Managed ${['cross-functional teams', 'global projects', 'multi-million dollar budgets', 'stakeholder relationships', 'vendor partnerships'][index % 5]} with exceptional results.</li><li>Implemented ${['best practices', 'cutting-edge technologies', 'process improvements', 'data-driven strategies', 'agile methodologies'][index % 5]} to drive efficiency.</li></ul>`
      },
      {
        company: companies[(index + 1) % companies.length],
        position: profession,
        startDate: `${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][(index + 2) % 6]} ${2015 - (index % 5)}`,
        endDate: `${['Dec', 'Nov', 'Oct', 'Sep', 'Aug'][(index) % 5]} ${2020 - (index % 5)}`,
        description: `<ul><li>Developed and executed ${['successful strategies', 'innovative solutions', 'comprehensive programs', 'efficient systems', 'quality standards'][index % 5]}.</li><li>Collaborated with ${['executive leadership', 'technical teams', 'external partners', 'key stakeholders', 'global offices'][index % 5]} to achieve goals.</li><li>Achieved ${['cost savings', 'revenue growth', 'market expansion', 'customer satisfaction', 'operational efficiency'][index % 5]} targets consistently.</li></ul>`
      }
    ],
    education: [
      {
        school: school,
        degree: ['Master of Science', 'Master of Business Administration', 'Bachelor of Science', 'Bachelor of Arts', 'Master of Engineering'][index % 5],
        field: profession,
        graduationYear: String(2010 + (index % 10))
      },
      {
        school: education[(index + 1) % education.length],
        degree: 'Bachelor of Science',
        field: ['Computer Science', 'Business Administration', 'Engineering', 'Marketing', 'Finance'][index % 5],
        graduationYear: String(2006 + (index % 8))
      }
    ],
    skills: [...skillSet, ...['Communication', 'Leadership', 'Problem Solving', 'Strategic Thinking', 'Team Collaboration'].slice(0, 3)]
  };
};

// Generate a single template
const generateTemplate = (index: number) => {
  const palette = colorPalettes[index % colorPalettes.length];
  const layout = layouts[index % layouts.length];
  const category = categories[index % categories.length];
  const fontFamily = fontFamilies[index % fontFamilies.length];
  const spacing = spacingOptions[index % spacingOptions.length];
  const fontSize = fontSizes[index % fontSizes.length];
  const borderRadius = borderRadiusOptions[index % borderRadiusOptions.length];
  
  const isPremium = index % 3 === 0; // Every 3rd template is premium
  const subscription = isPremium ? 'Premium' : 'Free';
  
  return {
    mainsection: {
      id: `template-${index + 1}`,
      name: `${palette.name} ${layout.replace('-', ' ').toUpperCase()}`,
      description: `A ${layout.replace('-', ' ')} ${category} design using ${fontFamily}. Perfect for ${category} resumes with a ${palette.name.toLowerCase()} color scheme.`,
      resumeinfo: {
        isPremium,
        subscription
      }
    },
    secondary: {
      style: {
        primaryColor: palette.primary,
        secondaryColor: palette.secondary,
        accentColor: palette.accent,
        fontFamily: fontFamily,
        isSerif: index % 7 === 0, // Some use serif fonts
        layout: layout,
        spacing: spacing,
        borderRadius: borderRadius,
        fontSize: fontSize,
        textColor: '#1f2937',
        backgroundColor: '#ffffff'
      },
      data: generateContent(index)
    }
  };
};

// Generate all 100 templates
export const generateAllTemplates = () => {
  return Array.from({ length: 100 }, (_, index) => generateTemplate(index));
};
