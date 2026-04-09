import mongoose, { Schema, Document } from 'mongoose';

// ============================================
// RESUME DATABASE MODEL WITH UNIQUE IDs
// ============================================

export interface ICanvasElement {
  id: string;
  type: 'text' | 'image' | 'rect' | 'circle' | 'line';
  content?: string;
  src?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  locked: boolean;
  visible: boolean;
  style: {
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string;
    fontStyle?: string;
    color?: string;
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
    borderRadius?: number;
    textAlign?: 'left' | 'center' | 'right';
    lineHeight?: number;
    letterSpacing?: number;
    opacity: number;
  };
}

// Content interfaces with IDs
export interface IPersonalInfo {
  id: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  professionalTitle: string;
  summary: string;
  linkedIn: string;
  website: string;
  photo: string;
}

export interface IExperience {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface IEducation {
  id: string;
  school: string;
  degree: string;
  field: string;
  location: string;
  graduationYear: string;
  description: string;
}

export interface ISkill {
  id: string;
  name: string;
}

export interface ILanguage {
  id: string;
  language: string;
  proficiency: string;
}

export interface ICertification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  description: string;
}

export interface IProject {
  id: string;
  name: string;
  description: string;
  technologies: string[];
}

export interface IAward {
  id: string;
  title: string;
  issuer: string;
  date: string;
  description: string;
}

export interface IInterest {
  id: string;
  name: string;
}

export interface ICourse {
  id: string;
  title: string;
  provider: string;
  date: string;
  description: string;
}

export interface IOrganisation {
  id: string;
  name: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface IPublication {
  id: string;
  title: string;
  publisher: string;
  date: string;
  url: string;
  description: string;
}

export interface IReference {
  id: string;
  name: string;
  position: string;
  company: string;
  email: string;
  phone: string;
  relationship: string;
}

export interface ISocial {
  id: string;
  platform: string;
  url: string;
  label: string;
}

export interface IDeclaration {
  text: string;
  signature: string;
  date: string;
  place: string;
}

export interface ICustom {
  id: string;
  title: string;
  content: string;
}

export interface IResumeContent {
  personalInfo: IPersonalInfo;
  experience: IExperience[];
  education: IEducation[];
  skills: ISkill[];
  languages: ILanguage[];
  certifications: ICertification[];
  projects: IProject[];
  awards: IAward[];
  interests: IInterest[];
  courses: ICourse[];
  organisations: IOrganisation[];
  publications: IPublication[];
  references: IReference[];
  socials: ISocial[];
  declaration?: IDeclaration;
  custom: ICustom[];
}

export interface IResume extends Document {
  userId: string;
  title: string;
  template: string;
  elements: ICanvasElement[];
  content: IResumeContent;
  canvasData: {
    elements: Record<string, ICanvasElement>;
    order: string[];
  };
  design: Record<string, any>;
  activeSections: string[];
  createdAt: Date;
  updatedAt: Date;
}

const CanvasElementSchema = new Schema({
  id: { type: String, required: true },
  type: { type: String, enum: ['text', 'image', 'rect', 'circle', 'line'], required: true },
  content: { type: String },
  src: { type: String },
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  rotation: { type: Number, default: 0 },
  zIndex: { type: Number, default: 0 },
  locked: { type: Boolean, default: false },
  visible: { type: Boolean, default: true },
  style: {
    fontSize: Number,
    fontFamily: String,
    fontWeight: String,
    fontStyle: String,
    color: String,
    backgroundColor: String,
    borderColor: String,
    borderWidth: Number,
    borderRadius: Number,
    textAlign: String,
    lineHeight: Number,
    letterSpacing: Number,
    opacity: { type: Number, default: 1 }
  }
}, { _id: false });

const ResumeSchema = new Schema({
  userId: { type: String, required: true, index: true },
  title: { type: String, default: 'Untitled Resume' },
  template: { type: String, default: 'classic' },
  elements: [CanvasElementSchema],
  content: {
    personalInfo: {
      id: { type: String, default: 'personal' },
      fullName: { type: String, default: '' },
      firstName: { type: String, default: '' },
      lastName: { type: String, default: '' },
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
      location: { type: String, default: '' },
      professionalTitle: { type: String, default: '' },
      summary: { type: String, default: '' },
      linkedIn: { type: String, default: '' },
      website: { type: String, default: '' },
      photo: { type: String, default: '' },
    },
    experience: [Schema.Types.Mixed],
    education: [Schema.Types.Mixed],
    skills: [Schema.Types.Mixed],
    languages: [Schema.Types.Mixed],
    certifications: [Schema.Types.Mixed],
    projects: [Schema.Types.Mixed],
    awards: [Schema.Types.Mixed],
    interests: [Schema.Types.Mixed],
    courses: [Schema.Types.Mixed],
    organisations: [Schema.Types.Mixed],
    publications: [Schema.Types.Mixed],
    references: [Schema.Types.Mixed],
    socials: [Schema.Types.Mixed],
    declaration: Schema.Types.Mixed,
    custom: [Schema.Types.Mixed],
  },
  canvasData: {
    elements: { type: Map, of: CanvasElementSchema },
    order: [String]
  },
  design: { type: Schema.Types.Mixed, default: {} },
  activeSections: { type: [String], default: ['summary', 'experience', 'education', 'skills'] }
}, { timestamps: true });

export const Resume = mongoose.models.Resume || mongoose.model<IResume>('Resume', ResumeSchema);
