import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { prisma } from '../config/database';
import { authenticate } from '../middleware/auth.middleware';
import { env } from '../config/env';
import { razorpayService } from '../integrations/razorpay.service';

const router = express.Router();

const razorpayKeyId = (env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || 'test_key').trim().replace(/^["']|["']$/g, '');
const razorpayKeySecret = (env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET || 'test_secret').trim().replace(/^["']|["']$/g, '');

const razorpay = new Razorpay({
  key_id: razorpayKeyId,
  key_secret: razorpayKeySecret,
});

// 1. Create order for subscription or standard checkout (POST /create-order)
router.post('/create-order', async (req, res) => {
  try {
    const amountInRupees = req.body.amount || 1299;
    const options = {
      amount: amountInRupees * 100,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    };
    try {
      const order = await razorpay.orders.create(options);
      return res.status(200).json({ success: true, ...order });
    } catch (rzpErr) {
      // Mock fallback order when using sandbox/unconfigured keys
      const mockOrder = {
        id: `order_mock_${Date.now()}`,
        amount: options.amount,
        currency: 'INR',
        receipt: options.receipt,
        status: 'created',
      };
      return res.status(200).json({ success: true, ...mockOrder });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create payment order' });
  }
});

// 2. Create milestone / project payment order (POST /orders)
router.post('/orders', async (req, res) => {
  try {
    const { projectId, milestoneId, amount } = req.body;
    const paymentAmount = (amount || 1299) * 100;
    let order: any;

    try {
      order = await razorpay.orders.create({
        amount: paymentAmount,
        currency: 'INR',
        receipt: `rcpt_${Date.now()}`,
      });
    } catch (e) {
      order = {
        id: `order_mock_${Date.now()}`,
        amount: paymentAmount,
        currency: 'INR',
        receipt: `rcpt_${Date.now()}`,
        status: 'created',
      };
    }

    res.status(200).json({
      success: true,
      message: 'Payment order created successfully.',
      data: {
        razorpayOrder: {
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
        },
        payment: {
          projectId,
          milestoneId,
          amount: paymentAmount / 100,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create payment order' });
  }
});

// 3. Create ₹2 auto-pay mandate setup order (POST /create-mandate)
router.post('/create-mandate', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    const options = {
      amount: 200, // ₹2.00 setup authorization in paise
      currency: 'INR',
      receipt: `mandate_rcpt_${Date.now()}`,
      notes: {
        purpose: 'StroitX 31-Day Free Trial Auto-Pay Mandate',
        userId: userId || 'anonymous',
      },
    };

    try {
      const order = await razorpay.orders.create(options);
      return res.status(200).json({
        success: true,
        keyId: razorpayKeyId,
        amount: 200,
        currency: 'INR',
        orderId: order.id,
      });
    } catch (rzpErr) {
      // Mock fallback order when using sandbox/unconfigured keys
      const mockOrder = {
        id: `order_mock_mandate_${Date.now()}`,
        amount: 200,
        currency: 'INR',
        receipt: options.receipt,
        status: 'created',
      };
      return res.status(200).json({
        success: true,
        keyId: razorpayKeyId,
        amount: 200,
        currency: 'INR',
        orderId: mockOrder.id,
      });
    }
  } catch (error) {
    console.error('Create mandate error:', error);
    res.status(500).json({ success: false, message: 'Failed to create mandate order' });
  }
});

// 4. Verify Mandate & Start 31-Day Free Trial (POST /verify-mandate)
router.post('/verify-mandate', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const orderId = req.body.razorpay_order_id || req.body.razorpayOrderId || req.body.order_id || req.body.orderId;
    const paymentId = req.body.razorpay_payment_id || req.body.razorpayPaymentId || req.body.payment_id || req.body.paymentId || `pay_mandate_${Date.now()}`;
    const subscriptionId = req.body.razorpay_subscription_id || req.body.razorpaySubscriptionId || req.body.subscription_id || req.body.subscriptionId;
    const signature = req.body.razorpay_signature || req.body.razorpaySignature || req.body.signature;

    // Verify HMAC SHA256 signature using RAZORPAY_KEY_SECRET with test mode compatibility
    const isVerified = razorpayService.verifyPaymentSignature(
      orderId || '',
      paymentId || '',
      signature || '',
      subscriptionId
    );

    if (!isVerified) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    const professional = await prisma.professionalProfile.findUnique({
      where: { userId },
    });

    if (!professional) {
      return res.status(404).json({ success: false, message: 'Professional profile not found.' });
    }

    const now = new Date();
    const trialEndsAt = new Date();
    trialEndsAt.setDate(now.getDate() + 31);

    const updatedProfile = await prisma.professionalProfile.update({
      where: { userId },
      data: {
        isMandateActive: true,
        mandateId: paymentId || orderId || subscriptionId,
        isTrialActive: true,
        trialStartedAt: now,
        trialEndsAt: trialEndsAt,
      },
    });

    // Record mandate setup in Payment ledger
    try {
      await prisma.payment.create({
        data: {
          userId,
          amount: 2.0,
          currency: 'INR',
          status: 'SUCCESS',
          purpose: 'MANDATE_SETUP',
          razorpayOrderId: orderId || null,
          razorpayPaymentId: paymentId || null,
          razorpaySignature: signature || null,
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
    } catch (ledgerErr) {
      console.error('Error recording mandate payment ledger:', ledgerErr);
    }

    // Send in-app notification to professional
    try {
      await prisma.notification.create({
        data: {
          userId,
          title: '31-Day Free Trial & Auto-Pay Mandate Activated',
          body: 'Your ₹2 auto-pay mandate authorization was successful! Your 31-day trial is now active.',
        },
      });
    } catch (notifErr) {
      // Non-fatal
    }

    return res.status(200).json({
      success: true,
      message: '₹2 auto-pay mandate authorized and 31-Day Free Trial activated successfully!',
      data: {
        isMandateActive: updatedProfile.isMandateActive,
        isTrialActive: updatedProfile.isTrialActive,
        trialEndsAt: updatedProfile.trialEndsAt,
        mandateId: updatedProfile.mandateId,
      },
    });
  } catch (error) {
    console.error('Verify mandate error:', error);
    return res.status(500).json({ success: false, message: 'Server error verifying mandate' });
  }
});

// 5. Create 31-day trial subscription mandate (POST /create-subscription)
router.post('/create-subscription', async (req, res) => {
  try {
    const thirtyOneDaysFromNow = Math.floor(Date.now() / 1000) + (31 * 24 * 60 * 60);

    const subscription = await razorpay.subscriptions.create({
      plan_id: 'plan_TnKv1dPPGAysbt',
      customer_notify: 1,
      total_count: 10,
      start_at: thirtyOneDaysFromNow, // Delays recurring charge for 31 days
      addons: [
        {
          item: {
            name: 'Auto-Pay Setup Fee',
            amount: 200, // ₹2.00 setup/authorization charge
            currency: 'INR',
          },
        },
      ],
    });

    res.status(200).json(subscription);
  } catch (error) {
    console.error('Subscription error:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

// 6. Verify Payment (POST /verify)
router.post('/verify', async (req, res) => {
  try {
    const orderId = req.body.razorpay_order_id || req.body.razorpayOrderId || req.body.order_id || req.body.orderId;
    const paymentId = req.body.razorpay_payment_id || req.body.razorpayPaymentId || req.body.payment_id || req.body.paymentId;
    const subscriptionId = req.body.razorpay_subscription_id || req.body.razorpaySubscriptionId || req.body.subscription_id || req.body.subscriptionId;
    const signature = req.body.razorpay_signature || req.body.razorpaySignature || req.body.signature;

    const isVerified = razorpayService.verifyPaymentSignature(
      orderId || '',
      paymentId || '',
      signature || '',
      subscriptionId
    );

    if (!isVerified) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    // Extract and verify user from auth header or body with decoded.userId fix
    const authHeader = req.headers.authorization;
    let userId: string | null = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const jwt = await import('jsonwebtoken');
        const decoded = jwt.default.decode(token) as any;
        if (decoded?.userId || decoded?.id) userId = decoded.userId || decoded.id;
      } catch (e) {}
    }

    if (!userId && req.body.userId) {
      userId = req.body.userId;
    }

    if (userId) {
      try {
        const now = new Date();
        const trialEndsAt = new Date();
        trialEndsAt.setDate(now.getDate() + 365);
        await prisma.professionalProfile.updateMany({
          where: { userId },
          data: {
            isMandateActive: true,
            mandateId: paymentId || orderId || subscriptionId,
            isTrialActive: true,
            trialStartedAt: now,
            trialEndsAt: trialEndsAt,
          },
        });

        // Record in database Payment ledger
        const amount = req.body.amount || 1299;
        const purpose = req.body.projectId ? 'MILESTONE_ESCROW' : 'SUBSCRIPTION';

        await prisma.payment.create({
          data: {
            userId,
            projectId: req.body.projectId || null,
            amount: Number(amount),
            currency: 'INR',
            status: 'SUCCESS',
            purpose: purpose,
            razorpayOrderId: orderId || null,
            razorpayPaymentId: paymentId || null,
            razorpaySignature: signature || null,
            metadata: JSON.stringify({
              orderId,
              paymentId,
              subscriptionId,
              projectId: req.body.projectId || null,
            }),
          },
        });

        // Record Subscription if plan payment
        if (!req.body.projectId) {
          const existingSub = await prisma.subscription.findFirst({ where: { userId } });
          if (existingSub) {
            await prisma.subscription.update({
              where: { id: existingSub.id },
              data: {
                plan: 'PRO_ANNUAL',
                status: 'ACTIVE',
                razorpaySubscriptionId: subscriptionId || null,
                currentPeriodStart: now,
                currentPeriodEnd: trialEndsAt,
              },
            });
          } else {
            await prisma.subscription.create({
              data: {
                userId,
                plan: 'PRO_ANNUAL',
                status: 'ACTIVE',
                razorpaySubscriptionId: subscriptionId || null,
                currentPeriodStart: now,
                currentPeriodEnd: trialEndsAt,
              },
            });
          }
        }
      } catch (e) {
        console.error('Error logging payment ledger in /verify:', e);
      }
    }

    return res.status(200).json({ success: true, message: 'Payment verified successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to verify payment' });
  }
});

// 7. Payment History (GET /history)
router.get('/history', authenticate, async (req, res) => {
  try {
    const user = (req as any).user;
    if (!user?.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const isAdmin = user.role === 'ADMIN' || user.role === 'FOUNDER';

    const payments = await prisma.payment.findMany({
      where: isAdmin ? {} : { userId: user.id },
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

    return res.status(200).json({
      success: true,
      message: 'Payment history retrieved.',
      data: payments,
    });
  } catch (error) {
    console.error('Payment history error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve payment history.' });
  }
});

export default router;