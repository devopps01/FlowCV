const fs = require('fs');
const file = process.argv[2];
const content = fs.readFileSync(file, 'utf8');

let stack = [];
const combinedRegex = /<(div|section)(?![a-zA-Z0-9-])|<\/(div|section)>/g;
const lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  let m;
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
          stack.push(last); // keep searching
        }
      }
    } else {
      // Self-closing check
      const rest = line.substring(m.index);
      const end = rest.indexOf('>');
      if (end !== -1 && rest.substring(0, end).endsWith('/')) continue;
      
      stack.push({tag, line: i+1});
    }
  }
}

console.log('STACK AT END:');
stack.forEach(s => console.log(`<${s.tag}> from line ${s.line}`));
