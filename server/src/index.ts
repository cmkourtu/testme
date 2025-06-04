import express from 'express';
import cors from 'cors';
import { Env } from './env';
import { hello } from '../../shared/src';
import { saveText } from './upload';

// Express server exposing health check and upload route.
export const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/upload', async (req, res) => {
  const text = req.body.text;
  if (typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'text required' });
  }
  const uploadId = await saveText(text);
  res.status(201).json({ upload_id: uploadId });
});

app.get('/health', (_, res) => res.json({ status: 'ok', msg: hello() }));

if (process.env.NODE_ENV !== 'test') {
  app.listen(Number(Env.PORT), () => {
    console.log(`API running on http://localhost:${Env.PORT}`);
  });
}
