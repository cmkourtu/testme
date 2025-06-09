import express from 'express';
import { generateItem } from './llm/itemGenerator';
import { gradeFreeResponse } from './llm/grader';

export const practiceRouter = express.Router();

practiceRouter.post('/question', async (req, res) => {
  const { objective, tier } = req.body as { objective?: string; tier?: number };
  if (typeof objective !== 'string' || !objective.trim()) {
    return res.status(400).json({ error: 'objective required' });
  }
  if (typeof tier !== 'number' || ![1, 3, 5].includes(tier)) {
    return res.status(400).json({ error: 'tier invalid' });
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
    if (err instanceof Error) {
      if (err.message === 'missing_api_key') {
        return res.status(500).json({ error: 'missing_api_key' });
      }
      if (err.message === 'invalid_response') {
        return res.status(500).json({ error: 'invalid_response' });
      }
    }
    res.status(500).json({ error: 'llm_error' });
  }
});

practiceRouter.post('/grade', async (req, res) => {
  const { stem, reference, answer } = req.body as {
    stem?: string;
    reference?: string;
    answer?: string;
  };
  if (typeof stem !== 'string' || !stem.trim()) {
    return res.status(400).json({ error: 'stem required' });
  }
  if (typeof reference !== 'string') {
    return res.status(400).json({ error: 'reference required' });
  }
  if (typeof answer !== 'string') {
    return res.status(400).json({ error: 'answer required' });
  }
  try {
    const prompt = `${stem}\nReference answer: ${reference}`;
    const result = await gradeFreeResponse(prompt, answer);
    res.json(result);
  } catch (err) {
    console.error(err);
    if (err instanceof Error) {
      if (err.message === 'missing_api_key') {
        return res.status(500).json({ error: 'missing_api_key' });
      }
      if (err.message === 'invalid_response') {
        return res.status(500).json({ error: 'invalid_response' });
      }
    }
    res.status(500).json({ error: 'llm_error' });
  }
});
