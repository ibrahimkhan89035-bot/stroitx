import { prisma } from '../config/database';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { AppError } from '../utils/error';
import { smsService } from './sms.service';
import { emailService } from '../integrations/resend.service';
import { AuditService } from './audit.service';
import crypto from 'crypto';

export class AuthService {
  public async registerHomeowner(data: any, ipAddress?: string) {
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email: data.email }, { phone: data.mobileNumber }],
      },
    });

    if (existing) {
      throw new AppError('User with this email or mobile number already exists.', 400);
    }

    const passwordHash = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        phone: data.mobileNumber,
        passwordHash,
        name: data.fullName, 
        role: "HOMEOWNER",
        isActive: true,
        homeowner: {
          create: {
            location: data.city || null,
          },
        }
      },
      include: {
        homeowner: true,
      },
    });

    const tokenStr = crypto.randomBytes(32).toString('hex');
    await emailService.sendVerificationEmail(user.email || '', tokenStr).catch(() => {});
    await AuditService.logAction(user.id, 'HOMEOWNER_SIGNUP', 'User', user.id, { email: user.email }, ipAddress).catch(() => {});

    const token = generateToken({
      userId: user.id,
      role: user.role,
      email: user.email || '',
    });

    return { user, token };
  }

  public async registerProfessional(data: any, ipAddress?: string) {
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email: data.email }, { phone: data.mobileNumber }],
      },
    });

    if (existing) {
      throw new AppError('Professional with this email or mobile number already exists.', 400);
    }

    const passwordHash = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        phone: data.mobileNumber,
        passwordHash,
        name: data.fullName, 
        role: "PROFESSIONAL",
        isActive: true,
        professional: {
          create: {
            businessName: data.companyName, 
            profession: data.category || "General", 
            experienceYears: data.yearsOfExperience ? parseInt(data.yearsOfExperience) : 0, 
            location: data.city || null,
          },
        }
      },
      include: {
        professional: true,
      },
    });

    const tokenStr = crypto.randomBytes(32).toString('hex');
    await emailService.sendVerificationEmail(user.email || '', tokenStr).catch(() => {});
    await AuditService.logAction(user.id, 'PROFESSIONAL_SIGNUP', 'User', user.id, { companyName: data.companyName }, ipAddress).catch(() => {});

    const token = generateToken({
      userId: user.id,
      role: user.role,
      email: user.email || '',
    });

    return { user, token };
  }

  public async login(email: string, pass: string, ipAddress?: string) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        homeowner: true,
        professional: true,
      },
    });

    if (!user) throw new AppError('Invalid credentials.', 401);

    const isMatch = await comparePassword(pass, user.passwordHash || "");
    if (!isMatch) throw new AppError('Invalid credentials.', 401);

    const token = generateToken({
      userId: user.id,
      role: user.role,
      email: user.email || '',
    });

    return { user, token };
  }

  public async requestOtp(mobileNumber: string) {
    const cleanNumber = smsService.cleanPhoneNumber(mobileNumber);
    if (!cleanNumber || cleanNumber.length !== 10) {
      throw new AppError('Please provide a valid 10-digit Indian mobile number.', 400);
    }

    const { otp, hash } = smsService.generateOtp();

    // Store in Prisma database with 10 minutes expiry
    await prisma.otpCode.create({
      data: {
        contact: cleanNumber,
        code: hash,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), 
      },
    });

    const smsResult = await smsService.sendOtp(cleanNumber, otp);
    return {
      success: smsResult.success,
      message: smsResult.message,
      mobileNumber: cleanNumber,
    };
  }

  public async verifyOtp(mobileNumber: string, otp: string) {
    const cleanNumber = smsService.cleanPhoneNumber(mobileNumber);

    // Look for active challenge by clean 10-digit or raw number
    const challenge = await prisma.otpCode.findFirst({
      where: {
        contact: { in: [cleanNumber, mobileNumber] },
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!challenge) throw new AppError('Invalid or expired OTP. Please request a new code.', 400);

    const isValid = smsService.verifyOtpHash(otp, challenge.code);
    if (!isValid) {
      await prisma.otpCode.update({
        where: { id: challenge.id },
        data: { attempts: { increment: 1 } },
      });
      throw new AppError('Incorrect OTP. Please enter the valid 6-digit code.', 400);
    }

    await prisma.otpCode.update({
      where: { id: challenge.id },
      data: { used: true },
    });

    // Lookup user by phone variants
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { phone: cleanNumber },
          { phone: mobileNumber },
          { phone: `+91${cleanNumber}` },
          { phone: `91${cleanNumber}` },
        ],
      },
      include: { homeowner: true, professional: true },
    });

    if (user) {
      const token = generateToken({
        userId: user.id,
        role: user.role,
        email: user.email || '',
      });
      return { user, token, isExistingUser: true, mobileNumber: cleanNumber };
    }

    return { isExistingUser: false, mobileNumber: cleanNumber };
  }

  public async verifyEmail(tokenStr: string) {
    return true; 
  }

  public async getUserFullProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { homeowner: true, professional: true },
    });

    if (!user) throw new AppError('User not found.', 404);

    return {
      ...user,
      fullName: user.name || user.email?.split('@')[0],
      totalProjectsPosted: 0,
      totalQuotesReceived: 0,
    };
  }

  public async updateProfile(userId: string, data: { fullName?: string; mobileNumber?: string; city?: string }) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('User not found.', 404);

    return await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.mobileNumber ? { phone: data.mobileNumber } : {}),
        ...(data.fullName ? { name: data.fullName } : {}),
      },
    });
  }

  public async updateLanguage(userId: string, language: string) { return true; }
  public async updateTheme(userId: string, theme: string) { return true; }

  public async updatePassword(userId: string, currentPass: string, newPass: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('User not found.', 404);

    const isMatch = await comparePassword(currentPass, user.passwordHash || "");
    if (!isMatch) throw new AppError('Incorrect password.', 400);

    const newHash = await hashPassword(newPass);
    return await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    });
  }

  public async forgotPassword(email: string) {
    if (!email || !email.trim()) {
      throw new AppError('Email address is required.', 400);
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      // Return safe message without leaking user existence
      return {
        message: 'If an account with this email exists, a password reset link has been dispatched.',
      };
    }

    // Generate secure 32-byte hex token (valid for 1 hour) and compute SHA-256 hash for database storage
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: tokenHash,
        resetPasswordExpires: expiresAt,
      },
    });

    await emailService.sendPasswordResetEmail(user.email!, rawToken);
    await AuditService.logAction(user.id, 'PASSWORD_RESET_REQUESTED', 'User', user.id, { email: cleanEmail }).catch(() => {});

    return {
      message: 'Password reset link dispatched to your email address.',
    };
  }

  public async resetPassword(token: string, newPass: string) {
    if (!token || !token.trim()) {
      throw new AppError('Password reset token is required.', 400);
    }

    if (!newPass || newPass.length < 6) {
      throw new AppError('New password must be at least 6 characters.', 400);
    }

    const rawToken = token.trim();
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { resetPasswordToken: tokenHash },
          { resetPasswordToken: rawToken }, // Backward compatibility fallback
        ],
        resetPasswordExpires: { gt: new Date() },
      },
    });

    if (!user) {
      throw new AppError('Password reset token is invalid or has expired.', 400);
    }

    const newHash = await hashPassword(newPass);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newHash,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    await AuditService.logAction(user.id, 'PASSWORD_RESET_COMPLETED', 'User', user.id).catch(() => {});

    return {
      message: 'Your password has been successfully reset. You can now sign in with your new credentials.',
    };
  }

  public async deactivateAccount(userId: string) {
    return await prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });
  }

  public async deleteAccount(userId: string) {
    return await prisma.user.update({
      where: { id: userId },
      data: { isActive: false, deletedAt: new Date() },
    });
  }
}

export const authService = new AuthService();