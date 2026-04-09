// ============================================
// AI RESUME GENERATOR TYPES WITH UNIQUE IDs
// ============================================

export interface MinimalUserInput {
  name?: string;
  role?: string;
  email?: string;
  phone?: string;
  location?: string;
  experienceYears?: number;
  skills?: string[];
  education?: {
    degree?: string;
    field?: string;
    year?: number;
  };
  summary?: string;
  linkedIn?: string;
  website?: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  achievements: string[];
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  link?: string;
}

export interface Skill {
  id: string;
  name: string;
  level: string;
}

export interface Language {
  id: string;
  language: string;
  proficiency: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
}

export interface GeneratedResumeData {
  personalInfo: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    location: string;
    summary: string;
    linkedIn: string;
    website: string;
    photo: string;
  };
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  languages: Language[];
  certifications: Certification[];
  projects: Project[];
}

export interface GeneratedLayout {
  type: 'single' | 'two-column' | 'sidebar' | 'modern';
  positions: Record<string, { x: number; y: number }>;
}

export interface GeneratedDesign {
  fontFamily: string;
  fontSize: number;
  primaryColor: string;
  backgroundColor: string;
}

export interface FullResumeOutput {
  resumeData: GeneratedResumeData;
  layout: GeneratedLayout;
  design: GeneratedDesign;
  meta: {
    generatedAt: string;
    confidence: number;
    suggestions: string[];
  };
}
