import { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler';
import { sendSuccess } from '../utils/response';
import { paymentService } from '../services/payment.service';

export const createPaymentOrder = asyncHandler(async (req: Request, res: Response) => {
  const { projectId, milestoneId, amount } = req.body;
  const result = await paymentService.createPaymentOrder(req.user!.id, projectId, milestoneId, amount);
  return sendSuccess(res, 'Razorpay order created successfully.', result, 201);
});

export const verifyPayment = asyncHandler(async (req: Request, res: Response) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
  const payment = await paymentService.verifyPayment(req.user!.id, razorpayOrderId, razorpayPaymentId, razorpaySignature);
  return sendSuccess(res, 'Payment verified and milestone updated successfully.', payment);
});

export const createSubscription = asyncHandler(async (req: Request, res: Response) => {
  const result = await paymentService.createSubscription(req.user!.id);
  return sendSuccess(res, 'Razorpay subscription order generated with 45-day trial offset.', result, 201);
});

export const verifySubscription = asyncHandler(async (req: Request, res: Response) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
  const profile = await paymentService.verifySubscriptionPayment(
    req.user!.id,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature
  );
  return sendSuccess(res, 'Subscription payment verified and plan activated.', profile);
});

export const getUserPaymentHistory = asyncHandler(async (req: Request, res: Response) => {
  const history = await paymentService.getUserPaymentHistory(req.user!.id);
  return sendSuccess(res, 'User payment history retrieved.', history);
});

export const createMandateOrder = asyncHandler(async (req: Request, res: Response) => {
  const result = await paymentService.createMandate(req.user!.id);
  return sendSuccess(res, '₹2 mandate setup order created successfully.', result, 200);
});

export const verifyMandate = asyncHandler(async (req: Request, res: Response) => {
  const orderId = req.body.razorpayOrderId || req.body.razorpay_order_id;
  const paymentId = req.body.razorpayPaymentId || req.body.razorpay_payment_id || `pay_${Date.now()}`;
  const signature = req.body.razorpaySignature || req.body.razorpay_signature;
  const subscriptionId = req.body.razorpaySubscriptionId || req.body.razorpay_subscription_id;

  const result = await paymentService.verifyMandate(
    req.user!.id,
    orderId,
    paymentId,
    signature,
    subscriptionId
  );
  return sendSuccess(res, '₹2 auto-pay mandate authorized and 31-Day Free Trial activated successfully!', result, 200);
});

