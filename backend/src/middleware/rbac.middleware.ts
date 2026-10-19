import { Response, NextFunction } from 'express';
import { AppError } from '../utils/error';

export const requireRoles = (...allowedRoles: string[]) => {
  return (req: any, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Unauthenticated request.', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access Denied. Role '${req.user.role}' is not authorized to access this resource. Required: [${allowedRoles.join(', ')}]`,
          403
        )
      );
    }

    next();
  };
};

export const requireAdminOrFounder = requireRoles("ADMIN", "FOUNDER");
export const requireHomeowner = requireRoles("HOMEOWNER");
export const requireProfessional = requireRoles("PROFESSIONAL");