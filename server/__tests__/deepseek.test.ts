import { deepSeekChat } from '../src/llm/deepseek';
import nock from 'nock';

test('deepseek wrapper retries', async () => {
  nock('https://api.deepseek.com')
    .post('/v1/chat/completions')
    .reply(500)
    .post('/v1/chat/completions')
    .reply(200, { id: 1 });

  const res = await deepSeekChat({ messages: [] });
  expect(res.id).toBe(1);
});
