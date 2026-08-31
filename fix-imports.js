const fs = require('fs');

let code = fs.readFileSync('frontend-v2/src/components/ChatPanel.tsx', 'utf8');

// Inject imports at the very beginning of the file if not exists
if (!code.includes('import EmojiPicker')) {
    code = `import EmojiPicker from "emoji-picker-react";\nimport { Smile } from "lucide-react";\n` + code;
}

fs.writeFileSync('frontend-v2/src/components/ChatPanel.tsx', code);
console.log("Fixed imports");
