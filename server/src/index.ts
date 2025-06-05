import express from 'express';
import cors from 'cors';
import { Env } from './env';
import { hello } from '../../shared/src';
import { saveText } from './upload';
import { extractObjectives } from './objectives';
import { adminRouter } from './admin';
import { courseRouter } from "./courses";

// Express server exposing health check and upload route.
export const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', adminRouter);
app.use("/api/courses", courseRouter);

app.post('/api/upload', async (req, res) => {
  const text = req.body.text;
  if (typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'text required' });
  }
  const uploadId = await saveText(text);
  res.status(201).json({ upload_id: uploadId });
});

app.post('/api/objectives/extract', async (req, res) => {
  const { course, text } = req.body;
  if (typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'text required' });
  }
  if (typeof course !== 'string' || !course.trim()) {
    return res.status(400).json({ error: 'course required' });
  }
  try {
    const objectives = await extractObjectives(course, text);
    res.json({ objectives });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'llm_error' });
  }
});

app.get('/health', (_, res) => res.json({ status: 'ok', msg: hello() }));

if (process.env.NODE_ENV !== 'test') {
  app.listen(Number(Env.PORT), () => {
    console.log(`API running on http://localhost:${Env.PORT}`);
  });
}
