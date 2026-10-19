import { Router } from 'express';
import { activateFreeTrial } from '../controllers/subscription.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireProfessional } from '../middleware/rbac.middleware';

const router = Router();

router.post('/activate-trial', authenticate, requireProfessional, activateFreeTrial);

export default router;