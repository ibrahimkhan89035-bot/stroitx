import { prisma } from '../config/database';
import { AppError } from '../utils/error';
import { ProjectStatus } from '@prisma/client';
import { notificationService } from './notification.service';

export class ProjectService {
  /**
   * Create a new project for a Homeowner (Phase 1)
   * Defaults to DRAFT (PENDING Admin Moderation) status as per schema
   */
  public async createProject(ownerId: string, data: any) {
    const projectName = data.name || data.title || 'Untitled Project';
    const projectType = data.type || data.projectType || 'General';
    const projectBudget = data.budget || (data.maxBudget ? `₹${data.minBudget || 0} - ₹${data.maxBudget}` : null);
    const location = data.location || data.city || null;

    const project = await prisma.project.create({
      data: {
        ownerId,
        name: projectName,
        type: projectType,
        budget: projectBudget,
        description: data.description || null,
        location,
        status: ProjectStatus.DRAFT, // Forced to DRAFT (PENDING moderation)
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true, phone: true },
        },
        bids: true,
        applications: true,
      },
    });

    // 1. Trigger Homeowner Project Submitted Notification
    await notificationService
      .createNotification(
        ownerId,
        'Project Submitted for Review ⏳',
        `Your project "${projectName}" has been submitted and is currently under Admin review. Once approved, it will be published to the marketplace.`
      )
      .catch(() => {});

    return project;
  }

  /**
   * Get all projects posted by a specific Homeowner (Phase 1)
   * Excludes SUPPORT ticketing projects
   */
  public async getHomeownerProjects(ownerId: string) {
    return prisma.project.findMany({
      where: {
        ownerId,
        deletedAt: null,
        type: { not: 'SUPPORT' },
      },
      include: {
        bids: {
          include: {
            professional: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                professional: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        applications: {
          include: {
            professional: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        milestones: true,
        documents: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get project details by ID
   */
  public async getProjectDetails(projectId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        owner: {
          select: { id: true, name: true, email: true, phone: true, homeowner: true },
        },
        bids: {
          include: {
            professional: {
              select: { id: true, name: true, email: true, phone: true, professional: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        applications: {
          include: {
            professional: { select: { id: true, name: true, email: true } },
          },
        },
        milestones: true,
        documents: true,
      },
    });

    if (!project) throw new AppError('Project not found.', 404);
    return project;
  }

  /**
   * Fetch open, approved projects for Professional Job Board (Phase 2)
   * Strictly filters for POSTED status so professionals only see open, approved jobs
   */
  public async getProfessionalFeed(professionalUserId?: string) {
    const projects = await prisma.project.findMany({
      where: {
        status: ProjectStatus.POSTED, // Strictly open and approved projects
        deletedAt: null,
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        bids: {
          select: { id: true, professionalId: true, amount: true, proposal: true, status: true, createdAt: true },
        },
        applications: {
          select: { id: true, professionalId: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return projects.map((p) => ({
      ...p,
      hasSubmittedBid: professionalUserId
        ? p.bids.some((b) => b.professionalId === professionalUserId) ||
          p.applications.some((a) => a.professionalId === professionalUserId)
        : false,
    }));
  }

  /**
   * Submit a bid on a project by a Professional (Phase 2)
   */
  public async submitBid(professionalUserId: string, projectId: string, amount?: number, proposal?: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { owner: { select: { id: true, name: true, email: true } } },
    });
    if (!project) throw new AppError('Project not found.', 404);

    if (project.status === ProjectStatus.MATCHING || project.status === ProjectStatus.ACTIVE || project.status === ProjectStatus.COMPLETED) {
      throw new AppError('Bidding is locked for this project as it is currently undergoing award or active processing.', 400);
    }

    const proUser = await prisma.user.findUnique({
      where: { id: professionalUserId },
      include: { professional: { select: { businessName: true } } },
    });
    const proName = proUser?.professional?.businessName || proUser?.name || proUser?.email || 'A contractor';

    const existingBid = await prisma.bid.findUnique({
      where: {
        projectId_professionalId: {
          projectId,
          professionalId: professionalUserId,
        },
      },
    });

    let bid;

    if (existingBid) {
      bid = await prisma.bid.update({
        where: { id: existingBid.id },
        data: {
          amount: amount ?? existingBid.amount,
          proposal: proposal ?? existingBid.proposal,
        },
      });
    } else {
      bid = await prisma.bid.create({
        data: {
          projectId,
          professionalId: professionalUserId,
          amount,
          proposal,
        },
        include: {
          project: true,
          professional: {
            select: { id: true, name: true, email: true },
          },
        },
      });
    }

    // Trigger notification to project owner (Homeowner)
    if (project.ownerId) {
      const amountFormatted = amount ? `₹${amount.toLocaleString()}` : 'N/A';
      await notificationService
        .createNotification(
          project.ownerId,
          'New Bid Received 📩',
          `New bid received from ${proName} for ${amountFormatted} on project "${project.name}".`
        )
        .catch(() => {});
    }

    return bid;
  }

  /**
   * Homeowner accepts a bid -> sets project to MATCHING (PENDING_AWARD) & locks project from new bids
   */
  public async acceptBid(homeownerUserId: string, projectId: string, bidId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { bids: true },
    });

    if (!project) throw new AppError('Project not found.', 404);
    if (project.ownerId !== homeownerUserId) throw new AppError('Unauthorized project action.', 403);

    const winningBid = await prisma.bid.findUnique({
      where: { id: bidId },
      include: {
        professional: {
          select: { id: true, name: true, email: true, professional: { select: { businessName: true } } },
        },
      },
    });

    if (!winningBid) throw new AppError('Bid not found.', 404);

    // Accept winning bid, reject others
    await prisma.bid.update({
      where: { id: bidId },
      data: { status: 'ACCEPTED' },
    });

    await prisma.bid.updateMany({
      where: { projectId, id: { not: bidId } },
      data: { status: 'REJECTED' },
    });

    // Update project status to MATCHING (representing PENDING_AWARD in lifecycle)
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: { status: ProjectStatus.MATCHING },
    });

    const proName = winningBid.professional?.professional?.businessName || winningBid.professional?.name || 'Selected Contractor';

    // Notifications
    await notificationService
      .createNotification(
        homeownerUserId,
        'Project Award Pending Admin Verification ⏳',
        `You accepted the bid from ${proName}. Project status is set to PENDING_AWARD awaiting Admin verification.`
      )
      .catch(() => {});

    await notificationService
      .createNotification(
        winningBid.professionalId,
        'Bid Accepted - Pending Admin Verification ⏳',
        `Your bid on "${project.name}" was accepted by the Homeowner. Awaiting final Admin verification.`
      )
      .catch(() => {});

    return updatedProject;
  }

  /**
   * Homeowner requests project completion -> sets status transition for Admin verification
   */
  public async requestCompletion(homeownerUserId: string, projectId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        bids: { where: { status: 'ACCEPTED' } },
      },
    });

    if (!project) throw new AppError('Project not found.', 404);
    if (project.ownerId !== homeownerUserId) throw new AppError('Unauthorized project action.', 403);

    // Temporarily set project status to MATCHING / PENDING_COMPLETION indicator
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: { status: ProjectStatus.MATCHING },
    });

    await notificationService
      .createNotification(
        homeownerUserId,
        'Project Completion Requested ⏳',
        `You requested project completion for "${project.name}". Awaiting Admin verification.`
      )
      .catch(() => {});

    return updatedProject;
  }

  /**
   * Fetch all projects requiring Admin Award or Completion approval
   */
  public async getAdminApprovalQueue() {
    return prisma.project.findMany({
      where: {
        status: { in: [ProjectStatus.POSTED, ProjectStatus.MATCHING, ProjectStatus.ACTIVE] },
        deletedAt: null,
      },
      include: {
        owner: { select: { id: true, name: true, email: true, phone: true } },
        bids: {
          include: {
            professional: {
              select: { id: true, name: true, email: true, phone: true, professional: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  /**
   * Admin approves or rejects lifecycle state transition
   */
  public async handleAdminLifecycleAction(adminUserId: string, projectId: string, actionType: string, reason?: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        bids: { where: { status: 'ACCEPTED' } },
      },
    });

    if (!project) throw new AppError('Project not found.', 404);

    let nextStatus: ProjectStatus = project.status;
    let titleNotif = '';
    let bodyHomeowner = '';
    let bodyContractor = '';

    const acceptedBid = project.bids[0];
    const contractorId = acceptedBid?.professionalId;

    if (actionType === 'APPROVE_AWARD') {
      nextStatus = ProjectStatus.ACTIVE;
      titleNotif = 'Project Award Approved! ✅';
      bodyHomeowner = `Admin verified and approved the project award for "${project.name}". Project is now ACTIVE.`;
      bodyContractor = `Admin verified and finalized your contract award for "${project.name}". Project is now ACTIVE.`;
    } else if (actionType === 'REJECT_AWARD') {
      nextStatus = ProjectStatus.POSTED;
      titleNotif = 'Project Award Verification Rejected ❌';
      bodyHomeowner = `Admin rejected the project award for "${project.name}". Reason: ${reason || 'Verification check failed'}. Project reopened for bidding.`;
      bodyContractor = `Admin rejected the award for "${project.name}".`;

      // Revert bid status
      if (acceptedBid) {
        await prisma.bid.update({ where: { id: acceptedBid.id }, data: { status: 'PENDING' } });
      }
    } else if (actionType === 'APPROVE_COMPLETION') {
      nextStatus = ProjectStatus.COMPLETED;
      titleNotif = 'Project Completion Verified & Finalized 🎉';
      bodyHomeowner = `Admin verified and finalized project completion for "${project.name}".`;
      bodyContractor = `Admin verified project completion for "${project.name}". Work complete!`;
    } else if (actionType === 'REJECT_COMPLETION') {
      nextStatus = ProjectStatus.ACTIVE;
      titleNotif = 'Completion Request Rejected ❌';
      bodyHomeowner = `Admin rejected the completion request for "${project.name}". Reason: ${reason || 'Pending tasks remain'}.`;
    }

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: { status: nextStatus },
    });

    // Send notifications
    await notificationService.createNotification(project.ownerId, titleNotif, bodyHomeowner).catch(() => {});
    if (contractorId) {
      await notificationService.createNotification(contractorId, titleNotif, bodyContractor).catch(() => {});
    }

    return updatedProject;
  }

  public async approveProject(adminUserId: string, projectId: string) {
    const project = await prisma.project.update({
      where: { id: projectId },
      data: { status: ProjectStatus.POSTED },
      include: {
        owner: { select: { id: true, name: true, email: true } },
      },
    });

    await notificationService
      .createNotification(
        project.ownerId,
        'Project Approved & Published! 🎉',
        `Your project "${project.name}" has been reviewed and approved by Admin. It is now live in the marketplace feed for verified contractors.`
      )
      .catch(() => {});

    return project;
  }

  public async rejectProject(adminUserId: string, projectId: string, reason?: string) {
    const project = await prisma.project.update({
      where: { id: projectId },
      data: { status: ProjectStatus.CANCELLED },
    });
    return project;
  }
}

export const projectService = new ProjectService();