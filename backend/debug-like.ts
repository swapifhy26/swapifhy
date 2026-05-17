import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debug() {
  const userId = "e3c490d4-adf7-4f7b-8af3-95ccf3f11fcc6"; // From test-db.ts
  const postId = "cd2ed799-fc55-4cb5-b587-ccf3f1fcc627f"; // From test-like.ts
  
  console.log(`Debugging Toggle: user=${userId}, post=${postId}`);
  
  try {
    const existingLike = await prisma.like.findUnique({
      where: { postId_userId: { postId, userId } }
    });
    
    if (existingLike) {
      console.log("Found existing like:", existingLike.id);
      await prisma.like.delete({ where: { id: existingLike.id } });
      console.log("Delete successful.");
    } else {
      console.log("No existing like found. Attempting create...");
      await prisma.like.create({ data: { postId, userId } });
      console.log("Create successful.");
    }
  } catch (e: any) {
    console.error("DEBUG CRITICAL FAILURE:", e);
    if (e.code) console.error("Prisma Code:", e.code);
    if (e.meta) console.error("Prisma Meta:", e.meta);
  } finally {
    await prisma.$disconnect();
  }
}

debug();
