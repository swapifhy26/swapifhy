const fs = require('fs');
let code = fs.readFileSync('src/components/ChatPanel.tsx', 'utf8');

code = code.replace(/h-\[calc\(100vh-85px\)\]/g, 'h-[calc(100dvh-85px)]');
code = code.replace(/h-screen/g, 'h-[100dvh]');

fs.writeFileSync('src/components/ChatPanel.tsx', code);
console.log("ChatPanel updated for dvh");
