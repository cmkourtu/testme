import request from 'supertest';
import { app } from '../src/index';
import { generateItem } from '../src/llm/itemGenerator';

jest.mock('../src/llm/itemGenerator', () => ({ generateItem: jest.fn() }));

const mockGen = generateItem as jest.Mock;

beforeEach(() => {
  mockGen.mockReset();
});

test('POST /api/session/manual-question returns item', async () => {
  mockGen.mockResolvedValue({ stem: 'Q', reference: 'A' });
  const res = await request(app)
    .post('/api/session/manual-question')
    .send({ objective: 'Obj', difficulty: 'easy' });
  expect(res.status).toBe(200);
  expect(res.body.stem).toBe('Q');
  expect(mockGen).toHaveBeenCalled();
});

test('POST /api/session/manual-question validates input', async () => {
  const res = await request(app).post('/api/session/manual-question').send({});
  expect(res.status).toBe(400);
});
