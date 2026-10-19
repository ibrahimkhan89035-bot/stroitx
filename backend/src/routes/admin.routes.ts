import { Router } from 'express';
import * as adminCtrl from '../controllers/admin.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdminOrFounder } from '../middleware/rbac.middleware';

const router = Router();

router.use(authenticate);
router.use(requireAdminOrFounder);

router.get('/overview', adminCtrl.getOverviewMetrics);
router.get('/master-view', adminCtrl.getMasterView);
router.get('/homeowners', adminCtrl.getHomeowners);
router.get('/professionals', adminCtrl.getProfessionals);
router.get('/reports', adminCtrl.getReports);
router.get('/moderation', adminCtrl.getModeration);
router.get('/broadcasts', adminCtrl.getBroadcasts);
router.post('/broadcasts', adminCtrl.createBroadcast);
router.get('/users', adminCtrl.getUsersList);
router.get('/verifications', adminCtrl.getVerificationQueue);
router.get('/audit-logs', adminCtrl.getAuditLogs);
router.get('/approvals', adminCtrl.getApprovalQueue);
router.post('/projects/:id/lifecycle', adminCtrl.handleLifecycleAction);
router.patch('/projects/:id/status', adminCtrl.updateProjectStatus);
router.patch('/projects/:id/approve', adminCtrl.approveProject);
router.patch('/projects/:id/reject', adminCtrl.rejectProject);

export default router;
