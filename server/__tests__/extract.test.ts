import request from 'supertest';
import nock from 'nock';
import fs from 'fs/promises';
import path from 'path';
import { app } from '../src/index';

const samplePath = path.join(__dirname, 'fixtures', 'sample.txt');

beforeEach(() => {
  nock.cleanAll();
});

test('objective extractor returns objects', async () => {
  const text = await fs.readFile(samplePath, 'utf8');
  const llm = nock('https://api.deepseek.com');
  llm
    .post('/v1/chat/completions')
    .reply(200, {
      choices: [
        {
          message: {
            content: JSON.stringify([
              { id: 'A-1', text: 'Define X', bloom: 'Remember', cluster: 'Intro' },
            ]),
          },
        },
      ],
    })
    .post('/v1/chat/completions')
    .reply(200, {
      choices: [{ message: { content: '{"Intro":[]}' } }],
    });

  const res = await request(app)
    .post('/api/objectives/extract')
    .send({ course: 'Demo', text });

  expect(res.status).toBe(200);
  expect(res.body.objectives[0].id).toBe('A-1');
  expect(res.body.graph).toEqual({ Intro: [] });
});

test('extract requires text', async () => {
  const res = await request(app).post('/api/objectives/extract').send({ course: 'Demo' });
  expect(res.status).toBe(400);
});

test('extract requires course', async () => {
  const res = await request(app).post('/api/objectives/extract').send({ text: 'hi' });
  expect(res.status).toBe(400);
});

test('LLM failure returns 500', async () => {
  const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
  nock('https://api.deepseek.com').post('/v1/chat/completions').reply(500);
  const res = await request(app)
    .post('/api/objectives/extract')
    .send({ course: 'Demo', text: 'x' });
  expect(res.status).toBe(500);
  expect(spy).toHaveBeenCalled();
  spy.mockRestore();
});
