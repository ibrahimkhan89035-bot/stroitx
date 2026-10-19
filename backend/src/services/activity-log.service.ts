import { prisma } from '../config/database';

export class ActivityLogService {
  /**
   * Log major administrative actions (KYC approvals, Project approvals, Soft deletes)
   */
  public static async logAdminAction(
    adminEmail: string,
    action: string,
    targetId: string,
    changes?: any,
    ipAddress?: string
  ): Promise<void> {
    try {
      await (prisma as any).activityLog.create({
        data: {
          adminEmail: adminEmail || 'admin@stroitx.com',
          action,
          targetId,
          changes: changes ? JSON.stringify(changes) : null,
          ipAddress: ipAddress || '127.0.0.1',
        },
      });
    } catch (err) {
      console.error('[ActivityLog Error]:', err);
    }
  }
}
