import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireProfessional, requireAdminOrFounder } from '../middleware/rbac.middleware';
import {
  getVerificationStatus,
  uploadVerificationDocument,
  uploadMiddleware,
  adminReviewDocument,
  getVerificationDocumentFile,
} from '../controllers/verification.controller';

const router = Router();

router.get('/status', authenticate, requireProfessional, getVerificationStatus);
router.post('/upload', authenticate, requireProfessional, uploadMiddleware, uploadVerificationDocument);
router.get('/document/:id', authenticate, getVerificationDocumentFile);
router.patch('/admin/:id', authenticate, requireAdminOrFounder, adminReviewDocument);

export default router;
