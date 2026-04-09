const fs = require('fs');
const file = process.argv[2];
const content = fs.readFileSync(file, 'utf8');

const divOpen = (content.match(/<div(?![a-zA-Z0-9-])/g) || []).length;
const divClose = (content.match(/<\/div>/g) || []).length;
const sectionOpen = (content.match(/<section(?![a-zA-Z0-9-])/g) || []).length;
const sectionClose = (content.match(/<\/section>/g) || []).length;

console.log(`Divs: ${divOpen} open, ${divClose} close (Diff: ${divOpen - divClose})`);
console.log(`Sections: ${sectionOpen} open, ${sectionClose} close (Diff: ${sectionOpen - sectionClose})`);

// Find mismatch in a more detailed way
let stack = [];
const tagRegex = /<(\/)?(div|section)(?![a-zA-Z0-9-])/g;
let match;
const lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  let m;
  while ((m = tagRegex.exec(line)) !== null) {
    const isClosing = !!m[1];
    const tag = m[2];
    if (isClosing) {
      if (stack.length === 0) {
        console.log(`Extra closing </${tag}> on line ${i+1}`);
      } else {
        const last = stack.pop();
        if (last.tag !== tag) {
          console.log(`Mismatch: Opened <${last.tag}> (line ${last.line}) vs Closed </${tag}> (line ${i+1})`);
        }
      }
    } else {
      // Check for self-closing in the same line (unlikely for div/section but good practice)
      if (line.substring(m.index).match(/^<[a-z]+[^>]*\/>/)) continue;
      stack.push({tag, line: i+1});
    }
  }
}

stack.forEach(s => {
  console.log(`Unclosed <${s.tag}> from line ${s.line}`);
});
