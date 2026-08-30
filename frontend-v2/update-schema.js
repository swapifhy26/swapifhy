const fs = require('fs');

let schema = fs.readFileSync('../backend/prisma/schema.prisma', 'utf8');

// 1. Add relations to User
const userRelations = `
  // A user can initiate or receive a swap proposal
  swapsProposed  Swap[] @relation("SwapProposer")
  swapsReceived  Swap[] @relation("SwapReceiver")
`;
const newUserRelations = `
  // A user can initiate or receive a swap proposal
  swapsProposed  Swap[] @relation("SwapProposer")
  swapsReceived  Swap[] @relation("SwapReceiver")
  
  // MENTORSHIP SYSTEM
  mentorshipsTeaching Mentorship[] @relation("MentorshipTeacher")
  mentorshipsLearning Mentorship[] @relation("MentorshipStudent")
`;
schema = schema.replace(userRelations, newUserRelations);

// 2. Update Swap Model
const swapModel = `// A Swap represents an accepted or pending exchange of skills between two users
model Swap {
  id            String   @id @default(uuid())
  proposerId    String
  receiverId    String
  status        String   @default("PENDING") // PENDING, ACCEPTED, REJECTED, COMPLETED
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  proposer      User     @relation("SwapProposer", fields: [proposerId], references: [id])
  receiver      User     @relation("SwapReceiver", fields: [receiverId], references: [id])
  
  // CHAT HISTORY
  messages      ChatMessage[]
}`;
const newSwapModel = `// A Swap represents an accepted or pending exchange of skills between two users
model Swap {
  id            String   @id @default(uuid())
  proposerId    String
  receiverId    String
  
  // SKILLS EXCHANGED (Optional for backward compatibility, but required for new UI)
  proposerSkillId String? // The skill the proposer wants to TEACH
  receiverSkillId String? // The skill the receiver wants to TEACH (proposer wants to LEARN)
  
  status        String   @default("PENDING") // PENDING, ACCEPTED, REJECTED, COMPLETED
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  proposer      User     @relation("SwapProposer", fields: [proposerId], references: [id])
  receiver      User     @relation("SwapReceiver", fields: [receiverId], references: [id])
  
  // CHAT HISTORY
  messages      ChatMessage[]
  
  // GENERATED MENTORSHIPS
  mentorships   Mentorship[]
}`;
schema = schema.replace(swapModel, newSwapModel);


// 3. Add Mentorship Models
const mentorshipModels = `
// ==========================================
// MENTORSHIP & LEARNING HUB MODELS
// ==========================================

model Mentorship {
  id              String   @id @default(uuid())
  swapId          String?
  teacherId       String
  studentId       String
  skillId         String
  
  targetDurationHours Float    @default(0) // Goal set by teacher
  meetingLink     String?
  nextMilestone   String?
  status          String   @default("ACTIVE") // ACTIVE, CANCELLED, COMPLETED
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  // Relations
  swap            Swap?    @relation(fields: [swapId], references: [id])
  teacher         User     @relation("MentorshipTeacher", fields: [teacherId], references: [id])
  student         User     @relation("MentorshipStudent", fields: [studentId], references: [id])
  skill           Skill    @relation(fields: [skillId], references: [id])
  
  classes         MentorshipClass[]
  assignments     MentorshipAssignment[]
  resources       MentorshipResource[]
  ratings         MentorshipRating[]
}

model MentorshipClass {
  id              String   @id @default(uuid())
  mentorshipId    String
  title           String
  startTime       DateTime
  durationMinutes Int
  isCompleted     Boolean  @default(false)
  createdAt       DateTime @default(now())
  
  mentorship      Mentorship @relation(fields: [mentorshipId], references: [id], onDelete: Cascade)
}

model MentorshipAssignment {
  id              String   @id @default(uuid())
  mentorshipId    String
  title           String
  description     String?
  isCompleted     Boolean  @default(false)
  score           Float?   // e.g., 0-100
  feedback        String?
  dueDate         DateTime?
  createdAt       DateTime @default(now())
  
  mentorship      Mentorship @relation(fields: [mentorshipId], references: [id], onDelete: Cascade)
}

model MentorshipResource {
  id              String   @id @default(uuid())
  mentorshipId    String
  title           String
  url             String
  createdAt       DateTime @default(now())
  
  mentorship      Mentorship @relation(fields: [mentorshipId], references: [id], onDelete: Cascade)
}

model MentorshipRating {
  id              String   @id @default(uuid())
  mentorshipId    String
  weekStarting    DateTime // To track "weekly" ratings
  rating          Float    // 1 to 5 stars
  feedback        String?
  createdAt       DateTime @default(now())
  
  mentorship      Mentorship @relation(fields: [mentorshipId], references: [id], onDelete: Cascade)
}
`;

schema += mentorshipModels;

// Also add Mentorship relation to Skill model
const skillModel = `model Skill {
  id           String   @id @default(uuid())
  name         String   @unique
  category     String   // e.g., "Technology", "Music", "Languages"
  
  teachingRefs SkillTeaching[]
  learningRefs SkillLearning[]
}`;
const newSkillModel = `model Skill {
  id           String   @id @default(uuid())
  name         String   @unique
  category     String   // e.g., "Technology", "Music", "Languages"
  
  teachingRefs SkillTeaching[]
  learningRefs SkillLearning[]
  mentorships  Mentorship[]
}`;
schema = schema.replace(skillModel, newSkillModel);

fs.writeFileSync('../backend/prisma/schema.prisma', schema);
console.log('Schema updated successfully.');
