import { Router } from 'express';
import { getMatches, getExplore, getAllUsers } from '../controllers/match.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/explore', getExplore);
router.get('/sync-matrix', getMatches);
router.get('/all', getAllUsers); // ✅ Add this

export default router;
