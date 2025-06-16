import request from 'supertest';
import { app } from '../src/index';
import { generateItem } from '../src/llm/itemGenerator';
import { selectNextItem } from '../src/scheduler';
import { user, item, itemState } from '../../shared/db';

jest.mock('../src/llm/itemGenerator', () => ({ generateItem: jest.fn() }));
jest.mock('../src/scheduler', () => ({ selectNextItem: jest.fn() }));
jest.mock('../../shared/db', () => ({
  user: { find: jest.fn(), create: jest.fn() },
  item: { find: jest.fn() },
  itemState: { find: jest.fn() },
}));

const mockGen = generateItem as jest.Mock;
const mockSelect = selectNextItem as jest.Mock;
const mockUser = user as jest.Mocked<typeof user>;
const mockItem = item as jest.Mocked<typeof item>;
const mockItemState = itemState as jest.Mocked<typeof itemState>;

beforeEach(() => {
  mockGen.mockReset();
  mockSelect.mockReset();
  mockUser.find.mockReset();
  mockUser.create.mockReset();
  mockItem.find.mockReset();
  mockItemState.find.mockReset();
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

test('GET /api/session/next requires auth', async () => {
  const res = await request(app).get('/api/session/next');
  expect(res.status).toBe(401);
});

test('GET /api/session/next creates user and returns item', async () => {
  mockUser.find.mockResolvedValue(null);
  mockUser.create.mockResolvedValue({ id: 1, uuid: 'u1' });
  mockSelect.mockResolvedValue({ pool: 'due', itemId: 2 });
  mockItem.find.mockResolvedValue({
    id: 2,
    objectiveId: 1,
    tier: 1,
    stem: 'Q2',
    reference: 'R2',
  } as any);
  mockItemState.find.mockResolvedValue({
    id: 1,
    userId: 1,
    itemId: 2,
    stability: 1,
    difficulty: 1,
    ease: 1,
    lastReview: new Date(),
    nextDue: new Date(),
    p_recall: 0.5,
  } as any);

  const res = await request(app).get('/api/session/next').set('X-User', 'u1');
  expect(res.status).toBe(200);
  expect(res.body.item).toEqual({ id: 2, stem: 'Q2' });
  expect(res.body.meta.pool).toBe('due');
  expect(res.body.meta.p_recall).toBe(0.5);
  expect(mockUser.create).toHaveBeenCalled();
});
