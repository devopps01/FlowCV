const fs = require('fs');

const code = fs.readFileSync('src/app/(app)/resume/[id]/page.tsx', 'utf-8');

const analyzeBalance = () => {
    let lines = code.split('\n');
    let stack = [];
    
    // Simplistic tag extractor for debugging
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Find opening divs
        const opens = line.match(/<div[^>]*>/g) || [];
        for (let open of opens) {
             stack.push(`div (Line ${i+1})`);
        }
        
        // Find closing divs
        const closes = line.match(/<\/div>/g) || [];
        for (let close of closes) {
            if (stack.length > 0) {
               stack.pop();
            } else {
               console.log(`ERROR: Unmatched closing </div> at line ${i+1}`);
            }
        }

        // Special case for our layout tab
        if(i > 2140 && i < 2145 && line.includes('layout')) {
            console.log(`At layout start (line ${i+1}), stack size: ${stack.length}, Last opened: ${stack[stack.length-1]}`);
        }
        
        // End of Layout Tab
        if(i > 2280 && i < 2290 && line.includes(')}')) {
            console.log(`At layout end (line ${i+1}), stack size: ${stack.length}`);
        }
    }

    console.log(`\nFinal Stack remaining (Unclosed Tags):`);
    console.log(stack);
    
    // Also track <main>
    let mainOps = (code.match(/<main/g) || []).length;
    let mainCloses = (code.match(/<\/main>/g) || []).length;
    console.log(`\nMains Open: ${mainOps}, Mains Close: ${mainCloses}`);
};

analyzeBalance();
