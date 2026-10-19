import { prisma } from '../config/database';
import { AppError } from '../utils/error';
import { AuditService } from './audit.service';
import { razorpayService } from '../integrations/razorpay.service';
import { env } from '../config/env';

export class PaymentService {
  public async createMandate(userId: string) {
    const profProfile = await prisma.professionalProfile.findUnique({
      where: { userId },
    });

    if (!profProfile) {
      throw new AppError('Professional profile not found.', 404);
    }

    const amount = 200; // ₹2.00 setup in paise
    const receiptId = `mandate_${Date.now()}`;
    const orderData = await razorpayService.createOrder(amount, 'INR', receiptId);

    return {
      keyId: env.RAZORPAY_KEY_ID || 'rzp_test_StroitX',
      amount: 200,
      currency: 'INR',
      orderId: orderData.orderId,
      receipt: receiptId,
    };
  }

  public async verifyMandate(
    userId: string,
    razorpayOrderId?: string,
    razorpayPaymentId?: string,
    razorpaySignature?: string,
    subscriptionId?: string
  ) {
    const isVerified = razorpayService.verifyPaymentSignature(
      razorpayOrderId || '',
      razorpayPaymentId || '',
      razorpaySignature || '',
      subscriptionId
    );

    if (!isVerified) {
      throw new AppError('Mandate verification failed due to invalid signature.', 400);
    }

    const professional = await prisma.professionalProfile.findUnique({
      where: { userId },
    });

    if (!professional) {
      throw new AppError('Professional profile not found.', 404);
    }

    const now = new Date();
    const trialEndsAt = new Date();
    trialEndsAt.setDate(now.getDate() + 31);

    const updatedProfile = await prisma.professionalProfile.update({
      where: { userId },
      data: {
        isMandateActive: true,
        mandateId: razorpayPaymentId || razorpayOrderId || subscriptionId,
        isTrialActive: true,
        trialStartedAt: now,
        trialEndsAt: trialEndsAt,
      },
    });

    // Record in database Payment ledger
    try {
      await prisma.payment.create({
        data: {
          userId,
          amount: 2.0,
          currency: 'INR',
          status: 'SUCCESS',
          purpose: 'MANDATE_SETUP',
          razorpayOrderId: razorpayOrderId || null,
          razorpayPaymentId: razorpayPaymentId || null,
          razorpaySignature: razorpaySignature || null,
          metadata: JSON.stringify({
            purpose: '₹2 Auto-Pay Mandate Authorization',
            subscriptionId: subscriptionId || null,
          }),
        },
      });

      // Update or create Subscription table record
      const existingSub = await prisma.subscription.findFirst({ where: { userId } });
      if (existingSub) {
        await prisma.subscription.update({
          where: { id: existingSub.id },
          data: {
            plan: '31_DAY_FREE_TRIAL',
            status: 'TRIALING',
            razorpaySubscriptionId: subscriptionId || null,
            currentPeriodStart: now,
            currentPeriodEnd: trialEndsAt,
          },
        });
      } else {
        await prisma.subscription.create({
          data: {
            userId,
            plan: '31_DAY_FREE_TRIAL',
            status: 'TRIALING',
            razorpaySubscriptionId: subscriptionId || null,
            currentPeriodStart: now,
            currentPeriodEnd: trialEndsAt,
          },
        });
      }
    } catch (dbErr) {
      console.error('Error creating payment/subscription ledger record for mandate:', dbErr);
    }

    try {
      await prisma.notification.create({
        data: {
          userId,
          title: '31-Day Free Trial & Auto-Pay Mandate Activated',
          body: 'Your ₹2 auto-pay mandate authorization was successful! Your 31-day trial is now active.',
        },
      });
    } catch (e) {}

    return {
      isMandateActive: updatedProfile.isMandateActive,
      isTrialActive: updatedProfile.isTrialActive,
      trialEndsAt: updatedProfile.trialEndsAt,
      mandateId: updatedProfile.mandateId,
    };
  }

  public async createSubscription(userId: string) {
    const profProfile = await prisma.professionalProfile.findUnique({
      where: { userId },
    });

    if (!profProfile) {
      throw new AppError('Professional profile not found.', 404);
    }

    const yearlyAmount = 1299;
    const trialDays = 45;
    const trialEndsAt = new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000);
    const receiptId = `sub_${Date.now()}`;
    const orderData = await razorpayService.createOrder(yearlyAmount, 'INR', receiptId);

    await AuditService.logAction(userId, 'PROFESSIONAL_SUBSCRIPTION_INITIATED', 'ProfessionalProfile', profProfile.id, {
      amount: yearlyAmount,
      trialDays,
      trialEndsAt,
      orderId: orderData.orderId,
    });

    return {
      profile: profProfile,
      razorpayOrder: orderData,
      plan: {
        originalPrice: 1499,
        discountedPrice: 1299,
        billingCycle: 'YEARLY',
        trialDays: 45,
        trialEndsAt,
      },
    };
  }

  public async verifySubscriptionPayment(
    userId: string,
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
  ) {
    const isVerified = razorpayService.verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);

    if (!isVerified) {
      throw new AppError('Subscription payment verification failed due to invalid signature.', 400);
    }

    const now = new Date();
    const subEndsAt = new Date();
    subEndsAt.setDate(now.getDate() + 365);

    const profile = await prisma.professionalProfile.update({
      where: { userId },
      data: {
        isMandateActive: true,
        mandateId: razorpayPaymentId || razorpayOrderId,
        isTrialActive: true,
        trialStartedAt: now,
        trialEndsAt: subEndsAt,
      },
    });

    // Record in Payment ledger
    try {
      await prisma.payment.create({
        data: {
          userId,
          amount: 1299.0,
          currency: 'INR',
          status: 'SUCCESS',
          purpose: 'SUBSCRIPTION',
          razorpayOrderId: razorpayOrderId || null,
          razorpayPaymentId: razorpayPaymentId || null,
          razorpaySignature: razorpaySignature || null,
          metadata: JSON.stringify({ billingCycle: 'ANNUAL', plan: 'PRO_ANNUAL' }),
        },
      });

      const existingSub = await prisma.subscription.findFirst({ where: { userId } });
      if (existingSub) {
        await prisma.subscription.update({
          where: { id: existingSub.id },
          data: {
            plan: 'PRO_ANNUAL',
            status: 'ACTIVE',
            currentPeriodStart: now,
            currentPeriodEnd: subEndsAt,
          },
        });
      } else {
        await prisma.subscription.create({
          data: {
            userId,
            plan: 'PRO_ANNUAL',
            status: 'ACTIVE',
            currentPeriodStart: now,
            currentPeriodEnd: subEndsAt,
          },
        });
      }
    } catch (ledgerErr) {
      console.error('Error logging subscription payment ledger:', ledgerErr);
    }

    await AuditService.logAction(userId, 'SUBSCRIPTION_PAYMENT_SUCCESSFUL', 'ProfessionalProfile', profile.id, {
      razorpayPaymentId,
      amount: 1299,
    });

    return profile;
  }

  public async createPaymentOrder(userId: string, projectId: string, milestoneId?: string, amount?: number) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) throw new AppError('Project not found.', 404);

    const paymentAmount = amount || 5000;
    const receiptId = `rcpt_${Date.now()}`;
    const orderData = await razorpayService.createOrder(paymentAmount, 'INR', receiptId);

    await AuditService.logAction(userId, 'PAYMENT_ORDER_CREATED', 'Project', projectId, { orderId: orderData.orderId, amount: paymentAmount });
    return { razorpayOrder: orderData };
  }

  public async verifyPayment(userId: string, razorpayOrderId: string, razorpayPaymentId: string, razorpaySignature: string, projectId?: string, amount?: number) {
    const isVerified = razorpayService.verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
    if (!isVerified) {
      throw new AppError('Payment verification failed due to invalid signature.', 400);
    }

    try {
      await prisma.payment.create({
        data: {
          userId,
          projectId: projectId || null,
          amount: amount || 5000.0,
          currency: 'INR',
          status: 'SUCCESS',
          purpose: 'MILESTONE_ESCROW',
          razorpayOrderId: razorpayOrderId || null,
          razorpayPaymentId: razorpayPaymentId || null,
          razorpaySignature: razorpaySignature || null,
          metadata: JSON.stringify({ milestonePayment: true, projectId }),
        },
      });
    } catch (e) {
      console.error('Error recording milestone escrow payment:', e);
    }

    await AuditService.logAction(userId, 'PAYMENT_SUCCESSFUL', 'User', userId, { razorpayPaymentId, amount });
    return { success: true };
  }

  public async getUserPaymentHistory(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    const isAdmin = user?.role === 'ADMIN';

    return await prisma.payment.findMany({
      where: isAdmin ? {} : { userId },
      include: {
        project: {
          select: { id: true, name: true, location: true },
        },
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
}

export const paymentService = new PaymentService();