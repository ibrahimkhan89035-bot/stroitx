import { prisma } from '../config/database';
import { AppError } from '../utils/error';
import { notificationService } from './notification.service';

export class MessageService {
  /**
   * Get or create a conversation context between currentUserId and targetUserId for a project.
   */
  public async getOrCreateConversation(projectId: string | null | undefined, currentUserId: string, targetUserId: string) {
    if (!targetUserId) {
      throw new AppError('Target recipient user is required.', 400);
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: currentUserId },
      select: { id: true, role: true, name: true, email: true },
    });

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        homeowner: true,
        professional: true,
      },
    });

    if (!currentUser || !targetUser) {
      throw new AppError('User not found.', 404);
    }

    // Access Control Rule: Professionals CANNOT initiate a brand-new message thread with a Homeowner.
    if (currentUser.role === 'PROFESSIONAL' && targetUser.role === 'HOMEOWNER') {
      const priorMessage = await prisma.message.findFirst({
        where: {
          OR: [
            { senderId: currentUserId, receiverId: targetUserId },
            { senderId: targetUserId, receiverId: currentUserId },
          ],
        },
      });

      if (!priorMessage) {
        throw new AppError(
          'Access Denied: Professionals cannot initiate new message threads with homeowners. Homeowners must reach out first.',
          403
        );
      }
    }

    // Find existing project if not passed, or default to latest active project
    let activeProjectId = projectId;
    if (!activeProjectId) {
      const existingProject = await prisma.project.findFirst({
        where: {
          OR: [
            { ownerId: currentUserId },
            { ownerId: targetUserId },
            { bids: { some: { professionalId: currentUserId } } },
            { bids: { some: { professionalId: targetUserId } } },
          ],
          deletedAt: null,
        },
        orderBy: { createdAt: 'desc' },
      });
      activeProjectId = existingProject?.id;
    }

    // If still no project exists, create a default workspace project thread
    if (!activeProjectId) {
      const defaultProj = await prisma.project.create({
        data: {
          ownerId: currentUser.role === 'HOMEOWNER' ? currentUserId : targetUserId,
          name: 'Direct Messages & Workspace Discussion',
          type: 'General',
          status: 'POSTED',
        },
      });
      activeProjectId = defaultProj.id;
    }

    const project = await prisma.project.findUnique({
      where: { id: activeProjectId },
      select: { id: true, name: true, status: true },
    });

    const isClosed = await prisma.message.findFirst({
      where: {
        projectId: activeProjectId,
        body: '__THREAD_CLOSED__',
      },
    });

    return {
      id: `${activeProjectId}_${targetUserId}`,
      projectId: activeProjectId,
      targetUserId,
      initiatorUserId: currentUserId,
      participantUserId: targetUserId,
      participant: targetUser,
      project,
      isClosed: !!isClosed,
    };
  }

  /**
   * Resume a closed conversation thread by Homeowner
   */
  public async resumeConversation(projectIdOrConvId: string, homeownerUserId: string) {
    let projectId = projectIdOrConvId;
    if (projectIdOrConvId.includes('_')) {
      projectId = projectIdOrConvId.split('_')[0];
    }

    // Delete any __THREAD_CLOSED__ system marker messages for this project
    await prisma.message.deleteMany({
      where: {
        projectId,
        body: '__THREAD_CLOSED__',
      },
    });

    await prisma.activityLog
      .create({
        data: {
          userId: homeownerUserId,
          action: 'CHAT_THREAD_RESUMED',
          entity: 'Project',
          entityId: projectId,
        },
      })
      .catch(() => {});

    return { success: true, projectId, isClosed: false };
  }

  /**
   * Close a conversation thread by Homeowner
   */
  public async closeConversation(projectIdOrConvId: string, homeownerUserId: string) {
    let projectId = projectIdOrConvId;
    if (projectIdOrConvId.includes('_')) {
      projectId = projectIdOrConvId.split('_')[0];
    }

    const proj = await prisma.project.findUnique({
      where: { id: projectId },
      select: { ownerId: true },
    });

    const lastMsg = await prisma.message.findFirst({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });

    const receiverId = (lastMsg?.senderId === homeownerUserId ? lastMsg?.receiverId : lastMsg?.senderId) || proj?.ownerId || homeownerUserId;

    const closedMsg = await prisma.message.create({
      data: {
        projectId,
        senderId: homeownerUserId,
        receiverId,
        body: '__THREAD_CLOSED__',
      },
    });

    await prisma.activityLog
      .create({
        data: {
          userId: homeownerUserId,
          action: 'CHAT_THREAD_CLOSED',
          entity: 'Project',
          entityId: projectId,
        },
      })
      .catch(() => {});

    return { success: true, projectId, isClosed: true };
  }

  /**
   * Send a 2-way message between sender and receiver in the database
   */
  public async sendMessage(projectIdOrConvId: string, senderUserId: string, content: string, fileData?: any, targetUserId?: string) {
    let projectId = projectIdOrConvId;
    let receiverId = targetUserId;

    if (projectIdOrConvId.includes('_')) {
      const parts = projectIdOrConvId.split('_');
      projectId = parts[0];
      receiverId = parts[1];
    }

    if (!receiverId) {
      const proj = await prisma.project.findUnique({
        where: { id: projectId },
        select: { ownerId: true },
      });
      if (proj) {
        receiverId = proj.ownerId === senderUserId ? undefined : proj.ownerId;
      }
    }

    if (!receiverId) {
      const lastMsg = await prisma.message.findFirst({
        where: { projectId },
        orderBy: { createdAt: 'desc' },
      });
      receiverId = lastMsg?.senderId === senderUserId ? lastMsg?.receiverId : lastMsg?.senderId;
    }

    if (!receiverId) {
      throw new AppError('Message recipient could not be identified.', 400);
    }

    const [senderUser, receiverUser] = await Promise.all([
      prisma.user.findUnique({ where: { id: senderUserId }, select: { id: true, role: true, name: true, email: true } }),
      prisma.user.findUnique({ where: { id: receiverId }, select: { id: true, role: true, name: true, email: true } }),
    ]);

    // Check if thread is closed by Homeowner
    const isClosed = await prisma.message.findFirst({
      where: {
        projectId,
        body: '__THREAD_CLOSED__',
      },
    });

    if (isClosed && senderUser?.role === 'PROFESSIONAL') {
      throw new AppError(
        'Access Denied: This conversation has been closed by the Homeowner. Further responses are disabled.',
        403
      );
    }

    // Access Control Rule for sending messages
    if (senderUser?.role === 'PROFESSIONAL' && receiverUser?.role === 'HOMEOWNER') {
      const priorMessage = await prisma.message.findFirst({
        where: {
          OR: [
            { senderId: senderUserId, receiverId },
            { senderId: receiverId, receiverId: senderUserId },
          ],
        },
      });

      if (!priorMessage) {
        throw new AppError(
          'Access Denied: Professionals cannot initiate new message threads with homeowners. Homeowners must reach out first.',
          403
        );
      }
    }

    const message = await prisma.message.create({
      data: {
        projectId,
        senderId: senderUserId,
        receiverId,
        body: content || (fileData ? `Attachment: ${fileData.fileName}` : ''),
      },
      include: {
        sender: {
          select: { id: true, name: true, email: true, role: true },
        },
        receiver: {
          select: { id: true, name: true, email: true, role: true },
        },
        project: { select: { id: true, name: true } },
      },
    });

    // Inquiry Tracking & Notification: When Homeowner sends message to Professional
    if (senderUser?.role === 'HOMEOWNER' && receiverUser?.role === 'PROFESSIONAL') {
      const priorInquiriesCount = await prisma.message.count({
        where: {
          senderId: senderUserId,
          receiverId,
        },
      });

      if (priorInquiriesCount === 1) {
        // Log Inquiry Action in ActivityLog
        await prisma.activityLog
          .create({
            data: {
              userId: senderUserId,
              action: 'HOMEOWNER_INQUIRY_CREATED',
              entity: 'User',
              entityId: receiverId,
              details: JSON.stringify({ projectId, body: content }),
            },
          })
          .catch(() => {});

        // Send notification to the Professional
        const homeownerName = senderUser.name || senderUser.email?.split('@')[0] || 'A Homeowner';
        const projName = message.project?.name || 'your services';
        await notificationService
          .createNotification(
            receiverId,
            'New Client Inquiry 💬',
            `${homeownerName} has submitted a new inquiry regarding "${projName}".`
          )
          .catch(() => {});
      }
    }

    return {
      ...message,
      content: message.body,
      senderUserId: message.senderId,
    };
  }

  /**
   * Get all 2-way messages in a project thread for the active user
   */
  public async getConversationMessages(projectIdOrConvId: string, userId: string) {
    let projectId = projectIdOrConvId;
    if (projectIdOrConvId.includes('_')) {
      projectId = projectIdOrConvId.split('_')[0];
    }

    const messages = await prisma.message.findMany({
      where: {
        projectId,
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
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
   * Get all active two-way conversation threads for logged-in user (Homeowner or Professional)
   */
  public async getUserConversations(userId: string) {
    const rawMessages = await prisma.message.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            homeowner: true,
            professional: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            homeowner: true,
            professional: true,
          },
        },
        project: { select: { id: true, name: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Group messages into distinct unique contact threads
    const threadsMap = new Map<string, any>();

    for (const msg of rawMessages) {
      const otherUser = msg.senderId === userId ? msg.receiver : msg.sender;
      if (!otherUser) continue;

      const threadKey = `${msg.projectId}_${otherUser.id}`;
      if (!threadsMap.has(threadKey)) {
        threadsMap.set(threadKey, {
          id: threadKey,
          projectId: msg.projectId,
          initiatorUserId: userId,
          participantUserId: otherUser.id,
          initiator: msg.senderId === userId ? msg.sender : msg.receiver,
          participant: otherUser,
          project: msg.project,
          messages: [{ ...msg, content: msg.body, senderUserId: msg.senderId }],
          lastMessageAt: msg.createdAt,
        });
      }
    }

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const validThreads = Array.from(threadsMap.values()).filter((thread) => {
      const isSupport =
        thread.project?.type === 'SUPPORT' ||
        thread.project?.name?.toLowerCase().includes('support') ||
        thread.project?.name?.toLowerCase().includes('help') ||
        thread.participant?.role === 'ADMIN' ||
        thread.participant?.role === 'FOUNDER';

      if (isSupport) {
        const lastMsgTime = new Date(thread.lastMessageAt || 0);
        if (lastMsgTime < twentyFourHoursAgo) {
          return false; // Filter out expired Support/Admin chats >24h old from user inbox
        }
      }
      return true;
    });

    return validThreads;
  }
}

export const messageService = new MessageService();
