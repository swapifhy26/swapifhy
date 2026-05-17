import { Router } from 'express';
import { register, login, joinWaitlist } from '../controllers/auth.controller';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/waitlist', joinWaitlist);

export default router;
