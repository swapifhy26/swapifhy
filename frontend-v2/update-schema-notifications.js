const fs = require('fs');
const schemaPath = '../backend/prisma/schema.prisma';
let schema = fs.readFileSync(schemaPath, 'utf8');

if (!schema.includes('model Notification')) {
    // Add Notification relation to User model
    schema = schema.replace(
        'skillsTeaching SkillTeaching[]',
        'notifications Notification[]\n  skillsTeaching SkillTeaching[]'
    );

    // Append Notification model
    const notificationModel = `
model Notification {
  id        String   @id @default(uuid())
  userId    String
  title     String
  message   String
  type      String   // SWAP_REQUEST, SWAP_ACCEPTED, NEW_MESSAGE, SYSTEM
  isRead    Boolean  @default(false)
  link      String?  // Optional URL to navigate to when clicked
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
`;
    schema += notificationModel;
    fs.writeFileSync(schemaPath, schema);
    console.log('Added Notification model to schema');
} else {
    console.log('Notification model already exists');
}
