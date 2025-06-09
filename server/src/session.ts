import express from 'express';
import { generateItem } from './llm/itemGenerator';

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
