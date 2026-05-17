import { Router } from 'express';
import { getMatches, getExplore } from '../controllers/match.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Apply JWT authentication
router.use(authenticateToken);

router.get('/explore', getExplore);
router.get('/sync-matrix', getMatches);

export default router;
