import { prisma } from '../config/database';
import { AppError } from '../utils/error';
import { AuditService } from './audit.service';
import { notificationService } from './notification.service';

export class VerificationService {
  /**
   * Submit or update KYC verification details for a Professional
   */
  public async submitVerificationDoc(professionalUserId: string, data: any) {
    const profile = await prisma.professionalProfile.findUnique({
      where: { userId: professionalUserId },
    });

    if (!profile) throw new AppError('Professional profile not found.', 404);

    const updatedProfile = await prisma.professionalProfile.update({
      where: { id: profile.id },
      data: {
        verified: false,
      },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
    });

    await AuditService.logAction(professionalUserId, 'VERIFICATION_DOC_SUBMITTED', 'ProfessionalProfile', profile.id);
    return updatedProfile;
  }

  /**
   * Get verification status and profile details for a Professional
   */
  public async getVerificationStatus(professionalUserId: string) {
    const profile = await prisma.professionalProfile.findUnique({
      where: { userId: professionalUserId },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
    });

    if (!profile) throw new AppError('Professional profile not found.', 404);
    return profile;
  }

  /**
   * Admin review of professional verification (Approve / Reject)
   */
  public async adminReviewVerification(adminUserId: string, verificationId: string, status: string, adminNotes?: string) {
    // Determine profile by verificationId (which can be profile.id or profile.userId)
    let profile = await prisma.professionalProfile.findUnique({
      where: { id: verificationId },
    });

    if (!profile) {
      profile = await prisma.professionalProfile.findUnique({
        where: { userId: verificationId },
      });
    }

    if (!profile) {
      throw new AppError('Professional profile record not found.', 404);
    }

    const statusUpper = String(status).toUpperCase();
    const isApproved = statusUpper === 'VERIFIED' || statusUpper === 'APPROVED';

    const updatedProfile = await prisma.professionalProfile.update({
      where: { id: profile.id },
      data: {
        verified: isApproved,
      },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
    });

    // Notify professional user of admin review result
    await notificationService
      .createNotification(
        profile.userId,
        isApproved ? 'KYC Verification Approved! ✅' : 'KYC Verification Status Update ❌',
        isApproved
          ? 'Congratulations! Your contractor business verification has been approved by StroitX Admin.'
          : `Your verification submission status was updated to [${statusUpper}]. Notes: ${adminNotes || 'Verification review pending.'}`
      )
      .catch(() => {});

    await AuditService.logAction(adminUserId, `VERIFICATION_${statusUpper}`, 'ProfessionalProfile', profile.id, { adminNotes });

    return updatedProfile;
  }
}

export const verificationService = new VerificationService();
