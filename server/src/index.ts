import express from 'express';
import cors from 'cors';
import { Env } from './env';
import { hello } from '@shared/index';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_, res) => res.json({ status: 'ok', msg: hello() }));

app.listen(Number(Env.PORT), () => {
  console.log(`API running on http://localhost:${Env.PORT}`);
});
