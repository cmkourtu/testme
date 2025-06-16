import { NextFunction, Request, Response } from 'express';
import { user } from '../../shared/db';

export interface AuthedRequest extends Request {
  userId: number;
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const uuid = req.get('X-User');
  if (!uuid || typeof uuid !== 'string' || !uuid.trim()) {
    return res.status(401).json({ error: 'missing_user' });
  }
  let record = await user.find({ uuid });
  if (!record) {
    record = await user.create({ data: { uuid } });
  }
  (req as AuthedRequest).userId = record.id;
  next();
}
