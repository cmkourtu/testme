import express from 'express';
import { generateItem } from './llm/itemGenerator';
import { auth, AuthRequest } from './auth';
import { selectNextItem } from './scheduler';
import { db } from '../../shared/db';

// Session routes for learner flow.
// The manual-question endpoint bypasses the Scheduler and directly
// generates an item for the given objective and difficulty.
export const sessionRouter = express.Router();

sessionRouter.post('/manual-question', async (req, res) => {
  const { objective, difficulty } = req.body as {
    objective?: string;
    difficulty?: string;
  };
  if (typeof objective !== 'string' || !objective.trim()) {
    return res.status(400).json({ error: 'objective required' });
  }
  const diffMap: Record<string, number> = { easy: 1, medium: 3, hard: 5 };
  const tier = diffMap[(difficulty || '').toLowerCase()];
  if (!tier) {
    return res.status(400).json({ error: 'difficulty invalid' });
  }
  try {
    const item = await generateItem({
      objective,
      bloom: 'Remember',
      tier,
      context: '',
      previous: [],
    });
    res.json({ stem: item.stem, reference: item.reference });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'llm_error' });
  }
});

// Returns the next item for the authenticated user using Scheduler logic.
sessionRouter.get('/next', auth, async (req: AuthRequest, res) => {
  const user = req.user!;
  const { pool, itemId } = await selectNextItem(user.id);
  let item = null;
  let pRecall = 0;
  if (itemId) {
    item = await db.item.findUnique({ where: { id: itemId } });
    const state = await db.itemState.findUnique({
      where: { userId_itemId: { userId: user.id, itemId } },
    });
    pRecall = state?.p_recall ?? 0;
  }
  res.json({ item, meta: { pool, p_recall: pRecall } });
});
