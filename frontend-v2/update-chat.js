const fs = require('fs');

let chatCtrl = fs.readFileSync('../backend/src/controllers/chat.controller.ts', 'utf8');

chatCtrl = chatCtrl.replace(
    'isOnline\n            };',
    'isOnline,\n                isProposer: s.proposerId === userId\n            };'
);

fs.writeFileSync('../backend/src/controllers/chat.controller.ts', chatCtrl);
console.log('Added isProposer to chat.controller.ts');
