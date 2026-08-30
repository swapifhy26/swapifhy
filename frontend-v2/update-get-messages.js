const fs = require('fs');

let chatCtrl = fs.readFileSync('../backend/src/controllers/chat.controller.ts', 'utf8');

chatCtrl = chatCtrl.replace(
    'res.status(200).json({ messages: scrubbedMessages, partner: { ...partner, isOnline } });',
    'res.status(200).json({ messages: scrubbedMessages, partner: { ...partner, isOnline }, status: swap.status, isProposer: swap.proposerId === userId });'
);

fs.writeFileSync('../backend/src/controllers/chat.controller.ts', chatCtrl);
console.log('Added status and isProposer to getMessages response');
