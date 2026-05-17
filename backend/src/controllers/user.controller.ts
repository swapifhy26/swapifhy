import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                skillsTeaching: { include: { skill: true } },
                skillsLearning: { include: { skill: true } }
            }
        });

        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        res.status(200).json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                bio: user.bio,
                hobbies: user.hobbies,
                avatarUrl: user.avatarUrl,
                reputation: user.reputation,
                // PROFESSIONAL FOOTPRINT (PII)
                phoneNumber: user.phoneNumber,
                github: user.github,
                linkedin: user.linkedin,
                instagram: user.instagram,
                otherLink: user.otherLink,
                privacy: user.privacy,
                teachSkills: user.skillsTeaching.map(st => ({ name: st.skill.name })),
                learnSkills: user.skillsLearning.map(sl => ({ name: sl.skill.name }))
            }
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch profile" });
    }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const { name, bio, hobbies, avatarUrl, teach, learn, phoneNumber, github, linkedin, instagram, otherLink, privacy } = req.body;

        // 1. Update basic user info & Professional Footprint
        await prisma.user.update({
            where: { id: userId },
            data: { 
                ...(name !== undefined && { name }),
                ...(bio !== undefined && { bio }),
                ...(hobbies !== undefined && { hobbies }),
                ...(avatarUrl !== undefined && { avatarUrl }),
                ...(phoneNumber !== undefined && { phoneNumber }),
                ...(github !== undefined && { github }),
                ...(linkedin !== undefined && { linkedin }),
                ...(instagram !== undefined && { instagram }),
                ...(otherLink !== undefined && { otherLink }),
                ...(privacy !== undefined && { privacy })
            }
        });

        // Helper function to process comma-separated skills
        const processSkills = async (skillsString: string, type: 'TEACH' | 'LEARN') => {
            if (skillsString === undefined) return;
            const skillNames = skillsString.split(',').map(s => s.trim().toLowerCase()).filter(s => s !== "");

            // Clear existing skills for this type
            if (type === 'TEACH') {
                await prisma.skillTeaching.deleteMany({ where: { userId } });
            } else {
                await prisma.skillLearning.deleteMany({ where: { userId } });
            }

            for (const name of skillNames) {
                // Upsert the generic Skill record
                const skill = await prisma.skill.upsert({
                    where: { name },
                    update: {},
                    create: { name, category: "General" }
                });

                // Link the skill to the User
                if (type === 'TEACH') {
                    await prisma.skillTeaching.create({
                        data: { userId, skillId: skill.id, level: "Intermediate" }
                    });
                } else {
                    await prisma.skillLearning.create({
                        data: { userId, skillId: skill.id }
                    });
                }
            }
        };

        // 2. Process Skills (Ensuring we can clear them)
        if (teach !== undefined) await processSkills(teach, 'TEACH');
        if (learn !== undefined) await processSkills(learn, 'LEARN');

        const updatedUser = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                skillsTeaching: { include: { skill: true } },
                skillsLearning: { include: { skill: true } }
            }
        });

        res.status(200).json({
            message: "Profile footprint synchronized successfully",
            user: {
                name: updatedUser?.name,
                bio: updatedUser?.bio,
                hobbies: updatedUser?.hobbies,
                avatarUrl: updatedUser?.avatarUrl,
                phoneNumber: updatedUser?.phoneNumber,
                github: updatedUser?.github,
                linkedin: updatedUser?.linkedin,
                instagram: updatedUser?.instagram,
                privacy: updatedUser?.privacy,
                otherLink: updatedUser?.otherLink,
                teachSkills: updatedUser?.skillsTeaching.map(st => ({ name: st.skill.name })),
                learnSkills: updatedUser?.skillsLearning.map(sl => ({ name: sl.skill.name }))
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to update profile heartbeat" });
    }
};
