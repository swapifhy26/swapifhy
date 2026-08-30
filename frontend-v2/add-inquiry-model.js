const fs = require('fs');
let schema = fs.readFileSync('../backend/prisma/schema.prisma', 'utf8');

const inquiryModel = `

model Inquiry {
  id        String   @id @default(uuid())
  email     String
  subject   String?
  createdAt DateTime @default(now())
  isRead    Boolean  @default(false)
}`;

if (!schema.includes('model Inquiry')) {
    schema += inquiryModel;
    fs.writeFileSync('../backend/prisma/schema.prisma', schema);
    console.log('Inquiry model added to schema');
} else {
    console.log('Inquiry model already exists');
}
