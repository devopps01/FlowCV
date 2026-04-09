const fs = require('fs');
const file = process.argv[2];
const content = fs.readFileSync(file, 'utf8');

let curly = 0;
let paren = 0;
let bracket = 0;

const lines = content.split('\n');
lines.forEach((line, i) => {
  for (let char of line) {
    if (char === '{') curly++;
    if (char === '}') curly--;
    if (char === '(') paren++;
    if (char === ')') paren--;
    if (char === '[') bracket++;
    if (char === ']') bracket--;
    
    if (curly < 0 || paren < 0 || bracket < 0) {
      console.log(`IMBALANCE! Line ${i + 1}: char "${char}" -> curly=${curly}, paren=${paren}, bracket=${bracket}`);
      // Reset to prevent flood
      curly = Math.max(0, curly);
      paren = Math.max(0, paren);
      bracket = Math.max(0, bracket);
    }
  }
});
console.log(`Final balance: curly=${curly}, paren=${paren}, bracket=${bracket}`);
