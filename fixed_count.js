const fs = require('fs');
const file = process.argv[2];
const content = fs.readFileSync(file, 'utf8');

const openRegex = /<div(?![a-zA-Z0-9-])/g;
const closeRegex = /<\/div>/g;

const opens = (content.match(openRegex) || []).length;
const closes = (content.match(closeRegex) || []).length;

console.log(`Verified Opens: ${opens}, Closes: ${closes}, Diff: ${opens - closes}`);
