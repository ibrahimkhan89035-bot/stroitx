import { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler';
import { sendSuccess } from '../utils/response';
import { authService } from '../services/auth.service';
import {
  HomeownerSignupSchema,
  ProfessionalSignupSchema,
  LoginSchema,
  OtpRequestSchema,
  OtpVerifySchema,
} from '../validators/auth.validator';

import { AuditService } from '../services/audit.service';
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
        userId: (req as any).user.id,
        action: 'SUPPORT_TICKET_SUBMITTED',
        entity: 'SupportTicket',
        entityId: (req as any).user.id,
        details: JSON.stringify({
          subject: finalSubject,
          message: finalMessage,
          category: finalCategory,
          status: 'PENDING',
        }),
      },
    });

    await AuditService.logAction((req as any).user.id, 'SUPPORT_TICKET_SUBMITTED', 'ActivityLog', ticket.id, { subject: finalSubject, category: finalCategory }).catch(() => {});

    return sendSuccess(res, 'Support ticket submitted successfully and sent to admin queue.', ticket, 201);
  } catch (err: any) {
    if (err instanceof AppError) throw err;
    throw new AppError(err.message || 'Failed to submit support ticket. Please try again.', 400);
  }
});

export const registerHomeowner = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = HomeownerSignupSchema.parse(req.body);
  const result = await authService.registerHomeowner(validatedData, req.ip);

  res.cookie('stroitx_session', result.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return sendSuccess(res, 'Homeowner registered successfully. Verification link sent to email.', result);
});

export const registerProfessional = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = ProfessionalSignupSchema.parse(req.body);
  const result = await authService.registerProfessional(validatedData, req.ip);

  res.cookie('stroitx_session', result.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return sendSuccess(res, 'Professional account created successfully. Verification link sent to email.', result);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = LoginSchema.parse(req.body);
  const result = await authService.login(email, password, req.ip);

  res.cookie('stroitx_session', result.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return sendSuccess(res, 'Login successful.', result);
});

export const requestOtp = asyncHandler(async (req: Request, res: Response) => {
  const parsed = OtpRequestSchema.parse(req.body);
  const mobile = (parsed.mobileNumber || parsed.phone || parsed.phoneNumber) as string;
  const result = await authService.requestOtp(mobile);
  return sendSuccess(res, '6-Digit OTP requested successfully.', result);
});

export const verifyOtp = asyncHandler(async (req: Request, res: Response) => {
  const parsed = OtpVerifySchema.parse(req.body);
  const mobile = (parsed.mobileNumber || parsed.phone || parsed.phoneNumber) as string;
  const result = await authService.verifyOtp(mobile, parsed.otp);

  if (result.token) {
    res.cookie('stroitx_session', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  return sendSuccess(res, 'OTP verified successfully.', result);
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const tokenStr = (req.query.token as string) || req.body.token;
  await authService.verifyEmail(tokenStr);
  return sendSuccess(res, 'Email verified successfully.');
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const fullProfile = await authService.getUserFullProfile((req as any).user.id);
  return sendSuccess(res, 'Current authenticated session profile fetched.', fullProfile);
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const updatedUser = await authService.updateProfile((req as any).user.id, req.body);
  return sendSuccess(res, 'User profile updated successfully.', updatedUser);
});

export const updateLanguage = asyncHandler(async (req: Request, res: Response) => {
  const { language } = req.body;
  const updatedUser = await authService.updateLanguage((req as any).user.id, language);
  return sendSuccess(res, `Language preference updated to ${language}.`, updatedUser);
});

export const updateTheme = asyncHandler(async (req: Request, res: Response) => {
  const { theme } = req.body;
  const updatedUser = await authService.updateTheme((req as any).user.id, theme);
  return sendSuccess(res, `Theme preference updated to ${theme}.`, updatedUser);
});

export const updatePassword = asyncHandler(async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  await authService.updatePassword((req as any).user.id, currentPassword, newPassword);
  return sendSuccess(res, 'Password updated successfully.');
});

export const deactivateAccount = asyncHandler(async (req: Request, res: Response) => {
  const updatedUser = await authService.deactivateAccount((req as any).user.id);
  res.clearCookie('stroitx_session');
  return sendSuccess(res, 'Account temporarily deactivated.', updatedUser);
});

export const deleteAccount = asyncHandler(async (req: Request, res: Response) => {
  const updatedUser = await authService.deleteAccount((req as any).user.id);
  res.clearCookie('stroitx_session');
  return sendSuccess(res, 'Account permanently scheduled for deletion.', updatedUser);
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  res.clearCookie('stroitx_session');
  return sendSuccess(res, 'Logged out successfully.');
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  const result = await authService.forgotPassword(email);
  return sendSuccess(res, result.message, result);
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, newPassword, password } = req.body;
  const finalPassword = newPassword || password;
  const finalToken = token || (req.query.token as string);
  const result = await authService.resetPassword(finalToken, finalPassword);
  return sendSuccess(res, result.message, result);
});