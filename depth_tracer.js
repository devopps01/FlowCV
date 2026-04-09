const fs = require('fs');
const file = process.argv[2];
const content = fs.readFileSync(file, 'utf8');

const regex = /<(div|section)(?![a-zA-Z0-9-])|<\/(div|section)>/g;
const lines = content.split('\n');
let depth = 0;
for (let i = 0; i < lines.length; i++) {
    let m;
    while ((m = regex.exec(lines[i])) !== null) {
        const isClose = m[0].startsWith('</');
        const tag = isClose ? m[2] : m[1];
        
        // Self-closing check
        if (!isClose) {
            const rest = lines[i].substring(m.index);
            const end = rest.indexOf('>');
            if (end !== -1 && rest.substring(0, end).endsWith('/')) continue;
        }

        if (isClose) depth--; else depth++;
        console.log(`L${i+1}: ${m[0]} (Depth: ${depth})`);
    }
}
