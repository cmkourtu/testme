import express from 'express';
import { generateItem } from './llm/itemGenerator';
import { authMiddleware, AuthedRequest } from './auth';
import { selectNextItem } from './scheduler';
import { item, itemState } from '../../shared/db';

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

// Scheduler-based route for serving the next practice item.
sessionRouter.get('/next', authMiddleware, async (req, res) => {
  const userId = (req as AuthedRequest).userId;
  const { pool, itemId } = await selectNextItem(userId);
  if (!itemId) {
    return res.status(404).json({ error: 'no_item' });
  }
  const found = await item.find({ id: itemId });
  if (!found) {
    return res.status(404).json({ error: 'not_found' });
  }
  const state = await itemState.find({ userId_itemId: { userId, itemId } });
  res.json({
    item: { id: found.id, stem: found.stem },
    meta: { pool, p_recall: state?.p_recall ?? 0 },
  });
});
