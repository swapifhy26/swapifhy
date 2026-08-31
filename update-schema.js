const fs = require('fs');

let schema = fs.readFileSync('backend/prisma/schema.prisma', 'utf8');

const ticketModel = `
model SupportTicket {
  id        String   @id @default(uuid())
  userId    String?
  ticketId  String   @unique
  type      String   // QUERY, BUG
  category  String
  content   String
  status    String   @default("OPEN")
  createdAt DateTime @default(now())

  user      User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
}
`;

if (!schema.includes("model SupportTicket")) {
    schema += ticketModel;
    
    // Add relation to User model
    const userModelRegex = /model User \{[\s\S]*?likes\s+Like\[\]/m;
    schema = schema.replace(userModelRegex, (match) => {
        return match + '\n  supportTickets SupportTicket[]';
    });

    fs.writeFileSync('backend/prisma/schema.prisma', schema);
    console.log("Added SupportTicket to schema");
} else {
    console.log("SupportTicket already in schema");
}
