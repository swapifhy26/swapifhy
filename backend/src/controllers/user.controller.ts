import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
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

        // Calculate Gamification & Mentorship stats dynamically
        const totalSwapsCount = await prisma.mentorship.count({
            where: { OR: [{ teacherId: userId }, { studentId: userId }] }
        });

        const taughtClasses = await prisma.mentorshipClass.aggregate({
            where: { mentorship: { teacherId: userId }, isCompleted: true },
            _sum: { durationMinutes: true }
        });
        const hoursTaught = Math.round((taughtClasses._sum.durationMinutes || 0) / 60 * 10) / 10;

        const learnedClasses = await prisma.mentorshipClass.aggregate({
            where: { mentorship: { studentId: userId }, isCompleted: true },
            _sum: { durationMinutes: true }
        });
        const hoursLearned = Math.round((learnedClasses._sum.durationMinutes || 0) / 60 * 10) / 10;

        const ratings = await prisma.mentorshipRating.aggregate({
            where: { mentorship: { teacherId: userId } },
            _avg: { rating: true }
        });
        const avgRating = ratings._avg.rating ? Math.round(ratings._avg.rating * 10) / 10 : 0;


        res.status(200).json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                bio: user.bio,
                hobbies: user.hobbies,
                avatarUrl: user.avatarUrl,
                reputation: user.reputation,
                
                xp: user.xp,
                currentStreak: user.currentStreak,
                highestStreak: user.highestStreak,
                lastStreakDate: user.lastStreakDate,
                totalSwaps: totalSwapsCount,
                hoursTaught: hoursTaught,
                hoursLearned: hoursLearned,
                avgRating: avgRating,

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

export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            res.status(400).json({ error: "Current and new password are required" });
            return;
        }

        if (newPassword.length < 8) {
            res.status(400).json({ error: "New password must be at least 8 characters" });
            return;
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isValid) {
            res.status(401).json({ error: "Current password is incorrect" });
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(newPassword, salt);

        await prisma.user.update({
            where: { id: userId },
            data: { passwordHash }
        });

        res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to update password" });
    }
};


export const markStreak = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

        const user = await prisma.user.findUnique({ where: { id: userId }});
        if (!user) { res.status(404).json({ error: "User not found" }); return; }

        const { timezoneOffset } = req.body;
        const tzOffsetMs = (timezoneOffset || 0) * 60 * 1000;
        
        // Shift time by user's timezone to get local date strings via ISO
        const localNow = new Date(Date.now() - tzOffsetMs);
        const todayStr = localNow.toISOString().split('T')[0];
        
        let { currentStreak, highestStreak, lastStreakDate } = user;
        const lastLocal = lastStreakDate ? new Date(lastStreakDate.getTime() - tzOffsetMs) : null;
        const lastStr = lastLocal ? lastLocal.toISOString().split('T')[0] : null;

        if (lastStr === todayStr) {
            res.status(400).json({ error: "Streak already marked for today!" });
            return;
        }

        const localYesterday = new Date(localNow.getTime() - 24 * 60 * 60 * 1000);
        const yesterdayStr = localYesterday.toISOString().split('T')[0];

        if (lastStr === yesterdayStr) {
            currentStreak += 1;
        } else {
            currentStreak = 1;
        }

        if (currentStreak > highestStreak) highestStreak = currentStreak;

        await prisma.user.update({
            where: { id: userId },
            data: { currentStreak, highestStreak, lastStreakDate: new Date() }
        });

        res.status(200).json({ currentStreak, highestStreak, lastStreakDate: new Date() });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to mark streak" });
    }
};

import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env';

export const submitTicket = async (req: any, res: any): Promise<void> => {
    try {
        let userId = null;
        
        // Try to optionally extract the user ID if they happen to be logged in
        const authHeader = req.headers['authorization'];
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            try {
                const decoded = jwt.verify(token, JWT_SECRET) as any;
                userId = decoded.id;
            } catch(e) {}
        }

        const { ticketId, type, category, content, email } = req.body;

        const ticket = await prisma.supportTicket.create({
            data: {
                ticketId,
                type,
                category,
                content,
                email: email || null,
                userId: userId || null
            }
        });

        res.status(201).json(ticket);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create ticket" });
    }
};


export const savePushSubscription = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user!.id;
        const { subscription } = req.body;
        
        if (!subscription) {
            res.status(400).json({ error: "Missing subscription object" });
            return;
        }
        
        await prisma.user.update({
            where: { id: userId },
            data: { pushSubscription: subscription }
        });
        
        res.status(200).json({ success: true, message: "Push subscription saved." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to save push subscription" });
    }
};
