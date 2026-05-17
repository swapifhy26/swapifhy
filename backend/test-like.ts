import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  console.log("Checking Like Table & Composite Keys...");
  try {
    const post = await prisma.post.findFirst();
    const user = await prisma.user.findFirst();
    
    if (post && user) {
        console.log(`Testing Like for Post: ${post.id}, User: ${user.id}`);
        // Attempt a findUnique with the composite key
        const like = await prisma.like.findUnique({
            where: {
                postId_userId: {
                    postId: post.id,
                    userId: user.id
                }
            }
        });
        console.log("Like query successful (Found: " + !!like + ")");
    } else {
        console.log("Not enough data to test Like table.");
    }
  } catch (e: any) {
    console.error("Like Query Failed:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}

check();
