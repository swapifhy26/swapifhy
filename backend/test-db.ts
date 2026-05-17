import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  console.log("Checking DB Connection...");
  try {
    const userCount = await prisma.user.count();
    console.log(`Connection Successful. User count: ${userCount}`);
    
    const userSample = await prisma.user.findFirst();
    if (userSample) {
        console.log("Found User ID:", userSample.id);
        if ('avatarUrl' in userSample) {
            console.log("Database schema has avatarUrl field.");
        } else {
            console.log("Database schema is MISSING avatarUrl field!");
        }
    }
  } catch (e: any) {
    console.error("Connection Failed:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}

check();
