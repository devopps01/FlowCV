import { ResumeData } from './types';

export const DUMMY_PROFILES = [
  {
    fullName: 'Brian T. Wayne',
    professionalTitle: 'Senior Product Designer',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
    email: 'brian.wayne@example.com',
    location: 'San Francisco, CA'
  },
  {
    fullName: 'Aiden Phillips',
    professionalTitle: 'Business Development Manager',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop',
    email: 'aiden.p@example.com',
    location: 'New York, NY'
  },
  {
    fullName: 'Nadia Smith',
    professionalTitle: 'Executive Assistant',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
    email: 'nadia.smith@example.com',
    location: 'Austin, TX'
  },
  {
    fullName: 'Erica T. Pleas',
    professionalTitle: 'HR Specialist',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
    email: 'erica.p@example.com',
    location: 'Toronto, ON'
  },
  {
    fullName: 'Jacob McLaren',
    professionalTitle: 'Marketing Associate',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop',
    email: 'jacob.m@example.com',
    location: 'London, UK'
  },
  {
    fullName: 'Rohan G. Patel',
    professionalTitle: 'Software Engineer',
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop',
    email: 'rohan.patel@example.com',
    location: 'Bangalore, IN'
  },
  {
    fullName: 'Meghana Gupta',
    professionalTitle: 'Data Analytics Specialist',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop',
    email: 'meghana.g@example.com',
    location: 'San Jose, CA'
  },
  {
    fullName: 'Marcus Reid',
    professionalTitle: 'Head of Operations',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop',
    email: 'marcus.reid@example.com',
    location: 'Seattle, WA'
  }
];

export const DUMMY_CONTENT_BASE = {
  experience: [
    { company: 'Meta Platforms', position: 'Senior Specialist', startDate: '2020-03', endDate: 'Present', description: 'Lead cross-functional teams to deliver high-impact features for over 2B users. Optimized core algorithms resulting in a 15% increase in system performance and reduced operating costs by $2M annually.' },
    { company: 'Startup Hub', position: 'Founding Member', startDate: '2016-06', endDate: '2020-02', description: 'Scaled the platform from zero to 100k active users within eighteen months. Architected the initial MVP using React and Node.js, and managed a growing team of 12 developers.' },
    { company: 'Design Co.', position: 'Junior Architect', startDate: '2014-01', endDate: '2016-05', description: 'Collaborated on large-scale infrastructure projects. Focused on sustainable design and efficient material usage.' },
    { company: 'Tech Innovation', position: 'Intern', startDate: '2013-05', endDate: '2013-12', description: 'Contributed to various internal tools and helped maintain the company-wide design system.' }
  ],
  education: [
    { school: 'Stanford University', degree: 'MS', field: 'Computer Science', graduationYear: '2016' },
    { school: 'UC Berkeley', degree: 'BS', field: 'Engineering', graduationYear: '2014' }
  ],
  projects: [
    { name: 'Portfolio.io', description: 'A sleek portfolio generator for creative professionals with 50+ templates.', technologies: ['React', 'Next.js', 'Tailwind'] },
    { name: 'EcoTracker', description: 'IoT-based energy monitoring system for smart homes.', technologies: ['Python', 'AWS', 'IoT'] },
    { name: 'Nexus API', description: 'A high-performance GraphQL API serving millions of requests daily.', technologies: ['Go', 'Kubernetes'] }
  ],
  awards: [
    { title: 'Innovator of the Year', issuer: 'Tech Weekly', date: '2022', description: 'Awarded for contributions to open-source software.' },
    { title: 'Excellence in Engineering', issuer: 'Stanford University', date: '2015' }
  ],
  skills: [
    'Leadership', 'Strategic Planning', 'Product Management', 'Data Analysis', 'User Experience', 
    'React', 'Node.js', 'TypeScript', 'System Architecture', 'Agile', 'Public Speaking', 'Cloud Computing'
  ],
  languages: [
    { language: 'English', proficiency: 'Native' },
    { language: 'Spanish', proficiency: 'Fluent' }
  ]
};
