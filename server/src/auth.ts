import { Request, Response, NextFunction } from 'express';
import { db } from '../../shared/db';

export interface AuthRequest extends Request {
  user?: { id: number; uuid: string };
}

// UUID v4 validation regex
const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function auth(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const uuid = req.header('X-User');

    // Basic validation
    if (!uuid || typeof uuid !== 'string' || !uuid.trim()) {
      return res.status(401).json({ error: 'unauthorized' });
    }

    // UUID format validation
    if (!UUID_V4_REGEX.test(uuid)) {
      return res.status(400).json({ error: 'invalid_uuid_format' });
    }

    let user = await db.user.findUnique({ where: { uuid } });
    if (!user) {
      user = await db.user.create({ data: { uuid } });
    }

    req.user = { id: user.id, uuid: user.uuid };
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ error: 'internal_server_error' });
  }
}
