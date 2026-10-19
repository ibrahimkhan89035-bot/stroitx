import { prisma } from '../config/database';
import { Role, ProjectStatus } from '@prisma/client';
import { ActivityLogService } from './activity-log.service';

export class AdminService {
  public async softDeleteUser(adminUserId: string, adminEmail: string, targetUserId: string) {
    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: {
        isActive: false,
        deletedAt: new Date(),
        deletedBy: adminUserId,
      },
    });

    await ActivityLogService.logAdminAction(adminEmail, 'SOFT_DELETED_USER', targetUserId, { deletedAt: new Date() });
    return updatedUser;
  }

  public async softDeleteProject(adminUserId: string, adminEmail: string, projectId: string) {
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        status: ProjectStatus.CANCELLED,
        deletedAt: new Date(),
        deletedBy: adminUserId,
      },
    });

    await ActivityLogService.logAdminAction(adminEmail, 'SOFT_DELETED_PROJECT', projectId, { deletedAt: new Date() });
    return updatedProject;
  }

  /**
   * Retrieves live platform metrics calculated directly from PostgreSQL via Prisma
   */
  public async getOverviewMetrics() {
    const totalUsers = await prisma.user.count();
    const homeownersCount = await prisma.user.count({ where: { role: Role.HOMEOWNER } });
    const professionalsCount = await prisma.user.count({ where: { role: Role.PROFESSIONAL } });

    const verifiedProfessionals = await prisma.professionalProfile.count({
      where: { verified: true },
    });
    const pendingVerification = await prisma.professionalProfile.count({
      where: { verified: false },
    });

    const activeProjects = await prisma.project.count({
      where: { status: ProjectStatus.ACTIVE },
    });
    const completedProjects = await prisma.project.count({
      where: { status: ProjectStatus.COMPLETED },
    });
    const totalProjects = await prisma.project.count();

    const totalBids = await prisma.bid.count();
    const totalApplications = await prisma.application.count();

    const rawInquiries = await prisma.message.findMany({
      where: {
        sender: { role: Role.HOMEOWNER },
        receiver: { role: Role.PROFESSIONAL },
      },
      select: { senderId: true, receiverId: true, projectId: true },
    });
    const uniqueInquiries = new Set(rawInquiries.map((m) => `${m.senderId}_${m.receiverId}_${m.projectId}`));
    const totalInquiries = uniqueInquiries.size;

    return {
      totalUsers,
      homeownersCount,
      professionalsCount,
      verifiedProfessionals,
      pendingVerification,
      totalProjects,
      activeProjects,
      completedProjects,
      totalBids,
      totalApplications,
      totalInquiries,
    };
  }

  public async getHomeownersWithRelations() {
    return prisma.user.findMany({
      where: { role: Role.HOMEOWNER },
      include: {
        homeowner: true,
        projects: {
          include: {
            bids: true,
            applications: true,
            milestones: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        reviewsGiven: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  public async getProfessionalsWithRelations() {
    return prisma.user.findMany({
      where: { role: Role.PROFESSIONAL },
      include: {
        professional: true,
        bids: {
          include: {
            project: { select: { name: true, location: true, status: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        applications: {
          include: {
            project: { select: { name: true, location: true, status: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        reviewsReceived: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  public async getReportsList() {
    try {
      const ticketLogs = await prisma.activityLog.findMany({
        where: {
          action: {
            in: ['SUPPORT_TICKET_SUBMITTED', 'COMPLAINT_SUBMITTED', 'SUPPORT_MESSAGE_SENT', 'HOMEOWNER_INQUIRY_CREATED'],
          },
        },
        include: {
          user: {
            select: { id: true, name: true, email: true, phone: true, role: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return ticketLogs.map((log) => {
        let detailsObj: any = {};
        try {
          detailsObj = JSON.parse(log.details || '{}');
        } catch (e) {
          detailsObj = { message: log.details };
        }

        return {
          id: log.id,
          subject: detailsObj.subject || log.action.replace(/_/g, ' '),
          category: detailsObj.category || detailsObj.type || log.entity || 'SUPPORT',
          reason: detailsObj.message || detailsObj.body || detailsObj.reason || 'Support Ticket Request',
          status: detailsObj.status || 'PENDING',
          reporter: log.user || { email: 'Registered Partner', role: 'USER' },
          createdAt: log.createdAt,
        };
      });
    } catch (error) {
      console.error('Error fetching admin reports/tickets list:', error);
      return [];
    }
  }

  public async createSystemBroadcast(adminUserId: string, title: string, targetAudience: string, messageBody: string) {
    const whereRole = targetAudience === 'HOMEOWNER'
      ? { role: Role.HOMEOWNER }
      : targetAudience === 'PROFESSIONAL'
      ? { role: Role.PROFESSIONAL }
      : {};

    const targetUsers = await prisma.user.findMany({
      where: whereRole,
      select: { id: true },
    });

    if (targetUsers.length > 0) {
      await prisma.notification.createMany({
        data: targetUsers.map((u) => ({
          userId: u.id,
          title: `📢 ${title}`,
          body: messageBody,
        })),
      });
    }

    return { title, targetAudience, messageBody, recipientCount: targetUsers.length };
  }

  public async getSystemBroadcasts() {
    return [];
  }

  public async getModerationList() {
    return [];
  }

  public async getUsersList() {
    return prisma.user.findMany({
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        homeowner: true,
        professional: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  public async getVerificationQueue() {
    try {
      const documents = await prisma.verificationDocument.findMany({
        include: {
          professional: {
            include: {
              user: {
                select: { id: true, name: true, email: true, phone: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return documents.map((doc) => ({
        id: doc.id,
        status: doc.status,
        documentType: doc.documentType,
        documentNumber: doc.documentNumber,
        documentUrl: `/api/verification/document/${doc.id}`,
        adminNotes: doc.adminNotes,
        createdAt: doc.createdAt,
        professionalProfile: {
          id: doc.professional.id,
          fullName: doc.professional.user?.name || 'Verified Partner',
          companyName: doc.professional.businessName || doc.professional.profession || 'Contracting Business',
          user: doc.professional.user,
        },
      }));
    } catch (err) {
      console.error('Error fetching verification queue:', err);
      return [];
    }
  }

  public async getMasterView() {
    const users = await prisma.user.findMany({
      include: {
        homeowner: true,
        professional: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const projects = await prisma.project.findMany({
      include: {
        owner: {
          select: { id: true, name: true, email: true, phone: true, homeowner: true },
        },
        bids: {
          include: {
            professional: {
              select: {
                id: true,
                name: true,
                email: true,
                professional: true,
              },
            },
          },
        },
        applications: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const bids = await prisma.bid.findMany({
      where: { deletedAt: null },
      include: {
        project: {
          select: { id: true, name: true, location: true, type: true, budget: true, status: true },
        },
        professional: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            professional: { select: { businessName: true, profession: true, verified: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const rawInquiries = await prisma.message.findMany({
      where: {
        sender: { role: Role.HOMEOWNER },
        receiver: { role: Role.PROFESSIONAL },
      },
      include: {
        sender: { select: { id: true, name: true, email: true, phone: true } },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            professional: { select: { businessName: true, profession: true } },
          },
        },
        project: { select: { id: true, name: true, location: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const inquiryMap = new Map<string, any>();
    for (const msg of rawInquiries) {
      const key = `${msg.senderId}_${msg.receiverId}_${msg.projectId}`;
      if (!inquiryMap.has(key)) {
        inquiryMap.set(key, msg);
      }
    }
    const inquiries = Array.from(inquiryMap.values());

    return { users, projects, bids, inquiries };
  }

  public async getAuditLogs() {
    return prisma.activityLog.findMany({
      include: {
        user: { select: { email: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
}

export const adminService = new AdminService();
