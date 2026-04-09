// Script to add unique IDs to all template JSON files
// Run with: node scripts/add-ids-to-templates.js

const fs = require('fs');
const path = require('path');

const templatesDir = path.join(__dirname, '..', 'src', 'config', 'templates');

let counter = 0;

function generateId(prefix) {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 9);
  return `${prefix}_${timestamp}_${counter++}`;
}

function processContent(data) {
  if (!data) return data;
  
  return {
    ...data,
    personalInfo: {
      id: 'personal',
      ...data.personalInfo
    },
    experience: (data.experience || []).map(item => ({
      id: generateId('exp'),
      ...item
    })),
    education: (data.education || []).map(item => ({
      id: generateId('edu'),
      ...item
    })),
    skills: (data.skills || []).map(item => {
      if (typeof item === 'string') {
        return { id: generateId('skill'), name: item };
      }
      return { id: generateId('skill'), ...item };
    }),
    languages: (data.languages || []).map(item => ({
      id: generateId('lang'),
      ...item
    })),
    certifications: (data.certifications || []).map(item => ({
      id: generateId('cert'),
      ...item
    })),
    projects: (data.projects || []).map(item => ({
      id: generateId('proj'),
      ...item
    })),
    awards: (data.awards || []).map(item => ({
      id: generateId('award'),
      ...item
    })),
    interests: (data.interests || []).map(item => {
      if (typeof item === 'string') {
        return { id: generateId('interest'), name: item };
      }
      return { id: generateId('interest'), ...item };
    }),
    courses: (data.courses || []).map(item => ({
      id: generateId('course'),
      ...item
    })),
    organisations: (data.organisations || []).map(item => ({
      id: generateId('org'),
      ...item
    })),
    publications: (data.publications || []).map(item => ({
      id: generateId('pub'),
      ...item
    })),
    references: (data.references || []).map(item => ({
      id: generateId('ref'),
      ...item
    })),
    custom: (data.custom || []).map(item => ({
      id: generateId('custom'),
      ...item
    })),
    socials: (data.socials || []).map(item => ({
      id: generateId('social'),
      ...item
    }))
  };
}

const files = fs.readdirSync(templatesDir).filter(f => f.endsWith('.json'));

console.log(`Found ${files.length} template files`);

files.forEach(file => {
  const filePath = path.join(templatesDir, file);
  const content = fs.readFileSync(filePath, 'utf-8');
  
  try {
    const json = JSON.parse(content);
    
    if (json.secondary?.data) {
      json.secondary.data = processContent(json.secondary.data);
    }
    
    fs.writeFileSync(filePath, JSON.stringify(json, null, 2));
    console.log(`Updated: ${file}`);
  } catch (e) {
    console.error(`Error processing ${file}:`, e.message);
  }
});

console.log('Done!');
