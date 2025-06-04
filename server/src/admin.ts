import express from 'express';
import { db } from '../../shared/db';

// Admin routes for managing objectives and items. These endpoints allow
// the admin UI to edit curriculum content and are not used in the
// Scheduler or Gatekeeper workflows.
export const adminRouter = express.Router();

adminRouter.get('/objectives', async (_req, res) => {
  const objectives = await db.objective.findMany({ include: { items: true } });
  res.json({ objectives });
});

adminRouter.put('/objectives/:id', async (req, res) => {
  const id = Number(req.params.id);
  try {
    const objective = await db.objective.update({ where: { id }, data: req.body });
    res.json(objective);
  } catch {
    res.status(404).json({ error: 'not_found' });
  }
});

adminRouter.delete('/objectives/:id', async (req, res) => {
  const id = Number(req.params.id);
  try {
    await db.objective.delete({ where: { id } });
    res.status(204).end();
  } catch {
    res.status(404).json({ error: 'not_found' });
  }
});

adminRouter.get('/items', async (_req, res) => {
  const items = await db.item.findMany();
  res.json({ items });
});

adminRouter.put('/items/:id', async (req, res) => {
  const id = Number(req.params.id);
  try {
    const item = await db.item.update({ where: { id }, data: req.body });
    res.json(item);
  } catch {
    res.status(404).json({ error: 'not_found' });
  }
});

adminRouter.delete('/items/:id', async (req, res) => {
  const id = Number(req.params.id);
  try {
    await db.item.delete({ where: { id } });
    res.status(204).end();
  } catch {
    res.status(404).json({ error: 'not_found' });
  }
});
