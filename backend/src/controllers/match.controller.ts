import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

export const getExplore = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const users = await prisma.user.findMany({
            where: {
                id: { not: userId },
                OR: [
                    { privacy: "PUBLIC" },
                    { followers: { some: { followerId: userId } } }
                ]
            },
            include: {
                skillsTeaching: { include: { skill: true } },
                skillsLearning: { include: { skill: true } },
                followers: { where: { followerId: userId } }
            },
            take: 50,
            orderBy: { createdAt: 'desc' }
        });

        const formattedUsers = users.map((user: any) => ({
            id: user.id,
            name: user.name,
            bio: user.bio,
            avatarUrl: user.avatarUrl,
            github: user.github,
            linkedin: user.linkedin,
            instagram: user.instagram,
            otherLink: user.otherLink,
            reputation: user.reputation,
            privacy: user.privacy,
            isFollowing: user.followers.length > 0,
            teaching: user.skillsTeaching.map((st: any) => st.skill.name),
            learning: user.skillsLearning.map((sl: any) => sl.skill.name),
            teachingCategories: user.skillsTeaching.map((st: any) => st.skill.category),
            learningCategories: user.skillsLearning.map((sl: any) => sl.skill.category),
            matchScore: 0,
            isPerfectMatch: false
        }));

        res.status(200).json({ matches: formattedUsers });
    } catch (error) {
        console.error("Explore Error:", error);
        res.status(500).json({ error: "Failed to explore identity nodes" });
    }
};

export const getMatches = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const currentUser = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                skillsTeaching: { select: { skillId: true } },
                skillsLearning: { select: { skillId: true } }
            }
        });

        if (!currentUser) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        const teachingSkillIds = currentUser.skillsTeaching.map(s => s.skillId);
        const learningSkillIds = currentUser.skillsLearning.map(s => s.skillId);
        const emptySkills = teachingSkillIds.length === 0 && learningSkillIds.length === 0;

        const matches = await prisma.user.findMany({
            where: {
                id: { not: userId },
                OR: [
                    { privacy: "PUBLIC" },
                    { followers: { some: { followerId: userId } } }
                ],
                ...(emptySkills ? {} : {
                    OR: [
                        { skillsTeaching: { some: { skillId: { in: learningSkillIds } } } },
                        { skillsLearning: { some: { skillId: { in: teachingSkillIds } } } }
                    ]
                })
            },
            include: {
                skillsTeaching: { include: { skill: true } },
                skillsLearning: { include: { skill: true } },
                followers: { where: { followerId: userId } }
            },
            take: 20
        });

        const formattedMatches = matches.map((user: any) => {
            let score = 0;
            const theirTeachingIds = user.skillsTeaching.map((s: any) => s.skillId);
            const theirLearningIds = user.skillsLearning.map((s: any) => s.skillId);
            const canTeachUs = theirTeachingIds.filter((id: any) => learningSkillIds.includes(id)).length;
            const wantsToLearnFromUs = theirLearningIds.filter((id: any) => teachingSkillIds.includes(id)).length;
            score = (canTeachUs * 10) + (wantsToLearnFromUs * 10);

            return {
                id: user.id,
                name: user.name,
                bio: user.bio,
                avatarUrl: user.avatarUrl,
                github: user.github,
                linkedin: user.linkedin,
                instagram: user.instagram,
                otherLink: user.otherLink,
                reputation: user.reputation,
                privacy: user.privacy,
                isFollowing: user.followers.length > 0,
                teaching: user.skillsTeaching.map((st: any) => st.skill.name),
                learning: user.skillsLearning.map((sl: any) => sl.skill.name),
                teachingCategories: user.skillsTeaching.map((st: any) => st.skill.category),
                learningCategories: user.skillsLearning.map((sl: any) => sl.skill.category),
                matchScore: score,
                isPerfectMatch: canTeachUs > 0 && wantsToLearnFromUs > 0
            };
        });

        formattedMatches.sort((a, b) => b.matchScore - a.matchScore);
        res.status(200).json({ matches: formattedMatches });
    } catch (error) {
        console.error("Match Error:", error);
        res.status(500).json({ error: "Failed to fetch matches" });
    }
};

// ✅ NEW — returns every user except the requester, no privacy filter, no take() limit
export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const users = await prisma.user.findMany({
            where: {
                id: { not: userId }
                // ✅ No privacy filter — show everyone
                // ✅ No take() limit — show all 422 users
            },
            include: {
                skillsTeaching: { include: { skill: true } },
                skillsLearning: { include: { skill: true } },
                followers: { where: { followerId: userId } }
            },
            orderBy: { createdAt: 'desc' }
        });

        const formatted = users.map((user: any) => ({
            id: user.id,
            name: user.name,
            bio: user.bio,
            hobbies: user.hobbies,
            avatarUrl: user.avatarUrl,
            github: user.github,
            linkedin: user.linkedin,
            instagram: user.instagram,
            otherLink: user.otherLink,
            reputation: user.reputation,
            createdAt: user.createdAt,
            privacy: user.privacy,
            isFollowing: user.followers.length > 0,
            // ✅ Consistent field names the frontend expects
            teaching: user.skillsTeaching.map((st: any) => st.skill.name),
            learning: user.skillsLearning.map((sl: any) => sl.skill.name),
            // ✅ Categories for domain filter
            teachingCategories: user.skillsTeaching.map((st: any) => st.skill.category),
            learningCategories: user.skillsLearning.map((sl: any) => sl.skill.category),
        }));

        res.status(200).json({ matches: formatted });
    } catch (error) {
        console.error("getAllUsers Error:", error);
        res.status(500).json({ error: "Failed to fetch all users" });
    }
};
