const fs = require('fs');

const file = 'src/controllers/notification.controller.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/const \{ id \} = req\.params;/g, 'const id = req.params.id as string;');

fs.writeFileSync(file, code);
console.log('Fixed req.params.id in notification.controller.ts');
