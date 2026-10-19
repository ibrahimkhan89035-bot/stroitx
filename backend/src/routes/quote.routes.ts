import { Router } from 'express';
import * as quoteCtrl from '../controllers/quote.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireHomeowner, requireProfessional } from '../middleware/rbac.middleware';
import { requireActiveTrial } from '../middleware/trial.middleware';

const router = Router();

router.use(authenticate);

router.post('/', requireProfessional, requireActiveTrial, quoteCtrl.createQuote);
router.post('/:id/send', requireProfessional, requireActiveTrial, quoteCtrl.sendQuote);
router.post('/:id/accept', requireHomeowner, quoteCtrl.acceptQuote);
router.get('/project/:projectId/compare', requireHomeowner, quoteCtrl.getQuoteComparison);

export default router;
