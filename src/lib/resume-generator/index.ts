import {
  MinimalUserInput,
  GeneratedResumeData,
  Experience,
  Education,
  Project,
  Skill,
  Language,
  Certification,
  FullResumeOutput,
  GeneratedLayout,
  GeneratedDesign,
} from './types';

const TECHNICAL_SKILLS: Record<string, string[]> = {
  frontend: ['React', 'Vue.js', 'Angular', 'TypeScript', 'JavaScript', 'HTML/CSS', 'Next.js', 'Tailwind CSS'],
  backend: ['Node.js', 'Express', 'Python', 'Django', 'Flask', 'Java', 'Spring Boot', 'Go'],
  database: ['MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Elasticsearch', 'SQLite'],
  devops: ['Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'CI/CD', 'Jenkins', 'GitHub Actions'],
  mobile: ['React Native', 'Flutter', 'Swift', 'Kotlin', 'iOS', 'Android'],
  data: ['Python', 'Pandas', 'NumPy', 'TensorFlow', 'PyTorch', 'SQL', 'Tableau'],
  design: ['Figma', 'Adobe XD', 'Sketch', 'UI/UX', 'Photoshop', 'Illustrator'],
};

const COMPANY_NAMES = [
  'TechVision Solutions', 'Digital Dynamics', 'CloudNine Technologies', 'DataStream Inc',
  'InnovateTech', 'ByteWorks', 'CodeCraft Systems', 'NexGen Software', 'TechBridge Labs',
  'Vertex Technologies', 'Synergy Solutions', 'Quantum Leap Tech', 'Horizon Digital',
  'PrimeSoft Technologies', 'Matrix Innovations', 'Pioneer Tech', 'Apex Systems',
];

const SCHOOLS = [
  'Stanford University', 'MIT', 'Harvard University', 'UC Berkeley', 'Carnegie Mellon',
  'Georgia Tech', 'University of Washington', 'UT Austin', 'UCLA', 'University of Michigan',
  'Arizona State University', 'Boston University', 'NYU', 'Columbia University', 'Cornell University',
  'Purdue University', 'University of Florida', 'Texas A&M', 'Ohio State University', 'Penn State',
];

const PROJECT_TEMPLATES: Record<string, Array<{ name: string; desc: string; tech: string[] }>> = {
  developer: [
    { name: 'Full-Stack Web Application', desc: 'Built a responsive web application with modern UI, RESTful APIs, and optimized database queries', tech: ['React', 'Node.js', 'MongoDB'] },
    { name: 'REST API with Authentication', desc: 'Developed secure REST API with JWT authentication, role-based access, and comprehensive documentation', tech: ['Node.js', 'Express', 'PostgreSQL'] },
    { name: 'Real-Time Chat Application', desc: 'Created real-time messaging platform using WebSocket with message persistence and user presence', tech: ['Socket.io', 'Redis', 'MongoDB'] },
  ],
  data: [
    { name: 'Data Visualization Dashboard', desc: 'Built interactive dashboards for analyzing business metrics with real-time updates', tech: ['Python', 'Pandas', 'Plotly'] },
    { name: 'Machine Learning Pipeline', desc: 'Developed automated ML pipeline for predictive modeling with model versioning', tech: ['Python', 'TensorFlow', 'Docker'] },
    { name: 'ETL Data Pipeline', desc: 'Created automated ETL process for data extraction, transformation, and loading', tech: ['Python', 'SQL', 'Airflow'] },
  ],
  design: [
    { name: 'UI Component Library', desc: 'Designed and documented reusable component library with accessibility focus', tech: ['Figma', 'React', 'Storybook'] },
    { name: 'Mobile App Design System', desc: 'Created comprehensive design system for iOS and Android platforms', tech: ['Figma', 'Principle'] },
    { name: 'E-commerce Redesign', desc: 'Led complete UX redesign improving conversion rate by 40%', tech: ['Figma', 'User Research'] },
  ],
  default: [
    { name: 'Web Application', desc: 'Developed full-stack web application with modern architecture', tech: ['React', 'Node.js', 'MongoDB'] },
    { name: 'API Service', desc: 'Built scalable API service with comprehensive testing', tech: ['Node.js', 'Express', 'PostgreSQL'] },
    { name: 'Dashboard Application', desc: 'Created analytics dashboard with real-time data visualization', tech: ['React', 'D3.js', 'MongoDB'] },
  ],
};

const ACHIEVEMENT_TEMPLATES = [
  'Improved system performance by {percent}% through optimization',
  'Reduced deployment time by {percent}% with CI/CD implementation',
  'Led team of {num} developers on critical project delivery',
  'Achieved {percent}% increase in user engagement',
  'Migrated legacy system to modern architecture',
  'Implemented security protocols reducing vulnerabilities by {percent}%',
  'Streamlined database queries resulting in {percent}% faster load times',
  'Developed automated testing suite increasing code coverage to {percent}%',
];

export class ResumeGenerator {
  private input: MinimalUserInput;
  private generatedAt: Date;

  constructor(input: MinimalUserInput) {
    this.input = this.normalizeInput(input);
    this.generatedAt = new Date();
  }

  private normalizeInput(input: MinimalUserInput): MinimalUserInput {
    return {
      name: input.name || 'John Doe',
      role: input.role || 'Software Developer',
      email: input.email || this.generateEmail(input.name),
      phone: input.phone || '(555) 123-4567',
      location: input.location || 'San Francisco, CA',
      experienceYears: input.experienceYears || 0,
      skills: input.skills || [],
      education: input.education || { degree: 'Bachelor\'s', field: 'Computer Science', year: new Date().getFullYear() - 4 },
      summary: input.summary || '',
      linkedIn: input.linkedIn || '',
      website: input.website || '',
    };
  }

  private generateEmail(name?: string): string {
    const namePart = (name || 'john').toLowerCase().replace(/\s+/g, '.');
    return `${namePart}@email.com`;
  }

  private getRoleCategory(): string {
    const role = this.input.role?.toLowerCase() || '';
    
    if (role.includes('data') || role.includes('analyst') || role.includes('scientist')) return 'data';
    if (role.includes('design') || role.includes('ui') || role.includes('ux')) return 'design';
    if (role.includes('mobile') || role.includes('ios') || role.includes('android')) return 'mobile';
    if (role.includes('frontend') || role.includes('frontend')) return 'frontend';
    if (role.includes('backend') || role.includes('backend')) return 'backend';
    if (role.includes('devops') || role.includes('sre') || role.includes('cloud')) return 'devops';
    
    return 'developer';
  }

  generate(): FullResumeOutput {
    return {
      resumeData: this.generateResumeData(),
      layout: this.generateLayout(),
      design: this.generateDesign(),
      meta: {
        generatedAt: this.generatedAt.toISOString(),
        confidence: this.calculateConfidence(),
        suggestions: this.generateMetaSuggestions(),
      },
    };
  }

  private generateResumeData(): GeneratedResumeData {
    const roleCategory = this.getRoleCategory();
    
    return {
      personalInfo: this.generatePersonalInfo(),
      experience: this.generateExperience(roleCategory),
      education: this.generateEducation(),
      skills: this.generateSkills(roleCategory),
      languages: this.generateLanguages(),
      certifications: this.generateCertifications(roleCategory),
      projects: this.generateProjects(roleCategory),
    };
  }

  private generatePersonalInfo(): GeneratedResumeData['personalInfo'] {
    const nameParts = (this.input.name || 'John Doe').split(' ');
    const firstName = nameParts[0] || 'John';
    const lastName = nameParts.slice(1).join(' ') || 'Doe';

    const summaryTemplates = this.getSummaryTemplates();
    const summaryTemplate = summaryTemplates[Math.floor(Math.random() * summaryTemplates.length)];

    const skillsStr = this.input.skills?.slice(0, 5).join(', ') || 'modern technologies';
    const years = this.input.experienceYears || 1;

    return {
      firstName,
      lastName,
      email: this.input.email || '',
      phone: this.input.phone || '',
      location: this.input.location || '',
      summary: this.input.summary || summaryTemplate
        .replace('{years}', years.toString())
        .replace('{skills}', skillsStr)
        .replace('{role}', this.input.role || 'Software Developer'),
      linkedIn: this.input.linkedIn || '',
      website: this.input.website || '',
      photo: '',
    };
  }

  private getSummaryTemplates(): string[] {
    const years = this.input.experienceYears || 1;
    
    if (years >= 5) {
      return [
        'Seasoned {role} with {years}+ years of experience architecting scalable solutions. Proven track record in leading high-performance teams and delivering complex projects. Expertise in {skills}.',
        'Senior {role} driving innovation through cutting-edge technology solutions. {years}+ years of hands-on experience in full-stack development, cloud infrastructure, and team leadership.',
      ];
    } else if (years >= 2) {
      return [
        'Motivated {role} with {years}+ years of experience building production-ready applications. Skilled in {skills}. Passionate about clean code and continuous learning.',
        'Results-driven {role} passionate about creating efficient, scalable solutions. {years}+ years of experience working with {skills}.',
      ];
    } else {
      return [
        'Ambitious {role} with foundational experience in {skills}. Quick learner committed to writing clean, maintainable code and eager to contribute to meaningful projects.',
        'Enthusiastic recent graduate with hands-on project experience in {skills}. Seeking to leverage academic knowledge in a challenging {role} role.',
      ];
    }
  }

  private generateExperience(roleCategory: string): Experience[] {
    const years = this.input.experienceYears || 0;
    const experiences: Experience[] = [];
    
    const numExperiences = years === 0 ? 1 : Math.min(Math.max(2, Math.ceil(years / 1.5)), 5);
    
    const positions = this.getPositionsForRole(roleCategory);
    
    for (let i = 0; i < numExperiences; i++) {
      const yearsAgo = i * 1.5;
      const startYear = new Date().getFullYear() - Math.floor(yearsAgo);
      const endYear = i === 0 ? 'Present' : (startYear + 1).toString();
      
      const company = COMPANY_NAMES[Math.floor(Math.random() * COMPANY_NAMES.length)];
      const position = positions[i % positions.length];
      
      const achievements = this.generateAchievements(roleCategory, i);
      
      experiences.push({
        id: `exp-${i}`,
        company,
        position,
        location: this.input.location || 'San Francisco, CA',
        startDate: `${this.getMonthName(11)} ${startYear}`,
        endDate: endYear,
        current: i === 0,
        description: this.generateJobDescription(position, roleCategory),
        achievements,
      });
    }
    
    return experiences;
  }

  private getPositionsForRole(category: string): string[] {
    const positions: Record<string, string[]> = {
      backend: ['Backend Developer', 'Software Engineer', 'Node.js Developer', 'API Developer', 'Full Stack Developer'],
      frontend: ['Frontend Developer', 'UI Engineer', 'React Developer', 'Web Developer', 'JavaScript Developer'],
      data: ['Data Engineer', 'Data Analyst', 'Python Developer', 'ML Engineer', 'Analytics Engineer'],
      design: ['UI/UX Designer', 'Product Designer', 'Visual Designer', 'UX Researcher', 'Design Lead'],
      mobile: ['Mobile Developer', 'iOS Developer', 'Android Developer', 'React Native Developer', 'Flutter Developer'],
      devops: ['DevOps Engineer', 'SRE', 'Cloud Engineer', 'Platform Engineer', 'Infrastructure Engineer'],
      developer: ['Software Developer', 'Software Engineer', 'Full Stack Developer', 'Web Developer', 'Application Developer'],
    };
    
    return positions[category] || positions.developer;
  }

  private generateJobDescription(position: string, category: string): string {
    const techStack = this.input.skills?.slice(0, 4).join(', ') || 'JavaScript, Node.js';
    
    return `Developed and maintained scalable applications using ${techStack}. Collaborated with cross-functional teams to deliver high-quality features.`;
  }

  private generateAchievements(category: string, index: number): string[] {
    const numAchievements = 2 + Math.floor(Math.random() * 2);
    const achievements: string[] = [];
    
    const usedTemplates = new Set<number>();
    
    for (let i = 0; i < numAchievements; i++) {
      let template: string;
      do {
        template = ACHIEVEMENT_TEMPLATES[Math.floor(Math.random() * ACHIEVEMENT_TEMPLATES.length)];
      } while (usedTemplates.has(ACHIEVEMENT_TEMPLATES.indexOf(template)) && usedTemplates.size < ACHIEVEMENT_TEMPLATES.length);
      
      usedTemplates.add(ACHIEVEMENT_TEMPLATES.indexOf(template));
      
      let achievement = template
        .replace('{percent}', (20 + Math.floor(Math.random() * 60)).toString())
        .replace('{num}', (2 + Math.floor(Math.random() * 4)).toString());
      
      achievements.push(achievement);
    }
    
    return achievements;
  }

  private generateEducation(): Education[] {
    const education = this.input.education;
    const yearsAgo = this.input.experienceYears ? Math.max(0, this.input.experienceYears - 4) : 4;
    const gradYear = new Date().getFullYear() - yearsAgo;
    
    return [{
      id: 'edu-1',
      school: SCHOOLS[Math.floor(Math.random() * SCHOOLS.length)],
      degree: education?.degree || 'Bachelor\'s',
      field: education?.field || 'Computer Science',
      startDate: `${this.getMonthName(8)} ${gradYear - 4}`,
      endDate: `${this.getMonthName(5)} ${gradYear}`,
      gpa: (3.5 + Math.random() * 0.5).toFixed(2),
    }];
  }

  private generateSkills(roleCategory: string): Skill[] {
    const inputSkills = this.input.skills || [];
    const additionalSkills = TECHNICAL_SKILLS[roleCategory] || TECHNICAL_SKILLS.developer || [];
    
    const allSkills = new Set([...inputSkills]);
    
    additionalSkills.forEach(skill => {
      if (allSkills.size < 15) {
        allSkills.add(skill);
      }
    });
    
    const skillLevels = ['Expert', 'Advanced', 'Intermediate', 'Beginner'];
    
    return Array.from(allSkills).slice(0, 15).map((name, i) => ({
      id: `skill-${i}`,
      name,
      level: skillLevels[Math.min(Math.floor(i / 5), 3)],
    }));
  }

  private generateLanguages(): Language[] {
    const languages = [
      { language: 'English', proficiency: 'Native' },
      { language: 'Spanish', proficiency: 'Intermediate' },
    ];
    
    if (Math.random() > 0.5) {
      languages.push({ language: 'French', proficiency: 'Basic' });
    }
    
    return languages.map((lang, i) => ({
      id: `lang-${i}`,
      ...lang,
    }));
  }

  private generateCertifications(category: string): Certification[] {
    const certs: Certification[] = [];
    
    if (this.input.experienceYears && this.input.experienceYears >= 1) {
      certs.push({
        id: 'cert-1',
        name: 'AWS Certified Developer',
        issuer: 'Amazon Web Services',
        date: `${new Date().getFullYear() - 1}`,
      });
    }
    
    if (Math.random() > 0.5) {
      certs.push({
        id: 'cert-2',
        name: 'MongoDB Developer Certification',
        issuer: 'MongoDB University',
        date: `${new Date().getFullYear()}`,
      });
    }
    
    return certs;
  }

  private generateProjects(category: string): Project[] {
    const templates = PROJECT_TEMPLATES[category] || PROJECT_TEMPLATES.default;
    const inputSkills = this.input.skills || [];
    
    const projects: Project[] = templates.slice(0, 3).map((template, i) => {
      const techs = inputSkills.length > 0 
        ? inputSkills.slice(0, 3).concat(template.tech.slice(0, 2))
        : template.tech;
      
      return {
        id: `proj-${i}`,
        name: template.name,
        description: template.desc,
        technologies: Array.from(new Set(techs)).slice(0, 4),
      };
    });
    
    return projects;
  }

  private generateLayout(): GeneratedLayout {
    const years = this.input.experienceYears || 0;
    const skillsCount = this.input.skills?.length || 0;
    
    let type: GeneratedLayout['type'] = 'single';
    
    if (skillsCount >= 10) {
      type = 'sidebar';
    } else if (years >= 3 && skillsCount >= 5) {
      type = 'two-column';
    } else if (years <= 1) {
      type = 'modern';
    }
    
    const positions = this.getLayoutPositions(type);
    
    return { type, positions };
  }

  private getLayoutPositions(type: string): Record<string, { x: number; y: number }> {
    const positions: Record<string, { x: number; y: number }> = {
      'personal-info': { x: 40, y: 40 },
      'experience-section': { x: 40, y: 140 },
      'education-section': { x: 40, y: 400 },
      'skills-section': { x: 40, y: 520 },
      'certifications-section': { x: 40, y: 620 },
      'projects-section': { x: 40, y: 700 },
      'languages-section': { x: 40, y: 780 },
    };
    
    if (type === 'sidebar') {
      positions['skills-sidebar'] = { x: 40, y: 140 };
      positions['certifications-sidebar'] = { x: 40, y: 320 };
      positions['languages-sidebar'] = { x: 40, y: 420 };
      positions['experience-section'] = { x: 260, y: 140 };
      positions['education-section'] = { x: 260, y: 450 };
      positions['projects-section'] = { x: 260, y: 600 };
    }
    
    return positions;
  }

  private generateDesign(): GeneratedDesign {
    const category = this.getRoleCategory();
    
    const designs: Record<string, GeneratedDesign> = {
      backend: { fontFamily: 'Inter', fontSize: 11, primaryColor: '#2563eb', backgroundColor: '#ffffff' },
      frontend: { fontFamily: 'Inter', fontSize: 11, primaryColor: '#7c3aed', backgroundColor: '#ffffff' },
      data: { fontFamily: 'Roboto', fontSize: 11, primaryColor: '#059669', backgroundColor: '#ffffff' },
      design: { fontFamily: 'Poppins', fontSize: 11, primaryColor: '#dc2626', backgroundColor: '#ffffff' },
      mobile: { fontFamily: 'Inter', fontSize: 11, primaryColor: '#0891b2', backgroundColor: '#ffffff' },
      devops: { fontFamily: 'Inter', fontSize: 11, primaryColor: '#ea580c', backgroundColor: '#ffffff' },
      developer: { fontFamily: 'Inter', fontSize: 11, primaryColor: '#2563eb', backgroundColor: '#ffffff' },
    };
    
    return designs[category] || designs.developer;
  }

  private calculateConfidence(): number {
    let confidence = 50;
    
    if (this.input.name) confidence += 10;
    if (this.input.role) confidence += 10;
    if (this.input.skills && this.input.skills.length > 0) confidence += 10;
    if (this.input.experienceYears && this.input.experienceYears > 0) confidence += 10;
    if (this.input.education) confidence += 10;
    
    return Math.min(confidence, 100);
  }

  private generateMetaSuggestions(): string[] {
    const suggestions: string[] = [];
    
    if (!this.input.summary) {
      suggestions.push('Review the auto-generated summary and customize it to highlight your unique achievements');
    }
    
    if (this.input.experienceYears && this.input.experienceYears >= 3) {
      suggestions.push('Consider adding specific metrics to your experience descriptions');
    }
    
    suggestions.push('Review all company names and replace with actual experience');
    suggestions.push('Update contact information with your actual details');
    
    return suggestions;
  }

  private getMonthName(month: number): string {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];
    return months[month] || 'January';
  }
}

export function generateResume(input: MinimalUserInput): FullResumeOutput {
  const generator = new ResumeGenerator(input);
  return generator.generate();
}

export function generateMinimalResume(name: string, role: string, skills: string[]): FullResumeOutput {
  return generateResume({
    name,
    role,
    skills,
    experienceYears: 1,
  });
}

export function generateFresherResume(name: string, role: string): FullResumeOutput {
  return generateResume({
    name,
    role,
    skills: [],
    experienceYears: 0,
    education: { degree: 'Bachelor\'s', field: 'Computer Science', year: new Date().getFullYear() },
  });
}
