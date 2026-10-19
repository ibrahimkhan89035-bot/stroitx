import { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler';
import { sendSuccess } from '../utils/response';
import { prisma } from '../config/database';
import { AppError } from '../utils/error';

export const submitSupportTicket = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { subject, message, messageDetails, category, type, inquiryType } = req.body;
    const finalSubject = subject?.trim();
    const finalMessage = (message || messageDetails)?.trim();
    const finalCategory = category || type || inquiryType || 'SUPPORT';

    if (!finalSubject || !finalMessage) {
      throw new AppError('Subject and message details are required to submit a ticket.', 400);
    }

    const ticket = await prisma.activityLog.create({
      data: {
        userId: req.user!.id,
        action: 'SUPPORT_TICKET_SUBMITTED',
        entity: 'SupportTicket',
        entityId: req.user!.id,
        details: JSON.stringify({
          subject: finalSubject,
          message: finalMessage,
          category: finalCategory,
          status: 'PENDING',
        }),
      },
    });

    return sendSuccess(res, 'Support ticket submitted successfully and sent to admin queue.', ticket, 201);
  } catch (err: any) {
    if (err instanceof AppError) throw err;
    throw new AppError(err.message || 'Failed to create support ticket. Please try again.', 400);
  }
});

export const getProfessionalsDirectory = asyncHandler(async (req: Request, res: Response) => {
  const { category, city, search } = req.query;

  const professionals = await prisma.professionalProfile.findMany({
    where: {
      ...(category ? { profession: category as string } : {}),
      ...(city ? { location: { contains: city as string, mode: 'insensitive' } } : {}),
      ...(search ? { businessName: { contains: search as string, mode: 'insensitive' } } : {}),
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          phone: true,
          name: true,
        },
      },
    },
    orderBy: { rating: 'desc' },
  });

  return sendSuccess(res, 'Professionals directory loaded.', professionals);
});

export const getProfessionalById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const professional = await prisma.professionalProfile.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          phone: true,
          name: true,
        },
      },
    },
  });

  if (!professional) throw new AppError('Professional profile not found.', 404);
  return sendSuccess(res, 'Professional details loaded.', professional);
});

export const getMyProfessionalProfile = asyncHandler(async (req: Request, res: Response) => {
  const [profile, bids, rawInquiries] = await Promise.all([
    prisma.professionalProfile.findUnique({
      where: { userId: req.user!.id },
      include: {
        user: { select: { email: true, phone: true, name: true } },
      },
    }),
    prisma.bid.findMany({
      where: { professionalId: req.user!.id, deletedAt: null },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            location: true,
            type: true,
            budget: true,
            status: true,
            owner: { select: { id: true, name: true, email: true, phone: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.message.findMany({
      where: {
        receiverId: req.user!.id,
        sender: { role: 'HOMEOWNER' },
      },
      include: {
        sender: { select: { id: true, name: true, email: true, phone: true } },
        project: { select: { id: true, name: true, status: true, budget: true, location: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const inquiryMap = new Map<string, any>();
  for (const msg of rawInquiries) {
    const key = `${msg.senderId}_${msg.projectId}`;
    if (!inquiryMap.has(key)) {
      inquiryMap.set(key, {
        id: msg.id,
        homeownerId: msg.senderId,
        homeownerName: msg.sender?.name || msg.sender?.email?.split('@')[0] || 'Homeowner',
        homeownerEmail: msg.sender?.email,
        homeownerPhone: msg.sender?.phone,
        projectId: msg.projectId,
        projectName: msg.project?.name || 'General Inquiry',
        projectLocation: msg.project?.location || 'India',
        message: msg.body,
        createdAt: msg.createdAt,
      });
    }
  }

  const inquiries = Array.from(inquiryMap.values());

  if (!profile) {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    return sendSuccess(res, 'My professional profile loaded.', {
      userId: req.user!.id,
      profession: 'General',
      verified: false,
      rating: 0,
      reviewCount: 0,
      user,
      bids,
      inquiries,
      inquiryCount: inquiries.length,
    });
  }

  return sendSuccess(res, 'My professional profile loaded.', {
    ...profile,
    bids,
    inquiries,
    inquiryCount: inquiries.length,
  });
});

export const addPastProject = asyncHandler(async (req: Request, res: Response) => {
  throw new AppError('Past projects feature is currently disabled pending a database upgrade.', 501);
});

export const getPastProjects = asyncHandler(async (req: Request, res: Response) => {
  return sendSuccess(res, 'Past projects portfolio retrieved.', []);
});