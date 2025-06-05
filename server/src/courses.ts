import express from 'express';
import { course } from '../../shared/db';

// Routes for creating and listing courses. Not used by Scheduler or Gatekeeper.
export const courseRouter = express.Router();

courseRouter.post('/', async (req, res) => {
  const title = req.body.title;
  const uploadId = req.body.uploadId;
  if (typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'title required' });
  }
  if (typeof uploadId !== 'string' || !uploadId.trim()) {
    return res.status(400).json({ error: 'upload_id required' });
  }
  const created = await course.create({ data: { title, uploadId } });
  res.status(201).json(created);
});
