import { Router } from 'express';
import * as projectCtrl from '../controllers/project.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireHomeowner, requireProfessional } from '../middleware/rbac.middleware';
import { requireActiveTrial } from '../middleware/trial.middleware';

const router = Router();

router.use(authenticate);

// Phase 1: Homeowner Routes
router.post('/', requireHomeowner, projectCtrl.createProject);
router.get('/my-projects', requireHomeowner, projectCtrl.getHomeownerProjects);
router.post('/:id/accept-bid', requireHomeowner, projectCtrl.acceptBid);
router.post('/:id/request-completion', requireHomeowner, projectCtrl.requestCompletion);

// Phase 2: Professional Routes & Bidding
router.get('/feed', requireProfessional, requireActiveTrial, projectCtrl.getProfessionalFeed);
router.post('/:id/bid', requireProfessional, requireActiveTrial, projectCtrl.submitBid);

// Shared Route
router.get('/:id', requireActiveTrial, projectCtrl.getProjectDetails);

export default router;