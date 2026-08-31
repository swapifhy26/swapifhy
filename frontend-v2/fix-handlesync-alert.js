const fs = require('fs');
let code = fs.readFileSync('frontend-v2/src/pages/explore.tsx', 'utf8');

code = code.replace(
    'if (data.swapId) {\n                // Refresh swaps to update button UI\n                fetch(`${API_URL}/api/chat/conversations`, { headers: { "Authorization": `Bearer ${token}` } })\n                    .then(r => r.json()).then(d => { if (d.conversations) setMySwaps(d.conversations); });\n            }',
    'if (data.swapId) {\n                // Refresh swaps to update button UI\n                fetch(`${API_URL}/api/chat/conversations`, { headers: { "Authorization": `Bearer ${token}` } })\n                    .then(r => r.json()).then(d => { if (d.conversations) setMySwaps(d.conversations); });\n            } else if (data.error) {\n                alert(data.error);\n            }'
);

fs.writeFileSync('frontend-v2/src/pages/explore.tsx', code);
console.log("Added alert to handleSync");
