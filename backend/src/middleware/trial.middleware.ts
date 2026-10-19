import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';

interface CustomRequest extends Request {
  user?: any;
}

export const requireActiveTrial = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id; 

    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized: No user ID found" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { professional: true } 
    });

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    if (user.role === 'PROFESSIONAL') {
      const profile = user.professional;
      const now = new Date();
      
      if (!profile) {
        return res.status(404).json({
          success: false,
          error: "Professional profile not found",
          message: "Please complete your professional profile setup first."
        });
      }

      // 1. Enforce ₹2 Auto-Pay Mandate
      if (!profile.isMandateActive) {
        return res.status(403).json({ 
          success: false,
          code: "MANDATE_REQUIRED",
          error: "Mandate required", 
          message: "An active ₹2 auto-pay mandate is required to access professional features and leads." 
        });
      }

      // 2. Enforce Active 31-Day Free Trial
      if (!profile.isTrialActive || (profile.trialEndsAt && now > profile.trialEndsAt)) {
        return res.status(403).json({ 
          success: false,
          code: "TRIAL_EXPIRED",
          error: "Trial inactive", 
          message: "Your 31-day free trial has expired or is inactive. Please renew your Pro subscription." 
        });
      }
    }
    
    next();
  } catch (error) {
    console.error("Trial check error:", error);
    res.status(500).json({ success: false, error: "Server error checking trial status" });
  }
};