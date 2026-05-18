export interface Experience {
  id: string;
  company: string;
  position: string;
  location?: string;
  startDate: string;
  endDate: string;
  current?: boolean;
  description: string;
  hidden?: boolean; // Show/hide in resume
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  field: string;
  location?: string;
  graduationYear: string;
  description?: string;
  hidden?: boolean; // Show/hide in resume
}

export interface Skill {
  id: string;
  name: string;
  hidden?: boolean; // Show/hide in resume
}

export interface Language {
  id: string;
  language: string;
  proficiency: string;
  hidden?: boolean; // Show/hide in resume
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  description?: string;
  hidden?: boolean; // Show/hide in resume
}

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  hidden?: boolean; // Show/hide in resume
}

export interface Award {
  id: string;
  title: string;
  issuer: string;
  date: string;
  description?: string;
  hidden?: boolean; // Show/hide in resume
}

export interface Interest {
  id: string;
  name: string;
  hidden?: boolean; // Show/hide in resume
}

export interface Course {
  id: string;
  title: string;
  provider: string;
  date: string;
  description: string;
  hidden?: boolean; // Show/hide in resume
}

export interface Organisation {
  id: string;
  name: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
  hidden?: boolean; // Show/hide in resume
}

export interface Publication {
  id: string;
  title: string;
  publisher: string;
  date: string;
  url: string;
  description: string;
  hidden?: boolean; // Show/hide in resume
}

export interface Reference {
  id: string;
  name: string;
  position: string;
  company: string;
  email: string;
  phone: string;
  relationship: string;
  hidden?: boolean; // Show/hide in resume
}

export interface Social {
  id: string;
  platform: string;
  url: string;
  label: string;
  hidden?: boolean; // Show/hide in resume
}

export interface Custom {
  id: string;
  title: string;
  content: string;
  hidden?: boolean; // Show/hide in resume
}

export interface Declaration {
  text: string;
  signature: string;
  date: string;
  place?: string;
}

export interface ResumeData {
  title: string;
  template: string;
  content: {
    personalInfo: {
      id: string;
      fullName: string;
      email: string;
      phone: string;
      location: string;
      professionalTitle: string;
      summary: string;
      image?: string;
      photo?: string;
      linkedIn?: string;
      website?: string;
    };
    experience: Experience[];
    education: Education[];
    skills: Skill[];
    languages: Language[];
    certifications: Certification[];
    interests: Interest[];
    socials: Social[];
    projects: Project[];
    courses: Course[];
    awards: Award[];
    organisations: Organisation[];
    publications: Publication[];
    references: Reference[];
    declaration?: Declaration;
    custom: Custom[];
  };
  design: {
    // --- Spacing ---
    fontSize: number;
    lineHeight: number;
    marginLR: number; // Left & Right Margin
    marginTB: number; // Top & Bottom Margin
    entrySpacing: number; // Space between Entries
    sectionSpacing: number; // Space between Sections

    // --- Colors ---
    primaryColor: string;
    secondaryColor?: string;
    textColor: string;
    backgroundColor: string;
    borderColor?: string;
    accentColor?: string;
    accentType?: 'basic' | 'advanced' | 'border' | 'image' | 'multi';
    applyAccentTo: string[]; // ['name', 'jobTitle', 'headings', 'headingLine', 'dots', 'dates', 'subtitle', 'linkIcons', 'headerIcons']
    accentOverrides?: Record<string, string>;

    // --- Font ---
    fontFamily: string;
    fontCategory: 'serif' | 'sans' | 'mono';
    
    // --- Section Headings ---
    /**
     * Section heading style id.
     * Note: this is intentionally a string to allow a large pattern library
     * (e.g. "underline_w60_t3", "badge_r10", etc) without exploding the TS union.
     */
    headingStyle: string;
    headingCapitalization: 'uppercase' | 'capitalize' | 'none';
    headingSize: 's' | 'm' | 'l' | 'xl';
    headingIconType: 'none' | 'outline' | 'filled';
    headingLineThickness?: number; // px, default 2
    headingLineWidth?: number; // percent, default 100


    // --- Entry Layout ---
    entryLayout: 'default' | 'side-date' | 'compact' | 'split';
    entryColumnWidth: 'auto' | 'manual';
    entryTitleSize: 's' | 'm' | 'l';
    entrySubtitleStyle: 'normal' | 'bold' | 'italic';
    entrySubtitlePlacement: 'same-line' | 'next-line';
    descriptionIndent: boolean;
    listStyle: 'bullet' | 'hyphen' | 'none';

    // --- Footer ---
    showPageNumbers: boolean;
    showEmailInFooter: boolean;
    showNameInFooter: boolean;

    // --- Link Styling ---
    linkUnderline: boolean;
    linkBlueColor: boolean;
    linkIcon: boolean;

    // --- Personal Details ---
    personalAlign: 'left' | 'center' | 'right';
    personalArrangement: 'default' | 'compact' | 'column';
    personalIconShow: boolean;
    personalBulletShow: boolean;
    personalBarShow: boolean;
    personalIconStyle: 'default' | 'circle' | 'square' | 'none';

    // --- Name ---
    nameSize: 'xs' | 's' | 'm' | 'l' | 'xl';
    nameBold: boolean;
    nameFontType: 'body' | 'creative';

    // --- Professional Title ---
    titleSize: 's' | 'm' | 'l';
    titlePosition: 'same-line' | 'below';
    titleStyle: 'normal' | 'italic';

    // --- Photo ---
    photoShow: boolean;
    photoGrayscale: boolean;
    photoSize: 'xs' | 's' | 'm' | 'l' | 'xl';
    photoShape: 'circle' | 'rounded' | 'square' | 'hexagon';

    // --- Component Specific ---
    skillsStyle: 'grid' | 'level' | 'compact' | 'bubble';
    skillsColumns: number;
    languagesStyle: 'grid' | 'level' | 'compact' | 'bubble';
    languagesColumns: number;
    interestsStyle: 'grid' | 'compact' | 'bubble';
    interestsColumns: number;
    certificationsStyle: 'grid' | 'compact' | 'bubble';
    certificationsColumns: number;

    // --- Summary ---
    showSummaryHeading: boolean;

    // --- Education / Work Experience Order ---
    educationOrder: 'degree-school' | 'school-degree';
    workOrder: 'title-employer' | 'employer-title';
    workGroupPromotions: boolean;

    // --- General ---
    layout: 'single' | 'single-centered' | 'single-compact' | 'single-minimal' | 'two-column' | 'two-column-reverse' | 'sidebar-left' | 'sidebar-left-wide' | 'sidebar-left-narrow' | 'sidebar-right' | 'sidebar-right-wide' | 'sidebar-right-narrow' | 'modern-header' | 'modern-header-dark' | 'modern-header-split' | 'double-header' | 'double-header-bold' | 'timeline' | 'timeline-left' | 'card-header' | 'infographic';
    borderRadius?: 'none' | 'md' | 'lg' | 'xl';
    shadow?: 'none' | 'sm' | 'md' | 'lg';
  };
  activeSections: string[];
  // Per-element style overrides: key = data-edit-path, value = CSS properties
  styleOverrides?: Record<string, React.CSSProperties>;
}
