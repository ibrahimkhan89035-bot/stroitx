import { prisma } from '../config/database';
import { AppError } from '../utils/error';
import { ProjectStatus } from '@prisma/client';
import { AuditService } from './audit.service';

export class QuoteService {
  public async createQuote(professionalUserId: string, data: any) {
    const project = await prisma.project.findUnique({
      where: { id: data.projectId },
    });

    if (!project) throw new AppError('Project not found.', 404);

    const bid = await prisma.bid.create({
      data: {
        projectId: data.projectId,
        professionalId: professionalUserId,
        amount: data.totalAmount || data.amount || 0,
        proposal: data.notes || data.paymentTerms || 'Line item quotation proposal',
        status: 'PENDING',
      },
      include: { project: true },
    });

    await AuditService.logAction(professionalUserId, 'BID_CREATED', 'Bid', bid.id);
    return bid;
  }

  public async sendQuote(professionalUserId: string, quoteId: string) {
    const bid = await prisma.bid.findUnique({
      where: { id: quoteId },
      include: { project: true },
    });

    if (!bid) throw new AppError('Bid not found.', 404);
    return bid;
  }

  public async acceptQuote(homeownerUserId: string, quoteId: string) {
    const bid = await prisma.bid.findUnique({
      where: { id: quoteId },
      include: { project: true },
    });

    if (!bid) throw new AppError('Bid not found.', 404);
    if (bid.project.ownerId !== homeownerUserId) throw new AppError('Unauthorized bid action.', 403);

    const acceptedBid = await prisma.bid.update({
      where: { id: quoteId },
      data: { status: 'ACCEPTED' },
    });

    await prisma.bid.updateMany({
      where: {
        projectId: bid.projectId,
        id: { not: quoteId },
      },
      data: { status: 'REJECTED' },
    });

    await prisma.project.update({
      where: { id: bid.projectId },
      data: {
        status: ProjectStatus.MATCHING,
      },
    });

    await AuditService.logAction(homeownerUserId, 'BID_ACCEPTED', 'Bid', quoteId);
    return acceptedBid;
  }

  public async getQuoteComparison(projectId: string, homeownerUserId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) throw new AppError('Project not found.', 404);
    if (project.ownerId !== homeownerUserId) throw new AppError('Unauthorized comparison view.', 403);

    const bids = await prisma.bid.findMany({
      where: {
        projectId,
      },
      include: {
        professional: {
          select: {
            id: true,
            email: true,
            phone: true,
            professional: true,
          },
        },
      },
      orderBy: { amount: 'asc' },
    });

    return { project, quotes: bids };
  }
}

export const quoteService = new QuoteService();
