import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env';

const prisma = new PrismaClient();

export const joinWaitlist = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body;
        if (!email || !email.includes('@')) {
            res.status(400).json({ error: "A valid email is required" });
            return;
        }

        const waitlistUser = await prisma.waitlist.create({ data: { email } });
        res.status(201).json({ message: "Successfully joined the Founding Member waitlist", user: waitlistUser });
    } catch (error: any) {
        if (error.code === 'P2002') {
            res.status(409).json({ error: "This email is already on the waitlist!" });
            return;
        }
        res.status(500).json({ error: "Internal server error" });
    }
};

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        // ── ENFORCE ADMINISTRATIVE REGISTRATION LOCK ──
        // Checks the system configuration table before allowing database footprint writes
        const settings = await prisma.systemSettings.findFirst();
        if (settings && !settings.allowRegistrations) {
            res.status(403).json({ 
                error: "Registration Locked", 
                message: "Public registration pipelines are temporarily frozen. Please join the waitlist." 
            });
            return;
        }

        const { email, name, password, bio, hobbies, teach, learn } = req.body;

        if (!email || !name || !password) {
            res.status(400).json({ error: "Email, name, and password are required" });
            return;
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(409).json({ error: "User already exists with this email" });
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const newUser = await prisma.user.create({
            data: { email, name, passwordHash, bio, hobbies }
        });

        if (teach || learn) {
            const processSkills = async (userId: string, skillsString: string, type: 'TEACH' | 'LEARN') => {
                if (!skillsString) return;
                const skillNames = skillsString.split(',').map(s => s.trim().toLowerCase()).filter(s => s !== "");
                for (const name of skillNames) {
                    const skill = await prisma.skill.upsert({
                        where: { name },
                        update: {},
                        create: { name, category: "General" }
                    });
                    if (type === 'TEACH') {
                        await prisma.skillTeaching.create({ data: { userId, skillId: skill.id, level: "Intermediate" } });
                    } else {
                        await prisma.skillLearning.create({ data: { userId, skillId: skill.id } });
                    }
                }
            };
            if (teach) await processSkills(newUser.id, teach, 'TEACH');
            if (learn) await processSkills(newUser.id, learn, 'LEARN');
        }

        const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({
            message: "User registered successfully",
            token,
            user: { id: newUser.id, name: newUser.name, email: newUser.email }
        });
    } catch (error: any) {
        console.error("Registration Error:", error);
        res.status(500).json({ error: "Failed to register user", details: error.message });
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ error: "Email and password are required" });
            return;
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            res.status(401).json({ error: "Invalid credentials" });
            return;
        }

        const isValidPassword = await bcrypt.compare(password, user.passwordHash);
        if (!isValidPassword) {
            res.status(401).json({ error: "Invalid credentials" });
            return;
        }

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

        res.status(200).json({
            message: "Logged in successfully",
            token,
            user: { id: user.id, name: user.name, email: user.email }
        });
    } catch (error: any) {
        console.error("Login Error:", error);
        res.status(500).json({ error: "Failed to log in", details: error.message });
    }
};
