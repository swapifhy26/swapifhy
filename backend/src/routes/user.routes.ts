import { Router } from 'express';
import { getProfile, updateProfile, changePassword, markStreak, submitTicket } from '../controllers/user.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// PUBLIC ROUTES (Unauthenticated users can submit tickets)
router.post('/ticket', submitTicket);

// Apply JWT authentication to all user routes below
router.use(authenticateToken as any);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/password', changePassword);
router.post('/streak/mark', markStreak);

export default router;
