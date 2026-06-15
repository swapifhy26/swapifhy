import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { JWT_SECRET } from '../config/env';

const prisma = new PrismaClient();

// Extend the Express Request to hold our User Payload
export interface AuthRequest extends Request {
    user?: { id: string; email: string };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: Bearer <token>

    if (!token) {
        res.status(401).json({ error: "Access denied. No token provided." });
        return;
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded as { id: string; email: string };
        // Track last activity (fire-and-forget — never blocks the response;
        // silently ignored if the lastActiveAt column isn't present yet).
        prisma.user.update({ where: { id: req.user.id }, data: { lastActiveAt: new Date() } }).catch(() => {});
        next();
    } catch (error) {
        res.status(403).json({ error: "Invalid or expired token." });
    }
};
