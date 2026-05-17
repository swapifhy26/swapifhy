import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log("🧹 Clearing DB and Seeding mock MVP data...");

    // Password is identical for all test users
    const passwordHash = await bcrypt.hash('password123', 10);

    // Real Team Members for MVP UAT
    const users = [
        { email: 'anwesha@swapifhy.com', name: 'Anwesha Ganji', bio: 'Builder focused on entrepreneurship, research, and design. Leads Swapifhy with a vision to make collaboration accessible.', teaching: ['Entrepreneurship', 'Research', 'Design'], learning: ['Backend Architecture', 'Scaling'] },
        { email: 'falak@swapifhy.com', name: 'Falak Yadav', bio: 'Chief Technology Officer and Co-Founder of Swapifhy. Visionary tech builder focused on robust scalable platforms.', teaching: ['System Architecture', 'Next.js', 'PostgreSQL'], learning: ['Marketing Strategy', 'Design'] },
        { email: 'karan@swapifhy.com', name: 'Karan Choudhary', bio: 'Backend-focused developer interested in scalable systems, data pipelines, and building reliable software.', teaching: ['Node.js', 'TypeScript', 'Data Pipelines'], learning: ['Frontend UI', 'Figma'] },
        { email: 'aditi@swapifhy.com', name: 'Aditi S.', bio: 'Creative thinker with interests in poetry, piano, and chess. Focused on thoughtful practice and continuous improvement.', teaching: ['Marketing', 'Poetry', 'Chess'], learning: ['Web Development', 'Analytics'] },
    ];

    for (const u of users) {
        // Upsert user
        const newU = await prisma.user.upsert({
            where: { email: u.email },
            update: {},
            create: {
                email: u.email,
                name: u.name,
                passwordHash,
                bio: u.bio,
                reputation: Math.floor(Math.random() * 50) + 10
            }
        });

        // Add Teaching Skills
        for (const skill of u.teaching) {
            const skillName = skill.toLowerCase();
            const skillRec = await prisma.skill.upsert({ where: { name: skillName }, update: {}, create: { name: skillName, category: 'General' } });
            await prisma.skillTeaching.upsert({
                where: { userId_skillId: { userId: newU.id, skillId: skillRec.id } },
                update: {},
                create: { userId: newU.id, skillId: skillRec.id, level: 'Expert' }
            });
        }

        // Add Learning Skills
        for (const skill of u.learning) {
            const skillName = skill.toLowerCase();
            const skillRec = await prisma.skill.upsert({ where: { name: skillName }, update: {}, create: { name: skillName, category: 'General' } });
            await prisma.skillLearning.upsert({
                where: { userId_skillId: { userId: newU.id, skillId: skillRec.id } },
                update: {},
                create: { userId: newU.id, skillId: skillRec.id }
            });
        }
    }

    console.log("✅ Seeding complete! Dummy data is live in the Database.");
    console.log("👉 Test Accounts available using: password123");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
