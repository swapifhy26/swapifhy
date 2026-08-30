const fs = require('fs');
let code = fs.readFileSync('src/controllers/chat.controller.ts', 'utf8');

const targetStr = `senderId: "SYSTEM",
                        content: "⚠️ WARNING: Your message violated our safety policy. All chats are recorded. Strict action and reporting to authorities will occur for harassment or explicit content.",`;

const newStr = `senderId: "SYSTEM_WARNING_" + senderId,
                        content: "⚠️ WARNING: Your message violated our safety policy. All chats are recorded. Strict action and reporting to authorities will occur for harassment or explicit content.",`;

if (code.includes(targetStr)) {
    code = code.replace(targetStr, newStr);
    fs.writeFileSync('src/controllers/chat.controller.ts', code);
    console.log("Updated chat.controller.ts to use SYSTEM_WARNING_ prefix");
} else {
    console.log("Could not find target string in chat.controller.ts");
}
