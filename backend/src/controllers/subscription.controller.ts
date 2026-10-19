import { Request, Response } from 'express';
import { prisma } from '../config/database';

interface CustomRequest extends Request {
  user?: any;
}

export const activateFreeTrial = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const professional = await prisma.professionalProfile.findUnique({
      where: { userId: userId }
    });

    if (!professional) {
      return res.status(404).json({ success: false, error: "Professional profile not found." });
    }

    if (!professional.isMandateActive) {
      return res.status(400).json({ 
        success: false, 
        code: "MANDATE_REQUIRED", 
        error: "Auto-pay mandate of ₹2 required before activating 31-day trial." 
      });
    }

    const now = new Date();
    const trialEndsAt = new Date();
    trialEndsAt.setDate(now.getDate() + 31);

    const updatedProfile = await prisma.professionalProfile.update({
      where: { userId: userId },
      data: {
        isTrialActive: true,
        trialStartedAt: now,
        trialEndsAt: trialEndsAt
      }
    });

    res.status(200).json({ 
      success: true,
      message: "31-Day Free Trial activated successfully!", 
      trialEndsAt: updatedProfile.trialEndsAt 
    });
    
  } catch (error) {
    console.error("Trial activation error:", error);
    res.status(500).json({ success: false, error: "Server error activating trial" });
  }
};