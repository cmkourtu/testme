import { deepSeekChat } from '../src/llm/deepseek';
import nock from 'nock';

// Disable proxy settings that break nock/axios in CI
for (const key of [
  'HTTP_PROXY',
  'http_proxy',
  'HTTPS_PROXY',
  'https_proxy',
  'NO_PROXY',
  'no_proxy',
  'npm_config_http_proxy',
  'npm_config_https_proxy',
  'YARN_HTTP_PROXY',
  'YARN_HTTPS_PROXY'
]) {
  delete process.env[key];
}

test('deepseek wrapper retries', async () => {
  nock('https://api.deepseek.com')
    .post('/v1/chat/completions')
    .reply(500)
    .post('/v1/chat/completions')
    .reply(200, { id: 1 });

  const res = await deepSeekChat<{ id: number }>({ messages: [] });
  expect(res.id).toBe(1);
});
