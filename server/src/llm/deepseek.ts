import axios, { AxiosError } from 'axios';
import Bottleneck from 'bottleneck';

const limiter = new Bottleneck({ maxConcurrent: 2, minTime: 200 });

const ds = axios.create({
  baseURL: 'https://api.deepseek.com/v1',
  headers: {
    Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
    'Content-Type': 'application/json'
  },
  timeout: 15000
});

export async function deepSeekChat<T = unknown>(
  body: unknown,
  retries = 1
): Promise<T> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await limiter.schedule(() =>
        ds.post<T>('/chat/completions', body).then((r) => r.data)
      );
    } catch (e) {
      const err = e as AxiosError;
      console.error('DeepSeek error', err.response?.data ?? err.message);
      if (attempt === retries) {
        throw e;
      }
    }
  }
  throw new Error('unreachable');
}
