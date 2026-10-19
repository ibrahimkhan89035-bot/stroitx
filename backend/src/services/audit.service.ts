import { prisma } from '../config/database';

export class AuditService {
  public static async logAction(
    userId: string | null,
    action: string,
    entity: string,
    entityId?: string,
    metadata?: any,
    ipAddress?: string
  ): Promise<void> {
    try {
      await prisma.activityLog.create({
        data: {
          userId,
          action,
          entity,
          entityId,
          details: metadata ? JSON.stringify(metadata) : null,
          ipAddress,
        },
      });
    } catch (err) {
      console.error('[Audit Log Failure]:', err);
    }
  }

  public static async logAdminActivity(
    adminEmail: string,
    action: string,
    targetId: string,
    changes?: any,
    ipAddress?: string
  ): Promise<void> {
    try {
      await prisma.activityLog.create({
        data: {
          action,
          entity: 'AdminAction',
          entityId: targetId,
          details: JSON.stringify({ adminEmail, changes }),
          ipAddress: ipAddress || '127.0.0.1',
        },
      });
    } catch (err) {
      console.error('[Activity Log Failure]:', err);
    }
  }
}
