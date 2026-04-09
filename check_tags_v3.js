const fs = require('fs');
const file = process.argv[2];
const content = fs.readFileSync(file, 'utf8');

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
    
    // Check if the tag is self-closing (naively)
    const afterTag = line.substring(m.index);
    const endOfTag = afterTag.indexOf('>');
    if (endOfTag !== -1 && afterTag.substring(0, endOfTag).endsWith('/')) {
        continue;
    }

    if (isClosing) {
      if (stack.length === 0) {
        console.log(`EXTRA CLOSING </${tag}> on line ${i+1}`);
      } else {
        const last = stack.pop();
        if (last.tag !== tag) {
          console.log(`MISMATCH: Opening <${last.tag}> (line ${last.line}) vs Closing </${tag}> (line ${i+1})`);
          // Try to recover
          stack.push(last); 
        }
      }
    } else {
      stack.push({tag, line: i+1});
    }
  }
}

console.log('--- UNCLOSED TAGS STACK ---');
stack.forEach(s => {
  console.log(`<${s.tag}> on line ${s.line}`);
});
