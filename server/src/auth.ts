import { Request, Response, NextFunction } from 'express';
import { db } from '../../shared/db';

export interface AuthRequest extends Request {
  user?: { id: number; uuid: string };
}

export async function auth(req: AuthRequest, res: Response, next: NextFunction) {
  const uuid = req.header('X-User');
  if (!uuid || typeof uuid !== 'string' || !uuid.trim()) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  let user = await db.user.findUnique({ where: { uuid } });
  if (!user) {
    user = await db.user.create({ data: { uuid } });
  }
  req.user = { id: user.id, uuid: user.uuid };
  next();
}
