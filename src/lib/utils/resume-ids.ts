// ============================================
// UNIQUE ID GENERATOR UTILITY
// Single source of truth for all content IDs
// ============================================

const ID_COUNTER = {
  exp: 0,
  edu: 0,
  skill: 0,
  lang: 0,
  cert: 0,
  proj: 0,
  award: 0,
  interest: 0,
  course: 0,
  org: 0,
  pub: 0,
  ref: 0,
  custom: 0,
  social: 0,
};

export function generateId(prefix: string = ''): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 9);
  return prefix ? `${prefix}_${timestamp}${randomPart}` : `${timestamp}${randomPart}`;
}

export function generateExperienceId(): string {
  ID_COUNTER.exp++;
  return `exp_${Date.now().toString(36)}_${ID_COUNTER.exp}`;
}

export function generateEducationId(): string {
  ID_COUNTER.edu++;
  return `edu_${Date.now().toString(36)}_${ID_COUNTER.edu}`;
}

export function generateSkillId(): string {
  ID_COUNTER.skill++;
  return `skill_${Date.now().toString(36)}_${ID_COUNTER.skill}`;
}

export function generateLanguageId(): string {
  ID_COUNTER.lang++;
  return `lang_${Date.now().toString(36)}_${ID_COUNTER.lang}`;
}

export function generateCertificationId(): string {
  ID_COUNTER.cert++;
  return `cert_${Date.now().toString(36)}_${ID_COUNTER.cert}`;
}

export function generateProjectId(): string {
  ID_COUNTER.proj++;
  return `proj_${Date.now().toString(36)}_${ID_COUNTER.proj}`;
}

export function generateAwardId(): string {
  ID_COUNTER.award++;
  return `award_${Date.now().toString(36)}_${ID_COUNTER.award}`;
}

export function generateInterestId(): string {
  ID_COUNTER.interest++;
  return `interest_${Date.now().toString(36)}_${ID_COUNTER.interest}`;
}

export function generateCourseId(): string {
  ID_COUNTER.course++;
  return `course_${Date.now().toString(36)}_${ID_COUNTER.course}`;
}

export function generateOrganisationId(): string {
  ID_COUNTER.org++;
  return `org_${Date.now().toString(36)}_${ID_COUNTER.org}`;
}

export function generatePublicationId(): string {
  ID_COUNTER.pub++;
  return `pub_${Date.now().toString(36)}_${ID_COUNTER.pub}`;
}

export function generateReferenceId(): string {
  ID_COUNTER.ref++;
  return `ref_${Date.now().toString(36)}_${ID_COUNTER.ref}`;
}

export function generateCustomId(): string {
  ID_COUNTER.custom++;
  return `custom_${Date.now().toString(36)}_${ID_COUNTER.custom}`;
}

export function generateSocialId(): string {
  ID_COUNTER.social++;
  return `social_${Date.now().toString(36)}_${ID_COUNTER.social}`;
}

// Map of section types to their ID generators
export const ID_GENERATORS: Record<string, () => string> = {
  experience: generateExperienceId,
  education: generateEducationId,
  skills: generateSkillId,
  languages: generateLanguageId,
  certifications: generateCertificationId,
  projects: generateProjectId,
  awards: generateAwardId,
  interests: generateInterestId,
  courses: generateCourseId,
  organisations: generateOrganisationId,
  publications: generatePublicationId,
  references: generateReferenceId,
  custom: generateCustomId,
  socials: generateSocialId,
};

// Ensure all items in an array have unique IDs
export function ensureIds<T extends Record<string, any>>(
  items: T[],
  idField: keyof T = 'id' as keyof T,
  idGenerator: () => string = generateId
): T[] {
  return items.map((item) => {
    if (!item[idField] || item[idField] === '') {
      return { ...item, [idField]: idGenerator() };
    }
    return item;
  });
}

// Process entire content object and ensure all items have IDs
export function processContentWithIds(content: any): any {
  if (!content) return content;

  return {
    ...content,
    personalInfo: {
      id: 'personal',
      ...content.personalInfo,
    },
    experience: ensureIds(content.experience || [], 'id', generateExperienceId),
    education: ensureIds(content.education || [], 'id', generateEducationId),
    skills: ensureIds(
      (content.skills || []).map((s: string | { id?: string; name?: string }) => 
        typeof s === 'string' ? { id: generateSkillId(), name: s } : s
      ),
      'id',
      generateSkillId
    ),
    languages: ensureIds(content.languages || [], 'id', generateLanguageId),
    certifications: ensureIds(content.certifications || [], 'id', generateCertificationId),
    projects: ensureIds(content.projects || [], 'id', generateProjectId),
    awards: ensureIds(content.awards || [], 'id', generateAwardId),
    interests: ensureIds(
      (content.interests || []).map((i: string | { id?: string; name?: string }) => 
        typeof i === 'string' ? { id: generateInterestId(), name: i } : i
      ),
      'id',
      generateInterestId
    ),
    courses: ensureIds(content.courses || [], 'id', generateCourseId),
    organisations: ensureIds(content.organisations || [], 'id', generateOrganisationId),
    publications: ensureIds(content.publications || [], 'id', generatePublicationId),
    references: ensureIds(content.references || [], 'id', generateReferenceId),
    custom: ensureIds(content.custom || [], 'id', generateCustomId),
    socials: ensureIds(content.socials || [], 'id', generateSocialId),
  };
}

// Create new empty item with ID for a specific section type
export function createEmptyItem(sectionType: string): any {
  const generators: Record<string, () => any> = {
    experience: () => ({ id: generateExperienceId(), company: '', position: '', location: '', startDate: '', endDate: '', current: false, description: '' }),
    education: () => ({ id: generateEducationId(), school: '', degree: '', field: '', location: '', graduationYear: '', description: '' }),
    skills: () => ({ id: generateSkillId(), name: '' }),
    languages: () => ({ id: generateLanguageId(), language: '', proficiency: 'Intermediate' }),
    certifications: () => ({ id: generateCertificationId(), name: '', issuer: '', date: '', description: '' }),
    projects: () => ({ id: generateProjectId(), name: '', description: '', technologies: [] }),
    awards: () => ({ id: generateAwardId(), title: '', issuer: '', date: '', description: '' }),
    interests: () => ({ id: generateInterestId(), name: '' }),
    courses: () => ({ id: generateCourseId(), title: '', provider: '', date: '', description: '' }),
    organisations: () => ({ id: generateOrganisationId(), name: '', role: '', startDate: '', endDate: '', description: '' }),
    publications: () => ({ id: generatePublicationId(), title: '', publisher: '', date: '', url: '', description: '' }),
    references: () => ({ id: generateReferenceId(), name: '', position: '', company: '', email: '', phone: '', relationship: '' }),
    custom: () => ({ id: generateCustomId(), title: '', content: '' }),
    socials: () => ({ id: generateSocialId(), platform: '', url: '', label: '' }),
  };

  return generators[sectionType]?.() || { id: generateId() };
}

// Default resume content with proper unique IDs
export function getDefaultResumeContent() {
  return {
    personalInfo: {
      id: 'personal',
      fullName: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      location: '',
      professionalTitle: '',
      summary: '',
      linkedIn: '',
      website: '',
      photo: '',
    },
    experience: [],
    education: [],
    skills: [],
    languages: [],
    certifications: [],
    projects: [],
    awards: [],
    interests: [],
    courses: [],
    organisations: [],
    publications: [],
    references: [],
    socials: [],
    declaration: {
      text: '',
      signature: '',
      date: '',
      place: '',
    },
    custom: [],
  };
}

// Sample resume data with proper IDs for templates
export function getSampleResumeContent() {
  return {
    personalInfo: {
      id: 'personal',
      fullName: 'Alexandra Martinez',
      firstName: 'Alexandra',
      lastName: 'Martinez',
      email: 'alex.martinez@email.com',
      phone: '(555) 123-4567',
      location: 'San Francisco, CA',
      professionalTitle: 'Senior Product Manager',
      summary: 'Results-driven Product Manager with 8+ years of experience leading cross-functional teams to deliver innovative SaaS solutions. Proven track record of increasing revenue by 150% through strategic product roadmap development and user-centric design.',
      linkedIn: 'linkedin.com/in/alexmartinez',
      website: '',
      photo: '',
    },
    experience: [
      {
        id: generateExperienceId(),
        position: 'Senior Product Manager',
        company: 'TechCorp Inc.',
        location: 'San Francisco, CA',
        startDate: 'Jan 2021',
        endDate: 'Present',
        current: true,
        description: 'Led development of AI-powered analytics platform generating $12M ARR. Managed 15-person cross-functional team. Increased user retention by 45% through UX improvements.',
      },
      {
        id: generateExperienceId(),
        position: 'Product Manager',
        company: 'StartupXYZ',
        location: 'San Francisco, CA',
        startDate: 'Jun 2018',
        endDate: 'Dec 2020',
        current: false,
        description: 'Launched MVP in 6 months, acquired 50,000 users. Implemented OKR framework improving team velocity by 30%.',
      },
      {
        id: generateExperienceId(),
        position: 'Associate PM',
        company: 'Digital Solutions',
        location: 'Palo Alto, CA',
        startDate: 'Aug 2015',
        endDate: 'May 2018',
        current: false,
        description: 'Supported senior PMs on 3 concurrent projects serving 100K+ users. Created wireframes and PRDs.',
      },
      {
        id: generateExperienceId(),
        position: 'Marketing Analyst',
        company: 'BrandCo',
        location: 'San Jose, CA',
        startDate: 'Jun 2013',
        endDate: 'Jul 2015',
        current: false,
        description: 'Conducted market research. Improved campaign ROI by 45% through data-driven strategies.',
      },
      {
        id: generateExperienceId(),
        position: 'Business Analyst',
        company: 'Enterprise Corp',
        location: 'Oakland, CA',
        startDate: 'Jan 2013',
        endDate: 'May 2013',
        current: false,
        description: 'Assisted in strategic planning and market analysis projects.',
      },
    ],
    education: [
      {
        id: generateEducationId(),
        school: 'Stanford University',
        degree: 'MBA, Product Management',
        field: 'Business Administration',
        location: 'Stanford, CA',
        graduationYear: '2017',
        description: '',
      },
      {
        id: generateEducationId(),
        school: 'UC Berkeley',
        degree: 'BS Computer Science',
        field: 'Computer Science',
        location: 'Berkeley, CA',
        graduationYear: '2015',
        description: '',
      },
    ],
    skills: [
      { id: generateSkillId(), name: 'Product Strategy' },
      { id: generateSkillId(), name: 'Agile/Scrum' },
      { id: generateSkillId(), name: 'Data Analytics' },
      { id: generateSkillId(), name: 'SQL' },
      { id: generateSkillId(), name: 'Python' },
      { id: generateSkillId(), name: 'Figma' },
      { id: generateSkillId(), name: 'JIRA' },
      { id: generateSkillId(), name: 'A/B Testing' },
      { id: generateSkillId(), name: 'User Research' },
      { id: generateSkillId(), name: 'Roadmapping' },
      { id: generateSkillId(), name: 'Competitive Analysis' },
      { id: generateSkillId(), name: 'Team Leadership' },
      { id: generateSkillId(), name: 'Project Management' },
      { id: generateSkillId(), name: 'Data Visualization' },
      { id: generateSkillId(), name: 'Machine Learning' },
      { id: generateSkillId(), name: 'Cloud Computing' },
      { id: generateSkillId(), name: 'API Design' },
      { id: generateSkillId(), name: 'Customer Acquisition' },
      { id: generateSkillId(), name: 'Growth Hacking' },
      { id: generateSkillId(), name: 'Market Research' },
    ],
    languages: [
      { id: generateLanguageId(), language: 'English', proficiency: 'Native' },
      { id: generateLanguageId(), language: 'Spanish', proficiency: 'Fluent' },
      { id: generateLanguageId(), language: 'French', proficiency: 'Intermediate' },
    ],
    certifications: [
      { id: generateCertificationId(), name: 'PMP Certified', issuer: 'PMI', date: '2020', description: 'Project Management Professional' },
      { id: generateCertificationId(), name: 'AWS Solutions Architect', issuer: 'Amazon', date: '2021', description: 'Cloud Architecture' },
      { id: generateCertificationId(), name: 'Google Analytics', issuer: 'Google', date: '2019', description: 'Digital Analytics' },
      { id: generateCertificationId(), name: 'Scrum Master', issuer: 'Scrum Alliance', date: '2018', description: 'Agile Methodology' },
    ],
    projects: [
      { id: generateProjectId(), name: 'AI Analytics Dashboard', description: 'Built real-time analytics platform with ML predictions', technologies: ['React', 'Python', 'TensorFlow'] },
      { id: generateProjectId(), name: 'Mobile App Launch', description: 'Led 0-to-1 mobile app reaching 100K downloads', technologies: ['React Native', 'Firebase'] },
    ],
    awards: [
      { id: generateAwardId(), title: 'PM of the Year 2022', issuer: 'TechCorp', date: '2022', description: 'Outstanding product leadership' },
      { id: generateAwardId(), title: 'Best Product Launch', issuer: 'StartupXYZ', date: '2021', description: 'Successful MVP delivery' },
    ],
    interests: [
      { id: generateInterestId(), name: 'Technology' },
      { id: generateInterestId(), name: 'Travel' },
      { id: generateInterestId(), name: 'Photography' },
      { id: generateInterestId(), name: 'Reading' },
      { id: generateInterestId(), name: 'Hiking' },
      { id: generateInterestId(), name: 'Cooking' },
    ],
    courses: [],
    organisations: [],
    publications: [],
    references: [],
    socials: [],
    declaration: {
      text: '',
      signature: '',
      date: '',
      place: '',
    },
    custom: [],
  };
}
