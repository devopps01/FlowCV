import { z } from 'zod';

// ============================================
// RESUME CONTENT SCHEMAS WITH UNIQUE IDs
// ============================================

// Personal Information Schema
export const personalInfoSchema = z.object({
  id: z.string().default('personal'),
  fullName: z.string().min(1, 'Full name is required'),
  professionalTitle: z.string().optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional(),
  location: z.string().optional(),
  summary: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  linkedIn: z.string().optional(),
  website: z.string().optional(),
  image: z.string().optional(),
  photo: z.string().optional(),
});

// Experience Schema with ID
export const experienceSchema = z.array(
  z.object({
    id: z.string(),
    company: z.string().min(1, 'Company name is required'),
    position: z.string().min(1, 'Position is required'),
    location: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional().or(z.literal('')),
    current: z.boolean().optional(),
    description: z.string().optional(),
  })
);

// Education Schema with ID
export const educationSchema = z.array(
  z.object({
    id: z.string(),
    school: z.string().min(1, 'School name is required'),
    degree: z.string().optional(),
    field: z.string().optional(),
    location: z.string().optional(),
    graduationYear: z.string().optional(),
    description: z.string().optional(),
  })
);

// Skills Schema with ID
export const skillsSchema = z.array(
  z.object({
    id: z.string(),
    name: z.string().min(1, 'Skill name is required'),
  })
);

// Languages Schema with ID
export const languagesSchema = z.array(
  z.object({
    id: z.string(),
    language: z.string().min(1, 'Language is required'),
    proficiency: z.string().optional(),
  })
);

// Certifications Schema with ID
export const certificationsSchema = z.array(
  z.object({
    id: z.string(),
    name: z.string().min(1, 'Certificate name is required'),
    issuer: z.string().optional(),
    date: z.string().optional(),
    description: z.string().optional(),
  })
);

// Projects Schema with ID
export const projectsSchema = z.array(
  z.object({
    id: z.string(),
    name: z.string().min(1, 'Project name is required'),
    description: z.string().optional(),
    technologies: z.array(z.string()).optional(),
  })
);

// Courses Schema with ID
export const coursesSchema = z.array(
  z.object({
    id: z.string(),
    title: z.string().min(1, 'Course title is required'),
    provider: z.string().optional(),
    date: z.string().optional(),
    description: z.string().optional(),
  })
);

// Awards Schema with ID
export const awardsSchema = z.array(
  z.object({
    id: z.string(),
    title: z.string().min(1, 'Award title is required'),
    issuer: z.string().optional(),
    date: z.string().optional(),
    description: z.string().optional(),
  })
);

// Organisations Schema with ID
export const organisationsSchema = z.array(
  z.object({
    id: z.string(),
    name: z.string().min(1, 'Organisation name is required'),
    role: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional().or(z.literal('')),
    description: z.string().optional(),
  })
);

// Publications Schema with ID
export const publicationsSchema = z.array(
  z.object({
    id: z.string(),
    title: z.string().min(1, 'Publication title is required'),
    publisher: z.string().optional(),
    date: z.string().optional(),
    url: z.string().optional().or(z.literal('')),
    description: z.string().optional(),
  })
);

// References Schema with ID
export const referencesSchema = z.array(
  z.object({
    id: z.string(),
    name: z.string().min(1, 'Reference name is required'),
    position: z.string().optional(),
    company: z.string().optional(),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    phone: z.string().optional(),
    relationship: z.string().optional(),
  })
);

// Socials Schema with ID
export const socialsSchema = z.array(
  z.object({
    id: z.string(),
    platform: z.string().optional(),
    url: z.string().optional(),
    label: z.string().optional(),
  })
);

// Declaration Schema
export const declarationSchema = z.object({
  text: z.string().optional(),
  signature: z.string().optional(),
  date: z.string().optional(),
  place: z.string().optional(),
});

// Custom Section Schema with ID
export const customSchema = z.array(
  z.object({
    id: z.string(),
    title: z.string().min(1, 'Title is required'),
    content: z.string().optional(),
  })
);

// Interests Schema with ID
export const interestsSchema = z.array(
  z.object({
    id: z.string(),
    name: z.string().min(1, 'Interest name is required'),
  })
);

// Complete Resume Form Schema
export const resumeFormSchema = z.object({
  title: z.string().min(1, 'Resume title is required'),
  template: z.string().default('modern'),
  content: z.object({
    personalInfo: personalInfoSchema,
    experience: experienceSchema.default([]),
    education: educationSchema.default([]),
    skills: skillsSchema.default([]),
    languages: languagesSchema.default([]),
    certifications: certificationsSchema.default([]),
    interests: interestsSchema.default([]),
    projects: projectsSchema.default([]),
    courses: coursesSchema.default([]),
    awards: awardsSchema.default([]),
    organisations: organisationsSchema.default([]),
    publications: publicationsSchema.default([]),
    references: referencesSchema.default([]),
    socials: socialsSchema.default([]),
    declaration: declarationSchema.default({}),
    custom: customSchema.default([]),
  }),
  design: z.object({
    primaryColor: z.string(),
    fontFamily: z.string(),
    fontSize: z.number().optional(),
    lineHeight: z.number().optional(),
    textColor: z.string().optional(),
    backgroundColor: z.string().optional(),
    layout: z.enum(['single', 'two-column']).optional(),
    spacing: z.number().optional(),
    borderRadius: z.enum(['none', 'md', 'lg', 'xl']).optional(),
    shadow: z.enum(['none', 'sm', 'md', 'lg']).optional(),
  }),
  activeSections: z.array(z.string()),
});

// Type inference
export type ResumeFormData = z.infer<typeof resumeFormSchema>;
export type PersonalInfoData = z.infer<typeof personalInfoSchema>;
export type ExperienceData = z.infer<typeof experienceSchema>[number];
export type EducationData = z.infer<typeof educationSchema>[number];
export type SkillData = z.infer<typeof skillsSchema>[number];
export type LanguageData = z.infer<typeof languagesSchema>[number];
export type CertificationData = z.infer<typeof certificationsSchema>[number];
export type ProjectData = z.infer<typeof projectsSchema>[number];
export type AwardData = z.infer<typeof awardsSchema>[number];
export type InterestData = z.infer<typeof interestsSchema>[number];
export type CourseData = z.infer<typeof coursesSchema>[number];
export type OrganisationData = z.infer<typeof organisationsSchema>[number];
export type PublicationData = z.infer<typeof publicationsSchema>[number];
export type ReferenceData = z.infer<typeof referencesSchema>[number];
export type SocialData = z.infer<typeof socialsSchema>[number];
export type CustomData = z.infer<typeof customSchema>[number];
export type DeclarationData = z.infer<typeof declarationSchema>;
