const fs = require('fs');

let code = fs.readFileSync('frontend-v2/src/components/ChatPanel.tsx', 'utf8');

// Add relative and high z-index to the input area container
const inputAreaRegex = /<div className=\{\`p-4 lg:p-6 border-t transition-colors duration-300 backdrop-blur-\[80px\] \$\{t\.inputArea\}\`\}>/g;
const fixedInputArea = `<div className={\`relative z-50 p-4 lg:p-6 border-t transition-colors duration-300 backdrop-blur-[80px] \${t.inputArea}\`}>`;

code = code.replace(inputAreaRegex, fixedInputArea);

fs.writeFileSync('frontend-v2/src/components/ChatPanel.tsx', code);
console.log("Fixed input area z-index layering issue");
