import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/error';
import { sendError } from '../utils/response';
import { ZodError } from 'zod';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('[StroitX API Error Log]:', err);

  if (err instanceof AppError) {
    return sendError(res, err.message, err.statusCode);
  }

  if (err instanceof ZodError) {
    const issueMap = err.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    return sendError(res, `Validation Error: ${issueMap}`, 400, err.format());
  }

  if (err.name === 'UnauthorizedError') {
    return sendError(res, 'Unauthorized request access.', 401);
  }

  return sendError(res, 'Internal Server Error. Please contact support.', 500);
};
