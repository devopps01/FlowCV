const fs = require('fs');
const file = process.argv[2];
const content = fs.readFileSync(file, 'utf8');

let stack = [];
const tagRegex = /<(div|section)(?![a-zA-Z0-9-])/g;
const closeRegex = /<\/ (div|section)>/g; // Wait, this regex is wrong, should be <\/ (div|section)> without space or better:

const lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Find all matches on this line
  let m;
  const combinedRegex = /<(div|section)(?![a-zA-Z0-9-])|<\/(div|section)>/g;
  while ((m = combinedRegex.exec(line)) !== null) {
    const full = m[0];
    const isClosing = full.startsWith('</');
    const tag = isClosing ? m[2] : m[1];

    if (isClosing) {
      if (stack.length === 0) {
        console.log(`L${i+1}: EXTRA CLOSE </${tag}>`);
      } else {
        const last = stack.pop();
        if (last.tag !== tag) {
          console.log(`L${i+1}: MISMATCH <${last.tag}>(L${last.line}) vs </${tag}>`);
        }
      }
    } else {
      // Check for self-closing
      const after = line.substring(m.index);
      const closeBracket = after.indexOf('>');
      if (closeBracket !== -1 && after.substring(0, closeBracket).endsWith('/')) {
        continue;
      }
      stack.push({tag, line: i+1});
    }
  }
}

console.log('STACK AT END:');
stack.forEach(s => console.log(`<${s.tag}> from line ${s.line}`));
