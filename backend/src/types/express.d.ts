import { Role } from '@prisma/client';

export interface AuthenticatedUser {
  id: string;
  email: string | null;
  phone: string | null;
  name?: string | null;
  role: Role | string;
  isActive: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      sessionToken?: string;
    }
  }
}
