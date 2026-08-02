// src/routes/auth.routes.ts
// FIX: prisma.settings → prisma.systemSettings throughout

import { Router, Request, Response, NextFunction } from 'express';
import { register, login, joinWaitlist } from '../controllers/auth.controller';
import { PrismaClient } from '@prisma/client';

const router  = Router();
const prisma  = new PrismaClient();

// ── PLATFORM STATE CONTROL MIDDLEWARE ──
// Reads the SystemSettings record managed by the admin panel and enforces
// maintenance mode and registration locks before any auth action proceeds.
const checkPlatformControls = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // FIX: was prisma.settings.findFirst() — model is SystemSettings,
        //      Prisma client accessor is prisma.systemSettings
        const settings = await prisma.systemSettings.findFirst();

        if (!settings) {
            // No settings row yet — allow everything (safe default)
            return next();
        }

        // 1. Maintenance mode blocks ALL auth routes (login too, so users
        //    get the lockscreen instead of a silent failure)
        if (settings.maintenanceMode) {
            return res.status(503).json({
                error:   "System Maintenance Active",
                message: "Swapifhy is temporarily offline for upgrades. We will be back shortly!"
            });
        }

        // 2. Registration lock — only blocks /register
        if (req.path === '/register' && !settings.allowNewRegistrations) {
            return res.status(403).json({
                error:   "Registrations Closed",
                message: "New user registrations are currently disabled by system administrators."
            });
        }

        next();
    } catch (error) {
        // If the settings table is unreachable, don't hard-block core auth
        console.error("Platform controls check error:", error);
        next();
    }
};

// ── PUBLIC STATUS ENDPOINT ──
// Called by the login page on mount to decide which UI state to show.
// FIX: was prisma.settings → prisma.systemSettings
router.get('/status', async (req: Request, res: Response) => {
    try {
        const settings = await prisma.systemSettings.findFirst();
        res.json({
            maintenanceMode:       settings?.maintenanceMode       ?? false,
            allowNewRegistrations: settings?.allowNewRegistrations ?? true
        });
    } catch {
        // Safe fallback — never break the login page
        res.json({ maintenanceMode: false, allowNewRegistrations: true });
    }
});

// ── PROTECTED AUTH ACTIONS ──
router.post('/register', checkPlatformControls, register);
router.post('/login',    checkPlatformControls, login);
router.post('/waitlist', checkPlatformControls, joinWaitlist);

export default router;
