const fs = require('fs');

let code = fs.readFileSync('frontend-v2/src/components/ChatPanel.tsx', 'utf8');

const oldLogic = `{messages.filter(m => m.type === 'TEXT').length === 0 && (`;
const newLogic = `{messages.filter(m => m.senderId !== 'SYSTEM' && !m.senderId.startsWith('SYSTEM_WARNING')).length === 0 && (`;

if (code.includes(oldLogic)) {
    code = code.replace(oldLogic, newLogic);
    fs.writeFileSync('frontend-v2/src/components/ChatPanel.tsx', code);
    console.log("Fixed icebreaker logic");
} else {
    console.log("Could not find old logic");
}
