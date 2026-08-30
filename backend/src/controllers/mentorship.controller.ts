import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getSwapRequests = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) return;

        const incoming = await prisma.swap.findMany({
            where: { receiverId: userId, status: "PENDING" },
            include: { proposer: { select: { id: true, name: true, avatarUrl: true } } }
        });

        const outgoing = await prisma.swap.findMany({
            where: { proposerId: userId, status: "PENDING" },
            include: { receiver: { select: { id: true, name: true, avatarUrl: true } } }
        });

        res.status(200).json({ incoming, outgoing });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to load swap requests" });
    }
};

export const acceptSwap = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const swapId = req.params.id;
        if (!userId) return;

        const swap = await prisma.swap.findUnique({ where: { id: swapId } });
        if (!swap || swap.receiverId !== userId || swap.status !== "PENDING") {
            res.status(400).json({ error: "Invalid swap request" });
            return;
        }

        // Limit Check: Max 5 active students for the receiver
        const activeTeaching = await prisma.mentorship.count({
            where: { teacherId: userId, status: "ACTIVE" }
        });
        if (activeTeaching >= 5) {
            res.status(400).json({ error: "You can only teach a maximum of 5 students at a time." });
            return;
        }

        // Auto-detect skills (Fallback to first skill if not explicitly set)
        let proposerSkillId = swap.proposerSkillId;
        let receiverSkillId = swap.receiverSkillId;

        const proposerSkills = await prisma.skillTeaching.findMany({ where: { userId: swap.proposerId } });
        const receiverSkills = await prisma.skillTeaching.findMany({ where: { userId: swap.receiverId } });

        if (!proposerSkillId && proposerSkills.length > 0) proposerSkillId = proposerSkills[0].skillId;
        if (!receiverSkillId && receiverSkills.length > 0) receiverSkillId = receiverSkills[0].skillId;

        // Update swap status
        await prisma.swap.update({
            where: { id: swapId },
            data: { status: "ACCEPTED", proposerSkillId, receiverSkillId }
        });

        // Create Mentorships (Dual Flow)
        if (proposerSkillId) {
            // Proposer teaches Receiver
            await prisma.mentorship.create({
                data: {
                    swapId: swap.id,
                    teacherId: swap.proposerId,
                    studentId: swap.receiverId,
                    skillId: proposerSkillId
                }
            });
        }
        if (receiverSkillId) {
            // Receiver teaches Proposer
            await prisma.mentorship.create({
                data: {
                    swapId: swap.id,
                    teacherId: swap.receiverId,
                    studentId: swap.proposerId,
                    skillId: receiverSkillId
                }
            });
        }

        res.status(200).json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to accept swap" });
    }
};

export const getMentorships = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) return;

        const teaching = await prisma.mentorship.findMany({
            where: { teacherId: userId, status: "ACTIVE" },
            include: {
                student: { select: { name: true, avatarUrl: true } },
                skill: true,
                classes: true,
                assignments: true,
                resources: true,
                ratings: true
            }
        });

        const learning = await prisma.mentorship.findMany({
            where: { studentId: userId, status: "ACTIVE" },
            include: {
                teacher: { select: { name: true, avatarUrl: true } },
                skill: true,
                classes: true,
                assignments: true,
                resources: true
            }
        });

        res.status(200).json({ teaching, learning });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to load mentorships" });
    }
};

export const updateMentorshipProgress = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { nextMilestone, meetingLink } = req.body;
        const updated = await prisma.mentorship.update({
            where: { id },
            data: { nextMilestone, meetingLink }
        });
        res.status(200).json(updated);
    } catch (err) {
        res.status(500).json({ error: "Update failed" });
    }
};

export const leaveSwap = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;
        const m = await prisma.mentorship.findUnique({ where: { id }, include: { classes: true } });
        if (!m || (m.teacherId !== userId && m.studentId !== userId)) {
            res.status(403).json({ error: "Unauthorized" });
            return;
        }

        const totalHours = m.classes.reduce((acc, c) => acc + (c.isCompleted ? c.durationMinutes / 60 : 0), 0);
        
        // Penalty if target not met
        if (m.targetDurationHours > 0 && totalHours < m.targetDurationHours) {
            await prisma.user.update({
                where: { id: userId },
                data: { reputation: { decrement: 5 } } // Representing -0.25 stars via reputation
            });
        }

        await prisma.mentorship.update({
            where: { id },
            data: { status: "CANCELLED" }
        });
        res.status(200).json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Failed to leave swap" });
    }
};

export const scheduleClass = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { title, startTime, durationMinutes, isCompleted } = req.body;
        
        const cl = await prisma.mentorshipClass.create({
            data: { mentorshipId: id, title, startTime: new Date(startTime), durationMinutes, isCompleted: isCompleted || false }
        });

        if (isCompleted) {
            const m = await prisma.mentorship.findUnique({ where: { id }});
            if (m) {
                await prisma.user.update({
                    where: { id: m.teacherId },
                    data: { reputation: { increment: 10 } }
                });
            }
        }
        res.status(200).json(cl);
    } catch (err) {
        res.status(500).json({ error: "Failed to schedule" });
    }
};

export const addResource = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { title, url } = req.body;
        const resource = await prisma.mentorshipResource.create({
            data: { mentorshipId: id, title, url }
        });
        // Bonus for sharing
        const m = await prisma.mentorship.findUnique({ where: { id }});
        if (m) {
            await prisma.user.update({ where: { id: m.teacherId }, data: { reputation: { increment: 2 } } });
        }
        res.status(200).json(resource);
    } catch (err) {
        res.status(500).json({ error: "Failed to add resource" });
    }
};

export const gradeAssignment = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { title, description, isCompleted, score, feedback } = req.body;
        const assignment = await prisma.mentorshipAssignment.create({
            data: { mentorshipId: id, title, description, isCompleted, score, feedback }
        });
        const m = await prisma.mentorship.findUnique({ where: { id }});
        if (m) {
            await prisma.user.update({ where: { id: m.teacherId }, data: { reputation: { increment: 5 } } });
        }
        res.status(200).json(assignment);
    } catch (err) {
        res.status(500).json({ error: "Failed to add assignment" });
    }
};

export const rateTeacher = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { rating, feedback } = req.body;
        
        const mRating = await prisma.mentorshipRating.create({
            data: { mentorshipId: id, weekStarting: new Date(), rating, feedback }
        });
        
        // Boost teacher rep based on rating
        const m = await prisma.mentorship.findUnique({ where: { id }});
        if (m && rating >= 4) {
            await prisma.user.update({ where: { id: m.teacherId }, data: { reputation: { increment: 15 } } });
        }
        res.status(200).json(mRating);
    } catch (err) {
        res.status(500).json({ error: "Failed to rate teacher" });
    }
};
