import { Types } from 'mongoose';

export interface User {
  _id: Types.ObjectId;
  email: string;
  password?: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  isPremium: boolean;
  avatar?: string;
  provider: 'credentials' | 'google' | 'github';
}

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  linkedIn: string;
  website: string;
  photo?: string;
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

export interface Project {
  id: string;
  name: string;
  description: string;
  link: string;
}

export interface ResumeContent {
  personalInfo: PersonalInfo;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  languages: Language[];
  certifications: Certification[];
  projects: Project[];
}

export interface DesignSettings {
  fontFamily: string;
  fontSize: number;
  primaryColor: string;
  backgroundColor: string;
  layout: 'single' | 'two-column';
  spacing: number;
  pageSize: 'A4' | 'Letter';
}

export interface Resume {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  title: string;
  template: string;
  content: ResumeContent;
  design: DesignSettings;
  isPublic: boolean;
  shareSlug: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CoverLetterContent {
  recipientName: string;
  recipientEmail: string;
  recipientCompany: string;
  subject: string;
  body: string;
}

export interface CoverLetter {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  resumeId?: Types.ObjectId;
  title: string;
  template: string;
  content: CoverLetterContent;
  design: {
    fontFamily: string;
    primaryColor: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Template {
  id: string;
  name: string;
  slug: string;
  category: 'simple' | 'modern' | 'creative';
  thumbnail: string;
  preview: string;
  isPremium: boolean;
  styles: {
    fontFamily: string;
    primaryColor: string;
    layout: 'single' | 'two-column';
  };
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  period: 'month' | 'year';
  features: string[];
  isPopular?: boolean;
  resumeLimit: number;
  coverLetterLimit: number;
}
