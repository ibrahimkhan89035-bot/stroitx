import { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler';
import { sendSuccess } from '../utils/response';
import { adminService } from '../services/admin.service';
import { projectService } from '../services/project.service';
import { prisma } from '../config/database';
import { notificationService } from '../services/notification.service';
import { ProjectStatus } from '@prisma/client';

export const getOverviewMetrics = asyncHandler(async (req: Request, res: Response) => {
  const metrics = await adminService.getOverviewMetrics();
  return sendSuccess(res, 'Live database administrative metrics loaded.', metrics);
});

export const getMasterView = asyncHandler(async (req: Request, res: Response) => {
  const masterData = await adminService.getMasterView();
  return sendSuccess(res, 'Admin master view dataset loaded.', masterData);
});

export const approveProject = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const project = await projectService.approveProject(req.user!.id, id);
  return sendSuccess(res, 'Project approved and pushed to professional feed.', project);
});

export const updateProjectStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, reason } = req.body;

  const statusStr = String(status).toUpperCase();
  const isApproval = statusStr === 'PUBLISHED' || statusStr === 'APPROVED' || statusStr === 'POSTED';
  const isCompletion = statusStr === 'COMPLETED';
  const targetStatus = isApproval
    ? ProjectStatus.POSTED
    : isCompletion
    ? ProjectStatus.COMPLETED
    : statusStr === 'REJECTED' || statusStr === 'CANCELLED'
    ? ProjectStatus.CANCELLED
    : (status as any);

  const project = await prisma.project.update({
    where: { id },
    data: {
      status: targetStatus,
    },
    include: {
      owner: { select: { id: true, name: true, email: true } },
    },
  });

  const isLive = targetStatus === ProjectStatus.POSTED;
  const isFinished = targetStatus === ProjectStatus.COMPLETED;
  const titleNotif = isLive
    ? 'Project Approved & Published! 🎉'
    : isFinished
    ? 'Project Completed! 🎉'
    : 'Project Submission Update';
  const bodyNotif = isLive
    ? `Your project "${project.name}" has been reviewed and approved by Admin. It is now live in the marketplace feed for verified contractors.`
    : isFinished
    ? `Your project "${project.name}" status has been updated to COMPLETED by Admin.`
    : `Your project "${project.name}" submission status was updated to ${status}. ${reason || ''}`;

  await notificationService.createNotification(project.ownerId, titleNotif, bodyNotif).catch(() => {});

  return sendSuccess(res, `Project status updated to ${targetStatus}.`, project);
});

export const rejectProject = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { reason } = req.body;
  const project = await projectService.rejectProject(req.user!.id, id, reason);
  return sendSuccess(res, 'Project rejected by admin.', project);
});

export const getHomeowners = asyncHandler(async (req: Request, res: Response) => {
  const homeowners = await adminService.getHomeownersWithRelations();
  return sendSuccess(res, 'Homeowners list with relational project data loaded.', homeowners);
});

export const getProfessionals = asyncHandler(async (req: Request, res: Response) => {
  const professionals = await adminService.getProfessionalsWithRelations();
  return sendSuccess(res, 'Professionals list with quotes & verification relations loaded.', professionals);
});

export const getReports = asyncHandler(async (req: Request, res: Response) => {
  const reports = await adminService.getReportsList();
  return sendSuccess(res, 'Disputes and reports loaded.', reports);
});

export const getModeration = asyncHandler(async (req: Request, res: Response) => {
  const moderation = await adminService.getModerationList();
  return sendSuccess(res, 'Content moderation items loaded.', moderation);
});

export const softDeleteUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await adminService.softDeleteUser(req.user!.id, req.user!.email || 'admin@stroitx.com', id);
  return sendSuccess(res, 'User account soft deleted successfully.', user);
});

export const softDeleteProject = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const project = await adminService.softDeleteProject(req.user!.id, req.user!.email || 'admin@stroitx.com', id);
  return sendSuccess(res, 'Project record soft deleted successfully.', project);
});

export const getUsersList = asyncHandler(async (req: Request, res: Response) => {
  const users = await adminService.getUsersList();
  return sendSuccess(res, 'Platform registered users loaded.', users);
});

export const getVerificationQueue = asyncHandler(async (req: Request, res: Response) => {
  const queue = await adminService.getVerificationQueue();
  return sendSuccess(res, 'Professional verification queue loaded.', queue);
});

export const createBroadcast = asyncHandler(async (req: Request, res: Response) => {
  const { title, targetAudience, messageBody } = req.body;
  const broadcast = await adminService.createSystemBroadcast(req.user!.id, title, targetAudience, messageBody);
  return sendSuccess(res, 'System broadcast sent successfully.', broadcast, 201);
});

export const getBroadcasts = asyncHandler(async (req: Request, res: Response) => {
  const broadcasts = await adminService.getSystemBroadcasts();
  return sendSuccess(res, 'System broadcasts history loaded.', broadcasts);
});

export const getAuditLogs = asyncHandler(async (req: Request, res: Response) => {
  const logs = await adminService.getAuditLogs();
  return sendSuccess(res, 'System audit trail logs loaded.', logs);
});

export const getApprovalQueue = asyncHandler(async (req: Request, res: Response) => {
  const queue = await projectService.getAdminApprovalQueue();
  return sendSuccess(res, 'Admin approval queue loaded.', queue);
});

export const handleLifecycleAction = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { actionType, reason } = req.body;
  const project = await projectService.handleAdminLifecycleAction(req.user!.id, id, actionType, reason);
  return sendSuccess(res, 'Project lifecycle action processed.', project);
});
