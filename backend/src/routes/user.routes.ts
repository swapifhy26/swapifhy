import { Router } from 'express';
import { getProfile, updateProfile, changePassword, markStreak, submitTicket } from '../controllers/user.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Apply JWT authentication to all user routes
router.use(authenticateToken);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/password', changePassword);
router.post('/streak/mark', markStreak);
router.post('/ticket', submitTicket);

export default router;
