import { prisma } from '../config/database';

export class NotificationService {
  public async createNotification(
    userId: string,
    title: string,
    body: string
  ) {
    return prisma.notification.create({
      data: {
        userId,
        title,
        body,
        read: false,
      },
    });
  }

  public async getUserNotifications(userId: string) {
    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      prisma.notification.count({
        where: { userId, read: false },
      }),
    ]);

    return { notifications, unreadCount };
  }

  public async markAsRead(notificationId: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { read: true },
    });
  }

  public async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }
}

export const notificationService = new NotificationService();
