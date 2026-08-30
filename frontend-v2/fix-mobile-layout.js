const fs = require('fs');
let code = fs.readFileSync('src/components/ChatPanel.tsx', 'utf8');

// Header padding
code = code.replace(/className={\`px-8 py-5 border-b flex items-center justify-between/g, 'className={`px-4 lg:px-8 py-4 lg:py-5 border-b flex items-center justify-between');

// Input area padding
code = code.replace(/className={\`p-6 border-t transition-colors duration-300/g, 'className={`p-4 lg:p-6 border-t transition-colors duration-300');

// Message bubbles spacing
code = code.replace(/className="flex-1 overflow-y-auto p-8 space-y-6"/g, 'className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-4 lg:space-y-6"');

// Reduce max-w from 85% to 90% on mobile
code = code.replace(/max-w-\[85\%\]/g, 'max-w-[92%] lg:max-w-[85%]');

fs.writeFileSync('src/components/ChatPanel.tsx', code);
console.log("Updated mobile paddings in ChatPanel");
