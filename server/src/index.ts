import express from 'express';
import cors from 'cors';
import { Env } from './env';
import { hello } from '../../shared/src';
import { saveText } from './upload';
import { extractObjectives } from './objectives';
import { generateClusterGraph } from './llm/graphGenerator';
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
    console.log('Extracting objectives for', course);
    const objectives = await extractObjectives(course, text);
    console.log('Objectives extracted:', objectives.length);
    const graph = await generateClusterGraph(objectives);
    res.json({ objectives, graph });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'llm_error' });
  }
});

app.post('/api/graph/generate', async (req, res) => {
  const objectives = req.body.objectives;
  if (!Array.isArray(objectives)) {
    return res.status(400).json({ error: 'objectives required' });
  }
  if (
    objectives.some(
      (o) =>
        !o ||
        typeof o.id !== 'string' ||
        typeof o.text !== 'string' ||
        typeof o.bloom !== 'string' ||
        typeof o.cluster !== 'string' ||
        !o.id.trim() ||
        !o.text.trim() ||
        !o.bloom.trim() ||
        !o.cluster.trim()
    )
  ) {
    return res.status(400).json({ error: 'invalid objectives' });
  }
  try {
    const graph = await generateClusterGraph(objectives);
    res.json({ graph });
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
