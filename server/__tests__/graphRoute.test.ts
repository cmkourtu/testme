import request from 'supertest';
import { app } from '../src/index';
import { generateClusterGraph } from '../src/llm/graphGenerator';

jest.mock('../src/llm/graphGenerator', () => ({
  generateClusterGraph: jest.fn()
}));

const mockGen = generateClusterGraph as jest.Mock;

beforeEach(() => {
  mockGen.mockReset();
});

test('POST /api/graph/generate returns graph', async () => {
  mockGen.mockResolvedValue({ Intro: [] });
  const res = await request(app)
    .post('/api/graph/generate')
    .send({ objectives: [{ id: '1', text: 't', bloom: 'b', cluster: 'Intro' }] });
  expect(res.status).toBe(200);
  expect(res.body.graph).toEqual({ Intro: [] });
});

test('POST /api/graph/generate validates input', async () => {
  const res = await request(app).post('/api/graph/generate').send({});
  expect(res.status).toBe(400);
});

test('POST /api/graph/generate validates objective shape', async () => {
  const res = await request(app)
    .post('/api/graph/generate')
    .send({ objectives: [{ bad: true }] });
  expect(res.status).toBe(400);
});

test('POST /api/graph/generate rejects blank fields', async () => {
  const res = await request(app)
    .post('/api/graph/generate')
    .send({ objectives: [{ id: ' ', text: 'a', bloom: '', cluster: 'Intro' }] });

  expect(res.status).toBe(400);
});
