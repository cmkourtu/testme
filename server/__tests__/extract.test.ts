import request from 'supertest';
import nock from 'nock';
import fs from 'fs/promises';
import path from 'path';
import { app } from '../src/index';

const samplePath = path.join(__dirname, 'fixtures', 'sample.txt');

beforeEach(() => {
  nock.cleanAll();
});

 test('objective extractor returns list', async () => {
  const text = await fs.readFile(samplePath, 'utf8');
  nock('https://api.deepseek.com')
    .post('/v1/chat/completions')
    .reply(200, {
      choices: [{ message: { content: JSON.stringify(['a','b','c','d','e']) } }]
    });

  const res = await request(app)
    .post('/api/objectives/extract')
    .send({ text });

  expect(res.status).toBe(200);
  expect(res.body.objectives.length).toBeGreaterThanOrEqual(5);
});

