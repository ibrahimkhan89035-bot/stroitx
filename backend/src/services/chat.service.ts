import { prisma } from '../config/database';
import { AppError } from '../utils/error';
import { notificationService } from './notification.service';

export class ChatService {
  /**
   * Helper to find or create the system Admin user
   */
  private async getAdminUser() {
    let admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    });
    if (!admin) {
      admin = await prisma.user.findFirst();
    }
    return admin;
  }

  /**
   * Helper to find or create an active 24-hour support project for a user.
   * Automatically expires sessions older than 24 hours.
   */
  private async getOrCreateSupportProject(userId: string) {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Expire/close active support sessions older than 24 hours
    await prisma.project.updateMany({
      where: {
        ownerId: userId,
        type: 'SUPPORT',
        status: 'ACTIVE',
        updatedAt: { lt: twentyFourHoursAgo },
      },
      data: {
        status: 'CANCELLED',
      },
    });

    // Find current ACTIVE session created/updated within 24 hours
    let project = await prisma.project.findFirst({
      where: {
        ownerId: userId,
        type: 'SUPPORT',
        status: 'ACTIVE',
        deletedAt: null,
        updatedAt: { gte: twentyFourHoursAgo },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // If no active 24-hour session exists, create a brand-new 24-hour support thread
    if (!project) {
      project = await prisma.project.create({
        data: {
          ownerId: userId,
          name: `Live Support Ticket (${new Date().toLocaleDateString()})`,
          type: 'SUPPORT',
          status: 'ACTIVE',
        },
      });
    }

    return project;
  }

  /**
   * Get or create active live chat support session for a user
   */
  public async getOrCreateActiveSession(userId: string) {
    const project = await this.getOrCreateSupportProject(userId);
    const admin = await this.getAdminUser();
    const adminId = admin?.id || userId;

    const messages = await prisma.message.findMany({
      where: { projectId: project.id },
      include: {
        sender: { select: { id: true, name: true, email: true, role: true } },
        receiver: { select: { id: true, name: true, email: true, role: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        homeowner: true,
        professional: true,
      },
    });

    return {
      id: project.id,
      sessionId: project.id,
      userId,
      adminId,
      status: 'ACTIVE',
      user,
      messages: messages.map((m) => ({
        ...m,
        content: m.body,
        senderUserId: m.senderId,
      })),
      createdAt: project.createdAt,
    };
  }

  /**
   * Get messages for a support session
   */
  public async getSessionMessages(sessionId: string, userId: string) {
    const messages = await prisma.message.findMany({
      where: { projectId: sessionId },
      include: {
        sender: { select: { id: true, name: true, email: true, role: true } },
        receiver: { select: { id: true, name: true, email: true, role: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    return messages.map((m) => ({
      ...m,
      content: m.body,
      senderUserId: m.senderId,
    }));
  }

  /**
   * Send a message in a support chat session
   */
  public async sendChatMessage(sessionId: string, senderUserId: string, content: string) {
    const admin = await this.getAdminUser();
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const sender = await prisma.user.findUnique({ where: { id: senderUserId }, select: { role: true, name: true, email: true } });
    const isSenderAdmin = sender?.role === 'ADMIN' || (sender?.role as string) === 'FOUNDER';

    // Find the project / support session
    let project = await prisma.project.findUnique({ where: { id: sessionId } });

    // If session is expired or missing, or non-admin is messaging on an expired project, create a fresh 24-hour session
    if (!project || (!isSenderAdmin && (project.updatedAt < twentyFourHoursAgo || project.status !== 'ACTIVE'))) {
      project = await this.getOrCreateSupportProject(senderUserId);
    }

    // Touch project updatedAt timestamp to maintain 24-hour active window
    await prisma.project
      .update({
        where: { id: project.id },
        data: { updatedAt: new Date(), status: 'ACTIVE' },
      })
      .catch(() => {});

    // If sender is admin, receiver is project owner (the user). Otherwise, receiver is admin.
    const receiverId = isSenderAdmin ? project.ownerId : (admin?.id || senderUserId);

    const message = await prisma.message.create({
      data: {
        projectId: project.id,
        senderId: senderUserId,
        receiverId,
        body: content,
      },
      include: {
        sender: { select: { id: true, name: true, email: true, role: true } },
        receiver: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    // If admin replied, send a notification to the user
    if (isSenderAdmin && receiverId !== senderUserId) {
      await notificationService
        .createNotification(
          receiverId,
          'Live Support Response 💬',
          `Admin support replied: "${content.substring(0, 80)}${content.length > 80 ? '...' : ''}"`
        )
        .catch(() => {});
    }

    return {
      ...message,
      content: message.body,
      senderUserId: message.senderId,
    };
  }

  /**
   * Get all active live chat sessions for Admin dashboard
   */
  public async getAdminActiveChatSessions() {
    const supportProjects = await prisma.project.findMany({
      where: { type: 'SUPPORT', deletedAt: null },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            homeowner: true,
            professional: true,
          },
        },
        messages: {
          include: {
            sender: { select: { id: true, name: true, email: true, role: true } },
            receiver: { select: { id: true, name: true, email: true, role: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return supportProjects.map((p) => ({
      id: p.id,
      sessionId: p.id,
      userId: p.ownerId,
      status: p.status,
      user: p.owner,
      messages: p.messages.map((m) => ({
        ...m,
        content: m.body,
        senderUserId: m.senderId,
      })),
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));
  }

  /**
   * Search user by email/phone/name and create or return support session for Admin
   */
  public async searchOrGetAdminUserSession(query: string) {
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) return [];

    const matchedUsers = await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: cleanQuery, mode: 'insensitive' } },
          { phone: { contains: cleanQuery, mode: 'insensitive' } },
          { name: { contains: cleanQuery, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        homeowner: true,
        professional: true,
      },
      take: 10,
    });

    const sessions = await Promise.all(
      matchedUsers.map(async (u) => {
        return this.getOrCreateActiveSession(u.id);
      })
    );

    return sessions;
  }
}

export const chatService = new ChatService();
