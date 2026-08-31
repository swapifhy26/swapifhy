const fs = require('fs');

let code = fs.readFileSync('frontend-v2/src/components/ChatPanel.tsx', 'utf8');

// Replace the array of icebreakers with Unicode escaped versions
const corruptedArrayRegex = /\{\["Hey! So excited to swap skills! When are you free to chat\? [^"]*", "I've been wanting to learn this forever! Where should we start\? [^"]*", "Let's set up a quick intro call this week! [^"]*"\]/g;

const fixedArray = `{["Hey! So excited to swap skills! When are you free to chat? \\uD83D\\uDC4B", "I've been wanting to learn this forever! Where should we start? \\uD83D\\uDE80", "Let's set up a quick intro call this week! \\uD83D\\uDCC5"]`;

code = code.replace(corruptedArrayRegex, fixedArray);

fs.writeFileSync('frontend-v2/src/components/ChatPanel.tsx', code);
console.log("Fixed icebreaker emojis");
