import { Router, Request, Response, NextFunction } from 'express';
import { register, login, joinWaitlist } from '../controllers/auth.controller';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// ── PLATFORM STATE CONTROL MIDDLEWARE ──
// Intercepts operations based on the admin toggles
const checkPlatformControls = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Query the single settings record managed by your admin system
        const settings = await prisma.settings.findFirst();

        if (!settings) {
            return next();
        }

        // 1. If maintenance mode is enabled, reject everything except specific routes if needed
        if (settings.maintenanceMode) {
            return res.status(503).json({ 
                error: "System Maintenance Active", 
                message: "Swapifhy is temporarily offline for upgrades. We will be back shortly!" 
            });
        }

        // 2. If trying to hit register while registrations are turned off
        if (req.path === '/register' && !settings.allowNewRegistrations) {
            return res.status(403).json({ 
                error: "Registrations Closed", 
                message: "New user registrations are currently disabled by system administrators." 
            });
        }

        next();
    } catch (error) {
        console.error("Platform controls check error:", error);
        next(); // Fallback to avoid blocking core services if settings table fails
    }
};

// Public non-blocking route to feed system state parameters to the frontend
router.get('/status', async (req: Request, res: Response) => {
    try {
        const settings = await prisma.settings.findFirst();
        res.json({
            maintenanceMode: settings?.maintenanceMode || false,
            allowNewRegistrations: settings?.allowNewRegistrations ?? true
        });
    } catch {
        res.json({ maintenanceMode: false, allowNewRegistrations: true });
    }
});

// Apply control state checks on incoming auth actions
router.post('/register', checkPlatformControls, register);
router.post('/login', checkPlatformControls, login);
router.post('/waitlist', checkPlatformControls, joinWaitlist);

export default router;
