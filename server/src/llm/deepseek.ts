import axios from 'axios';
import Bottleneck from 'bottleneck';
import { Env } from '../env';

const limiter = new Bottleneck({ maxConcurrent: 2, minTime: 200 });

const ds = axios.create({
  baseURL: 'https://api.deepseek.com/v1',
  headers: {
    Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
    'Content-Type': 'application/json'
  },
  timeout: 15000
});

export async function deepSeekChat(body: unknown) {
  return limiter.schedule(() =>
    ds
      .post('/chat/completions', body)
      .then((r) => r.data)
      .catch((e) => {
        console.error('DeepSeek error', e.response?.data ?? e.message);
        throw e;
      })
  );
}
