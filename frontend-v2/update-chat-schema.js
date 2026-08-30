const fs = require('fs');
let code = fs.readFileSync('../backend/prisma/schema.prisma', 'utf8');

if (!code.includes('isRead        Boolean  @default(false)')) {
    code = code.replace(
        'isRevoked     Boolean  @default(false)',
        'isRevoked     Boolean  @default(false)\n  isRead        Boolean  @default(false)'
    );
    fs.writeFileSync('../backend/prisma/schema.prisma', code);
    console.log("Added isRead to ChatMessage");
}
