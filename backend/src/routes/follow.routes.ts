import { Router } from 'express';
import { followUser, unfollowUser, getFollowers, getFollowing, getFollowStats } from '../controllers/follow.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.post('/sync', followUser);       // Handshake initiation
router.delete('/sever', unfollowUser);   // Sync severance
router.get('/cloud', getFollowers);      // Follower cloud retrieval
router.get('/following', getFollowing);  // Following cloud retrieval
router.get('/stats', getFollowStats);    // Personal network telemetry
router.get('/stats/:userId', getFollowStats); // Remote network telemetry

export default router;
