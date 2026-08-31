const fs = require('fs');
let s = fs.readFileSync('backend/prisma/schema.prisma', 'utf8');
if (!s.includes('email     String?')) {
    s = s.replace('status    String   @default("OPEN")', 'email     String?\n  status    String   @default("OPEN")');
    fs.writeFileSync('backend/prisma/schema.prisma', s);
    console.log("Added email to schema");
}
