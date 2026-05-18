import { NextResponse } from 'next/server';
import { generateWithAI } from '@/lib/ai/gemini';
import { processContentWithIds } from '@/lib/utils/resume-ids';

// ─── Local fallback generators (always work, no API needed) ────────────────────

const THIS_YEAR = new Date().getFullYear();
const LAST_YEAR = THIS_YEAR - 1;
const TWO_YEARS = THIS_YEAR - 2;
const THREE_YEARS = THIS_YEAR - 3;

function currentMonth() {
  return `${THIS_YEAR}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
}

function pastDate(yearsAgo: number, month = 6) {
  return `${THIS_YEAR - yearsAgo}-${String(month).padStart(2, '0')}`;
}

const ACTION_VERBS = [
  'Led', 'Built', 'Developed', 'Designed', 'Implemented', 'Managed',
  'Delivered', 'Optimized', 'Launched', 'Created', 'Improved', 'Increased',
  'Reduced', 'Achieved', 'Spearheaded', 'Architected', 'Scaled', 'Automated',
  'Engineered', 'Pioneered', 'Streamlined', 'Coordinated', 'Executed',
];

function verb() {
  return ACTION_VERBS[Math.floor(Math.random() * ACTION_VERBS.length)];
}

function parseCount(prompt: string): number {
  const match = prompt.match(/\b(\d+)\b/);
  if (match) return Math.min(parseInt(match[1]), 5);
  if (/\btwo\b/i.test(prompt)) return 2;
  if (/\bthree\b/i.test(prompt)) return 3;
  return 2;
}

function localFallback(section: string, prompt: string): any[] | object {
  const count = parseCount(prompt);

  if (section === 'personalInfo') {
    return {
      fullName: 'Alex Johnson',
      professionalTitle: 'Senior Software Engineer',
      email: 'alex.johnson@email.com',
      phone: '+1 (555) 234-5678',
      location: 'San Francisco, CA',
      summary: `Results-driven Software Engineer with ${THREE_YEARS}+ years of experience designing and delivering scalable web applications. ${verb()} cross-functional teams to ship high-quality features on time. Passionate about clean code, performance optimization, and user experience.`,
    };
  }

  if (section === 'experience') {
    return Array.from({ length: count }, (_, i) => ({
      id: `exp_local_${Date.now()}_${i}`,
      company: ['TechCorp Solutions', 'Innovate Labs', 'Digital Ventures', 'CloudBase Inc', 'StartupHub'][i % 5],
      position: ['Senior Software Engineer', 'Full Stack Developer', 'Lead Frontend Engineer', 'Backend Engineer', 'Software Developer'][i % 5],
      startDate: pastDate(i + 2, 3),
      endDate: i === 0 ? 'Present' : pastDate(i, 2),
      description: `<ul><li>${verb()} end-to-end development of customer-facing features serving 50,000+ monthly active users, improving engagement by 35%.</li><li>${verb()} RESTful API architecture that reduced average response time by 40% and improved system reliability.</li><li>${verb()} with cross-functional teams across design, product, and QA to deliver major releases on schedule.</li><li>${verb()} automated test suite coverage from 45% to 85%, reducing production bugs by 60%.</li></ul>`,
    }));
  }

  if (section === 'education') {
    return Array.from({ length: Math.min(count, 2) }, (_, i) => ({
      id: `edu_local_${Date.now()}_${i}`,
      school: ['Massachusetts Institute of Technology', 'Stanford University', 'University of California Berkeley', 'Carnegie Mellon University'][i % 4],
      degree: i === 0 ? 'Bachelor of Science' : 'Master of Science',
      field: i === 0 ? 'Computer Science' : 'Software Engineering',
      graduationYear: String(THIS_YEAR - (i === 0 ? 3 : 1)),
      gpa: i === 0 ? '3.8/4.0' : '3.9/4.0',
    }));
  }

  if (section === 'skills') {
    const skillSets: Record<string, string[]> = {
      default: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'SQL', 'Git', 'REST APIs', 'Docker', 'AWS', 'Problem Solving', 'Team Leadership'],
      design: ['Figma', 'Adobe XD', 'Sketch', 'User Research', 'Wireframing', 'Prototyping', 'CSS', 'HTML', 'Accessibility', 'Design Systems'],
      data: ['Python', 'Machine Learning', 'TensorFlow', 'PyTorch', 'SQL', 'Tableau', 'R', 'Data Visualization', 'Statistical Analysis', 'Big Data'],
      devops: ['Kubernetes', 'Docker', 'CI/CD', 'AWS', 'Terraform', 'Linux', 'Jenkins', 'Prometheus', 'Ansible', 'GitOps'],
    };
    const key = prompt.toLowerCase().includes('design') ? 'design'
      : prompt.toLowerCase().includes('data') ? 'data'
      : prompt.toLowerCase().includes('devops') ? 'devops'
      : 'default';
    return skillSets[key].slice(0, Math.max(8, count * 4)).map((name, i) => ({
      id: `skill_local_${Date.now()}_${i}`,
      name,
    }));
  }

  if (section === 'projects') {
    const projects = [
      { name: 'E-Commerce Platform', desc: `${verb()} full-stack e-commerce platform with React frontend and Node.js backend. Integrated payment processing, inventory management, and real-time order tracking. Achieved 99.9% uptime serving 10,000+ daily transactions.`, tech: ['React', 'Node.js', 'PostgreSQL', 'Stripe', 'Redis'] },
      { name: 'AI-Powered Analytics Dashboard', desc: `${verb()} real-time analytics dashboard with machine learning-driven insights. Processed 1M+ data points daily with sub-100ms query performance. Reduced manual reporting time by 80%.`, tech: ['Python', 'React', 'TensorFlow', 'PostgreSQL', 'Docker'] },
      { name: 'Cloud DevOps Pipeline', desc: `${verb()} automated CI/CD pipeline reducing deployment time from 2 hours to 8 minutes. Implemented blue-green deployments with zero-downtime releases.`, tech: ['AWS', 'Docker', 'Kubernetes', 'Jenkins', 'Terraform'] },
      { name: 'Mobile Productivity App', desc: `${verb()} cross-platform mobile application with offline-first architecture. Achieved 4.8/5 star rating with 25,000+ downloads in first quarter.`, tech: ['React Native', 'TypeScript', 'Firebase', 'Redux'] },
      { name: 'Open Source CLI Tool', desc: `${verb()} developer productivity CLI tool with 2,000+ GitHub stars. Automated repetitive development tasks, saving teams an average of 3 hours per week.`, tech: ['Node.js', 'TypeScript', 'CLI', 'npm'] },
    ];
    return projects.slice(0, count).map((p, i) => ({
      id: `proj_local_${Date.now()}_${i}`,
      name: p.name,
      description: p.desc,
      technologies: p.tech,
      startDate: pastDate(i + 1, 4),
      endDate: i === 0 ? currentMonth() : pastDate(i, 11),
      url: '',
    }));
  }

  if (section === 'certifications') {
    const certs = [
      { name: 'AWS Certified Solutions Architect – Professional', issuer: 'Amazon Web Services', date: pastDate(1, 3) },
      { name: 'Google Cloud Professional Data Engineer', issuer: 'Google', date: pastDate(1, 8) },
      { name: 'Certified Kubernetes Administrator (CKA)', issuer: 'Cloud Native Computing Foundation', date: pastDate(2, 5) },
      { name: 'Microsoft Azure Developer Associate', issuer: 'Microsoft', date: pastDate(1, 11) },
      { name: 'Project Management Professional (PMP)', issuer: 'Project Management Institute', date: pastDate(2, 2) },
    ];
    return certs.slice(0, count).map((c, i) => ({
      id: `cert_local_${Date.now()}_${i}`,
      ...c,
      description: 'Demonstrated expertise and passed rigorous examination covering core competencies.',
    }));
  }

  if (section === 'publications') {
    const pubs = [
      { title: 'Scalable Microservices Architecture: Patterns and Anti-Patterns', publisher: 'IEEE Software Journal', date: pastDate(1, 4), description: 'Comprehensive analysis of microservices design patterns used in high-traffic production systems, with performance benchmarks and lessons learned from real-world deployments.' },
      { title: 'Machine Learning at the Edge: Practical Implementations', publisher: 'ACM Digital Library', date: pastDate(2, 9), description: 'Research on deploying lightweight ML models on edge devices with resource constraints, achieving 95% accuracy with 60% reduced latency compared to cloud inference.' },
      { title: 'Modern State Management in Large-Scale React Applications', publisher: 'A List Apart', date: pastDate(1, 7), description: 'In-depth exploration of state management strategies for enterprise React applications, comparing Redux, Zustand, and Context API with benchmarks.' },
      { title: 'Database Performance Optimization: A Practical Guide', publisher: 'Medium — Towards Data Science', date: pastDate(0, 3), description: 'Practical techniques for SQL query optimization, indexing strategies, and caching patterns that reduced query times by up to 95% in production.' },
      { title: 'Securing RESTful APIs: Best Practices for 2024', publisher: 'Dev.to', date: pastDate(0, 8), description: 'Comprehensive security guide covering OAuth 2.0, rate limiting, input validation, and penetration testing methodologies for API security.' },
    ];
    return pubs.slice(0, count).map((p, i) => ({
      id: `pub_local_${Date.now()}_${i}`,
      ...p,
      url: '',
    }));
  }

  if (section === 'awards') {
    const awards = [
      { title: 'Employee of the Year', issuer: 'TechCorp Solutions', date: pastDate(1, 12), description: `${verb()} exceptional performance and leadership in delivering the company's most successful product launch, resulting in $2M additional revenue.` },
      { title: 'Innovation Award', issuer: 'Tech Innovation Summit', date: pastDate(2, 6), description: `${verb()} breakthrough solution that reduced operational costs by 40%, recognized among top 10 innovations at the regional summit.` },
      { title: "Dean's List — Academic Excellence", issuer: 'MIT', date: pastDate(3, 5), description: 'Recognized for maintaining 3.9+ GPA while leading 3 student research projects and mentoring junior students.' },
      { title: 'Best Open Source Contribution', issuer: 'GitHub Universe', date: pastDate(1, 9), description: `${verb()} widely-adopted open-source library that has been integrated into 500+ projects with 3,000+ GitHub stars.` },
    ];
    return awards.slice(0, count).map((a, i) => ({
      id: `award_local_${Date.now()}_${i}`,
      ...a,
    }));
  }

  if (section === 'courses') {
    const courses = [
      { title: 'Deep Learning Specialization', provider: 'Coursera (deeplearning.ai)', date: pastDate(1, 3), description: 'Completed 5-course specialization covering neural networks, CNNs, RNNs, and practical ML project deployment.' },
      { title: 'Advanced React and Redux', provider: 'Udemy', date: pastDate(1, 7), description: 'Mastered advanced React patterns, hooks, performance optimization, and Redux Toolkit for enterprise applications.' },
      { title: 'AWS Cloud Practitioner Essentials', provider: 'AWS Training', date: pastDate(0, 2), description: 'Comprehensive overview of AWS core services, cloud concepts, pricing, and security best practices.' },
      { title: 'System Design Interview Masterclass', provider: 'Educative.io', date: pastDate(0, 9), description: 'Learned how to design large-scale distributed systems including load balancers, caches, databases, and message queues.' },
    ];
    return courses.slice(0, count).map((c, i) => ({
      id: `course_local_${Date.now()}_${i}`,
      ...c,
    }));
  }

  if (section === 'organisations') {
    const orgs = [
      { name: 'Women in Tech Initiative', role: 'Chapter Lead & Mentor', startDate: pastDate(2, 3), endDate: 'Present', description: `${verb()} monthly mentorship sessions for 30+ early-career women in technology. ${verb()} annual conference with 500+ attendees and 20 industry speakers.` },
      { name: 'Code for Good', role: 'Volunteer Developer', startDate: pastDate(3, 1), endDate: pastDate(1, 12), description: `${verb()} pro-bono web applications for 5 local non-profit organizations, collectively serving 10,000+ community members.` },
      { name: 'University Computer Science Society', role: 'President', startDate: pastDate(4, 9), endDate: pastDate(3, 6), description: `${verb()} society of 200+ members. ${verb()} hackathons, workshops, and industry networking events with 95% member satisfaction rating.` },
    ];
    return orgs.slice(0, count).map((o, i) => ({
      id: `org_local_${Date.now()}_${i}`,
      ...o,
    }));
  }

  if (section === 'references') {
    const refs = [
      { name: 'Sarah Mitchell', position: 'VP of Engineering', company: 'TechCorp Solutions', email: 'sarah.mitchell@techcorp.com', phone: '+1 (555) 987-6543', relationship: 'Direct Manager' },
      { name: 'David Chen', position: 'Chief Technology Officer', company: 'Innovate Labs', email: 'david.chen@innovatelabs.com', phone: '+1 (555) 876-5432', relationship: 'Senior Colleague' },
      { name: 'Prof. Jennifer Adams', position: 'Professor of Computer Science', company: 'MIT', email: 'jadams@mit.edu', phone: '+1 (617) 555-0123', relationship: 'Academic Advisor' },
    ];
    return refs.slice(0, count).map((r, i) => ({
      id: `ref_local_${Date.now()}_${i}`,
      ...r,
    }));
  }

  if (section === 'languages') {
    return [
      { id: `lang_local_${Date.now()}_0`, language: 'English', proficiency: 'Native' },
      { id: `lang_local_${Date.now()}_1`, language: 'Spanish', proficiency: 'Fluent' },
      { id: `lang_local_${Date.now()}_2`, language: 'French', proficiency: 'Intermediate' },
    ].slice(0, count);
  }

  if (section === 'interests') {
    const all = ['Open Source Development', 'Competitive Programming', 'Technical Blogging', 'Rock Climbing', 'Photography', 'Chess', 'Traveling', 'Cooking', 'Music Production', 'Cycling'];
    return all.slice(0, Math.max(count * 3, 6)).map((name, i) => ({
      id: `int_local_${Date.now()}_${i}`,
      name,
    }));
  }

  if (section === 'socials') {
    return [
      { id: `soc_local_${Date.now()}_0`, platform: 'LinkedIn', label: 'linkedin.com/in/alexjohnson', url: 'https://linkedin.com/in/alexjohnson' },
      { id: `soc_local_${Date.now()}_1`, platform: 'GitHub', label: 'github.com/alexjohnson', url: 'https://github.com/alexjohnson' },
      { id: `soc_local_${Date.now()}_2`, platform: 'Portfolio', label: 'alexjohnson.dev', url: 'https://alexjohnson.dev' },
    ].slice(0, count);
  }

  if (section === 'declaration') {
    return {
      text: 'I hereby declare that all the details furnished above are true and correct to the best of my knowledge and belief.',
      date: new Date().toISOString().split('T')[0],
      place: 'San Francisco, CA'
    };
  }

  if (section === 'custom') {
    return Array.from({ length: count }, (_, i) => ({
      id: `custom_local_${Date.now()}_${i}`,
      title: ['Key Achievement', 'Volunteer Project', 'Extra-curricular Activity', 'Featured Contribution'][i % 4],
      content: `<p>Co-founded a regional community group for tech enthusiasts, organizing 10+ local meetups and workshops for over 200 members. Designed learning tracks and facilitated hands-on coding sessions.</p>`,
    }));
  }

  return [];
}

// ─── Main handler ──────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const { section, prompt, currentData, resumeContext } = await req.json();

    if (!section || !prompt?.trim()) {
      return NextResponse.json({ error: 'Section and prompt are required' }, { status: 400 });
    }

    const contextStr = resumeContext
      ? `Resume context — Name: ${resumeContext.fullName || ''}, Title: ${resumeContext.professionalTitle || ''}.`
      : '';

    const sectionPrompts: Record<string, string> = {
      personalInfo: `You are an expert resume writer. Generate professional personal information based on: "${prompt}"
${contextStr}
Current data: ${JSON.stringify(currentData || {})}

Return ONLY a valid JSON object:
{
  "fullName": "string",
  "professionalTitle": "string",
  "email": "string",
  "phone": "string",
  "location": "string",
  "summary": "3-4 sentence professional summary starting with a strong adjective, using ATS keywords and quantifiable achievements"
}
Return ONLY raw JSON, no markdown, no explanation.`,

      experience: `You are an expert resume writer. Generate ${prompt.match(/\d+/)?.[0] || 2} professional work experience entries based on: "${prompt}"
${contextStr}

Return ONLY a valid JSON array:
[{
  "company": "Company Name",
  "position": "Job Title",
  "startDate": "YYYY-MM",
  "endDate": "YYYY-MM or Present",
  "description": "Use <ul><li> bullet points. Each bullet starts with a strong action verb. Include quantifiable achievements (%, $, numbers)."
}]
Return ONLY raw JSON array, no markdown.`,

      education: `Generate ${prompt.match(/\d+/)?.[0] || 1} education entries based on: "${prompt}"
Return ONLY a valid JSON array:
[{
  "school": "University Name",
  "degree": "Bachelor/Master/PhD of Science/Arts",
  "field": "Field of Study",
  "graduationYear": "YYYY",
  "gpa": "X.X/4.0"
}]
Return ONLY raw JSON array, no markdown.`,

      skills: `Generate a relevant skills list based on: "${prompt}"
${contextStr}
Return ONLY a valid JSON array of objects (8-15 skills, mix technical and soft):
[{"name": "Skill Name"}]
Return ONLY raw JSON array, no markdown.`,

      projects: `Generate ${prompt.match(/\d+/)?.[0] || 2} project entries based on: "${prompt}"
${contextStr}
Return ONLY a valid JSON array:
[{
  "name": "Project Name",
  "description": "Achievement-focused description. Include technologies used and measurable impact.",
  "technologies": ["Tech1", "Tech2", "Tech3"],
  "startDate": "YYYY-MM",
  "endDate": "YYYY-MM",
  "url": ""
}]
Return ONLY raw JSON array, no markdown.`,

      certifications: `Generate ${prompt.match(/\d+/)?.[0] || 2} certification entries based on: "${prompt}"
Return ONLY a valid JSON array:
[{"name": "Certification Name", "issuer": "Issuing Organization", "date": "YYYY-MM", "description": "Brief description of what was demonstrated"}]
Return ONLY raw JSON array, no markdown.`,

      publications: `Generate ${prompt.match(/\d+/)?.[0] || 2} publication entries based on: "${prompt}"
Return ONLY a valid JSON array:
[{"title": "Publication Title", "publisher": "Journal/Publisher/Platform", "date": "YYYY-MM", "description": "2-3 sentence description of the publication's content and impact", "url": ""}]
Return ONLY raw JSON array, no markdown.`,

      awards: `Generate ${prompt.match(/\d+/)?.[0] || 2} award or achievement entries based on: "${prompt}"
Return ONLY a valid JSON array:
[{"title": "Award Title", "issuer": "Organization", "date": "YYYY-MM", "description": "1-2 sentences describing why you received this and its significance"}]
Return ONLY raw JSON array, no markdown.`,

      courses: `Generate ${prompt.match(/\d+/)?.[0] || 2} course entries based on: "${prompt}"
Return ONLY a valid JSON array:
[{"title": "Course Title", "provider": "Platform/Institution", "date": "YYYY-MM", "description": "What skills and knowledge were gained"}]
Return ONLY raw JSON array, no markdown.`,

      organisations: `Generate ${prompt.match(/\d+/)?.[0] || 2} organisation/volunteer entries based on: "${prompt}"
Return ONLY a valid JSON array:
[{"name": "Organisation Name", "role": "Your Role", "startDate": "YYYY-MM", "endDate": "YYYY-MM or Present", "description": "Your contributions and impact using action verbs"}]
Return ONLY raw JSON array, no markdown.`,

      references: `Generate ${prompt.match(/\d+/)?.[0] || 2} professional reference entries based on: "${prompt}"
Return ONLY a valid JSON array:
[{"name": "Full Name", "position": "Job Title", "company": "Company", "email": "email@example.com", "phone": "+1 (555) 000-0000", "relationship": "Former Manager/Colleague/Professor"}]
Return ONLY raw JSON array, no markdown.`,

      languages: `Generate language proficiency entries based on: "${prompt}"
Return ONLY a valid JSON array:
[{"language": "Language Name", "proficiency": "Native|Fluent|Advanced|Intermediate|Basic"}]
Return ONLY raw JSON array, no markdown.`,

      interests: `Generate interest/hobby entries based on: "${prompt}"
Return ONLY a valid JSON array of objects:
[{"name": "Interest or Hobby"}]
Return ONLY raw JSON array, no markdown.`,

      socials: `Generate social media/link entries based on: "${prompt}"
Return ONLY a valid JSON array:
[{"platform": "LinkedIn|GitHub|Portfolio|Twitter|Website", "label": "Display Label", "url": "https://..."}]
Return ONLY raw JSON array, no markdown.`,

      declaration: `You are an expert resume writer. Generate a professional resume declaration statement based on: "${prompt}"
Return ONLY a valid JSON object:
{
  "text": "The declaration statement string",
  "date": "YYYY-MM-DD",
  "place": "City, State or Country"
}
Return ONLY raw JSON, no markdown, no explanation.`,

      custom: `Generate ${prompt.match(/\d+/)?.[0] || 2} custom section/extra content entries based on: "${prompt}"
Return ONLY a valid JSON array:
[{"title": "Section Title or Subsection Header", "content": "1-2 paragraph description or details of this custom section item. Highlight key highlights, details or activities using bullet points or paragraphs."}]
Return ONLY raw JSON array, no markdown.`,
    };

    const instruction = sectionPrompts[section];
    if (!instruction) {
      return NextResponse.json({ error: `Unknown section: ${section}` }, { status: 400 });
    }

    // ── Try AI providers ────────────────────────────────────────────────────────
    let rawJson: string | null = null;
    try {
      const aiResult = await generateWithAI(instruction, { fieldType: 'section', fallbackText: '' });
      if (aiResult && aiResult.trim().length > 5) rawJson = aiResult;
    } catch {
      rawJson = null;
    }

    // ── Parse AI result ─────────────────────────────────────────────────────────
    if (rawJson) {
      try {
        let cleaned = rawJson.trim();
        if (cleaned.startsWith('```json')) cleaned = cleaned.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
        else if (cleaned.startsWith('```')) cleaned = cleaned.replace(/^```\s*/, '').replace(/```\s*$/, '').trim();

        const startChar = cleaned[0] === '[' ? '[' : '{';
        const startIdx = cleaned.indexOf(startChar);
        if (startIdx !== -1) {
          cleaned = cleaned.slice(startIdx);
          const parsed = JSON.parse(cleaned);
          let result = parsed;
          if (Array.isArray(parsed)) {
            result = parsed.map((item: any, i: number) => {
              const base = typeof item === 'string' ? { name: item } : item;
              return { id: `${section}_ai_${Date.now()}_${i}`, ...base };
            });
          }
          return NextResponse.json({ data: result, section, source: 'ai' });
        }
      } catch {
        // AI returned invalid JSON — fall through to local fallback
      }
    }

    // ── Local fallback (always works) ───────────────────────────────────────────
    console.log(`⚠️ AI unavailable for section "${section}" — using local fallback`);
    const fallbackData = localFallback(section, prompt);
    return NextResponse.json({ data: fallbackData, section, source: 'local' });

  } catch (error: any) {
    console.error('Section generation error:', error.message);
    return NextResponse.json(
      { error: 'Generation failed. Please try again.' },
      { status: 500 }
    );
  }
}
