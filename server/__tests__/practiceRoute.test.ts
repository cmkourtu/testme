import request from 'supertest';
import { app } from '../src/index';
import { generateItem } from '../src/llm/itemGenerator';
import { gradeFreeResponse } from '../src/llm/grader';

jest.mock('../src/llm/itemGenerator', () => ({ generateItem: jest.fn() }));
jest.mock('../src/llm/grader', () => ({ gradeFreeResponse: jest.fn() }));

const mockGen = generateItem as jest.Mock;
const mockGrade = gradeFreeResponse as jest.Mock;

beforeEach(() => {
  mockGen.mockReset();
  mockGrade.mockReset();
});

test('POST /api/practice/question returns item', async () => {
  mockGen.mockResolvedValue({ stem: 'Q', reference: 'A' });
  const res = await request(app)
    .post('/api/practice/question')
    .send({ objective: 'Obj', tier: 1 });
  expect(res.status).toBe(200);
  expect(res.body.stem).toBe('Q');
  expect(mockGen).toHaveBeenCalled();
});

test('POST /api/practice/grade returns verdict', async () => {
  mockGrade.mockResolvedValue({ verdict: 'correct', score: 1, modelVotes: [] });
  const res = await request(app)
    .post('/api/practice/grade')
    .send({ stem: 'Q', reference: 'A', answer: 'A' });
  expect(res.status).toBe(200);
  expect(res.body.verdict).toBe('correct');
  expect(mockGrade).toHaveBeenCalled();
});
