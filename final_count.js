const fs = require('fs');
const file = process.argv[2];
const content = fs.readFileSync(file, 'utf8');

const closeDivs = (content.match(/<\/div>/g) || []).length;
const openDivs = (content.match(/<div/g) || []).length;

console.log(`Opens: ${openDivs}, Closes: ${closeDivs}, Diff: ${openDivs - closeDivs}`);
