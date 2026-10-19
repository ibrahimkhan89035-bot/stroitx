import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { prisma } from '../config/database';
import { AppError } from '../utils/error';

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.stroitx_session) {
      token = req.cookies.stroitx_session;
    } else if (req.query && typeof req.query.token === 'string') {
      token = req.query.token;
    }

    if (!token) {
      return next(new AppError('Authentication required. Please log in to continue.', 401));
    }

    const payload = verifyToken(token);

    // Check session user in database against actual schema
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        role: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      return next(new AppError('Account is inactive or does not exist.', 401));
    }

    // Bypassing strict TypeScript checks for custom properties
    (req as any).user = {
      id: user.id,
      email: user.email,
      phone: user.phone,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
    };
    (req as any).sessionToken = token;

    next();
  } catch (error) {
    return next(new AppError('Invalid or expired authentication session token.', 401));
  }
};