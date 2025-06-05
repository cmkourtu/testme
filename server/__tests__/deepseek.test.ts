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

test('deepseek wrapper throws after retries', async () => {
  const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
  nock('https://api.deepseek.com')
    .post('/v1/chat/completions')
    .times(2)
    .reply(500, { err: 'bad' });
  await expect(deepSeekChat({ messages: [] })).rejects.toThrow();
  expect(spy).toHaveBeenCalled();
  spy.mockRestore();
});
