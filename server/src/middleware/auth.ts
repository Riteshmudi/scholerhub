import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

export interface AuthedRequest extends Request {
  userId?: string;
}

export async function requireAuth(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = req.cookies?.session_token;
    if (!token) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }

    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      if (session) {
        await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
      }
      res.status(401).json({ error: 'Session expired. Please sign in again.' });
      return;
    }

    req.userId = session.userId;
    next();
  } catch (err) {
    next(err);
  }
}
