import request from 'supertest';
import fs from 'fs/promises';
import path from 'path';
import { app } from '../src/index';
import { UPLOAD_DIR } from '../src/upload';

afterEach(async () => {
  await fs.rm(UPLOAD_DIR, { recursive: true, force: true });
});

test('upload route saves text', async () => {
  const sample = await fs.readFile(
    path.join(__dirname, 'fixtures', 'sample.txt'),
    'utf8'
  );
  const res = await request(app).post('/api/upload').send({ text: sample });
  expect(res.status).toBe(201);
  const id = res.body.upload_id;
  const saved = await fs.readFile(path.join(UPLOAD_DIR, `${id}.txt`), 'utf8');
  expect(saved).toBe(sample);
});

test('upload route validates text', async () => {
  const res = await request(app).post('/api/upload').send({});
  expect(res.status).toBe(400);
});
