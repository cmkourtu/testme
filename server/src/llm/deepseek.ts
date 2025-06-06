import axios from 'axios';
import Bottleneck from 'bottleneck';

const limiter = new Bottleneck({ maxConcurrent: 2, minTime: 200 });

const ds = axios.create({
  baseURL: 'https://api.deepseek.com',
  headers: {
    Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
    'Content-Type': 'application/json'
  },
  proxy: false,
  timeout: 60000
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function deepSeekChat(body: unknown, retries = 1): Promise<any> {
  return limiter.schedule(async () => {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const res = await ds.post('/v1/chat/completions', body);
        return res.data;
      } catch (e) {
        if (attempt === retries) {
          const err = e as Error & { response?: { data?: unknown } };
          console.error('DeepSeek error', err.response?.data ?? err.message);
          throw err;
        }
      }
    }
  });
}
