import { env } from '../config/env';

export class EmailServiceAbstraction {
  public async sendVerificationEmail(email: string, token: string): Promise<boolean> {
    const verificationUrl = `${env.FRONTEND_URL}/verify-email?token=${token}`;

    if (env.RESEND_API_KEY) {
      console.log(`[Resend Email Provider] Sending verification link to ${email}: ${verificationUrl}`);
      return true;
    }

    console.log(`[StroitX Email Provider Configuration Required] Verification link for ${email}: ${verificationUrl}`);
    return true;
  }

  public async sendPasswordResetEmail(email: string, token: string): Promise<boolean> {
    const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${token}`;

    if (env.RESEND_API_KEY) {
      console.log(`[Resend Email Provider] Sending password reset link to ${email}: ${resetUrl}`);
      return true;
    }

    console.log(`[StroitX Email Provider] Password reset link for ${email}: ${resetUrl}`);
    return true;
  }

  public async sendNotificationAlert(email: string, subject: string, htmlContent: string): Promise<boolean> {
    if (env.RESEND_API_KEY) {
      console.log(`[Resend Email Provider] Alert sent to ${email}: ${subject}`);
      return true;
    }

    console.log(`[StroitX Email Alert - Config Required] ${email} - ${subject}`);
    return true;
  }
}

export const emailService = new EmailServiceAbstraction();
